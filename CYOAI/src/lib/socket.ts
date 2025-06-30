import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  socket ??= io("http://localhost:9000", {
    withCredentials: true,
    transports: ["websocket"],
  });
  return socket;
}
