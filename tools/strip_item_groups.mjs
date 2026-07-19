/**
 * Leave creative grouping to item_catalog (avoids content log spam when
 * item menu_category.group disagrees with crafting_item_catalog.json).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "BP", "items");
let n = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const p = path.join(dir, f);
  let raw = fs.readFileSync(p, "utf8");
  if (!/"group"\s*:/.test(raw)) continue;
  raw = raw.replace(/\r?\n\s*"group"\s*:\s*"[^"]*"\s*,?/g, "");
  raw = raw.replace(/("category"\s*:\s*"[^"]*")\s*,(\s*\})/g, "$1$2");
  fs.writeFileSync(p, raw);
  n++;
}
console.log(`stripped group from ${n} items`);
