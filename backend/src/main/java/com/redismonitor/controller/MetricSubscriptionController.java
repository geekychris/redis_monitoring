package com.redismonitor.controller;

import com.redismonitor.service.RedisKeyMonitorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class MetricSubscriptionController {

    private static final Logger log = LoggerFactory.getLogger(MetricSubscriptionController.class);

    private final RedisKeyMonitorService monitorService;

    public MetricSubscriptionController(RedisKeyMonitorService monitorService) {
        this.monitorService = monitorService;
    }

    @MessageMapping("/subscribe")
    public void subscribe(@Payload Map<String, Object> payload) {
        Object keysObj = payload.get("keys");
        if (keysObj instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> keys = (List<String>) keysObj;
            keys.forEach(key -> {
                log.info("Client subscribing to key: {}", key);
                monitorService.subscribeToKey(key);
            });
        }
    }

    @MessageMapping("/unsubscribe")
    public void unsubscribe(@Payload Map<String, Object> payload) {
        Object keysObj = payload.get("keys");
        if (keysObj instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> keys = (List<String>) keysObj;
            keys.forEach(key -> {
                log.info("Client unsubscribing from key: {}", key);
                monitorService.unsubscribeFromKey(key);
            });
        }
    }
}
