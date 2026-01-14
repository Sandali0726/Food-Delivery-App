package com.yumi.userservice.service;
import com.yumi.userservice.dto.Rider.RiderLocationDTO;
import com.yumi.userservice.service.grpcClient.RiderLocationClient;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
/**
 * Periodically polls Rider service via gRPC for a given order's rider location
 * and broadcasts updates over STOMP to /topic/rider-location/{orderId}.
 * Uses reference counting so multiple subscribers for the same order share one poller.
 */
@Service
public class RiderLocationTracker {
    private final RiderLocationClient riderLocationClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2, r -> {
        Thread t = new Thread(r, "rider-location-tracker");
        t.setDaemon(true);
        return t;
    });
    private static class Tracking {
        final AtomicInteger subscribers = new AtomicInteger(0);
        ScheduledFuture<?> future;
    }
    private final Map<Long, Tracking> trackers = new ConcurrentHashMap<>();
    public RiderLocationTracker(RiderLocationClient riderLocationClient, SimpMessagingTemplate messagingTemplate) {
        this.riderLocationClient = riderLocationClient;
        this.messagingTemplate = messagingTemplate;
    }
    public void startTracking(Long orderId) {
        if (orderId == null) return;
        trackers.compute(orderId, (id, existing) -> {
            if (existing == null) {
                Tracking t = new Tracking();
                t.subscribers.incrementAndGet();
                t.future = scheduler.scheduleAtFixedRate(() -> pollAndPublish(id), 0, 2, TimeUnit.SECONDS);
                System.out.println("[RiderLocationTracker] Started tracking order=" + id);
                return t;
            } else {
                int c = existing.subscribers.incrementAndGet();
                System.out.println("[RiderLocationTracker] Incremented subscribers order=" + id + ", count=" + c);
                return existing;
            }
        });
    }
    public void stopTracking(Long orderId) {
        if (orderId == null) return;
        trackers.computeIfPresent(orderId, (id, t) -> {
            int remaining = t.subscribers.decrementAndGet();
            System.out.println("[RiderLocationTracker] Decrement subscribers order=" + id + ", remaining=" + remaining);
            if (remaining <= 0) {
                if (t.future != null) t.future.cancel(true);
                System.out.println("[RiderLocationTracker] Stopped tracking order=" + id);
                return null; // remove from map
            }
            return t;
        });
    }
    public void publishOnce(Long orderId) {
        pollAndPublish(orderId);
    }
    private void pollAndPublish(Long orderId) {
        try {
            RiderLocationDTO dto = riderLocationClient.getCurrentLocation(orderId);
            String dest = "/topic/rider-location/" + orderId;
            messagingTemplate.convertAndSend(dest, dto);
        } catch (Exception e) {
            System.out.println("[RiderLocationTracker] Failed to fetch/publish for order=" + orderId + ": " + e.getMessage());
        }
    }
}
