'use strict';

module.exports = function(app) {
	app.get('/cart', function(req, res){

	});

	app.get('/api/cart', function(req, res){
		if (!req.session.user) {
			res.status(403).json({error:'회원 권한이 필요합니다.'});
			return false;
		}

		var userId = req.session.user.id;

		app.db.all('SELECT * FROM carts WHERE user_id=?', userId, function(err, rows){
			if (err) return res.status(500).json({error:'데이터베이스 에러'});

			var ids = [], rowById = {};
			app._.each(rows, function(row){
				ids.push(row.option_id);
				rowById[row.option_id] = row;
			});

			app.db.all(
				'SELECT o.id option_id, o.name option_name, o.stock, p.* FROM product_options o, products p WHERE o.id IN ('+ids.join(',')+') AND o.product_id=p.id',
				function(err, rows) {
					if (err) return res.status(500).json({error:'데이터베이스 에러'});
					
					app._.each(rows, function(row, idx){
						var product = app._.pick(row, 'id', 'name', 'description', 'price', 'retail_price');
						var option  = {id:row.option_id, stock:row.stock};
						var optionName = row.option_name.split('|');
						
						option.color = optionName[0];
						option.size = optionName[1];
						option.product = product;
						option.quantity = rowById[option.id].quantity;
						
						var images = row.images.split('\n');
						product.images_l = app._.map(images, function(url){ return {url:'/files/'+url} });
						product.images_m = app._.map(images, function(url){ return {url:'/resize/434x772/'+url, width:434, height:772} });
						product.images_s = app._.map(images, function(url){ return {url:'/resize/204x362/'+url, width:204, height:362} });

						rows[idx] = option;
					});
					
					res.json({status:1, status_text:'OK', items:rows});
				}
			);
		});
	});

	app.post('/api/cart', function(req, res){
		if (!req.session.user) {
			res.status(403).json({error:'회원 권한이 필요합니다.'});
			return false;
		}

		where = {
			$user_id : req.session.user_id,
			$option_id : req.body.option_id,
			$quantity : req.body.quantity || 1
		};

		app.db.get(
			'SELECT * FROM carts WHERE user_id=$user_id AND option_id=$option_id',
			where,
			function(err, row) {
				var sql = '';

				if (err) return res.status(500).json({error:'데이터베이스 에러'});
				if (row) {
					sql = 'INSERT INTO carts (user_id, option_id, quantity) VALUES ($user_id, $option_id, $quantity)';
				} else {
					sql = 'UPDATE carts SET quantity=$quantity WHERE user_id=$user_id AND option_id=$option_id';
				}
				
				app.db.run(sql, where, function(err){
					if (err) return res.status(500).json({error:'데이터베이스 에러'});
					res.json({status:1, statusText:'OK'});
				});
			}
		);
	});
	
	app.put('/api/cart/:option_id', function(req, res){
		if (!req.session.user) {
			res.status(403).json({error:'회원 권한이 필요합니다.'});
			return false;
		}
		
		var where = {
			$user_id : req.session.user.id,
			$option_id : req.params.option_id
		};
		
		app.db.get(
			'SELECT * FROM carts WHERE user_id=$user_id AND option_id=$option_id',
			where,
			function(err, row){
				if (err) return res.status(500).json({error:'데이터베이스 에러: '+err});
				
				where.$quantity = req.body.quantity;
				
				app.db.run(
					'UPDATE carts SET quantity=$quantity WHERE user_id=$user_id AND option_id=$option_id',
					where,
					function(err) {
						if (err) return res.status(500).json({error:'데이터베이스 에러: '+err});
						res.json({status:1, statusText:'OK'});
					}
				);
			}
		);
	});

	app.delete('/api/cart/:option_id', function(req, res){
		if (!req.session.user) {
			res.status(403).json({error:'회원 권한이 필요합니다.'});
			return false;
		}
		
		app.db.run(
			'DELETE FROM carts WHERE user_id=$user_id AND option_id=$option_id',
			{$user_id:req.session.user.id, $option_id:req.body.option_id},
			function(err) {
				if (err) return res.status(500).json({error:'데이터베이스 에러'});
				res.json({status:1, statusText:'OK'});
			}
		);
	});
};
