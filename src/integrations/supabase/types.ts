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
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
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
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
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
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
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
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
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
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
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
      car_damages: {
        Row: {
          car_id: string | null
          created_at: string | null
          damage_type: Database["public"]["Enums"]["damage_type"]
          description: string | null
          id: string
          photo_path: string | null
        }
        Insert: {
          car_id?: string | null
          created_at?: string | null
          damage_type: Database["public"]["Enums"]["damage_type"]
          description?: string | null
          id?: string
          photo_path?: string | null
        }
        Update: {
          car_id?: string | null
          created_at?: string | null
          damage_type?: Database["public"]["Enums"]["damage_type"]
          description?: string | null
          id?: string
          photo_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_damages_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "admin_vehicle_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_damages_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "auction_performance_summary"
            referencedColumns: ["auction_id"]
          },
          {
            foreignKeyName: "car_damages_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_damages_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
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
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
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
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
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
          damage_photos: Json | null
          damage_types: Json | null
          dealer_location: unknown | null
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
          latitude: number | null
          longitude: number | null
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
          rim_photos: Json | null
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
          warning_light_photos: string[] | null
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
          damage_photos?: Json | null
          damage_types?: Json | null
          dealer_location?: unknown | null
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
          latitude?: number | null
          longitude?: number | null
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
          rim_photos?: Json | null
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
          warning_light_photos?: string[] | null
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
          damage_photos?: Json | null
          damage_types?: Json | null
          dealer_location?: unknown | null
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
          latitude?: number | null
          longitude?: number | null
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
          rim_photos?: Json | null
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
          warning_light_photos?: string[] | null
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
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
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
          latitude: number | null
          license_number: string
          longitude: number | null
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
          latitude?: number | null
          license_number: string
          longitude?: number | null
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
          latitude?: number | null
          license_number?: string
          longitude?: number | null
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
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
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
            referencedRelation: "car_listings"
            referencedColumns: ["id"]
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
      seller_operations: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          operation_type: string
          output_data: Json | null
          seller_id: string
          success: boolean
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          operation_type: string
          output_data?: Json | null
          seller_id: string
          success?: boolean
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          operation_type?: string
          output_data?: Json | null
          seller_id?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "seller_operations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
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
      vin_reservations: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          reserved_at: string | null
          seller_id: string
          status: string
          vin: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          reserved_at?: string | null
          seller_id: string
          status?: string
          vin: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          reserved_at?: string | null
          seller_id?: string
          status?: string
          vin?: string
        }
        Relationships: [
          {
            foreignKeyName: "vin_reservations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      car_listings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          is_draft: boolean | null
          make: string | null
          mileage: number | null
          model: string | null
          price: number | null
          seller_id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          year: number | null
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
      deprecated_function_calls: {
        Row: {
          call_count: number | null
          last_called: string | null
          query_text: string | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: {
          oldname: string
          newname: string
          version: string
        }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: {
          tbl: unknown
          col: string
        }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: {
          tbl: unknown
          att_name: string
          geom: unknown
          mode?: string
        }
        Returns: number
      }
      _st_3dintersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      _st_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_coveredby:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: boolean
          }
      _st_covers:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: boolean
          }
      _st_crosses: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_intersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: {
          line1: unknown
          line2: unknown
        }
        Returns: number
      }
      _st_longestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      _st_orderingequals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: {
          geom: unknown
        }
        Returns: number
      }
      _st_touches: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      addauth: {
        Args: {
          "": string
        }
        Returns: boolean
      }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
            Returns: string
          }
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
      box:
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      box2d:
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      box2d_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2d_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2df_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box2df_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3d:
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      box3d_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3d_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      box3dtobox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      bytea:
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      calculate_checksum: {
        Args: {
          api_id: string
          api_secret: string
          vin: string
        }
        Returns: string
      }
      calculate_distance_miles: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
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
      check_car_ownership: {
        Args: {
          car_id: string
          user_id: string
        }
        Returns: boolean
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
      cleanup_expired_vin_reservations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
            Returns: string
          }
        | {
            Args: {
              schema_name: string
              table_name: string
              column_name: string
            }
            Returns: string
          }
        | {
            Args: {
              table_name: string
              column_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geography:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      geography_analyze: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      geography_typmod_out: {
        Args: {
          "": number
        }
        Returns: unknown
      }
      geometry:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      geometry_above: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_analyze: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      geometry_below: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_cmp: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_contained_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      geometry_eq: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_ge: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      geometry_gt: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_hash: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      geometry_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_le: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_left: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_lt: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_overabove: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overleft: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_overright: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_recv: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_right: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_same: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometry_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      geometry_sortsupport: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      geometry_typmod_out: {
        Args: {
          "": number
        }
        Returns: unknown
      }
      geometry_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      geometrytype:
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      geomfromewkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      geomfromewkt: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      get_proj4_from_srid: {
        Args: {
          "": number
        }
        Returns: string
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gidx_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      json: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      jsonb: {
        Args: {
          "": unknown
        }
        Returns: Json
      }
      log_vin_search: {
        Args: {
          search_vin: string
          search_result: Json
          searcher_id?: string
        }
        Returns: undefined
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      point: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      polygon: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      populate_geometry_columns:
        | {
            Args: {
              tbl_oid: unknown
              use_typmod?: boolean
            }
            Returns: number
          }
        | {
            Args: {
              use_typmod?: boolean
            }
            Returns: string
          }
      postgis_addbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: number
      }
      postgis_constraint_type: {
        Args: {
          geomschema: string
          geomtable: string
          geomcolumn: string
        }
        Returns: string
      }
      postgis_dropbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: {
          "": number
        }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: {
          "": number
        }
        Returns: number
      }
      postgis_typmod_type: {
        Args: {
          "": number
        }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_pending_proxy_bids: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_auction_performance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      spheroid_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      spheroid_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3ddistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_3dintersects: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_3dlength: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_3dlongestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_3dperimeter: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_3dshortestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_addpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_angle:
        | {
            Args: {
              line1: unknown
              line2: unknown
            }
            Returns: number
          }
        | {
            Args: {
              pt1: unknown
              pt2: unknown
              pt3: unknown
              pt4?: unknown
            }
            Returns: number
          }
      st_area:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              geog: unknown
              use_spheroid?: boolean
            }
            Returns: number
          }
      st_area2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_asbinary:
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      st_asencodedpolyline: {
        Args: {
          geom: unknown
          nprecision?: number
        }
        Returns: string
      }
      st_asewkb: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_asewkt:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      st_asgeojson:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              maxdecimaldigits?: number
              options?: number
            }
            Returns: string
          }
        | {
            Args: {
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
            Returns: string
          }
      st_asgml:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              maxdecimaldigits?: number
              options?: number
            }
            Returns: string
          }
        | {
            Args: {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
            Returns: string
          }
        | {
            Args: {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
            Returns: string
          }
      st_ashexewkb: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_askml:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              maxdecimaldigits?: number
              nprefix?: string
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              maxdecimaldigits?: number
              nprefix?: string
            }
            Returns: string
          }
      st_aslatlontext: {
        Args: {
          geom: unknown
          tmpl?: string
        }
        Returns: string
      }
      st_asmarc21: {
        Args: {
          geom: unknown
          format?: string
        }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              rel?: number
              maxdecimaldigits?: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              rel?: number
              maxdecimaldigits?: number
            }
            Returns: string
          }
      st_astext:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: {
          geom: unknown
          maxdecimaldigits?: number
          options?: number
        }
        Returns: string
      }
      st_azimuth:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: number
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: number
          }
      st_boundary: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: {
          geom: unknown
          fits?: boolean
        }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: {
              geom: unknown
              radius: number
              options?: string
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              radius: number
              quadsegs: number
            }
            Returns: unknown
          }
      st_buildarea: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_centroid:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      st_cleangeometry: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: {
          geom: unknown
          box: unknown
        }
        Returns: unknown
      }
      st_closestpoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: {
          "": unknown[]
        }
        Returns: unknown[]
      }
      st_collect:
        | {
            Args: {
              "": unknown[]
            }
            Returns: unknown
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: unknown
          }
      st_collectionextract: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_containsproperly: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_convexhull: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_coorddim: {
        Args: {
          geometry: unknown
        }
        Returns: number
      }
      st_coveredby:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: boolean
          }
      st_covers:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: boolean
          }
      st_crosses: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_curvetoline: {
        Args: {
          geom: unknown
          tol?: number
          toltype?: number
          flags?: number
        }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: {
          g1: unknown
          tolerance?: number
          flags?: number
        }
        Returns: unknown
      }
      st_difference: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_dimension: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_disjoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_distance:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
              use_spheroid?: boolean
            }
            Returns: number
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: number
          }
      st_distancesphere:
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: number
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
              radius: number
            }
            Returns: number
          }
      st_distancespheroid: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_dump: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: {
          "": unknown
        }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_envelope: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_equals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_expand:
        | {
            Args: {
              box: unknown
              dx: number
              dy: number
            }
            Returns: unknown
          }
        | {
            Args: {
              box: unknown
              dx: number
              dy: number
              dz?: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              dx: number
              dy: number
              dz?: number
              dm?: number
            }
            Returns: unknown
          }
      st_exteriorring: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_force2d: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_force3d: {
        Args: {
          geom: unknown
          zvalue?: number
        }
        Returns: unknown
      }
      st_force3dm: {
        Args: {
          geom: unknown
          mvalue?: number
        }
        Returns: unknown
      }
      st_force3dz: {
        Args: {
          geom: unknown
          zvalue?: number
        }
        Returns: unknown
      }
      st_force4d: {
        Args: {
          geom: unknown
          zvalue?: number
          mvalue?: number
        }
        Returns: unknown
      }
      st_forcecollection: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcecurve: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcerhr: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_forcesfs: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_generatepoints:
        | {
            Args: {
              area: unknown
              npoints: number
            }
            Returns: unknown
          }
        | {
            Args: {
              area: unknown
              npoints: number
              seed: number
            }
            Returns: unknown
          }
      st_geogfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geohash:
        | {
            Args: {
              geog: unknown
              maxchars?: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              maxchars?: number
            }
            Returns: string
          }
      st_geomcollfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geometrytype: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_geomfromewkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromgeojson:
        | {
            Args: {
              "": Json
            }
            Returns: unknown
          }
        | {
            Args: {
              "": Json
            }
            Returns: unknown
          }
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
      st_geomfromgml: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: {
          marc21xml: string
        }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_gmltosql: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_hasarc: {
        Args: {
          geometry: unknown
        }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_hexagon: {
        Args: {
          size: number
          cell_i: number
          cell_j: number
          origin?: unknown
        }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: {
          size: number
          bounds: unknown
        }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: {
          line: unknown
          point: unknown
        }
        Returns: number
      }
      st_intersection: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_intersects:
        | {
            Args: {
              geog1: unknown
              geog2: unknown
            }
            Returns: boolean
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: boolean
          }
      st_isclosed: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_iscollection: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isempty: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isring: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_issimple: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isvalid: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: {
          geom: unknown
          flags?: number
        }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      st_length:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              geog: unknown
              use_spheroid?: boolean
            }
            Returns: number
          }
      st_length2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_letters: {
        Args: {
          letters: string
          font?: Json
        }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: {
          line1: unknown
          line2: unknown
        }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: {
          txtin: string
          nprecision?: number
        }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_linefromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_linemerge: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_linetocurve: {
        Args: {
          geometry: unknown
        }
        Returns: unknown
      }
      st_locatealong: {
        Args: {
          geometry: unknown
          measure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: {
          geometry: unknown
          fromelevation: number
          toelevation: number
        }
        Returns: unknown
      }
      st_longestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_m: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_makebox2d: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_makeline:
        | {
            Args: {
              "": unknown[]
            }
            Returns: unknown
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: unknown
          }
      st_makepolygon: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_makevalid:
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              params: string
            }
            Returns: unknown
          }
      st_maxdistance: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: {
          "": unknown
        }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: {
          inputgeom: unknown
          segs_per_quarter?: number
        }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: {
          "": unknown
        }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multi: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_ndims: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_node: {
        Args: {
          g: unknown
        }
        Returns: unknown
      }
      st_normalize: {
        Args: {
          geom: unknown
        }
        Returns: unknown
      }
      st_npoints: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_nrings: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numgeometries: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numinteriorring: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numinteriorrings: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numpatches: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_numpoints: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_offsetcurve: {
        Args: {
          line: unknown
          distance: number
          params?: string
        }
        Returns: unknown
      }
      st_orderingequals: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_overlaps: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_perimeter:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              geog: unknown
              use_spheroid?: boolean
            }
            Returns: number
          }
      st_perimeter2d: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_pointfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_points: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_polygonize: {
        Args: {
          "": unknown[]
        }
        Returns: unknown
      }
      st_project: {
        Args: {
          geog: unknown
          distance: number
          azimuth: number
        }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: {
          geom: unknown
          gridsize: number
        }
        Returns: unknown
      }
      st_relate: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: {
          geom: unknown
          tolerance?: number
        }
        Returns: unknown
      }
      st_reverse: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_segmentize: {
        Args: {
          geog: unknown
          max_segment_length: number
        }
        Returns: unknown
      }
      st_setsrid:
        | {
            Args: {
              geog: unknown
              srid: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              srid: number
            }
            Returns: unknown
          }
      st_sharedpaths: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_shortestline: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: {
          geom: unknown
          vertex_fraction: number
          is_outer?: boolean
        }
        Returns: unknown
      }
      st_split: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_square: {
        Args: {
          size: number
          cell_i: number
          cell_j: number
          origin?: unknown
        }
        Returns: unknown
      }
      st_squaregrid: {
        Args: {
          size: number
          bounds: unknown
        }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | {
            Args: {
              geog: unknown
            }
            Returns: number
          }
        | {
            Args: {
              geom: unknown
            }
            Returns: number
          }
      st_startpoint: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      st_subdivide: {
        Args: {
          geom: unknown
          maxvertices?: number
          gridsize?: number
        }
        Returns: unknown[]
      }
      st_summary:
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      st_swapordinates: {
        Args: {
          geom: unknown
          ords: unknown
        }
        Returns: unknown
      }
      st_symdifference: {
        Args: {
          geom1: unknown
          geom2: unknown
          gridsize?: number
        }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_transform:
        | {
            Args: {
              geom: unknown
              from_proj: string
              to_proj: string
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              from_proj: string
              to_srid: number
            }
            Returns: unknown
          }
        | {
            Args: {
              geom: unknown
              to_proj: string
            }
            Returns: unknown
          }
      st_triangulatepolygon: {
        Args: {
          g1: unknown
        }
        Returns: unknown
      }
      st_union:
        | {
            Args: {
              "": unknown[]
            }
            Returns: unknown
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              geom1: unknown
              geom2: unknown
              gridsize: number
            }
            Returns: unknown
          }
      st_voronoilines: {
        Args: {
          g1: unknown
          tolerance?: number
          extend_to?: unknown
        }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: {
          g1: unknown
          tolerance?: number
          extend_to?: unknown
        }
        Returns: unknown
      }
      st_within: {
        Args: {
          geom1: unknown
          geom2: unknown
        }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: {
          wkb: string
        }
        Returns: unknown
      }
      st_wkttosql: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      st_wrapx: {
        Args: {
          geom: unknown
          wrap: number
          move: number
        }
        Returns: unknown
      }
      st_x: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_xmax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_xmin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_y: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_ymax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_ymin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_z: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmax: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmflag: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      st_zmin: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      text: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      unlockrows: {
        Args: {
          "": string
        }
        Returns: number
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
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
      }
    }
    Enums: {
      auction_status_type:
        | "pending"
        | "active"
        | "ended"
        | "sold"
        | "reserve_not_met"
      car_country_code: "PL" | "DE" | "UK"
      car_fuel_type: "petrol" | "diesel" | "electric" | "hybrid"
      car_transmission_type: "manual" | "automatic"
      damage_type: "scratches" | "dents" | "paintwork" | "windscreen"
      manual_valuation_status: "pending" | "processed" | "rejected"
      service_history_type: "full" | "partial" | "none" | "not_due"
      user_role: "seller" | "dealer" | "admin"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
