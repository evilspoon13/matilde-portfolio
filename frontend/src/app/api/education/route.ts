import { getEducation } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const education = await getEducation();
    return NextResponse.json(education);
  } catch (error) {
    console.error('Error in /api/education:', error);
    return NextResponse.json({ error: 'Failed to fetch education data', details: error }, { status: 500 });
  }
}