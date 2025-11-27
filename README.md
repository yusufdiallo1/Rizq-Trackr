# Rizq Trackr - Islamic Finance Tracker!

A comprehensive, modern finance management application built with Next.js 14, designed specifically for Muslims to track income, expenses, savings, and calculate Zakat obligations according to Islamic principles.

## 🌟 Overview

Rizq Trackr is a full-featured personal finance tracker that combines modern web technology with Islamic financial principles. The application provides a beautiful, mobile-first interface for managing your finances while ensuring compliance with Islamic guidelines, particularly for Zakat calculations.

**Live Application**: [https://rizqtrackr.com](https://rizqtrackr.com)

## ✨ Key Features

### ✅ Fully Implemented

- **🔐 Secure Authentication**
  - Email/password registration and login
  - Password reset functionality
  - Session management with Supabase Auth
  - Protected routes with middleware
  - PIN and biometric authentication support

- **📊 Comprehensive Dashboard**
  - Real-time financial overview
  - Income vs expenses comparison
  - Current savings tracking
  - Period-based filtering (Day, Week, Month, Year, All)
  - Beautiful visualizations and charts

- **💰 Income Tracking**
  - Add, edit, and delete income entries
  - Multiple categories (Salary, Business, Freelance, Gifts, Investments, Other)
  - Document scanning with OCR (invoice/check scanning)
  - Location tracking
  - Hijri date support
  - Zakatable income flagging
  - Period-based filtering and analytics

- **💸 Expense Tracking**
  - Complete expense management
  - Category-based organization (Housing, Food, Transport, Healthcare, Education, Charity, Entertainment, Bills, Other)
  - Receipt scanning with OCR
  - Location tracking
  - Hijri date support
  - Spending limits and budgets
  - Period-based filtering

- **📈 Savings Goals**
  - Create and manage savings goals
  - Progress tracking with visual indicators
  - Target dates and amounts
  - Custom icons and notes
  - Savings history charts

- **🕌 Zakat Calculator**
  - Automatic Zakat calculation based on Islamic principles
  - Nisab threshold checking (~85g gold equivalent)
  - Zakatable income management
  - Debt and liability deductions
  - 2.5% rate calculation
  - Payment recording and history
  - Educational content about Zakat

- **🥇 Precious Metals Converter**
  - Convert gold and silver to multiple currencies
  - Real-time market prices
  - Support for grams and ounces
  - Multiple currency support (USD, GBP, AED, SAR, EGP)
  - Nisab threshold information

- **📱 Mobile-First Design**
  - iPhone-native UI/UX
  - Responsive design for all devices
  - Touch-optimized interactions
  - Swipe gestures for actions
  - Pull-to-refresh functionality

- **🌙 Theme Support**
  - Dark mode and light mode
  - System preference detection
  - Smooth theme transitions

- **📅 Dual Calendar System**
  - Gregorian and Hijri date support
  - Automatic conversion
  - Date picker with both calendars

- **🔔 Notifications**
  - In-app notifications
  - Customizable preferences
  - Zakat reminders

- **📤 Data Export**
  - CSV export functionality
  - Transaction filtering before export

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui base
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (if needed)

### Additional Libraries
- **OCR**: Tesseract.js (for document scanning)
- **Date Handling**: hijri-date
- **AI**: OpenAI API (for document analysis)
- **Icons**: Custom SVG icons

## 📁 Project Structure

```
Finance Tracker/
├── app/                      # Next.js App Router pages
│   ├── analytics/           # Analytics and reports
│   ├── auth/                # Authentication callbacks
│   ├── dashboard/           # Main dashboard
│   ├── expenses/            # Expense tracking
│   ├── income/              # Income tracking
│   ├── savings/             # Savings goals
│   ├── transactions/        # All transactions view
│   ├── zakat/               # Zakat calculator
│   ├── profile/             # User profile
│   ├── settings/             # App settings
│   ├── notifications/       # Notifications center
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/              # React components
│   ├── layout/              # Layout components
│   ├── ui/                  # UI components
│   └── [feature].tsx        # Feature-specific components
├── lib/                     # Business logic and utilities
│   ├── auth.ts              # Authentication functions
│   ├── income.ts            # Income management
│   ├── expenses.ts          # Expense management
│   ├── savings.ts           # Savings goals
│   ├── zakat.ts             # Zakat calculations
│   ├── transactions.ts      # Transaction management
│   ├── precious-metals.ts   # Precious metals conversion
│   ├── contexts/            # React contexts
│   └── utils/               # Utility functions
├── types/                   # TypeScript type definitions
│   └── database.ts          # Database schema types
├── public/                  # Static assets
├── middleware.ts            # Next.js middleware
└── package.json             # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher.
- **npm** or **yarn** package manager
- **Supabase account** and project
- **Git** (for cloning)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yusufdiallo1/Rizq-Trackr.git
   cd Rizq-Trackr
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   If you encounter npm cache issues:
   ```bash
   sudo chown -R $(whoami) ~/.npm
   npm cache clean --force
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp env.example .env.local
   ```

   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key  # Optional, for document scanning
   ```

4. **Set up the database:**
   
   Run the SQL migrations in your Supabase dashboard:
   - `supabase_zakat_migrations.sql`
   - `supabase_savings_goals_table.sql`
   - `supabase_savings_goals_add_icon.sql`
   - `add_location_date_fields.sql`

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Available Pages

| Route | Description | Authentication Required |
|-------|-------------|----------------------|
| `/` | Homepage with features and information | No |
| `/login` | User login page | No |
| `/signup` | User registration | No |
| `/forgot-password` | Password reset | No |
| `/dashboard` | Main financial dashboard | Yes |
| `/income` | Income tracking and management | Yes |
| `/expenses` | Expense tracking and management | Yes |
| `/savings` | Savings goals and tracking | Yes |
| `/transactions` | All transactions view with filters | Yes |
| `/zakat` | Zakat calculator and payment history | Yes |
| `/analytics` | Financial analytics and reports | Yes |
| `/profile` | User profile management | Yes |
| `/settings` | Application settings | Yes |
| `/notifications` | Notification center | Yes |

## 🔐 Authentication

The application uses Supabase Auth for secure authentication:

- **Email/Password**: Standard email and password authentication
- **Session Management**: Automatic session handling
- **Protected Routes**: Middleware protects all financial pages
- **PIN Authentication**: Optional PIN for quick access
- **Biometric Auth**: WebAuthn support for biometric authentication

### Authentication Flow

1. User signs up with email and password
2. Email verification (can be disabled in Supabase settings)
3. User logs in and receives a session token
4. Session is stored securely and validated on each request
5. Protected routes check authentication before rendering

## 💰 Income Management

### Features

- **Add Income**: Quick add button with modal form
- **Categories**: Salary, Business, Freelance, Gifts, Investments, Other
- **Document Scanning**: Upload invoices or checks for automatic data extraction
- **Location Tracking**: Automatic location capture (optional)
- **Dual Dates**: Both Gregorian and Hijri dates stored
- **Zakatable Flag**: Mark income as zakatable for Zakat calculations
- **Filtering**: Filter by month, category, or time period
- **Edit/Delete**: Swipe gestures or buttons to edit/delete entries

### Document Scanning

The app uses OCR (Optical Character Recognition) to extract data from uploaded documents:
- Invoice scanning
- Check scanning
- Automatic amount, date, and category detection
- Confidence scoring for extracted data

## 💸 Expense Management

### Features

- **Add Expenses**: Quick entry with category selection
- **Categories**: Housing, Food, Transport, Healthcare, Education, Charity, Entertainment, Bills, Other
- **Receipt Scanning**: Upload receipts for automatic data extraction
- **Spending Limits**: Set limits per category
- **Budget Tracking**: Monitor spending against budgets
- **Location Tracking**: Track where expenses occur
- **Filtering**: Advanced filtering by date, category, amount range
- **Analytics**: Visual charts showing spending patterns

## 📈 Savings Goals

### Features

- **Create Goals**: Set savings goals with target amounts and dates
- **Progress Tracking**: Visual progress bars and percentages
- **Custom Icons**: Choose from various goal icons
- **History Charts**: View savings growth over time
- **Multiple Goals**: Manage multiple savings goals simultaneously
- **Notifications**: Get notified when goals are reached

## 🕌 Zakat Calculator

### Islamic Principles

The Zakat calculator follows authentic Islamic principles:

- **Nisab Threshold**: ~85g of gold (approximately $4,000 USD)
- **Hawl Requirement**: One lunar year of ownership
- **Zakatable Assets**: Income, savings, investments (if conditions met)
- **Debt Deduction**: Legitimate debts are deducted
- **Rate**: 2.5% of qualifying wealth

### Calculation Formula

```
Total Zakatable Wealth = (Current Savings + Zakatable Income) - Debts

IF Total Zakatable Wealth >= Nisab:
    Zakat Due = Total Zakatable Wealth × 0.025 (2.5%)
ELSE:
    Zakat Due = $0
```

### Features

- Automatic calculation from your financial data
- Toggle income entries as zakatable/non-zakatable
- Enter debts and liabilities
- View calculation breakdown
- Record Zakat payments
- Payment history tracking
- Educational content about Zakat

## 🥇 Precious Metals Converter

Convert gold and silver to multiple currencies with live market prices:

- **Metals**: Gold (Au) and Silver (Ag)
- **Units**: Grams and Ounces
- **Currencies**: USD, GBP, AED, SAR, EGP
- **Real-time Prices**: Updates hourly from market data
- **Nisab Information**: Shows Nisab thresholds for gold and silver

## 🔒 Security Features

### Row Level Security (RLS)

All database tables have RLS enabled:
   - Users can only access their own data
- Enforced at the database level
- Prevents unauthorized data access

### Authentication Security

   - Secure password requirements
- Session-based authentication
- Protected API routes
- Middleware validation

### Data Privacy

- All data is user-specific
- No data sharing between users
- Secure data transmission (HTTPS)
- Regular security updates

## 🎨 Design Features

### Mobile-First UI

- **iPhone-Native Design**: Follows iOS design guidelines
- **Touch Optimized**: Large tap targets, swipe gestures
- **Responsive**: Works on all screen sizes
- **Smooth Animations**: Framer Motion for fluid transitions
- **Glass Morphism**: Modern frosted glass effects

### Theme Support

- **Dark Mode**: Full dark theme support
- **Light Mode**: Clean light theme
- **System Preference**: Automatic theme detection
- **Smooth Transitions**: Theme switching animations

## 📊 Database Schema

### Core Tables

1. **income_entries**
   - User income records
   - Categories, amounts, dates
   - Zakatable flag
   - Location data
   - Hijri dates

2. **expense_entries**
   - User expense records
   - Categories, amounts, dates
   - Location data
   - Hijri dates

3. **savings_goals**
   - Savings goal definitions
   - Target amounts and dates
   - Progress tracking

4. **zakat_payments**
   - Zakat payment history
   - Amounts, dates, notes

5. **transactions**
   - Unified transaction view
   - Links to income/expense entries

All tables include:
- `user_id` for data isolation
- `created_at` timestamps
- `deleted_at` for soft deletes
- Row Level Security (RLS) policies

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Code Structure

- **Components**: Reusable UI components in `/components`
- **Pages**: Next.js pages in `/app`
- **Lib**: Business logic in `/lib`
- **Types**: TypeScript definitions in `/types`

### Best Practices

- TypeScript for type safety
- Component-based architecture
- Reusable utility functions
- Consistent naming conventions
- Mobile-first responsive design

## 🚀 Deployment

The application is configured for Vercel deployment:

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add Supabase credentials in Vercel dashboard
3. **Automatic Deployments**: Every push to main triggers a deployment
4. **Build Settings**: Configured in `vercel.json`

### Deployment Configuration

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## 🐛 Troubleshooting

### Common Issues

**npm install fails**
```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
npm install
```

**Database connection issues**
- Verify Supabase project is active
- Check environment variables in `.env.local`
- Ensure RLS policies are set up correctly

**Authentication not working**
- Check Supabase Auth settings
- Verify email confirmation settings
- Clear browser cookies and cache

**Build errors**
- Ensure all environment variables are set
- Check TypeScript errors: `npm run lint`
- Verify all dependencies are installed

## 📚 Additional Documentation

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Detailed authentication documentation
- [ZAKAT_FEATURE.md](./ZAKAT_FEATURE.md) - Zakat calculator documentation
- [ZAKAT_QUICK_START.md](./ZAKAT_QUICK_START.md) - Quick start guide for Zakat
- [MOBILE_OPTIMIZATION_SUMMARY.md](./MOBILE_OPTIMIZATION_SUMMARY.md) - Mobile optimization details

## 🤝 Contributing

This is a personal finance application. If you'd like to use it:

1. Fork the repository
2. Create your own Supabase project
3. Set up environment variables
4. Run database migrations
5. Start developing!

## 📄 License

Private project. All rights reserved.

## 🙏 Islamic Finance Note

This application implements Zakat calculation based on widely-accepted Islamic principles. However, for complex financial situations, users should consult with a qualified Islamic scholar or financial advisor to ensure proper Zakat calculation according to their specific circumstances and madhab (school of Islamic jurisprudence).

## 💻 Technology Highlights

- **Next.js 14**: Latest React framework with App Router
- **TypeScript**: Full type safety
- **Supabase**: Backend-as-a-Service for database and auth
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Production-ready motion library
- **Responsive Design**: Mobile-first approach
- **PWA Ready**: Can be installed as a Progressive Web App

## 📞 Support

For issues, questions, or contributions:
- Check the documentation files
- Review the codebase
- Check Supabase dashboard for data issues
- Review browser console for errors

---

**Built with ❤️ for the Muslim community**

*Rizq Trackr - Track your Rizq (sustenance) with Islamic principles*
