package com.finix.notification.producer;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.finix.notification.dto.NotificationEvent;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${notification.queue}")
    private String queueName;

    public void send(NotificationEvent event) {

        rabbitTemplate.convertAndSend(
                queueName,
                event);

        System.out.println(
                "Notification published to RabbitMQ.");
    }
}