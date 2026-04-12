export interface DbEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  city: string;
  industry: string;
  capacity: number;
  spots_remaining: number;
  price: number | null;
  image_url: string | null;
  organizer_name: string | null;
  organizer_email: string | null;
}
