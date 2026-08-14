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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          notes: string | null
          credit_limit: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          notes?: string | null
          credit_limit?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          notes?: string | null
          credit_limit?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          display_order?: number
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_name: string | null
          status: string
          subtotal: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          payment_method: string
          payment_status: string
          paid_amount: number
          due_amount: number
          paid_at: string | null
          is_printed: boolean
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          customer_name?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          payment_method?: string
          payment_status?: string
          paid_amount?: number
          due_amount?: number
          paid_at?: string | null
          is_printed?: boolean
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_name?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          payment_method?: string
          payment_status?: string
          paid_amount?: number
          due_amount?: number
          paid_at?: string | null
          is_printed?: boolean
          created_at?: string
          completed_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          menu_item_id: string | null
          item_name: string
          unit_price: number
          quantity: number
          total_price: number
        }
        Insert: {
          id?: string
          order_id?: string | null
          menu_item_id?: string | null
          item_name: string
          unit_price: number
          quantity: number
          total_price: number
        }
        Update: {
          id?: string
          order_id?: string | null
          menu_item_id?: string | null
          item_name?: string
          unit_price?: number
          quantity?: number
          total_price?: number
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          customer_id: string | null
          amount: number
          payment_method: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          customer_id?: string | null
          amount: number
          payment_method: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          customer_id?: string | null
          amount?: number
          payment_method?: string
          notes?: string | null
          created_at?: string
        }
      }
      water_products: {
        Row: {
          id: string
          name: string
          description: string | null
          water_type: string
          unit_name: string
          price: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          water_type: string
          unit_name: string
          price: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          water_type?: string
          unit_name?: string
          price?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      water_customers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      water_orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_name: string
          order_status: string
          subtotal: number
          discount_amount: number
          total_amount: number
          amount_paid: number
          amount_due: number
          payment_status: string
          payment_method: string
          order_source: string
          notes: string | null
          is_printed: boolean
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          customer_name?: string
          order_status?: string
          subtotal?: number
          discount_amount?: number
          total_amount?: number
          amount_paid?: number
          amount_due?: number
          payment_status?: string
          payment_method?: string
          order_source?: string
          notes?: string | null
          is_printed?: boolean
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_name?: string
          order_status?: string
          subtotal?: number
          discount_amount?: number
          total_amount?: number
          amount_paid?: number
          amount_due?: number
          payment_status?: string
          payment_method?: string
          order_source?: string
          notes?: string | null
          is_printed?: boolean
          created_at?: string
          completed_at?: string | null
        }
      }
      water_order_items: {
        Row: {
          id: string
          water_order_id: string
          water_product_id: string | null
          item_name: string
          unit_price: number
          quantity: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          water_order_id: string
          water_product_id?: string | null
          item_name: string
          unit_price: number
          quantity: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          water_order_id?: string
          water_product_id?: string | null
          item_name?: string
          unit_price?: number
          quantity?: number
          total_price?: number
          created_at?: string
        }
      }
      water_payments: {
        Row: {
          id: string
          water_order_id: string
          water_customer_id: string | null
          amount: number
          payment_method: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          water_order_id: string
          water_customer_id?: string | null
          amount: number
          payment_method: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          water_order_id?: string
          water_customer_id?: string | null
          amount?: number
          payment_method?: string
          notes?: string | null
          created_at?: string
        }
      }
      water_event_requests: {
        Row: {
          id: string
          customer_id: string | null
          customer_name: string
          phone: string
          event_type: string
          event_date: string
          estimated_quantity: number
          location: string
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          customer_name: string
          phone: string
          event_type: string
          event_date: string
          estimated_quantity: number
          location: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          customer_name?: string
          phone?: string
          event_type?: string
          event_date?: string
          estimated_quantity?: number
          location?: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      water_settings: {
        Row: {
          id: string
          service_name: string
          phone: string | null
          address: string | null
          receipt_footer: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          service_name?: string
          phone?: string | null
          address?: string | null
          receipt_footer?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          service_name?: string
          phone?: string | null
          address?: string | null
          receipt_footer?: string | null
          updated_at?: string
        }
      }
      cafe_settings: {
        Row: {
          id: string
          cafe_name: string
          tagline: string | null
          about_text: string | null
          address: string | null
          phone: string | null
          email: string | null
          opening_hours: string | null
          logo_url: string | null
          tax_percentage: number
          currency: string
          updated_at: string
        }
        Insert: {
          id?: string
          cafe_name?: string
          tagline?: string | null
          about_text?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          opening_hours?: string | null
          logo_url?: string | null
          tax_percentage?: number
          currency?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cafe_name?: string
          tagline?: string | null
          about_text?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          opening_hours?: string | null
          logo_url?: string | null
          tax_percentage?: number
          currency?: string
          updated_at?: string
        }
      }
      gallery_images: {
        Row: {
          id: string
          image_url: string
          title: string | null
          caption: string | null
          alt_text: string | null
          width: number | null
          height: number | null
          views_count: number | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          image_url: string
          title?: string | null
          caption?: string | null
          alt_text?: string | null
          width?: number | null
          height?: number | null
          views_count?: number | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          title?: string | null
          caption?: string | null
          alt_text?: string | null
          width?: number | null
          height?: number | null
          views_count?: number | null
          display_order?: number
          created_at?: string
        }
      }
      discussions: {
        Row: {
          id: string
          customer_name: string
          message: string
          rating: number | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          message: string
          rating?: number | null
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          message?: string
          rating?: number | null
          is_approved?: boolean
          created_at?: string
        }
      }
      printer_settings: {
        Row: {
          id: string
          printer_name: string | null
          device_id: string | null
          paper_width: number
          auto_connect: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          printer_name?: string | null
          device_id?: string | null
          paper_width?: number
          auto_connect?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          printer_name?: string | null
          device_id?: string | null
          paper_width?: number
          auto_connect?: boolean
          updated_at?: string
        }
      }
    }
    Views: {
      daily_summary: {
        Row: {
          order_date: string | null
          total_orders: number | null
          total_revenue: number | null
          avg_order_value: number | null
          total_items_sold: number | null
        }
      }
    }
    Functions: {
      create_order_with_items: {
        Args: {
          p_customer_name?: string | null
          p_items: Json
          p_tax_amount: number
          p_discount_amount: number
          p_payment_method: string
          p_customer_id?: string | null
        }
        Returns: Database['public']['Tables']['orders']['Row']
      }
      record_customer_payment: {
        Args: {
          p_customer_id: string
          p_amount: number
          p_payment_method: string
          p_notes?: string | null
          p_order_id?: string | null
        }
        Returns: Json
      }
      create_water_order_with_items: {
        Args: {
          p_customer_name?: string | null
          p_items: Json
          p_discount_amount: number
          p_payment_method: string
          p_customer_id?: string | null
          p_order_source?: string | null
          p_notes?: string | null
        }
        Returns: Database['public']['Tables']['water_orders']['Row']
      }
      record_water_customer_payment: {
        Args: {
          p_customer_id: string
          p_amount: number
          p_payment_method: string
          p_notes?: string | null
          p_water_order_id?: string | null
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
