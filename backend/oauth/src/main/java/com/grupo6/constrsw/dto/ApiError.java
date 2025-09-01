package com.grupo6.constrsw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "DTO para representar um erro da API")
public class ApiError {
    
    @Schema(description = "Código do erro", example = "OA-400")
    private String error_code;

    @Schema(description = "Descrição do erro", example = "Erro na estrutura da chamada")
    private String error_description;

    @Schema(description = "Fonte do erro", example = "OAuthAPI")
    private String error_source;

    @Schema(description = "Stack de erro")
    private List<Object> error_stack;
    
    public ApiError() {}
    
    public ApiError(String error_code, String error_description, String error_source, List<Object> error_stack) {
        this.error_code = error_code;
        this.error_description = error_description;
        this.error_source = error_source;
        this.error_stack = error_stack;
    }
    
    public String getError_code() { return error_code; }
    public void setError_code(String error_code) { this.error_code = error_code; }
    
    public String getError_description() { return error_description; }
    public void setError_description(String error_description) { this.error_description = error_description; }
    
    public String getError_source() { return error_source; }
    public void setError_source(String error_source) { this.error_source = error_source; }
    
    public List<Object> getError_stack() { return error_stack; }
    public void setError_stack(List<Object> error_stack) { this.error_stack = error_stack; }
}
