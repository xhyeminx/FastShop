'use strict';

var Q = require('q');
var _ = require('underscore');
var humanize = require('humanize');
var env = {};
var lwip;

module.exports = {
	set : function(name, value) {
		env[name] = value;
		return this;
	},
	get : function(name) {
		return env[name];
	},
	// bind for promise
	swear : function(obj, func) {
		return function() {	
			var defer = Q.defer(), args = [];
			args.push.apply(args, arguments);
			args.push(function(err){
				if (err) {
					defer.reject(err);
				} else {
					var args = [];
					args.push.apply(args, arguments);
					args.shift(); // remove the first arguments, err.
					defer.resolve.apply(defer, args);
				}
			});
			obj[func].apply(obj, args);
			return defer.promise;
		};
	},
	populateProduct : function(raw, callback) {
		raw.description = (raw.description||'').replace(/\r?\n/, '<br>');

		raw.images = raw.images.split('\n');
		raw.images_l = []; raw.images_m = []; raw.images_s = [];
		_.each(raw.images, function(file, idx){
			var base = {
				index: idx,
				large_url : '/files/' + file,
				middle_url : '/resize/434x772/' + file,
				small_url : '/resize/204x362/' + file
			};

			raw.images_l.push(_.extend({url:base.large_url}, base));
			raw.images_m.push(_.extend({url:base.middle_url}, base));
			raw.images_s.push(_.extend({url:base.small_url}, base));
		});

		raw.price$ = humanize.numberFormat(raw.price, 0);
		raw.retail_price$ = humanize.numberFormat(raw.retail_price, 0);

		_.each(env['app'].locals.categories, function(cate) {
			var parent = cate;

			if (raw.category_id !== cate.id) {
				cate = _.findWhere(cate.children, {id: raw.category_id});
			}

			if (cate && raw.category_id === cate.id) {
				raw.category = cate;
				return false;
			}
		});

		if (!_.isFunction(callback)) return;

		callback(raw);
	}
};