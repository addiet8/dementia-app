import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('memory-photos')
      .upload(fileName, file, {
        upsert: true
      })

    if (error) {
      console.error('Upload error:', error)
      // Check if bucket doesn't exist
      if (error.message.includes('Bucket not found')) {
        return NextResponse.json({ error: 'Storage bucket not found. Please create "memory-photos" bucket in Supabase.' }, { status: 500 })
      }
      return NextResponse.json({ error: `Failed to upload file: ${error.message}` }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('memory-photos')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}