# Esta base de datos, NO representa una empresa. Es un laboratorio de datos donde se practican diferentes operaciones CRUD.

CREATE DATABASE IF NOT EXISTS laboratorio_crud
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
USE laboratorio_crud;

DROP TABLE IF EXISTS equipos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipos (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)  NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    imagen VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO equipos (nombre, marca, modelo) VALUES
('Portátil','Lenovo', 'ThinkPad'),
('Monitor', 'LG','UltraWide'),
('Teclado','Logitech', 'K120')