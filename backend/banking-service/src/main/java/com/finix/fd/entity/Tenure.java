package com.finix.fd.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Tenure {

    ONE_YEAR(1),TWO_YEARS(2),THREE_YEARS(3),FOUR_YEARS(4),FIVE_YEARS(5);
    private final int months;
}