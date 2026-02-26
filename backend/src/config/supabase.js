const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

/**
 * Sube un archivo de imagen a Supabase Storage.
 * @param {Buffer} buffer - Buffer del archivo
 * @param {string} mimeType - Tipo MIME (image/jpeg, etc.)
 * @param {string} folder - Carpeta dentro del bucket ('products' | 'categories')
 * @param {string|number} entityId - ID del producto/categoría (para nombre único)
 * @returns {Promise<string|null>} URL pública, o null si falla
 */
async function uploadImage(buffer, mimeType, folder, entityId) {
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const filename = `${folder}/${entityId}_${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filename, buffer, {
            contentType: mimeType,
            upsert: true
        });

    if (error) {
        console.error(`Error subiendo imagen a Storage (${filename}):`, error.message);
        return null;
    }

    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filename);

    return data.publicUrl;
}

/**
 * Elimina una imagen de Storage dado su URL pública.
 * @param {string} imageUrl - URL pública de la imagen
 */
async function deleteImage(imageUrl) {
    if (!imageUrl || !imageUrl.includes(STORAGE_BUCKET)) return;

    // Extraer el path relativo del bucket de la URL
    const bucketPrefix = `/object/public/${STORAGE_BUCKET}/`;
    const idx = imageUrl.indexOf(bucketPrefix);
    if (idx === -1) return;

    const storagePath = imageUrl.substring(idx + bucketPrefix.length);
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    if (error) console.error('Error eliminando imagen de Storage:', error.message);
}

module.exports = { supabase, uploadImage, deleteImage };
