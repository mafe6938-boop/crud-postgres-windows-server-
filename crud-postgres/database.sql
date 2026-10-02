CREATE DATABASE crud_db;

-- Conéctate a crud_db antes de ejecutar lo siguiente:
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL
);
