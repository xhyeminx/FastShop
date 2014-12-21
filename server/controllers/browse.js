'use strict';

var util = require(__dirname + '/../lib/util');

module.exports = function(app) {
	// common task
	app.use(function(req, res, next){
		if (!/^\/(browse|api\/products)(\/|$)/.test(req.path)) return next();

		// get categories
		Category.find({$parent_id : 0})
			.then(function(objs){
				res.locals.categories = _.map(objs, function(obj){ return obj.toJSON(); });
			})
			.fail(function(err){
				console.error('[ERROR] '+err);
			})
			.fin(function(){
				next();
			});
		
		// in_sale variable
		res.locals.in_sale = (req.body.sale === 'true');
	});

	app.get('/browse', function(req, res){
		res.redirect('/browse/all');
	});

	app.get('/browse/:category', function(req, res){
		var sql = 'SELECT * FROM products', where = {filter:[]};
		
		_.each(res.locals.categories, function(obj){
			if (req.params.category === obj.slug) {
				res.locals.root_category = obj;
				res.locals.category = obj;
			} else {
				_.each(obj.children, function(child) {
					if (req.params.category === child.slug) {
						res.locals.root_category = obj;
						res.locals.category = child;
						child.is_active = true;
					}
				});
			}
		});

		if (req.params.category != 'all') {
			where.$category_id = [res.locals.category.id];
			_.each(res.locals.category.children, function(c){ where.$category_id.push(c.id); });
		}

		if (req.query.q) {
			where.filter.push('(name LIKE \'%'+req.query.q+'%\' OR description LIKE \'%'+req.query.q+'%\')');
		}

		if (req.query.sale === 'true') {
			where.filter.push('(retail_price > 0)');
		}
		
		Product.find(where).then(
			function(products){
				res.locals.products = _.map(products, function(product){ return product.toJSON() });
				res.render('category');
			},
			function(err) {
				console.error('[ERROR] '+err);
				res.status(500).send(err);
			}
		);
	});

	app.get('/browse/:category/:product_id', function(req, res){
		Product.get(req.params.product_id)
			.then(function(prod){
				res.locals.product = prod.toJSON();

				return Product.find({$category_id:prod.category.id, filter:'id != '+prod.category.id, limit:6});
			})
			.then(function(products){
				res.locals.suggestion = products;
			}, function(err){
				console.log(err.stack);
			})
			.fin(function(){
				res.render('product');
			});
	});

	// APIs
	app.get('/api/products', function(req, res){

	});

	// product information
	app.get('/api/products/:product_id', function(req, res){
		db.get('SELECT * FROM products WHERE id = ?', req.params.product_id, function(err, product){
			res.locals.product = product;
			util.populateProduct(product, function(){
				res.json(product);
			});
		});
	});

	// product options
	app.get('/api/products/:product_id/options(/:color)?', function(req, res){
		db.all('SELECT * FROM product_options WHERE product_id = ? ORDER BY `order`', req.params.product_id, function(err, options){
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
};
