package com.redismonitor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RedisMonitorApplication {
    public static void main(String[] args) {
        SpringApplication.run(RedisMonitorApplication.class, args);
    }
}
