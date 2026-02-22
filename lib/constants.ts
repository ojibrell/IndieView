export const GENRES = [
  'Drama',
  'Comedy',
  'Horror',
  'Documentary',
  'Sci-Fi',
  'Animation',
  'Thriller',
  'Experimental',
  'Short Film',
  'Other',
] as const

export const ROLES = [
  { value: 'creator', label: 'Creator — I make films and host screenings' },
  { value: 'attendee', label: 'Attendee — I want to discover screenings' },
] as const

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_CAPACITY = 1000
export const MIN_CAPACITY = 1
export const MIN_DESCRIPTION_LENGTH = 20
