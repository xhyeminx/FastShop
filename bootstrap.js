'use strict';

module.exports = function(app) {
	// underscore and Q
	app._ = require('underscore');
	app.Q = require('Q');

	var cate = [], index = {};
	app.db.each('SELECT * FROM categories ORDER BY parent_id', function(err, row) {
		row.id = +row.id;
		row.parent_id = +row.parent_id;
		if (row.parent_id == 0) {
			row.children = [];
			cate.push(row);
			index[row.id] = row;
		} else if (index[row.parent_id]) {
			index[row.parent_id].children.push(row);
		}
	});
	app.locals.categories = cate;
	
	app.db.on('trace', function(sql){
		console.log(sql);
	});
};
