package com.finix.common.exception;


public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}