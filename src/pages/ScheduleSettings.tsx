import { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Database } from '@/types/database';

type Horario = Database['public']['Tables']['horarios_disponiveis']['Row'];
type Intervalo = { start: string; end: string };

const daysOfWeek = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

const defaultHorario: Omit<Horario, 'id' | 'medico_id' | 'dia_semana'> = {
  hora_inicio: '08:00:00',
  hora_fim: '18:00:00',
  intervalos: [{ start: '12:00', end: '13:00' }],
};

export default function ScheduleSettings() {
  const { user } = useAuth();
  const [horarios, setHorarios] = useState<Map<number, Horario>>(new Map());
  const [medicoId, setMedicoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMedicoId = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('medicos')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      if (data) setMedicoId(data.id);

    } catch (error) {
      toast.error('Erro ao buscar informações do médico.');
      console.error(error);
    }
  }, [user]);

  const fetchHorarios = useCallback(async () => {
    if (!medicoId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('horarios_disponiveis')
        .select('*')
        .eq('medico_id', medicoId);
      
      if (error) throw error;

      const horariosMap = new Map<number, Horario>();
      data.forEach(h => horariosMap.set(h.dia_semana, h));
      setHorarios(horariosMap);

    } catch (error) {
      toast.error('Erro ao buscar horários.');
    } finally {
      setLoading(false);
    }
  }, [medicoId]);

  useEffect(() => {
    fetchMedicoId();
  }, [fetchMedicoId]);

  useEffect(() => {
    if (medicoId) {
      fetchHorarios();
    }
  }, [medicoId, fetchHorarios]);

  const updateHorario = (dayOfWeek: number, field: keyof Omit<Horario, 'id' | 'medico_id' | 'dia_semana'>, value: any) => {
    setHorarios(prev => {
      const newMap = new Map(prev);
      const horario = newMap.get(dayOfWeek) || { ...defaultHorario, dia_semana: dayOfWeek, medico_id: medicoId!, id: '' };
      (horario as any)[field] = value;
      newMap.set(dayOfWeek, horario);
      return newMap;
    });
  };

  const addBreakTime = (dayOfWeek: number) => {
    const horario = horarios.get(dayOfWeek);
    if (!horario) return;
    const intervalos = (horario.intervalos as Intervalo[] || []);
    updateHorario(dayOfWeek, 'intervalos', [...intervalos, { start: '12:00', end: '13:00' }]);
  };

  const removeBreakTime = (dayOfWeek: number, index: number) => {
    const horario = horarios.get(dayOfWeek);
    if (!horario) return;
    const intervalos = (horario.intervalos as Intervalo[] || []);
    updateHorario(dayOfWeek, 'intervalos', intervalos.filter((_, i) => i !== index));
  };

  const updateBreakTime = (dayOfWeek: number, index: number, field: 'start' | 'end', value: string) => {
    const horario = horarios.get(dayOfWeek);
    if (!horario) return;
    const intervalos = (horario.intervalos as Intervalo[] || []);
    const newIntervalos = intervalos.map((bt, i) => i === index ? { ...bt, [field]: value } : bt);
    updateHorario(dayOfWeek, 'intervalos', newIntervalos);
  };

  const toggleDay = (dayOfWeek: number) => {
    setHorarios(prev => {
      const newMap = new Map(prev);
      if (newMap.has(dayOfWeek)) {
        newMap.delete(dayOfWeek);
      } else {
        newMap.set(dayOfWeek, {
          ...defaultHorario,
          id: '', // Será gerado pelo banco se for novo
          medico_id: medicoId!,
          dia_semana: dayOfWeek,
        });
      }
      return newMap;
    });
  };

  const saveSchedule = async () => {
    if (!medicoId) return;
    setSaving(true);
    const promise = async () => {
      const allDays = daysOfWeek.map(d => d.value);
      const activeDays = Array.from(horarios.keys());
      const inactiveDays = allDays.filter(d => !activeDays.includes(d));

      const upsertData = Array.from(horarios.values()).map(h => ({
        ...h,
        medico_id: medicoId,
        hora_inicio: h.hora_inicio.length === 5 ? `${h.hora_inicio}:00` : h.hora_inicio,
        hora_fim: h.hora_fim.length === 5 ? `${h.hora_fim}:00` : h.hora_fim,
      }));
      
      const { error: upsertError } = await supabase.from('horarios_disponiveis').upsert(upsertData, {
        onConflict: 'medico_id, dia_semana'
      });
      if (upsertError) throw upsertError;

      if (inactiveDays.length > 0) {
        const { error: deleteError } = await supabase
          .from('horarios_disponiveis')
          .delete()
          .eq('medico_id', medicoId)
          .in('dia_semana', inactiveDays);
        if (deleteError) throw deleteError;
      }
    };

    toast.promise(promise(), {
      loading: 'Salvando horários...',
      success: () => {
        fetchHorarios();
        setSaving(false);
        return 'Horários salvos com sucesso!';
      },
      error: (err) => {
        setSaving(false);
        console.error(err);
        return 'Erro ao salvar horários.';
      },
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-8 w-1/4" />
          {daysOfWeek.map(day => (
            <Skeleton key={day.value} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuração de Horários</h1>
          <p className="text-gray-600 mt-2">Configure seus horários de atendimento</p>
        </div>
        <Button onClick={saveSchedule} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      <div className="space-y-6">
        {daysOfWeek.map((day) => {
          const isActive = horarios.has(day.value);
          const daySchedule = horarios.get(day.value) || defaultHorario;

          return (
            <Card key={day.value}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {day.label}
                  </CardTitle>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                </div>
              </CardHeader>
              
              {isActive && (
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`start-${day.value}`}>Horário de Início</Label>
                      <Input
                        id={`start-${day.value}`}
                        type="time"
                        value={daySchedule.hora_inicio?.substring(0, 5) || ''}
                        onChange={(e) => updateHorario(day.value, 'hora_inicio', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`end-${day.value}`}>Horário de Término</Label>
                      <Input
                        id={`end-${day.value}`}
                        type="time"
                        value={daySchedule.hora_fim?.substring(0, 5) || ''}
                        onChange={(e) => updateHorario(day.value, 'hora_fim', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base font-medium">Intervalos</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBreakTime(day.value)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Intervalo
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {(daySchedule.intervalos as Intervalo[] || []).map((breakTime, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={breakTime.start}
                            onChange={(e) => updateBreakTime(day.value, index, 'start', e.target.value)}
                            className="w-32"
                          />
                          <span className="text-gray-500">até</span>
                          <Input
                            type="time"
                            value={breakTime.end}
                            onChange={(e) => updateBreakTime(day.value, index, 'end', e.target.value)}
                            className="w-32"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBreakTime(day.value, index)}
                            className="text-red-600 hover:bg-red-100 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
