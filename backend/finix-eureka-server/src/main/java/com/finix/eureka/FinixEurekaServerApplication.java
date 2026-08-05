package com.finix.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Main class of Eureka Server.
 *
 * @EnableEurekaServer enables this application
 * to act as a Service Registry.
 */
@SpringBootApplication
@EnableEurekaServer
public class FinixEurekaServerApplication {

    public static void main(String[] args) {

        SpringApplication.run(
                FinixEurekaServerApplication.class,
                args);

    }

}