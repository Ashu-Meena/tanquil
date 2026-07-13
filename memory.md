# Project Memory & Status

## 1. Current State
- The application is a fully functional luxury eCommerce storefront and CMS.
- **Storefront**: Connected to Supabase. Correctly fetches products, variants, and dynamic homepage sections (Hero, Trending, Featured).
- **Admin Panel**: Operational. Supports media uploads, product variant management (sizes and colors), and CMS configuration.

## 2. Recent Updates
- **Multi-Step Quick Add to Cart**: Implemented a dynamic flow on the storefront product cards. If a product has multiple colors, the "Quick Add" button first prompts for color selection, then size, and uses the correct color-specific image for the cart payload. If only one color exists, it bypasses the color step.
- **Media Format Support**: Added client-side HEIC-to-JPEG conversion in the admin panel's `ImageUploader` and `MediaSelectorModal`, resolving iOS image upload issues.
- **Hero Banner CMS Fix**: Refactored the `storefront/homepage/page.tsx` admin form to manage an array of up to 3 Hero slides, aligning the admin capabilities with the database structure and the storefront's `HeroSection` rendering logic.
- **Storefront Animation Fix**: Resolved a Framer Motion `AnimatePresence` bug in `HeroSection.tsx` where exiting slides inherited the incoming slide's data during transitions.

## 3. Known Issues & Tech Debt
- **Type Safety**: Some database calls in the admin panel occasionally rely on loosely typed responses or direct inserts without strict schema validation. Need to run `supabase gen types typescript` periodically.
- **Cart Persistence**: Cart state is currently handled locally; needs to be hooked up to user sessions or a robust state persistence layer before real checkouts occur.

## 4. Next Steps
- Finalize checkout and payment gateway logic (Phase 4).
- Address SEO meta tags and open graph image generation.
