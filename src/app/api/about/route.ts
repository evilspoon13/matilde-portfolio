import { getAbout } from '@/lib/notion';
import { NextResponse } from 'next/server';

export const revalidate = 600;

export async function GET() {
  try {
    const about = await getAbout();
    return NextResponse.json(about);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch about data' }, { status: 500 });
  }
}