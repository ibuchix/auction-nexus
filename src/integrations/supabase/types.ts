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
      bids: {
        Row: {
          amount: number
          car_id: string
          created_at: string
          dealer_id: string
          id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          car_id: string
          created_at?: string
          dealer_id: string
          id?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          car_id?: string
          created_at?: string
          dealer_id?: string
          id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      car_file_uploads: {
        Row: {
          car_id: string | null
          created_at: string | null
          file_path: string
          file_type: string
          id: string
          image_metadata: Json | null
          updated_at: string | null
          upload_status: string | null
        }
        Insert: {
          car_id?: string | null
          created_at?: string | null
          file_path: string
          file_type: string
          id?: string
          image_metadata?: Json | null
          updated_at?: string | null
          upload_status?: string | null
        }
        Update: {
          car_id?: string | null
          created_at?: string | null
          file_path?: string
          file_type?: string
          id?: string
          image_metadata?: Json | null
          updated_at?: string | null
          upload_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_file_uploads_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          additional_photos: Json | null
          auction_end_time: string | null
          auction_status: string | null
          created_at: string
          current_bid: number | null
          features: Json | null
          id: string
          images: string[] | null
          is_auction: boolean | null
          is_draft: boolean
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          model: string | null
          price: number
          required_photos: Json | null
          reserve_price: number | null
          seller_id: string | null
          status: string | null
          title: string | null
          transmission: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          additional_photos?: Json | null
          auction_end_time?: string | null
          auction_status?: string | null
          created_at?: string
          current_bid?: number | null
          features?: Json | null
          id?: string
          images?: string[] | null
          is_auction?: boolean | null
          is_draft?: boolean
          make?: string | null
          mileage?: number | null
          minimum_bid_increment?: number | null
          model?: string | null
          price?: number
          required_photos?: Json | null
          reserve_price?: number | null
          seller_id?: string | null
          status?: string | null
          title?: string | null
          transmission?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          additional_photos?: Json | null
          auction_end_time?: string | null
          auction_status?: string | null
          created_at?: string
          current_bid?: number | null
          features?: Json | null
          id?: string
          images?: string[] | null
          is_auction?: boolean | null
          is_draft?: boolean
          make?: string | null
          mileage?: number | null
          minimum_bid_increment?: number | null
          model?: string | null
          price?: number
          required_photos?: Json | null
          reserve_price?: number | null
          seller_id?: string | null
          status?: string | null
          title?: string | null
          transmission?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      dealer_watchlist: {
        Row: {
          buyer_id: string
          car_id: string
          created_at: string
          id: string
        }
        Insert: {
          buyer_id: string
          car_id: string
          created_at?: string
          id?: string
        }
        Update: {
          buyer_id?: string
          car_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_watchlist_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      dealers: {
        Row: {
          address: string
          business_registry_number: string
          created_at: string
          dealership_name: string
          id: string
          is_verified: boolean
          license_number: string
          supervisor_name: string
          tax_id: string
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          address: string
          business_registry_number: string
          created_at?: string
          dealership_name: string
          id?: string
          is_verified?: boolean
          license_number: string
          supervisor_name: string
          tax_id: string
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          address?: string
          business_registry_number?: string
          created_at?: string
          dealership_name?: string
          id?: string
          is_verified?: boolean
          license_number?: string
          supervisor_name?: string
          tax_id?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      manual_valuations: {
        Row: {
          accident_history: string | null
          address: string | null
          condition_rating: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          engine_capacity: number | null
          features: Json | null
          finance_amount: number | null
          has_documentation: boolean | null
          has_private_plate: boolean | null
          has_tool_pack: boolean | null
          id: string
          is_damaged: boolean | null
          is_registered_in_poland: boolean | null
          is_selling_on_behalf: boolean | null
          make: string | null
          mileage: number | null
          mobile_number: string | null
          model: string | null
          name: string | null
          notes: string | null
          number_of_keys: number | null
          previous_owners: number | null
          registration_number: string | null
          seat_material: string | null
          seller_notes: string | null
          service_history_files: string[] | null
          service_history_type: string | null
          transmission:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          user_id: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          accident_history?: string | null
          address?: string | null
          condition_rating?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          engine_capacity?: number | null
          features?: Json | null
          finance_amount?: number | null
          has_documentation?: boolean | null
          has_private_plate?: boolean | null
          has_tool_pack?: boolean | null
          id?: string
          is_damaged?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          make?: string | null
          mileage?: number | null
          mobile_number?: string | null
          model?: string | null
          name?: string | null
          notes?: string | null
          number_of_keys?: number | null
          previous_owners?: number | null
          registration_number?: string | null
          seat_material?: string | null
          seller_notes?: string | null
          service_history_files?: string[] | null
          service_history_type?: string | null
          transmission?:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          user_id?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          accident_history?: string | null
          address?: string | null
          condition_rating?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          engine_capacity?: number | null
          features?: Json | null
          finance_amount?: number | null
          has_documentation?: boolean | null
          has_private_plate?: boolean | null
          has_tool_pack?: boolean | null
          id?: string
          is_damaged?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          make?: string | null
          mileage?: number | null
          mobile_number?: string | null
          model?: string | null
          name?: string | null
          notes?: string | null
          number_of_keys?: number | null
          previous_owners?: number | null
          registration_number?: string | null
          seat_material?: string | null
          seller_notes?: string | null
          service_history_files?: string[] | null
          service_history_type?: string | null
          transmission?:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          user_id?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      proxy_bids: {
        Row: {
          car_id: string
          created_at: string
          dealer_id: string
          id: string
          max_bid_amount: number
          updated_at: string
        }
        Insert: {
          car_id: string
          created_at?: string
          dealer_id: string
          id?: string
          max_bid_amount: number
          updated_at?: string
        }
        Update: {
          car_id?: string
          created_at?: string
          dealer_id?: string
          id?: string
          max_bid_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proxy_bids_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proxy_bids_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      vin_reservations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          status: string | null
          user_id: string | null
          valuation_data: Json | null
          vin: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          valuation_data?: Json | null
          vin: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          valuation_data?: Json | null
          vin?: string
        }
        Relationships: []
      }
    }
    Views: {
      auction_activity_stats: {
        Row: {
          car_id: string | null
          highest_bid: number | null
          lowest_bid: number | null
          total_bids: number | null
          unique_bidders: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_end_auction: {
        Args: {
          p_car_id: string
          p_admin_id: string
          p_sold?: boolean
        }
        Returns: Json
      }
      authenticate_dealer: {
        Args: {
          p_email: string
          p_password: string
        }
        Returns: Json
      }
      calculate_reserve_price: {
        Args: {
          p_base_price: number
        }
        Returns: number
      }
      calculate_reserve_price_from_min_med: {
        Args: {
          p_price_min: number
          p_price_med: number
        }
        Returns: number
      }
      check_email_exists: {
        Args: {
          email_to_check: string
        }
        Returns: Json
      }
      create_dealer_with_profile: {
        Args: {
          p_email: string
          p_password: string
          p_supervisor_name: string
          p_company_name: string
          p_tax_id: string
          p_business_registry_number: string
          p_address: string
          p_phone_number?: string
        }
        Returns: Json
      }
      debug_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      debug_dealer_access: {
        Args: {
          p_user_id: string
        }
        Returns: {
          has_access: boolean
          record_exists: boolean
          error_message: string
        }[]
      }
      get_dealer_by_user_id: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      get_user_id_by_email: {
        Args: {
          p_email: string
        }
        Returns: Json
      }
      place_bid: {
        Args: {
          p_car_id: string
          p_dealer_id: string
          p_amount: number
          p_is_proxy?: boolean
          p_max_proxy_amount?: number
        }
        Returns: Json
      }
      verify_password: {
        Args: {
          uuid: string
          plain_text: string
        }
        Returns: boolean
      }
    }
    Enums: {
      car_transmission_type: "automatic" | "manual"
      user_role: "dealer" | "seller" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
