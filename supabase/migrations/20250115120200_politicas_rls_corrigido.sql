/*
# [POLÍTICAS DE SEGURANÇA (RLS) - CORRIGIDO]
Este script habilita a Segurança a Nível de Linha (RLS) e define as políticas de acesso para as principais tabelas do sistema.

## Descrição da Query:
Esta migração aplica regras de segurança para garantir que os dados sejam isolados corretamente em um ambiente multi-clínica (multi-tenant). As políticas garantem que:
1. Médicos só podem acessar e gerenciar suas próprias informações e horários.
2. Usuários (médicos, secretárias) só podem ver pacientes e agendamentos da clínica à qual pertencem.
3. Apenas médicos podem modificar os agendamentos que lhes pertencem.
Esta versão corrige uma ambiguidade na política da tabela `medicos` que causava um erro na migração anterior.

## Metadados:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Medium"]
- Requires-Backup: false
- Reversible: true (as políticas podem ser removidas com `DROP POLICY`)

## Detalhes da Estrutura:
- Tabelas Afetadas: `medicos`, `horarios_disponiveis`, `pacientes`, `agendamentos`
- Operações: Habilitação de RLS, Criação de Políticas de Acesso

## Implicações de Segurança:
- RLS Status: Habilitado
- Mudanças de Política: Sim, adiciona as políticas de segurança fundamentais para o isolamento de dados.
- Requisitos de Autenticação: As políticas dependem do `auth.uid()` do usuário autenticado.

## Impacto de Performance:
- Índices: Nenhum
- Triggers: Nenhum
- Impacto Estimado: Mínimo. As consultas de política são eficientes e usam chaves primárias e estrangeiras.
*/

-- Habilita RLS para as tabelas
alter table public.medicos enable row level security;
alter table public.horarios_disponiveis enable row level security;
alter table public.pacientes enable row level security;
alter table public.agendamentos enable row level security;

-- Políticas para a tabela medicos
-- CORREÇÃO: Especifica a tabela (medicos.user_id) para evitar ambiguidade.
create policy "Medicos podem ver e editar seus proprios perfis."
on public.medicos for all
using ( auth.uid() = medicos.user_id )
with check ( auth.uid() = medicos.user_id );

-- Políticas para a tabela horarios_disponiveis
create policy "Medicos podem gerenciar seus proprios horarios."
on public.horarios_disponiveis for all
using ( auth.uid() = (select user_id from public.medicos where id = horarios_disponiveis.medico_id) )
with check ( auth.uid() = (select user_id from public.medicos where id = horarios_disponiveis.medico_id) );

-- Políticas para a tabela pacientes (Multi-tenant por clínica)
create policy "Membros da clínica podem ver pacientes da mesma clínica."
on public.pacientes for select
using (
  pacientes.clinica_id in (
    select clinica_id from public.medicos where user_id = auth.uid()
  )
);

create policy "Membros da clínica podem adicionar pacientes à mesma clínica."
on public.pacientes for insert
with check (
  pacientes.clinica_id in (
    select clinica_id from public.medicos where user_id = auth.uid()
  )
);

-- Políticas para a tabela agendamentos (Multi-tenant por clínica)
create policy "Membros da clínica podem ver agendamentos da mesma clínica."
on public.agendamentos for select
using (
  agendamentos.clinica_id in (
    select clinica_id from public.medicos where user_id = auth.uid()
  )
);

create policy "Membros da clínica podem criar agendamentos na mesma clínica."
on public.agendamentos for insert
with check (
  agendamentos.clinica_id in (
    select clinica_id from public.medicos where user_id = auth.uid()
  )
);

create policy "Médicos podem editar/deletar seus próprios agendamentos."
on public.agendamentos for update, delete
using (
  auth.uid() = (select user_id from public.medicos where id = agendamentos.medico_id)
);
