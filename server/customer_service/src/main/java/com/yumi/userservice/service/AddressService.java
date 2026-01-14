package com.yumi.userservice.service;

import com.yumi.userservice.dto.AddressDto.AddressRequestDto;
import com.yumi.userservice.dto.AddressDto.AddressResponseDto;
import com.yumi.userservice.mapper.AddressMapper;
import com.yumi.userservice.model.Address;
import com.yumi.userservice.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AddressService {
    @Autowired
    private  AddressRepository addressRepository;
    @Autowired
    private  AddressMapper addressMapper;

    public List<AddressResponseDto> getByEmail(String email) {
        return addressRepository.findAllByAuth_EmailOrderByIdDesc(email)
                .stream()
                .map(addressMapper::toDto)
                .toList();
    }

    public AddressResponseDto save(String email, AddressRequestDto dto) {
        Address address = addressMapper.toEntity(dto);
        address.setEmail(email);

        Address saved = addressRepository.save(address);
        return addressMapper.toDto(saved);
    }

    public void delete(Long id) {
        addressRepository.deleteById(id);
    }
}
