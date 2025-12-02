import { NextResponse } from 'next/server';
import { getCurrentCensus } from '@/lib/census';

export async function GET() {
  try {
    const census = await getCurrentCensus();
    return NextResponse.json({ demographics: census.demographics });
  } catch (error: any) {
    console.error('Error fetching demographics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

