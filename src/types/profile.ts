export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  bio: string | null;
  profile_picture: string | null;
  created_at?: string;
  updated_at?: string;
}
