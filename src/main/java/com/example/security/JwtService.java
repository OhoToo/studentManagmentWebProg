package com.example.security;

import com.example.dto.TokenResponse;
import com.example.entity.AppUser;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

@Service
public class JwtService {
    private final JwtEncoder encoder;
    private final NimbusJwtDecoder decoder;
    private final Duration accessTtl;
    private final Duration refreshTtl;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.access-ttl}") Duration accessTtl,
                      @Value("${app.jwt.refresh-ttl}") Duration refreshTtl) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) throw new IllegalArgumentException("app.jwt.secret must contain at least 32 UTF-8 bytes");
        if (accessTtl.isZero() || accessTtl.isNegative() || refreshTtl.compareTo(accessTtl) <= 0) {
            throw new IllegalArgumentException("JWT lifetimes must be positive; refresh must outlive access");
        }
        SecretKey key = new SecretKeySpec(bytes, "HmacSHA256");
        encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
        decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(new JwtTimestampValidator(Duration.ZERO));
        this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
    }

    public TokenResponse issueTokens(AppUser user) {
        String access = createToken(user, "access", accessTtl);
        String refresh = createToken(user, "refresh", refreshTtl);
        return new TokenResponse(access, refresh, "Bearer", accessTtl.toSeconds());
    }

    private String createToken(AppUser user, String type, Duration lifetime) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .subject(user.getId().toString())
            .issuedAt(now)
            .expiresAt(now.plus(lifetime))
            .claim("type", type)
            .claim("role", user.getRole().name())
            .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public Jwt readAccessToken(String token) { return readToken(token, "access"); }

    public Jwt readRefreshToken(String token) { return readToken(token, "refresh"); }

    private Jwt readToken(String token, String expectedType) {
        Jwt jwt = decoder.decode(token);
        if (!expectedType.equals(jwt.getClaimAsString("type"))) {
            throw new BadJwtException("Invalid token type");
        }
        if (jwt.getExpiresAt() == null || jwt.getSubject() == null) {
            throw new BadJwtException("Missing token claims");
        }
        return jwt;
    }
}
