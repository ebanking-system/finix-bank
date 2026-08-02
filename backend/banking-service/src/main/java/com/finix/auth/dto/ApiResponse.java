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
	private Object data;

	public ApiResponse(String status, Object data) {
		super();
		this.status = status;
		this.data = data;
		this.timeStamp = LocalDateTime.now();
	}

}