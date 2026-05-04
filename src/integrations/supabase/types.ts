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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      free_plans: {
        Row: {
          active: boolean
          cpu_pct: number
          created_at: string
          description: string | null
          disk_mb: number
          egg_id: number | null
          id: string
          name: string
          ram_mb: number
          time_period_seconds: number
          type: Database["public"]["Enums"]["plan_type"]
        }
        Insert: {
          active?: boolean
          cpu_pct: number
          created_at?: string
          description?: string | null
          disk_mb: number
          egg_id?: number | null
          id?: string
          name: string
          ram_mb: number
          time_period_seconds: number
          type: Database["public"]["Enums"]["plan_type"]
        }
        Update: {
          active?: boolean
          cpu_pct?: number
          created_at?: string
          description?: string | null
          disk_mb?: number
          egg_id?: number | null
          id?: string
          name?: string
          ram_mb?: number
          time_period_seconds?: number
          type?: Database["public"]["Enums"]["plan_type"]
        }
        Relationships: []
      }
      links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          label: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          label: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      paid_plans: {
        Row: {
          active: boolean
          cpu_pct: number
          created_at: string
          description: string | null
          discord_redirect: string | null
          disk_mb: number
          egg_id: number | null
          id: string
          name: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          price_cents: number
          ram_mb: number
          type: Database["public"]["Enums"]["plan_type"]
        }
        Insert: {
          active?: boolean
          cpu_pct: number
          created_at?: string
          description?: string | null
          discord_redirect?: string | null
          disk_mb: number
          egg_id?: number | null
          id?: string
          name: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          price_cents: number
          ram_mb: number
          type: Database["public"]["Enums"]["plan_type"]
        }
        Update: {
          active?: boolean
          cpu_pct?: number
          created_at?: string
          description?: string | null
          discord_redirect?: string | null
          disk_mb?: number
          egg_id?: number | null
          id?: string
          name?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          price_cents?: number
          ram_mb?: number
          type?: Database["public"]["Enums"]["plan_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          pterodactyl_user_id: number | null
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          pterodactyl_user_id?: number | null
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          pterodactyl_user_id?: number | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number | null
          created_at: string
          id: string
          paid_plan_id: string | null
          status: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          paid_plan_id?: string | null
          status?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          id?: string
          paid_plan_id?: string | null
          status?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_paid_plan_id_fkey"
            columns: ["paid_plan_id"]
            isOneToOne: false
            referencedRelation: "paid_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          cpu_pct: number
          created_at: string
          disk_mb: number
          egg_id: number | null
          expires_at: string | null
          id: string
          is_free: boolean
          name: string
          pterodactyl_server_id: number | null
          ram_mb: number
          suspended: boolean
          type: Database["public"]["Enums"]["plan_type"]
          user_id: string
        }
        Insert: {
          cpu_pct: number
          created_at?: string
          disk_mb: number
          egg_id?: number | null
          expires_at?: string | null
          id?: string
          is_free?: boolean
          name: string
          pterodactyl_server_id?: number | null
          ram_mb: number
          suspended?: boolean
          type: Database["public"]["Enums"]["plan_type"]
          user_id: string
        }
        Update: {
          cpu_pct?: number
          created_at?: string
          disk_mb?: number
          egg_id?: number | null
          expires_at?: string | null
          id?: string
          is_free?: boolean
          name?: string
          pterodactyl_server_id?: number | null
          ram_mb?: number
          suspended?: boolean
          type?: Database["public"]["Enums"]["plan_type"]
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          coins_per_minute: number
          cost_cpu_per_core: number
          cost_disk_per_gb: number
          cost_ram_per_gb: number
          cost_server_slot: number
          default_cpu_pct: number
          default_disk_mb: number
          default_ram_mb: number
          default_servers: number
          id: number
          panel_name: string
          panel_tagline: string | null
          pterodactyl_api_key: string | null
          pterodactyl_url: string | null
          smtp_from: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_user: string | null
          stripe_secret_key: string | null
          stripe_webhook_secret: string | null
          updated_at: string
        }
        Insert: {
          coins_per_minute?: number
          cost_cpu_per_core?: number
          cost_disk_per_gb?: number
          cost_ram_per_gb?: number
          cost_server_slot?: number
          default_cpu_pct?: number
          default_disk_mb?: number
          default_ram_mb?: number
          default_servers?: number
          id?: number
          panel_name?: string
          panel_tagline?: string | null
          pterodactyl_api_key?: string | null
          pterodactyl_url?: string | null
          smtp_from?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          stripe_secret_key?: string | null
          stripe_webhook_secret?: string | null
          updated_at?: string
        }
        Update: {
          coins_per_minute?: number
          cost_cpu_per_core?: number
          cost_disk_per_gb?: number
          cost_ram_per_gb?: number
          cost_server_slot?: number
          default_cpu_pct?: number
          default_disk_mb?: number
          default_ram_mb?: number
          default_servers?: number
          id?: number
          panel_name?: string
          panel_tagline?: string | null
          pterodactyl_api_key?: string | null
          pterodactyl_url?: string | null
          smtp_from?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          stripe_secret_key?: string | null
          stripe_webhook_secret?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_resources: {
        Row: {
          coins: number
          cpu_pct: number
          disk_mb: number
          last_afk_at: string | null
          ram_mb: number
          server_slots: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          cpu_pct?: number
          disk_mb?: number
          last_afk_at?: string | null
          ram_mb?: number
          server_slots?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          cpu_pct?: number
          disk_mb?: number
          last_afk_at?: string | null
          ram_mb?: number
          server_slots?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      payment_method: "stripe" | "discord"
      plan_type: "MINECRAFT" | "PYTHON" | "NODEJS" | "VPS" | "OTHER"
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
      payment_method: ["stripe", "discord"],
      plan_type: ["MINECRAFT", "PYTHON", "NODEJS", "VPS", "OTHER"],
    },
  },
} as const
