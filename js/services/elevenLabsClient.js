// services/elevenLabsClient.js
// Frontend adapter for ElevenLabs conversational voice
// Mic stays open always — no muting during Wayne's speech

import { MAJORS } from "../config/majors.js";
import { resamplePCM, base64ToInt16, int16ToBase64 } from "../utils/audioUtils.js";
import { hgSend } from "./heygenClient.js";
import { addTranscriptMessage, correctLastAgentMessage } from "../panels/transcriptPanel.js";
import { setWayneStatus } from "../panels/waynePanel.js";
import { state, resetAudioState, nextEventId } from "../state/sessionState.js";

const EL_AGENT_ID = "agent_5801khhgn69gfg6b9zga764yhhv9";

let elWs = null;
let micStream = null;
let micProcessor = null;
let micContext = null;
let reconnectTimer = null;

function bridgeAudio(audioBase64) {
  const pcmOriginal = base64ToInt16(audioBase64);
  const pcm24k = resamplePCM(pcmOriginal, state.elOutputRate, 24000);
  const b64_24k = int16ToBase64(pcm24k);
  state.audioQueue.push(b64_24k);
  if (!state.isFlushingQueue) flushAudioQueue();
}

function flushAudioQueue() {
  if (state.audioQueue.length === 0) {
    state.isFlushingQueue = false;
    return;
  }
  state.isFlushingQueue = true;
  const chunk = state.audioQueue.shift();
  hgSend({ type: "agent.speak", event_id: nextEventId(), audio: chunk });
  setTimeout(flushAudioQueue, 20);
}

export async function startMicrophone() {
  micStream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }
  });
  micContext = new AudioContext({ sampleRate: 16000 });
  const source = micContext.createMediaStreamSource(micStream);
  micProcessor = micContext.createScriptProcessor(4096, 1, 1);
  micProcessor.onaudioprocess = (e) => {
    if (!elWs || elWs.readyState !== WebSocket.OPEN) return;
    const float32 = e.inputBuffer.getChannelData(0);
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    elWs.send(JSON.stringify({ user_audio_chunk: int16ToBase64(int16) }));
  };
  source.connect(micProcessor);
  micProcessor.connect(micContext.destination);
  console.log("[ElevenLabs Client] Microphone started — always open");
}

export function stopMicrophone() {
  if (micProcessor) { micProcessor.disconnect(); micProcessor = null; }
  if (micContext) { micContext.close(); micContext = null; }
  if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
}

export function clearReconnectTimer() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
}

function scheduleElReconnect(majorKey) {
  if (!state.shouldReconnectEl || !state.sessionActive || state.isStopping) return;
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (!state.shouldReconnectEl || !state.sessionActive || state.isStopping) return;
    try {
      setWayneStatus("Voice dropped. Reconnecting...");
      await connectElevenLabs(majorKey);
    } catch (err) {
      console.log("[ElevenLabs Client] Reconnect failed: " + err?.message);
      scheduleElReconnect(majorKey);
    }
  }, 2000);
}

