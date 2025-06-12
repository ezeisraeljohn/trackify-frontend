# Trackify

Trackify is a modern financial dashboard that allows users to securely link their Nigerian bank accounts, analyze transactions, and gain AI-powered financial insights. Built with Next.js, React, Tailwind CSS, and Mono Connect.

## Features

- Secure bank account linking via [Mono Connect](https://mono.co/)
- Real-time transaction sync and analytics
- AI-powered assistant for financial queries
- Modern, responsive UI with dark mode
- User authentication and email verification

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- pnpm (or npm/yarn)
- [Mono Connect](https://mono.co/) public key and API backend

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/trackify.git
   cd trackify-frontend
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file in the root directory and add:

   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_MONO_PUBLIC_KEY=your_mono_public_key
   ```

   Adjust the API base URL and Mono public key as needed.

4. **Run the development server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js app directory (pages, layouts, etc.)
- `components/` - Reusable React components and UI primitives
- `hooks/` - Custom React hooks
- `lib/` - Utility functions
- `public/` - Static assets (images, SVGs)
- `styles/` - Global CSS (Tailwind)
- `global.d.ts` - TypeScript global declarations

## Scripts

- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint

## Customization

- **Theme:** Uses Tailwind CSS with custom variables and dark mode support.
- **API:** Expects a backend compatible with the provided API endpoints.
- **Bank Linking:** Uses Mono Connect for secure account linking.

## License

MIT

---
