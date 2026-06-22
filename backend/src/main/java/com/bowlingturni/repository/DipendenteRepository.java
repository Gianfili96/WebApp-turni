package com.bowlingturni.repository;

import com.bowlingturni.entity.Dipendente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DipendenteRepository extends JpaRepository<Dipendente, Long> {

    // Tutti i dipendenti attivi
    List<Dipendente> findByAttivoTrue();

    // Dipendente collegato a un determinato user
    Optional<Dipendente> findByUserId(Long userId);
}