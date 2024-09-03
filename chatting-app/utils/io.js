const userController = require('../controllers/user.controller.js');
const chatController = require('../controllers/chat.controller.js');

module.exports = (io) => {
    //io ... on: 듣는다 emit: 말한다.
    io.on('connection', async (socket) => {// 연결된 사람의 정보를 매개변수로 보내줌
        console.log('client is connected', socket.id);

        socket.on('login', async (userName, cb) => {
            //console.log('backend ', userName);

            // 유저 정보를 저장
            try{
                const user = await userController.saveUser(userName, socket.id);
                const welcomeMessage = {
                    chat: `${user.name} is joined to this room`,
                    user: {id: socket.id, name: 'system'},
                };
                io.emit('message', welcomeMessage);
                cb({ok: true, data: user});
            } catch(error) {
                cb({ok: false, error: error.message});
            }
        });

        socket.on('sendMessage', async (message, cb) => {
            try {
                // 유저찾기 socket id로
                const user = await userController.checkUser(socket.id);
                // 메세지 저장
                const newMessage = await chatController.saveChat(message, user);

                // 아래와 같이 코드를 작성하지 않은 이유는 io 서버에 접속한 클이언트 모두에게 메세제가 보내져야 되기 때문이다.
                //cb({ok: true, data: newMessage})
                io.emit('message', newMessage);

                cb({ok: true});
            } catch(error) {
                cb({ok: false, error: error.message});
            }
        })

        socket.on('disconnect', () => {
            console.log('user is disconnect');
        });
    })
    
}