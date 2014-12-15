'use strict';

var jstoxml = require('jstoxml');

module.exports = function(app) {

	app.get('/login', function(req, res){
		res.render('login');
	});
	
	// POST
	app.post('/login', function(req, res){
		postLogin(req, res, function(result){
			res.render('login', result);
		});
	});

	// JSON API
	app.post('/api/login', function(req, res){
		postLogin(req, res, function(result){
			res.json(result);
		});
	});

	// XML API
	app.post('/api/login.xml', function(req, res){
		postLogin(req, res, function(result){
			var data = '<?xml version="1.0" encoding="UTF-8?>';
			data += jstoxml.toXML({result:result});

			res.type('xml');
			res.end(data);
		});
	});
	
	app.get('/logout', function(req, res){
		if (req.session.user) {
			req.session.destroy(function(err){
				res.redirect('/');
			});
		} else {
			res.redirect('/login');
		}
	});

	app.post('/api/logout', function(req, res){
		if (req.session.user) {
			delete req.session.user;
		}
		res.json({ status : 'OK' });
	});

	app.get('/signup', function(req, res){
		res.render('signup');
	});
	
	function postLogin(req, res, callback) {
		var body = req.body, missing = [];

		if (!body.email) missing.push('email');
		if (!body.password) missing.push('password');

		if (missing.length) {
			callback({ error : '필드의 내용이 부족합니다', fields : missing  });
			return false;
		}

		app.models.User.findOne({$email:body.email}, function(err, user){
			if (err) {
				callback({ error : '데이터베이스 에러: ' + err });
				return false;
			}
			
			if (user) {
				if (user.isCorrectPwd(body.password)) {
					var userData = user.toJSON();

					req.session.user = userData;
					req.session.save(function(){
						callback({ status : 'OK', user : userData });
					});
				} else {
					callback({ error : '패스워드가 올바르지 않습니다.' });
				}
			} else {
				callback({ error : '존재하지 않는 이메일 주소입니다.' });
			}
		});
	}
};
