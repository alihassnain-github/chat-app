import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true,
    }
));
app.use(express.json());
app.use(express.static("public"));

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/message", messageRoutes);

export { app, server, io };