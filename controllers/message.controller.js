import { sessions } from "./auth.controller.js";

export async function sendMessage(req, res) {
    try {
        const { sessionId, receiver, message } = req.body;

        const client = sessions.get(sessionId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
            });
        }

        client.sendText(receiver, message);
        return res.status(200).json({
            success: true,
            message: 'Message was sent successfully',
        });

    } catch (error) {
        console.error("Error sending message: ", error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
        });
    }
}