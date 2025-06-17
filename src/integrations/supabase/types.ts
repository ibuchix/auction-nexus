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
          sale_status: string | null
          seller_decision: string | null
          total_bids: number | null
          unique_bidders: number | null
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
          sale_status?: string | null
          seller_decision?: string | null
          total_bids?: number | null
          unique_bidders?: number | null
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
          sale_status?: string | null
          seller_decision?: string | null
          total_bids?: number | null
          unique_bidders?: number | null
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
            foreignKeyName: "auction_results_car_id_fkey"
            columns: ["car_id"]
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
      bid_metrics: {
        Row: {
          bid_id: string | null
          created_at: string | null
          id: string
          success: boolean | null
        }
        Insert: {
          bid_id?: string | null
          created_at?: string | null
          id?: string
          success?: boolean | null
        }
        Update: {
          bid_id?: string | null
          created_at?: string | null
          id?: string
          success?: boolean | null
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
          category: string | null
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
          category?: string | null
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
          category?: string | null
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
          address: string | null
          auction_end_time: string | null
          auction_scheduled: boolean
          auction_status: string | null
          awaiting_seller_decision: boolean
          created_at: string
          current_bid: number | null
          features: Json | null
          finance_amount: number | null
          form_metadata: Json | null
          fuel_type: string | null
          has_private_plate: boolean | null
          has_service_history: boolean | null
          id: string
          images: string[] | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_manually_controlled: boolean | null
          is_registered_in_poland: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number
          seat_material: string | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          title: string | null
          transmission: string | null
          updated_at: string
          valuation_data: Json | null
          vin: string | null
          year: number | null
        }
        Insert: {
          additional_photos?: Json | null
          address?: string | null
          auction_end_time?: string | null
          auction_scheduled?: boolean
          auction_status?: string | null
          awaiting_seller_decision?: boolean
          created_at?: string
          current_bid?: number | null
          features?: Json | null
          finance_amount?: number | null
          form_metadata?: Json | null
          fuel_type?: string | null
          has_private_plate?: boolean | null
          has_service_history?: boolean | null
          id?: string
          images?: string[] | null
          is_auction?: boolean | null
          is_damaged?: boolean | null
          is_manually_controlled?: boolean | null
          is_registered_in_poland?: boolean | null
          last_saved?: string | null
          make?: string | null
          mileage?: number | null
          minimum_bid_increment?: number | null
          mobile_number?: string | null
          model?: string | null
          number_of_keys?: number | null
          registration_number?: string | null
          required_photos?: Json | null
          reserve_price?: number
          seat_material?: string | null
          seller_id?: string | null
          seller_name?: string | null
          seller_notes?: string | null
          service_history_type?: string | null
          status?: string | null
          title?: string | null
          transmission?: string | null
          updated_at?: string
          valuation_data?: Json | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          additional_photos?: Json | null
          address?: string | null
          auction_end_time?: string | null
          auction_scheduled?: boolean
          auction_status?: string | null
          awaiting_seller_decision?: boolean
          created_at?: string
          current_bid?: number | null
          features?: Json | null
          finance_amount?: number | null
          form_metadata?: Json | null
          fuel_type?: string | null
          has_private_plate?: boolean | null
          has_service_history?: boolean | null
          id?: string
          images?: string[] | null
          is_auction?: boolean | null
          is_damaged?: boolean | null
          is_manually_controlled?: boolean | null
          is_registered_in_poland?: boolean | null
          last_saved?: string | null
          make?: string | null
          mileage?: number | null
          minimum_bid_increment?: number | null
          mobile_number?: string | null
          model?: string | null
          number_of_keys?: number | null
          registration_number?: string | null
          required_photos?: Json | null
          reserve_price?: number
          seat_material?: string | null
          seller_id?: string | null
          seller_name?: string | null
          seller_notes?: string | null
          service_history_type?: string | null
          status?: string | null
          title?: string | null
          transmission?: string | null
          updated_at?: string
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
        ]
      }
      damage_reports: {
        Row: {
          car_id: string | null
          created_at: string
          description: string
          id: string
          location: string | null
          photo: string | null
          severity: Database["public"]["Enums"]["damage_severity"] | null
          type: string
          updated_at: string
        }
        Insert: {
          car_id?: string | null
          created_at?: string
          description: string
          id?: string
          location?: string | null
          photo?: string | null
          severity?: Database["public"]["Enums"]["damage_severity"] | null
          type: string
          updated_at?: string
        }
        Update: {
          car_id?: string | null
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          photo?: string | null
          severity?: Database["public"]["Enums"]["damage_severity"] | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_reports_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
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
            foreignKeyName: "disputes_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        ]
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
          gearbox: string | null
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
          status: string | null
          transmission:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          updated_at: string | null
          uploaded_photos: Json | null
          user_id: string | null
          valuation_result: Json | null
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
          gearbox?: string | null
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
          status?: string | null
          transmission?:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          updated_at?: string | null
          uploaded_photos?: Json | null
          user_id?: string | null
          valuation_result?: Json | null
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
          gearbox?: string | null
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
          status?: string | null
          transmission?:
            | Database["public"]["Enums"]["car_transmission_type"]
            | null
          updated_at?: string | null
          uploaded_photos?: Json | null
          user_id?: string | null
          valuation_result?: Json | null
          vin?: string | null
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
      proxy_bids: {
        Row: {
          car_id: string
          created_at: string
          dealer_id: string
          id: string
          last_processed_amount: number | null
          max_bid_amount: number
          updated_at: string
        }
        Insert: {
          car_id: string
          created_at?: string
          dealer_id: string
          id?: string
          last_processed_amount?: number | null
          max_bid_amount: number
          updated_at?: string
        }
        Update: {
          car_id?: string
          created_at?: string
          dealer_id?: string
          id?: string
          last_processed_amount?: number | null
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
            foreignKeyName: "seller_bid_decisions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      seller_performance_metrics: {
        Row: {
          active_listings: number
          average_price: number | null
          average_time_to_sell: unknown | null
          cancelled_listings: number
          created_at: string
          highest_price_sold: number | null
          id: string
          last_listing_date: string | null
          last_sale_date: string | null
          listing_approval_rate: number | null
          reserve_price_met_rate: number | null
          seller_id: string
          sold_listings: number
          total_earnings: number
          total_listings: number
          updated_at: string
        }
        Insert: {
          active_listings?: number
          average_price?: number | null
          average_time_to_sell?: unknown | null
          cancelled_listings?: number
          created_at?: string
          highest_price_sold?: number | null
          id?: string
          last_listing_date?: string | null
          last_sale_date?: string | null
          listing_approval_rate?: number | null
          reserve_price_met_rate?: number | null
          seller_id: string
          sold_listings?: number
          total_earnings?: number
          total_listings?: number
          updated_at?: string
        }
        Update: {
          active_listings?: number
          average_price?: number | null
          average_time_to_sell?: unknown | null
          cancelled_listings?: number
          created_at?: string
          highest_price_sold?: number | null
          id?: string
          last_listing_date?: string | null
          last_sale_date?: string | null
          listing_approval_rate?: number | null
          reserve_price_met_rate?: number | null
          seller_id?: string
          sold_listings?: number
          total_earnings?: number
          total_listings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_performance_metrics_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      service_history: {
        Row: {
          car_id: string | null
          created_at: string
          description: string | null
          document_url: string
          id: string
        }
        Insert: {
          car_id?: string | null
          created_at?: string
          description?: string | null
          document_url: string
          id?: string
        }
        Update: {
          car_id?: string | null
          created_at?: string
          description?: string | null
          document_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_history_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health: {
        Row: {
          component_name: string
          created_at: string
          details: Json | null
          id: string
          last_check_time: string
          status: Database["public"]["Enums"]["system_component_health"]
          updated_at: string
        }
        Insert: {
          component_name: string
          created_at?: string
          details?: Json | null
          id?: string
          last_check_time?: string
          status?: Database["public"]["Enums"]["system_component_health"]
          updated_at?: string
        }
        Update: {
          component_name?: string
          created_at?: string
          details?: Json | null
          id?: string
          last_check_time?: string
          status?: Database["public"]["Enums"]["system_component_health"]
          updated_at?: string
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
        ]
      }
    }
    Functions: {
      activate_listing: {
        Args: {
          p_listing_id: string
          p_user_id: string
          p_reserve_price?: number
        }
        Returns: Json
      }
      admin_end_auction: {
        Args: { p_car_id: string; p_admin_id: string; p_sold?: boolean }
        Returns: Json
      }
      admin_get_active_auctions: {
        Args: Record<PropertyKey, never>
        Returns: {
          additional_photos: Json | null
          address: string | null
          auction_end_time: string | null
          auction_scheduled: boolean
          auction_status: string | null
          awaiting_seller_decision: boolean
          created_at: string
          current_bid: number | null
          features: Json | null
          finance_amount: number | null
          form_metadata: Json | null
          fuel_type: string | null
          has_private_plate: boolean | null
          has_service_history: boolean | null
          id: string
          images: string[] | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_manually_controlled: boolean | null
          is_registered_in_poland: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number
          seat_material: string | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          title: string | null
          transmission: string | null
          updated_at: string
          valuation_data: Json | null
          vin: string | null
          year: number | null
        }[]
      }
      admin_get_all_dealers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          supervisor_name: string
          dealership_name: string
          tax_id: string
          business_registry_number: string
          address: string
          license_number: string
          verification_status: string
          is_verified: boolean
          created_at: string
          updated_at: string
        }[]
      }
      admin_get_auction_listings: {
        Args: { p_show_all?: boolean; p_status?: string }
        Returns: {
          additional_photos: Json | null
          address: string | null
          auction_end_time: string | null
          auction_scheduled: boolean
          auction_status: string | null
          awaiting_seller_decision: boolean
          created_at: string
          current_bid: number | null
          features: Json | null
          finance_amount: number | null
          form_metadata: Json | null
          fuel_type: string | null
          has_private_plate: boolean | null
          has_service_history: boolean | null
          id: string
          images: string[] | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_manually_controlled: boolean | null
          is_registered_in_poland: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number
          seat_material: string | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          title: string | null
          transmission: string | null
          updated_at: string
          valuation_data: Json | null
          vin: string | null
          year: number | null
        }[]
      }
      analyze_bidding_strategy: {
        Args: { p_dealer_id: string }
        Returns: Json
      }
      approve_listing: {
        Args: { p_listing_id: string; p_admin_id: string; p_notes?: string }
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
      calculate_optimal_proxy_bid: {
        Args: { p_car_id: string; p_dealer_id: string; p_max_budget: number }
        Returns: Json
      }
      calculate_reserve_price: {
        Args: { p_base_price: number }
        Returns: number
      }
      calculate_reserve_price_from_min_med: {
        Args: { p_price_min: number; p_price_med: number }
        Returns: number
      }
      can_perform_action: {
        Args: { p_action: string; p_entity_type: string; p_entity_id: string }
        Returns: boolean
      }
      check_auction_system_health: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_business_registry_exists: {
        Args: { registry_number: string }
        Returns: Json
      }
      check_email_exists: {
        Args: { email_to_check: string }
        Returns: Json
      }
      check_seller_exists: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_tax_id_exists: {
        Args: { tax_id: string }
        Returns: Json
      }
      check_vin_reservation: {
        Args: { p_vin: string; p_user_id: string }
        Returns: Json
      }
      cleanup_expired_vin_reservations: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_vin_valuation_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      close_ended_auctions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      complete_scheduled_auctions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_admin_user: {
        Args: { p_user_id: string; p_full_name?: string }
        Returns: boolean
      }
      create_car_listing: {
        Args: { p_car_data: Json; p_user_id?: string }
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
      create_seller_if_not_exists: {
        Args: { p_user_id: string }
        Returns: Json
      }
      create_simple_car_listing: {
        Args: { p_car_data: Json; p_user_id?: string }
        Returns: Json
      }
      create_vin_reservation: {
        Args: {
          p_vin: string
          p_user_id: string
          p_valuation_data?: Json
          p_duration_minutes?: number
        }
        Returns: Json
      }
      debug_auth_context: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      debug_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      debug_dealer_access: {
        Args: { p_user_id: string }
        Returns: {
          has_access: boolean
          record_exists: boolean
          error_message: string
        }[]
      }
      ensure_seller_registration: {
        Args: Record<PropertyKey, never> | { p_user_id?: string }
        Returns: Json
      }
      fetch_car_details: {
        Args: { p_car_id: string }
        Returns: Json
      }
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
          sale_status: string | null
          seller_decision: string | null
          total_bids: number | null
          unique_bidders: number | null
        }[]
      }
      fetch_seller_auction_results_complete: {
        Args: { p_seller_id: string }
        Returns: {
          id: string
          car_id: string
          final_price: number
          total_bids: number
          unique_bidders: number
          sale_status: string
          created_at: string
          title: string
          make: string
          model: string
          year: number
          auction_end_time: string
        }[]
      }
      fetch_seller_performance: {
        Args: { p_seller_id?: string }
        Returns: Json
      }
      get_auction_activity_metrics: {
        Args: { p_car_id: string }
        Returns: Json
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
          sale_status: string | null
          seller_decision: string | null
          total_bids: number | null
          unique_bidders: number | null
        }[]
      }
      get_auction_timing_status: {
        Args: {
          schedule_start_time: string
          schedule_end_time: string
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
      get_car_ownership_history: {
        Args: { p_car_id: string }
        Returns: {
          change_time: string
          change_type: string
          previous_status: string
          new_status: string
          is_draft: boolean
          changed_by: string
        }[]
      }
      get_dealer_bid_exposure: {
        Args: { p_dealer_id: string }
        Returns: Json
      }
      get_dealer_by_user_id: {
        Args: { p_user_id: string } | { user_id: number }
        Returns: {
          dealer_id: number
          dealer_name: string
        }[]
      }
      get_dealer_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_dealer_profile_safe: {
        Args: { p_user_id?: string }
        Returns: Json
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
      }
      get_seller_auction_cars: {
        Args: { p_seller_id: string }
        Returns: {
          additional_photos: Json | null
          address: string | null
          auction_end_time: string | null
          auction_scheduled: boolean
          auction_status: string | null
          awaiting_seller_decision: boolean
          created_at: string
          current_bid: number | null
          features: Json | null
          finance_amount: number | null
          form_metadata: Json | null
          fuel_type: string | null
          has_private_plate: boolean | null
          has_service_history: boolean | null
          id: string
          images: string[] | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_manually_controlled: boolean | null
          is_registered_in_poland: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number
          seat_material: string | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          title: string | null
          transmission: string | null
          updated_at: string
          valuation_data: Json | null
          vin: string | null
          year: number | null
        }[]
      }
      get_seller_listings: {
        Args: { p_seller_id: string }
        Returns: {
          additional_photos: Json | null
          address: string | null
          auction_end_time: string | null
          auction_scheduled: boolean
          auction_status: string | null
          awaiting_seller_decision: boolean
          created_at: string
          current_bid: number | null
          features: Json | null
          finance_amount: number | null
          form_metadata: Json | null
          fuel_type: string | null
          has_private_plate: boolean | null
          has_service_history: boolean | null
          id: string
          images: string[] | null
          is_auction: boolean | null
          is_damaged: boolean | null
          is_manually_controlled: boolean | null
          is_registered_in_poland: boolean | null
          last_saved: string | null
          make: string | null
          mileage: number | null
          minimum_bid_increment: number | null
          mobile_number: string | null
          model: string | null
          number_of_keys: number | null
          registration_number: string | null
          required_photos: Json | null
          reserve_price: number
          seat_material: string | null
          seller_id: string | null
          seller_name: string | null
          seller_notes: string | null
          service_history_type: string | null
          status: string | null
          title: string | null
          transmission: string | null
          updated_at: string
          valuation_data: Json | null
          vin: string | null
          year: number | null
        }[]
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
      }
      get_table_columns: {
        Args: { p_table_name: string }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: string
        }[]
      }
      get_user_id_by_email: {
        Args: { p_email: string }
        Returns: Json
      }
      get_user_profile_for_listing: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_vin_valuation_cache: {
        Args: { p_vin: string; p_mileage: number; p_log_id?: string }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_dealer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_seller: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_verified_seller: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      is_vin_available: {
        Args: { p_vin: string }
        Returns: boolean
      }
      is_vin_available_for_user: {
        Args: { p_vin: string; p_user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_admin_id: string
          p_action: Database["public"]["Enums"]["audit_log_type"]
          p_entity_type: string
          p_entity_id: string
          p_details?: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
      perform_admin_action: {
        Args: {
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_details?: Json
        }
        Returns: boolean
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
      process_pending_proxy_bids: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      publish_car_listing: {
        Args: { p_car_id: string }
        Returns: Json
      }
      register_seller: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      reject_dealer: {
        Args: {
          p_dealer_id: string
          p_admin_id: string
          p_rejection_reason: string
          p_notes?: string
        }
        Returns: Json
      }
      reject_listing: {
        Args: {
          p_listing_id: string
          p_admin_id: string
          p_rejection_reason: string
          p_notes?: string
        }
        Returns: Json
      }
      set_temp_uploads_data: {
        Args: { p_uploads: Json }
        Returns: boolean
      }
      start_scheduled_auctions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      store_vin_valuation_cache: {
        Args: { p_vin: string; p_mileage: number; p_valuation_data: Json }
        Returns: undefined
      }
      transition_car_status: {
        Args: { p_car_id: string; p_new_status: string; p_is_draft?: boolean }
        Returns: Json
      }
      update_auction_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_system_health: {
        Args: {
          p_component_name: string
          p_status: Database["public"]["Enums"]["system_component_health"]
          p_details?: Json
        }
        Returns: undefined
      }
      upsert_car_listing: {
        Args: { car_data: Json; is_draft?: boolean }
        Returns: Json
      }
      validate_and_normalize_phone: {
        Args: { phone_number: string }
        Returns: Json
      }
      validate_polish_nip: {
        Args: { nip_number: string }
        Returns: Json
      }
      validate_vin: {
        Args: { p_vin: string }
        Returns: boolean
      }
      verify_dealer: {
        Args: { p_dealer_id: string; p_admin_id: string; p_notes?: string }
        Returns: Json
      }
      verify_password: {
        Args: { uuid: string; plain_text: string }
        Returns: boolean
      }
      withdraw_car_listing: {
        Args: { p_car_id: string }
        Returns: Json
      }
    }
    Enums: {
      announcement_target: "all" | "dealers" | "sellers" | "admins"
      announcement_type:
        | "system"
        | "maintenance"
        | "feature"
        | "promotion"
        | "policy"
      auction_schedule_status:
        | "scheduled"
        | "running"
        | "completed"
        | "cancelled"
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
    Enums: {
      announcement_target: ["all", "dealers", "sellers", "admins"],
      announcement_type: [
        "system",
        "maintenance",
        "feature",
        "promotion",
        "policy",
      ],
      auction_schedule_status: [
        "scheduled",
        "running",
        "completed",
        "cancelled",
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
