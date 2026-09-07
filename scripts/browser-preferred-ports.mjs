import net from "node:net";

import { PORT_SEARCH_SIZE } from "./augnes-runtime-supervisor-core.mjs";

// Browser-only allocation: the supervisor searches forward from each preferred
// port, so the OS-assigned candidate must leave room for its existing range.
// Closing a probe does not reserve the port; runtime collision ownership stays
// with the supervisor. Candidate selection never retries a Browser execution.
export async function chooseBrowserPorts() {
  const ports = [];
  for (let attempt = 0; attempt < PORT_SEARCH_SIZE; attempt += 1) {
    const candidate = await probeLoopbackPort();
    if (
      Number.isInteger(candidate) &&
      candidate >= 1_024 &&
      candidate <= 65_535 - PORT_SEARCH_SIZE &&
      !ports.includes(candidate)
    ) {
      ports.push(candidate);
      if (ports.length === 3) {
        const [app, bridge, debug] = ports;
        return { app, bridge, debug };
      }
    }
  }
  throw new Error("browser_preferred_ports_exhausted");
}

async function probeLoopbackPort() {
  const server = net.createServer((socket) => socket.destroy());
  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address !== "object") {
      throw new Error("browser_loopback_port_allocation_failed");
    }
    return address.port;
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error && error.code !== "ERR_SERVER_NOT_RUNNING") reject(error);
        else resolve();
      });
    });
  }
}
