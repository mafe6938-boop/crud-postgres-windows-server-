const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

// ===============================
// CONFIGURACIÓN POSTGRESQL
// ===============================

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "crud_postgres",
    password: "12345678",
    port: 5432
});

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// CREAR TABLAS
// ===============================

async function crearTablas() {
    try {

        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                precio DECIMAL(10,2) NOT NULL,
                cantidad INTEGER NOT NULL
            )
        `);

        // Crear usuario administrador si no existe
        const usuarioExiste = await pool.query(
            "SELECT * FROM usuarios WHERE usuario = $1",
            ["admin"]
        );

        if (usuarioExiste.rows.length === 0) {

            const passwordHash = await bcrypt.hash("123456", 10);

            await pool.query(
                "INSERT INTO usuarios (usuario, password) VALUES ($1, $2)",
                ["admin", passwordHash]
            );

            console.log("Usuario administrador creado");
            console.log("Usuario: admin");
            console.log("Contraseña: 123456");
        }

        console.log("Tablas verificadas correctamente");

    } catch (error) {
        console.error("Error creando tablas:", error.message);
    }
}

// ===============================
// LOGIN
// ===============================

app.post("/api/login", async (req, res) => {

    try {

        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({
                mensaje: "Debes ingresar usuario y contraseña"
            });
        }

        const resultado = await pool.query(
            "SELECT * FROM usuarios WHERE usuario = $1",
            [usuario]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                mensaje: "Usuario o contraseña incorrectos"
            });
        }

        const usuarioBD = resultado.rows[0];

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuarioBD.password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: "Usuario o contraseña incorrectos"
            });
        }

        res.json({
            mensaje: "Login correcto",
            usuario: usuarioBD.usuario
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error en el servidor"
        });
    }
});

// ===============================
// OBTENER PRODUCTOS
// ===============================

app.get("/api/productos", async (req, res) => {

    try {

        const resultado = await pool.query(
            "SELECT * FROM productos ORDER BY id"
        );

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener productos"
        });
    }
});

// ===============================
// OBTENER PRODUCTO POR ID
// ===============================

app.get("/api/productos/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM productos WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener producto"
        });
    }
});

// ===============================
// CREAR PRODUCTO
// ===============================

app.post("/api/productos", async (req, res) => {

    try {

        const { nombre, precio, cantidad } = req.body;

        if (!nombre || precio === undefined || cantidad === undefined) {

            return res.status(400).json({
                mensaje: "Todos los campos son obligatorios"
            });
        }

        const resultado = await pool.query(
            `
            INSERT INTO productos
            (nombre, precio, cantidad)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [nombre, precio, cantidad]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al crear producto"
        });
    }
});

// ===============================
// ACTUALIZAR PRODUCTO
// ===============================

app.put("/api/productos/:id", async (req, res) => {

    try {

        const { id } = req.params;
        const { nombre, precio, cantidad } = req.body;

        const resultado = await pool.query(
            `
            UPDATE productos
            SET nombre = $1,
                precio = $2,
                cantidad = $3
            WHERE id = $4
            RETURNING *
            `,
            [nombre, precio, cantidad, id]
        );

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al actualizar producto"
        });
    }
});

// ===============================
// ELIMINAR PRODUCTO
// ===============================

app.delete("/api/productos/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const resultado = await pool.query(
            "DELETE FROM productos WHERE id = $1 RETURNING *",
            [id]
        );

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json({
            mensaje: "Producto eliminado correctamente"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al eliminar producto"
        });
    }
});

// ===============================
// INICIO
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ===============================
// INICIAR SERVIDOR
// ===============================

async function iniciarServidor() {

    await crearTablas();

    app.listen(PORT, "0.0.0.0", () => {
    console.log("-----------------------------------");
    console.log("Servidor ejecutándose correctamente");
    console.log(`Puerto: ${PORT}`);
    console.log("Acceso local: http://localhost:3000");
    console.log("Acceso por red: http://IP_DEL_SERVIDOR:3000");
    console.log("-----------------------------------");
});
}

iniciarServidor();