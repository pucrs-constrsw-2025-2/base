package com.constrsw.employees;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class EmployeesApiApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(EmployeesApiApplication.class, args);
    }
}






