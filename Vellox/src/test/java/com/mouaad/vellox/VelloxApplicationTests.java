package com.mouaad.vellox;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class VelloxApplicationTests {

    static {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        if (dotenv.entries().isEmpty()) {
            dotenv = Dotenv.configure().directory("./Vellox").ignoreIfMissing().load();
        }
        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });
    }

    @Test
    void contextLoads() {
    }

}
