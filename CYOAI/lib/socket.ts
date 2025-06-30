// This file should be moved to src/lib/socket.ts for proper TypeScript and ESLint support.
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:9000", {
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return socket;
}
