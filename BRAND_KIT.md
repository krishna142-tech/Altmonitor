# AltMonitor Brand Kit & UI Guidelines

## Color Palette

### Primary Colors
- **Primary Blue**: `#2563eb` (blue-600) - Used for active states, primary buttons, and key interactive elements
- **Dark Blue**: `#1e40af` (blue-800) - Used for headers and emphasis areas
- **Light Blue**: `#dbeafe` (blue-50) - Used for hover states and subtle backgrounds

### Neutral Colors
- **White**: `#ffffff` - Primary background for content areas and cards
- **Light Gray**: `#f8fafc` (gray-50) - Secondary backgrounds and subtle sections
- **Medium Gray**: `#e2e8f0` (gray-200) - Borders and dividers
- **Dark Gray**: `#64748b` (gray-500) - Secondary text and labels
- **Charcoal**: `#1e293b` (slate-800) - Dark sidebar backgrounds
- **Slate**: `#475569` (slate-600) - Dark sidebar text

### Text Colors
- **Primary Text**: `#0f172a` (gray-900) - Main content text
- **Secondary Text**: `#64748b` (gray-500) - Supporting text and labels
- **White Text**: `#ffffff` - Text on dark backgrounds
- **Light Text**: `#cbd5e1` (slate-300) - Text on dark sidebar

### Status Colors
- **Success**: `#16a34a` (green-600) - Success states, completed items
- **Warning**: `#ca8a04` (yellow-600) - Warning states, pending items
- **Error**: `#dc2626` (red-600) - Error states, overdue items
- **Info**: `#2563eb` (blue-600) - Information states

## Typography

### Font Weights
- **Light**: `font-light` (300) - Subtle text
- **Normal**: `font-normal` (400) - Body text
- **Medium**: `font-medium` (500) - Labels and secondary headings
- **Semibold**: `font-semibold` (600) - Section headings
- **Bold**: `font-bold` (700) - Primary headings

### Text Sizes
- **XS**: `text-xs` (12px) - Small labels and metadata
- **SM**: `text-sm` (14px) - Secondary text and table content
- **Base**: `text-base` (16px) - Body text
- **LG**: `text-lg` (18px) - Section headings
- **XL**: `text-xl` (20px) - Page headings

## Layout & Spacing

### Container Spacing
- **Padding**: `p-4` (16px) - Standard content padding
- **Margin**: `mb-6` (24px) - Standard section spacing
- **Gap**: `gap-4` (16px) - Standard element spacing

### Border Radius
- **Small**: `rounded` (4px) - Input fields and small elements
- **Medium**: `rounded-md` (6px) - Cards and panels
- **Large**: `rounded-lg` (8px) - Section headers and major elements

## Component Patterns

### Sidebar
```css
/* Dark sidebar */
background: bg-slate-800
text: text-white
active item: bg-blue-600 text-white
hover: hover:bg-slate-700 hover:text-white
```

### Section Headers
```css
/* Clean white headers */
background: bg-white
text: text-black
padding: px-4 py-2
radius: rounded-t-lg
```

### Cards & Panels
```css
/* White content panels */
background: bg-white
border: border border-gray-200
shadow: shadow-sm
radius: rounded-lg
padding: p-4 or p-6
```

### Tables
```css
/* Clean table styling */
header: bg-gray-50
borders: border-b border-gray-200
hover: hover:bg-gray-50
padding: px-4 py-3
```

### Buttons
```css
/* Primary button */
background: bg-blue-600
hover: hover:bg-blue-700
text: text-white
padding: px-4 py-2
radius: rounded-md

/* Secondary button */
background: bg-white
border: border border-gray-300
text: text-gray-700
hover: hover:bg-gray-50
```

### Status Badges
```css
/* Success */
background: bg-green-100
text: text-green-800

/* Warning */
background: bg-yellow-100
text: text-yellow-800

/* Error */
background: bg-red-100
text: text-red-800

/* Default */
background: bg-gray-100
text: text-gray-800
```

## UI Principles

### Design Philosophy
- **Clean & Minimal**: Focus on content with minimal visual noise
- **Consistent Spacing**: Use systematic spacing scale throughout
- **Clear Hierarchy**: Use typography and color to establish information hierarchy
- **Accessible**: Ensure sufficient contrast and readable text sizes

### Interaction States
- **Hover**: Subtle background changes and cursor pointer
- **Active**: Clear visual feedback with color changes
- **Focus**: Visible focus indicators for keyboard navigation
- **Disabled**: Muted colors and disabled cursor

### Responsive Design
- **Mobile First**: Design for mobile, enhance for larger screens
- **Flexible Layouts**: Use grid and flexbox for responsive components
- **Touch Friendly**: Adequate touch targets (minimum 44px)

## Usage Guidelines

### Do's
- Use the established color palette consistently
- Maintain proper spacing and alignment
- Use semantic color choices (green for success, red for errors)
- Keep the design clean and uncluttered

### Don'ts
- Don't introduce new colors without updating this brand kit
- Don't use colors that don't meet accessibility contrast requirements
- Don't mix different design patterns within the same component
- Don't overcrowd interfaces with too many visual elements

## Implementation Notes

### CSS Framework
This project uses **Tailwind CSS** for styling. All color classes reference Tailwind's color system.

### Dark Mode
Currently, the project uses a light theme with dark sidebar. Future dark mode implementation should follow these color guidelines.

### Accessibility
- All color combinations meet WCAG AA contrast requirements
- Interactive elements have clear focus states
- Text sizes are readable across devices

---

*Last updated: January 2025*
*Version: 1.0*