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
      agendamentos: {
        Row: {
          id: string
          clinica_id: string
          medico_id: string
          paciente_id: string
          data_hora_inicio: string
          data_hora_fim: string
          status: "agendado" | "confirmado" | "cancelado" | "concluido" | "ausente"
          tipo_consulta: string
          observacoes: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          medico_id: string
          paciente_id: string
          data_hora_inicio: string
          data_hora_fim: string
          status?: "agendado" | "confirmado" | "cancelado" | "concluido" | "ausente"
          tipo_consulta: string
          observacoes?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          medico_id?: string
          paciente_id?: string
          data_hora_inicio?: string
          data_hora_fim?: string
          status?: "agendado" | "confirmado" | "cancelado" | "concluido" | "ausente"
          tipo_consulta?: string
          observacoes?: string | null
          criado_em?: string
        }
      }
      bloqueios_agenda: {
        Row: {
          id: string
          medico_id: string
          data_hora_inicio: string
          data_hora_fim: string
          motivo: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          medico_id: string
          data_hora_inicio: string
          data_hora_fim: string
          motivo?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          medico_id?: string
          data_hora_inicio?: string
          data_hora_fim?: string
          motivo?: string | null
          criado_em?: string
        }
      }
      clinicas: {
        Row: {
          id: string
          nome: string
          endereco: string | null
          telefone: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          endereco?: string | null
          telefone?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          endereco?: string | null
          telefone?: string | null
          criado_em?: string
        }
      }
      especialidades: {
        Row: {
          id: string
          nome: string
        }
        Insert: {
          id?: string
          nome: string
        }
        Update: {
          id?: string
          nome?: string
        }
      }
      horarios_disponiveis: {
        Row: {
          id: string
          medico_id: string
          dia_semana: number
          hora_inicio: string
          hora_fim: string
          intervalos: Json | null
        }
        Insert: {
          id?: string
          medico_id: string
          dia_semana: number
          hora_inicio: string
          hora_fim: string
          intervalos?: Json | null
        }
        Update: {
          id?: string
          medico_id?: string
          dia_semana?: number
          hora_inicio?: string
          hora_fim?: string
          intervalos?: Json | null
        }
      }
      medicos: {
        Row: {
          id: string
          user_id: string
          clinica_id: string
          nome_completo: string
          crm: string
          especialidade_id: string
          criado_em: string
        }
        Insert: {
          id?: string
          user_id: string
          clinica_id: string
          nome_completo: string
          crm: string
          especialidade_id: string
          criado_em?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinica_id?: string
          nome_completo?: string
          crm?: string
          especialidade_id?: string
          criado_em?: string
        }
      }
      pacientes: {
        Row: {
          id: string
          clinica_id: string
          nome_completo: string
          email: string | null
          telefone: string | null
          data_nascimento: string | null
          genero: string | null
          endereco: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          clinica_id: string
          nome_completo: string
          email?: string | null
          telefone?: string | null
          data_nascimento?: string | null
          genero?: string | null
          endereco?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          clinica_id?: string
          nome_completo?: string
          email?: string | null
          telefone?: string | null
          data_nascimento?: string | null
          genero?: string | null
          endereco?: string | null
          criado_em?: string
        }
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
