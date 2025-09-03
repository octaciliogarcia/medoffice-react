import { useState } from 'react';
import { Plus, Search, Printer, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generatePrescriptions, generatePatients, type Prescription } from '@/lib/data';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Prescriptions() {
  const [prescriptions] = useState<Prescription[]>(generatePrescriptions(20));
  const [patients] = useState(generatePatients(10));
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewPrescriptionOpen, setIsNewPrescriptionOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isViewingPrescription, setIsViewingPrescription] = useState(false);

  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  });

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addMedication = () => {
    setNewPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedication = (index: number) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receitas Médicas</h1>
          <p className="text-gray-600 mt-2">Gerencie e emita receitas para seus pacientes</p>
        </div>
        
        <Dialog open={isNewPrescriptionOpen} onOpenChange={setIsNewPrescriptionOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Emitir Nova Receita</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient">Paciente</Label>
                  <Select value={newPrescription.patientId} onValueChange={(value) => 
                    setNewPrescription(prev => ({ ...prev, patientId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="diagnosis">Diagnóstico</Label>
                  <Input 
                    id="diagnosis"
                    value={newPrescription.diagnosis}
                    onChange={(e) => setNewPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Digite o diagnóstico"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-medium">Medicamentos</Label>
                  <Button type="button" variant="outline" onClick={addMedication} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Medicamento
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {newPrescription.medications.map((medication, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor={`med-name-${index}`}>Nome do Medicamento</Label>
                            <Input
                              id={`med-name-${index}`}
                              value={medication.name}
                              onChange={(e) => updateMedication(index, 'name', e.target.value)}
                              placeholder="Ex: Dipirona"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`med-dosage-${index}`}>Dosagem</Label>
                            <Input
                              id={`med-dosage-${index}`}
                              value={medication.dosage}
                              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                              placeholder="Ex: 500mg"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor={`med-frequency-${index}`}>Frequência</Label>
                            <Select 
                              value={medication.frequency} 
                              onValueChange={(value) => updateMedication(index, 'frequency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a frequência" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1x ao dia">1x ao dia</SelectItem>
                                <SelectItem value="2x ao dia">2x ao dia</SelectItem>
                                <SelectItem value="3x ao dia">3x ao dia</SelectItem>
                                <SelectItem value="A cada 6 horas">A cada 6 horas</SelectItem>
                                <SelectItem value="A cada 8 horas">A cada 8 horas</SelectItem>
                                <SelectItem value="A cada 12 horas">A cada 12 horas</SelectItem>
                                <SelectItem value="SOS">SOS (se necessário)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`med-duration-${index}`}>Duração</Label>
                            <Select 
                              value={medication.duration} 
                              onValueChange={(value) => updateMedication(index, 'duration', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a duração" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3 dias">3 dias</SelectItem>
                                <SelectItem value="7 dias">7 dias</SelectItem>
                                <SelectItem value="14 dias">14 dias</SelectItem>
                                <SelectItem value="30 dias">30 dias</SelectItem>
                                <SelectItem value="Uso contínuo">Uso contínuo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`med-instructions-${index}`}>Instruções</Label>
                          <Textarea
                            id={`med-instructions-${index}`}
                            value={medication.instructions}
                            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                            placeholder="Ex: Tomar após as refeições"
                            rows={2}
                          />
                        </div>
                        
                        {newPrescription.medications.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMedication(index)}
                            className="mt-2 text-red-600 hover:text-red-700"
                          >
                            Remover Medicamento
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações Gerais</Label>
                <Textarea
                  id="notes"
                  value={newPrescription.notes}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações adicionais sobre o tratamento..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsNewPrescriptionOpen(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={() => setIsNewPrescriptionOpen(false)} className="flex-1">
                  Emitir Receita
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por paciente ou diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPrescriptions.map((prescription) => (
          <Card key={prescription.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
                  <p className="text-gray-600 font-medium">{prescription.diagnosis}</p>
                  <p className="text-sm text-gray-500">
                    {format(prescription.date, 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedPrescription(prescription);
                      setIsViewingPrescription(true);
                    }}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Medicamentos:</h4>
                {prescription.medications.map((medication, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="font-medium">{medication.name} - {medication.dosage}</div>
                    <div className="text-gray-600">
                      {medication.frequency} por {medication.duration}
                    </div>
                    {medication.instructions && (
                      <div className="text-gray-500 italic">{medication.instructions}</div>
                    )}
                  </div>
                ))}
              </div>
              
              {prescription.notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-800 mb-1">Observações:</h4>
                  <p className="text-sm text-blue-700">{prescription.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de visualização de receita */}
      <Dialog open={isViewingPrescription} onOpenChange={setIsViewingPrescription}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receita Médica</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-6">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">Dr. João Silva</h2>
                <p className="text-gray-600">CRM: 123456-SP</p>
                <p className="text-gray-600">Clínica Médica</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Paciente: {selectedPrescription.patientName}</h3>
                <p className="text-gray-600">Data: {format(selectedPrescription.date, 'dd/MM/yyyy', { locale: ptBR })}</p>
                <p className="text-gray-600">Diagnóstico: {selectedPrescription.diagnosis}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Prescrição:</h4>
                <div className="space-y-3">
                  {selectedPrescription.medications.map((medication, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="font-medium">{medication.name} {medication.dosage}</div>
                      <div className="text-sm text-gray-600">
                        Usar {medication.frequency} por {medication.duration}
                      </div>
                      {medication.instructions && (
                        <div className="text-sm text-gray-500 italic">{medication.instructions}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedPrescription.notes && (
                <div>
                  <h4 className="font-medium mb-2">Observações:</h4>
                  <p className="text-gray-700">{selectedPrescription.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
