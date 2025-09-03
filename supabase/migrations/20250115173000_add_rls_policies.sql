/*
# [Segurança] Adicionar Políticas de RLS Iniciais
Este script habilita a segurança a nível de linha (RLS) e cria as políticas iniciais para as tabelas `medicos` e `horarios_disponiveis`, garantindo que os usuários só possam acessar e modificar seus próprios dados.

## Descrição da Query:
- Habilita RLS nas tabelas `medicos` e `horarios_disponiveis`.
- Cria uma política na tabela `medicos` que permite a um usuário autenticado ver e atualizar apenas o seu próprio perfil, com base na correspondência entre `auth.uid()` e a coluna `user_id`.
- Cria políticas na tabela `horarios_disponiveis` que permitem a um médico (usuário autenticado) gerenciar (SELECT, INSERT, UPDATE, DELETE) apenas os seus próprios horários disponíveis. A verificação é feita através de uma subconsulta que busca o `id` do médico na tabela `medicos` correspondente ao `auth.uid()`.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Detalhes da Estrutura:
- Tabelas Afetadas: `medicos`, `horarios_disponiveis`
- Alterações: Adição de políticas de RLS.

## Implicações de Segurança:
- RLS Status: Habilitado e Configurado
- Mudanças de Política: Sim
- Requisitos de Autenticação: As operações passam a exigir que o usuário esteja autenticado e que a sua identidade corresponda aos dados que está tentando acessar.

## Impacto de Performance:
- Índices: Nenhum
- Triggers: Nenhum
- Impacto Estimado: Mínimo. A verificação de RLS adiciona uma pequena sobrecarga em cada query, mas é otimizada pelo Supabase e essencial para a segurança.
*/

-- Habilitar RLS para tabelas
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_disponiveis ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela 'medicos'
DROP POLICY IF EXISTS "Médicos podem ver e atualizar seu próprio perfil." ON public.medicos;
CREATE POLICY "Médicos podem ver e atualizar seu próprio perfil."
ON public.medicos
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas para a tabela 'horarios_disponiveis'
DROP POLICY IF EXISTS "Médicos podem ver seus próprios horários." ON public.horarios_disponiveis;
CREATE POLICY "Médicos podem ver seus próprios horários."
ON public.horarios_disponiveis
FOR SELECT
USING (
  medico_id IN (
    SELECT id FROM public.medicos WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Médicos podem criar seus próprios horários." ON public.horarios_disponiveis;
CREATE POLICY "Médicos podem criar seus próprios horários."
ON public.horarios_disponiveis
FOR INSERT
WITH CHECK (
  medico_id IN (
    SELECT id FROM public.medicos WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Médicos podem atualizar seus próprios horários." ON public.horarios_disponiveis;
CREATE POLICY "Médicos podem atualizar seus próprios horários."
ON public.horarios_disponiveis
FOR UPDATE
USING (
  medico_id IN (
    SELECT id FROM public.medicos WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Médicos podem deletar seus próprios horários." ON public.horarios_disponiveis;
CREATE POLICY "Médicos podem deletar seus próprios horários."
ON public.horarios_disponiveis
FOR DELETE
USING (
  medico_id IN (
    SELECT id FROM public.medicos WHERE user_id = auth.uid()
  )
);
