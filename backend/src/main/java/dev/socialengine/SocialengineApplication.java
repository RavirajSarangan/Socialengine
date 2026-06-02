package dev.socialengine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SocialengineApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocialengineApplication.class, args);
    }
}
