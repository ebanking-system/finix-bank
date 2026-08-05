//package com.finix.gateway.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.Customizer;
//import org.springframework.security.config.web.server.ServerHttpSecurity;
//import org.springframework.security.web.server.SecurityWebFilterChain;
//
///**
// * Security configuration for API Gateway.
// *
// * Since Spring Cloud Gateway is based on Spring WebFlux,
// * we use SecurityWebFilterChain instead of SecurityFilterChain.
// */
//@Configuration
//public class SecurityConfig {
//
//    /**
//     * Configures security rules for incoming requests.
//     */
//    @Bean
//    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
//
//        http
//            // Disable CSRF because we are using JWT authentication
//            .csrf(ServerHttpSecurity.CsrfSpec::disable)
//
//            // Configure authorization rules
//            .authorizeExchange(exchange -> exchange
//
//                // Public APIs
//                .pathMatchers("/api/auth/**").permitAll()
//
//                // Swagger 
//                .pathMatchers(
//                        "/swagger-ui/**",
//                        "/v3/api-docs/**"
//                ).permitAll()
//                
//                // Every other request requires authentication
//                .anyExchange().authenticated()
//            )
//
//            // Disable default login page
//            .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
//
//            // Disable form login
//            .formLogin(ServerHttpSecurity.FormLoginSpec::disable);
//
//        return http.build();
//    }
//}


package com.finix.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.reactive.CorsWebFilter;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> {})
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)

                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/api/auth/**").permitAll()
                        .anyExchange().permitAll()
                )
                .build();
    }

    /**
     * CORS Configuration
     */
    @Bean
    public CorsWebFilter corsWebFilter() {

        CorsConfiguration configuration = new CorsConfiguration();

        // React Frontend URL
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        // Allow HTTP Methods
        configuration.setAllowedMethods(List.of(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.DELETE.name(),
                HttpMethod.PATCH.name(),
                HttpMethod.OPTIONS.name()
        ));

        // Allow Headers
        configuration.setAllowedHeaders(List.of("*"));

        // Allow Authorization Header
        configuration.setExposedHeaders(List.of("Authorization"));

        // Allow Cookies if required
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return new CorsWebFilter(source);
    }
}