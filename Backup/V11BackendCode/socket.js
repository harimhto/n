let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
       // origin: "https://work.digilogy.co", // Replace with your actual client origin
          // origin: "https://work.digilogy.co",
    origin: [
       "https://work.digilogy.co",
      // "http://localhost:5173",
    ],
        methods: ["GET", "POST","PUT","UPDATE"],
      },
    });
    console.log("Socket.IO initialized");
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.IO not initialized");
    }
    return io;
  }
};
