import { NextResponse } from 'next/server';
import { getCensusStats } from '@/lib/census';

export async function GET() {
  try {
    const stats = await getCensusStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching census stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

