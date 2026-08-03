package com.finix.kyc.service;

import org.springframework.http.ResponseEntity;

import com.finix.kyc.dto.KycDocumentDto;
import com.finix.kyc.dto.KycDocumentDto2;

public interface KycService {

	ResponseEntity<?> updateKyc(KycDocumentDto2 request);

}
