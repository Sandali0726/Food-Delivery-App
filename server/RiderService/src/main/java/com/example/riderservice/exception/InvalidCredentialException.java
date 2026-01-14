package com.example.riderservice.exception;

import org.springframework.security.authentication.BadCredentialsException;

public class InvalidCredentialException extends BadCredentialsException {

    public InvalidCredentialException(String message) {
        super(message);
    }
}
