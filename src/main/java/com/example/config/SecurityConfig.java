package com.example.config;

import com.example.security.JwtService;
import com.example.security.SecurityErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public JwtDecoder jwtDecoder(JwtService service) { return service::readAccessToken; }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityErrorHandler errors) throws Exception {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("role");
        roles.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);

        http.csrf(csrf -> csrf.disable());
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/refresh").permitAll()
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            .requestMatchers("/", "/index.html", "/html/**", "/css/**", "/js/**", "/favicon.png", "/error").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/requests", "/api/requests/**").hasAnyRole("ADMIN", "USER")
            .requestMatchers(HttpMethod.HEAD, "/api/requests", "/api/requests/**").hasAnyRole("ADMIN", "USER")
            .requestMatchers("/api/requests", "/api/requests/**").hasRole("ADMIN")
            .anyRequest().authenticated());
        http.exceptionHandling(ex -> ex.authenticationEntryPoint(errors).accessDeniedHandler(errors));
        http.oauth2ResourceServer(oauth -> oauth
            .jwt(jwt -> jwt.jwtAuthenticationConverter(converter))
            .authenticationEntryPoint(errors).accessDeniedHandler(errors));
        return http.build();
    }
}
