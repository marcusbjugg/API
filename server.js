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

http.listen(port, function() {
   console.log('Server is listening on *:' + port);
});