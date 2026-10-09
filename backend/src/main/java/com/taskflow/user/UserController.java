package com.taskflow.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(
            @RequestParam String query,
            Authentication authentication
    ) {

        String normalizedQuery = query == null ? "" : query.trim();

        if (normalizedQuery.length() < 2) {
            return ResponseEntity.ok(List.of());
        }

        String currentEmail = authentication.getName();

        List<UserSearchResponse> users = userRepository
                .findTop10ByEmailContainingIgnoreCaseOrNameContainingIgnoreCase(
                        normalizedQuery,
                        normalizedQuery
                )
                .stream()
                .filter(user -> !user.getEmail().equalsIgnoreCase(currentEmail))
                .map(user -> new UserSearchResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                ))
                .toList();

        return ResponseEntity.ok(users);
    }
}
