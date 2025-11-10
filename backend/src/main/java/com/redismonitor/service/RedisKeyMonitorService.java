package com.redismonitor.service;

import com.redismonitor.model.MetricUpdate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.Topic;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RedisKeyMonitorService implements MessageListener {

    private static final Logger log = LoggerFactory.getLogger(RedisKeyMonitorService.class);

    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisMessageListenerContainer listenerContainer;
    private final SimpMessagingTemplate messagingTemplate;
    
    private final Set<String> subscribedKeys = ConcurrentHashMap.newKeySet();
    private final Map<String, Topic> keyTopics = new ConcurrentHashMap<>();

    public RedisKeyMonitorService(RedisTemplate<String, Object> redisTemplate,
                                  RedisMessageListenerContainer listenerContainer,
                                  SimpMessagingTemplate messagingTemplate) {
        this.redisTemplate = redisTemplate;
        this.listenerContainer = listenerContainer;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String channel = new String(message.getChannel());
        String operation = new String(message.getBody());
        
        // Extract key from channel: __keyspace@0__:key_name
        String key = channel.substring("__keyspace@0__:".length());
        
        // Only process if key is subscribed
        if (subscribedKeys.contains(key)) {
            handleKeyChange(key, operation);
        }
    }

    private void handleKeyChange(String key, String operation) {
        try {
            String value = null;
            if (!"del".equals(operation) && !"expired".equals(operation)) {
                Object redisValue = redisTemplate.opsForValue().get(key);
                value = redisValue != null ? redisValue.toString() : null;
            }
            
            MetricUpdate update = new MetricUpdate(
                key,
                value,
                System.currentTimeMillis(),
                operation
            );
            
            // Send update via WebSocket
            messagingTemplate.convertAndSend("/topic/metrics/" + key, update);
            log.debug("Sent update for key: {} with operation: {}", key, operation);
            
        } catch (Exception e) {
            log.error("Error handling key change for {}: {}", key, e.getMessage());
        }
    }

    public void subscribeToKey(String key) {
        if (subscribedKeys.contains(key)) {
            log.debug("Already subscribed to key: {}", key);
            return;
        }
        
        subscribedKeys.add(key);
        
        // Subscribe to Redis keyspace notifications for this specific key
        String channelPattern = "__keyspace@0__:" + key;
        Topic topic = new ChannelTopic(channelPattern);
        keyTopics.put(key, topic);
        listenerContainer.addMessageListener(this, topic);
        
        log.info("Subscribed to Redis keyspace notifications for key: {}", key);
        
        // Send initial value
        try {
            Object value = redisTemplate.opsForValue().get(key);
            MetricUpdate initialUpdate = new MetricUpdate(
                key,
                value != null ? value.toString() : null,
                System.currentTimeMillis(),
                "initial"
            );
            messagingTemplate.convertAndSend("/topic/metrics/" + key, initialUpdate);
        } catch (Exception e) {
            log.error("Error getting initial value for {}: {}", key, e.getMessage());
        }
    }

    public void unsubscribeFromKey(String key) {
        if (!subscribedKeys.contains(key)) {
            log.debug("Not subscribed to key: {}", key);
            return;
        }
        
        subscribedKeys.remove(key);
        
        // Unsubscribe from Redis keyspace notifications for this specific key
        Topic topic = keyTopics.remove(key);
        if (topic != null) {
            listenerContainer.removeMessageListener(this, topic);
            log.info("Unsubscribed from Redis keyspace notifications for key: {}", key);
        }
    }

    public Set<String> getSubscribedKeys() {
        return Set.copyOf(subscribedKeys);
    }
}
