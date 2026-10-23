// One shared Socket.IO connection for the whole app.
import { io } from "socket.io-client";
import { API_URL } from "../config";

const socket = io(API_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;
