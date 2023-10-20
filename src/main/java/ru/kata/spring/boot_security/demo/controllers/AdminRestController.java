package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.RoleService;
import ru.kata.spring.boot_security.demo.services.UserService;

import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/admin/api/v1/")
public class AdminRestController {
    private final UserService userService;
    private final RoleService roleService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public AdminRestController(UserService userService, RoleService roleService, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userService = userService;
        this.roleService = roleService;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @GetMapping
    public ResponseEntity<Set<User>> listUsers() {
        return ResponseEntity.ok().body(userService.findAllUsers());
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        User user = userService.findUserByID(id);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot find user with that ID");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/user")
    public ResponseEntity<?> createUser(@ModelAttribute("user") User user, @ModelAttribute("role") String role) {
        user.setRolesSet(roleService.findByNameRole(role)
                .orElse(roleService.findByNameRole("ROLE_USER").get()));

        if (!userService.saveOrUpdateUser(user)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User is already exists");
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/user")
    public ResponseEntity<?> updateUser(@ModelAttribute User user, @RequestParam(value = "role") String role) {
        if (user != null) {
            user.setRolesSet(roleService.findByNameRole(role)
                    .orElse(roleService.findByNameRole("ROLE_USER").get()));

            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                user.setPassword(userService.findUserByID(user.getId()).getPassword());
            } else {
                user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            }
            if (!userService.saveOrUpdateUser(user)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User is already exists");
            }
        }
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/user")
    public ResponseEntity<?> deleteUser(@RequestParam(value = "id") Long id) {
        if (id != null) {
            if (userService.deleteUser(id)) {
                return ResponseEntity.ok(id);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot delete user with that ID");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You provided null instead of ID");
    }

}
