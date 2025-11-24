# Finance Tracker

A comprehensive Next.js 14 Finance Tracker application with Supabase integration for tracking income, expenses, and Zakat payments with authentic Islamic principles.

## 🌟 Features

- ✅ **User Authentication** - Secure login/signup with email verification
- ✅ **Dashboard** - Overview of income, expenses, savings, and Zakat
- ✅ **Zakat Calculator** - Calculate Zakat obligations based on Islamic principles
- 💰 **Income Tracking** - Record and manage income entries (Coming Soon)
- 💸 **Expense Tracking** - Track spending by category (Coming Soon)
- 📊 **Savings Tracker** - Monitor savings goals (Coming Soon)
- 📈 **Reports & Analytics** - Financial insights (Coming Soon)

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## 📁 Project Structure

```
/app                    # Next.js App Router routes
  /login               # Login page
  /signup              # Sign up page
  /forgot-password     # Password reset
  /dashboard           # Main dashboard
  /zakat               # Zakat calculator
  /auth/callback       # Auth callback handler
/components            # Reusable UI components
  MetricCard.tsx       # Dashboard metric display
/lib                   # Utilities and business logic
  auth.ts              # Authentication functions
  database.ts          # Database queries
  zakat.ts             # Zakat calculation logic
  supabase.ts          # Supabase client
  utils.ts             # Helper functions
/types                 # TypeScript type definitions
  database.ts          # Database schema types
```

## 📊 Database Schema

### Tables

1. **income_entries**
   - Tracks all income with categories
   - `is_zakatable` flag for Zakat calculation
   - Categories: Salary, Business, Freelance, Gifts, Investments, Other

2. **expense_entries**
   - Tracks all expenses by category
   - Categories: Housing, Food, Transport, Healthcare, Education, Charity, Entertainment, Bills, Other

3. **zakat_payments**
   - Records Zakat payment history
   - Includes amount, date, and notes

All tables have **Row Level Security (RLS)** enabled for data isolation.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project

### Installation

1. **Clone and navigate to project:**
   ```bash
   cd "Finance Tracker"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   If you encounter npm cache issues:
   ```bash
   sudo chown -R $(whoami) ~/.npm
   npm install
   ```

3. **Set up environment variables:**
   
   Copy the example file:
   ```bash
   cp env.example .env.local
   ```

   The `.env.local` file should contain:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://akufeyurndcymmosmikd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

Complete authentication system with:
- Email/password sign up with verification
- Secure login with validation
- Password reset functionality
- Protected routes with middleware
- Session management

**Detailed docs**: See [AUTHENTICATION.md](./AUTHENTICATION.md)

## 💰 Zakat Calculator

Comprehensive Islamic Zakat calculator featuring:

### Key Features
- **Step-by-step calculation** following Islamic principles
- **Nisab threshold** check ($4,000 ≈ 85g gold)
- **Zakatable income** management with toggle checkboxes
- **Debts & liabilities** deduction
- **2.5% rate** calculation
- **Payment recording** and history
- **Educational content** explaining Islamic concepts

### Islamic Principles
- ✅ Nisab threshold (85g gold equivalent)
- ✅ Hawl (one lunar year) requirement
- ✅ Zakatable vs non-zakatable assets
- ✅ Legitimate debt deduction
- ✅ 2.5% rate on qualifying wealth

### Calculation Formula
```
Total Zakatable Wealth = (Current Savings + Zakatable Income) - Debts

IF Total Zakatable Wealth >= Nisab ($4,000):
    Zakat Due = Total Zakatable Wealth × 0.025 (2.5%)
ELSE:
    Zakat Due = $0
