package com.finix.transaction.specification;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.jpa.domain.Specification;

import com.finix.customer.entity.Customer;
import com.finix.transaction.entity.Transaction;
import com.finix.transaction.entity.TransactionStatus;

import jakarta.persistence.criteria.Predicate;

public class TransactionSpecification {

    /**
     * Returns only transactions where the logged-in customer
     * is either sender or receiver.
     */
    public static Specification<Transaction> belongsToCustomer(Customer customer) {

        return (root, query, cb) -> cb.or(

                cb.equal(
                        root.get("fromAccount")
                                .get("customer"),
                        customer),

                cb.equal(
                        root.get("toAccount")
                                .get("customer"),
                        customer)

        );

    }

    /**
     * Filter by transaction status
     */
    public static Specification<Transaction> hasStatus(TransactionStatus status) {

        return (root, query, cb) -> {

            if (status == null) {
                return cb.conjunction();
            }

            return cb.equal(root.get("status"), status);

        };

    }

    /**
     * Filter from date
     */
    public static Specification<Transaction> fromDate(LocalDate fromDate) {

        return (root, query, cb) -> {

            if (fromDate == null) {
                return cb.conjunction();
            }

            LocalDateTime start = fromDate.atStartOfDay();

            return cb.greaterThanOrEqualTo(
                    root.get("transactionDateTime"),
                    start);

        };

    }

    /**
     * Filter to date
     */
    public static Specification<Transaction> toDate(LocalDate toDate) {

        return (root, query, cb) -> {

            if (toDate == null) {
                return cb.conjunction();
            }

            LocalDateTime end = toDate.atTime(23, 59, 59);

            return cb.lessThanOrEqualTo(
                    root.get("transactionDateTime"),
                    end);

        };

    }

}