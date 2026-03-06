module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  const gasUrl = process.env.GAS_URL;
  if (!gasUrl) {
    res.status(500).json({ ok: false, message: "GAS_URL is not configured" });
    return;
  }

  const body = typeof req.body === "string" ? safeParseJson(req.body) : req.body || {};
  const name = normalize(body.name);
  const email = normalize(body.email);
  const log = normalize(body.log);

  if (!name || !email || !log) {
    res.status(400).json({ ok: false, message: "Missing required fields: name, email, log" });
    return;
  }

  try {
    const gasResponse = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, log })
    });

    const text = await gasResponse.text();
    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { ok: false, message: text };
    }

    if (!gasResponse.ok || parsed.ok === false) {
      res.status(502).json({
        ok: false,
        message: parsed.message || `GAS responded with ${gasResponse.status}`
      });
      return;
    }

    res.status(200).json({ ok: true, message: "Saved to Google Sheet" });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Unknown proxy error"
    });
  }
};

function normalize(value) {
  return (value ?? "").toString().trim();
}

function safeParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
