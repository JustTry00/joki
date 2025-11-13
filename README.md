# TokenGen - ED.ENGDIS Auto-Answer Token System

A complete Next.js 14 application for managing access tokens to an ED.ENGDIS auto-answer script. This system includes authentication, payment processing via WhatsApp, admin approval workflow, and automated email delivery.

## Features

- 🔐 **Google OAuth Authentication** with NextAuth.js
- 💳 **Payment Processing** via WhatsApp with manual admin confirmation
- 📧 **Automated Email Delivery** with Nodemailer
- 🎯 **Token Management** with usage tracking and limits
- 👨‍💼 **Admin Dashboard** for order management
- 📊 **User Dashboard** with active tokens and usage stats
- 🎨 **Modern UI** with Tailwind CSS and shadcn/ui components
- 🗄️ **PostgreSQL Database** with Prisma ORM

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma
- **Authentication:** NextAuth.js v5
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Email:** Nodemailer

## Quick Start

### 1. Clone and Install

\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tokengen"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin Emails (comma-separated)
ADMIN_EMAILS="admin@example.com,admin2@example.com"

# Email Configuration (for Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@tokengen.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# WhatsApp Admin Number
NEXT_PUBLIC_ADMIN_WHATSAPP="628123456789"
\`\`\`

### 3. Database Setup

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Seed tier data
npx prisma db seed
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## Setup Guide

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use this password in `EMAIL_PASSWORD` environment variable

### Database Setup

This project uses PostgreSQL. You can use:
- Local PostgreSQL installation
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)

Update the `DATABASE_URL` in `.env` with your database connection string.

### Admin Configuration

Add admin email addresses to `ADMIN_EMAILS` environment variable (comma-separated). Users who sign in with these emails will have admin access.

## Project Structure

\`\`\`
├── app/
│   ├── api/              # API routes
│   │   └── [token]/      # Token validation endpoint
│   ├── admin/            # Admin dashboard
│   ├── auth/             # Authentication pages
│   ├── checkout/         # Checkout flow
│   ├── dashboard/        # User dashboard
│   ├── docs/             # Documentation page
│   ├── payment/          # Payment instructions
│   └── page.tsx          # Landing page
├── components/
│   ├── admin/            # Admin-specific components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── actions/          # Server actions
│   ├── email.ts          # Email utilities
│   ├── prisma.ts         # Prisma client
│   └── token-generator.ts # Token generation
├── prisma/
│   └── schema.prisma     # Database schema
├── public/
│   └── scripts/
│       └── ed-auto-answer.js # Auto-answer script
├── auth.config.ts        # NextAuth configuration
├── auth.ts               # NextAuth setup
└── middleware.ts         # Next.js middleware
\`\`\`

## Usage Flow

### For Users

1. **Browse Plans** - Visit homepage and view available pricing tiers
2. **Sign In** - Authenticate with Google account
3. **Purchase** - Select a plan and proceed to checkout
4. **Payment** - Contact admin via WhatsApp and upload payment proof
5. **Wait for Confirmation** - Admin will verify payment
6. **Receive Token** - Token is sent via email with usage instructions
7. **Use Token** - Copy code from email, paste in browser console on ED.ENGDIS

### For Admins

1. **Access Admin Panel** - Navigate to `/admin`
2. **Review Orders** - See all pending payment confirmations
3. **Verify Payment** - Check payment proof and WhatsApp messages
4. **Confirm/Reject** - Approve or reject orders
5. **Automatic Email** - System sends token to user automatically

## Token Usage

Users receive code like this via email:

\`\`\`javascript
fetch("https://your-domain.com/YOUR_TOKEN_HERE")
  .then(res => res.text())
  .then(code => eval(code))
  .catch(err => console.error("Error:", err))
\`\`\`

### How It Works

1. User pastes code in browser console while on ED.ENGDIS
2. Script fetches the auto-answer code using their unique token
3. Token is validated and usage is tracked
4. Auto-answer script loads and displays correct answers
5. User can click answers to auto-fill forms

## Features of Auto-Answer Script

- ✅ Auto-detects questions and displays answers in floating box
- ✅ Supports multiple question formats (multiple choice, fill-in-blank, images)
- ✅ Click to auto-fill functionality
- ✅ Draggable, minimizable UI
- ✅ Copy answers to clipboard
- ✅ Refresh button to reload answers
- ✅ Automatic detection of new questions

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Important Production Settings

- Set `NEXTAUTH_URL` to your production domain
- Set `NEXT_PUBLIC_APP_URL` to your production domain
- Use production database (not development)
- Set up proper email service (not Gmail for high volume)
- Configure proper CORS if needed

## Database Schema

### Models

- **User** - User accounts with Google OAuth
- **Tier** - Pricing plans with features
- **Order** - Purchase orders with payment tracking
- **Token** - Access tokens with usage limits
- **TokenUsage** - Usage logs for analytics

## Security

- ✅ Tokens are cryptographically random (32 bytes)
- ✅ Usage tracking prevents abuse
- ✅ Rate limiting on API endpoints
- ✅ Admin-only routes protected by middleware
- ✅ Email verification before token delivery
- ✅ Payment proof required for confirmation

## Customization

### Adding New Pricing Tiers

Edit `prisma/seed.ts` and add new tiers, then run:

\`\`\`bash
npx prisma db seed
\`\`\`

### Changing Email Templates

Edit `lib/email.ts` and modify the `generateEmailHTML` function.

### Customizing Auto-Answer Script

Edit `public/scripts/ed-auto-answer.js` to modify behavior or UI.

## Troubleshooting

### Email Not Sending

- Check EMAIL_* environment variables
- Verify Gmail app password is correct
- Check email logs in console

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check database is running
- Run `npx prisma db push` again

### OAuth Issues

- Verify redirect URIs in Google Console
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Token Not Working

- Check token hasn't expired
- Verify request limit not exceeded
- Check browser console for errors

## Scripts

\`\`\`bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma studio          # Open Prisma Studio
npx prisma db push         # Push schema changes
npx prisma db seed         # Seed database
npx prisma generate        # Generate Prisma Client

# Test email
npx tsx scripts/test-email.ts
\`\`\`

## Support

For issues or questions:
- Check `/docs` page in the application
- Review this README
- Contact admin via WhatsApp

## License

MIT License - feel free to use for your projects!

## Credits

Built with Next.js, Prisma, NextAuth, Tailwind CSS, and shadcn/ui.
\`\`\`

\`\`\`md file="" isHidden
