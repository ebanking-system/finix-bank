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

    /*
     * Reads the upload folder path from application.properties
     *
     * file.upload-dir=uploads/kyc
     */
    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * Saves the uploaded file inside:
     *
     * uploads/kyc/customer_1/
     *
     * and returns the saved file path.
     */
    public String saveFile(MultipartFile file, Long customerId) {

        try {

            // If no file is selected
            if (file == null || file.isEmpty()) {
                return null;
            }

            /*
             * Create customer folder if it doesn't exist.
             *
             * Example:
             * uploads/kyc/customer_5
             */
            Path customerFolder =
                    Paths.get(uploadDir, "customer_" + customerId);

            Files.createDirectories(customerFolder);

            /*
             * Generate unique filename.
             *
             * Example:
             *
             * 89d7c34e-pan.pdf
             */
            String fileName =
                    UUID.randomUUID() + "-" + file.getOriginalFilename();

            /*
             * Complete destination path.
             */
            Path destination =
                    customerFolder.resolve(fileName);

            /*
             * Copy uploaded file to destination.
             */
         // Copy uploaded file to destination
            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // Return file path to store in database
            return destination.toString().replace("\\", "/");

            } catch (IOException e) {

                throw new RuntimeException("Unable to save file.", e);
            }

    }

}