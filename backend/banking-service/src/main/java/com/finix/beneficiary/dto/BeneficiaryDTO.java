package com.finix.beneficiary.dto;

import org.springframework.stereotype.Service;

import com.finix.customer.entity.Customer;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class BeneficiaryDTO {
	

    private String beneficiaryName;

    private String accountNumber;

    private String ifscCode;
}
