package com.mouaad.vellox.dtos;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class LiveMessagePayload {
    private  String content;
    private UUID targetId;
}
