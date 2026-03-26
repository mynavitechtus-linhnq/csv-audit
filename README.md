# CSV Audit Tool

A modern, responsive web application for validating and auditing CSV files with customizable rules and full i18n (English/Japanese) support.

## Features

- Upload CSV files (max 50MB)
- Data preview with responsive table
- Custom validation rules (required, email, number, pattern, date, enum, min/max length, boolean)
- Audit results with error highlighting and export
- Pagination and search with i18n support
- Language switcher (English/Japanese)
- Mobile-friendly UI

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Lucide Icons

## Getting Started

### Prerequisites

- Node.js (18+ recommended)
- pnpm (or npm/yarn)

### Installation

```bash
pnpm install
# or
npm install
# or
yarn install
```

### Development

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

### Build

```bash
pnpm build
# or
npm run build
# or
yarn build
```

### Start (Production)

```bash
pnpm start
# or
npm start
# or
yarn start
```

## Project Structure

- `app/` — Next.js app directory (pages, layout, main logic)
- `components/` — UI components (table, upload, rules builder, etc.)
- `lib/` — i18n, types, utils, validation logic
- `public/` — Static assets (icons, images)
- `styles/` — Global styles

## Customization

- **i18n:** Edit `lib/i18n.ts` to add or update translations.
- **Validation Rules:** Extend `lib/types.ts` and `lib/validation.ts` for new rule types.
- **Branding:** Replace icons/images in `public/` and update metadata in `app/layout.tsx`.

## License

MIT
