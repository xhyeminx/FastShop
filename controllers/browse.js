'use strict';

var util = require(__dirname + '/../lib/util');

module.exports = function(app) {
	var _ = require('underscore');
	
	util.set('app', app);

	app.get('/browse', function(req, res){
		res.redirect('/browse/all');
	});

	app.get('/browse/:category', function(req, res){
		commonTemplateVars(req, res);

		var sql = 'SELECT * FROM products', wheres = [];

		if ('category' in res.locals) {
			if (res.locals.root_category.id === res.locals.category.id) {
				var cate_ids = [];
				_.each(res.locals.root_category.children, function(c){ cate_ids.push(c.id); });
				wheres.push('category_id IN ('+cate_ids.join(',')+')');
			} else if (res.locals.category){
				wheres.push('category_id = ' + res.locals.category.id);
			}
		}

		if (req.query.q) {
			wheres.push('(name LIKE \'%'+req.query.q+'%\' OR description LIKE \'%'+req.query.q+'%\')');
		}

		if (req.query.sale === 'true') {
			wheres.push('(retail_price > 0)');
		}

		if (wheres.length) {
			sql += ' WHERE ' + wheres.join(' AND ');
		}

		app.db.all(sql, function(err, rows){
			var ids = [];

			_.each(rows, util.populateProduct);

			res.locals.products = rows;

			res.render('category');
		});
	});

	app.get('/browse/:category/:product_id', function(req, res){
		console.log('params', req.params);
		commonTemplateVars(req, res);

		var count = 2;

		app.db.get('SELECT * FROM products WHERE id = ?', req.params.product_id, function(err, product){
			res.locals.product = product;

			util.populateProduct(product, function(){
				if (--count === 0) res.render('product');
			});

			app.db.all('SELECT * FROM products WHERE category_id = ? AND id <> ? LIMIT 6', res.locals.product.category_id, res.locals.product.id, function(err, rows){
				_.each(rows, util.populateProduct);
				res.locals.suggestion = rows;
				if (--count === 0) res.render('product');
			});
		});
	});

	// APIs
	app.get('/api/products', function(req, res){

	});

	// product information
	app.get('/api/products/:product_id', function(req, res){
		app.db.get('SELECT * FROM products WHERE id = ?', req.params.product_id, function(err, product){
			res.locals.product = product;
			util.populateProduct(product, function(){
				res.json(product);
			});
		});
	});

	// product options
	app.get('/api/products/:product_id/options', function(req, res){
	});

	function commonTemplateVars(req, res) {
		// current category
		_.each(app.locals.categories, function(cate) {
			var parent = cate;

			cate.is_active = false;
			if (cate.slug !== req.params.category) {
				_.each(cate.children, function(c){ c.is_active = false; });
				cate = _.findWhere(cate.children, {slug: req.params.category});
			}

			if (cate) {
				cate.is_active = true;
				res.locals.category = cate;
				res.locals.root_category = parent;
			}
		});

		// in sale
		if (req.query.sale === 'true') {
			res.locals.in_sale = true;
		}
	}
};
