export interface Doctor {
  id: string;
  userId: string;
  specialization: string | null;
  user: { name: string };
}
