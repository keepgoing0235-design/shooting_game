const UPLOAD_ENDPOINT = "/api/log";

export class LogService {
  constructor(getPlayer) {
    this.getPlayer = getPlayer;
    this.queue = [];
    this.isUploading = false;
    this.lastSyncAt = null;
  }

  add(eventName, details = "") {
    const stamp = new Date().toISOString();
    const detailText = details ? ` | ${details}` : "";
    this.queue.push(`${stamp} | ${eventName}${detailText}`);
  }

  get pendingCount() {
    return this.queue.length;
  }

  async flush() {
    if (this.isUploading || this.queue.length === 0) {
      return { ok: true, skipped: true, pending: this.queue.length };
    }

    const player = this.getPlayer();
    if (!player.username || !player.email) {
      return { ok: false, message: "Player info missing", pending: this.queue.length };
    }

    const batch = this.queue.join("\n");
    this.isUploading = true;

    try {
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: player.username,
          email: player.email,
          log: batch
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed (${response.status}): ${text}`);
      }

      const payload = await response.json();
      if (!payload.ok) {
        throw new Error(payload.message || "Upload rejected");
      }

      this.queue = [];
      this.lastSyncAt = new Date();
      return { ok: true, skipped: false, pending: 0 };
    } finally {
      this.isUploading = false;
    }
  }
}

