package com.constrsw.employees.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.Objects;

public class RoomReference {
    
    @NotBlank(message = "Room ID is required")
    @Pattern(regexp = "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", 
             message = "Room ID must be a valid UUID")
    private String idRoom;
    
    // Constructors
    public RoomReference() {}
    
    public RoomReference(String idRoom) {
        this.idRoom = idRoom;
    }
    
    // Getters and Setters
    public String getIdRoom() {
        return idRoom;
    }
    
    public void setIdRoom(String idRoom) {
        this.idRoom = idRoom;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RoomReference that = (RoomReference) o;
        return Objects.equals(idRoom, that.idRoom);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(idRoom);
    }
    
    @Override
    public String toString() {
        return "RoomReference{" +
                "idRoom='" + idRoom + '\'' +
                '}';
    }
}




