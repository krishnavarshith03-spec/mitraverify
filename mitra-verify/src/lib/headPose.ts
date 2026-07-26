/**
 * Shared head pose utility for MITRA VERIFY.
 * Normalizes yaw directions: RIGHT TURN = positive yaw, LEFT TURN = negative yaw.
 */

export interface HeadPoseData {
  rawYaw: number;
  correctedYaw: number;
  direction: 'LEFT' | 'RIGHT' | 'CENTER';
  magnitude: 'SMALL' | 'MEDIUM' | 'LARGE';
}

export function processHeadPose(yaw: number, rawYawInput?: number): HeadPoseData {
  // If rawYawInput is provided, use it. Otherwise, assume yaw is corrected and raw is -yaw.
  const correctedYaw = yaw;
  const rawYaw = rawYawInput !== undefined ? rawYawInput : -yaw;
  
  let direction: 'LEFT' | 'RIGHT' | 'CENTER' = 'CENTER';
  let magnitude: 'SMALL' | 'MEDIUM' | 'LARGE' = 'SMALL';
  
  if (correctedYaw > 12) {
    direction = 'RIGHT';
  } else if (correctedYaw < -12) {
    direction = 'LEFT';
  }
  
  const absYaw = Math.abs(correctedYaw);
  if (absYaw > 60) {
    magnitude = 'LARGE';
  } else if (absYaw > 30) {
    magnitude = 'MEDIUM';
  }
  
  return {
    rawYaw,
    correctedYaw,
    direction,
    magnitude,
  };
}
