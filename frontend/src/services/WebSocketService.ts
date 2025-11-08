import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type MetricUpdate = {
  key: string;
  value: string | null;
  timestamp: number;
  operation: string;
};

type SubscriptionCallback = (update: MetricUpdate) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, SubscriptionCallback[]> = new Map();
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws-redis-monitor'),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          this.connected = false;
          reject(new Error(frame.headers['message']));
        },
        onWebSocketClose: () => {
          console.log('WebSocket closed');
          this.connected = false;
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
          }
        },
      });

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  subscribeToMetric(key: string, callback: SubscriptionCallback): void {
    if (!this.connected || !this.client) {
      console.error('WebSocket not connected');
      return;
    }

    // Add callback to subscriptions
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, []);
    }
    this.subscriptions.get(key)!.push(callback);

    // Subscribe to the topic for this key
    this.client.subscribe(`/topic/metrics/${key}`, (message: IMessage) => {
      const update: MetricUpdate = JSON.parse(message.body);
      const callbacks = this.subscriptions.get(key);
      if (callbacks) {
        callbacks.forEach(cb => cb(update));
      }
    });

    // Tell backend to start monitoring this key
    this.client.publish({
      destination: '/app/subscribe',
      body: JSON.stringify({ keys: [key] }),
    });
  }

  unsubscribeFromMetric(key: string): void {
    if (!this.connected || !this.client) {
      return;
    }

    this.subscriptions.delete(key);

    this.client.publish({
      destination: '/app/unsubscribe',
      body: JSON.stringify({ keys: [key] }),
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const wsService = new WebSocketService();
