package com.finix.gateway.filter;

import java.util.List;
import java.util.function.Predicate;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

/**
 * This class decides whether an incoming request
 * requires JWT authentication.
 */
@Component
public class RouteValidator {

    /**
     * List of APIs that do NOT require JWT.
     */
    public static final List<String> OPEN_API_ENDPOINTS = List.of(

            "/api/auth/signin",
            "/api/auth/signup",
            "/api/employees/signup",
            "/api/kyc/files",
            "/api/employees/photo",

            "/swagger-ui",

            "/v3/api-docs",

            "/actuator"
    );


    /**
     * Returns TRUE if API is secured.
     */
    public Predicate<ServerHttpRequest> isSecured =

            request ->

                    OPEN_API_ENDPOINTS
                            .stream()
                            .noneMatch(uri ->
                                    request.getURI()
                                            .getPath()
                                            .contains(uri));

}