export function connectElevenLabs(majorKey) {
  const major = MAJORS[majorKey] || MAJORS.general;

  return new Promise((resolve, reject) => {
    const url = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${EL_AGENT_ID}`;
    const ws = new WebSocket(url);
    let settled = false;

    ws.onopen = () => {
      elWs = ws;
      console.log("[ElevenLabs Client] WebSocket connected");
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: "conversation_initiation_client_data",
          conversation_config_override: {
            agent: {
              prompt: {
                prompt: `You are Wayne, an AI Field Guide for Hillsborough College students. ${major.prompt} Keep all responses concise — 2 to 3 sentences maximum. Be concise and practical. Ask one question at a time.`
              },
              first_message: major.firstMessage
            }
          }
        }));
        console.log("[ElevenLabs Client] Major context sent: " + majorKey);
        if (!settled) { settled = true; resolve(); }
      }, 0);
    };

    ws.onerror = (err) => {
      console.log("[ElevenLabs Client] WS error");
      if (!settled) { settled = true; reject(err); }
    };

    ws.onclose = (e) => {
      if (elWs === ws) elWs = null;
      console.log(`[ElevenLabs Client] WS closed: ${e.code} ${e.reason}`);
      if (state.isSpeaking) { hgSend({ type: "agent.speak_end" }); state.isSpeaking = false; }
      if (!settled) {
        settled = true;
        reject(new Error(`ElevenLabs closed before ready: ${e.code}`));
        return;
      }
      if (e.code !== 1000 && state.shouldReconnectEl && state.sessionActive && !state.isStopping) {
        scheduleElReconnect(majorKey);
      } else {
        setWayneStatus("Voice disconnected.");
      }
    };

    ws.onmessage = (evt) => {
      let msg;
      try { msg = JSON.parse(evt.data); } catch { return; }

      switch (msg.type) {
        case "conversation_initiation_metadata": {
          const meta = msg.conversation_initiation_metadata_event;
          const fmt = meta.agent_output_audio_format || "pcm_16000";
          const rate = parseInt(fmt.replace("pcm_", ""));
          if (!isNaN(rate)) state.elOutputRate = rate;
          setWayneStatus("Connected! Speak to Wayne anytime.");
          addTranscriptMessage("system", "Session started. Wayne is ready — speak or click a question.");
          hgSend({ type: "agent.start_listening" });
          break;
        }
        case "ping": {
          const eventId = msg.ping_event?.event_id;
          if (eventId !== undefined && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "pong", event_id: eventId }));
          }
          break;
        }
        case "audio": {
          const audioB64 = msg.audio_event?.audio_base_64;
          if (audioB64) {
            if (!state.isSpeaking) {
              state.isSpeaking = true;
              hgSend({ type: "agent.stop_listening" });
              setWayneStatus("Wayne is speaking... (you can interrupt anytime)");
            }
            bridgeAudio(audioB64);
          }
          break;
        }
        case "user_transcript": {
          const text = msg.user_transcription_event?.user_transcript;
          if (text) addTranscriptMessage("user", text);
          break;
        }
        case "agent_response": {
          const text = msg.agent_response_event?.agent_response;
          if (text) addTranscriptMessage("agent", text);
          break;
        }
        case "agent_response_correction": {
          const text = msg.agent_response_correction_event?.corrected_agent_response;
          if (text) correctLastAgentMessage(text);
          break;
        }
        case "interruption": {
          state.audioQueue = [];
          state.isFlushingQueue = false;
          hgSend({ type: "agent.interrupt" });
          hgSend({ type: "agent.start_listening" });
          state.isSpeaking = false;
          setWayneStatus("Listening...");
          break;
        }
        case "agent_response_end":
        case "turn_end": {
          if (state.isSpeaking) {
            const waitForQueue = () => {
              if (state.audioQueue.length === 0 && !state.isFlushingQueue) {
                hgSend({ type: "agent.speak_end" });
                hgSend({ type: "agent.start_listening" });
                state.isSpeaking = false;
                setWayneStatus("Listening...");
              } else {
                setTimeout(waitForQueue, 30);
              }
            };
            waitForQueue();
          }
          break;
        }
        default:
          console.log("[ElevenLabs Client] event: " + msg.type);
      }
    };
  });
}

export function disconnectElevenLabs() {
  clearReconnectTimer();
  if (elWs) {
    try { elWs.close(1000, "Session cleanup"); } catch (e) {}
    elWs = null;
  }
}

export function sendTextToWayne(text) {
  if (!elWs || elWs.readyState !== WebSocket.OPEN) {
    console.log("[ElevenLabs Client] Cannot send text — WebSocket not open");
    return;
  }
  elWs.send(JSON.stringify({
    type: "user_message",
    text: text
  }));
  console.log("[ElevenLabs Client] Text sent to Wayne: " + text);
}

export function getMicStream() {
  return micStream;
}
