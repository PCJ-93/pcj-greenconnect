package com.app.dao.user.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.app.dao.user.SignupUserDAO;
import com.app.dto.user.User;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@Repository
public class UserDAOImpl implements SignupUserDAO {

    private static final Logger logger = LogManager.getLogger(UserDAOImpl.class);

    @Autowired
    SqlSessionTemplate sqlSessionTemplate;

    @Override
    public User getUserInfo(User userId) {
        System.out.println("dao요청들어옴");
    	User result = sqlSessionTemplate.selectOne("user_mapper.getUserInfo", userId);
    	System.out.println("다오결과" + result);
    	return result;

    }

    @Override
    public User getUserDetail(String userId) {
        try {
            return sqlSessionTemplate.selectOne("user_mapper.getUserDetail", userId);
        } catch (Exception e) {
            logger.error("Error fetching user detail: " + e.getMessage());
            throw new RuntimeException("Database error", e);
        }
    }

    @Override
    public List<User> getUserList() {
        try {
            return sqlSessionTemplate.selectList("user_mapper.getUserList");
        } catch (Exception e) {
            logger.error("Error fetching user list: " + e.getMessage());
            throw new RuntimeException("Database error", e);
        }
    }

    @Override
    public List<Map<String, Object>> getUserActivityLog(String userId) {
        try {
            return sqlSessionTemplate.selectList("user_mapper.getUserActivityLog", userId);
        } catch (Exception e) {
            logger.error("Error fetching activity log: " + e.getMessage());
            throw new RuntimeException("Database error", e);
        }
    }

    @Override
    public void updateUserRole(User user) {
        try {
            sqlSessionTemplate.update("user_mapper.updateUserRole", user);
        } catch (Exception e) {
            logger.error("Error updating user role: " + e.getMessage());
            throw new RuntimeException("Database error", e);
        }
    }

    @Override
    public void suspendUser(User user) {
        try {
            sqlSessionTemplate.update("user_mapper.suspendUser", user);
        } catch (Exception e) {
            logger.error("Error suspending user: " + e.getMessage());
            throw new RuntimeException("Database error", e);
        }
    }

    @Override
    public void deleteUser(String userId) {
        try {
            sqlSessionTemplate.delete("user_mapper.deleteUser", userId);
        } catch (Exception e) {
            logger.error("Error deleting user: " + e.getMessage());
            throw new RuntimeException("Database error", e);
        }
    }

    @Override
    public void updateUserInfo(User user) {
        try {
            sqlSessionTemplate.update("user_mapper.updateUserInfo", user);
        } catch (Exception e) {
            logger.error("Error updating user info: " + e.getMessage());
            throw new RuntimeException("Database error", e);
        }
    }
}