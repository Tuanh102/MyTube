import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.API_Key,
  api_secret: process.env['API Secret'] || process.env.API_SECRET,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paramsToSign } = await request.json();
    
    // Create signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.API_SECRET || ''
    );


    return NextResponse.json({ 
      signature, 
      apiKey: process.env.API_Key,
      cloudName: process.env.Cloud_Name
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
