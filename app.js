const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const verifyToken = require('./middlewares/auth')
const contactsRouter = require('./routes/api/contacts')
const usersRouter = require('./routes/api/users')

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'
const port = process.env.PORT || 4000;

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())
app.use(express.static('public'));

app.use('/users', usersRouter)
app.use('/api/contacts', verifyToken, contactsRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

app.listen(port, () => {
  console.log(`Server running. Use our API on port: ${port}`)
});

module.exports = app
