import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '../config/supabase'

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

// Database types based on your existing interfaces
export interface Database {
  public: {
    Tables: {
      investments: {
        Row: {
          id: string
          name: string
          type: 'private_equity' | 'real_estate' | 'hedge_fund' | 'venture_capital'
          amount: number
          current_value: number
          return_rate: number
          status: 'active' | 'closed' | 'pending'
          date_invested: string
          maturity_date?: string
          description: string
          risk_level: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'private_equity' | 'real_estate' | 'hedge_fund' | 'venture_capital'
          amount: number
          current_value: number
          return_rate: number
          status: 'active' | 'closed' | 'pending'
          date_invested: string
          maturity_date?: string
          description: string
          risk_level: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'private_equity' | 'real_estate' | 'hedge_fund' | 'venture_capital'
          amount?: number
          current_value?: number
          return_rate?: number
          status?: 'active' | 'closed' | 'pending'
          date_invested?: string
          maturity_date?: string
          description?: string
          risk_level?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          deal: string
          issuer: string
          currency: string
          country_of_risk: string
          collateral_description: string
          contract_date: string
          asset_manager: string
          asset_manager_name: string
          amount: string
          status: 'Active' | 'Pending' | 'Completed' | 'Failed' | 'Cancelled'
          investor_name?: string
          fund_name?: string
          transaction_type?: string
          share_price?: string
          number_of_shares?: string
          total_value?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal: string
          issuer: string
          currency: string
          country_of_risk: string
          collateral_description: string
          contract_date: string
          asset_manager: string
          asset_manager_name: string
          amount: string
          status: 'Active' | 'Pending' | 'Completed' | 'Failed' | 'Cancelled'
          investor_name?: string
          fund_name?: string
          transaction_type?: string
          share_price?: string
          number_of_shares?: string
          total_value?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal?: string
          issuer?: string
          currency?: string
          country_of_risk?: string
          collateral_description?: string
          contract_date?: string
          asset_manager?: string
          asset_manager_name?: string
          amount?: string
          status?: 'Active' | 'Pending' | 'Completed' | 'Failed' | 'Cancelled'
          investor_name?: string
          fund_name?: string
          transaction_type?: string
          share_price?: string
          number_of_shares?: string
          total_value?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'manager' | 'investor'
          status: 'active' | 'inactive'
          last_login?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'admin' | 'manager' | 'investor'
          status: 'active' | 'inactive'
          last_login?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'manager' | 'investor'
          status?: 'active' | 'inactive'
          last_login?: string
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          date: string
          time: string
          type: 'meeting' | 'deadline' | 'review' | 'other'
          description?: string
          participants?: string[]
          status: 'scheduled' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          time: string
          type: 'meeting' | 'deadline' | 'review' | 'other'
          description?: string
          participants?: string[]
          status: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          time?: string
          type?: 'meeting' | 'deadline' | 'review' | 'other'
          description?: string
          participants?: string[]
          status?: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      facilities: {
        Row: {
          id: string
          transaction_id: string
          investment_name: string
          facility_type: string
          payment_rank: string
          seniority: string
          currency: string
          from_date: string
          status: string
          investment_type?: string
          has_tranche?: string
          isin?: string
          cusip?: string
          bbg_id?: string
          fisn?: string
          internal_deal_id?: string
          loan_reference_number?: string
          fund_id?: string
          covenant_id?: string
          asset_classification?: string
          asset_tag?: string
          sector?: string
          sub_sector?: string
          instrument_type?: string
          country_of_risk?: string
          general_terms?: any
          cashflows?: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          investment_name: string
          facility_type: string
          payment_rank: string
          seniority: string
          currency: string
          from_date: string
          status: string
          investment_type?: string
          has_tranche?: string
          isin?: string
          cusip?: string
          bbg_id?: string
          fisn?: string
          internal_deal_id?: string
          loan_reference_number?: string
          fund_id?: string
          covenant_id?: string
          asset_classification?: string
          asset_tag?: string
          sector?: string
          sub_sector?: string
          instrument_type?: string
          country_of_risk?: string
          general_terms?: any
          cashflows?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          investment_name?: string
          facility_type?: string
          payment_rank?: string
          seniority?: string
          currency?: string
          from_date?: string
          status?: string
          investment_type?: string
          has_tranche?: string
          isin?: string
          cusip?: string
          bbg_id?: string
          fisn?: string
          internal_deal_id?: string
          loan_reference_number?: string
          fund_id?: string
          covenant_id?: string
          asset_classification?: string
          asset_tag?: string
          sector?: string
          sub_sector?: string
          instrument_type?: string
          country_of_risk?: string
          general_terms?: any
          cashflows?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}