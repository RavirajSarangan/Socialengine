package dev.socialengine.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

/** Persists generated media (images/audio) to a local dir served at /media/**. */
@Service
public class MediaStore {

    private final Path dir;

    public MediaStore(@Value("${app.media.dir:uploads}") String dir) {
        this.dir = Path.of(dir).toAbsolutePath();
    }

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(dir);
    }

    /** Writes bytes and returns the public URL path (e.g. /media/<uuid>.png). */
    public String save(byte[] bytes, String extension) {
        String filename = UUID.randomUUID() + "." + extension;
        try {
            Files.write(dir.resolve(filename), bytes);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store generated media");
        }
        return "/media/" + filename;
    }

    /** Stores an uploaded file and returns its public URL path. */
    public String saveUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No file provided");
        }
        try {
            return save(file.getBytes(), extensionFor(file));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store uploaded file");
        }
    }

    /** Deletes a stored file by its /media/<name> url (best-effort). */
    public void delete(String url) {
        if (url == null || !url.startsWith("/media/")) return;
        try {
            Files.deleteIfExists(dir.resolve(url.substring("/media/".length())));
        } catch (IOException ignored) {
            // best-effort cleanup; ignore
        }
    }

    private String extensionFor(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name != null && name.contains(".")) {
            String ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
            if (ext.matches("[a-z0-9]{1,5}")) return ext;
        }
        String ct = file.getContentType();
        if (ct == null) return "bin";
        if (ct.startsWith("image/")) return ct.substring(6);
        if (ct.equals("video/mp4")) return "mp4";
        if (ct.startsWith("video/")) return ct.substring(6);
        if (ct.equals("audio/mpeg")) return "mp3";
        if (ct.startsWith("audio/")) return ct.substring(6);
        return "bin";
    }
}
