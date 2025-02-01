const createError = require('http-errors')
const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

const indexRouter = require('./routes/index')

const app = express()
dotenv.config()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/api', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${process.env.PORT}`)
})

module.exports = app
