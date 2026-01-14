package com.example.riderservice.exception;

public class RiderAlreadyExistsException extends RuntimeException{
    public RiderAlreadyExistsException(String message) {
        super(message);
    }
}
