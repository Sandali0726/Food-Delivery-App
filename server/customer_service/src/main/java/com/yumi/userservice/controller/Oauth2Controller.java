package com.yumi.userservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oauth2")
public class Oauth2Controller {

    @GetMapping("/success")
    public String oauthSuccess() {
        return "OAuth2 login successful";
    }
}