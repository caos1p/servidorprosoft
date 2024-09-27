const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:8000", // Cambia esto si es necesario
    methods: ["GET", "POST"]
  }
});

let usuariosConectados = 0;
let objetos = []; // Estado global de la pizarra
let pizarras = {}; // Estado global para cada pizarra, usando pizarraId como clave


// Configurar CORS globalmente
app.use(cors({
  origin: 'http://127.0.0.1:3000', // Cambia esto si es necesario
  methods: ["GET", "POST"]
}));

// Configurar eventos de Socket.IO
io.on('connection', (socket) => {
  usuariosConectados++;

  // Emitir el número de usuarios conectados a todos
  io.emit('usuarios_conectados', usuariosConectados);

  // Emitir el estado actual de la pizarra solo al nuevo usuario
  socket.emit('estado-inicial', objetos);

  // Manejar el evento de unirse a una pizarra
  socket.on('unirse', (data) => {
    const pizarraId = data.pizarraId;
    socket.join(pizarraId);


    // Enviar el estado actual de la pizarra solo al nuevo usuario
    if (pizarras[pizarraId]) {
      socket.emit('estado-inicial', pizarras[pizarraId]);
    } else {
      pizarras[pizarraId] = []; // Inicializar una nueva pizarra si no existe
    }

  });
  // Escuchar el evento de dibujo desde un cliente
  socket.on('dibujo', (data) => {
    objetos = data; // Actualizar el estado global de la pizarra
    console.log('Estado de la pizzzzzzzzzzzzzzzzzz:', objetos);
    const pizarraId = objetos.pizarraId;

    if (!pizarras[pizarraId]) {
      pizarras[pizarraId] = [];
    }

    pizarras[pizarraId] = objetos; // Actualizar el estado de la pizarra correspondiente

    // Emitir el nuevo estado a todos los usuarios
    //  io.emit('dibujo', objetos);
    // Emitir a una sala específica
io.to(objetos.pizarraId).emit('dibujo', pizarras[pizarraId]);
  });

  // Manejar la desconexión
  socket.on('disconnect', () => {
    usuariosConectados--;
    // Emitir el número actualizado de usuarios conectados a todos
    io.emit('usuarios_conectados', usuariosConectados);
  });
});

// Iniciar el servidor
server.listen(3000, () => {
  console.log('Servidor escuchando en el puerto http://localhost:3000');
});


