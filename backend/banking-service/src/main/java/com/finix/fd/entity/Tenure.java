package com.finix.fd.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Tenure {

    HALF_YEAR(6),ONE_YEAR(12),TWO_YEARS(24),THREE_YEARS(36),FOUR_YEARS(48),FIVE_YEARS(50);
    private final int months;
}