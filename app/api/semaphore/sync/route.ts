import { NextResponse } from 'next/server';
import { rebuildSemaphoreGroup } from '@/lib/semaphore-server';

export async function POST() {
  try {
    await rebuildSemaphoreGroup();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error syncing Semaphore group:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

