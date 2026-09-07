const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { getAllSkl, createSkl, cetakSkl, deleteSkl, updateSkl, loginAdmin, uploadTranskrip, cetakTranskrip, cetakBerkas } = require('../controllers/sklController');

// Rute Publik
router.post('/login', loginAdmin);
router.get('/', getAllSkl);
router.get('/cetak/:id', cetakSkl);
router.get('/cetak-transkrip/:id', cetakTranskrip);
router.get('/cetak-berkas/:id', cetakBerkas);

// Rute Terlindungi (Membutuhkan Token)
router.post('/', authMiddleware, createSkl); 
router.delete('/:id', authMiddleware, deleteSkl);
router.put('/:id', authMiddleware, updateSkl);
router.post('/upload-transkrip/:id', authMiddleware, upload.single('transkrip'), uploadTranskrip);

module.exports = router;