package com.grupo6.constrsw.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    
    @GetMapping("/test")
    public String test() {
        return "API funcionando!";
    }
    
    @GetMapping("/hello")
    public String hello() {
        return "Hello World!";
    }
}
