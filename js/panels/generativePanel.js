// panels/generativePanel.js v6.0
// Chat-style center panel — Ask Claude hero

import { state } from "../state/sessionState.js";
import { generateWithClaude } from "../services/backendApi.js";

const SUPPORTED_TYPES = {
  "image/png": "image", "image/jpeg": "image",
  "image/webp": "image", "image/gif": "image",
  "application/pdf": "pdf",
  "text/plain": "text", "text/csv": "text",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

let pendingFiles = []; // files attached but not yet sent
let isGenerating = false;

export function initGenerativePanel() {
  const dropZoneInput = document.getElementById("claude-file-input");
  const attachInput   = document.getElementById("chat-file-attach");
  const sendBtn       = document.getElementById("chat-send-btn");
  const chatInput     = document.getElementById("chat-input");

  // File from drop zone
  dropZoneInput?.addEventListener("change", () => handleFileAdd(dropZoneInput.files[0]));

  // File from attach button in input bar
  attachInput?.addEventListener("change", () => handleFileAdd(attachInput.files[0]));

  // Send on button click
  sendBtn?.addEventListener("click", () => handleSend());

  // Send on Enter (Shift+Enter for newline)
  chatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-resize textarea
  chatInput?.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
  });
}

function handleFileAdd(file) {
  if (!file) return;
  const type = SUPPORTED_TYPES[file.type];
  if (!type) {
    addErrorMessage(`Unsupported file type: ${file.name}`);
    return;
  }
  pendingFiles.push(file);
  renderFileChips();
}

function renderFileChips() {
  const chips = document.getElementById("file-chips");
  if (!chips) return;
  chips.innerHTML = pendingFiles.map((f, i) => `
    <div class="file-chip">
      <span>${getFileEmoji(f)} ${f.name}</span>
      <span class="file-chip-remove" data-index="${i}">✕</span>
    </div>
  `).join("");

  chips.querySelectorAll(".file-chip-remove").forEach(el => {
    el.addEventListener("click", () => {
      pendingFiles.splice(parseInt(el.dataset.index), 1);
      renderFileChips();
    });
  });
}

function getFileEmoji(file) {
  const type = SUPPORTED_TYPES[file.type];
  if (type === "image") return "🖼️";
  if (type === "pdf") return "📄";
  if (type === "docx" || type === "pptx") return "📝";
  if (type === "xlsx") return "📊";
  return "📁";
}

async function handleSend() {
  if (isGenerating) return;
  const chatInput = document.getElementById("chat-input");
  const prompt = chatInput?.value.trim();

  if (!prompt && pendingFiles.length === 0) return;

  // Add user message to chat
  const files = [...pendingFiles];
  pendingFiles = [];
  renderFileChips();

  addUserMessage(prompt, files);
  if (chatInput) { chatInput.value = ""; chatInput.style.height = "auto"; }

  // Show thinking indicator
  const thinkingId = addThinkingMessage();

  isGenerating = true;
  try {
    const messages = await buildMessages(prompt, files);
    const text = await generateWithClaude(messages, state.majorKey || "general");
    removeMessage(thinkingId);
    addClaudeMessage(text);
  } catch (err) {
    removeMessage(thinkingId);
    addErrorMessage("Error: " + err.message);
  } finally {
    isGenerating = false;
  }
}

function addUserMessage(prompt, files) {
  const messages = document.getElementById("chat-messages");
  if (!messages) return;

  const div = document.createElement("div");
  div.className = "chat-msg user";
  div.innerHTML = `
    <div class="chat-avatar user-avatar">👤</div>
    <div>
      <div class="chat-sender">You</div>
      ${files.map(f => `<div class="chat-file-card">${getFileEmoji(f)} ${f.name}</div>`).join("")}
      ${prompt ? `<div class="chat-bubble">${escapeHtml(prompt)}</div>` : ""}
    </div>
  `;
  messages.appendChild(div);
  scrollToBottom();
}

function addClaudeMessage(text) {
  const messages = document.getElementById("chat-messages");
  if (!messages) return;

  const div = document.createElement("div");
  div.className = "chat-msg claude";
  div.innerHTML = `
    <div class="chat-avatar claude-avatar">A</div>
    <div>
      <div class="chat-sender">Claude</div>
      <div class="chat-bubble">${formatResponse(text)}</div>
    </div>
  `;
  messages.appendChild(div);
  scrollToBottom();
}

function addThinkingMessage() {
  const messages = document.getElementById("chat-messages");
  if (!messages) return null;

  const id = "thinking-" + Date.now();
  const div = document.createElement("div");
  div.className = "chat-msg claude";
  div.id = id;
  div.innerHTML = `
    <div class="chat-avatar claude-avatar">A</div>
    <div>
      <div class="chat-sender">Claude</div>
      <div class="chat-bubble">
        <div class="chat-thinking">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
  messages.appendChild(div);
  scrollToBottom();
  return id;
}

function removeMessage(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

function addErrorMessage(text) {
  const messages = document.getElementById("chat-messages");
  if (!messages) return;
  const div = document.createElement("div");
  div.className = "chat-error";
  div.textContent = text;
  messages.appendChild(div);
  scrollToBottom();
  setTimeout(() => div.remove(), 6000);
}

function scrollToBottom() {
  const messages = document.getElementById("chat-messages");
  if (messages) messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

function formatResponse(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^### (.*$)/gm, "<h4>$1</h4>")
    .replace(/^## (.*$)/gm, "<h3>$1</h3>")
    .replace(/^# (.*$)/gm, "<h3>$1</h3>")
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");
}

async function buildMessages(prompt, files) {
  const content = [];

  for (const file of files) {
    const type = SUPPORTED_TYPES[file.type];
    if (type === "image") {
      const base64 = await fileToBase64(file);
      content.push({ type: "image", source: { type: "base64", media_type: file.type, data: base64 } });
    } else if (type === "pdf") {
      const base64 = await fileToBase64(file);
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } });
    } else if (type === "text") {
      const text = await file.text();
      content.push({ type: "text", text: `File: ${file.name}\n\n${text}` });
    } else if (type === "docx") {
      const text = await extractDocx(file);
      content.push({ type: "text", text: `Document: ${file.name}\n\n${text}` });
    } else if (type === "xlsx" || type === "pptx") {
      const text = await extractXlsx(file);
      content.push({ type: "text", text: `File: ${file.name}\n\n${text}` });
    }
  }

  content.push({ type: "text", text: prompt || "Please analyze the uploaded file(s) and provide key insights." });
  return [{ role: "user", content }];
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractDocx(file) {
  try {
    const mammoth = await import("https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.esm.js");
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value || "Could not extract text.";
  } catch (e) { return `[Could not read DOCX: ${e.message}]`; }
}

async function extractXlsx(file) {
  try {
    const XLSX = await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/xlsx.mjs");
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    let text = "";
    workbook.SheetNames.forEach(name => {
      text += `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}\n\n`;
    });
    return text || "Could not extract text.";
  } catch (e) { return `[Could not read file: ${e.message}]`; }
}
