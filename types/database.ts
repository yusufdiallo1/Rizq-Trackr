export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      income_entries: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: 'Salary' | 'Business' | 'Freelance' | 'Gifts' | 'Investments' | 'Other'
          date: string
          notes: string | null
          is_zakatable: boolean
          created_at: string
          account_id: string | null
          customer_id: string | null
          location_latitude: number | null
          location_longitude: number | null
          location_address: string | null
          location_city: string | null
          location_country: string | null
          date_hijri: string | null
          time: string | null
          timezone: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: 'Salary' | 'Business' | 'Freelance' | 'Gifts' | 'Investments' | 'Other'
          date: string
          notes?: string | null
          is_zakatable?: boolean
          created_at?: string
          account_id?: string | null
          customer_id?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          date_hijri?: string | null
          time?: string | null
          timezone?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: 'Salary' | 'Business' | 'Freelance' | 'Gifts' | 'Investments' | 'Other'
          date?: string
          notes?: string | null
          is_zakatable?: boolean
          created_at?: string
          account_id?: string | null
          customer_id?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          date_hijri?: string | null
          time?: string | null
          timezone?: string | null
          deleted_at?: string | null
        }
      }
      expense_entries: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: 'Housing' | 'Food' | 'Transport' | 'Healthcare' | 'Education' | 'Charity' | 'Entertainment' | 'Bills' | 'Other'
          date: string
          notes: string | null
          created_at: string
          account_id: string | null
          customer_id: string | null
          location_latitude: number | null
          location_longitude: number | null
          location_address: string | null
          location_city: string | null
          location_country: string | null
          date_hijri: string | null
          time: string | null
          timezone: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: 'Housing' | 'Food' | 'Transport' | 'Healthcare' | 'Education' | 'Charity' | 'Entertainment' | 'Bills' | 'Other'
          date: string
          notes?: string | null
          created_at?: string
          account_id?: string | null
          customer_id?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          date_hijri?: string | null
          time?: string | null
          timezone?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: 'Housing' | 'Food' | 'Transport' | 'Healthcare' | 'Education' | 'Charity' | 'Entertainment' | 'Bills' | 'Other'
          date?: string
          notes?: string | null
          created_at?: string
          account_id?: string | null
          customer_id?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          date_hijri?: string | null
          time?: string | null
          timezone?: string | null
          deleted_at?: string | null
        }
      }
      zakat_payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          paid_date: string
          notes: string | null
          created_at: string
          date_hijri: string | null
          time: string | null
          timezone: string | null
          location_latitude: number | null
          location_longitude: number | null
          location_address: string | null
          location_city: string | null
          location_country: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          paid_date: string
          notes?: string | null
          created_at?: string
          date_hijri?: string | null
          time?: string | null
          timezone?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          paid_date?: string
          notes?: string | null
          created_at?: string
          date_hijri?: string | null
          time?: string | null
          timezone?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          deleted_at?: string | null
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          goal_name: string
          target_amount: number
          icon: string | null
          target_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_name: string
          target_amount: number
          icon?: string | null
          target_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_name?: string
          target_amount?: number
          icon?: string | null
          target_date?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'Checking' | 'Savings' | 'Credit Card' | 'Investment' | 'Cash' | 'Other'
          balance: number
          currency: string
          bank_name: string | null
          account_number: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'Checking' | 'Savings' | 'Credit Card' | 'Investment' | 'Cash' | 'Other'
          balance?: number
          currency?: string
          bank_name?: string | null
          account_number?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'Checking' | 'Savings' | 'Credit Card' | 'Investment' | 'Cash' | 'Other'
          balance?: number
          currency?: string
          bank_name?: string | null
          account_number?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          amount: number
          period: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
          start_date: string
          end_date: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          amount: number
          period: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
          start_date: string
          end_date?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          amount?: number
          period?: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
          start_date?: string
          end_date?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category: string
          frequency: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
          start_date: string
          end_date: string | null
          next_due_date: string
          account_id: string | null
          customer_id: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category: string
          frequency: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
          start_date: string
          end_date?: string | null
          next_due_date: string
          account_id?: string | null
          customer_id?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense'
          amount?: number
          category?: string
          frequency?: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
          start_date?: string
          end_date?: string | null
          next_due_date?: string
          account_id?: string | null
          customer_id?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      transaction_tags: {
        Row: {
          id: string
          user_id: string
          tag_id: string
          transaction_type: 'income' | 'expense'
          transaction_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tag_id: string
          transaction_type: 'income' | 'expense'
          transaction_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tag_id?: string
          transaction_type?: 'income' | 'expense'
          transaction_id?: string
          created_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          user_id: string
          transaction_type: 'income' | 'expense' | 'zakat' | 'transfer'
          transaction_id: string
          file_name: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: 'income' | 'expense' | 'zakat' | 'transfer'
          transaction_id: string
          file_name: string
          file_url: string
          file_size?: number | null
          mime_type?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: 'income' | 'expense' | 'zakat' | 'transfer'
          transaction_id?: string
          file_name?: string
          file_url?: string
          file_size?: number | null
          mime_type?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      transfers: {
        Row: {
          id: string
          user_id: string
          from_account_id: string
          to_account_id: string
          amount: number
          transfer_date: string
          exchange_rate: number
          fees: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          from_account_id: string
          to_account_id: string
          amount: number
          transfer_date: string
          exchange_rate?: number
          fees?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          from_account_id?: string
          to_account_id?: string
          amount?: number
          transfer_date?: string
          exchange_rate?: number
          fees?: number
          notes?: string | null
          created_at?: string
        }
      }
      nisab_prices: {
        Row: {
          id: string
          date: string
          gold_price_per_gram: number
          silver_price_per_gram: number
          nisab_gold_value: number
          nisab_silver_value: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          gold_price_per_gram: number
          silver_price_per_gram: number
          nisab_gold_value: number
          nisab_silver_value: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          gold_price_per_gram?: number
          silver_price_per_gram?: number
          nisab_gold_value?: number
          nisab_silver_value?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

