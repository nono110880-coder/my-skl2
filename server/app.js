const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const sklRoutes = require('./routes/sklRoutes');

const app = express();
app.set('trust proxy', true);

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // Kita tambahkan izin khusus untuk 'ngrok-skip-browser-warning' di sini:
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
// -----------------------------------

app.use(express.json({ limit: '10mb' }));

// --- SECURITY MIDDLEWARE ---
// Mencegah akses ke file sensitif backend dari luar
app.use((req, res, next) => {
    const url = req.path.toLowerCase();
    if (url.startsWith('/server') || url.includes('.env') || url.includes('.git')) {
        return res.status(403).send('Forbidden: Akses ditolak ke direktori/file sensitif.');
    }
    next();
});

// --- SERVE STATIC FILES ---
// Menyajikan file index.html, login.html, app.js dari folder utama
app.use(express.static(path.join(__dirname, '../')));

app.use('/api/skl', sklRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server berjalan di port ${PORT} dan siap diakses via jaringan lokal`);
});
