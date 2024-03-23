const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/'));

let counter = 0;

// 接続されたクライアントの識別子用の連想配列
const clients = {};

io.on('connection', (socket) => {
    // クライアントが接続した時の処理
    const clientId = generateClientId();
    clients[socket.id] = clientId;
    console.log(`${clientId} connected`);

    // カウンターの初期値をクライアントに送信
    socket.emit('counter', counter);

    // クライアントからのカウンターの増加リクエストを処理
    socket.on('increment', () => {
        counter++;
        io.emit('counter', counter); // 全てのクライアントに新しいカウンターの値を送信
    });

    // クライアントからのカウンターの減少リクエストを処理
    socket.on('decrement', () => {
        counter--;
        io.emit('counter', counter); // 全てのクライアントに新しいカウンターの値を送信
    });

// クライアントからのチャットメッセージを受信して全てのクライアントに送信
socket.on('chat message', (msg) => {
    const timestamp = new Date().toISOString().slice(0, -8).replace(/T|Z|-|:|\./g, '');
    const messageWithTimestamp = `${timestamp} - ${msg}`;
    io.emit('chat message', { sender: clients[socket.id], message: messageWithTimestamp }); // クライアントIDとメッセージを含むオブジェクトを送信
});
    // クライアントが切断した時の処理
    socket.on('disconnect', () => {
        console.log(`${clients[socket.id]} disconnected`);
        delete clients[socket.id];
    });
});

// サーバーを起動
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ランダムなアルファベット文字列を生成する関数
function generateClientId() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let clientId = '';
    for (let i = 0; i < 3; i++) {
        clientId += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return clientId;
}
