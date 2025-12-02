import { NextRequest, NextResponse } from 'next/server';
import { updatePassportAttributes } from '@/lib/passport';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { attributes } = body;

    if (!attributes || typeof attributes !== 'object') {
      return NextResponse.json({ error: 'Invalid attributes' }, { status: 400 });
    }

    await updatePassportAttributes(id, attributes);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating passport attributes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

