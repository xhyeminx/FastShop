'use strict';

module.exports = function(app) {
	var Base = require(__dirname + '/../lib/model.js')(app);
	
	var Product = Base.extend({
		table : 'products',
		defaults : {options:[]},
		fields : ['category_id', 'name', 'description', 'price','retail_price', 'images'],
		images : [],
		initialize : function(data) {
			this.processImage();
			this.findCategory();
		},
		loadOptions : function() {
			var self = this, defer = app.Q.defer();

			if (this.attrs.options.length) {
				app._.defer(function(){ defer.resolve(); });
				return defer;
			}

			app.models.ProductOption.find({$product_id:this.attrs.id, orderBy:'`order`'})
				.then(function(options){
				console.log(options);
					self.attrs.options = options;
					defer.resolve(options);
				})
				.fail(function(err){
					defer.reject(err);
				});

			return defer.promise;
		},
		findCategory : function() {
			if (this.attrs.category_id)	{
				var children = app._.pluck(app.locals.categories, 'children');
				children = app._.flatten(children);
				this.category = app._.findWhere(children, {id:+this.attrs.category_id});
			}
		},
		processImage : function() {
			if (this.attrs.images_l) return;

			var images = (this.attrs.images||'').split('\n');
			this.attrs.images_l = app._.map(images, function(img, idx){ return {index:idx, name:img, url:'/files/'+img}; });
			this.attrs.images_m = app._.map(images, function(img, idx){ return {index:idx, name:img, url:'/resize/434x772/'+img}; });
			this.attrs.images_s = app._.map(images, function(img, idx){ return {index:idx, name:img, url:'/resize/204x362/'+img}; });
		}
	});

	app.models.Product = Product;

	return Product;
};