import { getExperience } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const experience = await getExperience();
    return NextResponse.json(experience);
  } catch (error) {
    console.error('Error in /api/experience:', error);
    return NextResponse.json({ error: 'Failed to fetch experience data', details: error }, { status: 500 });
  }
}