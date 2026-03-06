const SPREADSHEET_ID = "1uUH8IS9C64auxto1nv-GKmVzxItlX92NhyDe25xxntg";
const SHEET_NAME = "Test";

/**
 * Web App endpoint:
 * Receives { name, email, log } and appends to Google Sheet.
 */
function doPost(e) {
  try {
    const data = parseRequestData_(e);

    const name = normalize_(data.name);
    const email = normalize_(data.email);
    const log = normalize_(data.log);

    if (!name || !email || !log) {
      return jsonResponse_({
        ok: false,
        message: "Missing required fields: name, email, log"
      });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse_({
        ok: false,
        message: "Sheet not found: " + SHEET_NAME
      });
    }

    ensureHeader_(sheet, ["name", "email", "log"]);
    sheet.appendRow([name, email, log]);

    return jsonResponse_({
      ok: true,
      message: "Saved successfully"
    });
  } catch (err) {
    return jsonResponse_({
      ok: false,
      message: err && err.message ? err.message : String(err)
    });
  }
}

function parseRequestData_(e) {
  if (!e) return {};

  if (e.postData && e.postData.contents) {
    const raw = e.postData.contents;
    const type = String(e.postData.type || "").toLowerCase();

    if (type.indexOf("application/json") !== -1) {
      return JSON.parse(raw || "{}");
    }
  }

  return e.parameter || {};
}

function ensureHeader_(sheet, expected) {
  const current = sheet.getRange(1, 1, 1, expected.length).getValues()[0];
  const isEmpty = current.every(function(v) {
    return v === "" || v === null;
  });

  if (isEmpty) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
    return;
  }

  const normalizedCurrent = current.map(function(v) {
    return String(v).trim().toLowerCase();
  });
  const normalizedExpected = expected.map(function(v) {
    return String(v).toLowerCase();
  });

  const mismatch = normalizedCurrent.some(function(v, i) {
    return v !== normalizedExpected[i];
  });

  if (mismatch) {
    throw new Error("Header mismatch. Expected: " + expected.join(", "));
  }
}

function normalize_(value) {
  return (value == null ? "" : String(value)).trim();
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

