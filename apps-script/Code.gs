const SPREADSHEET_ID = "1aFIU2jrwxzmyR5cJxAP0Zx0JJGq66U6mFpFhhAgK9Ac";
const SHEET_ID = 274155366;

const TIME_SLOTS = [
  { label: "9-10 AM", hours: [9] },
  { label: "10-11 AM", hours: [10] },
  { label: "11 AM-12 PM", hours: [11] },
  { label: "12-1 PM", hours: [12] },
  { label: "1-2 PM", hours: [13, 1] },
  { label: "2-3 PM", hours: [14, 2] },
  { label: "3-4 PM", hours: [15, 3] },
  { label: "4-5 PM", hours: [16, 4] },
];

function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Educator Availability - EdTech-a-thon")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

/** Returns educator availability from the configured form-response sheet. */
function getEducators() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets().find(
    (candidate) => candidate.getSheetId() === SHEET_ID,
  );

  if (!sheet) {
    throw new Error(`Spreadsheet tab ${SHEET_ID} was not found.`);
  }

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) {
    return { educators: [], slots: TIME_SLOTS.map((slot) => slot.label) };
  }

  const headers = values[0].map((header) => String(header).trim());
  const nameColumn = findColumn(headers, /(^|\b)(name|educator)(\b|$)/i);
  const emailColumn = findColumn(headers, /e-?mail/i);
  const slotColumns = TIME_SLOTS.map((slot) => findSlotColumn(headers, slot));

  if (nameColumn === -1) {
    throw new Error("Could not find an educator name column in the first row.");
  }

  if (slotColumns.every((column) => column === -1)) {
    throw new Error(
      "Could not find availability columns. Expected headers containing times from 9 AM through 5 PM.",
    );
  }

  const educators = values.slice(1).flatMap((row) => {
    const name = String(row[nameColumn] || "").trim();
    if (!name) return [];

    return [
      {
        name,
        email: emailColumn === -1 ? "" : String(row[emailColumn] || "").trim(),
        avail: slotColumns.map((column) =>
          column === -1 ? "" : parseDays(row[column]),
        ),
      },
    ];
  });

  return {
    educators,
    slots: TIME_SLOTS.map((slot) => slot.label),
    updatedAt: Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "MMM d, yyyy h:mm a z",
    ),
  };
}

function findColumn(headers, pattern) {
  return headers.findIndex((header) => pattern.test(header));
}

function findSlotColumn(headers, slot) {
  return headers.findIndex((header) => {
    const normalized = normalize(header);
    if (!/(available|availability|time|am|pm|\d)/i.test(normalized)) return false;

    return slot.hours.some((hour) => {
      const hourPattern = new RegExp(`(^|[^0-9])0?${hour}(?=[: .-]|am|pm|$)`, "i");
      return hourPattern.test(normalized);
    });
  });
}

function parseDays(value) {
  const text = normalize(value);
  const days = [];

  if (/\b(mon|monday)\b|\b(june|july)\s*20\b|\b20\s*(june|july)\b/i.test(text)) {
    days.push("M");
  }
  if (/\b(tue|tues|tuesday)\b|\b(june|july)\s*21\b|\b21\s*(june|july)\b/i.test(text)) {
    days.push("T");
  }
  if (/\b(wed|weds|wednesday)\b|\b(june|july)\s*22\b|\b22\s*(june|july)\b/i.test(text)) {
    days.push("W");
  }

  // Also support compact values such as M, MT, MW, and MTW.
  if (days.length === 0 && /^[mtw, /&+-]+$/i.test(text)) {
    if (/m/i.test(text)) days.push("M");
    if (/t/i.test(text)) days.push("T");
    if (/w/i.test(text)) days.push("W");
  }

  return days.join("");
}

function normalize(value) {
  return String(value || "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}
