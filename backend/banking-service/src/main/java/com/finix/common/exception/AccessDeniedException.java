package com.finix.common.exception;

public class AccessDeniedException extends RuntimeException {
	
	public AccessDeniedException(String msg) {
		super(msg);
	}
}
