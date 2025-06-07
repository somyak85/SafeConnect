const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const port = process.env.PORT || 5000;
const { connectDB } = require("./db");
dotenv.config();
connectDB();

// Allowed origins array
const allowedOrigins = [
  "http://localhost:3000",
  "https://safe-connect-g.vercel.app",
];

// Apply strict CORS middleware to Express
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl or postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const waitingUsers = [];
const userPartners = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("find-partner", () => {
    if (waitingUsers.length > 0) {
      const partnerSocketId = waitingUsers.shift();
      userPartners[socket.id] = partnerSocketId;
      userPartners[partnerSocketId] = socket.id;

      io.to(socket.id).emit("partner-found", { partnerId: partnerSocketId });
      io.to(partnerSocketId).emit("partner-found", { partnerId: socket.id });
    } else {
      waitingUsers.push(socket.id);
    }
  });

  socket.on("send-message", ({ text }) => {
    const partnerId = userPartners[socket.id];
    if (partnerId) {
      io.to(partnerId).emit("receive-message", {
        from: socket.id,
        text,
      });
    }
  });

  socket.on("video-offer", ({ to, offer }) => {
    io.to(to).emit("video-offer", { from: socket.id, offer });
  });

  socket.on("video-answer", ({ to, answer }) => {
    io.to(to).emit("video-answer", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("skip-partner", () => {
    const partnerId = userPartners[socket.id];

    if (partnerId) {
      console.log(`${socket.id} skipped ${partnerId}`);
      io.to(partnerId).emit("partner-skipped");

      delete userPartners[partnerId];
      delete userPartners[socket.id];

      waitingUsers.push(socket.id);
      waitingUsers.push(partnerId);
    }
  });

  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    const index = waitingUsers.indexOf(socket.id);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
    }

    const partnerId = userPartners[socket.id];
    if (partnerId) {
      io.to(partnerId).emit("partner-disconnected");
      delete userPartners[partnerId];
      delete userPartners[socket.id];
    }
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
