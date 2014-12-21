'use strict';

module.exports = function(app) {
	app.get('/faq', function(req, res){
		res.render('faq');
	});
};
