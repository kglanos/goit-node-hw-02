const app = require('./app')
const mongoose = require('mongoose')
const usersRouter = require('./routes/api/users');
app.use('/api/users', usersRouter);
require('dotenv').config()

const serverDB = process.env.DB_HOST;

const connection = mongoose.connect(serverDB);



connection
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000")
    })
    console.log("Database connection successful")
  })
  .catch((err) => {
    console.log("Database connection failed:", err.message)
    process.exit(1);
  });