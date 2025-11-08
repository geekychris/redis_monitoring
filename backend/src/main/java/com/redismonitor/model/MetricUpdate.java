package com.redismonitor.model;

public class MetricUpdate {
    private String key;
    private String value;
    private Long timestamp;
    private String operation; // "set", "delete", "expire"

    public MetricUpdate() {}

    public MetricUpdate(String key, String value, Long timestamp, String operation) {
        this.key = key;
        this.value = value;
        this.timestamp = timestamp;
        this.operation = operation;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
    
    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
    
    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }
}
