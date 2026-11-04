package com.example.dto;

public class TokenResponse {
    public String accessToken;
    public String refreshToken;
    public String tokenType;
    public long expiresIn;

    public TokenResponse(String accessToken, String refreshToken, String tokenType, long expiresIn) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
    }
}
