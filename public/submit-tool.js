const form = document.getElementById("submitToolForm");
const submitBtn = document.getElementById("submitToolBtn");
const statusEl = document.getElementById("submitToolStatus");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#9b1c1c" : "#2a4f68";
}

function readPayload() {
  const data = new FormData(form);
  return {
    tool_name: String(data.get("tool_name") || "").trim(),
    website_url: String(data.get("website_url") || "").trim(),
    category: String(data.get("category") || "").trim(),
    tags: String(data.get("tags") || "").trim(),
    description: String(data.get("description") || "").trim(),
    submitter_name: String(data.get("submitter_name") || "").trim(),
    submitter_email: String(data.get("submitter_email") || "").trim(),
    website: String(data.get("website") || "").trim(), // Honeypot
  };
}

async function submitForm(event) {
  event.preventDefault();
  const payload = readPayload();
  if (payload.description.length < 30) {
    setStatus("Description must be at least 30 characters.", true);
    return;
  }

  submitBtn.disabled = true;
  setStatus("Submitting...");
  try {
    const response = await fetch("/api/tool-submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(json.error || "Could not submit right now. Please try again.", true);
      return;
    }
    form.reset();
    setStatus("Submission received. We will review it.");
  } catch (_) {
    setStatus("Network error. Please try again.", true);
  } finally {
    submitBtn.disabled = false;
  }
}

form?.addEventListener("submit", submitForm);
