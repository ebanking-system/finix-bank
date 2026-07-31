package com.finix.auth.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//ApiResp DTO(status :  failure , timestamp , message)
@Getter
@Setter
@NoArgsConstructor
public class ApiResponse {
	private String status;
	private LocalDateTime timeStamp;
	private String message;

	public ApiResponse(String status, String message) {
		super();
		this.status = status;
		this.message = message;
		this.timeStamp = LocalDateTime.now();
	}

}