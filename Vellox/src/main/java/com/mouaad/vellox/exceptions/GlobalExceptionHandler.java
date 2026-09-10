package com.mouaad.vellox.exceptions;

import com.mouaad.vellox.dtos.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Acts as a global catch-all for exceptions thrown anywhere in the application.
 * Formats errors into clean JSON before sending them back to the frontend.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    /**
     * Intercepts IllegalArgumentExceptions.
     * We threw these intentionally in our AuthService (e.g., "Email is already in use").
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        // Return a 400 Bad Request with our standardized ApiResponse DTO
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(ex.getMessage(), false));
    }

    /**
     * Intercepts validation errors triggered by @Valid in our Controllers.
     * Extracts the specific field errors so React can highlight the exact input boxes.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        // Loop through all the fields that failed validation
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        // Returns a JSON object like: { "email": "Must be a valid email format.", "password": "Password cannot be blank." }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errors);
    }

    /**
     * A generic catch-all for any unexpected server crashes (NullPointerExceptions, DB drops).
     * Prevents the stack trace from leaking to the frontend.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGenericException(Exception ex) {
        // In a real production app, you would log 'ex.getMessage()' to your console or logging system here
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("An unexpected internal server error occurred.", false));
    }
}
