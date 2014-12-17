'use strict';

var crypto = require('crypto');;

module.exports = function(app) {
	var Base = require(__dirname + '/../lib/model.js')(app);
	
	var User = Base.extend({
		table : 'users',
		fields : ['email','name','password'],
		defaults : {email:'', name:'', password:''},
		isCorrectPwd : function(password) {
			return this.attrs.password === crypto.createHash('sha1').update(password).digest('hex');
		},
		toJSON : function() {
			return app._.pick(this.attrs, 'id', 'email', 'name');
		}
	});
	
	app.models.User = User;

	return User;
};