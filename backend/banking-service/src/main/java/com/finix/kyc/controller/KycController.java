package com.finix.kyc.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.kyc.dto.KycDocumentDto;
import com.finix.kyc.dto.KycDocumentDto2;
import com.finix.kyc.service.KycService;

import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @PatchMapping
    public ResponseEntity<?> updateKyc(@RequestBody KycDocumentDto2 request) {

        return kycService.updateKyc(request);
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long  id) {
    	 return ResponseEntity.ok(
    			 kycService.updateStatus(id));
    }
}