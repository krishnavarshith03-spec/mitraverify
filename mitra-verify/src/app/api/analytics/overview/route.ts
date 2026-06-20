import { NextResponse } from 'next/server';
import { verificationEvents } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const total = verificationEvents.length;
  let successful = 0;
  let failed = 0;
  let spoof = 0;
  let noFace = 0;
  let identityMatches = 0;
  let totalProcessingTime = 0;

  for (const event of verificationEvents) {
    totalProcessingTime += event.processingTimeMs;
    
    if (event.status === 'VERIFIED' || event.status === 'IDENTITY MATCHED') {
      successful++;
    } else if (event.status === 'SPOOF ATTEMPT') {
      spoof++;
    } else if (event.status === 'NO FACE DETECTED') {
      noFace++;
    } else {
      failed++;
    }

    if (event.identityMatchedFlag) {
      identityMatches++;
    }
  }

  const successRate = total > 0 ? (successful / total) * 100 : 0;
  const avgProcessingTime = total > 0 ? totalProcessingTime / total : 0;

  // We return active_api_keys mocked to 3 for now, as that's separate from verification events
  return NextResponse.json({
    data: {
      total_requests: total,
      successful_verifications: successful,
      failed_verifications: failed,
      no_face_detected: noFace,
      spoof_attempts: spoof,
      identity_matches: identityMatches,
      success_rate: successRate,
      avg_processing_time: avgProcessingTime,
      active_api_keys: 3,
    }
  });
}
