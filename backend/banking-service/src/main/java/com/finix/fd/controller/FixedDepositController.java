package com.finix.fd.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.account.entity.AccountType;
import com.finix.fd.dto.FDRequestDTO;
import com.finix.fd.service.FixedDepositService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/fd")
@RequiredArgsConstructor
public class FixedDepositController {

    private final FixedDepositService fixedDepositService;

    @PostMapping("/create")
    public ResponseEntity<?> createFD(@RequestBody FDRequestDTO request) {

        return fixedDepositService.createFD(request);
    }
    @GetMapping("/get/{accountType}")
    public ResponseEntity<?> getFDDetails(@PathVariable AccountType accountType) {
		return fixedDepositService.getFDDetails(accountType);
	}
	
}
