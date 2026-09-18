import { getWorkById } from '@/lib/notion';
import { NextResponse } from 'next/server';

export const revalidate = 600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const work = await getWorkById(id);
    
    if (!work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }
    
    return NextResponse.json(work);
  } catch (error) {
    console.error('Error fetching work:', error);
    return NextResponse.json({ error: 'Failed to fetch work' }, { status: 500 });
  }
}