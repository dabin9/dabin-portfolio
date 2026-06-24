import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";

const port = 3199;
const baseUrl = `http://127.0.0.1:${port}`;
let server;
let serverOutput = "";

before(async () => {
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port)
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ADMIN_PASSWORD: "test-password",
        BLOB_READ_WRITE_TOKEN: "invalid",
        VERCEL: "1"
      },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  server.stdout.on("data", (chunk) => {
    serverOutput += chunk;
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk;
  });

  await waitForServer();
}, { timeout: 30_000 });

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000))
  ]);
});

test("admin login succeeds when security log storage is unavailable", async () => {
  const body = new URLSearchParams({
    password: "test-password",
    next: "/admin/projects"
  });
  const response = await fetch(`${baseUrl}/api/admin/login`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      host: "dabin-portfolio-six.vercel.app",
      "x-forwarded-for": "203.0.113.10"
    },
    body,
    redirect: "manual"
  });

  assert.equal(response.status, 303, serverOutput);
  assert.match(response.headers.get("location") || "", /\/admin\/projects$/);
});

test("visit tracking stays non-blocking when log storage is unavailable", async () => {
  const response = await fetch(`${baseUrl}/api/analytics/visit`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.11"
    },
    body: JSON.stringify({ path: "/", referrer: "" })
  });

  assert.equal(response.status, 204, serverOutput);
});

async function waitForServer() {
  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited before becoming ready:\n${serverOutput}`);
    }
    try {
      const response = await fetch(`${baseUrl}/admin`, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for Next.js:\n${serverOutput}`);
}
