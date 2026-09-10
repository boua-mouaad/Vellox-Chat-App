package com.mouaad.vellox;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class VelloxApplication {

    public static void main(String[] args) {
        SpringApplication.run(VelloxApplication.class, args);
    }

}
