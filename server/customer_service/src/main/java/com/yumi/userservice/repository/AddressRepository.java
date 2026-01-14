package com.yumi.userservice.repository;

import com.yumi.userservice.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {

    // Find all addresses by auth email, ordered by ID descending
    List<Address> findAllByAuth_EmailOrderByIdDesc(String email);
}
