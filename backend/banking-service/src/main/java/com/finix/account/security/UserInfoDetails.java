package com.ebs.auth.security;

import com.ebs.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security compatible representation of the authenticated user.
 * Built from our User entity in loadUserByUsername(...).
 */
@Getter
@Builder
@ToString(exclude = "password") // never let the password hash leak into logs/stack traces
@AllArgsConstructor
public class UserInfoDetails implements UserDetails {

    private final Long userId;
    private final String email;
    private final String password; // this holds the hash, never the raw password
    private final Boolean mustChangePassword;
    private final Boolean isActive;
    private final Collection<? extends GrantedAuthority> authorities;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getUsername() {
        // Spring Security's "username" concept — ours is email-based login
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // extend if you add account-expiry logic later
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // extend if you add lockout-after-failed-attempts logic later
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // mustChangePassword = true means credentials ARE expired (force reset flow)
        return mustChangePassword == null || !mustChangePassword;
    }

    @Override
    public boolean isEnabled() {
        // wired to the real isActive column instead of hardcoded true
        return isActive != null && isActive;
    }

    /**
     * Factory method to build UserInfoDetails from the User entity.
     * Role is converted to Spring Security's "ROLE_x" convention so
     * hasRole("MANAGER") style checks actually work downstream.
     */
    public static UserInfoDetails fromUser(User user) {
        return UserInfoDetails.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .password(user.getPasswordHash())
                .mustChangePassword(user.getMustChangePassword())
                .isActive(user.getIsActive())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}
