import dotenv from "dotenv";
dotenv.config();

import { server, io } from "./app.js";

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_session", (sessionId) => {
        socket.join(sessionId);
        console.log(`Socket ${socket.id} joined session room: ${sessionId}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});