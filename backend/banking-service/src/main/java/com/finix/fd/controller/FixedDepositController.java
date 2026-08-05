package com.finix.fd.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.fd.dto.FDRequestDTO;
import com.finix.fd.service.FixedDepositService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/fd")
@RequiredArgsConstructor
public class FixedDepositController {

    private final FixedDepositService fixedDepositService;

    @PostMapping
    public ResponseEntity<?> createFD(@RequestBody FDRequestDTO request) {

        return fixedDepositService.createFD(request);
    }
}
