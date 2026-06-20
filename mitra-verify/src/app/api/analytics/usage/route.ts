import { NextResponse } from 'next/server';
import { verificationEvents } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Map the internal store events to the format expected by the frontend's usage bucket processor
  const data = verificationEvents.map(event => {
    let resultStr = 'fail';
    
    if (event.status === 'VERIFIED' || event.status === 'IDENTITY MATCHED') {
      resultStr = 'pass';
    } else if (event.status === 'SPOOF ATTEMPT') {
      resultStr = 'spoof';
    } else if (event.status === 'NO FACE DETECTED') {
      resultStr = 'no_face_detected';
    }

    return {
      date: event.timestamp,
      result: resultStr,
      type: event.apiType,
    };
  });

  return NextResponse.json({ data });
}
