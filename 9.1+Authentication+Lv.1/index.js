import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const saltRound = 5;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "user_login",
  password: "Ak1989@",
  port: 5432,
});
db.connect();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const pass = req.body.password;
  try {
    const verifyUser = await db.query("SELECT * FROM login WHERE email = $1", [
      email,
    ]);

    if (verifyUser.rows.length > 0) {
      res.send("Email already exists");
    } else {
      const hashCode = await bcrypt.hash(pass, saltRound);
      const addUser = await db.query(
        "INSERT INTO login (email,password) VALUES ($1,$2)",
        [email, hashCode]
      );
      console.log(addUser);
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in");
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const verifyUser = await db.query("SELECT * FROM login WHERE email = $1", [
      email,
    ]);

    if (verifyUser.rows.length < 1) {
      res.send("Invalid user details");
    } else {
      const user = verifyUser.rows[0];
      const savedPassword = user.password;

      const isValid = await bcrypt.compare(password, savedPassword);
      if (isValid) {
        res.render("secrets.ejs");
      } else {
        res.send("Invalid password");
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
