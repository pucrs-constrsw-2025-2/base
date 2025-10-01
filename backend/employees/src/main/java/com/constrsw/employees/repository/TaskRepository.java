package com.constrsw.employees.repository;

import com.constrsw.employees.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    
    List<Task> findByEmployeeId(String employeeId);
    
    Page<Task> findByEmployeeId(String employeeId, Pageable pageable);
    
    Optional<Task> findByIdAndEmployeeId(String taskId, String employeeId);
    
    @Query("{'employeeId': ?0, 'description': {$regex: ?1, $options: 'i'}}")
    Page<Task> findByEmployeeIdAndDescriptionContaining(String employeeId, String description, Pageable pageable);
    
    @Query("{'employeeId': ?0, 'startDate': {$gte: ?1, $lte: ?2}}")
    Page<Task> findByEmployeeIdAndStartDateBetween(String employeeId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    @Query("{'employeeId': ?0, 'expectedEndDate': {$gte: ?1, $lte: ?2}}")
    Page<Task> findByEmployeeIdAndExpectedEndDateBetween(String employeeId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    @Query("{'employeeId': ?0, '$or': [{'startDate': {$gte: ?1, $lte: ?2}}, {'expectedEndDate': {$gte: ?1, $lte: ?2}}]}")
    Page<Task> findByEmployeeIdAndDateRange(String employeeId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    @Query("{'employeeId': ?0, '$or': [{'description': {$regex: ?1, $options: 'i'}}, {'startDate': {$gte: ?2, $lte: ?3}}, {'expectedEndDate': {$gte: ?2, $lte: ?3}}]}")
    Page<Task> findByEmployeeIdAndDescriptionOrDateRange(String employeeId, String description, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    void deleteByEmployeeId(String employeeId);
}






