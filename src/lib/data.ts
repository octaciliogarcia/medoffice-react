import { faker } from '@faker-js/faker';

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  date: Date;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  type: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  diagnosis: string;
  notes?: string;
}

// Mock data generators
export const generateAppointments = (count: number = 10): Appointment[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    patientName: faker.person.fullName(),
    patientEmail: faker.internet.email(),
    date: faker.date.future(),
    time: faker.date.recent().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    duration: faker.helpers.arrayElement([30, 45, 60]),
    status: faker.helpers.arrayElement(['confirmed', 'pending', 'cancelled', 'completed']),
    type: faker.helpers.arrayElement(['consultation', 'follow-up', 'emergency']),
    notes: faker.lorem.sentence(),
  }));
};

export const generatePatients = (count: number = 20): Patient[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    birthDate: faker.date.birthdate(),
    gender: faker.helpers.arrayElement(['male', 'female', 'other']),
    address: faker.location.streetAddress(),
    emergencyContact: faker.phone.number(),
    medicalHistory: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.lorem.words(3)),
    allergies: Array.from({ length: faker.number.int({ min: 0, max: 2 }) }, () => faker.lorem.word()),
    currentMedications: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.lorem.words(2)),
  }));
};

export const generatePrescriptions = (count: number = 15): Prescription[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    patientId: faker.string.uuid(),
    patientName: faker.person.fullName(),
    date: faker.date.recent(),
    medications: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      name: faker.lorem.words(2),
      dosage: `${faker.number.int({ min: 10, max: 500 })}mg`,
      frequency: faker.helpers.arrayElement(['1x ao dia', '2x ao dia', '3x ao dia', 'A cada 8 horas']),
      duration: faker.helpers.arrayElement(['7 dias', '14 dias', '30 dias', 'Uso contínuo']),
      instructions: faker.lorem.sentence(),
    })),
    diagnosis: faker.lorem.words(4),
    notes: faker.lorem.paragraph(),
  }));
};
