package com.app.dao.user;

import java.util.List;
import java.util.Map;

import com.app.dto.user.User;


public interface SignupUserDAO {
	User getUserInfo(User userId);
    User getUserDetail(String userId);
    List<User> getUserList();
    List<Map<String, Object>> getUserActivityLog(String userId);
    void updateUserRole(User user);
    void suspendUser(User user);
    void deleteUser(String userId);
    void updateUserInfo(User user);
    
}
