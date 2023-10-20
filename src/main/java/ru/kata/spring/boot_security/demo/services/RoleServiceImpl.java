package ru.kata.spring.boot_security.demo.services;

import org.springframework.stereotype.Service;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.repositories.RoleRepository;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;


@Service
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public Set<Role> getAllRoles() {
        Set<Role> set = new HashSet<>();
        Iterable<Role> iterable = roleRepository.findAll();
        iterable.forEach(set::add);
        return set;
    }

    @Override
    public void saveOrUpdateRole(Role role) {
        roleRepository.save(role);
    }

    @Override
    public Optional<Role> findByNameRole(String email) {
        Role role = roleRepository.findByName(email);
        if (role != null) {
            return Optional.of(role);
        }
        return Optional.empty();
    }
}
