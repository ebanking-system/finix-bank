package com.finix.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.finix.auth.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;
/*
 * (user.getId(),user.getEmail(),user.getPassword(),user.getUserRole(),user.getFirstName()+" "+user.getLastName());
 */
@Getter
@AllArgsConstructor
public class CustomUserDetailsImpl implements UserDetails {
	private Long userId;
	private String email;
	private String password;
	private Role role;
//	private String completeName;
/*
 * GrantedAuthority - core i/f used by Authorization manager 
 *  - to perform RBAC (role based access control)
 *  Implemented by
 *   - public SimpleGrantedAuthority(String name)
 *  NOTE 
 *  - While using any authority based API (Eg hasAuthority | hasAnyAuthority | GrantedAuthority) - MUST start with ROLE_ prefix (Eg. ROLE_ADMIN)
 *  -While using any role based API (Eg hasRole | hasAnyRole 
 *    - start with role name directly (Eg. - ADMIN )
 *  
 */
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// return List of granted authority of the user
		return List.of(new SimpleGrantedAuthority(role.name()));
	}

	@Override
	public String getPassword() {
		// return user's password
		return this.password;
	}

	@Override
	public String getUsername() {
		// return user's email
		return this.email;
	}

}
