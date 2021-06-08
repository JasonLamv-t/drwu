const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const db = require('./config/mongo')
const Account = require('./model/account')
const expressJwt = require('express-jwt')
const jwt = require('./utils/jwt')
const config = require('./config/config')
const app = express()

// Register routing
const accountRouter = require('./routes/account')
const organizationRouter = require('./routes/organization')
const messageRouter = require('./routes/message')
const articleRouter = require('./routes/article')
const appointmentRouter = require('./routes/appointment')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Analysis the token and preprocess token
app.use((req, res, next) => {
    let token = req.headers['authorization']
    if (token) {
        let r = jwt.decrypt(token)
        if (r.data) {
            req.data = r.data
            req.headers['authorization'] = 'Bearer ' + req.headers['authorization']
        }
        return next()
    } else return next()
})

// verify token first
app.use(expressJwt({
    secret: config.tokenSecret,
    algorithms: ['HS256'],
}).unless({
    path: [
        '/accounts/login',
        '/accounts/register',
        '/accounts/get',
        '/accounts/check',
        '/accounts/sms',
    ],
}))

// router list
app.use('/accounts', accountRouter)
app.use('/organizations', organizationRouter)
app.use('/messages', messageRouter)
app.use('/articles', articleRouter)
app.use('/appointments', appointmentRouter)

// catch 404 and forward to error handler
app.use(function (err, req, res, next) {
    console.log(err)
    if (err.status === 401) return res.status(401).send('token不存在或已过期')
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

module.exports = app
