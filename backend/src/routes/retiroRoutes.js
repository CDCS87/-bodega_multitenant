// backend/src/routes/retiros.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const retiroController = require('../controllers/retiroController');

router.put('/:id/ingresar', upload.array('fotos', 10), retiroController.ingresar);

module.exports = router;


