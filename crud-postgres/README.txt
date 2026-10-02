CRUD PostgreSQL + Node.js + Express
===================================

1. Instala dependencias:
   npm install

2. En PostgreSQL crea la base de datos crud_db y la tabla:
   CREATE DATABASE crud_db;

   Luego, conectado a crud_db:
   CREATE TABLE usuarios (
       id SERIAL PRIMARY KEY,
       nombre VARCHAR(100) NOT NULL,
       email VARCHAR(150) NOT NULL
   );

3. Abre server.js y cambia:
   password: "TU_CONTRASEÑA"

   por la contraseña de tu usuario postgres.

4. Inicia:
   node server.js

5. En el Windows Server:
   http://localhost:3000

6. Para entrar desde otra PC, abre el puerto 3000 en el Firewall
   de Windows Server (PowerShell como administrador):
   New-NetFirewallRule -DisplayName "NodeJS Puerto 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

7. Mira la IP:
   ipconfig

8. Desde otra PC:
   http://IP_DEL_SERVIDOR:3000

Ejemplo:
   http://192.168.1.100:3000
