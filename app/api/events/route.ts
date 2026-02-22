import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MIN_DESCRIPTION_LENGTH, MIN_CAPACITY, MAX_CAPACITY } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'creator') {
      return NextResponse.json({ error: 'Only creators can create events' }, { status: 403 })
    }

    const body = await request.json()

    // Validate required fields
    const { title, film_title, description, genre, poster_url, trailer_url, event_date, location_name, location_address, location_city, max_capacity } = body

    if (!title?.trim()) return NextResponse.json({ error: 'Event title is required' }, { status: 400 })
    if (!film_title?.trim()) return NextResponse.json({ error: 'Film title is required' }, { status: 400 })
    if (!description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      return NextResponse.json({ error: `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters` }, { status: 400 })
    }
    if (!event_date) return NextResponse.json({ error: 'Event date is required' }, { status: 400 })
    if (!location_name?.trim()) return NextResponse.json({ error: 'Location name is required' }, { status: 400 })
    if (!location_address?.trim()) return NextResponse.json({ error: 'Location address is required' }, { status: 400 })
    if (!location_city?.trim()) return NextResponse.json({ error: 'Location city is required' }, { status: 400 })

    // Validate date is in the future
    const eventDate = new Date(event_date)
    if (isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      return NextResponse.json({ error: 'Event date must be in the future' }, { status: 400 })
    }

    // Validate capacity
    const capacity = parseInt(max_capacity)
    if (isNaN(capacity) || capacity < MIN_CAPACITY || capacity > MAX_CAPACITY) {
      return NextResponse.json({ error: `Capacity must be between ${MIN_CAPACITY} and ${MAX_CAPACITY}` }, { status: 400 })
    }

    // Validate trailer URL if provided
    if (trailer_url) {
      try {
        new URL(trailer_url)
      } catch {
        return NextResponse.json({ error: 'Invalid trailer URL' }, { status: 400 })
      }
    }

    // Insert event
    const { data: event, error: insertError } = await supabase
      .from('events')
      .insert({
        creator_id: user.id,
        title: title.trim(),
        film_title: film_title.trim(),
        description: description.trim(),
        genre: genre || null,
        poster_url: poster_url || null,
        trailer_url: trailer_url || null,
        event_date: eventDate.toISOString(),
        location_name: location_name.trim(),
        location_address: location_address.trim(),
        location_city: location_city.trim(),
        max_capacity: capacity,
        ticket_type: 'free',
        ticket_price: 0,
        status: 'upcoming',
        current_attendees: 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Event creation error:', insertError)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    return NextResponse.json({ success: true, event })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event_id } = body

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Verify the event belongs to this user
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('id, creator_id')
      .eq('id', event_id)
      .single()

    if (fetchError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.creator_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own events' }, { status: 403 })
    }

    // Delete associated RSVPs first
    const { error: rsvpDeleteError } = await supabase
      .from('rsvps')
      .delete()
      .eq('event_id', event_id)

    if (rsvpDeleteError) {
      console.error('RSVP cleanup error:', rsvpDeleteError)
    }

    // Delete the event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', event_id)

    if (deleteError) {
      console.error('Event delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
