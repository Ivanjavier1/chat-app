const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {};
let messages = [];

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!users[username]) {
    users[username] = { username };
  }
  return res.json({ success: true, username });
});

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    socket.username = username;
    socket.broadcast.emit("message", { from: "System", text: `${username} joined the chat` });
    socket.emit("chatHistory", messages);
  });

  socket.on("message", (msg) => {
    const message = { from: socket.username, text: msg };
    messages.push(message);
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("message", { from: "System", text: `${socket.username} left the chat` });
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});