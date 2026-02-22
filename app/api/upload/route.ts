import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are allowed' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${user.id}/${crypto.randomUUID()}.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('posters')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('posters')
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
