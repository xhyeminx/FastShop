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
	createThumbnail : function(filepath) {
		var defer = Q.defer();
		
		if (!lwip) lwip = require('lwip');
console.log(filepath);
		var filename = filepath.match(/[^\/]+$/)[0];
		
		lwip.open(filepath, function(err, image){
			if (err) return defer.reject(err);

			// small image
			image.clone(function(err, clone){
				resizeTo(clone, 102*2, 181*2, __dirname+'/../files/small/'+filename);
			});
			
			// middle image
			image.clone(function(err, clone){
				resizeTo(clone, 217*2, 386*2, __dirname+'/../files/middle/'+filename);
			});

			defer.resolve();
		});
		
		return defer.promise;
	},
	populateProduct : function(raw, callback) {
		raw.description = (raw.description||'').replace(/\r?\n/, '<br>');

		raw.images = raw.images.split('\n');
		raw.images_l = []; raw.images_m = []; raw.images_s = [];
		_.each(raw.images, function(file, idx){
			var base = {
				index: idx,
				large_url : '/files/' + file,
				middle_url : '/files/middle/' + file,
				small_url : '/files/small/' + file
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

		
	}
};

function resizeTo(image, width, height, filename) {
	var w = image.width(), h = image.height(), b = image.batch();

	if (w / h > width / height) {
		b = b.resize(Math.ceil(w*height/h), height);
	} else {
		b = b.resize(width, Math.ceil(h*width/w));
	}

	b.crop(width, height).writeFile(filename, function(err){ });
}