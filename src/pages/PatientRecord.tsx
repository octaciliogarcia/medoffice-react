import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, Plus, Calendar, Pill, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { generatePatients, generateAppointments, generatePrescriptions } from '@/lib/data';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateAge } from '@/lib/utils';

export default function PatientRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  
  // Simular dados do paciente
  const patients = generatePatients(1);
  const patient = patients[0];
  const appointments = generateAppointments(5);
  const prescriptions = generatePrescriptions(3);

  const [notes, setNotes] = useState([
    {
      id: '1',
      date: new Date(),
      content: 'Paciente relatou melhora significativa dos sintomas após início do tratamento. Recomendado continuar com a medicação atual.',
      type: 'consultation'
    },
    {
      id: '2',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      content: 'Realizada anamnese completa. Paciente apresenta quadro estável. Solicitados exames de rotina.',
      type: 'examination'
    }
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/patients')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-600 mt-2">Prontuário médico completo</p>
        </div>
        <Button 
          variant={isEditing ? "default" : "outline"} 
          onClick={() => setIsEditing(!isEditing)}
          className="gap-2"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          {isEditing ? 'Salvar' : 'Editar'}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="prescriptions">Receitas</TabsTrigger>
          <TabsTrigger value="notes">Anotações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      value={patient.name} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      value={patient.email} 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      value={patient.phone} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="birth-date">Data de Nascimento</Label>
                    <Input 
                      id="birth-date" 
                      value={format(patient.birthDate, 'yyyy-MM-dd')} 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gênero</Label>
                    <Input 
                      id="gender" 
                      value={patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro'} 
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency">Contato de Emergência</Label>
                    <Input 
                      id="emergency" 
                      value={patient.emergencyContact} 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input 
                    id="address" 
                    value={patient.address} 
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Idade:</span>
                    <span className="font-medium">{calculateAge(patient.birthDate)} anos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultas:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última consulta:</span>
                    <span className="font-medium">15/01/2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Próxima consulta:</span>
                    <span className="font-medium">22/01/2025</span>
                  </div>
                </CardContent>
              </Card>

              {patient.allergies.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      Alergias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive">{allergy}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Médico</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={patient.medicalHistory.join('\n')} 
                  disabled={!isEditing}
                  rows={6}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medicamentos Atuais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patient.currentMedications.map((medication, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded border">
                      {medication}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {format(appointment.date, 'dd/MM/yyyy', { locale: ptBR })} às {appointment.time}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tipo: {appointment.type === 'consultation' ? 'Consulta' : 
                               appointment.type === 'follow-up' ? 'Retorno' : 'Emergência'}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                      )}
                    </div>
                    <Badge 
                      variant={appointment.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {appointment.status === 'completed' ? 'Concluída' : 'Agendada'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Receitas Emitidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium">{prescription.diagnosis}</p>
                        <p className="text-sm text-gray-600">
                          {format(prescription.date, 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Ver Receita</Button>
                    </div>
                    <div className="space-y-2">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                          <strong>{med.name}</strong> - {med.dosage}<br />
                          {med.frequency} por {med.duration}<br />
                          <em>{med.instructions}</em>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Anotações Médicas
                </CardTitle>
                <Dialog open={isNewNoteOpen} onOpenChange={setIsNewNoteOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nova Anotação
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Anotação</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="note-content">Conteúdo</Label>
                        <Textarea id="note-content" rows={6} placeholder="Digite a anotação..." />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setIsNewNoteOpen(false)} variant="outline" className="flex-1">
                          Cancelar
                        </Button>
                        <Button onClick={() => setIsNewNoteOpen(false)} className="flex-1">
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">
                        {note.type === 'consultation' ? 'Consulta' : 'Exame'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(note.date, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
