const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
  cb(ok ? null : new Error('Formato no permitido (solo jpg/png/webp)'), ok);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } });
