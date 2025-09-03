/*
# Criação do Esquema Inicial do Banco de Dados para MediSchedule
Este script estabelece a estrutura fundamental para o sistema de agendamento médico, incluindo tabelas para clínicas, usuários, médicos, pacientes e a lógica de agendamentos.

## Descrição da Query:
- **Criação de Tabelas:** Define as tabelas `clinicas`, `perfis`, `medicos`, `pacientes`, `horarios_disponiveis`, `bloqueios_horario`, `agendamentos`, `prontuarios`, `receitas`, e `medicamentos_receita`.
- **Relacionamentos:** Estabelece chaves estrangeiras para conectar as tabelas, garantindo a integridade dos dados (ex: um médico pertence a uma clínica, um agendamento pertence a um paciente e a um médico).
- **Tipos de Dados:** Utiliza tipos de dados apropriados como UUID, TEXT, TIMESTAMPTZ, e tipos ENUM customizados para `funcao_usuario` e `status_agendamento`.
- **Segurança (RLS):** Habilita Row Level Security em todas as tabelas para garantir que os usuários só possam acessar os dados de sua própria clínica.
- **Triggers e Funções:**
  - `handle_new_user`: Cria automaticamente um perfil para um novo usuário registrado no `auth.users`.
  - `get_my_clinic_id()`: Uma função de segurança para obter o ID da clínica do usuário autenticado.
  - `is_member_of_clinic()`: Uma função para verificar se um usuário pertence a uma clínica específica.

## Impacto e Segurança:
- **Impacto nos Dados:** Como este é o script inicial, não há dados existentes a serem afetados.
- **Riscos:** A execução incorreta ou parcial pode levar a um esquema de banco de dados inconsistente.
- **Precauções:** Recomenda-se aplicar a migração em um ambiente de desenvolvimento ou staging antes da produção.

## Metadados:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: false

## Detalhes da Estrutura:
- **Tabelas Criadas:** clinicas, perfis, medicos, pacientes, horarios_disponiveis, bloqueios_horario, agendamentos, prontuarios, receitas, medicamentos_receita.
- **Tipos Criados:** funcao_usuario, status_agendamento.
- **Funções Criadas:** handle_new_user, get_my_clinic_id, is_member_of_clinic.
- **Triggers Criados:** on_auth_user_created.

## Implicações de Segurança:
- **RLS Status:** Habilitado em todas as tabelas.
- **Mudanças de Política:** Criação de políticas de RLS para garantir isolamento de dados por clínica (multi-tenancy).
- **Requisitos de Autenticação:** As políticas de RLS dependem do `auth.uid()` do usuário autenticado.

## Impacto de Performance:
- **Índices:** Índices são criados automaticamente para chaves primárias e estrangeiras, otimizando as consultas.
- **Triggers:** O trigger `on_auth_user_created` tem um impacto mínimo, executando apenas na criação de novos usuários.
*/

-- 1. CUSTOM TYPES
create type public.funcao_usuario as enum ('admin', 'medico', 'secretaria');
create type public.status_agendamento as enum ('pendente', 'confirmado', 'cancelado', 'concluido', 'ausente');

-- 2. TABELAS

-- Tabela de Clínicas (para multi-tenancy)
create table public.clinicas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text,
  telefone text,
  created_at timestamptz not null default now()
);
alter table public.clinicas enable row level security;

-- Tabela de Perfis de Usuários
create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text,
  avatar_url text,
  funcao public.funcao_usuario not null default 'secretaria',
  clinica_id uuid references public.clinicas(id) on delete set null
);
alter table public.perfis enable row level security;

-- Tabela de Médicos (informações específicas)
create table public.medicos (
  id uuid primary key references public.perfis(id) on delete cascade,
  clinica_id uuid not null references public.clinicas(id) on delete cascade,
  especialidade text not null,
  crm text not null unique
);
alter table public.medicos enable row level security;

-- Tabela de Pacientes
create table public.pacientes (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid not null references public.clinicas(id) on delete cascade,
  nome_completo text not null,
  email text,
  telefone text,
  data_nascimento date,
  genero text,
  endereco text,
  contato_emergencia text,
  created_at timestamptz not null default now()
);
alter table public.pacientes enable row level security;
create index idx_pacientes_clinica_id on public.pacientes(clinica_id);
create index idx_pacientes_nome on public.pacientes(nome_completo);

-- Tabela de Horários de Atendimento Padrão
create table public.horarios_disponiveis (
  id uuid primary key default gen_random_uuid(),
  medico_id uuid not null references public.medicos(id) on delete cascade,
  dia_da_semana int not null check (dia_da_semana between 0 and 6), -- 0 = Domingo, 1 = Segunda, ...
  hora_inicio time not null,
  hora_fim time not null,
  unique(medico_id, dia_da_semana)
);
alter table public.horarios_disponiveis enable row level security;

-- Tabela de Bloqueios de Horário (férias, feriados, etc.)
create table public.bloqueios_horario (
  id uuid primary key default gen_random_uuid(),
  medico_id uuid not null references public.medicos(id) on delete cascade,
  data_inicio date not null,
  data_fim date not null,
  hora_inicio time, -- Opcional, para bloquear um período do dia
  hora_fim time, -- Opcional, para bloquear um período do dia
  motivo text
);
alter table public.bloqueios_horario enable row level security;

