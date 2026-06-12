/**
 * Shared head pose utility for MITRA VERIFY.
 * Normalizes yaw directions: RIGHT TURN = positive yaw, LEFT TURN = negative yaw.
 */

export interface HeadPoseData {
  rawYaw: number;
  correctedYaw: number;
  direction: 'LEFT' | 'RIGHT' | 'CENTER';
}

export function processHeadPose(yaw: number, rawYawInput?: number): HeadPoseData {
  // If rawYawInput is provided, use it. Otherwise, assume yaw is corrected and raw is -yaw.
  const correctedYaw = yaw;
  const rawYaw = rawYawInput !== undefined ? rawYawInput : -yaw;
  
  let direction: 'LEFT' | 'RIGHT' | 'CENTER' = 'CENTER';
  if (correctedYaw > 12) {
    direction = 'RIGHT';
  } else if (correctedYaw < -12) {
    direction = 'LEFT';
  }
  
  return {
    rawYaw,
    correctedYaw,
    direction,
  };
}
