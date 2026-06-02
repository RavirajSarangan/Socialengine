package dev.socialengine.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

/** Serves generated media files (images/audio) from the uploads dir at /media/**. */
@Configuration
public class MediaConfig implements WebMvcConfigurer {

    @Value("${app.media.dir:uploads}")
    private String dir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String location = Path.of(dir).toAbsolutePath().toUri().toString();
        registry.addResourceHandler("/media/**").addResourceLocations(location);
    }
}
