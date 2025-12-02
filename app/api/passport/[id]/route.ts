import { NextRequest, NextResponse } from 'next/server';
import { getPassport } from '@/lib/passport';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const passport = await getPassport(id);
    
    if (!passport) {
      return NextResponse.json({ error: 'Passport not found' }, { status: 404 });
    }

    return NextResponse.json({ passport });
  } catch (error: any) {
    console.error('Error fetching passport:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

