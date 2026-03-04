#!/usr/bin/env node
/**
 * Validate the PHPMyAdmin JSON file and optionally create a small test payload.
 * Usage: node scripts/test-import-payload.js [path-to-json]
 * Example: node scripts/test-import-payload.js /home/ashu/Desktop/u343517709_nlf.json
 */

const fs = require("fs");
const path = process.argv[2] || require("path").join(__dirname, "../../u343517709_nlf.json");

if (!fs.existsSync(path)) {
  console.error("File not found:", path);
  process.exit(1);
}

let raw;
try {
  raw = fs.readFileSync(path, "utf8");
} catch (e) {
  console.error("Read error:", e.message);
  process.exit(1);
}

console.log("File size:", (raw.length / 1024).toFixed(1), "KB");

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error("Invalid JSON:", e.message);
  console.error("Try removing any trailing commas (e.g. ,] or ,})");
  process.exit(1);
}

console.log("Valid JSON. Root is", Array.isArray(data) ? "array" : typeof data);
if (Array.isArray(data)) {
  const tables = data.filter((x) => x?.type === "table" && x?.name);
  console.log("Tables found:", tables.map((t) => t.name).join(", "));
  const users = tables.find((t) => t.name === "users");
  if (users && users.data) console.log("Users count:", users.data.length);
}

console.log("\nTo test import with a small payload, create a slice of the file and POST it.");
process.exit(0);
