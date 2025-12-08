export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends Credentials {
  nombre: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

