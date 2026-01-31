import wppconnect from "@wppconnect-team/wppconnect";
import { io } from "../app.js";
import { MAX_ATTEMPTS } from "../constants.js";

export const sessions = new Map();

export async function login(req, res) {

    const sessionId = req.query.sessionId || null;
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            message: 'sessionId query parameter is required',
        });
    }

    res.status(202).json({
        success: true,
        message: 'Session initialization started',
        sessionId: sessionId
    });

    try {
        wppconnect.create(
            {
                session: sessionId,
                catchQR: (qrCode, asciiQR, attempt, urlCode) => {
                    io.to(sessionId).emit("qr", {
                        qrCode,
                        attempt,
                    });
                },
                statusFind: (statusSession) => {
                    console.log("Last status: ", statusSession);

                    io.to(sessionId).emit("status", {
                        statusSession,
                    });
                }
            }
        )
            .then((client) => {
                sessions.set(sessionId, client);

                start(client);
            })
            .catch((err) => console.error(err));
    } catch (error) {
        console.error("Error login: ", error);
        res.status(500).json({
            success: false,
            message: 'Failed to create session',
        });
    }
}

async function start(client) {
    const sessionId = client.session;
    io.to(sessionId).emit("status", { statusSession: "SYNCING" });

    let chats = [];
    let attempts = 0;

    while (chats.length === 0 && attempts < MAX_ATTEMPTS) {
        const ready = await client.isMainReady();
        if (ready) {
            chats = await client.listChats();
        }

        if (chats.length === 0) {
            console.log(`[${sessionId}] Chat store not ready yet... checking again.`);
            await new Promise(r => setTimeout(r, 1500)); // Check every 1.5s
            attempts++;
        }
    }

    if (chats.length > 0) {
        const organizedData = {
            active: {
                contacts: chats.filter(c => !c.isGroup && !c.archive),
                groups: chats.filter(c => c.isGroup && !c.archive)
            },
            archived: {
                contacts: chats.filter(c => !c.isGroup && c.archive),
                groups: chats.filter(c => c.isGroup && c.archive)
            }
        };

        io.to(sessionId).emit("chat_list", organizedData);
        io.to(sessionId).emit("status", { statusSession: "READY" });
    } else {
        io.to(sessionId).emit("status", { statusSession: "TIMEOUT_OR_EMPTY" });
    }
}