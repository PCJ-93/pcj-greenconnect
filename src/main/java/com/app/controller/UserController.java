package com.app.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.app.dto.user.User;
import com.app.service.user.UserService;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@RestController
@RequestMapping("/user")
public class UserController {

    private static final Logger logger = LogManager.getLogger(UserController.class);

    @Autowired
    UserService userService;

    // 임시로 JWT 파싱 대신 헤더에서 토큰을 단순 추출 (Spring Security로 대체 권장)
    private String getUserIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // 단순히 토큰에서 userId를 추출하는 더미 로직 (실제로는 검증 필요)
            return token.split("\\.")[0]; // 임시 처리, 실제로는 유효성 검사 필요
        }
        throw new SecurityException("Authentication information is missing");
    }

    @PostMapping("/info")
    public ResponseEntity<?> getUserInfo(@RequestBody User userId) {
    	System.out.println("zzzz"+userId);
        try {
            User user = userService.getUserInfo(userId);
            System.out.println("zzzzzsdsd"+user.toString());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/detail")
    public ResponseEntity<User> getUserDetail(HttpServletRequest request) {
        try {
            String userId = getUserIdFromToken(request);
            User user = userService.getUserDetail(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error fetching user detail: " + e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateUserInfo(HttpServletRequest request, @Validated @RequestBody User user) {
        try {
            String userId = getUserIdFromToken(request);
            user.setUserId(userId);
            userService.updateUserInfo(user);
            return ResponseEntity.ok("사용자 정보가 업데이트되었습니다.");
        } catch (Exception e) {
            logger.error("Error updating user info: " + e.getMessage());
            return ResponseEntity.status(400).body("업데이트 실패");
        }
    }

    @GetMapping("/admin/users")
    public ResponseEntity<List<User>> getUserList() {
        try {
            List<User> users = userService.getUserList();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error fetching user list: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/admin/users/role")
    public ResponseEntity<Void> updateUserRole(@RequestBody User user) {
        try {
            userService.updateUserRole(user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error updating user role: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    }

    @PostMapping("/admin/users/suspend")
    public ResponseEntity<Void> suspendUser(@RequestParam("userId") String userId, @RequestParam("status") String status) {
        try {
            if ("active".equals(status) || "suspended".equals(status)) {
                userService.suspendUser(userId, status);
                return ResponseEntity.ok().build();
            } else {
                throw new IllegalArgumentException("Invalid status: " + status);
            }
        } catch (Exception e) {
            logger.error("Error suspending user: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    }

    @GetMapping("/admin/users/activity")
    public ResponseEntity<List<Map<String, Object>>> getUserActivityLog(@RequestParam("userId") String userId) {
        try {
            List<Map<String, Object>> log = userService.getUserActivityLog(userId);
            return ResponseEntity.ok(log);
        } catch (Exception e) {
            logger.error("Error fetching activity log: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<String> withdrawUser(HttpServletRequest request) {
        try {
            String userId = getUserIdFromToken(request);
            userService.deleteUser(userId);
            return ResponseEntity.ok("회원탈퇴가 완료되었습니다.");
        } catch (Exception e) {
            logger.error("Error withdrawing user: " + e.getMessage());
            return ResponseEntity.status(400).body("탈퇴 실패");
        }
    }
}