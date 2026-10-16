export interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  description: string | null;
  isActive: boolean;
}

export interface AppointmentTypeInput {
  name: string;
  duration: number;
  description?: string;
}
