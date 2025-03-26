package com.app.dto.user;

import java.util.Date;

import lombok.Data;

@Data
public class User {
	
	private String userId;
	private String username;
	private String nickname;
	private String password;
	private String email;
	private String tel;
	private String jumin;
	private String userType;
	
	private String role;
	private String status;
	private Date signup;
	private String profileImage;
	
}
