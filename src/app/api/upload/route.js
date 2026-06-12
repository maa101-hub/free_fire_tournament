import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString('base64');

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.error("IMGBB_API_KEY is not set in environment variables");
      return NextResponse.json({ error: 'Server configuration error (Missing API Key)' }, { status: 500 });
    }

    // Upload to ImgBB
    const imgbbData = new FormData();
    imgbbData.append('image', base64Image);

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbData,
    });

    const imgbbResult = await imgbbResponse.json();

    if (imgbbResult.success) {
      // Return the direct URL to the image hosted on ImgBB
      return NextResponse.json({ success: true, url: imgbbResult.data.url });
    } else {
      console.error('ImgBB Upload Error:', imgbbResult);
      return NextResponse.json({ error: 'Failed to upload image to cloud' }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
