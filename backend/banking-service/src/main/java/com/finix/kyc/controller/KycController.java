package com.finix.kyc.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.kyc.dto.KycDocumentDto;
import com.finix.kyc.dto.KycDocumentDto2;
import com.finix.kyc.service.KycService;

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
}