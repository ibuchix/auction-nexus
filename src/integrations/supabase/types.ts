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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          published_at: string | null
          target: Database["public"]["Enums"]["announcement_target"]
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          published_at?: string | null
          target?: Database["public"]["Enums"]["announcement_target"]
          title: string
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          published_at?: string | null
          target?: Database["public"]["Enums"]["announcement_target"]
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_closure_details: {
        Row: {
          auction_end_time: string | null
          car_id: string | null
          created_at: string | null
          final_price: number | null
          id: string
          make: string | null
          model: string | null
          sale_status: string | null
          title: string | null
          total_bids: number | null
          unique_bidders: number | null
          year: number | null
        }
        Insert: {
          auction_end_time?: string | null
          car_id?: string | null
          created_at?: string | null
          final_price?: number | null
          id?: string
          make?: string | null
          model?: string | null
          sale_status?: string | null
          title?: string | null
          total_bids?: number | null
          unique_bidders?: number | null
          year?: number | null
        }
        Update: {
          auction_end_time?: string | null
          car_id?: string | null
          created_at?: string | null
          final_price?: number | null
          id?: string
          make?: string | null
          model?: string | null
          sale_status?: string | null
          title?: string | null
          total_bids?: number | null
          unique_bidders?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_closure_details_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_closure_details_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_daily_summaries: {
        Row: {
          average_sale_price: number | null
          created_at: string | null
          date: string
          id: string
          sold_vehicles: number | null
          total_auctions_closed: number | null
          total_value: number | null
          unsold_vehicles: number | null
        }
        Insert: {
          average_sale_price?: number | null
          created_at?: string | null
          date: string
          id?: string
          sold_vehicles?: number | null
          total_auctions_closed?: number | null
          total_value?: number | null
          unsold_vehicles?: number | null
        }
        Update: {
          average_sale_price?: number | null
          created_at?: string | null
          date?: string
          id?: string
          sold_vehicles?: number | null
          total_auctions_closed?: number | null
          total_value?: number | null
          unsold_vehicles?: number | null
        }
        Relationships: []
      }
      auction_metrics: {
        Row: {
          car_id: string | null
          created_at: string | null
          final_price: number | null
          id: string
          total_bids: number | null
          unique_bidders: number | null
          updated_at: string | null
        }
        Insert: {
          car_id?: string | null
          created_at?: string | null
          final_price?: number | null
          id?: string
          total_bids?: number | null
          unique_bidders?: number | null
          updated_at?: string | null
        }
        Update: {
          car_id?: string | null
          created_at?: string | null
          final_price?: number | null
          id?: string
          total_bids?: number | null
          unique_bidders?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_metrics_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_metrics_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_results: {
        Row: {
          admin_review_status: string | null
          auction_id: string | null
          bid_count: number | null
          bidding_activity_timeline: Json | null
          car_id: string | null
          created_at: string | null
          final_price: number | null
          highest_bid_dealer_id: string | null
          id: string
          proxy_final_price: number | null
          sale_status: string | null
          seller_decision: string | null
          total_bids: number | null
          unique_bidders: number | null
          updated_at: string | null
        }
        Insert: {
          admin_review_status?: string | null
          auction_id?: string | null
          bid_count?: number | null
          bidding_activity_timeline?: Json | null
          car_id?: string | null
          created_at?: string | null
          final_price?: number | null
          highest_bid_dealer_id?: string | null
          id?: string
          proxy_final_price?: number | null
          sale_status?: string | null
          seller_decision?: string | null
          total_bids?: number | null
          unique_bidders?: number | null
          updated_at?: string | null
        }
        Update: {
          admin_review_status?: string | null
          auction_id?: string | null
          bid_count?: number | null
          bidding_activity_timeline?: Json | null
          car_id?: string | null
          created_at?: string | null
          final_price?: number | null
          highest_bid_dealer_id?: string | null
          id?: string
          proxy_final_price?: number | null
          sale_status?: string | null
          seller_decision?: string | null
          total_bids?: number | null
          unique_bidders?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_results_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_results_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_results_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: true
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_results_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: true
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_results_highest_bid_dealer_id_fkey"
            columns: ["highest_bid_dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_schedules: {
        Row: {
          car_id: string
          created_at: string
          created_by: string | null
          end_time: string
          id: string
          is_manually_controlled: boolean
          last_status_change: string
          notes: string | null
          start_time: string
          status: Database["public"]["Enums"]["auction_schedule_status"]
          updated_at: string
        }
        Insert: {
          car_id: string
          created_at?: string
          created_by?: string | null
          end_time: string
          id?: string
          is_manually_controlled?: boolean
          last_status_change?: string
          notes?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["auction_schedule_status"]
          updated_at?: string
        }
        Update: {
          car_id?: string
          created_at?: string
          created_by?: string | null
          end_time?: string
          id?: string
          is_manually_controlled?: boolean
          last_status_change?: string
          notes?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["auction_schedule_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_schedules_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_schedules_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_log_type"]
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_log_type"]
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_log_type"]
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
            foreignKeyName: "bids_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bids_dealer_id"
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
          category: string | null
          created_at: string | null
          display_order: number | null
          file_path: string
          file_type: string
          id: string
          image_metadata: Json | null
          seller_id: string
          session_id: string | null
          updated_at: string | null
          upload_status: string | null
        }
        Insert: {
          car_id?: string | null
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          file_path: string
          file_type: string
          id?: string
          image_metadata?: Json | null
          seller_id: string
          session_id?: string | null
          updated_at?: string | null
          upload_status?: string | null
        }
        Update: {
          car_id?: string | null
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          file_path?: string
          file_type?: string
          id?: string
          image_metadata?: Json | null
          seller_id?: string
          session_id?: string | null
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
          {
            foreignKeyName: "car_file_uploads_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          ac_working: boolean | null
          accident_history: string | null
          additional_photos: Json | null
          auction_end_time: string | null
          auction_scheduled: boolean
          auction_status: string | null
          awaiting_seller_decision: boolean
          brakes_noisy: boolean | null
          contact_email: string
          county: string | null
          created_at: string
          current_bid: number | null
          electrical_faults: boolean | null
          email_notification_sent: boolean
          engine_capacity: string | null
          engine_faults: boolean | null
          engine_smokes: boolean | null
          features: Json | null
          finance_amount: number | null
          finance_document_name: string | null
          finance_document_uploaded_at: string | null
          finance_document_url: string | null
          first_registration_date: string | null
          form_metadata: Json | null
          fuel_type: string | null
          gearbox_faults: boolean | null
          has_dents: boolean | null
          has_full_registration_document: boolean | null
          has_interior_stains: boolean | null
          has_mileage_discrepancy: boolean | null
          has_outstanding_finance: boolean | null
          has_rust: boolean | null
          has_scratches: boolean | null
          has_service_history: boolean | null
          horsepower: number | null
          id: string
          images: string[] | null
          import_year: number | null
          is_accident_record_abroad: boolean | null
          is_accident_record_poland: boolean | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_damaged_record_abroad: boolean | null
          is_damaged_record_poland: boolean | null
          is_manually_controlled: boolean | null
          is_polish_origin: boolean | null
          is_recorded_stolen: boolean | null
          is_registered_in_poland: boolean | null
          is_selling_on_behalf: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          owners_count_poland: number | null
          postcode: string | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number
          rim_photos: Json | null
          runs_smoothly: boolean | null
          seat_material: string | null
          seller_acceptable_price: number | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          street_address: string | null
          suspension_noisy: boolean | null
          technical_inspection_valid_until: string | null
          tires_legal_depth: boolean | null
          title: string | null
          town: string | null
          transmission: string | null
          updated_at: string
          valuation_data: Json | null
          vin: string | null
          warning_lights_on: boolean | null
          windows_working: boolean | null
          year: number | null
        }
        Insert: {
          ac_working?: boolean | null
          accident_history?: string | null
          additional_photos?: Json | null
          auction_end_time?: string | null
          auction_scheduled?: boolean
          auction_status?: string | null
          awaiting_seller_decision?: boolean
          brakes_noisy?: boolean | null
          contact_email: string
          county?: string | null
          created_at?: string
          current_bid?: number | null
          electrical_faults?: boolean | null
          email_notification_sent?: boolean
          engine_capacity?: string | null
          engine_faults?: boolean | null
          engine_smokes?: boolean | null
          features?: Json | null
          finance_amount?: number | null
          finance_document_name?: string | null
          finance_document_uploaded_at?: string | null
          finance_document_url?: string | null
          first_registration_date?: string | null
          form_metadata?: Json | null
          fuel_type?: string | null
          gearbox_faults?: boolean | null
          has_dents?: boolean | null
          has_full_registration_document?: boolean | null
          has_interior_stains?: boolean | null
          has_mileage_discrepancy?: boolean | null
          has_outstanding_finance?: boolean | null
          has_rust?: boolean | null
          has_scratches?: boolean | null
          has_service_history?: boolean | null
          horsepower?: number | null
          id?: string
          images?: string[] | null
          import_year?: number | null
          is_accident_record_abroad?: boolean | null
          is_accident_record_poland?: boolean | null
          is_auction?: boolean | null
          is_damaged?: boolean | null
          is_damaged_record_abroad?: boolean | null
          is_damaged_record_poland?: boolean | null
          is_manually_controlled?: boolean | null
          is_polish_origin?: boolean | null
          is_recorded_stolen?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          last_saved?: string | null
          make?: string | null
          mileage?: number | null
          minimum_bid_increment?: number | null
          mobile_number?: string | null
          model?: string | null
          number_of_keys?: number | null
          owners_count_poland?: number | null
          postcode?: string | null
          registration_number?: string | null
          required_photos?: Json | null
          reserve_price?: number
          rim_photos?: Json | null
          runs_smoothly?: boolean | null
          seat_material?: string | null
          seller_acceptable_price?: number | null
          seller_id?: string | null
          seller_name?: string | null
          seller_notes?: string | null
          service_history_type?: string | null
          status?: string | null
          street_address?: string | null
          suspension_noisy?: boolean | null
          technical_inspection_valid_until?: string | null
          tires_legal_depth?: boolean | null
          title?: string | null
          town?: string | null
          transmission?: string | null
          updated_at?: string
          valuation_data?: Json | null
          vin?: string | null
          warning_lights_on?: boolean | null
          windows_working?: boolean | null
          year?: number | null
        }
        Update: {
          ac_working?: boolean | null
          accident_history?: string | null
          additional_photos?: Json | null
          auction_end_time?: string | null
          auction_scheduled?: boolean
          auction_status?: string | null
          awaiting_seller_decision?: boolean
          brakes_noisy?: boolean | null
          contact_email?: string
          county?: string | null
          created_at?: string
          current_bid?: number | null
          electrical_faults?: boolean | null
          email_notification_sent?: boolean
          engine_capacity?: string | null
          engine_faults?: boolean | null
          engine_smokes?: boolean | null
          features?: Json | null
          finance_amount?: number | null
          finance_document_name?: string | null
          finance_document_uploaded_at?: string | null
          finance_document_url?: string | null
          first_registration_date?: string | null
          form_metadata?: Json | null
          fuel_type?: string | null
          gearbox_faults?: boolean | null
          has_dents?: boolean | null
          has_full_registration_document?: boolean | null
          has_interior_stains?: boolean | null
          has_mileage_discrepancy?: boolean | null
          has_outstanding_finance?: boolean | null
          has_rust?: boolean | null
          has_scratches?: boolean | null
          has_service_history?: boolean | null
          horsepower?: number | null
          id?: string
          images?: string[] | null
          import_year?: number | null
          is_accident_record_abroad?: boolean | null
          is_accident_record_poland?: boolean | null
          is_auction?: boolean | null
          is_damaged?: boolean | null
          is_damaged_record_abroad?: boolean | null
          is_damaged_record_poland?: boolean | null
          is_manually_controlled?: boolean | null
          is_polish_origin?: boolean | null
          is_recorded_stolen?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          last_saved?: string | null
          make?: string | null
          mileage?: number | null
          minimum_bid_increment?: number | null
          mobile_number?: string | null
          model?: string | null
          number_of_keys?: number | null
          owners_count_poland?: number | null
          postcode?: string | null
          registration_number?: string | null
          required_photos?: Json | null
          reserve_price?: number
          rim_photos?: Json | null
          runs_smoothly?: boolean | null
          seat_material?: string | null
          seller_acceptable_price?: number | null
          seller_id?: string | null
          seller_name?: string | null
          seller_notes?: string | null
          service_history_type?: string | null
          status?: string | null
          street_address?: string | null
          suspension_noisy?: boolean | null
          technical_inspection_valid_until?: string | null
          tires_legal_depth?: boolean | null
          title?: string | null
          town?: string | null
          transmission?: string | null
          updated_at?: string
          valuation_data?: Json | null
          vin?: string | null
          warning_lights_on?: boolean | null
          windows_working?: boolean | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cars_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cars_history: {
        Row: {
          car_id: string
          change_type: string
          changed_at: string
          changed_by: string | null
          id: string
          metadata: Json | null
          previous_status: string | null
          seller_id: string
          status: string | null
        }
        Insert: {
          car_id: string
          change_type: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          metadata?: Json | null
          previous_status?: string | null
          seller_id: string
          status?: string | null
        }
        Update: {
          car_id?: string
          change_type?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          metadata?: Json | null
          previous_status?: string | null
          seller_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cars_history_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cars_history_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_bid_rate_limits: {
        Row: {
          bid_count: number
          bid_date: string
          created_at: string | null
          dealer_id: string
          id: string
          last_bid_at: string | null
          updated_at: string | null
        }
        Insert: {
          bid_count?: number
          bid_date?: string
          created_at?: string | null
          dealer_id: string
          id?: string
          last_bid_at?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_count?: number
          bid_date?: string
          created_at?: string | null
          dealer_id?: string
          id?: string
          last_bid_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dealer_documents: {
        Row: {
          created_at: string
          dealer_id: string
          document_type: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          updated_at: string
          uploaded_at: string
          verification_notes: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          dealer_id: string
          document_type: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          updated_at?: string
          uploaded_at?: string
          verification_notes?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          dealer_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          updated_at?: string
          uploaded_at?: string
          verification_notes?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_documents_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_purchases: {
        Row: {
          amount: number
          car_id: string | null
          created_at: string | null
          dealer_id: string | null
          id: string
          notes: string | null
          purchase_date: string | null
          refund_date: string | null
          refund_reason: string | null
          refunded_by: string | null
          status: string | null
          transaction_reference: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          car_id?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          notes?: string | null
          purchase_date?: string | null
          refund_date?: string | null
          refund_reason?: string | null
          refunded_by?: string | null
          status?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          car_id?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          notes?: string | null
          purchase_date?: string | null
          refund_date?: string | null
          refund_reason?: string | null
          refunded_by?: string | null
          status?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_purchases_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_purchases_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_purchases_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_verifications: {
        Row: {
          admin_id: string | null
          dealer_id: string
          documents: Json | null
          id: string
          notes: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          submitted_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          admin_id?: string | null
          dealer_id: string
          documents?: Json | null
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          submitted_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          admin_id?: string | null
          dealer_id?: string
          documents?: Json | null
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          submitted_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "dealer_verifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_verifications_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_wishlists: {
        Row: {
          car_id: string
          created_at: string
          dealer_id: string
          expires_at: string
          id: string
        }
        Insert: {
          car_id: string
          created_at?: string
          dealer_id: string
          expires_at?: string
          id?: string
        }
        Update: {
          car_id?: string
          created_at?: string
          dealer_id?: string
          expires_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_wishlists_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_wishlists_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_wishlists_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_won_vehicles: {
        Row: {
          auction_end_time: string
          car_id: string
          created_at: string
          dealer_id: string
          id: string
          original_bid_amount: number
          payment_date: string | null
          payment_status: string
          platform_fee: number
          second_highest_bid: number | null
          seller_details_unlocked: boolean
          stripe_payment_intent_id: string | null
          updated_at: string
          vehicle_images: Json | null
          vehicle_make: string
          vehicle_mileage: number | null
          vehicle_model: string
          vehicle_year: number
          winning_bid_amount: number
        }
        Insert: {
          auction_end_time: string
          car_id: string
          created_at?: string
          dealer_id: string
          id?: string
          original_bid_amount: number
          payment_date?: string | null
          payment_status?: string
          platform_fee?: number
          second_highest_bid?: number | null
          seller_details_unlocked?: boolean
          stripe_payment_intent_id?: string | null
          updated_at?: string
          vehicle_images?: Json | null
          vehicle_make: string
          vehicle_mileage?: number | null
          vehicle_model: string
          vehicle_year: number
          winning_bid_amount: number
        }
        Update: {
          auction_end_time?: string
          car_id?: string
          created_at?: string
          dealer_id?: string
          id?: string
          original_bid_amount?: number
          payment_date?: string | null
          payment_status?: string
          platform_fee?: number
          second_highest_bid?: number | null
          seller_details_unlocked?: boolean
          stripe_payment_intent_id?: string | null
          updated_at?: string
          vehicle_images?: Json | null
          vehicle_make?: string
          vehicle_mileage?: number | null
          vehicle_model?: string
          vehicle_year?: number
          winning_bid_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "dealer_won_vehicles_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: true
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_won_vehicles_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: true
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_won_vehicles_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
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
      dispute_comments: {
        Row: {
          attachments: Json | null
          author_id: string
          content: string
          created_at: string
          dispute_id: string
          id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          content: string
          created_at?: string
          dispute_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          content?: string
          created_at?: string
          dispute_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_comments_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          car_id: string | null
          created_at: string
          description: string
          id: string
          resolution: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          submitted_by: string
          title: string
          type: Database["public"]["Enums"]["dispute_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          car_id?: string | null
          created_at?: string
          description: string
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          submitted_by: string
          title: string
          type?: Database["public"]["Enums"]["dispute_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          car_id?: string | null
          created_at?: string
          description?: string
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          submitted_by?: string
          title?: string
          type?: Database["public"]["Enums"]["dispute_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notification_events: {
        Row: {
          car_id: string
          created_at: string
          dealer_id: string | null
          id: string
          message_id: string | null
          metadata: Json
          recipient_email: string
          subject: string
          type: string
        }
        Insert: {
          car_id: string
          created_at?: string
          dealer_id?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json
          recipient_email: string
          subject: string
          type: string
        }
        Update: {
          car_id?: string
          created_at?: string
          dealer_id?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json
          recipient_email?: string
          subject?: string
          type?: string
        }
        Relationships: []
      }
      export_history: {
        Row: {
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          export_type: string
          exported_by: string | null
          filters: Json | null
          id: string
          record_count: number | null
        }
        Insert: {
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          export_type: string
          exported_by?: string | null
          filters?: Json | null
          id?: string
          record_count?: number | null
        }
        Update: {
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          export_type?: string
          exported_by?: string | null
          filters?: Json | null
          id?: string
          record_count?: number | null
        }
        Relationships: []
      }
      listing_verifications: {
        Row: {
          admin_id: string | null
          car_id: string
          id: string
          notes: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          submitted_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          admin_id?: string | null
          car_id: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          submitted_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          admin_id?: string | null
          car_id?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          submitted_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "listing_verifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_verifications_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_verifications_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_file_uploads: {
        Row: {
          category: string | null
          created_at: string | null
          display_order: number | null
          file_path: string
          file_type: string
          id: string
          image_metadata: Json | null
          manual_valuation_id: string | null
          session_id: string | null
          updated_at: string | null
          upload_status: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          file_path: string
          file_type: string
          id?: string
          image_metadata?: Json | null
          manual_valuation_id?: string | null
          session_id?: string | null
          updated_at?: string | null
          upload_status?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          file_path?: string
          file_type?: string
          id?: string
          image_metadata?: Json | null
          manual_valuation_id?: string | null
          session_id?: string | null
          updated_at?: string | null
          upload_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_file_uploads_manual_valuation_id_fkey"
            columns: ["manual_valuation_id"]
            isOneToOne: false
            referencedRelation: "manual_valuations"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_valuations: {
        Row: {
          ac_working: boolean | null
          accident_history: string | null
          brakes_noisy: boolean | null
          contact_email: string | null
          contact_phone: string | null
          county: string | null
          created_at: string | null
          electrical_faults: boolean | null
          engine_faults: boolean | null
          engine_smokes: boolean | null
          features: Json | null
          finance_amount: number | null
          finance_document_name: string | null
          finance_document_uploaded_at: string | null
          finance_document_url: string | null
          first_registration_date: string | null
          fuel_type: string | null
          gearbox_faults: boolean | null
          has_dents: boolean | null
          has_documentation: boolean | null
          has_full_registration_document: boolean | null
          has_interior_stains: boolean | null
          has_outstanding_finance: boolean | null
          has_rust: boolean | null
          has_scratches: boolean | null
          id: string
          is_damaged: boolean | null
          is_registered_in_poland: boolean | null
          is_selling_on_behalf: boolean | null
          make: string | null
          mileage: number | null
          mobile_number: string | null
          model: string | null
          name: string | null
          number_of_keys: number | null
          postcode: string | null
          registration_number: string | null
          reserve_price: number | null
          runs_smoothly: boolean | null
          seat_material: string | null
          seller_acceptable_price: number | null
          seller_notes: string | null
          service_history_files: string[] | null
          service_history_type: string | null
          status: string | null
          street_address: string | null
          suspension_noisy: boolean | null
          tires_legal_depth: boolean | null
          town: string | null
          transmission:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          updated_at: string | null
          uploaded_photos: Json | null
          user_id: string | null
          valuation_result: Json | null
          vin: string | null
          warning_lights_on: boolean | null
          windows_working: boolean | null
          year: number | null
        }
        Insert: {
          ac_working?: boolean | null
          accident_history?: string | null
          brakes_noisy?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          created_at?: string | null
          electrical_faults?: boolean | null
          engine_faults?: boolean | null
          engine_smokes?: boolean | null
          features?: Json | null
          finance_amount?: number | null
          finance_document_name?: string | null
          finance_document_uploaded_at?: string | null
          finance_document_url?: string | null
          first_registration_date?: string | null
          fuel_type?: string | null
          gearbox_faults?: boolean | null
          has_dents?: boolean | null
          has_documentation?: boolean | null
          has_full_registration_document?: boolean | null
          has_interior_stains?: boolean | null
          has_outstanding_finance?: boolean | null
          has_rust?: boolean | null
          has_scratches?: boolean | null
          id?: string
          is_damaged?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          make?: string | null
          mileage?: number | null
          mobile_number?: string | null
          model?: string | null
          name?: string | null
          number_of_keys?: number | null
          postcode?: string | null
          registration_number?: string | null
          reserve_price?: number | null
          runs_smoothly?: boolean | null
          seat_material?: string | null
          seller_acceptable_price?: number | null
          seller_notes?: string | null
          service_history_files?: string[] | null
          service_history_type?: string | null
          status?: string | null
          street_address?: string | null
          suspension_noisy?: boolean | null
          tires_legal_depth?: boolean | null
          town?: string | null
          transmission?:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          updated_at?: string | null
          uploaded_photos?: Json | null
          user_id?: string | null
          valuation_result?: Json | null
          vin?: string | null
          warning_lights_on?: boolean | null
          windows_working?: boolean | null
          year?: number | null
        }
        Update: {
          ac_working?: boolean | null
          accident_history?: string | null
          brakes_noisy?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          created_at?: string | null
          electrical_faults?: boolean | null
          engine_faults?: boolean | null
          engine_smokes?: boolean | null
          features?: Json | null
          finance_amount?: number | null
          finance_document_name?: string | null
          finance_document_uploaded_at?: string | null
          finance_document_url?: string | null
          first_registration_date?: string | null
          fuel_type?: string | null
          gearbox_faults?: boolean | null
          has_dents?: boolean | null
          has_documentation?: boolean | null
          has_full_registration_document?: boolean | null
          has_interior_stains?: boolean | null
          has_outstanding_finance?: boolean | null
          has_rust?: boolean | null
          has_scratches?: boolean | null
          id?: string
          is_damaged?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          make?: string | null
          mileage?: number | null
          mobile_number?: string | null
          model?: string | null
          name?: string | null
          number_of_keys?: number | null
          postcode?: string | null
          registration_number?: string | null
          reserve_price?: number | null
          runs_smoothly?: boolean | null
          seat_material?: string | null
          seller_acceptable_price?: number | null
          seller_notes?: string | null
          service_history_files?: string[] | null
          service_history_type?: string | null
          status?: string | null
          street_address?: string | null
          suspension_noisy?: boolean | null
          tires_legal_depth?: boolean | null
          town?: string | null
          transmission?:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          updated_at?: string | null
          uploaded_photos?: Json | null
          user_id?: string | null
          valuation_result?: Json | null
          vin?: string | null
          warning_lights_on?: boolean | null
          windows_working?: boolean | null
          year?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          used_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          token: string
          used_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          used_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      photo_upload_audit_logs: {
        Row: {
          action: string
          car_id: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_size_total: number | null
          id: string
          ip_address: string | null
          photo_count: number | null
          processing_time_ms: number | null
          request_id: string
          security_checks: Json | null
          session_id: string | null
          status: string
          user_agent: string | null
          user_id: string
          validation_errors: Json | null
        }
        Insert: {
          action: string
          car_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_size_total?: number | null
          id?: string
          ip_address?: string | null
          photo_count?: number | null
          processing_time_ms?: number | null
          request_id: string
          security_checks?: Json | null
          session_id?: string | null
          status: string
          user_agent?: string | null
          user_id: string
          validation_errors?: Json | null
        }
        Update: {
          action?: string
          car_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_size_total?: number | null
          id?: string
          ip_address?: string | null
          photo_count?: number | null
          processing_time_ms?: number | null
          request_id?: string
          security_checks?: Json | null
          session_id?: string | null
          status?: string
          user_agent?: string | null
          user_id?: string
          validation_errors?: Json | null
        }
        Relationships: []
      }
      photo_upload_rate_limits: {
        Row: {
          created_at: string | null
          daily_quota: number | null
          hourly_quota: number | null
          id: string
          last_upload_date: string | null
          last_upload_hour: string | null
          updated_at: string | null
          uploads_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_quota?: number | null
          hourly_quota?: number | null
          id?: string
          last_upload_date?: string | null
          last_upload_hour?: string | null
          updated_at?: string | null
          uploads_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_quota?: number | null
          hourly_quota?: number | null
          id?: string
          last_upload_date?: string | null
          last_upload_hour?: string | null
          updated_at?: string | null
          uploads_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          suspended: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          suspended?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          suspended?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      seller_bid_decisions: {
        Row: {
          auction_result_id: string | null
          car_id: string
          created_at: string
          decided_at: string
          decision: string
          highest_bid: number | null
          highest_bid_dealer_id: string | null
          id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          auction_result_id?: string | null
          car_id: string
          created_at?: string
          decided_at?: string
          decision: string
          highest_bid?: number | null
          highest_bid_dealer_id?: string | null
          id?: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          auction_result_id?: string | null
          car_id?: string
          created_at?: string
          decided_at?: string
          decision?: string
          highest_bid?: number | null
          highest_bid_dealer_id?: string | null
          id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_bid_decisions_auction_result_id_fkey"
            columns: ["auction_result_id"]
            isOneToOne: false
            referencedRelation: "auction_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_bid_decisions_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_bid_decisions_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          is_verified: boolean
          tax_id: string | null
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean
          tax_id?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          correlation_id: string | null
          created_at: string
          details: Json | null
          error_message: string | null
          id: string
          log_type: string
          message: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          log_type: string
          message: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          log_type?: string
          message?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
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
      vin_valuation_cache: {
        Row: {
          created_at: string
          id: string
          mileage: number
          valuation_data: Json
          vin: string
        }
        Insert: {
          created_at?: string
          id?: string
          mileage: number
          valuation_data: Json
          vin: string
        }
        Update: {
          created_at?: string
          id?: string
          mileage?: number
          valuation_data?: Json
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
          {
            foreignKeyName: "bids_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_public_view"
            referencedColumns: ["id"]
          },
        ]
      }
      cars_public_view: {
        Row: {
          additional_photos: Json | null
          auction_end_time: string | null
          auction_scheduled: boolean | null
          auction_status: string | null
          awaiting_seller_decision: boolean | null
          county: string | null
          created_at: string | null
          current_bid: number | null
          email_notification_sent: boolean | null
          features: Json | null
          finance_amount: number | null
          finance_document_name: string | null
          finance_document_uploaded_at: string | null
          finance_document_url: string | null
          form_metadata: Json | null
          fuel_type: string | null
          has_full_registration_document: boolean | null
          has_outstanding_finance: boolean | null
          has_service_history: boolean | null
          id: string | null
          images: string[] | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_manually_controlled: boolean | null
          is_registered_in_poland: boolean | null
          is_selling_on_behalf: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          postcode: string | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number | null
          rim_photos: Json | null
          seat_material: string | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          street_address: string | null
          title: string | null
          town: string | null
          transmission: string | null
          updated_at: string | null
          valuation_data: Json | null
          vin: string | null
          year: number | null
        }
        Insert: {
          additional_photos?: Json | null
          auction_end_time?: string | null
          auction_scheduled?: boolean | null
          auction_status?: string | null
          awaiting_seller_decision?: boolean | null
          county?: never
          created_at?: string | null
          current_bid?: number | null
          email_notification_sent?: boolean | null
          features?: Json | null
          finance_amount?: number | null
          finance_document_name?: string | null
          finance_document_uploaded_at?: string | null
          finance_document_url?: string | null
          form_metadata?: Json | null
          fuel_type?: string | null
          has_full_registration_document?: boolean | null
          has_outstanding_finance?: boolean | null
          has_service_history?: boolean | null
          id?: string | null
          images?: string[] | null
          is_auction?: boolean | null
          is_damaged?: boolean | null
          is_manually_controlled?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          last_saved?: string | null
          make?: string | null
          mileage?: number | null
          minimum_bid_increment?: number | null
          mobile_number?: never
          model?: string | null
          number_of_keys?: number | null
          postcode?: never
          registration_number?: string | null
          required_photos?: Json | null
          reserve_price?: number | null
          rim_photos?: Json | null
          seat_material?: string | null
          seller_id?: string | null
          seller_name?: never
          seller_notes?: string | null
          service_history_type?: string | null
          status?: string | null
          street_address?: never
          title?: string | null
          town?: never
          transmission?: string | null
          updated_at?: string | null
          valuation_data?: Json | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          additional_photos?: Json | null
          auction_end_time?: string | null
          auction_scheduled?: boolean | null
          auction_status?: string | null
          awaiting_seller_decision?: boolean | null
          county?: never
          created_at?: string | null
          current_bid?: number | null
          email_notification_sent?: boolean | null
          features?: Json | null
          finance_amount?: number | null
          finance_document_name?: string | null
          finance_document_uploaded_at?: string | null
          finance_document_url?: string | null
          form_metadata?: Json | null
          fuel_type?: string | null
          has_full_registration_document?: boolean | null
          has_outstanding_finance?: boolean | null
          has_service_history?: boolean | null
          id?: string | null
          images?: string[] | null
          is_auction?: boolean | null
          is_damaged?: boolean | null
          is_manually_controlled?: boolean | null
          is_registered_in_poland?: boolean | null
          is_selling_on_behalf?: boolean | null
          last_saved?: string | null
          make?: string | null
          mileage?: number | null
          minimum_bid_increment?: number | null
          mobile_number?: never
          model?: string | null
          number_of_keys?: number | null
          postcode?: never
          registration_number?: string | null
          required_photos?: Json | null
          reserve_price?: number | null
          rim_photos?: Json | null
          seat_material?: string | null
          seller_id?: string | null
          seller_name?: never
          seller_notes?: string | null
          service_history_type?: string | null
          status?: string | null
          street_address?: never
          title?: string | null
          town?: never
          transmission?: string | null
          updated_at?: string | null
          valuation_data?: Json | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cars_seller"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cleanup_monitoring_dashboard: {
        Row: {
          cars_history_ready_to_clean: number | null
          cars_ready_to_clean: number | null
          cleanup_urgency: string | null
          current_audit_logs: number | null
          current_cars_history: number | null
          current_system_logs: number | null
          expired_tokens_to_clean: number | null
          health_status: string | null
          manual_valuations_ready_to_clean: number | null
          monthly_failed_runs: number | null
          monthly_is_active: boolean | null
          monthly_job_name: string | null
          monthly_last_run_duration: unknown
          monthly_last_run_ended: string | null
          monthly_last_run_started: string | null
          monthly_last_run_status: string | null
          monthly_schedule: string | null
          monthly_successful_runs: number | null
          monthly_total_runs: number | null
          old_notifications_to_clean: number | null
          system_logs_ready_to_clean: number | null
          vin_cache_ready_to_clean: number | null
          weekly_failed_runs: number | null
          weekly_is_active: boolean | null
          weekly_job_name: string | null
          weekly_last_run_duration: unknown
          weekly_last_run_ended: string | null
          weekly_last_run_started: string | null
          weekly_last_run_status: string | null
          weekly_schedule: string | null
          weekly_successful_runs: number | null
          weekly_total_runs: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_listing: {
        Args: {
          p_listing_id: string
          p_reserve_price?: number
          p_user_id: string
        }
        Returns: Json
      }
      admin_delete_car_file: {
        Args: { p_file_id: string; p_table_name: string }
        Returns: undefined
      }
      admin_end_auction: {
        Args: { p_admin_id: string; p_car_id: string; p_sold?: boolean }
        Returns: Json
      }
      admin_end_auction_immediately: {
        Args: { p_car_id: string }
        Returns: Json
      }
      admin_get_active_auctions: {
        Args: never
        Returns: {
          ac_working: boolean | null
          accident_history: string | null
          additional_photos: Json | null
          auction_end_time: string | null
          auction_scheduled: boolean
          auction_status: string | null
          awaiting_seller_decision: boolean
          brakes_noisy: boolean | null
          contact_email: string
          county: string | null
          created_at: string
          current_bid: number | null
          electrical_faults: boolean | null
          email_notification_sent: boolean
          engine_capacity: string | null
          engine_faults: boolean | null
          engine_smokes: boolean | null
          features: Json | null
          finance_amount: number | null
          finance_document_name: string | null
          finance_document_uploaded_at: string | null
          finance_document_url: string | null
          first_registration_date: string | null
          form_metadata: Json | null
          fuel_type: string | null
          gearbox_faults: boolean | null
          has_dents: boolean | null
          has_full_registration_document: boolean | null
          has_interior_stains: boolean | null
          has_mileage_discrepancy: boolean | null
          has_outstanding_finance: boolean | null
          has_rust: boolean | null
          has_scratches: boolean | null
          has_service_history: boolean | null
          horsepower: number | null
          id: string
          images: string[] | null
          import_year: number | null
          is_accident_record_abroad: boolean | null
          is_accident_record_poland: boolean | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_damaged_record_abroad: boolean | null
          is_damaged_record_poland: boolean | null
          is_manually_controlled: boolean | null
          is_polish_origin: boolean | null
          is_recorded_stolen: boolean | null
          is_registered_in_poland: boolean | null
          is_selling_on_behalf: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          owners_count_poland: number | null
          postcode: string | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number
          rim_photos: Json | null
          runs_smoothly: boolean | null
          seat_material: string | null
          seller_acceptable_price: number | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          street_address: string | null
          suspension_noisy: boolean | null
          technical_inspection_valid_until: string | null
          tires_legal_depth: boolean | null
          title: string | null
          town: string | null
          transmission: string | null
          updated_at: string
          valuation_data: Json | null
          vin: string | null
          warning_lights_on: boolean | null
          windows_working: boolean | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "cars"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_get_all_dealers: {
        Args: never
        Returns: {
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
        }[]
      }
      admin_get_auction_listings: {
        Args: { p_show_all?: boolean; p_status?: string }
        Returns: {
          ac_working: boolean | null
          accident_history: string | null
          additional_photos: Json | null
          auction_end_time: string | null
          auction_scheduled: boolean
          auction_status: string | null
          awaiting_seller_decision: boolean
          brakes_noisy: boolean | null
          contact_email: string
          county: string | null
          created_at: string
          current_bid: number | null
          electrical_faults: boolean | null
          email_notification_sent: boolean
          engine_capacity: string | null
          engine_faults: boolean | null
          engine_smokes: boolean | null
          features: Json | null
          finance_amount: number | null
          finance_document_name: string | null
          finance_document_uploaded_at: string | null
          finance_document_url: string | null
          first_registration_date: string | null
          form_metadata: Json | null
          fuel_type: string | null
          gearbox_faults: boolean | null
          has_dents: boolean | null
          has_full_registration_document: boolean | null
          has_interior_stains: boolean | null
          has_mileage_discrepancy: boolean | null
          has_outstanding_finance: boolean | null
          has_rust: boolean | null
          has_scratches: boolean | null
          has_service_history: boolean | null
          horsepower: number | null
          id: string
          images: string[] | null
          import_year: number | null
          is_accident_record_abroad: boolean | null
          is_accident_record_poland: boolean | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_damaged_record_abroad: boolean | null
          is_damaged_record_poland: boolean | null
          is_manually_controlled: boolean | null
          is_polish_origin: boolean | null
          is_recorded_stolen: boolean | null
          is_registered_in_poland: boolean | null
          is_selling_on_behalf: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          owners_count_poland: number | null
          postcode: string | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number
          rim_photos: Json | null
          runs_smoothly: boolean | null
          seat_material: string | null
          seller_acceptable_price: number | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          street_address: string | null
          suspension_noisy: boolean | null
          technical_inspection_valid_until: string | null
          tires_legal_depth: boolean | null
          title: string | null
          town: string | null
          transmission: string | null
          updated_at: string
          valuation_data: Json | null
          vin: string | null
          warning_lights_on: boolean | null
          windows_working: boolean | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "cars"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_get_car_files: {
        Args: { p_car_id: string }
        Returns: {
          car_id: string
          category: string
          created_at: string
          display_order: number
          file_path: string
          file_type: string
          id: string
          upload_status: string
        }[]
      }
      admin_get_manual_valuations: {
        Args: { p_status?: string }
        Returns: Json
      }
      admin_prepare_manual_valuation_transfer: {
        Args: { p_valuation_id: string }
        Returns: Json
      }
      admin_reorder_car_files: { Args: { p_files: Json }; Returns: undefined }
      admin_transfer_manual_valuation_to_cars: {
        Args: { p_reserve_price: number; p_valuation_id: string }
        Returns: Json
      }
      admin_transfer_manual_valuation_to_cars_enhanced: {
        Args: { p_manual_valuation_id: string; p_reserve_price?: number }
        Returns: Json
      }
      admin_update_manual_valuation: {
        Args: { p_valuation_data: Json; p_valuation_id: string }
        Returns: Json
      }
      admin_upload_car_file: {
        Args: {
          p_car_id: string
          p_category: string
          p_display_order: number
          p_file_path: string
          p_file_type: string
          p_seller_id: string
        }
        Returns: string
      }
      approve_listing: {
        Args: { p_admin_id: string; p_listing_id: string; p_notes?: string }
        Returns: Json
      }
      associate_temp_uploads_with_car: {
        Args: { p_car_id: string }
        Returns: number
      }
      associate_uploads_with_car: {
        Args: { p_car_id: string; p_uploads: Json }
        Returns: number
      }
      authenticate_dealer: {
        Args: { p_email: string; p_password: string }
        Returns: Json
      }
      calculate_reserve_price: {
        Args: { p_base_price: number }
        Returns: number
      }
      calculate_reserve_price_from_min_med: {
        Args: { p_price_med: number; p_price_min: number }
        Returns: number
      }
      can_perform_action: {
        Args: { p_action: string; p_entity_id: string; p_entity_type: string }
        Returns: boolean
      }
      check_auction_system_health: { Args: never; Returns: Json }
      check_business_registry_exists: {
        Args: { registry_number: string }
        Returns: Json
      }
      check_dealer_bid_rate_limit: {
        Args: { p_dealer_id: string }
        Returns: Json
      }
      check_email_exists: { Args: { email_to_check: string }; Returns: Json }
      check_email_exists_for_dealer_role: {
        Args: { p_email: string }
        Returns: Json
      }
      check_is_admin: { Args: never; Returns: boolean }
      check_seller_exists: { Args: { p_user_id: string }; Returns: Json }
      check_tax_id_exists: { Args: { tax_id: string }; Returns: Json }
      check_upload_rate_limit: {
        Args: { p_upload_count?: number; p_user_id: string }
        Returns: Json
      }
      check_vin_reservation: {
        Args: { p_user_id: string; p_vin: string }
        Returns: Json
      }
      cleanup_cars_history_backlog: { Args: never; Returns: Json }
      cleanup_cars_history_daily: { Args: never; Returns: Json }
      cleanup_expired_reset_tokens: { Args: never; Returns: undefined }
      cleanup_expired_vin_reservations: { Args: never; Returns: number }
      cleanup_expired_wishlists: { Args: never; Returns: number }
      cleanup_logs_manual: {
        Args: { batch_size?: number; max_rows_to_delete?: number }
        Returns: Json
      }
      cleanup_old_logs: { Args: never; Returns: Json }
      cleanup_old_vehicle_data: { Args: { dry_run?: boolean }; Returns: Json }
      cleanup_vin_valuation_cache: { Args: never; Returns: undefined }
      close_ended_auctions: { Args: never; Returns: Json }
      create_admin_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_title: string
          p_type: string
        }
        Returns: string
      }
      create_admin_user: {
        Args: { p_full_name?: string; p_user_id: string }
        Returns: boolean
      }
      create_car_listing: {
        Args: { p_car_data: Json; p_user_id?: string }
        Returns: Json
      }
      create_dealer_with_profile: {
        Args: {
          p_address: string
          p_business_registry_number: string
          p_company_name: string
          p_email: string
          p_password: string
          p_phone_number?: string
          p_supervisor_name: string
          p_tax_id: string
        }
        Returns: Json
      }
      create_seller_if_not_exists: {
        Args: { p_user_id: string }
        Returns: Json
      }
      create_simple_car_listing:
        | { Args: { p_car_data: Json }; Returns: Json }
        | { Args: { p_car_data: Json; p_user_id?: string }; Returns: Json }
      create_simple_manual_valuation: {
        Args: { user_id_param: string; valuation_data: Json }
        Returns: Json
      }
      create_vin_reservation: {
        Args: {
          p_duration_minutes?: number
          p_user_id: string
          p_valuation_data?: Json
          p_vin: string
        }
        Returns: Json
      }
      debug_auction_schedules_access: { Args: never; Returns: Json }
      debug_auth_context: { Args: never; Returns: Json }
      debug_auth_user_id: { Args: never; Returns: string }
      debug_dealer_access: {
        Args: { p_user_id: string }
        Returns: {
          error_message: string
          has_access: boolean
          record_exists: boolean
        }[]
      }
      detect_suspicious_stats_access: { Args: never; Returns: Json }
      ensure_seller_registration:
        | { Args: never; Returns: Json }
        | { Args: { p_user_id?: string }; Returns: Json }
      extend_auction_time: {
        Args: {
          p_car_id: string
          p_extension_reason?: string
          p_hours_to_add: number
        }
        Returns: Json
      }
      fetch_car_details: { Args: { p_car_id: string }; Returns: Json }
      fetch_seller_auction_results: {
        Args: { p_seller_id?: string }
        Returns: {
          admin_review_status: string | null
          auction_id: string | null
          bid_count: number | null
          bidding_activity_timeline: Json | null
          car_id: string | null
          created_at: string | null
          final_price: number | null
          highest_bid_dealer_id: string | null
          id: string
          proxy_final_price: number | null
          sale_status: string | null
          seller_decision: string | null
          total_bids: number | null
          unique_bidders: number | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "auction_results"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      fetch_seller_auction_results_complete: {
        Args: { p_seller_id: string }
        Returns: {
          auction_end_time: string
          car_id: string
          created_at: string
          final_price: number
          id: string
          make: string
          model: string
          sale_status: string
          title: string
          total_bids: number
          unique_bidders: number
          year: number
        }[]
      }
      fetch_seller_performance: {
        Args: { p_seller_id?: string }
        Returns: Json
      }
      get_activity_logs: {
        Args: {
          p_action_filter?: string
          p_date_from?: string
          p_date_to?: string
        }
        Returns: {
          action: Database["public"]["Enums"]["audit_log_type"]
          created_at: string
          details: Json
          entity_id: string
          entity_type: string
          id: string
          user_full_name: string
          user_id: string
        }[]
      }
      get_admin_notifications: {
        Args: never
        Returns: {
          action_url: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string
          related_entity_type: string
          title: string
          type: string
          user_id: string
        }[]
      }
      get_auction_activity_metrics: {
        Args: { p_car_id: string }
        Returns: Json
      }
      get_auction_activity_stats: {
        Args: { p_car_id?: string }
        Returns: {
          car_id: string
          highest_bid: number
          lowest_bid: number
          total_bids: number
          unique_bidders: number
        }[]
      }
      get_auction_activity_stats_secure: {
        Args: { p_car_id?: string }
        Returns: {
          car_id: string
          highest_bid: number
          lowest_bid: number
          total_bids: number
          unique_bidders: number
        }[]
      }
      get_auction_results_for_seller: {
        Args: { p_seller_id: string }
        Returns: {
          admin_review_status: string | null
          auction_id: string | null
          bid_count: number | null
          bidding_activity_timeline: Json | null
          car_id: string | null
          created_at: string | null
          final_price: number | null
          highest_bid_dealer_id: string | null
          id: string
          proxy_final_price: number | null
          sale_status: string | null
          seller_decision: string | null
          total_bids: number | null
          unique_bidders: number | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "auction_results"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_auction_timing_status: {
        Args: {
          schedule_end_time: string
          schedule_start_time: string
          schedule_status: string
        }
        Returns: string
      }
      get_bid_recommendations: {
        Args: { p_car_id: string; p_dealer_id: string }
        Returns: Json
      }
      get_bid_status: {
        Args: { p_car_id: string; p_dealer_id: string }
        Returns: Json
      }
      get_car_details: {
        Args: { p_car_id: string; p_user_id: string }
        Returns: Json
      }
      get_car_details_for_ownership: {
        Args: { p_car_id: string; p_user_id: string }
        Returns: {
          car_id: string
          seller_id: string
        }[]
      }
      get_car_images_for_dealers: {
        Args: { p_car_ids: string[] }
        Returns: Json
      }
      get_car_ownership_history: {
        Args: { p_car_id: string }
        Returns: {
          change_time: string
          change_type: string
          changed_by: string
          is_draft: boolean
          new_status: string
          previous_status: string
        }[]
      }
      get_car_summary_for_notifications: {
        Args: { p_car_id: string }
        Returns: {
          auction_end_time: string
          make: string
          model: string
          seller_id: string
          title: string
          year: number
        }[]
      }
      get_cars_ready_for_auction: {
        Args: { p_limit?: number; p_offset?: number; p_search_term?: string }
        Returns: {
          cars_data: Json
          total_count: number
        }[]
      }
      get_cars_with_seller_info: {
        Args: never
        Returns: {
          seller_email: string
          seller_id: string
        }[]
      }
      get_cleanup_job_status: {
        Args: never
        Returns: {
          avg_duration_seconds: number
          failed_runs: number
          is_active: boolean
          job_name: string
          last_run_duration: unknown
          last_run_status: string
          last_run_time: string
          next_scheduled_run: string
          rows_deleted_last_run: number
          schedule: string
          successful_runs: number
          total_runs: number
        }[]
      }
      get_correct_auction_status: {
        Args: {
          p_current_status?: Database["public"]["Enums"]["auction_schedule_status"]
          p_end_time: string
          p_start_time: string
        }
        Returns: Database["public"]["Enums"]["auction_schedule_status"]
      }
      get_dealer_bidding_car_ids: {
        Args: { p_dealer_user_id: string }
        Returns: {
          car_id: string
        }[]
      }
      get_dealer_by_user_id:
        | { Args: { p_user_id: string }; Returns: Json }
        | {
            Args: { user_id: number }
            Returns: {
              dealer_id: number
              dealer_name: string
            }[]
          }
      get_dealer_email_info: {
        Args: never
        Returns: {
          dealer_email: string
          dealer_id: string
          user_id: string
        }[]
      }
      get_dealer_id_by_user_id: { Args: { p_user_id: string }; Returns: string }
      get_dealer_profile_id: { Args: never; Returns: string }
      get_dealer_profile_safe: { Args: { p_user_id?: string }; Returns: Json }
      get_dealer_user_id: { Args: { p_dealer_id: string }; Returns: string }
      get_email_notification_counts: {
        Args: { p_car_ids: string[] }
        Returns: {
          car_id: string
          send_count: number
          type: string
        }[]
      }
      get_form_tracking_logs: {
        Args: never
        Returns: {
          action: Database["public"]["Enums"]["audit_log_type"]
          created_at: string
          details: Json
          entity_id: string
          entity_type: string
          id: string
          user_email: string
          user_full_name: string
          user_id: string
        }[]
      }
      get_live_auction_schedules: {
        Args: never
        Returns: {
          car_id: string
          end_time: string
          is_manually_controlled: boolean
          start_time: string
          status: string
        }[]
      }
      get_manual_valuations_for_seller: {
        Args: { p_user_id: string }
        Returns: {
          county: string
          created_at: string
          features: Json
          finance_amount: number
          fuel_type: string
          is_damaged: boolean
          is_registered_in_poland: boolean
          make: string
          manual_valuation_id: string
          mileage: number
          mobile_number: string
          model: string
          name: string
          number_of_keys: number
          postcode: string
          seat_material: string
          seller_notes: string
          service_history_type: string
          status: string
          street_address: string
          town: string
          transmission: string
          updated_at: string
          user_id: string
          valuation_result: Json
          vin: string
          year: number
        }[]
      }
      get_profile: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          suspended: boolean
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_seller_auction_cars: {
        Args: { p_seller_id: string }
        Returns: {
          ac_working: boolean | null
          accident_history: string | null
          additional_photos: Json | null
          auction_end_time: string | null
          auction_scheduled: boolean
          auction_status: string | null
          awaiting_seller_decision: boolean
          brakes_noisy: boolean | null
          contact_email: string
          county: string | null
          created_at: string
          current_bid: number | null
          electrical_faults: boolean | null
          email_notification_sent: boolean
          engine_capacity: string | null
          engine_faults: boolean | null
          engine_smokes: boolean | null
          features: Json | null
          finance_amount: number | null
          finance_document_name: string | null
          finance_document_uploaded_at: string | null
          finance_document_url: string | null
          first_registration_date: string | null
          form_metadata: Json | null
          fuel_type: string | null
          gearbox_faults: boolean | null
          has_dents: boolean | null
          has_full_registration_document: boolean | null
          has_interior_stains: boolean | null
          has_mileage_discrepancy: boolean | null
          has_outstanding_finance: boolean | null
          has_rust: boolean | null
          has_scratches: boolean | null
          has_service_history: boolean | null
          horsepower: number | null
          id: string
          images: string[] | null
          import_year: number | null
          is_accident_record_abroad: boolean | null
          is_accident_record_poland: boolean | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_damaged_record_abroad: boolean | null
          is_damaged_record_poland: boolean | null
          is_manually_controlled: boolean | null
          is_polish_origin: boolean | null
          is_recorded_stolen: boolean | null
          is_registered_in_poland: boolean | null
          is_selling_on_behalf: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          owners_count_poland: number | null
          postcode: string | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number
          rim_photos: Json | null
          runs_smoothly: boolean | null
          seat_material: string | null
          seller_acceptable_price: number | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          street_address: string | null
          suspension_noisy: boolean | null
          technical_inspection_valid_until: string | null
          tires_legal_depth: boolean | null
          title: string | null
          town: string | null
          transmission: string | null
          updated_at: string
          valuation_data: Json | null
          vin: string | null
          warning_lights_on: boolean | null
          windows_working: boolean | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "cars"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_seller_listings: {
        Args: { p_seller_id: string }
        Returns: {
          ac_working: boolean | null
          accident_history: string | null
          additional_photos: Json | null
          auction_end_time: string | null
          auction_scheduled: boolean
          auction_status: string | null
          awaiting_seller_decision: boolean
          brakes_noisy: boolean | null
          contact_email: string
          county: string | null
          created_at: string
          current_bid: number | null
          electrical_faults: boolean | null
          email_notification_sent: boolean
          engine_capacity: string | null
          engine_faults: boolean | null
          engine_smokes: boolean | null
          features: Json | null
          finance_amount: number | null
          finance_document_name: string | null
          finance_document_uploaded_at: string | null
          finance_document_url: string | null
          first_registration_date: string | null
          form_metadata: Json | null
          fuel_type: string | null
          gearbox_faults: boolean | null
          has_dents: boolean | null
          has_full_registration_document: boolean | null
          has_interior_stains: boolean | null
          has_mileage_discrepancy: boolean | null
          has_outstanding_finance: boolean | null
          has_rust: boolean | null
          has_scratches: boolean | null
          has_service_history: boolean | null
          horsepower: number | null
          id: string
          images: string[] | null
          import_year: number | null
          is_accident_record_abroad: boolean | null
          is_accident_record_poland: boolean | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_damaged_record_abroad: boolean | null
          is_damaged_record_poland: boolean | null
          is_manually_controlled: boolean | null
          is_polish_origin: boolean | null
          is_recorded_stolen: boolean | null
          is_registered_in_poland: boolean | null
          is_selling_on_behalf: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          owners_count_poland: number | null
          postcode: string | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number
          rim_photos: Json | null
          runs_smoothly: boolean | null
          seat_material: string | null
          seller_acceptable_price: number | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          street_address: string | null
          suspension_noisy: boolean | null
          technical_inspection_valid_until: string | null
          tires_legal_depth: boolean | null
          title: string | null
          town: string | null
          transmission: string | null
          updated_at: string
          valuation_data: Json | null
          vin: string | null
          warning_lights_on: boolean | null
          windows_working: boolean | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "cars"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_seller_performance_metrics: {
        Args: { p_seller_id: string }
        Returns: Json
      }
      get_seller_profile: {
        Args: { p_user_id: string }
        Returns: {
          address: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          is_verified: boolean
          tax_id: string | null
          updated_at: string
          user_id: string
          verification_status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "sellers"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_sellers_with_emails: {
        Args: never
        Returns: {
          active_listings: number
          address: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_verified: boolean
          total_listings: number
          user_id: string
          verification_status: string
        }[]
      }
      get_session_photos: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: {
          category: string
          file_path: string
          id: string
        }[]
      }
      get_table_columns: {
        Args: { p_table_name: string }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: string
        }[]
      }
      get_user_and_dealer_by_email: {
        Args: { p_email: string }
        Returns: {
          address: string
          business_registry_number: string
          dealer_id: string
          dealership_name: string
          supervisor_name: string
          tax_id: string
          user_email: string
          user_id: string
        }[]
      }
      get_user_id_by_email: { Args: { p_email: string }; Returns: Json }
      get_user_profile_for_listing: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_vin_valuation_cache: {
        Args: { p_log_id?: string; p_mileage: number; p_vin: string }
        Returns: Json
      }
      has_paid_for_vehicle: {
        Args: { _car_id: string; _dealer_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_from_jwt: { Args: never; Returns: boolean }
      is_admin_user: { Args: { user_id?: string }; Returns: boolean }
      is_dealer: { Args: never; Returns: boolean }
      is_seller: { Args: never; Returns: boolean }
      is_service_role: { Args: never; Returns: boolean }
      is_verified_seller: { Args: { p_user_id?: string }; Returns: boolean }
      is_vin_available: { Args: { p_vin: string }; Returns: boolean }
      is_vin_available_for_user: {
        Args: { p_user_id: string; p_vin: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: Database["public"]["Enums"]["audit_log_type"]
          p_admin_id: string
          p_details?: Json
          p_entity_id: string
          p_entity_type: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
      log_form_tracking_event: {
        Args: {
          p_event_type: string
          p_form_type: string
          p_metadata?: Json
          p_source?: string
        }
        Returns: undefined
      }
      manual_auction_status_update: { Args: never; Returns: Json }
      mark_all_notifications_read: { Args: never; Returns: undefined }
      mark_car_email_notification_sent: {
        Args: { p_car_id: string }
        Returns: boolean
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      perform_admin_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id: string
          p_entity_type: string
        }
        Returns: boolean
      }
      place_bid: {
        Args: { p_amount: number; p_car_id: string; p_dealer_id: string }
        Returns: Json
      }
      process_auction_end:
        | { Args: never; Returns: Json }
        | { Args: { p_car_id: string }; Returns: Json }
      process_auctions_for_seller_decisions: { Args: never; Returns: number }
      process_ended_auctions_securely: { Args: never; Returns: Json }
      process_missed_auctions: { Args: never; Returns: Json }
      process_pending_proxy_bids: { Args: never; Returns: Json }
      process_seller_auction_end: { Args: never; Returns: Json }
      process_stuck_auction: { Args: { p_car_id: string }; Returns: Json }
      process_stuck_auction_safe: { Args: { p_car_id: string }; Returns: Json }
      publish_car_listing: { Args: { p_car_id: string }; Returns: Json }
      record_system_health_metric: {
        Args: {
          p_metric_name: string
          p_metric_value: number
          p_threshold_value?: number
        }
        Returns: undefined
      }
      recover_missed_auctions: { Args: never; Returns: Json }
      register_seller: { Args: { p_user_id: string }; Returns: boolean }
      reject_dealer: {
        Args: {
          p_admin_id: string
          p_dealer_id: string
          p_notes?: string
          p_rejection_reason: string
        }
        Returns: Json
      }
      reject_listing: {
        Args: {
          p_admin_id: string
          p_listing_id: string
          p_notes?: string
          p_rejection_reason: string
        }
        Returns: Json
      }
      reset_upload_rate_limits: { Args: { p_user_id?: string }; Returns: Json }
      set_temp_uploads_data: { Args: { p_uploads: Json }; Returns: boolean }
      store_vin_valuation_cache: {
        Args: { p_mileage: number; p_valuation_data: Json; p_vin: string }
        Returns: undefined
      }
      submit_manual_valuation_form:
        | { Args: { p_form_data: Json }; Returns: string }
        | {
            Args: { p_form_data: Json; p_manual_valuation_id: string }
            Returns: Json
          }
      sync_auction_results_with_seller_decisions: {
        Args: never
        Returns: undefined
      }
      test_admin_policies: { Args: never; Returns: Json }
      test_cleanup_small: { Args: never; Returns: Json }
      test_live_auction_schedules_no_auth: {
        Args: never
        Returns: {
          car_id: string
          end_time: string
          is_manually_controlled: boolean
          start_time: string
          status: string
        }[]
      }
      transition_car_status: {
        Args: { p_car_id: string; p_is_draft?: boolean; p_new_status: string }
        Returns: Json
      }
      transition_ended_auctions: { Args: never; Returns: number }
      update_auction_status: { Args: never; Returns: number }
      update_dealer_profile: {
        Args: {
          p_address: string
          p_dealership_name: string
          p_phone_number?: string
          p_supervisor_name: string
          p_user_id: string
        }
        Returns: Json
      }
      update_system_health: {
        Args: {
          p_component_name: string
          p_details?: Json
          p_status: Database["public"]["Enums"]["system_component_health"]
        }
        Returns: undefined
      }
      update_won_vehicle_payment_status: { Args: never; Returns: number }
      upload_car_photo: {
        Args: {
          p_car_id: string
          p_category: string
          p_file_path: string
          p_file_type?: string
        }
        Returns: Json
      }
      upload_manual_valuation_photo: {
        Args: {
          p_category: string
          p_display_order?: number
          p_file_path: string
          p_file_type: string
          p_manual_valuation_id: string
        }
        Returns: Json
      }
      upsert_car_listing: {
        Args: { car_data: Json; is_draft?: boolean }
        Returns: Json
      }
      validate_and_normalize_phone: {
        Args: { phone_number: string }
        Returns: Json
      }
      validate_car_photos: { Args: { p_car_id: string }; Returns: Json }
      validate_image_category: {
        Args: { category_value: string }
        Returns: boolean
      }
      validate_polish_nip: { Args: { nip_number: string }; Returns: Json }
      validate_seller_decision_consistency: {
        Args: never
        Returns: {
          auction_result_decision: string
          car_id: string
          is_consistent: boolean
          seller_bid_decision: string
        }[]
      }
      validate_vin: { Args: { p_vin: string }; Returns: boolean }
      verify_auction_status_consistency: { Args: never; Returns: Json }
      verify_dealer: {
        Args: { p_admin_id: string; p_dealer_id: string; p_notes?: string }
        Returns: Json
      }
      verify_manual_valuation_ownership: {
        Args: { p_manual_valuation_id: string; p_user_id: string }
        Returns: Json
      }
      verify_password: {
        Args: { plain_text: string; uuid: string }
        Returns: boolean
      }
      withdraw_car_listing: { Args: { p_car_id: string }; Returns: Json }
    }
    Enums: {
      announcement_target: "all" | "dealers" | "sellers" | "admins"
      announcement_type:
        | "system"
        | "maintenance"
        | "feature"
        | "promotion"
        | "policy"
      app_role: "admin" | "dealer" | "seller"
      auction_schedule_status:
        | "scheduled"
        | "running"
        | "completed"
        | "cancelled"
        | "active"
      auction_status:
        | "draft"
        | "scheduled"
        | "active"
        | "ended"
        | "cancelled"
        | "sold"
      audit_log_type:
        | "login"
        | "logout"
        | "create"
        | "update"
        | "delete"
        | "suspend"
        | "reinstate"
        | "verify"
        | "reject"
        | "approve"
        | "process_auctions"
        | "auction_closed"
        | "auto_proxy_bid"
        | "start_auction"
        | "auction_close_failed"
        | "auction_close_system_error"
        | "system_reset_failed"
        | "recovery_failed"
        | "manual_retry"
        | "auction_recovery"
        | "system_health_check"
        | "system_alert"
        | "extend_auction"
      car_transmission_type: "automatic" | "manual"
      damage_severity: "minor" | "moderate" | "severe"
      dispute_status: "open" | "investigating" | "resolved" | "closed"
      dispute_type:
        | "payment"
        | "vehicle_condition"
        | "listing_accuracy"
        | "auction_process"
        | "other"
      system_component_health: "healthy" | "degraded" | "failing" | "unknown"
      transmission_type: "manual" | "automatic"
      user_role: "dealer" | "seller" | "admin"
      verification_status: "pending" | "approved" | "rejected"
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
      announcement_target: ["all", "dealers", "sellers", "admins"],
      announcement_type: [
        "system",
        "maintenance",
        "feature",
        "promotion",
        "policy",
      ],
      app_role: ["admin", "dealer", "seller"],
      auction_schedule_status: [
        "scheduled",
        "running",
        "completed",
        "cancelled",
        "active",
      ],
      auction_status: [
        "draft",
        "scheduled",
        "active",
        "ended",
        "cancelled",
        "sold",
      ],
      audit_log_type: [
        "login",
        "logout",
        "create",
        "update",
        "delete",
        "suspend",
        "reinstate",
        "verify",
        "reject",
        "approve",
        "process_auctions",
        "auction_closed",
        "auto_proxy_bid",
        "start_auction",
        "auction_close_failed",
        "auction_close_system_error",
        "system_reset_failed",
        "recovery_failed",
        "manual_retry",
        "auction_recovery",
        "system_health_check",
        "system_alert",
        "extend_auction",
      ],
      car_transmission_type: ["automatic", "manual"],
      damage_severity: ["minor", "moderate", "severe"],
      dispute_status: ["open", "investigating", "resolved", "closed"],
      dispute_type: [
        "payment",
        "vehicle_condition",
        "listing_accuracy",
        "auction_process",
        "other",
      ],
      system_component_health: ["healthy", "degraded", "failing", "unknown"],
      transmission_type: ["manual", "automatic"],
      user_role: ["dealer", "seller", "admin"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
