const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta uploads existe
// Usar memoria en lugar de disco para persistencia en DB (Render)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG y WEBP.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB máximo para no llenar la DB
    }
});

module.exports = upload;
