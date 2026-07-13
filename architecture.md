# Architecture Document

## 1. Tech Stack Overview
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Animations**: Framer Motion
- **Database / Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel

## 2. Core Concepts
### 2.1 Next.js App Router
The application heavily utilizes the Next.js App Router (`src/app`). 
- **Server Components (RSC)**: Used by default for fetching data directly from Supabase, improving performance and SEO. Examples include `page.tsx` for collections and products.
- **Client Components**: Explicitly marked with `"use client"`. Used for interactive UI elements such as `ProductCard`, `HeroSection`, and Admin Panel forms.

### 2.2 Database Schema (Supabase)
- **products**: Core product data (title, price, description, category).
- **product_variants**: SKU-level variations tracking size, color, and specific stock levels.
- **product_images**: Media associated with products, including specific color mappings.
- **categories**: Organizational structure for products.
- **homepage_sections**: Dynamic CMS table controlling storefront layout (Hero, Trending, Editorials).

### 2.3 State Management
- **Local State**: React `useState` and `useReducer` for component-level interactivity (e.g., cart slide-overs, image galleries).
- **Global UI State**: Zustand used for managing transient global state (like the Toast notifications).

## 3. Key Workflows
### 3.1 Media Management
Images uploaded via the admin panel are sent to Supabase Storage. The application includes client-side conversion logic (e.g., HEIC to JPEG via `heic2any`) to ensure cross-browser compatibility before uploading.

### 3.2 Add to Cart Flow
The `Quick Add` functionality dynamically checks for product variants. If multiple colors exist, it prompts for Color selection first, then Size, fetching the correct associated image dynamically from the database.
