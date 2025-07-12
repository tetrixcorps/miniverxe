# TETRIX Animated Logo Implementation

This document outlines the implementation of animated Tetrix logos using both SVG animations and Lottie animations for the React web application.

## Overview

The animated logo system provides three different implementations:

1. **SVG Animated Logo** - Pure SVG with CSS animations
2. **Lottie Logo** - Lottie animations with autoplay and loop
3. **Advanced Lottie Logo** - Interactive Lottie with hover controls

## Components

### 1. AnimatedLogo (SVG-based)

**File:** `apps/web/src/components/AnimatedLogo.tsx`

A pure SVG implementation with CSS animations and hover effects.

**Features:**
- SVG-based animations using `<animate>` elements
- CSS transitions for hover effects
- Gradient fills with brand colors
- Responsive sizing (sm, md, lg)
- Optional text display

**Usage:**
```tsx
import { AnimatedLogo } from './components/AnimatedLogo';

<AnimatedLogo 
  size="md" 
  showText={true} 
  className="custom-class" 
/>
```

### 2. LottieLogo

**File:** `apps/web/src/components/LottieLogo.tsx`

A Lottie-based implementation using the `lottie-react` library.

**Features:**
- Lottie animations with autoplay and loop
- Hover effects with glow overlays
- Speed controls on hover
- Interactive play/pause functionality
- Custom animation JSON file

**Usage:**
```tsx
import { LottieLogo } from './components/LottieLogo';

<LottieLogo 
  size="md" 
  showText={true} 
  autoplay={true} 
  loop={true} 
/>
```

### 3. AdvancedLottieLogo

**File:** `apps/web/src/components/LottieLogo.tsx`

An advanced Lottie implementation with enhanced interactivity.

**Features:**
- Speed changes on hover (1.5x speed)
- Click to restart animation
- Enhanced glow effects
- Play indicator when paused
- Advanced hover states

**Usage:**
```tsx
import { AdvancedLottieLogo } from './components/LottieLogo';

<AdvancedLottieLogo 
  size="lg" 
  showText={true} 
/>
```

## Animation Assets

### Lottie Animation File

**File:** `apps/web/src/assets/tetrix-logo-animation.json`

A custom Lottie animation featuring:
- 4 animated T blocks forming the Tetrix logo
- Staggered rotation animations
- Background glow effects
- Brand color gradients (red, orange, yellow)
- 120-frame animation cycle

**Animation Structure:**
- Background glow with opacity animation
- 4 T blocks with rotation and scale animations
- Staggered timing for visual interest
- Rounded rectangle shapes with brand colors

## Integration Points

### 1. Navigation Bar

**File:** `apps/web/src/components/Navbar.tsx`

The navbar uses the `LottieLogo` component for consistent branding.

```tsx
import { LottieLogo } from './LottieLogo';

<nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow">
  <LottieLogo size="md" />
  {/* ... rest of navbar */}
</nav>
```

### 2. Hero Section

**File:** `apps/web/src/components/landing/HeroSection.tsx`

The hero section prominently features the `AdvancedLottieLogo` for maximum impact.

```tsx
import { AdvancedLottieLogo } from '../LottieLogo';

<section className="min-h-[60vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-brand-red via-brand-orange to-brand-yellow text-white py-20 px-4">
  {/* Prominent Lottie Animated Logo */}
  <div className="mb-8">
    <AdvancedLottieLogo size="lg" className="text-white" />
  </div>
  {/* ... rest of hero content */}
</section>
```

### 3. Preview Landing Page

**File:** `apps/web/src/pages/PreviewLanding.tsx`

The preview landing page showcases the animated logo in the hero section.

## Demo Page

**File:** `apps/web/src/pages/LogoDemo.tsx`

A comprehensive demo page showcasing all logo variants:

- **Route:** `/logo-demo`
- **Features:** All logo variants with different sizes
- **Documentation:** Usage instructions and code examples
- **Interactive:** Live examples of all animations

## Props Interface

All logo components share a common interface:

```tsx
interface LogoProps {
  className?: string;        // Additional CSS classes
  size?: 'sm' | 'md' | 'lg'; // Logo size variants
  showText?: boolean;        // Show/hide "TETRIX" text
  autoplay?: boolean;        // Autoplay animation (Lottie only)
  loop?: boolean;           // Loop animation (Lottie only)
}
```

## Brand Colors

The logos use the TETRIX brand color palette:

```css
--brand-red: #FF3B30;
--brand-orange: #FF9500;
--brand-yellow: #FFB300;
```

## Dependencies

### Required Packages

```json
{
  "lottie-react": "^2.4.1"
}
```

### Installation

```bash
cd apps/web
pnpm add lottie-react
```

## Performance Considerations

### SVG Animations
- Lightweight and performant
- No external dependencies
- Smooth CSS transitions
- Hardware acceleration support

### Lottie Animations
- Optimized JSON format
- Efficient rendering
- Memory management with refs
- Conditional rendering for performance

## Browser Support

### SVG Animations
- Modern browsers with SVG support
- CSS transitions and animations
- Hardware acceleration

### Lottie Animations
- All modern browsers
- Mobile device support
- Fallback to static SVG if needed

## Customization

### Creating Custom Lottie Animations

1. Use [LottieFiles](https://lottiefiles.com/) or Adobe After Effects
2. Export as JSON format
3. Replace `tetrix-logo-animation.json`
4. Update component references

### Modifying SVG Animations

1. Edit the SVG paths in `AnimatedLogo.tsx`
2. Adjust CSS animations and transitions
3. Update gradient definitions
4. Modify hover effects

## Troubleshooting

### Common Issues

1. **Lottie not loading:**
   - Check JSON file path
   - Verify lottie-react installation
   - Ensure proper import statements

2. **Animation performance:**
   - Reduce animation complexity
   - Use `will-change` CSS property
   - Implement conditional rendering

3. **Hover effects not working:**
   - Check CSS class names
   - Verify event handlers
   - Ensure proper state management

### Debug Mode

Enable debug logging in Lottie components:

```tsx
<LottieLogo 
  size="md" 
  showText={true} 
  autoplay={true} 
  loop={true}
  onError={(error) => console.error('Lottie error:', error)}
/>
```

## Future Enhancements

### Planned Features

1. **Animation Presets:**
   - Different animation styles
   - Theme-based variations
   - Seasonal animations

2. **Advanced Interactions:**
   - Gesture controls
   - Sound effects
   - Particle effects

3. **Performance Optimizations:**
   - Lazy loading
   - Preloading strategies
   - Compression techniques

### Integration Ideas

1. **Loading States:**
   - Animated loading indicators
   - Progress animations
   - Skeleton screens

2. **Micro-interactions:**
   - Button hover effects
   - Form validation animations
   - Success/error states

## Resources

### Documentation
- [LottieFiles Documentation](https://developers.lottiefiles.com/)
- [lottie-react GitHub](https://github.com/LottieFiles/lottie-react)
- [SVG Animation Guide](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)

### Tools
- [LottieFiles Editor](https://lottiefiles.com/editor)
- [Adobe After Effects](https://www.adobe.com/products/aftereffects.html)
- [LottieLab](https://www.lottielab.com/)

### Examples
- [LottieFiles Gallery](https://lottiefiles.com/featured)
- [Animation Examples](https://lottiefiles.com/search?q=logo&category=animations)

## Contributing

When contributing to the animated logo system:

1. Follow the existing component structure
2. Maintain brand consistency
3. Test across different browsers
4. Optimize for performance
5. Document new features
6. Update demo page

## License

This implementation is part of the TETRIX project and follows the same licensing terms. 