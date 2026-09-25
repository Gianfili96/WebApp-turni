-- Prima modifica la colonna accettando entrambi i valori temporaneamente
ALTER TABLE dipendenti MODIFY COLUMN reparto ENUM('PULIZIE', 'ADDETTI_SERVIZI', 'CASSA', 'MECCANICO') NOT NULL DEFAULT 'ADDETTI_SERVIZI';

-- Poi aggiorna i dati
UPDATE dipendenti SET reparto = 'ADDETTI_SERVIZI' WHERE reparto = 'PULIZIE';

-- Infine rimuovi il vecchio valore dall'ENUM
ALTER TABLE dipendenti MODIFY COLUMN reparto ENUM('ADDETTI_SERVIZI', 'CASSA', 'MECCANICO') NOT NULL DEFAULT 'ADDETTI_SERVIZI';