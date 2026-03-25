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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          creator_id: string
          creator_result: number | null
          currency: string
          expires_at: string
          game_type: string
          house_fee: number
          id: string
          opponent_id: string | null
          opponent_result: number | null
          status: Database["public"]["Enums"]["bet_status"]
          winner_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          creator_id: string
          creator_result?: number | null
          currency?: string
          expires_at?: string
          game_type: string
          house_fee?: number
          id?: string
          opponent_id?: string | null
          opponent_result?: number | null
          status?: Database["public"]["Enums"]["bet_status"]
          winner_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          creator_id?: string
          creator_result?: number | null
          currency?: string
          expires_at?: string
          game_type?: string
          house_fee?: number
          id?: string
          opponent_id?: string | null
          opponent_result?: number | null
          status?: Database["public"]["Enums"]["bet_status"]
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bets_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      boosts: {
        Row: {
          boost_type: string
          created_at: string
          expires_at: string
          id: string
          multiplier: number
          user_id: string
        }
        Insert: {
          boost_type: string
          created_at?: string
          expires_at: string
          id?: string
          multiplier?: number
          user_id: string
        }
        Update: {
          boost_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          multiplier?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chests: {
        Row: {
          chest_type: string
          id: string
          opened_at: string
          rewards: Json
          user_id: string
        }
        Insert: {
          chest_type?: string
          id?: string
          opened_at?: string
          rewards?: Json
          user_id: string
        }
        Update: {
          chest_type?: string
          id?: string
          opened_at?: string
          rewards?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          earned_adr: number
          id: string
          period: string
          period_start: string
          user_id: string
        }
        Insert: {
          earned_adr?: number
          id?: string
          period?: string
          period_start: string
          user_id: string
        }
        Update: {
          earned_adr?: number
          id?: string
          period?: string
          period_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_draws: {
        Row: {
          created_at: string
          draw_date: string
          id: string
          is_drawn: boolean
          jackpot: number
          winner_id: string | null
          winning_number: number | null
        }
        Insert: {
          created_at?: string
          draw_date: string
          id?: string
          is_drawn?: boolean
          jackpot?: number
          winner_id?: string | null
          winning_number?: number | null
        }
        Update: {
          created_at?: string
          draw_date?: string
          id?: string
          is_drawn?: boolean
          jackpot?: number
          winner_id?: string | null
          winning_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lottery_draws_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_tickets: {
        Row: {
          cost: number
          created_at: string
          draw_id: string
          id: string
          ticket_number: number
          user_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          draw_id: string
          id?: string
          ticket_number: number
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          draw_id?: string
          id?: string
          ticket_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_tickets_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "lottery_draws"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_sessions: {
        Row: {
          claimed: boolean
          created_at: string
          ends_at: string
          id: string
          reward_amount: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          claimed?: boolean
          created_at?: string
          ends_at: string
          id?: string
          reward_amount?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          claimed?: boolean
          created_at?: string
          ends_at?: string
          id?: string
          reward_amount?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mining_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          requirement_type: string
          requirement_value: number
          reward_amount: number
          reward_currency: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          requirement_type: string
          requirement_value?: number
          reward_amount: number
          reward_currency?: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          requirement_type?: string
          requirement_value?: number
          reward_amount?: number
          reward_currency?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          referred_id: string
          referrer_id: string
          reward_given: boolean
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          referred_id: string
          referrer_id: string
          reward_given?: boolean
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          referred_id?: string
          referrer_id?: string
          reward_given?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      staking: {
        Row: {
          amount: number
          apy_rate: number
          id: string
          is_active: boolean
          last_claim_at: string
          lock_until: string
          started_at: string
          user_id: string
        }
        Insert: {
          amount: number
          apy_rate?: number
          id?: string
          is_active?: boolean
          last_claim_at?: string
          lock_until: string
          started_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          apy_rate?: number
          id?: string
          is_active?: boolean
          last_claim_at?: string
          lock_until?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          channel_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          reward_amount: number
          reward_currency: string
          sort_order: number
          title: string
          type: string
          url: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          reward_amount?: number
          reward_currency?: string
          sort_order?: number
          title: string
          type?: string
          url?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          reward_amount?: number
          reward_currency?: string
          sort_order?: number
          title?: string
          type?: string
          url?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number | null
          balance_before: number | null
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          claimed: boolean
          completed: boolean
          id: string
          mission_id: string
          progress: number
          reset_at: string
          user_id: string
        }
        Insert: {
          claimed?: boolean
          completed?: boolean
          id?: string
          mission_id: string
          progress?: number
          reset_at?: string
          user_id: string
        }
        Update: {
          claimed?: boolean
          completed?: boolean
          id?: string
          mission_id?: string
          progress?: number
          reset_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          completed_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          adr_balance: number
          avatar_url: string | null
          created_at: string
          daily_earned_adr: number
          daily_earned_reset_at: string
          daily_streak: number
          device_fingerprint: string | null
          dig_tool_level: number
          doge_balance: number
          energy: number
          energy_updated_at: string
          first_name: string | null
          id: string
          ip_address: string | null
          last_beg_at: string | null
          last_daily_at: string | null
          last_dig_at: string | null
          last_mine_start: string | null
          last_name: string | null
          level: number
          max_energy: number
          mining_rig_level: number
          mining_until: string | null
          referral_code: string | null
          referral_count: number
          referred_by: string | null
          status: Database["public"]["Enums"]["user_status"]
          telegram_id: number
          ton_balance: number
          trx_balance: number
          updated_at: string
          usdt_balance: number
          username: string | null
          xp: number
        }
        Insert: {
          adr_balance?: number
          avatar_url?: string | null
          created_at?: string
          daily_earned_adr?: number
          daily_earned_reset_at?: string
          daily_streak?: number
          device_fingerprint?: string | null
          dig_tool_level?: number
          doge_balance?: number
          energy?: number
          energy_updated_at?: string
          first_name?: string | null
          id?: string
          ip_address?: string | null
          last_beg_at?: string | null
          last_daily_at?: string | null
          last_dig_at?: string | null
          last_mine_start?: string | null
          last_name?: string | null
          level?: number
          max_energy?: number
          mining_rig_level?: number
          mining_until?: string | null
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          telegram_id: number
          ton_balance?: number
          trx_balance?: number
          updated_at?: string
          usdt_balance?: number
          username?: string | null
          xp?: number
        }
        Update: {
          adr_balance?: number
          avatar_url?: string | null
          created_at?: string
          daily_earned_adr?: number
          daily_earned_reset_at?: string
          daily_streak?: number
          device_fingerprint?: string | null
          dig_tool_level?: number
          doge_balance?: number
          energy?: number
          energy_updated_at?: string
          first_name?: string | null
          id?: string
          ip_address?: string | null
          last_beg_at?: string | null
          last_daily_at?: string | null
          last_dig_at?: string | null
          last_mine_start?: string | null
          last_name?: string | null
          level?: number
          max_energy?: number
          mining_rig_level?: number
          mining_until?: string | null
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          telegram_id?: number
          ton_balance?: number
          trx_balance?: number
          updated_at?: string
          usdt_balance?: number
          username?: string | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdraw_status"]
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdraw_status"]
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdraw_status"]
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      bet_status: "open" | "accepted" | "completed" | "cancelled" | "expired"
      transaction_type:
        | "dig"
        | "mine"
        | "beg"
        | "daily_bonus"
        | "referral_reward"
        | "ad_reward"
        | "task_reward"
        | "chest_reward"
        | "stake_reward"
        | "bet_win"
        | "bet_loss"
        | "bet_fee"
        | "withdraw"
        | "deposit"
        | "boost_purchase"
        | "lottery_ticket"
        | "lottery_win"
        | "mission_reward"
        | "admin_adjust"
        | "conversion"
      user_status: "normal" | "suspicious" | "shadow_banned" | "banned"
      withdraw_status: "pending" | "approved" | "rejected"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      bet_status: ["open", "accepted", "completed", "cancelled", "expired"],
      transaction_type: [
        "dig",
        "mine",
        "beg",
        "daily_bonus",
        "referral_reward",
        "ad_reward",
        "task_reward",
        "chest_reward",
        "stake_reward",
        "bet_win",
        "bet_loss",
        "bet_fee",
        "withdraw",
        "deposit",
        "boost_purchase",
        "lottery_ticket",
        "lottery_win",
        "mission_reward",
        "admin_adjust",
        "conversion",
      ],
      user_status: ["normal", "suspicious", "shadow_banned", "banned"],
      withdraw_status: ["pending", "approved", "rejected"],
    },
  },
} as const
