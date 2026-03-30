# Responsive Design Checklist

## Test at These Widths

| Width | Device | Priority |
|-------|--------|----------|
| 320px | iPhone SE | Must work |
| 375px | iPhone 12/13 | Must work |
| 390px | iPhone 14/15 | Must work |
| 768px | iPad | Must work |
| 1024px | iPad landscape / small laptop | Must work |
| 1280px | Laptop | Must work |
| 1440px | Desktop | Should look good |
| 1920px | Large desktop | Should look good |

## Common Responsive Patterns

### Navigation
- **Mobile (< 768px):** Hamburger menu, slide-out or full-screen overlay
- **Tablet (768-1024px):** Simplified top nav, fewer items
- **Desktop (> 1024px):** Full horizontal navigation

### Grid Layouts
```
Mobile:    1 column
Tablet:    2 columns
Desktop:   3-4 columns
```

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
```

### Typography Scale
```
Mobile:    h1: 2rem (32px), body: 1rem (16px)
Desktop:   h1: 3.5rem (56px), body: 1.125rem (18px)
```

```tsx
<h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold">
```

### Spacing
```
Mobile:    px-4 (16px side padding)
Tablet:    px-8 (32px)
Desktop:   px-16 or max-w container
```

### Images
```tsx
// Responsive image with Next.js
<Image
  src="/hero.webp"
  alt="Hero image"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  className="w-full h-auto"
  priority
/>
```

## Touch Targets

- Minimum tap target: **44x44px** (Apple HIG) / **48x48dp** (Material)
- Spacing between targets: minimum **8px**
- Buttons on mobile: full-width or large enough to tap easily

## Performance on Mobile

- [ ] Images lazy-loaded below the fold
- [ ] Hero image uses `priority` prop
- [ ] No horizontal scroll at any breakpoint
- [ ] Fonts loaded with `next/font` (no FOIT/FOUT)
- [ ] No layout shift when content loads
- [ ] Total page weight < 1MB on mobile
