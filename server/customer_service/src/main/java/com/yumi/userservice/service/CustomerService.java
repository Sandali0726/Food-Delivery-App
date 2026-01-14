package com.yumi.userservice.service;

import com.yumi.userservice.dto.Profile.ProfileDto;
import com.yumi.userservice.dto.Profile.UserDetailsDto;
import com.yumi.userservice.mapper.CustomerMapper;
import com.yumi.userservice.model.Customer;
import com.yumi.userservice.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {
    @Autowired
    private  CustomerRepository customerRepository;
    @Autowired
    private  CustomerMapper customerMapper;

    // ================= GET PROFILE DTO =================
    public UserDetailsDto getUserDetails(String email) {
        Customer customer = customerRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return customerMapper.toDto(customer);
    }

    // ================= COMPLETE PROFILE =================
    public UserDetailsDto completeProfile(String email, ProfileDto profileDto) {

        // Map fields from ProfileDto to entity
        Customer customer = customerMapper.toEntity(profileDto);
        customer.setEmail(email); // Ensure email is set

        Customer saved = customerRepository.save(customer);
        return customerMapper.toDto(saved);
    }

    // ================= UPDATE PROFILE =================
    public UserDetailsDto updateProfile(String email, ProfileDto profileDto) {
        Customer customer = customerRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // MapStruct automatically updates only non-null fields
        customerMapper.updateCustomerFromProfileDto(profileDto, customer);

        Customer saved = customerRepository.save(customer);
        return customerMapper.toDto(saved);
    }
}
