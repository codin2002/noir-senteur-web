export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cart: {
        Row: {
          created_at: string
          id: string
          perfume_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          perfume_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          perfume_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cart_perfume_id"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          low_stock_threshold: number
          perfume_id: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          low_stock_threshold?: number
          perfume_id: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          low_stock_threshold?: number
          perfume_id?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_perfume_id_fkey"
            columns: ["perfume_id"]
            isOneToOne: true
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          perfume_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          perfume_id: string
          price: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          perfume_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_items_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_perfume_id"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
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
          created_at: string
          delivery_address: string | null
          delivery_email_sent: boolean | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          notes: string | null
          processing_email_sent: boolean | null
          status: string
          total: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_email_sent?: boolean | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          processing_email_sent?: boolean | null
          status?: string
          total: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_email_sent?: boolean | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          processing_email_sent?: boolean | null
          status?: string
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      perfume_classifications: {
        Row: {
          audience_classic: number
          audience_feminine: number
          audience_masculine: number
          id: string
          occasion_business: number
          occasion_daily: number
          occasion_evening: number
          occasion_leisure: number
          occasion_night_out: number
          occasion_sport: number
          perfume_id: string
          season_fall: number
          season_spring: number
          season_summer: number
          season_winter: number
          type_floral: number
          type_fresh: number
          type_oriental: number
          type_woody: number
          updated_at: string
        }
        Insert: {
          audience_classic?: number
          audience_feminine?: number
          audience_masculine?: number
          id?: string
          occasion_business?: number
          occasion_daily?: number
          occasion_evening?: number
          occasion_leisure?: number
          occasion_night_out?: number
          occasion_sport?: number
          perfume_id: string
          season_fall?: number
          season_spring?: number
          season_summer?: number
          season_winter?: number
          type_floral?: number
          type_fresh?: number
          type_oriental?: number
          type_woody?: number
          updated_at?: string
        }
        Update: {
          audience_classic?: number
          audience_feminine?: number
          audience_masculine?: number
          id?: string
          occasion_business?: number
          occasion_daily?: number
          occasion_evening?: number
          occasion_leisure?: number
          occasion_night_out?: number
          occasion_sport?: number
          perfume_id?: string
          season_fall?: number
          season_spring?: number
          season_summer?: number
          season_winter?: number
          type_floral?: number
          type_fresh?: number
          type_oriental?: number
          type_woody?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfume_classifications_perfume_id_fkey"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfume_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          perfume_id: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          perfume_id: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          perfume_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_perfume_images_perfume_id"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfume_ratings: {
        Row: {
          bottle_rating: number
          created_at: string
          durability_rating: number
          id: string
          perfume_id: string
          scent_rating: number
          sillage_rating: number
          total_votes: number
          updated_at: string
        }
        Insert: {
          bottle_rating?: number
          created_at?: string
          durability_rating?: number
          id?: string
          perfume_id: string
          scent_rating?: number
          sillage_rating?: number
          total_votes?: number
          updated_at?: string
        }
        Update: {
          bottle_rating?: number
          created_at?: string
          durability_rating?: number
          id?: string
          perfume_id?: string
          scent_rating?: number
          sillage_rating?: number
          total_votes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfume_ratings_perfume_id_fkey"
            columns: ["perfume_id"]
            isOneToOne: true
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfumes: {
        Row: {
          created_at: string
          description: string
          id: string
          image: string
          name: string
          notes: string
          price: string
          price_value: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image: string
          name: string
          notes: string
          price: string
          price_value: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image?: string
          name?: string
          notes?: string
          price?: string
          price_value?: number
        }
        Relationships: []
      }
      pickup_points: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      successful_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string
          customer_name: string | null
          delivery_address: string | null
          email_sent: boolean
          email_sent_at: string | null
          id: string
          order_id: string
          payment_id: string
          payment_method: string
          payment_status: string
          product_details: string | null
          updated_at: string
          user_id: string | null
          ziina_response: Json | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_email: string
          customer_name?: string | null
          delivery_address?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
          id?: string
          order_id: string
          payment_id: string
          payment_method?: string
          payment_status?: string
          product_details?: string | null
          updated_at?: string
          user_id?: string | null
          ziina_response?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string | null
          delivery_address?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
          id?: string
          order_id?: string
          payment_id?: string
          payment_method?: string
          payment_status?: string
          product_details?: string | null
          updated_at?: string
          user_id?: string | null
          ziina_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "successful_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          perfume_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          perfume_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          perfume_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wishlist_perfume_id"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_perfume_id_fkey"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order_with_items: {
        Args: {
          cart_items: Json
          order_total: number
          user_uuid?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string
          delivery_address?: string
        }
        Returns: string
      }
      delete_cart_item: {
        Args: { cart_id: string }
        Returns: undefined
      }
      get_cart_with_perfumes: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          user_id: string
          perfume_id: string
          quantity: number
          created_at: string
          perfume: Json
        }[]
      }
      get_orders_with_items: {
        Args: { user_uuid?: string }
        Returns: {
          id: string
          user_id: string
          total: number
          status: string
          created_at: string
          guest_name: string
          guest_email: string
          guest_phone: string
          delivery_address: string
          items: Json
        }[]
      }
      get_wishlist_with_perfumes: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          user_id: string
          perfume_id: string
          created_at: string
          perfume: Json
        }[]
      }
      update_cart_item: {
        Args: { cart_id: string; new_quantity: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
