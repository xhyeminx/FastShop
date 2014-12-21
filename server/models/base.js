'use strict';

module.exports = function(){
	var Base = function(){};

	Base.prototype = {
		constructor : Base,
		table : '',
		attrs : {},
		defaults : {},
		fields   : [],
		db : null,
		_listeners : [],
		initialize : function(){},
		toJSON : function(){ return {} }
	};

	Base.extend = function(definition) {
		var initializer = function(attrs) {
			this.attrs = _.extend({}, this.defaults, attrs);
			this.prevAttrs = _.clone(this.attrs);
			this._listeners = [];
			
			Object.defineProperty(this, 'id', {
				get: idGetter,
				set: _.noop,
				enumerable : true,
				configurable : true
			});

			if (_.isFunction(this.initialize)) {
				this.initialize.apply(this, arguments);
			}
		};

		_.extend(initializer, this);
		_.extend(initializer.prototype, Base.prototype, definition);
		
		return initializer;
	};

	Base.all = function(callback) {
		return this.find({}, callback);
	};

	Base.get = function(id, callback) {
		return this.findOne({$id:id}, callback);
	};

	Base.find = function(where, callback) {
		var sql = 'SELECT * FROM ' + this.prototype.table, filter;
		
		if (!where) where = {};
		filter = where.filter || [];
		delete where.filter;

		if (typeof filter == 'string') filter = [filter];

		_.each(where, function(value, key){
			if (key.substr(0,1) !== '$') return;
			if (Array.isArray(value)) {
				value = _.map(value, function(v){ 
					if (typeof v === 'string') return '\'' + v + '\'';
					else return v;
				});
				filter.push('(' + key.substr(1) + ' IN (' + value.join(',') + '))');
			} else {
				filter.push('(' + key.substr(1) + ' = ' + key + ')');
			}
		});
		
		if (filter.length) sql += ' WHERE ' + filter.join(' AND ');

		if (where.orderBy) {
			sql += ' ORDER BY ' + where.orderBy;
			delete where.orderBy;
		}

		if (where.limit) {
			sql += ' LIMIT ' + where.limit;
			delete where.limit;
		}

		var defer = Q.defer(), Class = this;

		db.all(sql, where, function(err, rows){
			if (err) return defer.reject(err);

			rows = _.map(rows, function(row){ return new Class(row); });
			defer.resolve(rows);

			if (_.isFunction(callback)) callback(rows);
		});

		return defer.promise;
	};

	Base.findOne = function(where, callback) {
		var _where = _.extend({}, where, {limit:1}), defer = Q.defer(), Class = this;

		this.find(_where)
			.then(function(objs){
				defer.resolve(objs[0]||null);
				if (_.isFunction(callback)) callback(null, objs[0]||null);
			})
			.fail(function(err){
				defer.reject(err);
				if (_.isFunction(callback)) callback(err);
			});

		return defer.promise;
	};

	Base.prototype.getChanges = function() {
		var attr, prev, diff = {};
		
		attr = _.pick.apply(_, [this.attrs].concat(this.fields));
		prev = _.pick.apply(_, [this.prevAttrs].concat(this.fields));
		
		_.each(prev, function(v, k){
			if ((k in attr)	&& attr[k] === v) {
				delete attr[k];
			}
		});

		return attr;
	};

	Base.prototype.save = function() {
		var self = this, defer = Q.defer(), fields = {}, sql;

		if (this.attrs.id) {
			var changes = this.getChanges();

			if (_.isEmpty(changes)) {
				_.defer(function(){ defer.resolve(); });
			} else {
				fields.$id = this.attrs.id;

				// update the data
				sql = 'UPDATE ' + this.table + ' SET ';
				_.each(changes, function(value, name){
					sql += '\''+name+'\'=$'+name+',';
					fields['$'+name] = value;
				});
				sql = sql.substr(0, sql.length-1);
				sql += ' WHERE id=$id';
			}
		} else {
			// insert new data
			var attr, keys;

			attr = _.pick.apply(_, [this.attrs].concat(this.fields));
			keys = _.keys(attr);
			sql = 'INSERT INTO ' + this.table + ' (\'' + keys.join('\',\'') + '\') VALUES ($'+keys.join(',$')+')';
			
			_.each(attr, function(value, key){
				fields['$'+key] = value;
			});
		}

		db.run(sql, fields, function(err){
			if (err) return defer.reject(err);
			defer.resolve({id:fields.$id || this.lastID, changes:this.changes});
		});

		return defer.promise;
	};

	Base.prototype.get = function(name) {
		return this.attrs[name];
	};

	Base.prototype.set = function(name, value) {
		if (_.isObject(name)) {
			_.extend(this.attrs, name);
		} else {
			this.attrs[name] = value;
			if (name === 'id') this.id = value;
		}
		return this;
	};

	Base.prototype.on = function(type, callback) {
		if (!_.isArray(this._listeners[type])) {
			this._listeners[type] = [];
		}
		this._listeners[type].push(callback);

		return this;
	};

	Base.prototype.off = function(type, callback) {
		var arr = this._listeners[type];
		if (_.isArray(arr)) {
			this._listeners[type] = _.without(arr, callback);
		}
		return this;
	};

	Base.prototype.trigger = function(type) {
		var args = [];
		
		[].push.apply(args, arguments);
		args.unshift();

		_.each(this._listeners[type]||[], function(listener){
			listener(args);
		});

		return this;
	};

	Base.prototype.remove = function(callback) {
		var defer = Q.derfer();

		if (this.id) {
			db.run('DELETE FROM ' + this.table + ' WHERE id=?', this.id, function(err){
				if (err) return defer.reject(err);
				defer.resolve();
			});
		} else {
			_.defer(function(){ defer.resolve(); });
		}

		return defer.promise;
	};

	function idGetter() {
		return this.attrs.id;
	}

	return {name:'Base', model:Base};
}();