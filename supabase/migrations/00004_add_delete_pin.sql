-- Add delete_pin column to posts (4-digit hashed pin for deletion)
ALTER TABLE posts ADD COLUMN delete_pin TEXT;
