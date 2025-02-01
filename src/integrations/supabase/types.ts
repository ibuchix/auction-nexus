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
      alert_history: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          message: string
          metric_name: string
          metric_value: number
          severity: string
          threshold_value: number
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          message: string
          metric_name: string
          metric_value: number
          severity: string
          threshold_value: number
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string
          metric_name?: string
          metric_value?: number
          severity?: string
          threshold_value?: number
        }
        Relationships: []
      }
      alert_thresholds: {
        Row: {
          comparison_operator: string
          created_at: string | null
          id: string
          is_active: boolean | null
          metric_name: string
          threshold_value: number
          time_window: number
          updated_at: string | null
        }
        Insert: {
          comparison_operator: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metric_name: string
          threshold_value: number
          time_window: number
          updated_at?: string | null
        }
        Update: {
          comparison_operator?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metric_name?: string
          threshold_value?: number
          time_window?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      auction_activity_stats: {
        Row: {
          auction_end_time: string | null
          auction_start_time: string | null
          auction_status: string | null
          car_id: string | null
          highest_bid: number | null
          id: string
          last_updated: string | null
          lowest_bid: number | null
          seller_id: string | null
          title: string | null
          total_bids: number | null
          unique_bidders: number | null
        }
        Insert: {
          auction_end_time?: string | null
          auction_start_time?: string | null
          auction_status?: string | null
          car_id?: string | null
          highest_bid?: number | null
          id?: string
          last_updated?: string | null
          lowest_bid?: number | null
          seller_id?: string | null
          title?: string | null
          total_bids?: number | null
          unique_bidders?: number | null
        }
        Update: {
          auction_end_time?: string | null
          auction_start_time?: string | null
          auction_status?: string | null
          car_id?: string | null
          highest_bid?: number | null
          id?: string
          last_updated?: string | null
          lowest_bid?: number | null
          seller_id?: string | null
          title?: string | null
          total_bids?: number | null
          unique_bidders?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_activity_stats_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_activity_stats_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
          {
            foreignKeyName: "auction_activity_stats_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_activity_stats_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_metrics: {
        Row: {
          auction_id: string | null
          created_at: string | null
          duration_minutes: number | null
          end_time: string | null
          final_price: number | null
          id: string
          reserve_price: number | null
          start_time: string | null
          status: string | null
          total_bids: number | null
          unique_bidders: number | null
        }
        Insert: {
          auction_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          final_price?: number | null
          id?: string
          reserve_price?: number | null
          start_time?: string | null
          status?: string | null
          total_bids?: number | null
          unique_bidders?: number | null
        }
        Update: {
          auction_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          final_price?: number | null
          id?: string
          reserve_price?: number | null
          start_time?: string | null
          status?: string | null
          total_bids?: number | null
          unique_bidders?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_metrics_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_metrics_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
          {
            foreignKeyName: "auction_metrics_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_results: {
        Row: {
          auction_id: string
          bidding_activity_timeline: Json | null
          created_at: string | null
          duration_minutes: number | null
          final_price: number | null
          highest_bid_dealer_id: string | null
          id: string
          reserve_price: number | null
          start_price: number | null
          total_bids: number | null
          unique_bidders: number | null
        }
        Insert: {
          auction_id: string
          bidding_activity_timeline?: Json | null
          created_at?: string | null
          duration_minutes?: number | null
          final_price?: number | null
          highest_bid_dealer_id?: string | null
          id?: string
          reserve_price?: number | null
          start_price?: number | null
          total_bids?: number | null
          unique_bidders?: number | null
        }
        Update: {
          auction_id?: string
          bidding_activity_timeline?: Json | null
          created_at?: string | null
          duration_minutes?: number | null
          final_price?: number | null
          highest_bid_dealer_id?: string | null
          id?: string
          reserve_price?: number | null
          start_price?: number | null
          total_bids?: number | null
          unique_bidders?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_results_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_results_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
          {
            foreignKeyName: "auction_results_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_results_highest_bid_dealer_id_fkey"
            columns: ["highest_bid_dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_auction"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_auction"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
          {
            foreignKeyName: "fk_auction"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_metrics: {
        Row: {
          bid_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          processing_time_ms: number | null
          proxy_processing_time_ms: number | null
          success: boolean | null
          validation_time_ms: number | null
        }
        Insert: {
          bid_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          proxy_processing_time_ms?: number | null
          success?: boolean | null
          validation_time_ms?: number | null
        }
        Update: {
          bid_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processing_time_ms?: number | null
          proxy_processing_time_ms?: number | null
          success?: boolean | null
          validation_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_metrics_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          car_id: string
          created_at: string | null
          dealer_id: string
          id: string
          status: string | null
          withdrawal_reason: string | null
          withdrawn_at: string | null
        }
        Insert: {
          amount: number
          car_id: string
          created_at?: string | null
          dealer_id: string
          id?: string
          status?: string | null
          withdrawal_reason?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          amount?: number
          car_id?: string
          created_at?: string | null
          dealer_id?: string
          id?: string
          status?: string | null
          withdrawal_reason?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
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
      cache_metrics: {
        Row: {
          cache_key: string
          created_at: string | null
          hit_count: number | null
          id: string
          last_accessed: string | null
          miss_count: number | null
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          hit_count?: number | null
          id?: string
          last_accessed?: string | null
          miss_count?: number | null
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          hit_count?: number | null
          id?: string
          last_accessed?: string | null
          miss_count?: number | null
        }
        Relationships: []
      }
      car_file_uploads: {
        Row: {
          car_id: string | null
          created_at: string | null
          file_path: string
          file_type: string
          id: string
          image_metadata: Json | null
          thumbnail_path: string | null
          upload_status: string
          uploaded_by: string | null
        }
        Insert: {
          car_id?: string | null
          created_at?: string | null
          file_path: string
          file_type: string
          id?: string
          image_metadata?: Json | null
          thumbnail_path?: string | null
          upload_status: string
          uploaded_by?: string | null
        }
        Update: {
          car_id?: string | null
          created_at?: string | null
          file_path?: string
          file_type?: string
          id?: string
          image_metadata?: Json | null
          thumbnail_path?: string | null
          upload_status?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_file_uploads_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_file_uploads_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
          {
            foreignKeyName: "car_file_uploads_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_status_logs: {
        Row: {
          car_id: string
          created_at: string | null
          id: string
          new_status: string | null
          old_status: string | null
          updated_by: string
        }
        Insert: {
          car_id: string
          created_at?: string | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          updated_by: string
        }
        Update: {
          car_id?: string
          created_at?: string | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_status_logs_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_status_logs_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
          {
            foreignKeyName: "car_status_logs_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          additional_photos: string[] | null
          address: string | null
          auction_end_time: string | null
          auction_format: string | null
          auction_start_time: string | null
          auction_status: string | null
          capacity: number | null
          created_at: string | null
          description: string | null
          extension_duration_minutes: number | null
          extension_trigger_minutes: number | null
          extensions_used: number | null
          features: Json | null
          finance_amount: number | null
          finance_document_url: string | null
          has_documentation: boolean | null
          has_private_plate: boolean | null
          has_tool_pack: boolean | null
          id: string
          images: string[] | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_draft: boolean | null
          is_registered_in_poland: boolean | null
          is_selling_on_behalf: boolean | null
          last_saved: string | null
          make: string | null
          max_extensions_allowed: number | null
          mileage: number
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          name: string | null
          number_of_keys: number | null
          price: number
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number | null
          seat_material: string | null
          seller_id: string
          seller_notes: string | null
          service_history_files: string[] | null
          service_history_type:
            | Database["public"]["Enums"]["service_history_type"]
            | null
          status: string | null
          thumbnails: Json | null
          title: string
          transmission:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          updated_at: string | null
          valuation_data: Json | null
          vin: string
          year: number | null
        }
        Insert: {
          additional_photos?: string[] | null
          address?: string | null
          auction_end_time?: string | null
          auction_format?: string | null
          auction_start_time?: string | null
          auction_status?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          extension_duration_minutes?: number | null
          extension_trigger_minutes?: number | null
          extensions_used?: number | null
          features?: Json | null
          finance_amount?: number | null
          finance_document_url?: string | null
          has_documentation?: boolean | null
          has_private_plate?: boolean | null
          has_tool_pack?: boolean | null
          id?: string
          images?: string[] | null
          is_auction?: boolean | null
          is_damaged?: boolean | null
          is_draft?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          last_saved?: string | null
          make?: string | null
          max_extensions_allowed?: number | null
          mileage: number
          minimum_bid_increment?: number | null
          mobile_number?: string | null
          model?: string | null
          name?: string | null
          number_of_keys?: number | null
          price: number
          registration_number?: string | null
          required_photos?: Json | null
          reserve_price?: number | null
          seat_material?: string | null
          seller_id: string
          seller_notes?: string | null
          service_history_files?: string[] | null
          service_history_type?:
            | Database["public"]["Enums"]["service_history_type"]
            | null
          status?: string | null
          thumbnails?: Json | null
          title: string
          transmission?:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          updated_at?: string | null
          valuation_data?: Json | null
          vin: string
          year?: number | null
        }
        Update: {
          additional_photos?: string[] | null
          address?: string | null
          auction_end_time?: string | null
          auction_format?: string | null
          auction_start_time?: string | null
          auction_status?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          extension_duration_minutes?: number | null
          extension_trigger_minutes?: number | null
          extensions_used?: number | null
          features?: Json | null
          finance_amount?: number | null
          finance_document_url?: string | null
          has_documentation?: boolean | null
          has_private_plate?: boolean | null
          has_tool_pack?: boolean | null
          id?: string
          images?: string[] | null
          is_auction?: boolean | null
          is_damaged?: boolean | null
          is_draft?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          last_saved?: string | null
          make?: string | null
          max_extensions_allowed?: number | null
          mileage?: number
          minimum_bid_increment?: number | null
          mobile_number?: string | null
          model?: string | null
          name?: string | null
          number_of_keys?: number | null
          price?: number
          registration_number?: string | null
          required_photos?: Json | null
          reserve_price?: number | null
          seat_material?: string | null
          seller_id?: string
          seller_notes?: string | null
          service_history_files?: string[] | null
          service_history_type?:
            | Database["public"]["Enums"]["service_history_type"]
            | null
          status?: string | null
          thumbnails?: Json | null
          title?: string
          transmission?:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          updated_at?: string | null
          valuation_data?: Json | null
          vin?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cars_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_watchlist: {
        Row: {
          buyer_id: string
          car_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          buyer_id: string
          car_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          buyer_id?: string
          car_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_watchlist_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_watchlist_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_watchlist_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
          {
            foreignKeyName: "buyer_watchlist_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      dealers: {
        Row: {
          address: string | null
          business_registry_number: string
          created_at: string | null
          dealership_name: string
          id: string
          is_verified: boolean
          license_number: string
          supervisor_name: string
          tax_id: string
          updated_at: string | null
          user_id: string
          verification_status: string
        }
        Insert: {
          address?: string | null
          business_registry_number: string
          created_at?: string | null
          dealership_name: string
          id?: string
          is_verified?: boolean
          license_number: string
          supervisor_name: string
          tax_id: string
          updated_at?: string | null
          user_id: string
          verification_status?: string
        }
        Update: {
          address?: string | null
          business_registry_number?: string
          created_at?: string | null
          dealership_name?: string
          id?: string
          is_verified?: boolean
          license_number?: string
          supervisor_name?: string
          tax_id?: string
          updated_at?: string | null
          user_id?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_valuations: {
        Row: {
          accident_history: boolean | null
          additional_photos: string[] | null
          address: string | null
          color: string | null
          condition_rating: number
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          engine_capacity: number | null
          features: Json | null
          finance_amount: number | null
          finance_document_url: string | null
          fuel_type: string | null
          has_documentation: boolean | null
          has_private_plate: boolean | null
          has_tool_pack: boolean | null
          id: string
          interior_material: string | null
          is_damaged: boolean | null
          is_registered_in_poland: boolean | null
          is_selling_on_behalf: boolean | null
          last_service_date: string | null
          make: string
          mileage: number
          mobile_number: string | null
          model: string
          modifications: string | null
          name: string | null
          notes: string | null
          number_of_keys: number | null
          photos: Json | null
          previous_owners: number | null
          registration_number: string | null
          required_photos: Json | null
          seat_material: string | null
          seller_notes: string | null
          service_history_files: string[] | null
          service_history_status: string | null
          service_history_type: string | null
          status: Database["public"]["Enums"]["manual_valuation_status"] | null
          transmission: string
          updated_at: string | null
          user_id: string | null
          vin: string
          year: number
        }
        Insert: {
          accident_history?: boolean | null
          additional_photos?: string[] | null
          address?: string | null
          color?: string | null
          condition_rating: number
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          engine_capacity?: number | null
          features?: Json | null
          finance_amount?: number | null
          finance_document_url?: string | null
          fuel_type?: string | null
          has_documentation?: boolean | null
          has_private_plate?: boolean | null
          has_tool_pack?: boolean | null
          id?: string
          interior_material?: string | null
          is_damaged?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          last_service_date?: string | null
          make: string
          mileage: number
          mobile_number?: string | null
          model: string
          modifications?: string | null
          name?: string | null
          notes?: string | null
          number_of_keys?: number | null
          photos?: Json | null
          previous_owners?: number | null
          registration_number?: string | null
          required_photos?: Json | null
          seat_material?: string | null
          seller_notes?: string | null
          service_history_files?: string[] | null
          service_history_status?: string | null
          service_history_type?: string | null
          status?: Database["public"]["Enums"]["manual_valuation_status"] | null
          transmission: string
          updated_at?: string | null
          user_id?: string | null
          vin: string
          year: number
        }
        Update: {
          accident_history?: boolean | null
          additional_photos?: string[] | null
          address?: string | null
          color?: string | null
          condition_rating?: number
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          engine_capacity?: number | null
          features?: Json | null
          finance_amount?: number | null
          finance_document_url?: string | null
          fuel_type?: string | null
          has_documentation?: boolean | null
          has_private_plate?: boolean | null
          has_tool_pack?: boolean | null
          id?: string
          interior_material?: string | null
          is_damaged?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          last_service_date?: string | null
          make?: string
          mileage?: number
          mobile_number?: string | null
          model?: string
          modifications?: string | null
          name?: string | null
          notes?: string | null
          number_of_keys?: number | null
          photos?: Json | null
          previous_owners?: number | null
          registration_number?: string | null
          required_photos?: Json | null
          seat_material?: string | null
          seller_notes?: string | null
          service_history_files?: string[] | null
          service_history_status?: string | null
          service_history_type?: string | null
          status?: Database["public"]["Enums"]["manual_valuation_status"] | null
          transmission?: string
          updated_at?: string | null
          user_id?: string | null
          vin?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      proxy_bid_audit_logs: {
        Row: {
          action_timestamp: string | null
          action_type: string
          car_id: string | null
          created_at: string | null
          dealer_id: string | null
          id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          proxy_bid_id: string | null
        }
        Insert: {
          action_timestamp?: string | null
          action_type: string
          car_id?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          proxy_bid_id?: string | null
        }
        Update: {
          action_timestamp?: string | null
          action_type?: string
          car_id?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          proxy_bid_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proxy_bid_audit_logs_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proxy_bid_audit_logs_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
          {
            foreignKeyName: "proxy_bid_audit_logs_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proxy_bid_audit_logs_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proxy_bid_audit_logs_proxy_bid_id_fkey"
            columns: ["proxy_bid_id"]
            isOneToOne: false
            referencedRelation: "proxy_bids"
            referencedColumns: ["id"]
          },
        ]
      }
      proxy_bid_errors: {
        Row: {
          created_at: string | null
          error_message: string
          error_type: string
          id: string
          metadata: Json | null
          proxy_bid_id: string | null
          resolved: boolean | null
          resolved_at: string | null
          retry_count: number | null
          stack_trace: string | null
        }
        Insert: {
          created_at?: string | null
          error_message: string
          error_type: string
          id?: string
          metadata?: Json | null
          proxy_bid_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          retry_count?: number | null
          stack_trace?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string
          error_type?: string
          id?: string
          metadata?: Json | null
          proxy_bid_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          retry_count?: number | null
          stack_trace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proxy_bid_errors_proxy_bid_id_fkey"
            columns: ["proxy_bid_id"]
            isOneToOne: false
            referencedRelation: "proxy_bids"
            referencedColumns: ["id"]
          },
        ]
      }
      proxy_bids: {
        Row: {
          car_id: string | null
          created_at: string | null
          dealer_id: string | null
          id: string
          max_bid_amount: number
          updated_at: string | null
        }
        Insert: {
          car_id?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          max_bid_amount: number
          updated_at?: string | null
        }
        Update: {
          car_id?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          max_bid_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proxy_bids_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proxy_bids_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
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
      query_metrics: {
        Row: {
          execution_time: unknown | null
          id: string
          query_hash: string
          query_text: string
          rows_affected: number | null
          timestamp: string | null
        }
        Insert: {
          execution_time?: unknown | null
          id?: string
          query_hash: string
          query_text: string
          rows_affected?: number | null
          timestamp?: string | null
        }
        Update: {
          execution_time?: unknown | null
          id?: string
          query_hash?: string
          query_text?: string
          rows_affected?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint_name: string
          id: string
          requests_limit: number
          time_window: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint_name: string
          id?: string
          requests_limit: number
          time_window: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint_name?: string
          id?: string
          requests_limit?: number
          time_window?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          active_connections: number | null
          avg_query_time_ms: number | null
          cache_hit_ratio: number | null
          cpu_usage: number | null
          id: string
          memory_usage: number | null
          timestamp: string | null
          total_queries: number | null
        }
        Insert: {
          active_connections?: number | null
          avg_query_time_ms?: number | null
          cache_hit_ratio?: number | null
          cpu_usage?: number | null
          id?: string
          memory_usage?: number | null
          timestamp?: string | null
          total_queries?: number | null
        }
        Update: {
          active_connections?: number | null
          avg_query_time_ms?: number | null
          cache_hit_ratio?: number | null
          cpu_usage?: number | null
          id?: string
          memory_usage?: number | null
          timestamp?: string | null
          total_queries?: number | null
        }
        Relationships: []
      }
      vin_search_results: {
        Row: {
          created_at: string | null
          id: string
          search_data: Json | null
          user_id: string | null
          vin: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          search_data?: Json | null
          user_id?: string | null
          vin: string
        }
        Update: {
          created_at?: string | null
          id?: string
          search_data?: Json | null
          user_id?: string | null
          vin?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_vehicle_listings: {
        Row: {
          active_bidders: number | null
          auction_end_time: string | null
          auction_start_time: string | null
          auction_status: string | null
          highest_actual_bid: number | null
          highest_proxy_bid: number | null
          id: string | null
          interested_dealers: number | null
          is_auction: boolean | null
          make: string | null
          model: string | null
          price: number | null
          reserve_price: number | null
          seller_role: Database["public"]["Enums"]["user_role"] | null
          title: string | null
          year: number | null
        }
        Relationships: []
      }
      auction_performance_summary: {
        Row: {
          auction_end_time: string | null
          auction_id: string | null
          auction_start_time: string | null
          auction_status: string | null
          average_bid: number | null
          error_count: number | null
          highest_bid: number | null
          title: string | null
          total_bids: number | null
          unique_bidders: number | null
        }
        Relationships: []
      }
      deprecated_function_calls: {
        Row: {
          call_count: number | null
          last_called: string | null
          query_text: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      append_additional_photo: {
        Args: {
          car_id: string
          photo_path: string
        }
        Returns: string[]
      }
      append_service_history: {
        Args: {
          car_id: string
          file_path: string
        }
        Returns: string[]
      }
      calculate_checksum: {
        Args: {
          api_id: string
          api_secret: string
          vin: string
        }
        Returns: string
      }
      check_bid_rate_limit: {
        Args: {
          dealer_id: string
        }
        Returns: boolean
      }
      check_bid_volume_alert: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_cache_performance_alert: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_dealer_email_exists: {
        Args: {
          email_to_check: string
        }
        Returns: boolean
      }
      check_email_exists: {
        Args: {
          email_to_check: string
        }
        Returns: boolean
      }
      check_error_rate_alert: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_suspicious_bidding: {
        Args: {
          bid_car_id: string
          bid_dealer_id: string
          bid_amount: number
        }
        Returns: boolean
      }
      check_system_performance_alert: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_vin_exists: {
        Args: {
          check_vin: string
        }
        Returns: boolean
      }
      cleanup_failed_dealer_registration: {
        Args: {
          user_id_param: string
        }
        Returns: undefined
      }
      cleanup_old_listings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_resolved_proxy_bid_errors: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      close_ended_auctions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_vin_search: {
        Args: {
          search_vin: string
          search_result: Json
          searcher_id?: string
        }
        Returns: undefined
      }
      process_pending_proxy_bids: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_auction_performance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_auction_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_required_photos: {
        Args: {
          car_id: string
          photo_path: string
          photo_type: string
        }
        Returns: Json
      }
    }
    Enums: {
      car_country_code: "PL" | "DE" | "UK"
      car_fuel_type: "petrol" | "diesel" | "electric" | "hybrid"
      car_transmission_type: "manual" | "automatic"
      manual_valuation_status: "pending" | "processed" | "rejected"
      service_history_type: "full" | "partial" | "none" | "not_due"
      user_role: "seller" | "dealer" | "admin"
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
