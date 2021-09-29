import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const tasks = [];

for (const entry of fs.readdirSync("examples", { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  console.log(`Building ${entry.name}`);
  const example = path.resolve(path.join("examples", entry.name));
  const proc = spawn("npm", ["run", "build"], {
    cwd: example,
  });
  const task = new Promise((resolve) =>
    proc.on("exit", (err) => {
      const passed = entry.name.endsWith("-fail") ? err != 0 : err == 0;
      console.log(`${passed ? "Passed" : "Failed"} ${entry.name}`);
      resolve(passed);
    }),
  );
  tasks.push(task);
}

const results = await Promise.all(tasks);

if (!results.every(Boolean)) {
  process.exit(1);
}
