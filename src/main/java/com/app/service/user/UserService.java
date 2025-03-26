package com.app.service.user;

import java.util.List;
import java.util.Map;

import com.app.dto.user.User;

public interface UserService {
	List<User> getUserList();        
    void updateUserRole(User user);    
    void suspendUser(String userId, String status);  
    List<Map<String, Object>> getUserActivityLog(String userId);
    User getUserInfo(User userId);  
    User getUserDetail(String userId); 
    void deleteUser(String userId);
    void updateUserInfo(User user);
}
