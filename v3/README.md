# Sketches v3 - Vite Migration

This is the Vite-based version of the Sketches project, migrated from Next.js.

## Features

- **Vite**: Fast build tool and development server
- **React 18**: Latest React features
- **ESLint**: Code linting and formatting
- **CSS Modules**: Scoped styling
- **Responsive Design**: Mobile-friendly layout

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
cd v3
npm install
```

### Development

```bash
npm run dev
```

The development server will start at `http://localhost:3000`

### Build

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview

```bash
npm run preview
```

## Project Structure

```
v3/
├── src/
│   ├── components/     # React components
│   ├── model/         # Data models
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
└── package.json       # Dependencies
```

## Migration Notes

- Converted from Next.js to Vite
- Replaced Next.js `Link` with regular `<a>` tags
- Replaced Next.js `Image` with regular `<img>` tags
- Converted CSS modules to regular CSS files
- Maintained the same visual design and functionality

## Assets

Make sure to copy the following assets from the root directory to the `public` folder:
- `assets/` directory
- `favicon.ico`
- `coverSketches.jpg` 