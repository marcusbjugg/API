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

const jwt = require("jsonwebtoken");
const secret = "dennalöseringen1234marcusärenpartymyra:)"

var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = 5000;

app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/api.html');
});

const crypto = require("crypto");
function hash(data) {
  const hash = crypto.createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
}

app.get('/users', function(req, res) {
  
  let authHeader = req.headers["authorization"];
  if (authHeader === undefined) {
    return res.sendStatus(400);
  }

  let token = authHeader.slice(7)

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    console.log(err);
    return res.status(401).send("Ogiltig token");
  }

  var sql = "SELECT id, username, first_name, last_name FROM users WHERE id = ?"

  con.query(sql, [decoded.id], function(err, results) {
    if (err) {
      console.log(err);
      return res.status(500).send("Ett fel uppstod i databasen.");
    }

    res.json(results[0]);
  })
});

app.get('/users/:id', function(req, res) {

  let authHeader = req.headers["authorization"];
  if (authHeader === undefined) {
    return res.sendStatus(400);
  }

  let token = authHeader.slice(7)

  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    console.log(err);
    return res.status(401).send("Ogiltig token");
  }

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

  var hashedPassword = hash(password)

  var sql = "INSERT INTO users (username, password, first_name, last_name) VALUES (?, ?, ?, ?)";

  con.query(sql, [username, hashedPassword, first_name, last_name], function(err, result) {
    if (err) {
      console.log(err);
      return res.status(500).send("Ett fel uppstod när användaren skulle sparas")
    }

    res.status(201).json({
      ident: result.insertId,
      username: username,
      first_name: first_name,
      last_name: last_name
    });
  });
});

app.put('/users/:id', function(req, res){
  var userId = req.params.id;
  var username = req.body.username;
  var password = req.body.password;
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;

  var hashedPassword = hash(password)

  var sql = "UPDATE users SET username = ?, password = ?, first_name = ?, last_name = ? WHERE id = ?";

  con.query(sql, [username, hashedPassword, first_name, last_name, userId], function(err, result) {
    if (err) {
      console.log(err);
      return res.status(500).send("Ett fel uppstod i databasen.");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Användaren hittades inte.");
    }

    res.json({
      message: "Användaren har uppdaterats",
      updatedId: userId
    });
  });
});

app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  if(!username || !password) {
    return res.status(400).send("Både användarnamn och lösenord krävs.");
  }

  var sql = "SELECT id, username, password, first_name, last_name FROM users WHERE username = ?"

  con.query(sql, [username], function(err, results) {
    if (err) {
      console.log(err);
      return res.status(500).send("Ett fel uppstod i databasen.");
    }

  if (results.length === 0) {
    return res.status(401).send("Fel användarnamen eller lösenord")
  }

  var passwordHash = hash(password);

  if (results[0].password === passwordHash) {

    let payload = {
      id: results[0].id,
      name: results[0].first_name,
      lastname: results[0].last_name
    };

    let token = jwt.sign(payload, secret, { expiresIn: '1h' });

    res.json({ token : token});

  } else {
    res.status(401).send("Fel användarnamn eller lösenord.")
  }
  })
})
http.listen(port, function() {
   console.log('Server is listening on *:' + port);
});