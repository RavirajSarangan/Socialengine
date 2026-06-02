package dev.socialengine.service;

import dev.socialengine.domain.MediaAsset;
import dev.socialengine.realtime.RealtimePublisher;
import dev.socialengine.repo.MediaAssetRepository;
import org.springframework.stereotype.Service;

/** Records media assets (from uploads or AI) and notifies clients. */
@Service
public class MediaAssetService {

    private final MediaAssetRepository assets;
    private final MediaStore store;
    private final RealtimePublisher realtime;

    public MediaAssetService(MediaAssetRepository assets, MediaStore store, RealtimePublisher realtime) {
        this.assets = assets;
        this.store = store;
        this.realtime = realtime;
    }

    public MediaAsset record(String userId, String url, String type, String posterUrl, String name, long size, String source) {
        MediaAsset a = new MediaAsset();
        a.setUserId(userId);
        a.setUrl(url);
        a.setType(type);
        a.setPosterUrl(posterUrl);
        a.setName(name);
        a.setSize(size);
        a.setSource(source);
        a = assets.save(a);
        realtime.mediaChanged(userId);
        return a;
    }

    /** Records an AI-generated asset (image/audio/video) so it shows in the library. */
    public void recordAi(String userId, String url, String type) {
        record(userId, url, type, null, "AI " + type, 0, "ai");
    }

    public void delete(MediaAsset asset) {
        store.delete(asset.getUrl());
        if (asset.getPosterUrl() != null) store.delete(asset.getPosterUrl());
        assets.delete(asset);
        realtime.mediaChanged(asset.getUserId());
    }
}
