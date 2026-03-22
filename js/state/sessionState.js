// state/sessionState.js
// Shared source of truth for the entire app

export const state = {
  // Session phase
  phase: "idle", // idle | starting | connecting-avatar | connecting-voice | active | speaking | listening | stopping | ended | error

  // Selected major
  majorKey: "general",

  // Connection flags
  sessionActive: false,
  isStarting: false,
  isStopping: false,
  shouldReconnectEl: false,

  // Audio state
  isSpeaking: false,
  micMuted: false,
  elOutputRate: 16000,
  audioQueue: [],
  isFlushingQueue: false,
  eventIdCounter: 0,

  // Token prefetch
  prefetchedToken: null,

  // Transcript
  transcript: [],
  MAX_TRANSCRIPT_MESSAGES: 100,
};

export function setPhase(phase) {
  state.phase = phase;
}

export function resetAudioState() {
  state.audioQueue = [];
  state.isFlushingQueue = false;
  state.isSpeaking = false;
  state.micMuted = false;
}

export function nextEventId() {
  return String(++state.eventIdCounter);
}
