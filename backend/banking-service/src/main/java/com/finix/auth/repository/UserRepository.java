package com.finix.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.finix.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

	User findByEmail(String email);

	boolean existsByEmail(String email);

}
