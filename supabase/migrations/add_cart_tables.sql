-- Create Carts Table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL, -- Used for guest tracking (e.g., cookie value)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    color_name VARCHAR(100),
    size VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(cart_id, product_id, color_name, size) -- Prevent duplicate rows for the exact same variant
);

-- RLS Policies for Carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on carts based on session" ON carts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on carts" ON carts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on carts" ON carts FOR UPDATE USING (true);

-- RLS Policies for Cart Items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on cart_items" ON cart_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert on cart_items" ON cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on cart_items" ON cart_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on cart_items" ON cart_items FOR DELETE USING (true);
