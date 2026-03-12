This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Variables

Copy the example file and fill in your own Supabase and database credentials:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_SERVICE_ROLE_KEY` when using the admin client

### Prisma workflow

Use two different environments:

- `.env.local` for the real Supabase database used by the app
- `.env.prisma.local` for local Docker Postgres used by `prisma migrate dev`

Create the Prisma local env from the example:

```bash
cp .env.prisma.local.example .env.prisma.local
```

Start the local Postgres + shadow databases:

```bash
npm run db:up
```

Then use Prisma locally:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Apply committed migrations to Supabase without using a shadow database:

```bash
npm run prisma:deploy
```

Supabase Row Level Security is managed separately in `prisma/rls.sql`.

### Node Version

This app supports Node.js versions `>=20.9.0 <25`.

If you use `nvm`:

```bash
nvm use
```

The repository includes an `.nvmrc` pinned to Node 24.

Quick verification:

```bash
node -v
npm run dev
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
