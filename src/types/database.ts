export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'manager' | 'operator'

export type CouponStatus = 'pending' | 'used' | 'expired' | 'cancelled'

export type PointTransactionType =
  | 'earn'
  | 'redeem'
  | 'adjust'
  | 'expire'
  | 'campaign_bonus'
  | 'refund'

export type RewardStatus = 'active' | 'inactive' | 'out_of_stock'

export type CampaignType =
  | 'double_points'
  | 'birthday'
  | 'product'
  | 'category'
  | 'weekday'

export type RedemptionStatus = 'pending' | 'completed' | 'cancelled'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'redeem'
  | 'cancel'
  | 'login'
  | 'export'

export interface PointsRule {
  real_amount: number
  points_earned: number
}

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          name: string
          code: string
          address: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      levels: {
        Row: {
          id: string
          name: string
          slug: string
          min_lifetime_points: number
          multiplier: number
          color: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          min_lifetime_points: number
          multiplier?: number
          color: string
          sort_order: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          min_lifetime_points?: number
          multiplier?: number
          color?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          phone: string
          first_name: string
          last_name: string
          birth_date: string | null
          email: string | null
          city: string | null
          lgpd_accepted_at: string | null
          lgpd_version: string | null
          balance_points: number
          lifetime_points: number
          level_id: string | null
          store_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          first_name: string
          last_name: string
          birth_date?: string | null
          email?: string | null
          city?: string | null
          lgpd_accepted_at?: string | null
          lgpd_version?: string | null
          balance_points?: number
          lifetime_points?: number
          level_id?: string | null
          store_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          first_name?: string
          last_name?: string
          birth_date?: string | null
          email?: string | null
          city?: string | null
          lgpd_accepted_at?: string | null
          lgpd_version?: string | null
          balance_points?: number
          lifetime_points?: number
          level_id?: string | null
          store_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          id: string
          code: string
          purchase_amount: number
          points_value: number
          status: CouponStatus
          expires_at: string
          used_at: string | null
          cancelled_at: string | null
          customer_id: string | null
          store_id: string | null
          created_by: string | null
          reprint_count: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          purchase_amount: number
          points_value: number
          status?: CouponStatus
          expires_at: string
          used_at?: string | null
          cancelled_at?: string | null
          customer_id?: string | null
          store_id?: string | null
          created_by?: string | null
          reprint_count?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          purchase_amount?: number
          points_value?: number
          status?: CouponStatus
          expires_at?: string
          used_at?: string | null
          cancelled_at?: string | null
          customer_id?: string | null
          store_id?: string | null
          created_by?: string | null
          reprint_count?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          id: string
          customer_id: string
          type: PointTransactionType
          points: number
          balance_after: number
          coupon_id: string | null
          redemption_id: string | null
          campaign_id: string | null
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          type: PointTransactionType
          points: number
          balance_after: number
          coupon_id?: string | null
          redemption_id?: string | null
          campaign_id?: string | null
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          type?: PointTransactionType
          points?: number
          balance_after?: number
          coupon_id?: string | null
          redemption_id?: string | null
          campaign_id?: string | null
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          category: string | null
          points_required: number
          quantity: number | null
          quantity_redeemed: number
          status: RewardStatus
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          category?: string | null
          points_required: number
          quantity?: number | null
          quantity_redeemed?: number
          status?: RewardStatus
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          category?: string | null
          points_required?: number
          quantity?: number | null
          quantity_redeemed?: number
          status?: RewardStatus
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          id: string
          customer_id: string
          reward_id: string
          points_spent: number
          status: RedemptionStatus
          completed_at: string | null
          cancelled_at: string | null
          store_id: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          reward_id: string
          points_spent: number
          status?: RedemptionStatus
          completed_at?: string | null
          cancelled_at?: string | null
          store_id?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          reward_id?: string
          points_spent?: number
          status?: RedemptionStatus
          completed_at?: string | null
          cancelled_at?: string | null
          store_id?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          name: string
          description: string | null
          type: CampaignType
          multiplier: number
          config: Json
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: CampaignType
          multiplier?: number
          config?: Json
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: CampaignType
          multiplier?: number
          config?: Json
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          id: string
          full_name: string
          role: UserRole
          store_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: UserRole
          store_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: UserRole
          store_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          action: AuditAction
          entity_type: string
          entity_id: string | null
          user_id: string | null
          metadata: Json
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          action: AuditAction
          entity_type: string
          entity_id?: string | null
          user_id?: string | null
          metadata?: Json
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          action?: AuditAction
          entity_type?: string
          entity_id?: string | null
          user_id?: string | null
          metadata?: Json
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_dashboard_stats: {
        Row: {
          total_customers: number | null
          active_customers: number | null
          inactive_customers: number | null
          total_coupons: number | null
          pending_coupons: number | null
          used_coupons: number | null
          expired_coupons: number | null
          total_points_issued: number | null
          total_redemptions: number | null
          avg_ticket: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_coupon_code: { Args: Record<string, never>; Returns: string }
      calculate_points_from_amount: { Args: { p_amount: number }; Returns: number }
      totem_lookup_customer: {
        Args: { p_phone: string }
        Returns: Json
      }
      totem_redeem_coupon: {
        Args: {
          p_code: string
          p_phone: string
          p_first_name?: string
          p_last_name?: string
          p_lgpd_accepted?: boolean
          p_birth_date?: string
          p_email?: string
          p_city?: string
        }
        Returns: Json
      }
      totem_get_customer_profile: {
        Args: { p_phone: string }
        Returns: Json
      }
      totem_redeem_reward: {
        Args: { p_phone: string; p_reward_id: string }
        Returns: Json
      }
      totem_get_reward_cooldowns: {
        Args: { p_phone: string }
        Returns: Json
      }
      admin_create_coupon: {
        Args: {
          p_purchase_amount: number
          p_store_id?: string
          p_validity_hours?: number
        }
        Returns: Json
      }
      expire_pending_coupons: { Args: Record<string, never>; Returns: number }
      admin_cancel_coupon: {
        Args: { p_coupon_id: string }
        Returns: Json
      }
      admin_reprint_coupon: {
        Args: { p_coupon_id: string }
        Returns: Json
      }
      admin_adjust_points: {
        Args: {
          p_customer_id: string
          p_points: number
          p_description?: string
        }
        Returns: Json
      }
    }
    Enums: {
      user_role: UserRole
      coupon_status: CouponStatus
      point_transaction_type: PointTransactionType
      reward_status: RewardStatus
      campaign_type: CampaignType
      redemption_status: RedemptionStatus
      audit_action: AuditAction
    }
    CompositeTypes: Record<string, never>
  }
}

export type Customer = Database['public']['Tables']['customers']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']
export type Reward = Database['public']['Tables']['rewards']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type PointTransaction = Database['public']['Tables']['point_transactions']['Row']
export type Redemption = Database['public']['Tables']['redemptions']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type Level = Database['public']['Tables']['levels']['Row']
export type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
export type Setting = Database['public']['Tables']['settings']['Row']

export interface TotemRedeemResult {
  success: boolean
  message: string
  needs_registration?: boolean
  points_added?: number
  balance?: number
  customer_id?: string
  customer_name?: string
  level_name?: string
  next_level_name?: string
  points_to_next_level?: number
  next_reward_name?: string
  points_to_next_reward?: number
}

export interface TotemLookupResult {
  found: boolean
  customer_id?: string
  first_name?: string
  last_name?: string
  balance?: number
  level_name?: string
}
