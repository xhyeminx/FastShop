'use strict';

var express = require('express');
var multer  = require('multer');
var logger  = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var methodOverride = require('method-override');
var fs = require('fs'), path = require('path');
var sqlite3 = require('sqlite3').verbose();
var app = express();

// configuration
app.engine('html', require('hogan-express'));
app.set('views', './server/views');
app.set('view engine', 'html');
app.set('layout', 'layout');
app.set('port', 3000);

// setup database
app.db = new sqlite3.Database('fastshop.db');

// common tasks
require(path.join(__dirname, 'bootstrap'))(app);

// log
app.use(logger('dev'));

// static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', express.static(path.join(__dirname, 'files')));

// parse request bodies (req.body)
app.use(cookieParser());
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: './files/' }));

// session support
app.use(session({
	resave : false, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	secret: 'some secret here'
}));

// user
app.use(function(req, res, next){
	if (req.session.user) {
		res.locals.user = req.session.user;
	}
	next();
});

// params
app.use(function(req, res, next){
	res.locals.query = req.query;
	next();
});

// \r\n to \n
app.use(function(req, res, next){
	app._.each(req.body, function(value, key){
		if (typeof value == 'string') {
			req.body[key] = value.replace(/\r\n/g, '\n');
		}
	});
	next();
});

// load controllers
(function(dir){
	fs.readdirSync(dir).forEach(function(name){
		require(path.join(dir, name))(app);
	});
})(path.join(__dirname, 'server', 'controllers'));

// load models
(function(dir){
	app.models = [];
	fs.readdirSync(dir).forEach(function(name){
		require(path.join(dir, name))(app);
	});
})(path.join(__dirname, 'server', 'models'));

// 404
app.use(function(req, res, next){
	res.status(404);
	res.render('404', { url : req.url });
});

// 500
app.use(function(err, req, res, next){
	res.status(err.status || 500);
	res.render('500', { error: err });
});

app.server = app.listen(app.get('port'));

console.log('FastShop started on port ' + app.get('port'));
