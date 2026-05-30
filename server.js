const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Middleware para procesar JSON
app.use(express.json());

// 1. CONFIGURACIÓN DE LA BASE DE DATOS

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Error al conectar con la base de datos:', err.message);
    else console.log('Conectado a la base de datos SQLite.');
});

// Crear tablas si no existen
db.serialize(() => {
    // Entidad Usuario
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Entidad Tarea
    db.run(`CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT CHECK(estado IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA')) DEFAULT 'PENDIENTE',
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )`);
});


// 2. ENDPOINTS (REQUERIMIENTOS FUNCIONALES)

// 1. Crear usuario (POST /usuarios)
app.post('/usuarios', (req, res) => {
    const { nombre, email } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ error: 'El nombre y el email son obligatorios.' });
    }

    const query = `INSERT INTO usuarios (nombre, email) VALUES (?, ?)`;
    db.run(query, [nombre, email], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(409).json({ error: 'El email ya está registrado.' });
            }
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        res.status(201).json({ id: this.lastID, nombre, email, mensaje: 'Usuario creado con éxito' });
    });
});

// 2. Registrar tarea (POST /tareas)
app.post('/tareas', (req, res) => {
    const { usuario_id, titulo, descripcion } = req.body;

    if (!usuario_id || !titulo) {
        return res.status(400).json({ error: 'El usuario_id y el titulo son obligatorios.' });
    }

    // Validar que el usuario exista
    db.get(`SELECT id FROM usuarios WHERE id = ?`, [usuario_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
        if (!row) return res.status(404).json({ error: 'El usuario no existe.' });

        const query = `INSERT INTO tareas (usuario_id, titulo, descripcion, estado) VALUES (?, ?, ?, 'PENDIENTE')`;
        db.run(query, [usuario_id, titulo, descripcion], function(err) {
            if (err) return res.status(500).json({ error: 'Error al crear la tarea.' });
            res.status(201).json({ id: this.lastID, titulo, estado: 'PENDIENTE', mensaje: 'Tarea registrada' });
        });
    });
});

// 3. Actualizar estado de tarea (PUT /tareas/:id/estado)
app.put('/tareas/:id/estado', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const estadosValidos = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA'];

    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido. Debe ser PENDIENTE, EN_PROCESO o COMPLETADA.' });
    }

    // Verificar existencia y actualizar
    db.run(`UPDATE tareas SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?`, 
        [estado, id], 
        function(err) {
            if (err) return res.status(500).json({ error: 'Error al actualizar.' });
            if (this.changes === 0) return res.status(404).json({ error: 'La tarea no existe.' });
            res.json({ mensaje: 'Estado de la tarea actualizado exitosamente.' });
        }
    );
});

// 4. Consultar tareas por usuario (GET /usuarios/:id/tareas)
app.get('/usuarios/:id/tareas', (req, res) => {
    const { id } = req.params;
    const { estado, desde, hasta } = req.query;

    let query = `SELECT * FROM tareas WHERE usuario_id = ?`;
    const params = [id];

    if (estado) {
        query += ` AND estado = ?`;
        params.push(estado);
    }
    if (desde) {
        query += ` AND date(fecha_creacion) >= date(?)`;
        params.push(desde);
    }
    if (hasta) {
        query += ` AND date(fecha_creacion) <= date(?)`;
        params.push(hasta);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al consultar las tareas.' });
        res.json({ tareas: rows });
    });
});

// 5. Eliminar tarea (DELETE /tareas/:id)
// Decisión: Eliminación física para mantener simplicidad.
app.delete('/tareas/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM tareas WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: 'Error al eliminar.' });
        if (this.changes === 0) return res.status(404).json({ error: 'La tarea no existe.' });
        res.json({ mensaje: 'Tarea eliminada físicamente de forma exitosa.' });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
});