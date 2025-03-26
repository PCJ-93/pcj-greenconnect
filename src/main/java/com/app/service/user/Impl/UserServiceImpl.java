package com.app.service.user.Impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.app.dao.user.SignupUserDAO;
import com.app.dto.user.User;
import com.app.service.user.UserService;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@Service
public class UserServiceImpl implements UserService {

	private static final Logger logger = LogManager.getLogger(UserServiceImpl.class);

	@Autowired
	SignupUserDAO userDAO;

	@Override
	public List<User> getUserList() {
		try {
			return userDAO.getUserList();
		} catch (Exception e) {
			logger.error("Error fetching user list: " + e.getMessage());
			throw new RuntimeException("Service error", e);
		}
	}

	@Override
	public void updateUserRole(User user) {
		try {
			userDAO.updateUserRole(user);
		} catch (Exception e) {
			logger.error("Error updating user role: " + e.getMessage());
			throw new RuntimeException("Service error", e);
		}
	}

	@Override
	public void suspendUser(String userId, String status) {
		try {
			User user = new User();
			user.setUserId(userId);
			user.setStatus(status);
			userDAO.suspendUser(user);
		} catch (Exception e) {
			logger.error("Error suspending user: " + e.getMessage());
			throw new RuntimeException("Service error", e);
		}
	}

	@Override
	public List<Map<String, Object>> getUserActivityLog(String userId) {
		try {
			return userDAO.getUserActivityLog(userId);
		} catch (Exception e) {
			logger.error("Error fetching activity log: " + e.getMessage());
			throw new RuntimeException("Service error", e);
		}
	}

	@Override
	public User getUserInfo(User userId) {
		System.out.println("서비스요청들어옴");
		User result = userDAO.getUserInfo(userId);
		System.out.println("asd"+result.toString());
		return result;
	}

	@Override
	public User getUserDetail(String userId) {
		try {
			return userDAO.getUserDetail(userId);
		} catch (Exception e) {
			logger.error("Error fetching user detail: " + e.getMessage());
			throw new RuntimeException("Service error", e);
		}
	}

	@Override
	public void deleteUser(String userId) {
		try {
			userDAO.deleteUser(userId);
		} catch (Exception e) {
			logger.error("Error deleting user: " + e.getMessage());
			throw new RuntimeException("Service error", e);
		}
	}

	@Override
	public void updateUserInfo(User user) {
		try {
			userDAO.updateUserInfo(user);
		} catch (Exception e) {
			logger.error("Error updating user info: " + e.getMessage());
			throw new RuntimeException("Service error", e);
		}
	}

}