package com.bowlingturni.dto;

import com.bowlingturni.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private Long userId;
    private String nome;
    private String email;
    private Long dipendenteId;
    private User.Ruolo ruolo;
}