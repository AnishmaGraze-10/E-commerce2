# Professional E-commerce CSS Framework

A comprehensive, production-ready CSS framework designed specifically for modern e-commerce websites. Built with modern CSS features, CSS custom properties, and responsive design principles.

## 🚀 Features

### **Typography System**
- **Google Fonts**: Inter (body) and Poppins (headings)
- **Font Sizes**: 12px to 60px with semantic scale
- **Font Weights**: 300 (light) to 800 (extrabold)
- **Responsive**: Automatically scales across devices

### **Color Palette**
- **Primary Colors**: Blue-based palette (50-950)
- **Secondary Colors**: Purple-based palette (50-950)
- **Neutral Colors**: Gray-based palette (50-950)
- **Semantic Colors**: Success, Warning, Error states
- **Dark Mode**: Automatic dark mode support

### **Layout & Grid System**
- **CSS Grid**: 12-column responsive grid system
- **Flexbox Utilities**: Comprehensive flexbox helpers
- **Container Classes**: Responsive container widths
- **Spacing System**: Consistent spacing scale (4px to 96px)

### **Component Library**
- **Buttons**: Primary, secondary, outline, ghost variants
- **Navigation**: Sticky navbar with hover effects
- **Product Cards**: Hover animations and shadows
- **Forms**: Styled inputs, textareas, and selects
- **Footer**: Multi-column responsive footer

### **Utility Classes**
- **Spacing**: Margin and padding utilities
- **Typography**: Text alignment, sizes, weights
- **Colors**: Background and text color utilities
- **Layout**: Display, position, and sizing utilities
- **Effects**: Shadows, borders, and transitions

## 📁 File Structure

```
src/styles/
├── global.css          # Main CSS framework
├── README.md          # This documentation
└── components/
    └── CSSShowcase.tsx # Component showcase
```

## 🎨 Usage Examples

### **Basic Setup**

Import the CSS file in your main component:

```tsx
import './styles/global.css'
```

### **Typography**

```tsx
<h1 className="text-5xl font-bold">Main Heading</h1>
<h2 className="text-3xl font-semibold">Section Heading</h2>
<p className="text-base text-neutral-700">Body text with neutral color</p>
```

### **Layout & Grid**

```tsx
<div className="container mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-primary p-6 rounded">Grid Item 1</div>
    <div className="bg-secondary p-6 rounded">Grid Item 2</div>
    <div className="bg-success p-6 rounded">Grid Item 3</div>
  </div>
</div>
```

### **Buttons**

```tsx
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary btn-lg">Large Secondary</button>
<button className="btn btn-outline btn-sm">Small Outline</button>
```

### **Navigation**

```tsx
<nav className="navbar">
  <div className="navbar-container">
    <a href="#" className="navbar-brand">Your Brand</a>
    <ul className="navbar-nav">
      <li><a href="#" className="nav-link">Home</a></li>
      <li><a href="#" className="nav-link active">Products</a></li>
      <li><a href="#" className="nav-link">About</a></li>
    </ul>
  </div>
</nav>
```

### **Product Cards**

```tsx
<div className="product-card">
  <img src="product.jpg" alt="Product" className="product-card-image" />
  <div className="product-card-content">
    <div className="product-card-category">Skincare</div>
    <h3 className="product-card-title">Product Name</h3>
    <div className="product-card-price">$49.99</div>
    <div className="product-card-actions">
      <button className="btn btn-primary btn-sm">Add to Cart</button>
    </div>
  </div>
</div>
```

### **Forms**

```tsx
<div className="form-group">
  <label className="form-label">Email Address</label>
  <input type="email" className="form-input" placeholder="Enter email" />
</div>
<div className="form-group">
  <label className="form-label">Message</label>
  <textarea className="form-textarea" rows={4} placeholder="Enter message"></textarea>
</div>
<button className="btn btn-primary w-full">Submit</button>
```

## 🎯 Spacing System

The framework uses a consistent 4px base unit system:

| Class | Size | Pixels |
|-------|------|--------|
| `p-1` | 0.25rem | 4px |
| `p-2` | 0.5rem | 8px |
| `p-3` | 0.75rem | 12px |
| `p-4` | 1rem | 16px |
| `p-5` | 1.25rem | 20px |
| `p-6` | 1.5rem | 24px |
| `p-8` | 2rem | 32px |
| `p-10` | 2.5rem | 40px |
| `p-12` | 3rem | 48px |
| `p-16` | 4rem | 64px |
| `p-20` | 5rem | 80px |
| `p-24` | 6rem | 96px |

## 📱 Responsive Breakpoints

- **Mobile**: `< 640px` (default)
- **Tablet**: `≥ 640px` (md:)
- **Desktop**: `≥ 768px` (lg:)
- **Large Desktop**: `≥ 1024px` (xl:)

## 🎨 Color Classes

### **Background Colors**
- `.bg-primary` - Primary brand color
- `.bg-secondary` - Secondary brand color
- `.bg-success` - Success state
- `.bg-warning` - Warning state
- `.bg-error` - Error state
- `.bg-neutral` - Neutral color

### **Text Colors**
- `.text-primary` - Primary text color
- `.text-secondary` - Secondary text color
- `.text-success` - Success text
- `.text-warning` - Warning text
- `.text-error` - Error text
- `.text-neutral` - Neutral text

## 🔧 Customization

### **CSS Custom Properties**

All colors, spacing, and typography are defined as CSS custom properties in `:root`:

```css
:root {
  --primary-600: #0284c7;
  --space-4: 1rem;
  --text-lg: 1.125rem;
}
```

### **Theme Override**

To customize the theme, override the CSS custom properties:

```css
:root {
  --primary-600: #your-brand-color;
  --font-heading: 'Your-Font', sans-serif;
}
```

### **Component Modifiers**

Most components support modifier classes:

```tsx
<button className="btn btn-primary btn-lg">Large Primary</button>
<div className="product-card rounded-xl">Extra Rounded Card</div>
```

## 🚀 Performance Features

- **CSS Custom Properties**: Efficient theming and customization
- **Minimal CSS**: Only essential styles included
- **Optimized Selectors**: Efficient CSS selectors
- **Hardware Acceleration**: GPU-accelerated animations
- **Responsive Images**: Optimized image handling

## 🌙 Dark Mode Support

The framework automatically supports dark mode using `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --neutral-50: #0a0a0a;
    --neutral-900: #f5f5f5;
  }
}
```

## 📚 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **CSS Grid**: Full support
- **CSS Custom Properties**: Full support
- **Flexbox**: Full support
- **CSS Animations**: Full support

## 🧪 Testing & Development

Use the `CSSShowcase` component to test all framework features:

```tsx
import CSSShowcase from './components/CSSShowcase'

// In your app
<CSSShowcase />
```

## 📖 Best Practices

1. **Use Semantic Classes**: Prefer semantic class names over custom CSS
2. **Leverage Utility Classes**: Combine utility classes for rapid development
3. **Responsive First**: Design mobile-first, then enhance for larger screens
4. **Consistent Spacing**: Use the spacing scale for consistent layouts
5. **Accessibility**: Always include proper ARIA labels and semantic HTML

## 🔄 Updates & Maintenance

- **Regular Updates**: Framework is updated with modern CSS features
- **Backward Compatibility**: Changes maintain backward compatibility
- **Performance Monitoring**: Regular performance audits and optimizations
- **Browser Testing**: Continuous testing across major browsers

## 📞 Support

For questions, issues, or contributions:
- Check the showcase component for examples
- Review the CSS custom properties for customization
- Test responsive behavior across different screen sizes

---

**Built with ❤️ for modern e-commerce websites** 