package com.finix.beneficiary.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class BeneficiaryDTO {

    private Long beneficiaryId;

    private String beneficiaryName;

    private String accountNumber;

    private String ifscCode;
}
