'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import { GENRES, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, MIN_DESCRIPTION_LENGTH, MIN_CAPACITY, MAX_CAPACITY } from '@/lib/constants'
import type { CreateEventFormData } from '@/lib/types'

export default function EventForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    film_title: '',
    description: '',
    genre: '',
    poster_file: null,
    trailer_url: '',
    event_date: '',
    event_time: '',
    location_name: '',
    location_address: '',
    location_city: '',
    max_capacity: 50,
  })

  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateEventFormData, string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const updateField = (field: keyof CreateEventFormData, value: string | number | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setSubmitError('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, poster_file: 'Only JPG, PNG, and WebP images are allowed' }))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, poster_file: 'Image must be less than 5MB' }))
      return
    }

    updateField('poster_file', file)
    const reader = new FileReader()
    reader.onload = (e) => setPosterPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removePoster = () => {
    updateField('poster_file', null)
    setPosterPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateEventFormData, string>> = {}

    if (!formData.film_title.trim()) newErrors.film_title = 'Film title is required'
    if (!formData.title.trim()) newErrors.title = 'Event title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.description.trim().length < MIN_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`
    }
    if (!formData.event_date) newErrors.event_date = 'Date is required'
    if (!formData.event_time) newErrors.event_time = 'Time is required'
    if (formData.event_date) {
      const eventDateTime = new Date(`${formData.event_date}T${formData.event_time || '00:00'}`)
      if (eventDateTime <= new Date()) newErrors.event_date = 'Event date must be in the future'
    }
    if (!formData.location_name.trim()) newErrors.location_name = 'Location name is required'
    if (!formData.location_address.trim()) newErrors.location_address = 'Address is required'
    if (!formData.location_city.trim()) newErrors.location_city = 'City is required'
    if (formData.max_capacity < MIN_CAPACITY || formData.max_capacity > MAX_CAPACITY) {
      newErrors.max_capacity = `Capacity must be between ${MIN_CAPACITY} and ${MAX_CAPACITY}`
    }
    if (formData.trailer_url.trim()) {
      try {
        new URL(formData.trailer_url.trim())
      } catch {
        newErrors.trailer_url = 'Please enter a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setSubmitError('')

    try {
      let posterUrl = ''

      // Upload poster if provided
      if (formData.poster_file) {
        const uploadData = new FormData()
        uploadData.append('file', formData.poster_file)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        })

        const uploadResult = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadResult.error || 'Failed to upload poster')
        posterUrl = uploadResult.url
      }

      // Create event
      const eventDateTime = new Date(`${formData.event_date}T${formData.event_time}`)

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          film_title: formData.film_title.trim(),
          description: formData.description.trim(),
          genre: formData.genre || null,
          poster_url: posterUrl || null,
          trailer_url: formData.trailer_url.trim() || null,
          event_date: eventDateTime.toISOString(),
          location_name: formData.location_name.trim(),
          location_address: formData.location_address.trim(),
          location_city: formData.location_city.trim(),
          max_capacity: formData.max_capacity,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to create event')

      router.push(`/events/${result.event.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setSubmitError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Get today's date string for min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="p-4 rounded-lg bg-terracotta/10 border border-terracotta/30 text-sm text-terracotta">
          {submitError}
        </div>
      )}

      {/* Film Title */}
      <Input
        label="Film Title *"
        value={formData.film_title}
        onChange={(e) => updateField('film_title', e.target.value)}
        placeholder="Name of the film"
        error={errors.film_title}
      />

      {/* Event Title */}
      <Input
        label="Event Title *"
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
        placeholder={formData.film_title ? `${formData.film_title} Screening` : 'Your screening event title'}
        error={errors.title}
      />

      {/* Description */}
      <Textarea
        label="Description *"
        value={formData.description}
        onChange={(e) => updateField('description', e.target.value)}
        placeholder="Tell people about this screening (min 20 characters)..."
        error={errors.description}
      />

      {/* Genre */}
      <Select
        label="Genre"
        value={formData.genre}
        onChange={(e) => updateField('genre', e.target.value)}
        options={GENRES.map((g) => ({ value: g, label: g }))}
        placeholder="Select a genre (optional)"
      />

      {/* Poster Upload */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-secondary">Poster Image</label>
        {posterPreview ? (
          <div className="relative inline-block">
            <img
              src={posterPreview}
              alt="Poster preview"
              className="w-48 h-auto rounded-lg border border-border-subtle"
            />
            <button
              type="button"
              onClick={removePoster}
              className="absolute -top-2 -right-2 w-6 h-6 bg-terracotta text-white rounded-full flex items-center justify-center hover:brightness-110"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border-subtle rounded-lg p-8 text-center cursor-pointer hover:border-amber/50 transition-colors"
          >
            <Upload className="w-8 h-8 text-text-secondary mx-auto mb-2" />
            <p className="text-sm text-text-secondary">
              Click or drag to upload a poster
            </p>
            <p className="text-xs text-text-secondary mt-1">
              JPG, PNG, or WebP · Max 5MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        {errors.poster_file && <p className="text-sm text-terracotta">{errors.poster_file}</p>}
      </div>

      {/* Trailer URL */}
      <Input
        label="Trailer URL"
        value={formData.trailer_url}
        onChange={(e) => updateField('trailer_url', e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
        error={errors.trailer_url}
      />

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date *"
          type="date"
          value={formData.event_date}
          onChange={(e) => updateField('event_date', e.target.value)}
          min={today}
          error={errors.event_date}
        />
        <Input
          label="Time *"
          type="time"
          value={formData.event_time}
          onChange={(e) => updateField('event_time', e.target.value)}
          error={errors.event_time}
        />
      </div>

      {/* Location */}
      <Input
        label="Venue Name *"
        value={formData.location_name}
        onChange={(e) => updateField('location_name', e.target.value)}
        placeholder="e.g., The Roxie Theater"
        error={errors.location_name}
      />

      <Input
        label="Address *"
        value={formData.location_address}
        onChange={(e) => updateField('location_address', e.target.value)}
        placeholder="Full street address"
        error={errors.location_address}
      />

      <Input
        label="City *"
        value={formData.location_city}
        onChange={(e) => updateField('location_city', e.target.value)}
        placeholder="City name"
        error={errors.location_city}
      />

      {/* Max Capacity */}
      <Input
        label="Max Capacity *"
        type="number"
        value={String(formData.max_capacity)}
        onChange={(e) => updateField('max_capacity', parseInt(e.target.value) || 0)}
        min={MIN_CAPACITY}
        max={MAX_CAPACITY}
        error={errors.max_capacity}
      />

      <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
        <ImageIcon className="w-5 h-5" />
        Create Screening
      </Button>
    </form>
  )
}
