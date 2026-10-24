// Shape returned by GET /api/doctors (never includes a password hash).
export interface Doctor {
  id: string;
  specialization: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    deactivatedAt: string | null;
  };
}

// Body for PUT /api/doctors/:id. An empty specialization means "not given".
export interface DoctorInput {
  name: string;
  email: string;
  specialization: string;
}

// Body for POST /api/doctors: the admin sets a start password.
export interface NewDoctorInput extends DoctorInput {
  password: string;
}
