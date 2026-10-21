-- Schema iniziale (prima della V2, quindi senza la colonna dipendenti.reparto).
-- Ricavato dallo schema di produzione. Sui database già esistenti Flyway lo salta,
-- perché la versione 1 è registrata come baseline (spring.flyway.baseline-version=1).

CREATE TABLE users (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  nome          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  ruolo         ENUM('ADDETTO','RESPONSABILE') NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dipendenti (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  user_id    BIGINT       NOT NULL,
  nome       VARCHAR(100) NOT NULL,
  cognome    VARCHAR(100) NOT NULL,
  telefono   VARCHAR(20)  DEFAULT NULL,
  attivo     TINYINT(1)   NOT NULL DEFAULT '1',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY fk_dipendenti_user (user_id),
  KEY idx_dipendenti_attivo (attivo),
  CONSTRAINT fk_dipendenti_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE turni (
  id            BIGINT   NOT NULL AUTO_INCREMENT,
  dipendente_id BIGINT   NOT NULL,
  data_inizio   DATE     NOT NULL,
  ora_inizio    TIME     DEFAULT NULL,
  data_fine     DATE     NOT NULL,
  ora_fine      TIME     DEFAULT NULL,
  nota          TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo          ENUM('FERIE','MALATTIA','RIPOSO','TURNO') NOT NULL,
  PRIMARY KEY (id),
  KEY idx_turni_dipendente_data (dipendente_id, data_inizio),
  KEY idx_turni_data (data_inizio),
  CONSTRAINT fk_turni_dipendente FOREIGN KEY (dipendente_id) REFERENCES dipendenti (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_data_valida CHECK (data_fine >= data_inizio),
  CONSTRAINT chk_orario_valido CHECK ((data_fine > data_inizio) OR (ora_fine > ora_inizio))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
