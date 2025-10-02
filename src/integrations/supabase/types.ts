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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password_hash: string
          role: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password_hash: string
          role?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
          role?: string | null
          username?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          party_size: number
          special_requests: string | null
          status: string | null
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          party_size: number
          special_requests?: string | null
          status?: string | null
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          party_size?: number
          special_requests?: string | null
          status?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          approved: boolean
          author_email: string
          author_name: string
          content: string
          created_at: string
          id: number
          post_id: number
          user_id: string | null
        }
        Insert: {
          approved?: boolean
          author_email: string
          author_name: string
          content: string
          created_at?: string
          id?: number
          post_id: number
          user_id?: string | null
        }
        Update: {
          approved?: boolean
          author_email?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: number
          post_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          read: boolean
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          message: string
          name: string
          read?: boolean
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          message?: string
          name?: string
          read?: boolean
          subject?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          achievements: string[] | null
          company: string
          company_url: string | null
          created_at: string
          current: boolean
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          role: string
          start_date: string
          tech_used: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          company: string
          company_url?: string | null
          created_at?: string
          current?: boolean
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          role: string
          start_date: string
          tech_used?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          company?: string
          company_url?: string | null
          created_at?: string
          current?: boolean
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          role?: string
          start_date?: string
          tech_used?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      home_content: {
        Row: {
          accent_color: string | null
          background_gradient: string | null
          background_image: string | null
          created_at: string | null
          hero_image: string | null
          id: string
          name: string
          primary_color: string | null
          secondary_color: string | null
          tagline: string
          text_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          background_gradient?: string | null
          background_image?: string | null
          created_at?: string | null
          hero_image?: string | null
          id?: string
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          tagline: string
          text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          background_gradient?: string | null
          background_image?: string | null
          created_at?: string | null
          hero_image?: string | null
          id?: string
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          tagline?: string
          text_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          cost_per_unit: number
          created_at: string | null
          current_stock: number
          id: string
          item_name: string
          last_restocked: string | null
          minimum_stock: number
          supplier: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          category: string
          cost_per_unit?: number
          created_at?: string | null
          current_stock?: number
          id?: string
          item_name: string
          last_restocked?: string | null
          minimum_stock?: number
          supplier?: string | null
          unit?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          cost_per_unit?: number
          created_at?: string | null
          current_stock?: number
          id?: string
          item_name?: string
          last_restocked?: string | null
          minimum_stock?: number
          supplier?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          available: boolean | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          preparation_time: number | null
          price: number
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          preparation_time?: number | null
          price: number
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          preparation_time?: number | null
          price?: number
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          order_id: string | null
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          order_id?: string | null
          price: number
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          order_id?: string | null
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_address: string | null
          id: string
          order_type: string
          special_instructions: string | null
          status: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_address?: string | null
          id?: string
          order_type: string
          special_instructions?: string | null
          status?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string | null
          id?: string
          order_type?: string
          special_instructions?: string | null
          status?: string | null
          total_amount?: number
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          id: number
          post_id: number
          tag_id: number
        }
        Insert: {
          id?: number
          post_id: number
          tag_id: number
        }
        Update: {
          id?: number
          post_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_posts_id_fk"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_tags_id_fk"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          category_id: number | null
          content: string
          created_at: string
          excerpt: string
          featured_image: string | null
          id: number
          likes_count: number | null
          published: boolean
          published_at: string | null
          read_time: number
          slug: string
          status: string | null
          title: string
          updated_at: string
          user_id: string | null
          views: number
        }
        Insert: {
          category_id?: number | null
          content: string
          created_at?: string
          excerpt: string
          featured_image?: string | null
          id?: number
          likes_count?: number | null
          published?: boolean
          published_at?: string | null
          read_time?: number
          slug: string
          status?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          views?: number
        }
        Update: {
          category_id?: number | null
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string | null
          id?: number
          likes_count?: number | null
          published?: boolean
          published_at?: string | null
          read_time?: number
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_categories_id_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          name: string | null
          resume_url: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          github_url?: string | null
          id: string
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          resume_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          resume_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      project_logs: {
        Row: {
          change: Json
          created_at: string
          id: string
          image_urls: string[] | null
          note: string | null
          project_id: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          change: Json
          created_at?: string
          id?: string
          image_urls?: string[] | null
          note?: string | null
          project_id: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          change?: Json
          created_at?: string
          id?: string
          image_urls?: string[] | null
          note?: string | null
          project_id?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_management_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_management_projects: {
        Row: {
          client_company: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          deadline: string
          description: string | null
          id: string
          name: string
          notes: string | null
          price: number
          progress: number
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_company?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          deadline: string
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          price: number
          progress?: number
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_company?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          deadline?: string
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          price?: number
          progress?: number
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_shares: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          last_viewed_at: string | null
          project_id: string
          share_token: string
          view_count: number
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          last_viewed_at?: string | null
          project_id: string
          share_token: string
          view_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          last_viewed_at?: string | null
          project_id?: string
          share_token?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_shares_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_management_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          content: string | null
          created_at: string
          demo_url: string | null
          description: string
          featured: boolean
          github_url: string | null
          id: string
          image_url: string | null
          status: string
          tech_stack: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          demo_url?: string | null
          description: string
          featured?: boolean
          github_url?: string | null
          id?: string
          image_url?: string | null
          status?: string
          tech_stack?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string
          featured?: boolean
          github_url?: string | null
          id?: string
          image_url?: string | null
          status?: string
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          capacity: number
          created_at: string | null
          id: number
          status: string
          table_number: number
          updated_at: string | null
        }
        Insert: {
          capacity?: number
          created_at?: string | null
          id?: number
          status?: string
          table_number: number
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: number
          status?: string
          table_number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          icon: string | null
          id: string
          level: string
          name: string
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          level?: string
          name: string
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          level?: string
          name?: string
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: number
          is_admin: boolean
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          is_admin?: boolean
          password: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          is_admin?: boolean
          password?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      project_status: "not_started" | "in_progress" | "blocked" | "done"
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
      project_status: ["not_started", "in_progress", "blocked", "done"],
    },
  },
} as const
