import { useState, useCallback } from 'react';

/**
 * Shared hook for managing demo state flags across demo pages (basic, advanced, enterprise).
 * Provides boolean flags and setters for face preparation and challenge progress.
 */
export function useDemoState() {
  const [isFacePrepared, setIsFacePrepared] = useState(false);
  const [hasBlinked, setHasBlinked] = useState(false);
  const [hasMovedMouth, setHasMovedMouth] = useState(false);
  const [hasRotatedHead, setHasRotatedHead] = useState(false);
  const [hasRaisedEyebrows, setHasRaisedEyebrows] = useState(false);
  const [hasSmiled, setHasSmiled] = useState(false);
  const [hasLookedUp, setHasLookedUp] = useState(false);

  // Reset all flags (useful when restarting a session)
  const resetAll = useCallback(() => {
    setIsFacePrepared(false);
    setHasBlinked(false);
    setHasMovedMouth(false);
    setHasRotatedHead(false);
    setHasRaisedEyebrows(false);
    setHasSmiled(false);
    setHasLookedUp(false);
  }, []);

  return {
    isFacePrepared,
    setIsFacePrepared,
    hasBlinked,
    setHasBlinked,
    hasMovedMouth,
    setHasMovedMouth,
    hasRotatedHead,
    setHasRotatedHead,
    hasRaisedEyebrows,
    setHasRaisedEyebrows,
    hasSmiled,
    setHasSmiled,
    hasLookedUp,
    setHasLookedUp,
    resetAll,
  };
}
