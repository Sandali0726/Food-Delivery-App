package com.yumi.userservice.service.grpc;

import com.example.grpc.customer.CustomerDetailsRequest;
import com.example.grpc.customer.CustomerDetailsResponse;
import com.example.grpc.customer.CustomerServiceGrpc;
import com.yumi.userservice.dto.Profile.UserDetailsDto;
import com.yumi.userservice.mapper.CustomerMapper;
import com.yumi.userservice.model.Customer;
import com.yumi.userservice.repository.CustomerRepository;
import io.grpc.stub.StreamObserver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.grpc.server.service.GrpcService;

@GrpcService
public class CustomerDetailsImpl extends CustomerServiceGrpc.CustomerServiceImplBase{
    @Autowired
    private CustomerRepository customerRepository; // Your repository to fetch customer data
    @Autowired
    private CustomerMapper customerMapper; // Mapper to convert entity to DTO
    @Override
    public void getCustomerDetails(CustomerDetailsRequest request,
                                   StreamObserver<CustomerDetailsResponse> responseObserver) {

        String email = request.getCustomerEmail();

        // 1. Fetch customer data from database
        Customer customer = customerRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        UserDetailsDto dto = customerMapper.toDto(customer);

        //gRPC response
        CustomerDetailsResponse response =
                CustomerDetailsResponse.newBuilder()
                        .setCustomerName(
                                dto.getFirst_name() + " " + dto.getLast_name()
                        )
                        .setCustomerPhone(dto.getPhone_number())
                        .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();

    }
}
