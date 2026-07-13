# Project Rules & Conventions

## 1. Code Standards
- **Strict TypeScript**: Avoid `any`. Use interfaces and type definitions for all database payloads, API responses, and component props.
- **Server Components by Default**: Default to React Server Components (RSC). Only add `"use client"` when interactivity, hooks (`useState`, `useEffect`), or DOM manipulation are strictly required.
- **Data Fetching**: Prefer server-side data fetching directly in `page.tsx` or `layout.tsx` using the Supabase Server Client. Pass data down to Client Components as props.

## 2. Styling Rules
- **Tailwind CSS**: Use Tailwind for all styling. Avoid custom CSS files unless implementing complex global animations that Tailwind cannot handle natively.
- **Responsive Design**: Always implement mobile-first styling (`w-full text-base md:w-1/2 md:text-lg`).
- **Color Palette Variables**: Utilize predefined color codes explicitly or via Tailwind config variables. Do not introduce off-brand colors.

## 3. UI/UX Guidelines
- **Media Optimization**: Always use `next/image` for images to leverage automatic optimization, lazy loading, and correct sizing. Ensure `fill` or `width`/`height` are properly set.
- **Animations**: Use `framer-motion` for complex entering/exiting animations (e.g., `AnimatePresence`). Keep transition durations smooth (0.3s - 1.5s depending on context).
- **Error Handling**: Use the global Toast system (`@/store/useToastStore`) for user-facing success and error states.

## 4. Git & Version Control
- **Commit Messages**: Use semantic commit messages (e.g., `feat: ...`, `fix: ...`, `refactor: ...`).
- **Atomic Commits**: Keep commits focused on a single logical change or bug fix.

## 5. Next.js 16 Specifics
- Adhere to App Router conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
- Heed breaking changes and deprecation notices as per standard Next.js updates.
