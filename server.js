const express = require('express');
const connectdb = require("./config/dbconnection")
const errorHandler = require('./middleware/errorHandler');
const dotenv = require("dotenv").config();
//THUNDER CLIENT IS BEING USED HERE FOR api TESTING

connectdb();
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json()); // to parse json body we recieve in request
app.use("/api/contacts", require("./routes/contactroutes")); // this is middleware
app.use("/api/users", require("./routes/userroutes"));
app.use(errorHandler)

app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})
