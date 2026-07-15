-- Ensure RLS is enabled and correct for wishlist

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist;
CREATE POLICY "Users can view their own wishlist"
    ON wishlist FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wishlist" ON wishlist;
CREATE POLICY "Users can insert their own wishlist"
    ON wishlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wishlist" ON wishlist;
CREATE POLICY "Users can update their own wishlist"
    ON wishlist FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wishlist" ON wishlist;
CREATE POLICY "Users can delete their own wishlist"
    ON wishlist FOR DELETE
    USING (auth.uid() = user_id);
