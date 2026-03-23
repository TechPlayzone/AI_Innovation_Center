// panels/generativePanel.js
// Handles text input, file upload, and Claude generation via Firebase backend

import { state } from "../state/sessionState.js";
import { generateWithClaude } from "../services/backendApi.js";

const SUPPORTED_TYPES = {
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
  "image/gif": "image",
  "application/pdf": "pdf",
  "text/plain": "text",
  "text/csv": "text",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

const ACCEPTED_EXTENSIONS = ".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.csv,.docx,.pptx,.xlsx";

let currentFile = null;
let isGenerating = false;

export function renderGenerativePanel(container) {
  const section = document.createElement("div");
  section.className = "workspace-section generative-section";
  section.id = "generative-section";
  section.innerHTML = `
    <div class="workspace-section-title">✨ Ask Claude</div>
    <p class="generative-hint">Type a question or upload a file — Claude will analyze it and display the response here.</p>

    <div class="generative-input-wrap">
      <textarea id="generative-input" placeholder="Type your question or describe what you want Claude to do with your file..." rows="3"></textarea>

      <div class="generative-file-wrap">
        <label for="generative-file" class="file-label" id="file-label">
          📎 Attach file
          <span class="file-types">PNG, JPG, PDF, TXT, CSV, DOCX, PPTX, XLSX</span>
        </label>
        <input type="file" id="generative-file" accept="${ACCEPTED_EXTENSIONS}" style="display:none" />
        <button class="file-clear-btn" id="file-clear-btn" style="display:none">✕ Remove</button>
      </div>

      <button class="generative-submit-btn" id="generative-submit-btn">
        ✨ Generate
      </button>
    </div>

    <div id="generative-output-area"></div>
  `;

  container.appendChild(section);
  wireGenerativePanel();
}

function wireGenerativePanel() {
  const fileInput    = document.getElementById("generative-file");
  const fileLabel    = document.getElementById("file-label");
  const fileClearBtn = document.getElementById("file-clear-btn");
  const submitBtn    = document.getElementById("generative-submit-btn");

  fileInput?.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const type = SUPPORTED_TYPES[file.type];
    if (!type) {
      showGenerativeError(`Unsupported file type: ${file.name}`);
      fileInput.value = "";
      return;
    }
    currentFile = file;
    fileLabel.innerHTML = `📄 ${file.name} <span class="file-types">${(file.size / 1024).toFixed(0)} KB</span>`;
    fileClearBtn.style.display = "inline-block";
  });

  fileClearBtn?.addEventListener("click", () => {
    currentFile = null;
    fileInput.value = "";
    fileLabel.innerHTML = `📎 Attach file <span class="file-types">PNG, JPG, PDF, TXT, CSV, DOCX, PPTX, XLSX</span>`;
    fileClearBtn.style.display = "none";
  });

  submitBtn?.addEventListener("click", async () => {
    if (isGenerating) return;
    const input = document.getElementById("generative-input");
    const prompt = input?.value.trim();
    if (!prompt && !currentFile) {
      showGenerativeError("Please type a question or attach a file.");
      return;
    }
    await runGeneration(prompt, currentFile);
  });
}

async function runGeneration(prompt, file) {
  isGenerating = true;
  const submitBtn = document.getElementById("generative-submit-btn");
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Generating..."; }

  try {
    const messages = await buildMessages(prompt, file);
    const text = await generateWithClaude(messages, state.majorKey || "general");
    addOutputCard(prompt, file?.name, text);
    const input = document.getElementById("generative-input");
    if (input) input.value = "";
  } catch (err) {
    showGenerativeError("Error: " + err.message);
  } finally {
    isGenerating = false;
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "✨ Generate"; }
  }
}

async function buildMessages(prompt, file) {
  const content = [];

  if (file) {
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

  content.push({ type: "text", text: prompt || "Please analyze this file and provide key insights." });
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
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || "Could not extract text from DOCX.";
  } catch (e) {
    return `[Could not read DOCX: ${e.message}]`;
  }
}

async function extractXlsx(file) {
  try {
    const XLSX = await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/xlsx.mjs");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    let text = "";
    workbook.SheetNames.forEach(name => {
      text += `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}\n\n`;
    });
    return text || "Could not extract text from file.";
  } catch (e) {
    return `[Could not read file: ${e.message}]`;
  }
}

function addOutputCard(prompt, fileName, response) {
  const area = document.getElementById("generative-output-area");
  if (!area) return;
  const card = document.createElement("div");
  card.className = "output-card";
  const title = prompt ? (prompt.length > 60 ? prompt.substring(0, 60) + "..." : prompt) : fileName || "Analysis";
  card.innerHTML = `
    <div class="output-card-header">
      <span class="output-card-title">✨ ${title}</span>
      <button class="output-copy-btn" title="Copy to clipboard">📋</button>
    </div>
    ${fileName ? `<div class="output-card-file">📄 ${fileName}</div>` : ""}
    <div class="output-card-body">${formatResponse(response)}</div>
  `;
  card.querySelector(".output-copy-btn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(response).then(() => {
      const btn = card.querySelector(".output-copy-btn");
      if (btn) { btn.textContent = "✅"; setTimeout(() => btn.textContent = "📋", 2000); }
    });
  });
  area.insertBefore(card, area.firstChild);
}

function formatResponse(text) {
  return text
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

function showGenerativeError(msg) {
  const area = document.getElementById("generative-output-area");
  if (!area) return;
  const err = document.createElement("div");
  err.className = "generative-error";
  err.textContent = msg;
  area.insertBefore(err, area.firstChild);
  setTimeout(() => err.remove(), 5000);
}
