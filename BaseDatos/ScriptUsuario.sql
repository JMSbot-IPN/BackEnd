-- Creacion de BaseUsuario
CREATE DATABASE IF NOT EXISTS BaseUsuario;
USE BaseUsuario;

-- Creacion de la tabla
CREATE TABLE IF NOT EXISTS Usuarios (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE, 
    ImagenPerfil VARCHAR(255),
    Password VARCHAR(255) NOT NULL,
    FechaRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

