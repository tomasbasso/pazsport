-- =====================================================
-- Migration: Add colors support to Products
-- =====================================================

ALTER TABLE "Products" 
ADD COLUMN IF NOT EXISTS "colors" TEXT NULL;

COMMENT ON COLUMN "Products"."colors" IS 'JSON array of hex codes or color names, e.g. ["#FF0000", "Azul"]';
