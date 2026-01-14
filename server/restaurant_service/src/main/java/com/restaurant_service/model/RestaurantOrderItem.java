package com.restaurant_service.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "restaurant_order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantOrderItem {

    @Id
    @Column(name = "order_item_id", nullable = false, updatable = false)
    private UUID orderItemId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "food_id", nullable = false)
    private Long foodId;

    @Column(name = "food_name", nullable = false)
    private String foodName;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "price", nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @PrePersist
    public void ensureId() {
        if (this.orderItemId == null) {
            this.orderItemId = UUID.randomUUID();
        }
    }
}
