'use strict';

module.exports = function(app) {
	app.get('/cart', function(req, res){

	});

	app.get('/api/cart', function(req, res){
		if (!req.session.user) {
			res.status(403).json({error:'회원 권한이 필요합니다.'});
			return false;
		}

		app.db.all('SELECT * FROM carts WHERE user_id=?', req.session.user.id, function(err, rows){
			if (err) return res.status(500).json({error:'데이터베이스 에러'});
			res.json({test:'okay'});
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
			$quantity : req.body.qty || 1
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
					res.redirect('/api/cart');
				});
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
				res.redirect('/api/cart');
			}
		);
	});
};
