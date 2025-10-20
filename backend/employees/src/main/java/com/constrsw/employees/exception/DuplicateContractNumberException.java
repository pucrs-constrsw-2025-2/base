package com.constrsw.employees.exception;

public class DuplicateContractNumberException extends RuntimeException {
    
    public DuplicateContractNumberException(String message) {
        super(message);
    }
    
    public DuplicateContractNumberException(String message, Throwable cause) {
        super(message, cause);
    }
}






