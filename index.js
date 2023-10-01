const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const { v4: uuidv4 } = require('uuid');

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

app.set("views engine", "ejs")
app.set("views", path.join(__dirname, "/views"));

// <-- create the connection between node and database -->
const connection = mysql.createConnection({
  host: 'localhost',         //get it from mysql workbrench
  user: 'root',
  database: 'delta_app',
  password: '724305'
});


//To generate random fake data
let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
}

//Home Route
app.get("/", (req, res) => {
  let q = `SELECT COUNT(*) FROM person`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["COUNT(*)"];
      res.render("home.ejs", { count })
    })
  } catch (err) {
    console.log(err)
    res.send("Some error in database");
  }

});


//Show Route
app.get("/user", (req, res) => {
  let q = `SELECT * FROM person`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("showusers.ejs", { users });
    })
  } catch (err) {
    console.log(err)
    res.send("Some error in database");
  }
})


//Edit Route Part-1
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM person WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});


//Edit Route Part-2 [Update in Main database]
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { username, password } = req.body;
  console.log(username);
  let q = `SELECT * FROM person WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `UPDATE person SET username='${username}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("updated!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});


//New User Route part 1

app.get("/user/new", (req, res) => {
  res.render("new.ejs");
})

//new user route part 2
app.post("/user/new",(req,res)=>{
  let {id, username, email,password} = req.body;
  // let id = uuidv4();
  let q = `INSERT INTO person (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      console.log("added new user");
      // res.render("showusers.ejs", { users });
      res.redirect("/user")
    });
  } catch (err) {
    res.send("some error with DB");
  }

 
})


//Delete Part 1

app.get("/user/:id/delete",(req,res) =>{
  let {id} = req.params;
  let q = `SELECT * FROM person WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
})

// delete part 2
app.delete("/user/:id/",(req,res)=>{
  let {id} = req.params;
  let {password} = req.body;

  let q = `SELECT * FROM person WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM person WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
})




app.listen("8080", () => {
  console.log("Server is listening at 8080....");
})














// <-- we make connection above in which a query function is present whose work is to run any query in databases -->

// // //inserting new data
// let q = "INSERT INTO person (id, username, email, password) VALUES ?";  //insertation query
// let data = [];
// for(let i = 1;i<=100;i++){
//     data.push(getRandomUser()); // 100 fake user data
// }


// connection.end();