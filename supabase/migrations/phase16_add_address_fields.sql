-- Phase 16: Add landmark and alternate_phone to addresses table

ALTER TABLE addresses
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20);
