const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const equiposRoutes = require('./routes/equipos.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'Laboratorio CRUD API funcional'});
});

app.use('/api/auth', authRoutes);
app.use('/api/equipos', equiposRoutes);

app.use((req, res) => {
    res.status(404).json({
        ok: false,
        message: ''
    });
});

app.use(errorHandler);

module.exports = app;