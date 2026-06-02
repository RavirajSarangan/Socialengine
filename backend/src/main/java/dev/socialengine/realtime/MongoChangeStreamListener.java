package dev.socialengine.realtime;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.model.changestream.ChangeStreamDocument;
import com.mongodb.client.model.changestream.FullDocument;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.beans.factory.DisposableBean;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Listens to MongoDB change streams and forwards events to the RealtimePublisher.
 * Requires a MongoDB replica set (Atlas or local replica set) because change streams
 * are not available on standalone mongod instances.
 */
@Component
public class MongoChangeStreamListener implements DisposableBean {

    private static final Logger log = LoggerFactory.getLogger(MongoChangeStreamListener.class);

    private final MongoClient mongoClient;
    private final RealtimePublisher realtime;
    private final ExecutorService executor = Executors.newSingleThreadExecutor(r -> new Thread(r, "mongo-change-stream"));
    private MongoCursor<ChangeStreamDocument<Document>> postsCursor;

    public MongoChangeStreamListener(MongoClient mongoClient, RealtimePublisher realtime) {
        this.mongoClient = mongoClient;
        this.realtime = realtime;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void start() {
        executor.submit(() -> {
            try {
                String dbName = mongoClient.getDatabase("admin").getName();
                // prefer the database from the client's settings; fall back to 'socialengine'
                // (Spring Boot usually configures the client for the correct DB)
                try {
                    dbName = mongoClient.listDatabaseNames().first();
                } catch (Exception e) {
                    // ignore
                }
                log.info("Starting MongoDB change stream listener (collection: posts) against DB={}", dbName);
                MongoCollection<Document> posts = mongoClient.getDatabase(dbName).getCollection("post");
                // In this app the collection might be named 'post' or 'posts' depending on mapping; try both
                if (posts == null) posts = mongoClient.getDatabase(dbName).getCollection("posts");

                var iterable = posts.watch().fullDocument(FullDocument.UPDATE_LOOKUP);
                postsCursor = iterable.iterator();
                while (postsCursor.hasNext()) {
                    ChangeStreamDocument<Document> change = postsCursor.next();
                    try {
                        Document full = change.getFullDocument();
                        if (full != null) {
                            String userId = full.getString("userId");
                            log.debug("ChangeStream event for posts (operationType={} userId={})", change.getOperationType(), userId);
                            if (userId != null) realtime.postsChanged(userId);
                        }
                    } catch (Exception e) {
                        log.warn("Error handling change stream document", e);
                    }
                }
            } catch (UnsupportedOperationException e) {
                log.warn("MongoDB change streams are not supported by the connected MongoDB server: {}", e.getMessage());
            } catch (Exception e) {
                log.error("MongoDB change stream listener failed", e);
            }
        });
    }

    @Override
    public void destroy() {
        try {
            if (postsCursor != null) postsCursor.close();
        } catch (Exception ignored) {}
        executor.shutdownNow();
    }
}
