package com.constrsw.employees.repository;

import com.constrsw.employees.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    
    Optional<Employee> findByContractNumber(Long contractNumber);
    
    boolean existsByContractNumber(Long contractNumber);
    
    @Query("{'$or': [{'contractNumber': {$regex: ?0, $options: 'i'}}, {'name': {$regex: ?0, $options: 'i'}}, {'organizationalUnit': {$regex: ?0, $options: 'i'}}]}")
    Page<Employee> findByContractNumberOrNameOrOrganizationalUnit(String searchTerm, Pageable pageable);
    
    @Query("{'contractNumber': {$regex: ?0, $options: 'i'}}")
    Page<Employee> findByContractNumberContaining(String contractNumber, Pageable pageable);
    
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    Page<Employee> findByNameContaining(String name, Pageable pageable);
    
    @Query("{'organizationalUnit': {$regex: ?0, $options: 'i'}}")
    Page<Employee> findByOrganizationalUnitContaining(String organizationalUnit, Pageable pageable);
}






