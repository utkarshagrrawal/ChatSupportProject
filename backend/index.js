const express = require('express')
const cors = require('cors')
const http = require("http");
const { Server } = require("socket.io");

const adminRoute = require('./routes/adminRoute')
const userRoute = require('./routes/userRoute')


const app = express();

app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("disconnect_chat", data => {
        socket.emit("disconnect_user", data)
        socket.leave(data.roomId)
    })

    socket.on("start_chat", (data) => {
        socket.join(data.roomId)
        socket.emit("refresh_admin")
    })

    socket.on("join_room", (data) => {
        socket.join(data.roomId);
    });

    socket.on("send_message", (data) => {
        socket.to(data.roomId).emit("receive_message");
    });
});

app.use('/admin', adminRoute)

app.use('/user', userRoute)

server.listen(3000, () => {
    console.log("SERVER IS RUNNING 3000");
});