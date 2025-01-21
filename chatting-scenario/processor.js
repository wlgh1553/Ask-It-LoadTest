const { faker } = require("@faker-js/faker");
const axios = require("axios");
const io = require("socket.io-client");
require("dotenv").config();

function getToken(context, events, done) {
    axios
        .get(`https://ask-it.site/api/sessions-auth`, {
            params: { sessionId: process.env.SESSION_ID },
        })
        .then((response) => {
            context.vars.token = response.data.token;
            done();
        })
        .catch((error) => {
            console.error("Failed to get auth token:", error.message);
            done(error);
        });
}

function createWSConnection(context, events, done) {
    if (!context.vars.token) {
        console.error("No token found in context");
        return done(new Error("No token available"));
    }

    console.log(
        "Creating WebSocket connection with token:",
        context.vars.token
    );

    // 수동으로 소켓 연결 생성
    const socket = io("wss://ask-it.site", {
        query: {
            sessionId: process.env.SESSION_ID,
            token: context.vars.token,
        },
        transports: ["websocket"],
    });

    // 연결 이벤트 처리
    socket.on("connect", () => {
        context.vars.socket = socket;
        done();
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        done(error);
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
    });
}

function sendMessage(context, events, done) {
    const socket = context.vars.socket;
    if (!socket || !socket.connected) {
        console.error("No valid socket connection");
        return done(new Error("No socket connection"));
    }

    const message = faker.lorem.sentence();

    socket.emit("createChat", message);

    setTimeout(() => {
        done();
    }, Math.random() * 400 + 300);
}

module.exports = {
    getToken,
    createWSConnection,
    sendMessage,
};
