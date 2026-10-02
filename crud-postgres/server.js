const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "crud_db",
    password: "TU_CONTRASEÑA",
    port: 5432
});

app.get("/api/usuarios", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM usuarios ORDER BY id"
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

app.post("/api/usuarios", async (req, res) => {
    try {
        const { nombre, email } = req.body;
        const resultado = await pool.query(
            `INSERT INTO usuarios (nombre, email)
             VALUES ($1, $2)
             RETURNING *`,
            [nombre, email]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear usuario" });
    }
});

app.put("/api/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email } = req.body;
        const resultado = await pool.query(
            `UPDATE usuarios
             SET nombre = $1, email = $2
             WHERE id = $3
             RETURNING *`,
            [nombre, email, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
});

app.delete("/api/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query(
            "DELETE FROM usuarios WHERE id = $1 RETURNING *",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Usuario eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
