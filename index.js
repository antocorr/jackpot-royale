const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid')
const games = {};
app.set('view engine', 'ejs')
app.use(express.static('public'));

app.get('/', (req, res) => {
    if (Object.values(games).length) {
        res.redirect("/" + Object.keys(games)[0])
    } else {
        const game = createGame();;
        res.redirect("/" + game.id)
    }

})
app.get('/:gameId', (req, res) => {
    if (!games[req.params.gameId]) {
        res.redirect("/");
        return;
    }
    res.render('index', { game: games[req.params.gameId], userId: uuidV4() })
})

server.listen(3000, () => {
    console.log('listening on *:3000');
});

//Socket
/**
 * 
 * 
 * 
 */
io.on('connection', socket => {
    let gId = null
    let user = {}
    socket.on('join-game', function (gameId, userId) {
        socket.join(gameId)
        gId = gameId
        user = { id: userId }
        socket.broadcast.to(gameId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.broadcast.to(gameId).emit('user-disconnected', userId)
        })
        //
        socket.on('place-bet', function (amount) {
            console.log("placing bet...");
            if (isNaN(amount)) {
                console.log("not a number!")
            } else {
                console.log("valid number...")
                const bet = { amount: parseInt(amount), userId: user.id, gameId: gId };
                placeBet(bet);
                console.log("current gid", gId)
                io.in(gId).emit('new-jackpot', games[gId].currentJackpot)

            }
        })
    });

})
setInterval(function () {
    for (const k in games) {
        io.in(k).emit('ping-clients')
    }
}, 3000)
function placeBet(bet) {
    const g = games[bet.gameId];
    console.log("current amount: ", bet.amount)
    console.log("possibile amounts: ", g.possibleAmounts)
    if (g.possibleAmounts.indexOf(bet.amount) != -1) {
        games[bet.gameId].bets.push(bet);
        games[bet.gameId].currentJackpot += bet.amount * 0.2
        console.log(games[bet.gameId])
    }
    //
}
// io.on('connection', (socket) => {
//     console.log('a user connected');
//     socket.on('chat message', (msg) => {
//         console.log('message: ' + msg);
//     });
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });
// });





//Game
function createGame() {
    const game = { currentJackpot: 200, bets: [], possibleAmounts: [50, 100, 150, 300] };
    game.id = uuidV4();
    games[game.id] = game;
    return game;
}