package com.app.controller;

import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.app.dao.signup.SignupUserDAO;
import com.app.dto.user.User;
import com.app.utill.SHA256Encryptor;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
	private final SignupUserDAO userDAO;
    private final Set<String> usedCodes = new HashSet<>(); // 사용된 code 추적

    public AuthController(SignupUserDAO userDAO) {
        this.userDAO = userDAO;
    }
    
    private String generateUniqueUserId() {
        String userId;
        int attempts = 0;
        do {
            userId = UUID.randomUUID().toString();
            attempts++;
            if (attempts > 10) {
                throw new RuntimeException("고유한 user_id 생성 실패");
            }
        } while (userDAO.getUserById(userId) != null);
        return userId;
    }

    private String generateSecurePassword() throws NoSuchAlgorithmException {
        return SHA256Encryptor.encrypt(UUID.randomUUID().toString());
    }

    private String generateUniqueEmail() {
        return "random_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com"; // 고유 이메일 생성
    }

    private String generateUniqueTel() {
        return "N/A_" + UUID.randomUUID().toString().substring(0, 8); // 고유 전화번호 생성
    }

    // Google 로그인
    @PostMapping("/google-login")
    public Map<String, Object> googleLogin(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        Map<String, Object> response = new HashMap<>();
        System.out.println("Received Google code: " + code);
        
        if (code == null || code.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "유효하지 않은 인증 코드입니다.");
            return response;
        }
        usedCodes.add(code); // code 사용 기록

        try {
            String tokenRequestUrl = null;

            System.out.println("Google token request URL: " + tokenRequestUrl);
            RestTemplate restTemplate = new RestTemplate();
            String tokenResponse = restTemplate.postForObject(tokenRequestUrl, null, String.class);
            System.out.println("Google token response: " + tokenResponse);
            
            JSONParser parser = new JSONParser();
            JSONObject jsonObject = (JSONObject) parser.parse(tokenResponse);
            String accessToken = (String) jsonObject.get("access_token");
            System.out.println("Google access token: " + accessToken);

            String userInfoUrl = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + accessToken;
            String userResponse = restTemplate.getForObject(userInfoUrl, String.class);
            System.out.println("Google user info response: " + userResponse);

            JSONObject userJson = (JSONObject) parser.parse(userResponse);
            String email = (String) userJson.get("email");
            String name = (String) userJson.get("name");

            User user = email != null ? userDAO.getUserByEmail(email) : null;
            if (user == null) {
                user = new User();
                user.setUserId(generateUniqueUserId()); // 고유 ID 생성
                user.setPassword(generateSecurePassword());
                String username = checkAndAdjustUsername("google_" + email.split("@")[0]);
                user.setUsername(checkAndAdjustUsername(username)); // 중복 체크
                user.setEmail(email);
                user.setNickname(name);
                user.setTel(generateUniqueTel()); // tel만 랜덤
                user.setUserType("GOOGLE");
                System.out.println("Inserting new Google user: " + user.toString());
                userDAO.insertUser(user);
                System.out.println("Google user inserted successfully");
            }

            response.put("success", true);
            response.put("userId", user.getUserId());
            response.put("nickname", user.getNickname());
            response.put("email", user.getEmail());
            response.put("message", "Google 로그인 성공: " + user.getNickname());
        } catch (HttpClientErrorException e) {
            System.out.println("Google HTTP Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            response.put("success", false);
            response.put("message", "Google 로그인 실패: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Google 로그인 실패: " + e.getMessage());
        }
        System.out.println("Google login response: " + response);
        return response;
    }

    // 카카오 로그인
    @PostMapping("/kakao-login")
    public Map<String, Object> kakaoLogin(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        Map<String, Object> response = new HashMap<>();
        System.out.println("Received Kakao code: " + code);

        if (code == null || code.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "유효하지 않은 인증 코드입니다.");
            return response;
        }
        
        usedCodes.add(code); // code 사용 기록
        
        try {
            String tokenRequestUrl = "https://kauth.kakao.com/oauth/token?"
                    + "grant_type=authorization_code"
                    + "&client_id=53dc272af06402c9a2518ffbd87b1d3e"
                    + "&redirect_uri=http://localhost:3000/auth/kakao/callback"
                    + "&code=" + code;

            System.out.println("Kakao token request URL: " + tokenRequestUrl);
            RestTemplate restTemplate = new RestTemplate();
            String tokenResponse = restTemplate.postForObject(tokenRequestUrl, null, String.class);
            System.out.println("Kakao token response: " + tokenResponse);

            JSONParser parser = new JSONParser();
            JSONObject jsonObject = (JSONObject) parser.parse(tokenResponse);
            String accessToken = (String) jsonObject.get("access_token");
            System.out.println("Kakao access token: " + accessToken);

            String userInfoUrl = "https://kapi.kakao.com/v2/user/me";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            String userResponse = restTemplate.exchange(userInfoUrl, HttpMethod.GET, entity, String.class).getBody();
            System.out.println("Kakao user info response: " + userResponse);

            JSONObject userJson = (JSONObject) parser.parse(userResponse);
            JSONObject kakaoAccount = (JSONObject) userJson.get("kakao_account");
            String email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
            JSONObject profile = kakaoAccount != null ? (JSONObject) kakaoAccount.get("profile") : null;
            String nickname = profile != null ? (String) profile.get("nickname") : "kakao_user_" + userJson.get("id");
            
            
            User user = email != null ? userDAO.getUserByEmail(email) : null;
            if (user == null) {
                user = new User();
                user.setUserId(generateUniqueUserId()); // 고유 ID 생성
                user.setPassword(generateSecurePassword());
                String username = checkAndAdjustUsername(nickname.replaceAll("\\s+", "_")); // 닉네임 기반, 중복 체크
                user.setUsername(username);
                user.setEmail(email != null ? email : generateUniqueEmail()); // 이메일 없으면 랜덤 생성
                user.setNickname(nickname);
                user.setNickname(nickname);
                user.setTel(generateUniqueTel()); // 항상 랜덤 tel
                user.setUserType("KAKAO");
                System.out.println("Inserting new Kakao user: " + user.toString());
                userDAO.insertUser(user);
                System.out.println("Kakao user inserted successfully");
            }

            response.put("success", true);
            response.put("userId", user.getUserId());
            response.put("nickname", user.getNickname());
            response.put("email", user.getEmail());
            response.put("message", "카카오 로그인 성공: " + user.getNickname());
        } catch (HttpClientErrorException e) {
            System.out.println("Kakao HTTP Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            response.put("success", false);
            response.put("message", "카카오 로그인 실패: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "카카오 로그인 실패: " + e.getMessage());
        }
        System.out.println("Kakao login response: " + response);
        return response;
    }

    // 네이버 로그인
    @PostMapping("/naver-login")
    public Map<String, Object> naverLogin(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        Map<String, Object> response = new HashMap<>();
        System.out.println("Received Naver code: " + code);

        if (code == null || code.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "유효하지 않은 인증 코드입니다.");
            return response;
        }
        usedCodes.add(code); // code 사용 기록
        
        try {
            String tokenRequestUrl = "https://nid.naver.com/oauth2.0/token?"
                    + "grant_type=authorization_code"
                    + "&client_id=Nkfn0QfjAXMn7bXTdYEC"
                    + "&client_secret=VhsOeyj6lM"
                    + "&redirect_uri=http://localhost:3000/auth/naver/callback"
                    + "&code=" + code;

            System.out.println("Naver token request URL: " + tokenRequestUrl);
            RestTemplate restTemplate = new RestTemplate();
            String tokenResponse = restTemplate.postForObject(tokenRequestUrl, null, String.class);
            System.out.println("Naver token response: " + tokenResponse);

            JSONParser parser = new JSONParser();
            JSONObject jsonObject = (JSONObject) parser.parse(tokenResponse);
            String accessToken = (String) jsonObject.get("access_token");
            System.out.println("Naver access token: " + accessToken);

            String userInfoUrl = "https://openapi.naver.com/v1/nid/me";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            String userResponse = restTemplate.exchange(userInfoUrl, HttpMethod.GET, entity, String.class).getBody();
            System.out.println("Naver user info response: " + userResponse);

            JSONObject userJson = (JSONObject) parser.parse(userResponse);
            JSONObject responseObj = (JSONObject) userJson.get("response");
            String email = (String) responseObj.get("email");
            String nickname = (String) responseObj.get("nickname");
            

            User user = email != null ? userDAO.getUserByEmail(email) : null;
            if (user == null) {
                user = new User();
                user.setUserId(generateUniqueUserId()); // 고유 ID 생성
                user.setPassword(generateSecurePassword());
                String username = "naver_" + email.split("@")[0];
                user.setUsername(checkAndAdjustUsername(username)); // 중복 체크
                user.setEmail(email);
                user.setNickname(nickname);
                user.setTel(generateUniqueTel()); // tel만 랜덤
                user.setUserType("NAVER");
                System.out.println("Inserting new Naver user: " + user.toString());
                userDAO.insertUser(user);
                System.out.println("Naver user inserted successfully");
            }

            response.put("success", true);
            response.put("userId", user.getUserId());
            response.put("nickname", user.getNickname());
            response.put("email", user.getEmail());
            response.put("message", "네이버 로그인 성공: " + user.getNickname());
        } catch (HttpClientErrorException e) {
            System.out.println("Naver HTTP Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            response.put("success", false);
            response.put("message", "네이버 로그인 실패: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "네이버 로그인 실패: " + e.getMessage());
        }
        System.out.println("Naver login response: " + response);
        return response;
    }

    private String checkAndAdjustUsername(String baseUsername) {
        String username = baseUsername;
        int suffix = 1;
        while (userDAO.getUserByUsername(username) != null) {
            username = baseUsername + "_" + suffix++;
        }
        return username;
    }
}