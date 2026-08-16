package com.finix.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileStorageUtil {

    @Value("${file.upload-dir:uploads/kyc}")
    private String uploadDir;

    /**
     * Saves KYC documents inside uploads/kyc/customer_{id}/
     */
    public String saveFile(MultipartFile file, Long customerId) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            Path customerFolder = Paths.get(uploadDir, "customer_" + customerId);
            Files.createDirectories(customerFolder);

            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path destination = customerFolder.resolve(fileName);

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return destination.toString().replace("\\", "/");
        } catch (IOException e) {
            throw new RuntimeException("Unable to save file.", e);
        }
    }

    /**
     * Saves Employee Profile Photos inside uploads/profiles/employee_{id}/
     */
    public String saveEmployeePhoto(MultipartFile file, Long employeeId) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            Path folder = Paths.get("uploads/profiles", "employee_" + employeeId);
            Files.createDirectories(folder);

            String fileName = "avatar-" + UUID.randomUUID().toString().substring(0, 8) + "-" + file.getOriginalFilename();
            Path destination = folder.resolve(fileName);

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return destination.toString().replace("\\", "/");
        } catch (IOException e) {
            throw new RuntimeException("Unable to save profile photo.", e);
        }
    }
}