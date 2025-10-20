package com.constrsw.employees.config;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.constrsw.employees.repository")
public class MongoConfig extends AbstractMongoClientConfiguration {
    
    @Value("${spring.data.mongodb.host}")
    private String host;
    
    @Value("${spring.data.mongodb.port}")
    private int port;
    
    @Value("${spring.data.mongodb.database}")
    private String database;
    
    @Value("${spring.data.mongodb.username}")
    private String username;
    
    @Value("${spring.data.mongodb.password}")
    private String password;
    
    // Prefer env var MONGODB_AUTH_SOURCE; fallback to Spring property; default to "employees"
    @Value("${MONGODB_AUTH_SOURCE:${spring.data.mongodb.authentication-database:employees}}")
    private String authSource;
    
    @Override
    protected String getDatabaseName() {
        return database;
    }
    
    @Bean
    @Override
    public MongoClient mongoClient() {
        // Build explicit connection string to ensure host and authSource from properties are respected
        StringBuilder uri = new StringBuilder();
        uri.append("mongodb://");
        if (username != null && !username.isEmpty()) {
            uri.append(username);
            if (password != null && !password.isEmpty()) {
                uri.append(":").append(password);
            }
            uri.append("@");
        }
        uri.append(host).append(":" ).append(port).append("/").append(database);
        if (authSource != null && !authSource.isEmpty()) {
            uri.append("?authSource=").append(authSource);
        }
        return MongoClients.create(new ConnectionString(uri.toString()));
    }
}






