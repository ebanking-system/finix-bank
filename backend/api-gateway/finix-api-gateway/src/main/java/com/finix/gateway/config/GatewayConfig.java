package com.finix.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * This class configures all routes for the API Gateway.
 *
 * Whenever a request matches a path,
 * Gateway forwards it to the appropriate microservice.
 */
@Configuration
public class GatewayConfig {

    /**
     * Configure all gateway routes.
     */
    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {

        return builder.routes()

        		.route("banking-service", route ->
                route
                    .path("/api/**")
                    .uri("lb://BANKING-SERVICE")
        )
                /*
                 * Authentication APIs
                 * Public APIs (Login/Register)
                 */
                .route("auth-service", route ->
                        route
                                .path("/api/auth/**")
                                .uri("lb://BANKING-SERVICE")
                )

                /*
                 * Customer APIs
                 */
                .route("customer-service", route ->
                        route
                                .path("/api/customer/**")
                                .uri("lb://BANKING-SERVICE")
                )

                /*
                 * Account APIs
                 */
                .route("account-service", route ->
                        route
                                .path("/api/account/**")
                                .uri("lb://BANKING-SERVICE")
                )

                /*
                 * Beneficiary APIs
                 */
                .route("beneficiary-service", route ->
                        route
                                .path("/api/beneficiary/**")
                                .uri("lb://BANKING-SERVICE")
                )

                /*
                 * Transaction APIs
                 */
                .route("transaction-service", route ->
                        route
                                .path("/api/transaction/**")
                                .uri("lb://BANKING-SERVICE")
                )

                /*
                 * Loan APIs
                 */
                .route("loan-service", route ->
                        route
                                .path("/api/loan/**")
                                .uri("lb://BANKING-SERVICE")
                )

                /*
                 * Card APIs
                 */
                .route("card-service", route ->
                        route
                                .path("/api/card/**")
                                .uri("lb://BANKING-SERVICE")
                )

                /*
                 * KYC APIs
                 */
                .route("kyc-service", route ->
                        route
                                .path("/api/kyc/**")
                                .uri("lb://BANKING-SERVICE")
                )

                /*
                 * Fixed Deposit APIs
                 */
                .route("fd-service", route ->
                        route
                                .path("/api/fd/**")
                                .uri("lb://BANKING-SERVICE")
                )

                /*
                 * Employee APIs
                 */
                .route("employee-service", route ->
                        route
                                .path("/api/employee/**")
                                .uri("lb://BANKING-SERVICE")
                )

                .build();
    }
}