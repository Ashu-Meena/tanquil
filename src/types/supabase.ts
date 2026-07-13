export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: { Row: {
          id: string
          name: string
          slug: string
          description: string | null
          sku: string | null
          price: number
          compare_at_price: number | null
          brand: string | null
          fabric: string | null
          weight: number | null
          status: string
          is_featured: boolean
          is_trending: boolean
          seo_title: string | null
          seo_description: string | null
          category_id: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string | null
          sku?: string | null
          price: number
          compare_at_price: number | null
          brand?: string | null
          fabric?: string | null
          weight?: number | null
          status: string
          is_featured: boolean
          is_trending?: boolean
          seo_title?: string | null
          seo_description?: string | null
          category_id: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          brand?: string | null
          fabric?: string | null
          weight?: number | null
          status?: string
          is_featured?: boolean
          is_trending?: boolean
          seo_title?: string | null
          seo_description?: string | null
          category_id?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          display_order: number | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      product_images: { Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          display_order: number
          created_at: string
          color_name: string | null
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text: string | null
          display_order: number
          created_at?: string
          color_name: string | null
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          display_order?: number
          created_at?: string
          color_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string
          color_name: string
          sku: string | null
          stock_quantity: number
          price_adjustment: number
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          color_name: string
          sku?: string | null
          stock_quantity?: number
          price_adjustment?: number
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          color_name?: string
          sku?: string | null
          stock_quantity?: number
          price_adjustment?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      homepage_sections: {
        Row: {
          id: string
          section_type: string
          title: string
          subtitle: string | null
          button_text: string | null
          button_link: string | null
          image_url: string | null
          is_active: boolean
          display_order: number | null
        }
        Insert: {
          id?: string
          section_type: string
          title: string
          subtitle?: string | null
          button_text?: string | null
          button_link?: string | null
          image_url?: string | null
          is_active?: boolean
          display_order?: number | null
        }
        Update: {
          id?: string
          section_type?: string
          title?: string
          subtitle?: string | null
          button_text?: string | null
          button_link?: string | null
          image_url?: string | null
          is_active?: boolean
          display_order?: number | null
        }
        Relationships: []
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          role: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          subtotal: number
          shipping_fee: number
          discount_amount: number
          total_amount: number
          status: string
          payment_status: string
          payment_method: string | null
          transaction_id: string | null
          shipping_address: Json
          notes: string | null
          screenshot_url: string | null
tracking_id: string | null
          courier_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          subtotal: number
          shipping_fee?: number
          discount_amount?: number
          total_amount: number
          status?: string
          payment_status?: string
          payment_method?: string | null
          transaction_id?: string | null
          shipping_address: Json
          notes?: string | null
          screenshot_url?: string | null
tracking_id?: string | null
          courier_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          subtotal?: number
          shipping_fee?: number
          discount_amount?: number
          total_amount?: number
          status?: string
          payment_status?: string
          payment_method?: string | null
          transaction_id?: string | null
          shipping_address?: Json
          notes?: string | null
          screenshot_url?: string | null
tracking_id?: string | null
          courier_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          product_name: string
          sku: string | null
          quantity: number
          price: number
          created_at: string
          color_name: string | null
          size: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          product_name: string
          sku?: string | null
          quantity: number
          price: number
          created_at?: string
          color_name?: string | null
          size?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          variant_id?: string | null
          product_name?: string
          sku?: string | null
          quantity?: number
          price?: number
          created_at?: string
          color_name?: string | null
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          title: string | null
          name: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          country: string | null
          phone: string | null
          is_default: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          name: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string | null
          phone?: string | null
          is_default?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          name?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string | null
          phone?: string | null
          is_default?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: string
          discount_value: number
          min_order_value: number | null
          max_discount_value: number | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: string
          discount_value: number
          min_order_value?: number | null
          max_discount_value?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: string
          discount_value?: number
          min_order_value?: number | null
          max_discount_value?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          author_id: string | null
          featured_image: string | null
          status: string | null
          seo_title: string | null
          seo_description: string | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          author_id?: string | null
          featured_image?: string | null
          status?: string | null
          seo_title?: string | null
          seo_description?: string | null
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          author_id?: string | null
          featured_image?: string | null
          status?: string | null
          seo_title?: string | null
          seo_description?: string | null
          published_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      pages: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          seo_title: string | null
          seo_description: string | null
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          seo_title?: string | null
          seo_description?: string | null
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          seo_title?: string | null
          seo_description?: string | null
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
