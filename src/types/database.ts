export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock_quantity: number;
  created_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: any;
  items: any;
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  transaction_id: string;
  screenshot_url: string;
  status: 'pending_verification' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
};
