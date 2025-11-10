package com.redismonitor.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@ConditionalOnProperty(name = "redis-monitor.synthetic-data.enabled", havingValue = "true")
public class SyntheticDataGenerator {

    private static final Logger log = LoggerFactory.getLogger(SyntheticDataGenerator.class);

    private final RedisTemplate<String, Object> redisTemplate;
    private final Random random = new Random();

    public SyntheticDataGenerator(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    
    private double cpuBase = 50.0;
    private double memoryBase = 2048.0;
    private int requestCount = 0;
    private int errorCount = 0;

    @PostConstruct
    public void init() {
        log.info("Synthetic data generator initialized");
    }

    @Scheduled(fixedDelayString = "${redis-monitor.synthetic-data.interval-ms:2000}")
    public void generateMetrics() {
        try {
            cpuUsage();
            chrisUsage();
            total_requests();
            totalRequests();
            errorCount();
            avgReponseTimeMs();
            activeConnections();
            requestsPerSecond("metric:timeseries:requests_per_sec");

            requestsPerSecond("metric:timeseries:chris_per_sec");
            requestsPerSecond("metric:timeseries:bla_per_sec");
            requestsPerSecond("metric:timeseries:dontseeme_per_sec");
            log.debug("Generated synthetic metrics");
            
        } catch (Exception e) {
            log.error("Error generating synthetic data: {}", e.getMessage());
        }
    }

    private void errorCount() {
        // Generate error count (counter, occasionally increases)
        if (random.nextDouble() < 0.3) {
            errorCount += random.nextInt(5);
            redisTemplate.opsForValue().set("metric:error_count", String.valueOf(errorCount));
        }
    }

    private void activeConnections() {
        // Generate active connections (gauge, oscillating between 10-100)
        int activeConnections = 30 + random.nextInt(70);
        redisTemplate.opsForValue().set("metric:active_connections", String.valueOf(activeConnections));
    }

    private void requestsPerSecond(String timeSeriesKey) {
        // Generate time series data with timestamp
        long timestamp = Instant.now().toEpochMilli();
        int rps = random.nextInt(100) + 50;

        // Store as JSON-like string for time series
        String timeSeriesValue = String.format("{\"timestamp\":%d,\"value\":%d}", timestamp, rps);
        redisTemplate.opsForValue().set(timeSeriesKey, timeSeriesValue);
        // Store in a list for history (keep last 50 points)
        String historyKey = "metric:history:requests_per_sec";
        redisTemplate.opsForList().rightPush(historyKey, timeSeriesValue);
        redisTemplate.opsForList().trim(historyKey, -50, -1);
        redisTemplate.expire(historyKey, 1, TimeUnit.HOURS);
    }

    private void totalRequests() {
        // Generate request count (counter, always increasing)
        requestCount += random.nextInt(20) + 10;
        redisTemplate.opsForValue().set("metric:total_requests", String.valueOf(requestCount));
    }

    private void avgReponseTimeMs() {
        // Generate response time (gauge, random between 50-500ms)
        double responseTime = 100 + random.nextDouble() * 400;
        redisTemplate.opsForValue().set("metric:avg_response_time_ms", String.format("%.2f", responseTime));
    }

    private void cpuUsage() {
        // Generate CPU usage (gauge, oscillating around 50%)
        cpuBase += (random.nextDouble() - 0.5) * 10;
        cpuBase = Math.max(10, Math.min(90, cpuBase));
        redisTemplate.opsForValue().set("metric:cpu_usage", String.format("%.2f", cpuBase));
    }

    private void chrisUsage() {
        // Generate CPU usage (gauge, oscillating around 50%)
        cpuBase += (random.nextDouble() - 0.5) * 10;
        cpuBase = Math.max(10, Math.min(90, cpuBase));
        redisTemplate.opsForValue().set("metric:chris_usage", String.format("%.2f", cpuBase));
    }

    private void total_requests() {
        // Generate memory usage (gauge, slowly increasing with some noise)
        memoryBase += (random.nextDouble() - 0.3) * 50;
        memoryBase = Math.max(1024, Math.min(4096, memoryBase));
        redisTemplate.opsForValue().set("metric:memory_mb", String.format("%.0f", memoryBase));
    }
}
