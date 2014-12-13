'use strict';

var util = require(__dirname + '/../lib/util');

module.exports = function(app) {
	var db = {}, _ = app._, Q = app.Q;
	
	app.use(function(req, res, next){
		if (/^\/admin(\/|$)/.test(req.path)) {
			res.locals.layout = 'admin/layout';
		}
		next();
	});

	app.get('/admin', function(req, res){
		res.render('admin/dashboard');
	});

	app.get('/admin/products', function(req, res){
		app.models.Product.find({orderBy:'id DESC'}).then(function(products){
			res.locals.products = products;
			res.render('admin/product_list');
		});
	});
	
	app.post('/admin/products', function(req, res){
		var images = (req.body.images||'').replace();
		var files = req.files.file || [];
		
		if (!_.isArray(files)) files = [files];

		_.each(files, function(file, idx){
			//util.createThumbnail(__dirname + '/../' + file.path);
			images = images.replace(new RegExp('^!'+(idx+1)+'$','m'), file.name);
		});
		
		req.body.images = images;

		var product = new app.models.Product();
		product.set(req.body).save()
			.then(function(dbResult){
				var result = {status:'ok', id:dbResult.id, images: images.split('\n')};
			
				product.set('id', dbResult.id);
			
				// product options
				var options = JSON.parse(req.body.options||'[]');

				var defers = _.map(options, function(opt, idx){
					var option = new app.models.ProductOption(opt);
					option.set('product_id', opt.product_id = product.id);
					option.set('order', idx+1);
					return option.save().then(function(dbResult){
						opt.id = dbResult.id;
					});
				});
			
				Q.all(defers)
					.then(function(){
						result.options = options;
					})
					.fail(function(err){
						console.error(err.stack);
					})
					.fin(function(){
						res.json(result);
					});
			})
			.fail(function(err){
				var result = {status:'error', error:err.message};
				console.error(err.stack);
				res.json(result);
			});
	});

	app.get('/admin/products/:product_id', function(req, res){
		app.models.Product.findOne({$id:req.params.product_id}).then(function(product){
			res.locals.product = product;
			product.getChanges();
			product.loadOptions().fin(function(){ res.render('admin/product'); });
		});
	});

	app.get('/admin/users', function(req, res){
		res.render('admin/user_list');
	});
};
