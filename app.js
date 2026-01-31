import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("public"));

import authRoutes from "./routes/auth.routes.js";

app.use("/api/v1/auth", authRoutes);

export { app, server, io };