-- =====================================================
-- PazSport - Creación de Base de Datos
-- SQL Server 2022 (TOMASBASSOFERNA)
-- =====================================================

-- Crear la base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PazSportDB')
BEGIN
    CREATE DATABASE PazSportDB;
    PRINT 'Base de datos PazSportDB creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos PazSportDB ya existe.';
END
GO

USE PazSportDB;
GO

-- =====================================================
-- Tabla: Categories (Categorías de productos)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        image NVARCHAR(500) NULL,
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Categories creada exitosamente.';
END
GO

-- =====================================================
-- Tabla: Products (Productos)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(200) NOT NULL,
        description NVARCHAR(1000) NULL,
        price DECIMAL(10,2) NOT NULL,
        image NVARCHAR(500) NULL,
        categoryId INT NOT NULL,
        sizes NVARCHAR(500) NULL,           -- JSON array: ["S","M","L","XL"]
        stock INT NOT NULL DEFAULT 0,
        isActive BIT NOT NULL DEFAULT 1,
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Products_Categories FOREIGN KEY (categoryId) 
            REFERENCES Categories(id) ON DELETE NO ACTION
    );
    PRINT 'Tabla Products creada exitosamente.';
END
GO

-- Índice para búsquedas por categoría
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Products_CategoryId')
BEGIN
    CREATE INDEX IX_Products_CategoryId ON Products(categoryId);
END
GO

-- Índice para filtro por estado activo
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Products_IsActive')
BEGIN
    CREATE INDEX IX_Products_IsActive ON Products(isActive);
END
GO

-- =====================================================
-- Tabla: Users (Usuarios admin)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(200) NOT NULL,
        password NVARCHAR(500) NOT NULL,    -- bcrypt hash
        name NVARCHAR(200) NULL,
        role NVARCHAR(50) NOT NULL DEFAULT 'admin',
        createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_Users_Email UNIQUE (email)
    );
    PRINT 'Tabla Users creada exitosamente.';
END
GO

-- =====================================================
-- Datos iniciales: Categorías
-- =====================================================
IF NOT EXISTS (SELECT * FROM Categories)
BEGIN
    INSERT INTO Categories (name, isActive) VALUES
        (N'Remeras', 1),
        (N'Pantalones', 1),
        (N'Conjuntos', 1),
        (N'Buzos', 1),
        (N'Shorts', 1),
        (N'Accesorios', 1);
    PRINT 'Categorías iniciales insertadas.';
END
GO

-- =====================================================
-- Datos iniciales: Productos de ejemplo
-- =====================================================
IF NOT EXISTS (SELECT * FROM Products)
BEGIN
    -- Remeras (categoryId = 1)
    INSERT INTO Products (name, description, price, categoryId, sizes, stock, isActive) VALUES
        (N'Remera Training Dry-Fit', N'Remera deportiva con tecnología dry-fit para máximo rendimiento', 12500.00, 1, '["S","M","L","XL"]', 25, 1),
        (N'Remera Oversize Sport', N'Remera oversize ideal para gym y uso casual', 10800.00, 1, '["S","M","L","XL","XXL"]', 30, 1);

    -- Pantalones (categoryId = 2)
    INSERT INTO Products (name, description, price, categoryId, sizes, stock, isActive) VALUES
        (N'Jogger Deportivo Negro', N'Jogger de algodón deportivo con puño elastizado', 18500.00, 2, '["S","M","L","XL"]', 20, 1),
        (N'Calza Deportiva Premium', N'Calza de alta compresión para entrenamiento', 15000.00, 2, '["S","M","L","XL"]', 15, 1);

    -- Conjuntos (categoryId = 3)
    INSERT INTO Products (name, description, price, categoryId, sizes, stock, isActive) VALUES
        (N'Conjunto Deportivo Urbano', N'Conjunto buzo + jogger en algodón premium', 32000.00, 3, '["S","M","L","XL"]', 12, 1),
        (N'Conjunto Training Pro', N'Conjunto remera + short para entrenamiento intenso', 22000.00, 3, '["S","M","L","XL"]', 18, 1);

    -- Buzos (categoryId = 4)
    INSERT INTO Products (name, description, price, categoryId, sizes, stock, isActive) VALUES
        (N'Buzo Hoodie Deportivo', N'Hoodie con capucha y bolsillo canguro, ideal para entrenar', 21000.00, 4, '["S","M","L","XL","XXL"]', 22, 1),
        (N'Buzo Canguro Oversize', N'Buzo oversize cómodo para gym y uso diario', 19500.00, 4, '["M","L","XL","XXL"]', 16, 1);

    -- Shorts (categoryId = 5)
    INSERT INTO Products (name, description, price, categoryId, sizes, stock, isActive) VALUES
        (N'Short Running Pro', N'Short liviano con calza interior para running', 13000.00, 5, '["S","M","L","XL"]', 28, 1),
        (N'Short Deportivo Básico', N'Short cómodo para entrenamiento y uso casual', 9800.00, 5, '["S","M","L","XL"]', 35, 1);

    -- Accesorios (categoryId = 6)
    INSERT INTO Products (name, description, price, categoryId, sizes, stock, isActive) VALUES
        (N'Vincha Deportiva', N'Vincha elástica absorbente de sudor', 3500.00, 6, '["Único"]', 50, 1),
        (N'Bolso Deportivo PazSport', N'Bolso amplio con compartimentos para gym', 16000.00, 6, '["Único"]', 20, 1);

    PRINT 'Productos de ejemplo insertados.';
END
GO

-- =====================================================
-- Verificación
-- =====================================================
SELECT 'Categorías' AS Tabla, COUNT(*) AS Cantidad FROM Categories
UNION ALL
SELECT 'Productos', COUNT(*) FROM Products
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM Users;
GO

PRINT '=============================================';
PRINT 'Base de datos PazSportDB configurada correctamente!';
PRINT '=============================================';
GO
