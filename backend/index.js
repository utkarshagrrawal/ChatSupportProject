const express = require('express')
const cors = require('cors')
const http = require("http");
const { Server } = require("socket.io");
require('dotenv').config();

const adminRoute = require('./routes/adminRoute')
const userRoute = require('./routes/userRoute')
const notificationRoute = require('./routes/notificationRoute')


const app = express();

app.use(express.json());
app.use(cors({
    origin:process.env.CLIENT_URL, 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}));

const server = http.createServer(app);


const io = new Server(server);

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("disconnect_chat", data => {
        socket.leave(data.roomId)
        socket.to(data.roomId).emit("disconnect_user")
        // socket.to(data.roomId).emit("refresh_admin")
    })

    socket.on("join_room", (data) => socket.join(data.roomId));

    socket.on("send_message", (data) => {
        socket.join(data.roomId);
        socket.to(data.roomId).emit("receive_message", { message: data.message, sender_name: data.sender_name, firstTime: data.firstTime });
        if (data.firstTime) {
            socket.emit("refresh_admin")
        }
    });
});

app.use('/notification', notificationRoute)

app.use('/admin', adminRoute)

app.use('/user', userRoute)

server.listen(3000, () => {
    console.log("SERVER IS RUNNING 3000");
});
