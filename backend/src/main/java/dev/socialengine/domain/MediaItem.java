package dev.socialengine.domain;

/** One piece of media attached to a post (image/video/audio + optional video poster). */
public class MediaItem {
    private String url;
    private String type;        // image | video | audio
    private String posterUrl;
    private Long size;          // bytes (optional)

    public MediaItem() {}

    public MediaItem(String url, String type, String posterUrl, Long size) {
        this.url = url;
        this.type = type;
        this.posterUrl = posterUrl;
        this.size = size;
    }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }
}
