# Design System Document

## 1. Aesthetic Identity
**Theme**: Luxury, minimalist, timeless, high-end fashion.
The platform prioritizes breathing room, expansive typography, and large-scale, high-quality imagery over dense information architecture.

## 2. Color Palette
- **Primary Dark**: `#111111` (Deep Charcoal Black) - Used for primary text, deep backgrounds, and heavy UI elements.
- **Primary Light**: `#FFFFFF` (Pure White) - Used for primary backgrounds and stark contrasts.
- **Accent/Brand**: `#C7A17A` (Muted Gold / Beige) - Used for hover states, emphasis, and subtle borders.
- **Soft Backgrounds**: `#FAF8F5` (Off-White/Warm Gray) - Used for secondary panels, separating sections without harsh lines.

## 3. Typography
- **Primary Headings**: Modern Serif font (e.g., Playfair Display or equivalent). Expressive, italicized variants used for subheadings to add an editorial feel.
- **Body Text**: Clean Sans-Serif font (e.g., Inter or Roboto). Highly legible, typically used in uppercase for UI labels and navigation.

## 4. UI Components
- **Buttons**: Square or slightly rounded (`rounded-sm`). Often utilize magnetic hover effects (framer-motion) and fill transitions (e.g., Black to Gold).
- **Cards**: Minimalist borders (`border-[#EFEFEF]`). Focus entirely on the image, with text elegantly overlaying or placed cleanly below.
- **Navigation**: Sticky or dynamic headers. A blend of solid backgrounds on scroll and transparent overlays when atop hero images.

## 5. Motion & Interaction
- **Micro-interactions**: Subtle scale up on images during hover (Ken Burns effect). 
- **Transitions**: Crossfades and slow opacity changes (`duration: 1.5s`) for primary banners.
- **Slide-overs**: Used for the Cart and Mobile menus, entering from the right with spring physics.
