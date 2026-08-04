package com.finix.kyc.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KycUploadRequest {

//    // Aadhaar number entered by customer
//    @NotBlank(message = "Aadhaar Number is required")
//    private String aadharNum;
//
//    // PAN number entered by customer
//    @NotBlank(message = "PAN Number is required")
//    private String panNum;

    // Uploaded Aadhaar Card
    private MultipartFile aadharFile;

    // Uploaded PAN Card
    private MultipartFile panFile;

    // Uploaded Selfie
    private MultipartFile selfie;
}