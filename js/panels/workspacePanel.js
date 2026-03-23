// panels/workspacePanel.js v6.0
// Renders left sidebar: AI tools + suggested questions

import { WORKSPACE_CONTENT } from "../config/workspaceContent.js";
import { sendTextToWayne } from "../services/elevenLabsClient.js";
import { addTranscriptMessage } from "./transcriptPanel.js";
import { state } from "../state/sessionState.js";

export function initWorkspacePanel() {
  // Show empty state — user must select a major
  renderMajorWorkspace("general");
}

export function renderMajorWorkspace(majorKey) {
  const content = WORKSPACE_CONTENT[majorKey] || WORKSPACE_CONTENT.general;

  // Render tools
  const toolsContainer = document.getElementById("sidebar-tools");
  if (toolsContainer) {
    toolsContainer.innerHTML = content.tools.map(t => `
      <div class="sidebar-tool">
        <div>
          <div class="sidebar-tool-name">${t.name}</div>
          <div class="sidebar-tool-desc">${t.desc}</div>
        </div>
      </div>
    `).join("");
  }

  // Render suggested questions
  const questionsContainer = document.getElementById("sidebar-questions");
  if (questionsContainer) {
    questionsContainer.innerHTML = content.suggestedQuestions.map(q => `
      <div class="sidebar-question disabled" data-question="${q}">${q}</div>
    `).join("");

    questionsContainer.querySelectorAll(".sidebar-question").forEach(el => {
      el.addEventListener("click", () => {
        if (!state.sessionActive) return;
        sendTextToWayne(el.dataset.question);
        addTranscriptMessage("user", el.dataset.question, true);
        setWayneStatus(`You asked: "${el.dataset.question}"`);
      });
    });
  }
}

export function enableSuggestedQuestions() {
  const hint = document.getElementById("ask-wayne-hint");
  if (hint) hint.textContent = "Click any question — Wayne will answer out loud.";
  document.querySelectorAll(".sidebar-question").forEach(el => el.classList.remove("disabled"));
}

export function disableSuggestedQuestions() {
  const hint = document.getElementById("ask-wayne-hint");
  if (hint) hint.textContent = "Start a session to ask Wayne these questions.";
  document.querySelectorAll(".sidebar-question").forEach(el => el.classList.add("disabled"));
}

function setWayneStatus(text) {
  const el = document.getElementById("status");
  if (el) el.textContent = text;
}
