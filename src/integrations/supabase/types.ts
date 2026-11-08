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
    PostgrestVersion: "12.2.3"
  }
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
      checkout_drafts: {
        Row: {
          amount: number
          cart_items: Json
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string
          draft_token: string
          expires_at: string | null
          id: string
          is_guest: boolean
          meta_context: Json | null
          mode: string
          offer_id: string | null
          pending_checkout_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          cart_items: Json
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address: string
          draft_token?: string
          expires_at?: string | null
          id?: string
          is_guest?: boolean
          meta_context?: Json | null
          mode: string
          offer_id?: string | null
          pending_checkout_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          cart_items?: Json
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string
          draft_token?: string
          expires_at?: string | null
          id?: string
          is_guest?: boolean
          meta_context?: Json | null
          mode?: string
          offer_id?: string | null
          pending_checkout_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_drafts_pending_checkout_id_fkey"
            columns: ["pending_checkout_id"]
            isOneToOne: false
            referencedRelation: "pending_ziina_checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_recovery_email_log: {
        Row: {
          checkout_id: string
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string
          resend_email_id: string | null
          sent_at: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          checkout_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          resend_email_id?: string | null
          sent_at?: string | null
          source: string
          status?: string
          updated_at?: string
        }
        Update: {
          checkout_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          resend_email_id?: string | null
          sent_at?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          avg_daily_usage: number
          created_at: string
          id: string
          incoming_stock: number
          lead_time_days: number
          low_stock_threshold: number
          perfume_id: string
          reserved_stock: number
          safety_stock: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          avg_daily_usage?: number
          created_at?: string
          id?: string
          incoming_stock?: number
          lead_time_days?: number
          low_stock_threshold?: number
          perfume_id: string
          reserved_stock?: number
          safety_stock?: number
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          avg_daily_usage?: number
          created_at?: string
          id?: string
          incoming_stock?: number
          lead_time_days?: number
          low_stock_threshold?: number
          perfume_id?: string
          reserved_stock?: number
          safety_stock?: number
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
      inventory_logs: {
        Row: {
          action_category: string | null
          change_type: string
          created_at: string
          id: string
          is_unusual: boolean
          order_id: string | null
          perfume_id: string
          quantity_after: number
          quantity_before: number
          quantity_change: number
          reason: string
          reference_id: string | null
          user_name: string | null
        }
        Insert: {
          action_category?: string | null
          change_type: string
          created_at?: string
          id?: string
          is_unusual?: boolean
          order_id?: string | null
          perfume_id: string
          quantity_after: number
          quantity_before: number
          quantity_change: number
          reason: string
          reference_id?: string | null
          user_name?: string | null
        }
        Update: {
          action_category?: string | null
          change_type?: string
          created_at?: string
          id?: string
          is_unusual?: boolean
          order_id?: string | null
          perfume_id?: string
          quantity_after?: number
          quantity_before?: number
          quantity_change?: number
          reason?: string
          reference_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_logs_perfume_id_fkey"
            columns: ["perfume_id"]
            isOneToOne: false
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
          is_preorder: boolean
          order_id: string
          perfume_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_preorder?: boolean
          order_id: string
          perfume_id: string
          price: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          is_preorder?: boolean
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
          delivery_email_claimed_at: string | null
          delivery_email_sent: boolean | null
          fulfillment_status: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          is_preorder: boolean
          landing_url: string | null
          manual_lines: Json
          meta_click_id: string | null
          meta_fbc: string | null
          meta_fbp: string | null
          meta_purchase_claimed_at: string | null
          meta_purchase_sent: boolean
          notes: string | null
          order_source: string
          payment_intent_id: string | null
          payment_status: string
          processing_email_claimed_at: string | null
          processing_email_sent: boolean | null
          status: string
          total: number
          traffic_source: string
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_email_claimed_at?: string | null
          delivery_email_sent?: boolean | null
          fulfillment_status?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          is_preorder?: boolean
          landing_url?: string | null
          manual_lines?: Json
          meta_click_id?: string | null
          meta_fbc?: string | null
          meta_fbp?: string | null
          meta_purchase_claimed_at?: string | null
          meta_purchase_sent?: boolean
          notes?: string | null
          order_source?: string
          payment_intent_id?: string | null
          payment_status?: string
          processing_email_claimed_at?: string | null
          processing_email_sent?: boolean | null
          status?: string
          total: number
          traffic_source?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_email_claimed_at?: string | null
          delivery_email_sent?: boolean | null
          fulfillment_status?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          is_preorder?: boolean
          landing_url?: string | null
          manual_lines?: Json
          meta_click_id?: string | null
          meta_fbc?: string | null
          meta_fbp?: string | null
          meta_purchase_claimed_at?: string | null
          meta_purchase_sent?: boolean
          notes?: string | null
          order_source?: string
          payment_intent_id?: string | null
          payment_status?: string
          processing_email_claimed_at?: string | null
          processing_email_sent?: boolean | null
          status?: string
          total?: number
          traffic_source?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      pending_ziina_checkouts: {
        Row: {
          amount: number
          cart_items: Json
          created_at: string
          currency: string
          delivery_address: string
          id: string
          is_guest: boolean
          lookup_token: string
          meta_context: Json | null
          mode: string
          operation_id: string
          order_id: string | null
          payment_intent_id: string | null
          processed_at: string | null
          provider_payload: Json | null
          recovery_status: string
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          cart_items: Json
          created_at?: string
          currency?: string
          delivery_address: string
          id?: string
          is_guest: boolean
          lookup_token?: string
          meta_context?: Json | null
          mode: string
          operation_id?: string
          order_id?: string | null
          payment_intent_id?: string | null
          processed_at?: string | null
          provider_payload?: Json | null
          recovery_status?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          cart_items?: Json
          created_at?: string
          currency?: string
          delivery_address?: string
          id?: string
          is_guest?: boolean
          lookup_token?: string
          meta_context?: Json | null
          mode?: string
          operation_id?: string
          order_id?: string | null
          payment_intent_id?: string | null
          processed_at?: string | null
          provider_payload?: Json | null
          recovery_status?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_ziina_checkouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          expected_shipping_date: string | null
          id: string
          image: string
          name: string
          notes: string
          preorder_count: number
          preorder_enabled: boolean
          preorder_end_date: string | null
          preorder_limit: number | null
          preorder_start_date: string | null
          price: string
          price_value: number
          product_type: string
        }
        Insert: {
          created_at?: string
          description: string
          expected_shipping_date?: string | null
          id?: string
          image: string
          name: string
          notes: string
          preorder_count?: number
          preorder_enabled?: boolean
          preorder_end_date?: string | null
          preorder_limit?: number | null
          preorder_start_date?: string | null
          price: string
          price_value: number
          product_type?: string
        }
        Update: {
          created_at?: string
          description?: string
          expected_shipping_date?: string | null
          id?: string
          image?: string
          name?: string
          notes?: string
          preorder_count?: number
          preorder_enabled?: boolean
          preorder_end_date?: string | null
          preorder_limit?: number | null
          preorder_start_date?: string | null
          price?: string
          price_value?: number
          product_type?: string
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
      preorder_fulfillments: {
        Row: {
          created_at: string
          fulfilled_at: string | null
          fulfilled_quantity: number
          id: string
          notes: string | null
          order_item_id: string
          perfume_id: string
          preorder_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fulfilled_at?: string | null
          fulfilled_quantity?: number
          id?: string
          notes?: string | null
          order_item_id: string
          perfume_id: string
          preorder_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fulfilled_at?: string | null
          fulfilled_quantity?: number
          id?: string
          notes?: string | null
          order_item_id?: string
          perfume_id?: string
          preorder_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      preorders: {
        Row: {
          created_at: string
          fulfilled_at: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          notes: string | null
          order_id: string | null
          perfume_id: string
          quantity: number
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          fulfilled_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          perfume_id: string
          quantity?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          fulfilled_at?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          perfume_id?: string
          quantity?: number
          status?: string
          updated_at?: string
          user_id?: string | null
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
      site_visitors: {
        Row: {
          first_seen_at: string
          last_seen_at: string
          visitor_id: string
        }
        Insert: {
          first_seen_at?: string
          last_seen_at?: string
          visitor_id: string
        }
        Update: {
          first_seen_at?: string
          last_seen_at?: string
          visitor_id?: string
        }
        Relationships: []
      }
      successful_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string | null
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
          customer_email?: string | null
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
          customer_email?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      cancel_preorder_order: { Args: { _order_id: string }; Returns: undefined }
      claim_meta_purchase: { Args: { p_order_id: string }; Returns: boolean }
      claim_order_email: {
        Args: { p_email_type: string; p_order_id: string }
        Returns: boolean
      }
      create_manual_order:
        | {
            Args: {
              p_already_handed_over?: boolean
              p_customer_email?: string
              p_customer_name: string
              p_customer_phone?: string
              p_delivery_address?: string
              p_lines: Json
              p_notes?: string
            }
            Returns: {
              order_id: string
            }[]
          }
        | {
            Args: {
              p_already_handed_over?: boolean
              p_customer_email?: string
              p_customer_name: string
              p_customer_phone?: string
              p_delivery_address?: string
              p_notes?: string
              p_perfume_id: string
              p_quantity: number
              p_unit_price: number
            }
            Returns: {
              order_id: string
            }[]
          }
      create_order_from_ziina_checkout: {
        Args: {
          p_amount: number
          p_cart_items: Json
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_delivery_address: string
          p_is_guest: boolean
          p_payment_intent_id: string
          p_user_id: string
        }
        Returns: string
      }
      create_order_with_items: {
        Args: {
          cart_items: Json
          delivery_address?: string
          guest_email?: string
          guest_name?: string
          guest_phone?: string
          order_total: number
          user_uuid?: string
        }
        Returns: string
      }
      delete_admin_checkout_draft: {
        Args: { p_draft_id: string }
        Returns: undefined
      }
      delete_cart_item: { Args: { cart_id: string }; Returns: undefined }
      get_admin_checkout_drafts: {
        Args: never
        Returns: {
          amount: number
          cart_items: Json
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          expires_at: string
          id: string
          offer_name: string
          recovery_email_sent_at: string
          recovery_email_status: string
          resume_token: string
          updated_at: string
        }[]
      }
      get_admin_checkout_recovery: {
        Args: never
        Returns: {
          amount: number
          cart_items: Json
          checkout_status: string
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string
          id: string
          offer_name: string
          provider_status: string
          recovery_email_sent_at: string
          recovery_email_status: string
          recovery_status: string
          reminder_consent: boolean
          resume_token: string
        }[]
      }
      get_cart_with_perfumes: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          id: string
          perfume: Json
          perfume_id: string
          quantity: number
          user_id: string
        }[]
      }
      get_order_tracking: {
        Args: { p_order_reference: string; p_phone: string }
        Returns: {
          fulfillment_status: string
          order_reference: string
          placed_at: string
        }[]
      }
      get_orders_with_items: {
        Args: { user_uuid?: string }
        Returns: {
          created_at: string
          delivery_address: string
          fulfillment_status: string
          guest_email: string
          guest_name: string
          guest_phone: string
          id: string
          items: Json
          notes: string
          order_source: string
          status: string
          total: number
          user_id: string
        }[]
      }
      get_orders_with_items_v2: {
        Args: { user_uuid?: string }
        Returns: {
          created_at: string
          delivery_address: string
          fulfillment_status: string
          guest_email: string
          guest_name: string
          guest_phone: string
          id: string
          items: Json
          manual_lines: Json
          meta_click_id: string
          notes: string
          offer_id: string
          order_source: string
          status: string
          total: number
          traffic_source: string
          user_id: string
          utm_campaign: string
          utm_content: string
          utm_source: string
        }[]
      }
      get_wishlist_with_perfumes: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          id: string
          perfume: Json
          perfume_id: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      receive_stock_and_fulfill_preorders: {
        Args: { _notes?: string; _perfume_id: string; _quantity: number }
        Returns: {
          fulfilled_items: number
          remaining_stock: number
        }[]
      }
      trigger_checkout_recovery_email_delivery: {
        Args: never
        Returns: undefined
      }
      update_cart_item: {
        Args: { cart_id: string; new_quantity: number }
        Returns: undefined
      }
      update_checkout_recovery_status: {
        Args: { p_checkout_id: string; p_status: string }
        Returns: boolean
      }
      verify_checkout_recovery_cron_secret: {
        Args: { p_secret: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
