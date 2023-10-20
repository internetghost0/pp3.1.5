package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.RoleService;
import ru.kata.spring.boot_security.demo.services.UserService;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
public class AdminController {
    private final UserService userService;
    private final RoleService roleService;
    @Autowired
    public AdminController(UserService userService, RoleService roleService, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping()
    public String printUsers(ModelMap model, @AuthenticationPrincipal User thisUser) {
        var users = userService.findAllUsers();
        model.addAttribute("users", users);
        model.addAttribute("thisUser", thisUser);
        model.addAttribute("emptyUser", new User());
        List<String> allRoles = roleService.getAllRoles().stream().map(Role::toString).map(x -> x.replace("ROLE_", "")).collect(Collectors.toList());
        model.addAttribute("allRoles", allRoles);

        return "admin_panel";
    }
}

