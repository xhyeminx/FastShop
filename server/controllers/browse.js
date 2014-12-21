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
		commonTemplateVars(req, res);

		var count = 2;

		app.db.get('SELECT * FROM products WHERE id = ?', req.params.product_id, function(err, product){
            if (err) return res.status(500).end(err);

			res.locals.product = product;

			util.populateProduct(product, function(){
				if (--count === 0) res.render('product');
			});

			app.db.all('SELECT * FROM products WHERE category_id = ? AND id <> ? LIMIT 6', res.locals.product.category_id, res.locals.product.id, function(err, rows){
				_.each(rows, util.populateProduct);
				res.locals.suggestion = rows;
				if (--count === 0) res.render('product');
                console.log(count, 'all');
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
	app.get('/api/products/:product_id/options(/:color)?', function(req, res){
		app.db.all('SELECT * FROM product_options WHERE product_id = ? ORDER BY `order`', req.params.product_id, function(err, options){
			if (err) return res.json({error:'데이터베이스 에러: ' + err});
			
			var opts = {};
			
			options.forEach(function(opt){
				var names = opt.name.split('|');
				
				if (!opts.hasOwnProperty(names[0])) {
					opts[names[0]] = [];
				}

				opts[names[0]].push(opt);
				opt.name = names[1];				
			});
			
			if (req.params.color) {
				opts = opts[req.params[0]] || [];
			} else {
				opts = Object.keys(opts);
			}

			res.json({options:opts});
		});
	});

	function commonTemplateVars(req, res) {
		// current category
		app.locals.categories.forEach(function(cate){
			cate = _.extend({}, cate, {is_active:false});

			cate.children.forEach(function(ct, idx){
				ct = _.extend({}, ct, {is_active:false});
				cate.children[idx] = ct;

				if (ct.slug === req.params.category) {
					res.locals.category = ct;
					res.locals.root_category = cate;
					ct.is_active = true;
				}
			});

			if (cate.slug === req.params.category) {
				cate.is_active = true;
				res.locals.category = cate;
				res.locals.root_category = cate;
			}
		});

		// in sale
		if (req.query.sale === 'true') {
			res.locals.in_sale = true;
		}
	}
};
