package com.grupo6.constrsw;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.grupo6.constrsw")
public class ConstrswApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConstrswApplication.class, args);
	}

}
