package com.constrsw.employees.dto;

import java.util.List;

public class EmployeeListResponse {
    
    private List<EmployeeResponse> employees;
    private long total;
    private int page;
    private int limit;
    
    // Constructors
    public EmployeeListResponse() {}
    
    public EmployeeListResponse(List<EmployeeResponse> employees, long total, int page, int limit) {
        this.employees = employees;
        this.total = total;
        this.page = page;
        this.limit = limit;
    }
    
    // Getters and Setters
    public List<EmployeeResponse> getEmployees() {
        return employees;
    }
    
    public void setEmployees(List<EmployeeResponse> employees) {
        this.employees = employees;
    }
    
    public long getTotal() {
        return total;
    }
    
    public void setTotal(long total) {
        this.total = total;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getLimit() {
        return limit;
    }
    
    public void setLimit(int limit) {
        this.limit = limit;
    }
}






