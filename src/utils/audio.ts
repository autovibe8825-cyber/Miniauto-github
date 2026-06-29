/**
 * High-fidelity pure Web Audio API sound generators
 * These work out-of-the-box in standard modern browsers without external audio requests.
 */

let sharedAudioCtx: AudioContext | null = null;

// Safe helper to get or initialize a single, shared AudioContext
export function getSharedAudioContext(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    
    // Resume context if suspended (common browser policy for security)
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    
    return sharedAudioCtx;
  } catch (e) {
    console.warn('Web Audio API is not supported or was blocked by browser policies.', e);
    return null;
  }
}

/**
 * Play a professional high-pitch notification cascade for admin order occurrences
 */
export function playChimeSound() {
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Note 1: E5
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(659.25, now); // E5
  osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6
  
  gain1.gain.setValueAtTime(0.15, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.4);

  // Note 2: G6 (slightly delayed for beautiful arpeggio)
  setTimeout(() => {
    // Re-check context state inside setTimeout safely
    if (!ctx || ctx.state === 'closed') return;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1567.98, ctx.currentTime); // G6
    osc2.frequency.exponentialRampToValueAtTime(3135.96, ctx.currentTime + 0.25); // G7
    
    gain2.gain.setValueAtTime(0.12, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.6);
  }, 120);
}

/**
 * Play a quick satisfying tactile click/bubble chirp for UI actions (add to cart, heart wishlist, claim voucher)
 */
export function playSuccessClick() {
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
  
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}
