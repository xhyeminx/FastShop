'use strict';

var shasum = require('crypto').createHash('sha1');

module.exports = function(app) {
	var Base = require(__dirname + '/../lib/model.js')(app);
	
	var User = Base.extend({
		table : 'users',
		fields : ['email','name','password'],
		defaults : {email:'', name:'', password:''},
		isCorrectPwd : function(password) {
			return this.attrs.password === shasum.update(password).digest('hex');
		},
		toJSON : function() {
			return {
				id : this.attrs.user_id,
				email : this.attrs.email,
				name  : this.attrs.name
			}
		}
	});
	
	app.models.User = User;

	return User;
};