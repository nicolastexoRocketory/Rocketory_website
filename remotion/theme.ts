export const colors = {
  ink: '#0A0F1E',
  cream: '#F5F4F0',
  muted: 'rgba(245,244,240,0.58)',
  red: '#c1272d',
  orange: '#ff5c00',
  gradient: 'linear-gradient(135deg, #c1272d 0%, #ff5c00 100%)',
} as const

function timeline(items: Record<string, number>) {
  let from = 0
  const scenes = {} as Record<string, { from: number; duration: number }>

  for (const [id, duration] of Object.entries(items)) {
    scenes[id] = { from, duration }
    from += duration
  }

  return { scenes, durationInFrames: from }
}

/** 230 s @ 30fps, Cuts an ElevenLabs-VO (Pausen) */
const built = timeline({
  qWhySame: 189,
  explain1: 187,
  logo: 408,
  qWhatFor: 143,
  explain2: 132,
  leads: 368,
  qWhyFail: 94,
  problem: 359,
  explain3: 203,
  promise: 99,
  explain4: 357,
  qWhatWeDo: 145,
  offer: 650,
  explain5: 129,
  qWhyUs: 154,
  why: 276,
  usps: 445,
  explain6: 354,
  qProof: 187,
  exHandwerk: 342,
  explain7: 344,
  exPhoto: 292,
  explain8: 136,
  exCustom: 363,
  explain9: 130,
  team: 96,
  qNext: 108,
  cta: 210,
})

export const SCENES = built.scenes

export const VIDEO = {
  fps: 30,
  width: 1920,
  height: 1080,
  durationInFrames: built.durationInFrames,
} as const
