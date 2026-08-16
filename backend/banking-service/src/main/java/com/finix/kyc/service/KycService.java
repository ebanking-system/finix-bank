package com.finix.kyc.service;

import org.springframework.http.ResponseEntity;

import com.finix.auth.dto.ApiResponse;
import com.finix.kyc.dto.KycDocumentDto;
import com.finix.kyc.dto.KycDocumentDto2;
import com.finix.kyc.dto.KycUploadRequest;
import com.finix.kyc.dto.StatusDto;
import com.finix.kyc.entity.Status;

public interface KycService {

	ResponseEntity<?> updateKyc(KycDocumentDto2 request);

	ApiResponse updateStatus(Long id , StatusDto status);
	public ResponseEntity<ApiResponse> uploadKyc(KycUploadRequest request);

	ResponseEntity<?> getKycByStatus(Status status);

	ResponseEntity<?> getMyKyc();

	ResponseEntity<?> getAllKyc();

}
