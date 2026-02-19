const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("contactSubmitBtn");
const statusEl = document.getElementById("contactStatus");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#9b1c1c" : "#2a4f68";
}

function readPayload() {
  const data = new FormData(form);
  return {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    subject: String(data.get("subject") || "").trim(),
    message: String(data.get("message") || "").trim(),
    website: String(data.get("website") || "").trim(), // Honeypot
  };
}

async function submitForm(event) {
  event.preventDefault();
  const payload = readPayload();
  if (payload.message.length < 20) {
    setStatus("Please provide a slightly longer message.", true);
    return;
  }

  submitBtn.disabled = true;
  setStatus("Sending...");
  try {
    const response = await fetch("/api/contact-submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(json.error || "Could not send message. Please try again.", true);
      return;
    }
    form.reset();
    setStatus("Message sent. Thank you.");
  } catch (_) {
    setStatus("Network error. Please try again.", true);
  } finally {
    submitBtn.disabled = false;
  }
}

form?.addEventListener("submit", submitForm);
