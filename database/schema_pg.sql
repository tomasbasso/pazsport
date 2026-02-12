-- =====================================================
-- PazSport - Esquema de Base de Datos (PostgreSQL / Supabase)
-- =====================================================

-- Tabla: Categories
CREATE TABLE IF NOT EXISTS "Categories" (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NULL,
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
    image TEXT NULL,
    "categoryId" INT NOT NULL,
    sizes TEXT NULL, -- JSON array almacenado como texto
    stock INT NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_category FOREIGN KEY ("categoryId") REFERENCES "Categories"(id) ON DELETE NO ACTION
);

-- Índices
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

-- Datos iniciales: Categorías
INSERT INTO "Categories" (name, "isActive") VALUES
    ('Remeras', TRUE),
    ('Pantalones', TRUE),
    ('Conjuntos', TRUE),
    ('Buzos', TRUE),
    ('Shorts', TRUE),
    ('Accesorios', TRUE)
ON CONFLICT DO NOTHING;

-- Datos iniciales: Productos de ejemplo
INSERT INTO "Products" (name, description, price, "categoryId", sizes, stock, "isActive") VALUES
    ('Remera Training Dry-Fit', 'Remera deportiva con tecnología dry-fit para máximo rendimiento', 12500.00, 1, '["S","M","L","XL"]', 25, TRUE),
    ('Remera Oversize Sport', 'Remera oversize ideal para gym y uso casual', 10800.00, 1, '["S","M","L","XL","XXL"]', 30, TRUE),
    ('Jogger Deportivo Negro', 'Jogger de algodón deportivo con puño elastizado', 18500.00, 2, '["S","M","L","XL"]', 20, TRUE),
    ('Calza Deportiva Premium', 'Calza de alta compresión para entrenamiento', 15000.00, 2, '["S","M","L","XL"]', 15, TRUE),
    ('Conjunto Deportivo Urbano', 'Conjunto buzo + jogger en algodón premium', 32000.00, 3, '["S","M","L","XL"]', 12, TRUE),
    ('Conjunto Training Pro', 'Conjunto remera + short para entrenamiento intenso', 22000.00, 3, '["S","M","L","XL"]', 18, TRUE),
    ('Buzo Hoodie Deportivo', 'Hoodie con capucha y bolsillo canguro, ideal para entrenar', 21000.00, 4, '["S","M","L","XL","XXL"]', 22, TRUE),
    ('Buzo Canguro Oversize', 'Buzo oversize cómodo para gym y uso diario', 19500.00, 4, '["M","L","XL","XXL"]', 16, TRUE),
    ('Short Running Pro', 'Short liviano con calza interior para running', 13000.00, 5, '["S","M","L","XL"]', 28, TRUE),
    ('Short Deportivo Básico', 'Short cómodo para entrenamiento y uso casual', 9800.00, 5, '["S","M","L","XL"]', 35, TRUE),
    ('Vincha Deportiva', 'Vincha elástica absorbente de sudor', 3500.00, 6, '["Único"]', 50, TRUE),
    ('Bolso Deportivo PazSport', 'Bolso amplio con compartimentos para gym', 16000.00, 6, '["Único"]', 20, TRUE)
ON CONFLICT DO NOTHING;
