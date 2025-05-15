# Invoice Generator

This is a [Next.js](https://nextjs.org/) application that allows users to generate a PDF summary for a Garage listing by providing its URL. The application fetches listing details, displays them, and offers a PDF download option.

It is deployed and can be viewed live at: [https://garage-beta-one.vercel.app/](https://garage-beta-one.vercel.app/)

## Features

- Input a Garage listing URL.
- Validates the URL format.
- Fetches listing details from a backend API.
- Displays key listing information including title, brand, year, price, description, and an image.
- Generates a downloadable PDF summary of the listing details.
- Uses `next/image` for optimized image display.
- Includes a CORS proxy for robust external image fetching for PDF generation.
- Styled with Tailwind CSS, aiming for a shadcn UI aesthetic.

## Getting Started

### Prerequisites

- Node.js
- npm, yarn, pnpm, or bun

### Setup

1.  **Clone the repository (if applicable) or ensure you are in the project directory.**

2.  **Install project dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Install dependencies for PDF generation and ESLint/Prettier (if not already included as direct dependencies in `package.json`):**
    While `jspdf` and `jspdf-autotable` are direct dependencies for the application's functionality, the ESLint/Prettier setup requires specific dev dependencies.

    For PDF generation (direct dependencies):

    ```bash
    npm install jspdf jspdf-autotable
    # or
    yarn add jspdf jspdf-autotable
    ```

    For ESLint & Prettier integration (dev dependencies):

    ```bash
    npm install --save-dev eslint-plugin-prettier eslint-config-prettier
    # or
    yarn add --dev eslint-plugin-prettier eslint-config-prettier
    ```

### Running the Development Server

Execute one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure Highlights

- `app/page.tsx`: The main page component for the invoice generator.
- `app/components/`: Contains reusable React components.
  - `ListingDetailsCard.tsx`: Displays the fetched listing information.
  - `spinner.tsx`: A loading spinner component.
- `app/utils/currency.ts`: Utility functions, e.g., for formatting currency.
- `app/types/index.ts`: Shared TypeScript type definitions.
- `app/api/image-proxy/route.ts`: Next.js API route for proxying images to avoid CORS issues in PDF generation.
- `next.config.ts` (or `next.config.js`): Next.js configuration, including `images.remotePatterns` for `next/image` optimization of external images.
- `eslint.config.mjs`: ESLint flat configuration file for code linting and Prettier integration.

## Key Technologies Used

- [Next.js](https://nextjs.org/) (App Router)
- React
- TypeScript
- Tailwind CSS
- `jspdf` & `jspdf-autotable` for PDF generation
- ESLint & Prettier for code quality and formatting
