package com.constrsw.employees.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class RoomReferenceDto {
    
    @NotBlank(message = "Room ID is required")
    @Pattern(regexp = "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", 
             message = "Room ID must be a valid UUID")
    private String idRoom;
    
    // Constructors
    public RoomReferenceDto() {}
    
    public RoomReferenceDto(String idRoom) {
        this.idRoom = idRoom;
    }
    
    // Getters and Setters
    public String getIdRoom() {
        return idRoom;
    }
    
    public void setIdRoom(String idRoom) {
        this.idRoom = idRoom;
    }
}