-- Tabela de Agendamentos
create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  medico_id uuid not null references public.medicos(id) on delete cascade,
  clinica_id uuid not null references public.clinicas(id) on delete cascade,
  data_hora_inicio timestamptz not null,
  data_hora_fim timestamptz not null,
  status public.status_agendamento not null default 'pendente',
  observacoes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
alter table public.agendamentos enable row level security;
create index idx_agendamentos_data_inicio on public.agendamentos(data_hora_inicio);
create index idx_agendamentos_medico_id on public.agendamentos(medico_id);
create index idx_agendamentos_paciente_id on public.agendamentos(paciente_id);

-- Tabela de Prontuários
create table public.prontuarios (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  agendamento_id uuid not null references public.agendamentos(id) on delete cascade,
  medico_id uuid not null references public.medicos(id) on delete cascade,
  data_consulta timestamptz not null default now(),
  anotacoes text,
  historico_medico text,
  alergias text
);
alter table public.prontuarios enable row level security;

-- Tabela de Receitas
create table public.receitas (
  id uuid primary key default gen_random_uuid(),
  prontuario_id uuid not null references public.prontuarios(id) on delete cascade,
  data_emissao date not null default current_date
);
alter table public.receitas enable row level security;

-- Tabela de Medicamentos por Receita
create table public.medicamentos_receita (
  id uuid primary key default gen_random_uuid(),
  receita_id uuid not null references public.receitas(id) on delete cascade,
  nome_medicamento text not null,
  dosagem text not null,
  frequencia text not null,
  duracao text not null,
  instrucoes text
);
alter table public.medicamentos_receita enable row level security;


-- 3. FUNCTIONS & TRIGGERS

-- Função para criar um perfil quando um novo usuário se registra
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (id, nome_completo)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Trigger para executar a função acima
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Funções auxiliares para RLS
create function public.get_my_clinic_id()
returns uuid
language sql
security definer set search_path = public
as $$
  select clinica_id from public.perfis where id = auth.uid();
$$;

create function public.is_member_of_clinic(p_clinica_id uuid)
returns boolean
language sql
security definer set search_path = public
as $$
  select exists(select 1 from public.perfis where id = auth.uid() and clinica_id = p_clinica_id);
$$;


-- 4. ROW LEVEL SECURITY (RLS) POLICIES

-- Política para Perfis: Usuários podem ver outros perfis da mesma clínica. Podem atualizar seu próprio perfil.
create policy "Usuários podem ver perfis da sua clínica"
  on public.perfis for select
  using ( is_member_of_clinic(clinica_id) );

create policy "Usuários podem atualizar seu próprio perfil"
  on public.perfis for update
  using ( id = auth.uid() );

-- Política para Médicos: Todos da clínica podem ver os médicos.
create policy "Membros da clínica podem ver os médicos"
  on public.medicos for select
  using ( is_member_of_clinic(clinica_id) );

-- Política para Pacientes: Todos da clínica podem ver e gerenciar pacientes.
create policy "Membros da clínica podem gerenciar pacientes"
  on public.pacientes for all
  using ( is_member_of_clinic(clinica_id) );

-- Política para Horários Disponíveis: Todos da clínica podem ver. Apenas o médico pode gerenciar.
create policy "Membros da clínica podem ver horários"
  on public.horarios_disponiveis for select
  using ( exists(select 1 from public.medicos m join public.perfis p on m.id = p.id where m.id = horarios_disponiveis.medico_id and is_member_of_clinic(p.clinica_id)) );

create policy "Médicos podem gerenciar seus próprios horários"
  on public.horarios_disponiveis for all
  using ( medico_id = auth.uid() );

-- Política para Bloqueios de Horário: Mesma lógica dos horários disponíveis.
create policy "Membros da clínica podem ver bloqueios"
  on public.bloqueios_horario for select
  using ( exists(select 1 from public.medicos m join public.perfis p on m.id = p.id where m.id = bloqueios_horario.medico_id and is_member_of_clinic(p.clinica_id)) );

create policy "Médicos podem gerenciar seus próprios bloqueios"
  on public.bloqueios_horario for all
  using ( medico_id = auth.uid() );

-- Política para Agendamentos: Todos da clínica podem ver e gerenciar.
create policy "Membros da clínica podem gerenciar agendamentos"
  on public.agendamentos for all
  using ( is_member_of_clinic(clinica_id) );

-- Política para Prontuários: Todos da clínica podem ver e gerenciar.
create policy "Membros da clínica podem gerenciar prontuários"
  on public.prontuarios for all
  using ( exists(select 1 from public.pacientes where id = prontuarios.paciente_id and is_member_of_clinic(clinica_id)) );

-- Política para Receitas e Medicamentos: Todos da clínica podem ver e gerenciar.
create policy "Membros da clínica podem gerenciar receitas"
  on public.receitas for all
  using ( exists(select 1 from public.prontuarios pr join public.pacientes p on pr.paciente_id = p.id where pr.id = receitas.prontuario_id and is_member_of_clinic(p.clinica_id)) );

create policy "Membros da clínica podem gerenciar medicamentos de receitas"
  on public.medicamentos_receita for all
  using ( exists(select 1 from public.receitas r join public.prontuarios pr on r.prontuario_id = pr.id join public.pacientes p on pr.paciente_id = p.id where r.id = medicamentos_receita.receita_id and is_member_of_clinic(p.clinica_id)) );
