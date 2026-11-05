// GET /api/clinic. Empty optional fields are null.
export interface Clinic {
  name: string;
  addressLine: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
}

// PUT /api/clinic. An empty string means "not given".
export interface ClinicInput {
  name: string;
  addressLine: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
}
