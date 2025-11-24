# Zakat Calculator Feature Documentation

## Overview

The Zakat Calculator is a comprehensive Islamic finance tool that helps users calculate their Zakat obligation based on authentic Islamic principles. It follows the traditional methodology of calculating Zakat at 2.5% of qualifying wealth that has been held for one lunar year.

## Features Implemented

### 1. **Step-by-Step Calculation**

The calculator guides users through a 4-step process:

#### Step 1: Calculate Zakatable Wealth
- **Current Savings**: Auto-calculated from (Total Income - Total Expenses - Zakat Paid)
- **Zakatable Income**: Shows all income entries marked as zakatable
  - Users can toggle which income is zakatable via checkbox
  - Only income held for one lunar year should be marked
- **Debts & Liabilities**: Adjustable field to subtract legitimate debts
- **Total Zakatable Wealth**: Calculated as (Savings + Zakatable Income) - Debts

#### Step 2: Check Nisab Threshold
- **Nisab Amount**: $4,000 (configurable, represents ~85g gold)
- Clear display of threshold with explanation
- Automatically checks if wealth exceeds Nisab

#### Step 3: Calculate Zakat
**If wealth ≥ Nisab:**
- Displays Zakat Due: Total Zakatable Wealth × 2.5%
- Shows detailed calculation breakdown
- Provides step-by-step calculation table

**If wealth < Nisab:**
- Displays "No Zakat obligation" message
- Shows amount needed to reach Nisab threshold

#### Step 4: Record Payment
- "Mark as Paid" button opens payment form
- Pre-fills calculated amount (editable)
- Captures:
  - Amount paid
  - Payment date (defaults to today)
  - Optional notes (e.g., "Paid to local masjid")
- Saves to `zakat_payments` table
- Updates all calculations after recording

### 2. **Income Management**

Users can manage which income counts as zakatable:
- View all income entries in a table
- Toggle `is_zakatable` checkbox for each entry
- Real-time recalculation when toggling
- Properly explained criteria (held for one lunar year)

### 3. **Zakat Payment History**

Complete audit trail of all Zakat payments:
- Table showing all past payments
- Columns: Date Paid, Amount, Notes
- Total Zakat paid (all-time) displayed at bottom
- Sorted by most recent first

### 4. **Educational Content**

Comprehensive Islamic explanations included:

**What is Zakat?**
- Definition and importance
- Rate: 2.5% of qualifying wealth
- Time requirement: One lunar year (Hawl)

**What is Nisab?**
- Minimum threshold (85g gold or 595g silver)
- Current dollar equivalent: $4,000

**What is Zakatable?**
- Cash, savings, gold, silver
- Business inventory, stocks
- Investment income

**What is Excluded?**
- Primary residence
- Personal vehicle
- Work tools and equipment
- Household items

## Database Schema Integration

### Tables Used

1. **income_entries**
   - `is_zakatable` (boolean) - marks income held for one year
   - Used to calculate zakatable wealth

2. **zakat_payments**
   - Records all Zakat payments
   - Fields: amount, paid_date, notes
   - Linked to user via `user_id`

3. **expense_entries**
   - Used to calculate current savings
   - Subtracted from total income

## Functions in `/lib/zakat.ts`

### Core Functions

1. **`getNisabThreshold(): number`**
   - Returns current Nisab threshold ($4,000)
   - Configurable for future updates

2. **`getZakatableIncome(userId): Promise<ZakatableIncome[]>`**
   - Fetches all income where `is_zakatable = true`
   - Returns array of income entries

3. **`getAllIncome(userId): Promise<ZakatableIncome[]>`**
   - Fetches all income entries (for toggle UI)
   - Used in income management section

4. **`toggleIncomeZakatable(incomeId, userId, isZakatable): Promise<{success, error}>`**
   - Updates `is_zakatable` flag for specific income entry
   - Includes user ownership validation

5. **`calculateCurrentSavings(userId): Promise<number>`**
   - Formula: Total Income - Total Expenses - Total Zakat Paid
   - Returns current savings balance

6. **`calculateZakatDue(userId, debts): Promise<ZakatCalculation>`**
   - Main calculation function
   - Returns complete calculation object with:
     - Current savings
     - Zakatable income
     - Debts
     - Total zakatable wealth
     - Nisab threshold
     - Zakat due amount
     - Whether above Nisab
     - Amount to reach Nisab

7. **`recordZakatPayment(userId, amount, date, notes): Promise<{success, error}>`**
   - Saves payment to database
   - Validates user ownership

8. **`getZakatHistory(userId): Promise<ZakatPaymentRecord[]>`**
   - Fetches all past payments
   - Sorted by date (most recent first)

9. **`getTotalZakatPaid(userId): Promise<number>`**
   - Calculates sum of all Zakat payments
   - Used in savings calculation

## Islamic Principles Implemented

### 1. **Nisab Threshold**
- Set at $4,000 (approximate value of 85g gold)
- Properly explained to users
- Only wealth above Nisab is subject to Zakat

### 2. **Hawl (One Lunar Year)**
- Users manually mark income that has been held for one year
- Checkbox system for `is_zakatable` status
- Educational content explains this requirement

