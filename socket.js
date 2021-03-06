const SocketIO = require('socket.io');
const axios = require('axios');


module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, {
        path: '/socket.io'
    });

    app.set('io', io);


    var room = io.of('/room');
    var chat = io.of('/chat');

    io.use((socket, next) => {
        sessionMiddleware(socket.request, socket.request.res, next);
    });



    room.on('connection', (socket) => {
        console.log('room 네임스페이스에 접속');
        //console.dir(socket);

        console.log("현재주소 : " + socket.request.headers.referer);

        var room = socket.handshake['query']['r_var'];
        socket.join(room);
        console.log(room + " 룸 접속");
        /*const roomId = socket.request.headers.refere;r
        var namespace = io.of(roomId);*/
        socket.on('disconnect', () => {
            console.log('room 네임스페이스 접속 해제');
            socket.leave(room);
            console.log(room + " 룸 접속 해제");
        });
    });

    chat.on('connection', (socket) => {
        console.log('chat 네임스페이스에 접속');
        //console.dir(socket);
        var roomId = "";
        var req;
        console.log("socket.handshake['query']['r_var'] : " + socket.handshake['query']['r_var']);
        if (socket.handshake['query']['r_var'] == undefined) { //인터넷접속시
            req = socket.request;
            const {
                headers: {
                    referer
                }
            } = req;
            roomId = referer
                .split('/')[referer.split('/').length - 1]
                .replace(/\?.+/, '');
        } else { //안드로이드 접속시
            roomId = socket.handshake['query']['r_var']
        }

        console.log("roomId에 접속함 : " + roomId);
        socket.join(roomId);
        /*        socket.to(roomId).emit('join', {
                    user: 'system',
                    chat: `${req.session.color}님이 입장하셨습니다.`,
                });*/
        socket.on('disconnect', () => {
            console.log('chat 네임스페이스 접속 해제');
            socket.leave(roomId);
            const currentRoom = socket.adapter.rooms[roomId];

            //currentRoom ->소켓목록 -> 소켓이존재한다면 소켓의길이가 유저참가수
            const userCount = currentRoom ? currentRoom.length : 0;
            if (userCount === 0) {
                axios.get(`http://localhost:8005/room/participant/${roomId}`)
                    .then((results) => {
                        if (results.data == 0) {
                            axios.delete(`http://localhost:8005/room/${roomId}`)
                                .then((results) => {
                                    console.log('방 제거 성공');
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
            } else {
              /*  socket.to(roomId).emit('exit', {
                    user: 'system',
                    chat: `${req.session.color}님이 퇴장하셨습니다.`,
                });*/
            }
        });
    });
};
