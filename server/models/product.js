'use strict';

(function() {

var humanize = require('humanize');

var Product = Base.extend({
	table : 'products',
	fields : ['category_id', 'name', 'description', 'price','retail_price', 'images'],
	images : [],
	loadOptions : function() {
		var self = this, deferOption, deferCategory;

		if (this.options && this.category) return Q.defer().promise.resolve();
		
		deferOption = ProductOption.find({$product_id:this.id, orderBy:'`order`'}).then(function(options){ self.options = options; });
		deferCategory = Category.get(this.attrs.category_id).then(function(obj){ self.category = obj; });

		return Q.all([deferOption, deferCategory]).fail(function(err) { console.error('[ERROR] ' + err); });
	},
	toJSON : function() {
		var obj = _.pick(this.attrs, 'name', 'description', 'price', 'retail_price');
		var images = (this.attrs.images||'').split('\n');
		obj.images_l = _.map(images, function(img, idx){ return {index:idx, name:img, url:'/files/'+img}; });
		obj.images_m = _.map(images, function(img, idx){ return {index:idx, name:img, url:'/resize/434x772/'+img}; });
		obj.images_s = _.map(images, function(img, idx){ return {index:idx, name:img, url:'/resize/204x362/'+img}; });

		obj.options = _.map(this.options, function(opt){ return opt.toJSON(); });
		obj.category = this.category ? this.category.toJSON() : null;

		// number format
		obj.price$ = humanize.numberFormat(obj.price, 0);
		obj.retail_price$ = humanize.numberFormat(obj.retail_price, 0);

		// product url
		obj.url = '/browse/' + obj.category.slug + '/' + this.id;
		
		// id
		obj.id = this.id;
		
		return obj;
	}
});
	
var find = Product.find.bind(Product);
Product.find = function(where, callback) {
	var defer = Q.defer();

	find(where).then(
		function(objs){
			var defers = _.map(objs, function(obj){
				return obj.loadOptions();
			});

			Q.all(defers).then(
				function() {
					defer.resolve(objs);
					if (_.isFunction(callback)) callback(objs);
				},
				function(err) {
					console.error(err.stack);
					defer.reject(err);
				}
			);
		},
		function(err){
			console.error(err.stack);
			defer.reject(err);
		}
	);

	return defer.promise;
};

module.exports = {name : 'Product', model : Product};

})();