### 3. **Deductible Debts**
- Users can subtract legitimate debts
- Reduces zakatable wealth appropriately
- Follows authentic Islamic rulings

### 4. **2.5% Rate**
- Standard Zakat rate applied correctly
- Calculated only on qualifying wealth
- Clear breakdown shown to users

### 5. **Zakatable vs Non-Zakatable Assets**
- Clear educational content on what qualifies
- Savings and cash included by default
- Exclusions properly explained

## User Experience Flow

### First-Time User
1. Navigate to `/zakat` from dashboard
2. Read educational content
3. Review auto-calculated savings
4. Mark income entries as zakatable (if held 1 year)
5. Enter any debts/liabilities
6. View calculation result
7. If Zakat due: Record payment
8. View payment history

### Returning User
1. Quick access to updated calculation
2. Toggle zakatable status as income matures
3. Update debts if changed
4. Record payments regularly
5. Track payment history

## Calculation Examples

### Example 1: Wealth Above Nisab

```
Current Savings: $5,000
Zakatable Income: $2,000
Debts: $500

Total Zakatable Wealth = $5,000 + $2,000 - $500 = $6,500
Nisab Threshold = $4,000
Is Above Nisab? Yes

Zakat Due = $6,500 × 0.025 = $162.50
```

### Example 2: Wealth Below Nisab

```
Current Savings: $3,000
Zakatable Income: $500
Debts: $200

Total Zakatable Wealth = $3,000 + $500 - $200 = $3,300
Nisab Threshold = $4,000
Is Above Nisab? No

Zakat Due = $0
Amount to Reach Nisab = $4,000 - $3,300 = $700
```

## Protected Route

The `/zakat` page is a protected route:
- Requires authentication
- Redirects to `/login` if not authenticated
- Configured in `middleware.ts`

## Styling

Basic HTML structure with inline styles:
- Clean, readable layout
- Color-coded sections:
  - Blue: Information boxes
  - Green: Zakat due / success messages
  - Yellow/Amber: Total zakatable wealth
  - Gray: Neutral content
- Responsive design (grid layout adapts to screen size)
- Professional appearance suitable for Islamic finance

## Future Enhancements

Potential improvements for later versions:

1. **Dynamic Nisab Updates**
   - Fetch current gold/silver prices from API
   - Update Nisab threshold automatically
   - Option to use gold or silver standard

2. **Lunar Calendar Integration**
   - Track exact Hawl completion dates
   - Automatic reminders when income matures
   - Islamic calendar display

3. **Multiple Calculation Methods**
   - Gold standard (85g)
   - Silver standard (595g)
   - Custom threshold

4. **Advanced Asset Types**
   - Business inventory tracking
   - Stock/investment portfolios
   - Gold/silver holdings
   - Real estate (rental properties)

5. **Reports & Analytics**
   - Annual Zakat summary
   - Payment trends over time
   - Charitable giving insights
   - Export to PDF

6. **Reminders & Notifications**
   - Zakat due date reminders
   - Email/SMS notifications
   - Hawl completion alerts

7. **Multi-Currency Support**
   - Support for different currencies
   - Automatic conversion rates
   - Regional Nisab values

8. **Beneficiary Management**
   - Track who received Zakat
   - Distribution records
   - Eligible categories of recipients

## Testing Checklist

- [ ] Savings calculation matches database totals
- [ ] Toggling zakatable status recalculates correctly
- [ ] Debts properly reduce zakatable wealth
- [ ] Nisab check works at threshold boundary
- [ ] 2.5% calculation is accurate
- [ ] Payment recording saves to database
- [ ] Payment history displays correctly
- [ ] Total paid calculation is accurate
- [ ] Educational content is visible and readable
- [ ] Page is protected (requires login)
- [ ] All data is user-specific (RLS working)

## Security Considerations

1. **Row Level Security (RLS)**
   - All queries filtered by `user_id`
   - Users can only see/modify their own data
   - Enforced at database level

2. **Input Validation**
   - Amount fields validated (positive numbers)
   - Date fields validated
   - User authentication checked on every request

3. **Data Privacy**
   - Financial data never exposed to other users
   - No public-facing endpoints
   - Secure Supabase connection

## API Endpoints Used

All operations use Supabase client-side queries:
- `income_entries` table (SELECT, UPDATE)
- `expense_entries` table (SELECT)
- `zakat_payments` table (INSERT, SELECT)

No custom API routes required - all handled by Supabase RLS.

## Troubleshooting

### Calculation Shows $0 When It Shouldn't
- Check if income entries are marked as zakatable
- Verify savings calculation includes all income/expenses
- Ensure debts are entered correctly

### Can't Toggle Zakatable Status
- Verify user is logged in
- Check RLS policies on income_entries table
- Ensure user owns the income entry

### Payment Not Recording
- Check required fields (amount, date)
- Verify user authentication
- Check RLS policies on zakat_payments table
- Look for console errors

## Accessing the Feature

From Dashboard:
1. Add a "Calculate Zakat" button to navigation
2. Direct link: `/zakat`
3. Metric card on dashboard shows Zakat owed

Direct URL: `http://localhost:3000/zakat`

