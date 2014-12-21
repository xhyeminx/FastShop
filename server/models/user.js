'use strict';

var crypto = require('crypto');;

module.exports = function() {
	var User = Base.extend({
		table : 'users',
		fields : ['email','name','password'],
		defaults : {email:'', name:'', password:''},
		isCorrectPwd : function(password) {
			return this.attrs.password === crypto.createHash('sha1').update(password).digest('hex');
		},
		toJSON : function() {
			return _.pick(this.attrs, 'id', 'email', 'name');
		}
	});

	return {name:'User', model:User};
}();