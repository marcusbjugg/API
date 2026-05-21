const mysql = require('mysql');
con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "api"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected");
});

var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = 5000;

app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/api.html');
});

app.get('/users', function(req, res) {
  var sql = "SELECT id, username, first_name, last_name FROM users";


  con.query(sql, function(err, results) {
    if (err) {
      console.log(err);
      return res.status(500).send("Ett fel uppstod i databasen.");
    }
    
    res.json(results);
  });
});

app.get('/users/:id', function(req, res) {
  var userId = req.params.id;
  var sql = "SELECT id, username, first_name, last_name FROM users where id = ?";

  con.query(sql, [userId], function(err, results) {
    if (err) {
      console.log(err);
      return req.status(500).send("Ett fel uppstod i databasen.");
    }

    if (results.length === 0) {
      return res.status(404).send("Finns ej användare med detta id")
    }

    res.json(results[0]);
  })
})

app.post('/users', function(req, res) {

  var username = req.body.username;
  var password = req.body.password;
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;

  var sql = "INSERT INTO users (username, password, first_name, last_name) VALUES (?, ?, ?, ?)";
  con.query(sql, [username, password, first_name, last_name], function(err, result) {
    if (err) {
      console.log(err);
      return res.status(500).send("Ett fel uppstod när användaren skulle sparas")
    }

    res.status(201).json({
      id: result.insertId,
      username: username,
      first_name: first_name,
      last_name: last_name
    });
  });
});

http.listen(port, function() {
   console.log('Server is listening on *:' + port);
});