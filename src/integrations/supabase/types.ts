export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          detail: Json
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          detail?: Json
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          detail?: Json
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          recipient_id: string | null
          sender_type: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          recipient_id?: string | null
          sender_type?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          recipient_id?: string | null
          sender_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contributors: {
        Row: {
          created_at: string
          group_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          target_amount: number | null
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          target_amount?: number | null
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          target_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contributors_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_news: {
        Row: {
          auto_blog_post: boolean | null
          category: string | null
          content: string
          created_at: string | null
          display_on_marquee: boolean | null
          id: string
          publish_date: string | null
          source: string | null
          title: string
        }
        Insert: {
          auto_blog_post?: boolean | null
          category?: string | null
          content: string
          created_at?: string | null
          display_on_marquee?: boolean | null
          id?: string
          publish_date?: string | null
          source?: string | null
          title: string
        }
        Update: {
          auto_blog_post?: boolean | null
          category?: string | null
          content?: string
          created_at?: string | null
          display_on_marquee?: boolean | null
          id?: string
          publish_date?: string | null
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          name: string
          status: string
          target_amount: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          target_amount?: number | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          target_amount?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mpesa_transactions: {
        Row: {
          amount: number
          balance: number | null
          created_at: string | null
          id: string
          raw_message: string | null
          sender_receiver: string | null
          timestamp: string | null
          transaction_id: string | null
          transaction_type: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          balance?: number | null
          created_at?: string | null
          id?: string
          raw_message?: string | null
          sender_receiver?: string | null
          timestamp?: string | null
          transaction_id?: string | null
          transaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          balance?: number | null
          created_at?: string | null
          id?: string
          raw_message?: string | null
          sender_receiver?: string | null
          timestamp?: string | null
          transaction_id?: string | null
          transaction_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          title: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          title?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_kes: number
          created_at: string
          currency: string
          id: string
          metadata: Json
          plan_id: string | null
          provider: string
          reference: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_kes: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          plan_id?: string | null
          provider?: string
          reference: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_kes?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          plan_id?: string | null
          provider?: string
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_limits"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          created_at: string
          max_groups: number | null
          max_transactions_monthly: number | null
          name: string
          plan_id: string
          premium_templates: boolean
          price_kes: number
          public_reports: boolean
        }
        Insert: {
          created_at?: string
          max_groups?: number | null
          max_transactions_monthly?: number | null
          name: string
          plan_id: string
          premium_templates?: boolean
          price_kes?: number
          public_reports?: boolean
        }
        Update: {
          created_at?: string
          max_groups?: number | null
          max_transactions_monthly?: number | null
          name?: string
          plan_id?: string
          premium_templates?: boolean
          price_kes?: number
          public_reports?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      raw_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string | null
          id: string
          parsed: boolean
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id?: string | null
          id?: string
          parsed?: boolean
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string | null
          id?: string
          parsed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          paid_at: string | null
          reason: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          reason?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          reason?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          clicks: number | null
          created_at: string | null
          id: string
          referral_code: string
          signups: number | null
          user_id: string
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          id?: string
          referral_code: string
          signups?: number | null
          user_id: string
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          id?: string
          referral_code?: string
          signups?: number | null
          user_id?: string
        }
        Relationships: []
      }
      referred_users: {
        Row: {
          converted_to_paid: boolean | null
          created_at: string | null
          id: string
          referred_user_id: string
          referrer_id: string
          reward_paid: boolean | null
        }
        Insert: {
          converted_to_paid?: boolean | null
          created_at?: string | null
          id?: string
          referred_user_id: string
          referrer_id: string
          reward_paid?: boolean | null
        }
        Update: {
          converted_to_paid?: boolean | null
          created_at?: string | null
          id?: string
          referred_user_id?: string
          referrer_id?: string
          reward_paid?: boolean | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          is_public: boolean
          public_slug: string | null
          snapshot: Json
          template: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          is_public?: boolean
          public_slug?: string | null
          snapshot: Json
          template?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          is_public?: boolean
          public_slug?: string | null
          snapshot?: Json
          template?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_reports: {
        Row: {
          created_at: string | null
          id: string
          include_personal_info: boolean | null
          name: string
          settings: Json | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          include_personal_info?: boolean | null
          name: string
          settings?: Json | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          include_personal_info?: boolean | null
          name?: string
          settings?: Json | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_limits"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          balance: number | null
          confidence: number
          contributor_id: string | null
          counterparty_name: string | null
          counterparty_phone: string | null
          created_at: string
          group_id: string | null
          id: string
          mpesa_code: string
          needs_review: boolean
          occurred_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance?: number | null
          confidence?: number
          contributor_id?: string | null
          counterparty_name?: string | null
          counterparty_phone?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          mpesa_code: string
          needs_review?: boolean
          occurred_at?: string | null
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          balance?: number | null
          confidence?: number
          contributor_id?: string | null
          counterparty_name?: string | null
          counterparty_phone?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          mpesa_code?: string
          needs_review?: boolean
          occurred_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          created_at: string
          event: string
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_public_report: { Args: { slug: string }; Returns: Json }
      get_user_plan: { Args: { uid: string }; Returns: string }
      is_admin: { Args: { uid: string }; Returns: boolean }
      owns_group: { Args: { gid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
