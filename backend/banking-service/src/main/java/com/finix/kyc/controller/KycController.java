package com.finix.kyc.controller;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;



import com.finix.kyc.dto.KycUploadRequest;
import com.finix.auth.dto.ApiResponse;
import com.finix.kyc.dto.KycDocumentDto;
import com.finix.kyc.dto.KycDocumentDto2;
import com.finix.kyc.dto.StatusDto;
import com.finix.kyc.entity.Status;
import com.finix.kyc.service.KycService;

import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @PatchMapping
    public ResponseEntity<?> updateKyc(@RequestBody KycDocumentDto2 request) {

        return kycService.updateKyc(request);
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse> updateStatus(@PathVariable Long  id , @RequestBody StatusDto statusDto) {
    	 
    	ApiResponse resp=kycService.updateStatus(id,statusDto);
    	if(resp.getStatus().equals("success")) {
    		return ResponseEntity.ok(resp);    		
    	}else {
    		return ResponseEntity.badRequest().body(resp);
    	}
    }
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> uploadKyc(
            @ModelAttribute KycUploadRequest request) {//@ModelAttribute- Read all form-data fields and automatically populate my DTO

        return kycService.uploadKyc(request);
    }
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getKycByStatus(@PathVariable Status status) {
		return kycService.getKycByStatus(status);
	}
}