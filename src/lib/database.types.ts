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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          role: 'citizen' | 'admin' | 'department_head'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          role?: 'citizen' | 'admin' | 'department_head'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          role?: 'citizen' | 'admin' | 'department_head'
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          contact_email: string | null
          contact_phone: string | null
          jurisdiction: string
          state: string
          city: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          jurisdiction: string
          state: string
          city: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          jurisdiction?: string
          state?: string
          city?: string
          created_at?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          id: string
          title: string
          description: string
          category_id: string
          department_id: string
          user_id: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed'
          verification_status: 'pending' | 'verified' | 'failed'
          photo_urls: string[] | null
          audio_url: string | null
          latitude: number | null
          longitude: number | null
          vote_count: number | null
          assigned_to: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          category_id: string
          department_id: string
          user_id: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed'
          verification_status?: 'pending' | 'verified' | 'failed'
          photo_urls?: string[] | null
          audio_url?: string | null
          latitude?: number | null
          longitude?: number | null
          vote_count?: number | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category_id?: string
          department_id?: string
          user_id?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed'
          verification_status?: 'pending' | 'verified' | 'failed'
          photo_urls?: string[] | null
          audio_url?: string | null
          latitude?: number | null
          longitude?: number | null
          vote_count?: number | null
          assigned_to?: string | null
          updated_at?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'issues_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'issues_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'issues_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'issues_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      issue_updates: {
        Row: {
          id: string
          issue_id: string
          user_id: string
          update_type: 'status_change' | 'assignment' | 'comment' | 'resolution'
          old_value: string | null
          new_value: string | null
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          user_id: string
          update_type: 'status_change' | 'assignment' | 'comment' | 'resolution'
          old_value?: string | null
          new_value?: string | null
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          user_id?: string
          update_type?: 'status_change' | 'assignment' | 'comment' | 'resolution'
          old_value?: string | null
          new_value?: string | null
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'issue_updates_issue_id_fkey'
            columns: ['issue_id']
            isOneToOne: false
            referencedRelation: 'issues'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'issue_updates_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          issue_id: string | null
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          issue_id?: string | null
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          issue_id?: string | null
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_issue_id_fkey'
            columns: ['issue_id']
            isOneToOne: false
            referencedRelation: 'issues'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}