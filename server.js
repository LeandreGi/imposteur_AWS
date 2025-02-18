const { Server } = require("socket.io");
const io = new Server(4000, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log(`Nouvelle connexion : ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Déconnexion : ${socket.id}`);
  });

});
