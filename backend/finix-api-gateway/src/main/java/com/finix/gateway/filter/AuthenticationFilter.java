package com.finix.gateway.filter;

import com.finix.gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global filter that validates JWT before
 * forwarding secured requests.
 */
@Component
@RequiredArgsConstructor
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final RouteValidator routeValidator;

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
                             org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {

        if (routeValidator.isSecured.test(exchange.getRequest())) {

            if (!exchange.getRequest()
                    .getHeaders()
                    .containsKey(HttpHeaders.AUTHORIZATION)) {

                exchange.getResponse()
                        .setStatusCode(HttpStatus.UNAUTHORIZED);

                return exchange.getResponse().setComplete();
            }

            String authHeader =
                    exchange.getRequest()
                            .getHeaders()
                            .getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null ||
                    !authHeader.startsWith("Bearer ")) {

                exchange.getResponse()
                        .setStatusCode(HttpStatus.UNAUTHORIZED);

                return exchange.getResponse().setComplete();
            }

            String token = authHeader.substring(7);

            try {

                Claims claims =
                        jwtUtil.validateToken(token);

                String userId =
                        claims.get("userId", String.class);

                String role =
                        claims.get("role", String.class);

                String email =
                        claims.getSubject();

                ServerWebExchange modifiedExchange =
                        exchange.mutate()
                                .request(exchange.getRequest()
                                        .mutate()
                                        .header("X-User-Id", userId)
                                        .header("X-User-Role", role)
                                        .header("X-User-Email", email)
                                        .build())
                                .build();

                return chain.filter(modifiedExchange);

            } catch (Exception ex) {

                exchange.getResponse()
                        .setStatusCode(HttpStatus.UNAUTHORIZED);

                return exchange.getResponse().setComplete();
            }

        }

        return chain.filter(exchange);
    }

    /**
     * Execute this filter before other filters.
     */
    @Override
    public int getOrder() {
        return -1;
    }
}