package com.finix.notification.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent {

    private Long customerId;

    private String eventType;

    private String title;

    private String message;

    private String email;

    private List<String> channels;

}