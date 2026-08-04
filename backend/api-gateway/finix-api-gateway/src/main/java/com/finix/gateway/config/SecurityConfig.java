package com.finix.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Security configuration for API Gateway.
 *
 * Since Spring Cloud Gateway is based on Spring WebFlux,
 * we use SecurityWebFilterChain instead of SecurityFilterChain.
 */
@Configuration
public class SecurityConfig {

    /**
     * Configures security rules for incoming requests.
     */
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {

        http
            // Disable CSRF because we are using JWT authentication
            .csrf(ServerHttpSecurity.CsrfSpec::disable)

            // Configure authorization rules
            .authorizeExchange(exchange -> exchange

                // Public APIs
                .pathMatchers("/api/auth/**").permitAll()

                // Swagger (optional)
                .pathMatchers(
                        "/swagger-ui/**",
                        "/v3/api-docs/**"
                ).permitAll()

                // Health endpoint
                .pathMatchers("/actuator/**").permitAll()

                // Every other request requires authentication
                .anyExchange().authenticated()
            )

            // Disable default login page
            .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)

            // Disable form login
            .formLogin(ServerHttpSecurity.FormLoginSpec::disable);

        return http.build();
    }
}