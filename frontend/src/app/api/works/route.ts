import { getWorks } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const works = await getWorks();
    return NextResponse.json(works);
  } catch (error) {
    console.error('Error in /api/works:', error);
    return NextResponse.json({ error: 'Failed to fetch works' }, { status: 500 });
  }
}