import { Server } from "socket.io";


const io = new Server({
  cors:true
})

const userIdToSocket = new Map();
const socketToUserId = new Map()


io.on('connection', (socket) => {

  socket.on('join-room', ({romId,userId}) => {
    socket.join(romId);
    userIdToSocket.set(userId, socket.id);
    socketToUserId.set(socket.id, userId);
    console.log('user join',userIdToSocket)
    // Emit to the new user the streams of the current users in the room
    socket.broadcast.to(romId).emit('user-connected', userId);
    
    socket.on('disconnect', () => {
      socket.to(romId).emit('user-disconnect', socket.id);
    });
  });

  socket.on('offer',(data)=>{
     const socketId = userIdToSocket.get(data.to)
     io.to(socketId).emit('offer',data)
     console.log('offer')
  })
  socket.on('answer',(data)=>{
     const socketId = userIdToSocket.get(data.to)
     io.to(socketId).emit('answer',data)
  })
  socket.on('ice-candidate',(data)=>{
     const socketId = userIdToSocket.get(data.to)
     io.to(socketId).emit('ice-candidate',{candidate:data.candidate,from:data.from})
  })
});

io.listen(4000)