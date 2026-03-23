/**
 * renderTools — icon-grid version
 *
 * Each tool object in your majorData[major].tools array should have:
 *   { icon: "🔒", name: "Security Scanner", desc: "Finds vulnerabilities" }
 *
 * The icon appears large; the short name appears beneath it.
 * The desc is stored as a tooltip (title attribute) but hidden visually.
 *
 * Drop this function into app.js to replace the existing renderTools().
 */

function renderTools(tools) {
  const container = document.getElementById('sidebar-tools');
  container.innerHTML = '';

  if (!tools || tools.length === 0) {
    container.innerHTML = '<span class="sidebar-sublabel">No tools listed for this major.</span>';
    return;
  }

  tools.forEach(tool => {
    const tile = document.createElement('div');
    tile.className = 'sidebar-tool';
    tile.title = tool.desc || tool.name; // tooltip on hover

    tile.innerHTML = `
      <div class="sidebar-tool-icon">${tool.icon || '🛠️'}</div>
      <div class="sidebar-tool-name">${tool.name}</div>
    `;

    container.appendChild(tile);
  });
}

// ─────────────────────────────────────────────────────────────
// EXAMPLE: how to add icons to your existing majorData object
// ─────────────────────────────────────────────────────────────
//
// In your majorData (or wherever tools are defined), make sure
// each tool has an `icon` field, e.g.:
//
// cloud: {
//   tools: [
//     { icon: "☁️",  name: "AWS Console",    desc: "Manage cloud resources" },
//     { icon: "🐳",  name: "Docker",          desc: "Containerize apps" },
//     { icon: "🔁",  name: "CI/CD Pipeline",  desc: "Automate deployments" },
//     { icon: "📊",  name: "CloudWatch",       desc: "Monitor metrics" },
//   ],
// },
// cybersecurity: {
//   tools: [
//     { icon: "🔒", name: "Nmap",             desc: "Network scanner" },
//     { icon: "🧱", name: "Firewall Rules",   desc: "Access control" },
//     { icon: "🕵️", name: "Wireshark",        desc: "Packet analysis" },
//     { icon: "🔑", name: "Password Mgr",     desc: "Credential safety" },
//   ],
// },
