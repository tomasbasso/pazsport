-- =====================================================
-- PazSport - Esquema para Supabase con Storage
-- Las imágenes se guardan como URLs de Supabase Storage,
-- NO como Base64 en la base de datos.
-- Proyecto: bxrodymbbqzzlhtfamuy (pazsport26@gmail.com)
-- =====================================================

-- Tabla: Categories
CREATE TABLE IF NOT EXISTS "Categories" (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NULL,  -- URL pública de Supabase Storage
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla: Products
CREATE TABLE IF NOT EXISTS "Products" (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    image TEXT NULL,  -- URL pública: https://<project>.supabase.co/storage/v1/object/public/product-images/<filename>
    "categoryId" INT NOT NULL,
    sizes TEXT NULL,  -- JSON array: ["S","M","L","XL"]
    colors TEXT NULL, -- JSON array: ["#FF0000","Azul"]
    stock INT NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_category FOREIGN KEY ("categoryId") REFERENCES "Categories"(id) ON DELETE NO ACTION
);

CREATE INDEX IF NOT EXISTS idx_products_category ON "Products"("categoryId");
CREATE INDEX IF NOT EXISTS idx_products_active ON "Products"("isActive");

-- Tabla: Users
CREATE TABLE IF NOT EXISTS "Users" (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Storage: Bucket product-images
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =====================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('product-images', 'product-images', true)
-- ON CONFLICT (id) DO NOTHING;
