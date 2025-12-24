# Resume Builder

A clean, print-ready resume template built with plain HTML, CSS, and JavaScript. No frameworks, no build tools—just open `index.html` in a browser.

## Features

- **Print-optimized** — A4 layout with proper page breaks, orphan/widow control, and URL display for links
- **Responsive** — Mobile-friendly layout that adapts to screen size
- **Accessible** — Screen reader support, keyboard navigation, proper semantic HTML
- **Inline editing** — Click the name to edit it directly (press Enter to save, Escape to cancel)
- **No dependencies** — Pure HTML/CSS/JS, works offline

## Quick Start

1. Open `index.html` in your browser
2. Edit the content directly in the HTML file
3. Print to PDF (Ctrl/Cmd + P) or use your browser's print function

## File Structure

```
resume-builder/
├── index.html          # Main resume document
├── CSS/
│   ├── style.css       # Screen styles and design tokens
│   └── print.css       # Print-specific optimizations
├── JS/
│   └── script.js       # Inline editing functionality
└── assets/             # Place images here if needed
```

## Customization

### Design Tokens

Edit CSS custom properties in `CSS/style.css`:

```css
:root {
  --ink: #2e3038; /* Main text color */
  --muted: #4b5563; /* Secondary text */
  --rule: #d1d5db; /* Divider lines */
  --link: #c200a7; /* Link/accent color */
  --name: 2.25rem; /* Name font size */
  --sections: 1.225rem; /* Section heading size */
}
```

### Content

Edit `index.html` directly. Key sections:

- **Header** — Name and contact info
- **Summary** — Professional summary paragraph
- **Skills** — Two-column layout for skill categories
- **Experience** — Work history with dates
- **Education** — Degrees and institutions
- **Training** — Courses and certifications
- **Languages** — Proficiency meters

### Print Settings

For best results when printing to PDF:

- Use Chrome or Edge for most consistent output
- Set margins to "Default" or "None" (the CSS handles margins)
- Enable "Background graphics" if you want meter bars to show
- Disable headers/footers for a cleaner look

## Browser Support

- Chrome (recommended for printing)
- Firefox
- Safari

## Development

Lint CSS with Stylelint:

```bash
npm install
npm run lint:css
npm run lint:css:fix  # Auto-fix issues
```

## License

ISC
