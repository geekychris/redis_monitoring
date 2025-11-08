package com.redismonitor.controller;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricController {

    private final RedisTemplate<String, Object> redisTemplate;

    public MetricController(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/available")
    public List<String> getAvailableMetrics() {
        Set<String> keys = redisTemplate.keys("metric:*");
        if (keys == null || keys.isEmpty()) {
            return List.of();
        }
        // Remove "metric:" prefix and filter out history/timeseries keys
        return keys.stream()
            .filter(key -> !key.contains(":history:") && !key.contains(":timeseries:"))
            .map(key -> key.replaceFirst("^metric:", ""))
            .sorted()
            .collect(Collectors.toList());
    }

    @GetMapping("/history/{key}")
    public List<Object> getHistory(@PathVariable String key) {
        String historyKey = "metric:history:" + key;
        Long size = redisTemplate.opsForList().size(historyKey);
        if (size == null || size == 0) {
            return List.of();
        }
        return redisTemplate.opsForList().range(historyKey, 0, -1);
    }

    @GetMapping("/current/{key}")
    public String getCurrent(@PathVariable String key) {
        Object value = redisTemplate.opsForValue().get("metric:" + key);
        return value != null ? value.toString() : null;
    }
}
