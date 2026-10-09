package com.taskflow.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(
            ResourceNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        ApiError.of(
                                "RESOURCE_NOT_FOUND",
                                ex.getMessage()
                        )
                );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex
    ) {

        String message =
                ex.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .findFirst()
                        .map(error ->
                                error.getDefaultMessage()
                        )
                        .orElse("Invalid request");

        return ResponseEntity
                .badRequest()
                .body(
                        ApiError.of(
                                "VALIDATION_ERROR",
                                message
                        )
                );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(
            BadCredentialsException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(
                        ApiError.of(
                                "INVALID_CREDENTIALS",
                                "Invalid email or password"
                        )
                );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException ex
    ) {

        return ResponseEntity
                .badRequest()
                .body(
                        ApiError.of(
                                "BAD_REQUEST",
                                ex.getMessage()
                        )
                );
    }

    @ExceptionHandler(SecurityException.class)
public ResponseEntity<ApiError> handleSecurityException(
        SecurityException ex
) {

    return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(
                    ApiError.of(
                            "FORBIDDEN",
                            ex.getMessage()
                    )
            );
}
}