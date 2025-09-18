var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');

dotenv.config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let userRouter = require('./routes/user.route');
let orderRouter = require('./routes/order.route');
const adminRouter = require('./routes/admin.route');
const employeeRoutes = require('./routes/employee.route');
const departmentRoutes = require('./routes/department.route');
const designationRoutes = require('./routes/designation.route');
const stateRoutes = require('./routes/state.route');
const countryRouter = require('./routes/country.route');
const cityRoutes = require('./routes/city.route');
const authRoutes = require('./routes/auth.route');


let mongoose = require('./db/db');
const PORT = process.env.PORT

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter );
app.use('/users', usersRouter);
app.use('/user', userRouter);
app.use('/order', orderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/state', stateRoutes);
app.use('/api/country', countryRouter)
app.use('/api/city', cityRoutes);
app.use('/api/auth', authRoutes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`);
});

module.exports = app;