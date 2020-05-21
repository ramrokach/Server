const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  //console.log(req.body);
  const users = getUsers();

  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });

  // console.log("user",user);
  if (!user) {
    res.json({ userId: null });
    return;
  }

  res.json({
    userId: user.id,
  });
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const user = users.find((u) => {
    return u.username === username;
  });
  if (!user) {
    users.push(req.body);
    fs.writeFileSync("./users.json", JSON.stringify(users));
    res.json({ userId: null });
    return;
  }
  
  res.json({
    userId: user.id,

});
});
app.listen(3005, () => {
  console.log("server run on port 3005");
});

function getUsers() {
  // TODO use DB

  const usersFilePath = path.join(__dirname, "./users.json");
  const usersFileContent = fs.readFileSync(usersFilePath, "utf8");
  const users = JSON.parse(usersFileContent || []);
  return users;
}
