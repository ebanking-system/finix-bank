package com.finix.security;


import java.io.IOException
;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.finix.auth.dto.JwtDTO;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component // to declare it as spring bean
@RequiredArgsConstructor
@Slf4j
public class CustomJwtVerificationFilter extends OncePerRequestFilter {
	private final JwtUtils jwtUtils;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		try {
			// 1. Check if Authorization header exists in the incoming reques & starts with
			// Bearer
			String headerValue = request.getHeader("Authorization");
			if (headerValue != null && headerValue.startsWith("Bearer ")) {
				// => 2. Extract JWT & validate it using JwtUtils & get claims
				String jwt = headerValue.substring(7);
				Claims claims = jwtUtils.verifyJwt(jwt);
				/*
				 * 3. Create Authentication(i/f) object - implented by -
				 * UserNamePasswordAuthentication(Object principal, Object
				 * credentials,Collection<? extends GrantedAuthority> authorities) - Implies
				 * authentication is succsful (isAuthenticated - true) Principal - DTO : userId
				 * & userRole - credentials - null - List.of(SimpleGrantedAuthority(role)
				 * 
				 */
				// 4. Extract the claims - user id & role & add them in dto
				Long userId = claims.get("user_id", Long.class);
				String userRole = claims.get("user_role", String.class);
				String email=claims.getSubject();
				JwtDTO dto = new JwtDTO(userId, userRole,email);
				UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(dto, null,
						List.of(new SimpleGrantedAuthority(userRole)));
				/*
				 * 5. Add authentication object under - Spring security context holder - so that
				 * next filters can get auth details directly
				 */
				SecurityContextHolder.getContext().setAuthentication(authentication);
			} else {
				log.info("******NO JWT *********");
			}
			// in case of no exceptions -> continue to the next Filter | D.S
			filterChain.doFilter(request, response);
		} catch (Exception e) {
			/* -> invalid jwt -> abort further request processing
			 * clear sec ctx holder
			 * send error resp (SC 401) to the client 
			 */
			SecurityContextHolder.clearContext();
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().print("Invalid JWT - Authentication Failed!!!!!");
			return ;
		}

	}

}
