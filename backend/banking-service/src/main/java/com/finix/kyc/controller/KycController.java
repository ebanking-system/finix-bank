package com.finix.kyc.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.finix.auth.dto.ApiResponse;
import com.finix.kyc.dto.KycDocumentDto2;
import com.finix.kyc.dto.KycUploadRequest;
import com.finix.kyc.dto.StatusDto;
import com.finix.kyc.entity.Status;
import com.finix.kyc.service.KycService;

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
    public ResponseEntity<ApiResponse> updateStatus(@PathVariable Long id, @RequestBody StatusDto statusDto) {
    	ApiResponse resp = kycService.updateStatus(id, statusDto);
    	if (resp.getStatus().equals("success")) {
    		return ResponseEntity.ok(resp);    		
    	} else {
    		return ResponseEntity.badRequest().body(resp);
    	}
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> uploadKyc(@ModelAttribute KycUploadRequest request) {
        return kycService.uploadKyc(request);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getKycByStatus(@PathVariable Status status) {
		return kycService.getKycByStatus(status);
	}

    @GetMapping("/files/{customerId}/{fileName}")
    public ResponseEntity<Resource> getKycFile(
            @PathVariable Long customerId,
            @PathVariable String fileName) {
        try {
            Path filePath = Paths.get("uploads", "kyc", "customer_" + customerId, fileName);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}