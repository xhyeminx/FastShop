'use strict';

(function () {

var categories = {};

var Category = Base.extend({
	table : 'categories',
	defaults : {parent_id:0},
	fields : ['name', 'slug'],
	initialize : function(attrs) {
		if (this.id && !categories[this.id]) {
			categories[this.id] = this;
		}
		this.children = [];
	},
	loadChildren : function() {
		var self = this, defer = Q.defer();

		Category.find({$parent_id:this.id}).then(
			function(objs) {
				defer.resolve(self.children = objs);
			},
			function(err) {
				defer.reject(err);
			}
		);

		return defer.promise;
	},
	hasParent : function() {
		return !!this.attrs.parent_id;
	},
	toJSON : function() {
		return {
			id : this.id,
			name : this.attrs.name,
			slug : this.attrs.slug,
			hasParent : this.hasParent(),
			children : _.map(this.children, function(obj){ return obj.toJSON(); })
		}
	}
});

var find = Category.find.bind(Category);
Category.find = function(where, callback) {
	var defer = Q.defer();

	find(where).then(
		function(objs){
			var defers = [];

			_.each(objs, function(obj){
				if (!obj.attrs.parent_id) {
					defers.push(obj.loadChildren());
				}
			});

			Q.all(defers).then(
				function() {
					defer.resolve(objs);
					if (_.isFunction(callback)) callback(objs);
				},
				function(err) {
					console.error(err);
					defer.reject(err);
				}
			);
		},
		function(err){
			console.error(err);
			defer.reject(err);
		}
	);

	return defer.promise;
};
	
Category.get = function(id, callback) {
	var defer = Q.defer();

	if (categories[id]) {
		defer.resolve(categories[id]);
		if (_.isFunction(callback)) callback(categories[id]);
	} else {
		Category.find({$id:id}).then(
			function(obj) {
				defer.resolve(obj[0] || null);
				if (_.isFunction(callback)) callback(obj[0] || null);
			},
			function(err) {
				consoel.error(err.stack);
				defer.reject(err);
			}
		);
	}

	return defer.promise;
};

module.exports = {name : 'Category', model : Category};

})();