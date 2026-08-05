package com.finix.gateway.filter;

import com.finix.gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Filter responsible for validating JWT
 * before forwarding requests.
 */
@Component
public class JwtAuthenticationFilter
        extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

	private final JwtUtil jwtUtil;

	public JwtAuthenticationFilter(JwtUtil jwtUtil) {
	    super(Config.class);
	    this.jwtUtil = jwtUtil;
	}

    @Override
    public GatewayFilter apply(Config config) {

        return (exchange, chain) -> {

            String path = exchange.getRequest()
                    .getURI()
                    .getPath();

            /*
             * Skip JWT validation
             * for Login and Register APIs.
             */
            if (path.startsWith("/api/auth")) {
                return chain.filter(exchange);
            }

            String authHeader =
                    exchange.getRequest()
                            .getHeaders()
                            .getFirst("Authorization");

            if (authHeader == null ||
                    !authHeader.startsWith("Bearer ")) {

                exchange.getResponse()
                        .setStatusCode(HttpStatus.UNAUTHORIZED);

                return exchange.getResponse().setComplete();
            }

            String token =
                    authHeader.substring(7);

            try {

                Claims claims =
                        jwtUtil.validateToken(token);

                /*
                 * Later we can forward these
                 * claims to Banking Service
                 * using request headers.
                 */

            } catch (Exception ex) {

                exchange.getResponse()
                        .setStatusCode(HttpStatus.UNAUTHORIZED);

                return exchange.getResponse().setComplete();
            }

            return chain.filter(exchange);
        };
    }

    public static class Config {

    }

}