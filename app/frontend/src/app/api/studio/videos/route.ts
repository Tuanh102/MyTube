export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    const search = searchParams.get('search') || '';

    try {
        let finalChannelId = channelId;

        // If no specific channel is selected, we need to find all channels of the user
        // and then get videos for all of them. 
        // For simplicity, let's just call the NestJS studio endpoint which we can enhance.
        
        let url = `http://127.0.0.1:5000/videos/studio?search=${search}&userId=${user.id}`;
        if (channelId && channelId !== 'all') {
            url += `&channelId=${channelId}`;
        } else {
            // Get all channels of user first
            const channelsRes = await fetch(`http://127.0.0.1:5000/channels?userId=${user.id}`, {
                cache: 'no-store'
            });
            const channels = await channelsRes.json();
            const channelIds = channels.map((c: any) => c._id).join(',');
            if (channelIds) {
                url += `&channelId=${channelIds}`;
            } else {
                return NextResponse.json([]); // No channels, no videos
            }
        }

        const res = await fetch(url, {
            cache: 'no-store'
        });
        const data = await res.json();
        
        // Map data to match what StudioPage expects if needed
        const formattedData = data.map((v: any) => ({
            ...v,
            video_id: v._id,
            channel_name: v.channel?.channel_name || 'Unknown',
            uploaded_at: v.createdAt
        }));

        return NextResponse.json(formattedData, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate'
            }
        });
    } catch (err: any) {
        console.error("Studio videos error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
