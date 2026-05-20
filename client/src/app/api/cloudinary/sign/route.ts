import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    console.log('Cloudinary Sign Request received');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Defined' : 'UNDEFINED');
    
    const { paramsToSign } = await req.json();

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error('Cloudinary sign error:', error);
    return NextResponse.json({ error: 'Failed to sign request' }, { status: 500 });
  }
}
