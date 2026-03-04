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
      roadmap_tasks: {
        Row: {
          completed_at: string | null
          description: string | null
          estimated_time: string | null
          id: string
          is_completed: boolean | null
          priority: string | null
          skill_tag: string | null
          title: string
          user_id: string
          week_number: number | null
        }
        Insert: {
          completed_at?: string | null
          description?: string | null
          estimated_time?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          skill_tag?: string | null
          title: string
          user_id: string
          week_number?: number | null
        }
        Update: {
          completed_at?: string | null
          description?: string | null
          estimated_time?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          skill_tag?: string | null
          title?: string
          user_id?: string
          week_number?: number | null
        }
        Relationships: []
      }
      role_maps: {
        Row: {
          core_skills: string[] | null
          id: string
          required_skills: string[] | null
          role_name: string
        }
        Insert: {
          core_skills?: string[] | null
          id?: string
          required_skills?: string[] | null
          role_name: string
        }
        Update: {
          core_skills?: string[] | null
          id?: string
          required_skills?: string[] | null
          role_name?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          last_completed_date: string | null
          streak_count: number | null
          user_id: string
        }
        Insert: {
          last_completed_date?: string | null
          streak_count?: number | null
          user_id: string
        }
        Update: {
          last_completed_date?: string | null
          streak_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      student_academics: {
        Row: {
          certifications: string[] | null
          cgpa: number | null
          id: string
          manual_skills: string[] | null
          projects: Json | null
          subjects: string[] | null
          user_id: string
        }
        Insert: {
          certifications?: string[] | null
          cgpa?: number | null
          id?: string
          manual_skills?: string[] | null
          projects?: Json | null
          subjects?: string[] | null
          user_id: string
        }
        Update: {
          certifications?: string[] | null
          cgpa?: number | null
          id?: string
          manual_skills?: string[] | null
          projects?: Json | null
          subjects?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      subject_maps: {
        Row: {
          id: string
          skill_tags: string[] | null
          subject_name: string
        }
        Insert: {
          id?: string
          skill_tags?: string[] | null
          subject_name: string
        }
        Update: {
          id?: string
          skill_tags?: string[] | null
          subject_name?: string
        }
        Relationships: []
      }
      user_profile: {
        Row: {
          branch: string | null
          created_at: string
          goal_preference: string | null
          id: string
          name: string
          target_role: string | null
          timeline_days: number | null
          user_id: string
          year: number | null
        }
        Insert: {
          branch?: string | null
          created_at?: string
          goal_preference?: string | null
          id?: string
          name: string
          target_role?: string | null
          timeline_days?: number | null
          user_id: string
          year?: number | null
        }
        Update: {
          branch?: string | null
          created_at?: string
          goal_preference?: string | null
          id?: string
          name?: string
          target_role?: string | null
          timeline_days?: number | null
          user_id?: string
          year?: number | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
