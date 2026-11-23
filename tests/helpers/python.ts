import { spawnSync } from "node:child_process";

let cached: string | undefined;
/** macOS ships only `python3`; some Linux/Windows setups only `python`. PYTHON overrides both. */
export function pythonCommand() {
  if (cached) return cached;
  for (const command of [process.env.PYTHON, "python3", "python"]) {
    if (!command) continue;
    const probe = spawnSync(command, ["--version"], { encoding: "utf8" });
    if (probe.status === 0 && /Python 3\./.test(`${probe.stdout}${probe.stderr}`)) return (cached = command);
  }
  throw new Error("Python 3 tidak ditemukan. Pasang python3 atau set PYTHON=/path/ke/python3.");
}
