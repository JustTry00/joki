# TokenGen - Complete Setup Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Environment Variables

Add these environment variables in the **Vars section** of the v0 sidebar:

\`\`\`env
# Database (Required)
DATABASE_URL=postgresql://user:password@localhost:5432/tokengen

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-random-string-here

# Google OAuth (Required)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Configuration (Required)
ADMIN_EMAILS=your-email@gmail.com

# Email (Optional - for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@tokengen.com

# App Configuration (Required)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_WHATSAPP=628123456789
\`\`\`

### Step 2: Database Setup

The application uses **PostgreSQL with Prisma ORM**. You need to:

1. **Get a PostgreSQL database** (choose one):
   - Local PostgreSQL installation
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Recommended)
   - [Supabase](https://supabase.com/)
   - [Neon](https://neon.tech/)

2. **Update DATABASE_URL** in the Vars section with your connection string

3. **Initialize the database** (run these commands in terminal):
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   \`\`\`

### Step 3: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-domain.com/api/auth/callback/google` (for production)
5. Copy the **Client ID** and **Client Secret**
6. Add them to the Vars section

### Step 4: Test the Application

1. Start the development server (it should already be running in v0)
2. Visit the homepage
3. Click "Sign In" and authenticate with Google
4. You should see your dashboard

---

## 📧 Email Configuration (Production)

For **production email sending**, configure these in Vars:

### Using Gmail:

1. Enable 2-Factor Authentication on your Gmail
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Add to Vars:
   \`\`\`env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=noreply@yourdomain.com
   \`\`\`

### Preview Mode (Development):

If email variables are not set, the system will run in **preview mode** and log emails to the console instead of sending them.

---

## 👨‍💼 Admin Access

To make yourself an admin:

1. Add your Google email to `ADMIN_EMAILS` in Vars:
   \`\`\`env
   ADMIN_EMAILS=admin@example.com,admin2@example.com
   \`\`\`
2. Sign out and sign in again
3. Visit `/admin` to access the admin dashboard

---

## 🗄️ Database Schema

The application uses these main tables:

- **User** - User accounts with Google OAuth
- **Tier** - Pricing plans (seeded with 3 default tiers)
- **Order** - Purchase orders with payment tracking
- **Token** - Access tokens with usage limits
- **TokenUsage** - Usage logs for analytics

### Default Pricing Tiers:

After running `npx prisma db seed`, you'll have:

1. **Starter** - Rp 50,000 (100 requests, 30 days)
2. **Professional** - Rp 150,000 (500 requests, 60 days) [Popular]
3. **Enterprise** - Rp 500,000 (Unlimited, 1 year)

---

## 🔄 Complete User Flow

### For End Users:

1. **Browse** → Visit homepage, view pricing tiers
2. **Sign In** → Authenticate with Google
3. **Purchase** → Select a tier, proceed to checkout
4. **Payment** → Contact admin via WhatsApp, upload payment proof
5. **Wait** → Admin verifies payment
6. **Receive** → Token sent via email with instructions
7. **Use** → Paste code in browser console on ED.ENGDIS

### For Admins:

1. **Monitor** → Check `/admin` for pending orders
2. **Verify** → Review payment proof and WhatsApp messages
3. **Approve** → Click "Confirm" button
4. **Automatic** → System generates token and emails user

---

## 🎯 Token Usage Instructions

Users receive this code via email:

\`\`\`javascript
fetch("https://your-domain.com/YOUR_TOKEN")
  .then(res => res.text())
  .then(code => eval(code))
  .catch(err => console.error("Error:", err))
\`\`\`

### How to Use:

1. Open ED.ENGDIS learning page
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste the code above
5. Press **Enter**
6. Answer box will appear with correct answers
7. Click any answer to auto-fill

---

## 🔧 Troubleshooting

### "Database connection failed"
- Verify `DATABASE_URL` is correct in Vars
- Make sure database exists and is accessible
- Run `npx prisma db push` again

### "OAuth error"
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Verify redirect URIs in Google Console
- Make sure `NEXTAUTH_URL` matches your domain

### "Not authorized" when accessing admin
- Add your email to `ADMIN_EMAILS` in Vars
- Sign out and sign in again
- Check that email matches exactly

### "Email not sending"
- Check all `EMAIL_*` variables are set correctly
- For Gmail, use App Password, not regular password
- In development, emails are logged to console if not configured

### "Token not working"
- Check token hasn't expired
- Verify request limit not exceeded
- Make sure token is active in dashboard
- Check browser console for errors

---

## 📝 Customization

### Change Pricing Tiers:

Edit `scripts/seed-tiers.ts` and run:
\`\`\`bash
npx prisma db seed
\`\`\`

### Modify Email Template:

Edit the `generateEmailHTML` function in `lib/email.ts`

### Update Auto-Answer Script:

Edit `public/scripts/ed-auto-answer.js`

### Change Theme Colors:

Update CSS variables in `app/globals.css`

---

## 🚀 Deployment to Vercel

1. **Push to GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push
   \`\`\`

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add all environment variables from Vars section
   - Deploy!

3. **Post-Deployment**:
   - Update `NEXTAUTH_URL` to your production domain
   - Update `NEXT_PUBLIC_APP_URL` to your production domain
   - Add production redirect URI to Google Console
   - Run database migrations if needed

---

## ⚠️ Important Notes

### Security:
- ✅ Never commit `.env` file to Git
- ✅ Use strong `NEXTAUTH_SECRET` (32+ random characters)
- ✅ Keep admin emails private
- ✅ Use App Passwords for Gmail, not account password

### Production:
- ✅ Use production database (not development)
- ✅ Set up proper email service for high volume
- ✅ Configure CORS if needed
- ✅ Enable rate limiting on API routes
- ✅ Monitor token usage and abuse

### Maintenance:
- 📊 Check admin dashboard regularly
- 💰 Monitor order confirmations
- 📧 Test email delivery periodically
- 🔄 Update pricing tiers as needed

---

## 🆘 Getting Help

If you encounter issues:

1. Check this guide and README.md
2. Review `/docs` page in the application
3. Check browser console for errors
4. Verify all environment variables are set
5. Make sure database is running and accessible

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Database connected and seeded
- [ ] Google OAuth working
- [ ] Can sign in with Google
- [ ] Admin email added to ADMIN_EMAILS
- [ ] Can access /admin dashboard
- [ ] Email configuration tested
- [ ] Can create test order
- [ ] Can confirm order as admin
- [ ] Token email received
- [ ] Token works on ED.ENGDIS
- [ ] All environment variables set
- [ ] WhatsApp number configured

---

## 🎉 You're Ready!

Your TokenGen application is now fully set up and ready to use. Users can purchase tokens, and you can manage orders through the admin dashboard.

**Next steps:**
1. Test the complete flow yourself
2. Share the URL with your first users
3. Monitor the admin dashboard
4. Adjust pricing tiers as needed

Good luck! 🚀