```

**Detailed docs**: See [ZAKAT_FEATURE.md](./ZAKAT_FEATURE.md)

## 📱 Pages & Routes

| Route | Description | Protected |
|-------|-------------|-----------|
| `/` | Home/landing page | No |
| `/login` | User login | No |
| `/signup` | User registration | No |
| `/forgot-password` | Password reset | No |
| `/dashboard` | Main dashboard | Yes |
| `/zakat` | Zakat calculator | Yes |
| `/income` | Income management | Yes (Coming Soon) |
| `/expenses` | Expense tracking | Yes (Coming Soon) |
| `/savings` | Savings tracker | Yes (Coming Soon) |

## 🔒 Security Features

1. **Row Level Security (RLS)**
   - Enabled on all tables
   - Users can only access their own data
   - Enforced at database level

2. **Authentication**
   - Email verification required
   - Secure password requirements
   - Session-based auth with Supabase

3. **Protected Routes**
   - Middleware validates every request
   - Auto-redirect based on auth state
   - No unauthorized access

4. **Input Validation**
   - Client-side validation
   - Type safety with TypeScript
   - Database constraints

## 📊 Dashboard Metrics

The dashboard displays:
- **Total Income** (Current Month)
- **Total Expenses** (Current Month)
- **Current Savings** (All Time)
- **Zakat Owed** (If above Nisab)

## 🧪 Testing

### Test Authentication
1. Sign up with a valid email
2. Check email for verification link
3. Login with credentials
4. Access dashboard

### Test Zakat Calculator
1. Navigate to `/zakat`
2. Review auto-calculated savings
3. Toggle income entries as zakatable
4. Enter debts (if any)
5. View calculation result
6. Record a payment
7. Check payment history

## 🗄️ Database Functions

### Authentication (`/lib/auth.ts`)
- `signUp()` - Create new account
- `signIn()` - Login user
- `signOut()` - Logout
- `resetPassword()` - Send reset email
- `getCurrentUser()` - Get logged-in user
- `isAuthenticated()` - Check auth status

### Database Queries (`/lib/database.ts`)
- `getDashboardData()` - Fetch dashboard metrics
- `getIncomeEntries()` - Get all income
- `getExpenseEntries()` - Get all expenses
- `getZakatPayments()` - Get payment history

### Zakat Calculations (`/lib/zakat.ts`)
- `getNisabThreshold()` - Get Nisab value
- `getZakatableIncome()` - Get zakatable entries
- `calculateZakatDue()` - Main calculation
- `toggleIncomeZakatable()` - Update zakatable status
- `recordZakatPayment()` - Save payment
- `getZakatHistory()` - Get payment history

## 🎨 Styling

Currently using basic HTML with inline styles for:
- Clean, professional appearance
- Responsive grid layouts
- Color-coded sections
- Accessible forms

**Note**: shadcn/ui is configured but components not yet integrated. Will be styled with Tailwind CSS + shadcn/ui in future updates.

## 🚧 Coming Soon

- [ ] Income entry forms with CRUD operations
- [ ] Expense tracking with categories
- [ ] Savings goals and tracking
- [ ] Charts and visualizations
- [ ] Filtering and search
- [ ] Export to PDF/CSV
- [ ] Multi-currency support
- [ ] Advanced Zakat features (dynamic Nisab, lunar calendar)
- [ ] Mobile app (React Native)

## 📚 Documentation

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Complete auth system docs
- [ZAKAT_FEATURE.md](./ZAKAT_FEATURE.md) - Zakat calculator documentation
- [.mcp.json](./.mcp.json) - MCP configuration for Supabase

## 🤝 Contributing

This is a personal finance tracker. If you'd like to use it:
1. Fork the repository
2. Create your own Supabase project
3. Update environment variables
4. Run migrations (already applied via MCP)

## 📄 License

Private project. Not licensed for public use.

## 🙏 Islamic Finance Note

This application implements Zakat calculation based on widely-accepted Islamic principles. However, for complex financial situations, users should consult with a qualified Islamic scholar or financial advisor to ensure proper Zakat calculation according to their specific circumstances and madhab (school of Islamic jurisprudence).

## 💻 Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Run Linter
```bash
npm run lint
```

## 🐛 Troubleshooting

### npm install fails
```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
npm install
```

### Database connection issues
- Check Supabase project is active
- Verify environment variables in `.env.local`
- Check network connection

### Auth not working
- Confirm email verification
- Check Supabase Auth settings
- Clear browser cookies

### Zakat calculation incorrect
- Verify all income/expenses are entered
- Check zakatable status of income
- Ensure debts are correct
- Review [ZAKAT_FEATURE.md](./ZAKAT_FEATURE.md)

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review Supabase dashboard for data
3. Check browser console for errors
4. Verify environment variables!

---

**Built with ❤️ using Next.js 14 and Supabase**
