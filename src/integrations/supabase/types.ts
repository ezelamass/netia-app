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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          avatar: string
          created_at: string
          id: string
          last_message_at: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          avatar: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          avatar?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          description: string
          icon: string
          id: string
          requirement: number
          title: string
          xp_reward: number
        }
        Insert: {
          category?: string
          description?: string
          icon?: string
          id: string
          requirement?: number
          title: string
          xp_reward?: number
        }
        Update: {
          category?: string
          description?: string
          icon?: string
          id?: string
          requirement?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          club_id: string | null
          created_at: string
          description: string | null
          end_time: string | null
          event_type: string
          id: string
          is_recurring: boolean | null
          location: string | null
          recurrence_rule: string | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          club_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_announcements: {
        Row: {
          author_id: string
          club_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          priority: string | null
          target_roles: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          club_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          priority?: string | null
          target_roles?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          club_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          priority?: string | null
          target_roles?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_announcements_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          invite_code: string | null
          is_active: boolean
          logo_url: string | null
          max_players: number | null
          name: string
          sport: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invite_code?: string | null
          is_active?: boolean
          logo_url?: string | null
          max_players?: number | null
          name: string
          sport?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invite_code?: string | null
          is_active?: boolean
          logo_url?: string | null
          max_players?: number | null
          name?: string
          sport?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coach_notes: {
        Row: {
          club_id: string
          coach_id: string
          content: string
          created_at: string
          id: string
          player_id: string
        }
        Insert: {
          club_id: string
          coach_id: string
          content: string
          created_at?: string
          id?: string
          player_id: string
        }
        Update: {
          club_id?: string
          coach_id?: string
          content?: string
          created_at?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_notes_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content_md: string | null
          created_at: string | null
          duration_min: number | null
          id: string
          section_id: string
          sort_order: number
          title: string
          video_url: string | null
        }
        Insert: {
          content_md?: string | null
          created_at?: string | null
          duration_min?: number | null
          id?: string
          section_id: string
          sort_order?: number
          title: string
          video_url?: string | null
        }
        Update: {
          content_md?: string | null
          created_at?: string | null
          duration_min?: number | null
          id?: string
          section_id?: string
          sort_order?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_published: boolean | null
          sort_order: number
          target_role: string
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number
          target_role?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number
          target_role?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      course_sections: {
        Row: {
          created_at: string | null
          id: string
          module_id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          created_at: string
          energy_level: number | null
          hydration_liters: number | null
          id: string
          log_date: string
          mood: string | null
          notes: string | null
          pain_level: number | null
          pain_location: string | null
          sleep_hours: number | null
          trained: boolean | null
          training_duration_min: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          hydration_liters?: number | null
          id?: string
          log_date?: string
          mood?: string | null
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          sleep_hours?: number | null
          trained?: boolean | null
          training_duration_min?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          hydration_liters?: number | null
          id?: string
          log_date?: string
          mood?: string | null
          notes?: string | null
          pain_level?: number | null
          pain_location?: string | null
          sleep_hours?: number | null
          trained?: boolean | null
          training_duration_min?: number | null
          user_id?: string
        }
        Relationships: []
      }
      diagnostic_history: {
        Row: {
          axis: string
          detail: string | null
          id: string
          recorded_at: string
          score: number
          session_id: string | null
          user_id: string
        }
        Insert: {
          axis: string
          detail?: string | null
          id?: string
          recorded_at?: string
          score?: number
          session_id?: string | null
          user_id: string
        }
        Update: {
          axis?: string
          detail?: string | null
          id?: string
          recorded_at?: string
          score?: number
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_questions: {
        Row: {
          created_at: string
          id: string
          options: Json | null
          order_index: number
          question_text: string
          question_type: string
          test_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          question_text: string
          question_type?: string
          test_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string
          test_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_responses: {
        Row: {
          created_at: string
          id: string
          question_id: string
          response_value: string | null
          score: number | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          response_value?: string | null
          score?: number | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          response_value?: string | null
          score?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_sessions: {
        Row: {
          axis: string
          completed_at: string | null
          created_at: string
          id: string
          max_score: number | null
          normalized_score: number | null
          notes: string | null
          started_at: string
          test_id: string
          total_score: number | null
          user_id: string
        }
        Insert: {
          axis: string
          completed_at?: string | null
          created_at?: string
          id?: string
          max_score?: number | null
          normalized_score?: number | null
          notes?: string | null
          started_at?: string
          test_id: string
          total_score?: number | null
          user_id: string
        }
        Update: {
          axis?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          max_score?: number | null
          normalized_score?: number | null
          notes?: string | null
          started_at?: string
          test_id?: string
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_sessions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_tests: {
        Row: {
          axis: string
          created_at: string
          description: string | null
          estimated_minutes: number
          id: string
          is_active: boolean
          question_count: number
          sport: string | null
          title: string
        }
        Insert: {
          axis: string
          created_at?: string
          description?: string | null
          estimated_minutes?: number
          id?: string
          is_active?: boolean
          question_count?: number
          sport?: string | null
          title: string
        }
        Update: {
          axis?: string
          created_at?: string
          description?: string | null
          estimated_minutes?: number
          id?: string
          is_active?: boolean
          question_count?: number
          sport?: string | null
          title?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          club_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["user_status"]
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      family_links: {
        Row: {
          child_id: string
          consent_date: string | null
          consent_given: boolean
          created_at: string
          id: string
          parent_id: string
          relationship: string | null
        }
        Insert: {
          child_id: string
          consent_date?: string | null
          consent_given?: boolean
          created_at?: string
          id?: string
          parent_id: string
          relationship?: string | null
        }
        Update: {
          child_id?: string
          consent_date?: string | null
          consent_given?: boolean
          created_at?: string
          id?: string
          parent_id?: string
          relationship?: string | null
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          completed_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_quizzes: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string
          pass_percent: number | null
          questions: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id: string
          pass_percent?: number | null
          questions?: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string
          pass_percent?: number | null
          questions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lesson_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_clearances: {
        Row: {
          created_at: string
          doctor_name: string | null
          expiry_date: string
          file_url: string | null
          id: string
          issued_date: string
          notes: string | null
          status: Database["public"]["Enums"]["clearance_status"]
          updated_at: string
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_name?: string | null
          expiry_date: string
          file_url?: string | null
          id?: string
          issued_date: string
          notes?: string | null
          status?: Database["public"]["Enums"]["clearance_status"]
          updated_at?: string
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_name?: string | null
          expiry_date?: string
          file_url?: string | null
          id?: string
          issued_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["clearance_status"]
          updated_at?: string
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          avatar: string | null
          created_at: string
          description: string
          id: string
          is_read: boolean
          metadata: Json | null
          priority: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          avatar?: string | null
          created_at?: string
          description?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          priority?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          avatar?: string | null
          created_at?: string
          description?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          priority?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      player_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          badges: Json | null
          current_streak: number
          id: string
          level: Database["public"]["Enums"]["player_level"]
          longest_streak: number
          total_logs: number
          total_training_min: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          badges?: Json | null
          current_streak?: number
          id?: string
          level?: Database["public"]["Enums"]["player_level"]
          longest_streak?: number
          total_logs?: number
          total_training_min?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          badges?: Json | null
          current_streak?: number
          id?: string
          level?: Database["public"]["Enums"]["player_level"]
          longest_streak?: number
          total_logs?: number
          total_training_min?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      prizes: {
        Row: {
          created_at: string
          description: string
          details: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          sponsor: string | null
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          details?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          sponsor?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          details?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          sponsor?: string | null
          value?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          club_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          gender: string | null
          id: string
          onboarding: Json | null
          onboarding_completed: boolean
          phone: string | null
          sport: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          club_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          id: string
          onboarding?: Json | null
          onboarding_completed?: boolean
          phone?: string | null
          sport?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          club_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          onboarding?: Json | null
          onboarding_completed?: boolean
          phone?: string | null
          sport?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          created_at: string | null
          id: string
          passed: boolean | null
          quiz_id: string
          score: number
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id: string
          score?: number
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          answers?: Json | null
          created_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id?: string
          score?: number
          user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lesson_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_roma: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      rag_tino: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      rag_zahia: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      session_attendance: {
        Row: {
          created_at: string
          id: string
          player_id: string
          session_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          session_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plan_sessions: {
        Row: {
          created_at: string
          day_index: number
          day_label: string
          duration_min: number
          exercises: Json | null
          id: string
          intensity: string
          notes: string | null
          plan_id: string
          rpe: number | null
          session_type: string
          status: string
          title: string
          week_number: number
        }
        Insert: {
          created_at?: string
          day_index?: number
          day_label?: string
          duration_min?: number
          exercises?: Json | null
          id?: string
          intensity?: string
          notes?: string | null
          plan_id: string
          rpe?: number | null
          session_type?: string
          status?: string
          title?: string
          week_number?: number
        }
        Update: {
          created_at?: string
          day_index?: number
          day_label?: string
          duration_min?: number
          exercises?: Json | null
          id?: string
          intensity?: string
          notes?: string | null
          plan_id?: string
          rpe?: number | null
          session_type?: string
          status?: string
          title?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          category: string
          coach_id: string | null
          created_at: string
          current_stage: string
          current_week: number
          cycle_name: string
          end_date: string | null
          id: string
          objective: string | null
          sport: string
          start_date: string | null
          total_weeks: number
          user_id: string
        }
        Insert: {
          category?: string
          coach_id?: string | null
          created_at?: string
          current_stage?: string
          current_week?: number
          cycle_name?: string
          end_date?: string | null
          id?: string
          objective?: string | null
          sport?: string
          start_date?: string | null
          total_weeks?: number
          user_id: string
        }
        Update: {
          category?: string
          coach_id?: string | null
          created_at?: string
          current_stage?: string
          current_week?: number
          cycle_name?: string
          end_date?: string | null
          id?: string
          objective?: string | null
          sport?: string
          start_date?: string | null
          total_weeks?: number
          user_id?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          category: string
          club_id: string
          coach_id: string
          cooldown_done: boolean
          created_at: string
          date: string
          duration_min: number
          group_name: string
          id: string
          notes: string | null
          rpe_group: number
          sport: string
          type: string
          warmup_done: boolean
        }
        Insert: {
          category?: string
          club_id: string
          coach_id: string
          cooldown_done?: boolean
          created_at?: string
          date: string
          duration_min?: number
          group_name?: string
          id?: string
          notes?: string | null
          rpe_group?: number
          sport?: string
          type?: string
          warmup_done?: boolean
        }
        Update: {
          category?: string
          club_id?: string
          coach_id?: string
          cooldown_done?: boolean
          created_at?: string
          date?: string
          duration_min?: number
          group_name?: string
          id?: string
          notes?: string | null
          rpe_group?: number
          sport?: string
          type?: string
          warmup_done?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consented_child_ids: { Args: never; Returns: string[] }
      create_family_link_code: {
        Args: { _child_id?: string }
        Returns: string
      }
      give_family_consent: {
        Args: { _link_id: string; _text: string; _version: string }
        Returns: undefined
      }
      redeem_family_link_code: { Args: { _code: string }; Returns: string }
      revoke_family_consent: { Args: { _link_id: string }; Returns: undefined }
      get_user_club_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_users_in_same_clubs: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_rag_documents: {
        Args: {
          _match_count?: number
          _match_threshold?: number
          _query_embedding: string
          _table_name: string
        }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "player"
        | "parent"
        | "coach"
        | "club_admin"
        | "federation"
        | "government"
        | "admin"
      clearance_status: "valid" | "expiring_soon" | "expired" | "pending"
      player_level: "bronze" | "silver" | "gold" | "elite"
      user_status: "active" | "inactive" | "pending"
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
      app_role: [
        "player",
        "parent",
        "coach",
        "club_admin",
        "federation",
        "government",
        "admin",
      ],
      clearance_status: ["valid", "expiring_soon", "expired", "pending"],
      player_level: ["bronze", "silver", "gold", "elite"],
      user_status: ["active", "inactive", "pending"],
    },
  },
} as const
