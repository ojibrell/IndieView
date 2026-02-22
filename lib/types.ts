export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  role: 'creator' | 'attendee'
  city: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  creator_id: string
  title: string
  description: string | null
  film_title: string
  genre: string | null
  poster_url: string | null
  trailer_url: string | null
  event_date: string
  location_name: string
  location_address: string
  location_city: string
  location_lat: number | null
  location_lng: number | null
  ticket_type: 'free' | 'paid'
  ticket_price: number
  max_capacity: number
  current_attendees: number
  status: 'draft' | 'upcoming' | 'sold_out' | 'past' | 'cancelled'
  created_at: string
  updated_at: string
  creator?: Profile
}

export interface RSVP {
  id: string
  event_id: string
  user_id: string
  status: 'confirmed' | 'cancelled' | 'waitlist'
  created_at: string
  event?: Event
  user?: Profile
}

export interface CreateEventFormData {
  title: string
  film_title: string
  description: string
  genre: string
  poster_file: File | null
  trailer_url: string
  event_date: string
  event_time: string
  location_name: string
  location_address: string
  location_city: string
  max_capacity: number
}
