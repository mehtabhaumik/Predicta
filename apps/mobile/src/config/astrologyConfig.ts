export const ASTROLOGY_DEFAULTS = {
  ayanamsa: 'LAHIRI',
  houseSystem: 'WHOLE_SIGN',
  nodeType: 'TRUE_NODE',
  zodiac: 'SIDEREAL',
} as const;

export const ASTROLOGY_ENGINE = {
  timeoutMs: 12000,
  version: 'swiss-ephemeris-api-v0.1.0',
} as const;
