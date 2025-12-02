import { NextResponse } from 'next/server';
import { getCurrentCensus } from '@/lib/census';

export async function GET() {
  try {
    const census = await getCurrentCensus();
    return NextResponse.json(census);
  } catch (error: any) {
    console.error('Error fetching live census:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

