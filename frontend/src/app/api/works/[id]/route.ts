import { getWorks } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const works = await getWorks();
    const work = works.find(w => w.id === params.id);
    
    if (!work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }
    
    return NextResponse.json(work);
  } catch (error) {
    console.error('Error fetching work:', error);
    return NextResponse.json({ error: 'Failed to fetch work' }, { status: 500 });
  }
}