import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event_id } = body

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Fetch event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'upcoming') {
      return NextResponse.json({ error: 'This event is no longer accepting RSVPs' }, { status: 400 })
    }

    // Check for existing RSVP
    const { data: existingRsvp } = await supabase
      .from('rsvps')
      .select('id, status')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single()

    if (existingRsvp) {
      return NextResponse.json({ error: 'You have already RSVP\'d to this event' }, { status: 400 })
    }

    // Check capacity
    if (event.current_attendees >= event.max_capacity) {
      return NextResponse.json({ error: 'This event is full' }, { status: 400 })
    }

    // Create RSVP
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .insert({
        event_id,
        user_id: user.id,
        status: 'confirmed',
      })
      .select()
      .single()

    if (rsvpError) {
      console.error('RSVP creation error:', rsvpError)
      return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 })
    }

    // Increment attendees
    const { error: incError } = await supabase.rpc('increment_attendees', {
      event_uuid: event_id,
    })

    if (incError) {
      console.error('Increment error:', incError)
    }

    return NextResponse.json({ success: true, rsvp })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event_id } = body

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // Find user's RSVP
    const { data: rsvp, error: findError } = await supabase
      .from('rsvps')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single()

    if (findError || !rsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 })
    }

    // Delete RSVP
    const { error: deleteError } = await supabase
      .from('rsvps')
      .delete()
      .eq('id', rsvp.id)

    if (deleteError) {
      console.error('RSVP delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to cancel RSVP' }, { status: 500 })
    }

    // Decrement attendees
    const { error: decError } = await supabase.rpc('decrement_attendees', {
      event_uuid: event_id,
    })

    if (decError) {
      console.error('Decrement error:', decError)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
