// On charge les bibliothèques
var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'),
    fs = require('fs');

// On charge la page index quand on demande la racine
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// On affiche la page 404 lorsque la demande n'est pas prévue
app.use(function(req, res, next){
  res.status(404);

  if (req.accepts('html')) {
    res.sendfile(__dirname + '/erreur.html');
    return;
  }

  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  res.type('txt').send('Not found');
});

// On se connecte au socket
io.sockets.on('connection', function (socket, pseudo, room) {
    socket.passage = 0;

    socket.on('connexion', function(data) {
        if (socket.passage === 1) {
            socket.broadcast.emit('deco', {pseudo: socket.pseudo, room: socket.room});
        }
        socket.passage = 1;
        pseudo = ent.encode(data.pseudo);
        room = ent.encode(data.room);
        socket.pseudo = pseudo;
        socket.room = room;
        socket.emit('retourConnexion', {pseudo: socket.pseudo, room: socket.room});
        socket.broadcast.emit('nouvelleConnexion', {pseudo: socket.pseudo, room: socket.room});
    });

    socket.on('disconnect', function () {
        socket.broadcast.emit('deco', {pseudo: socket.pseudo, room: socket.room});
  });

    socket.on('envoie', function(data){
        var message = ent.encode(data.message);
        socket.emit('retourEnvoieAuteur', {message: message});
        socket.broadcast.emit('retourEnvoieChat', {message: message, room: socket.room, pseudo: socket.pseudo});
    })

});

server.listen(8080);