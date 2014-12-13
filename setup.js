'use strict';

var shasum = require('crypto').createHash('sha1');
var fs = require('fs');
var lwip = require('lwip');
var sqlite3 = require('sqlite3').verbose();
var exists = fs.existsSync(__dirname + '/fastshop.db');
var db = new sqlite3.Database('fastshop.db');
var _ = require('underscore');

if (exists) return;

// users
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR, email VARCHAR, password VARCHAR)', function(){
	shasum.update('1234'); // user password
	db.run('INSERT INTO users (email, name, password) VALUES (?, ?, ?)', 'user@mail.com', '수강생1', shasum.digest('hex'));
});

// categories
db.run('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, parent_id INTEGER, slug VARCHAR, name VARCHAR)', function(){
	var cate = {
		'Clothing' : ['Dresses', 'Jackets / Coats', 'Jeans', 'Lingerie', 'Shorts', 'Skirts'],
		'Shoes' : ['Boots', 'Flats', 'Sandals', 'Sneakers'],
		'Bags' : ['Baby Bags', 'Backpacks', 'Clutches', 'Luggage', 'Totes'],
		'Accessories' : ['Jewelry', 'Belts', 'Gloves', 'Hats', 'Travel', 'Watches']
	};

	// create the unique index for slug
	db.run('CREATE UNIQUE INDEX IF NOT EXISTS category_slug ON categories (slug)');

	var stmt = db.prepare('INSERT INTO categories (parent_id, slug, name) VALUES (?, ?, ?)'), index = 1;
	_.each(cate, function(arr, key){
		var parent_id = index++;
		stmt.run(0, slugify(key), key);
		_.each(arr, function(val){
			stmt.run(parent_id, slugify(val), val);
			index++;
		});
	});
	stmt.finalize();
});

// products
db.run('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER, name VARCHAR, description TEXT, price INTEGER, retail_price INTEGER, images TEXT)', function(){
	var samples = [
		{
			$category : 3,
			$name : 'Ludlow Hooded Leather Jacket',
			$description : 'Horizontal zip pockets detail the placket of a chic Ever leather jacket, for a structured, edgy feel. Topstitching accents the cuffs and hem, and the hooded silhouette lends a sporty element. Cozy mid-weight jersey lines the inside. Exposed vertical zips detail the back hem.',
			$price : 94200,
			$retail_price : 100000,
			$images : 'sample1_1.jpg\nsample1_2.jpg\nsample1_3.jpg\nsample1_4.jpg'
		},
		{
			$category : 2,
			$name : 'Joie',
			$description : 'Scalloped eyelash trim softens the edges of a ladylike lace Joie dress. The versatile piece is styled with a V neckline, and an A-line profile lends movement to the skirt. Hidden side zip. Lined.\n\nFabric: Lace.\nShell: 58% nylon/42% cotton.\nLining: 100% polyester.\nDry clean.\nImported, China.',
			$price : 298000,
			$retail_price : 0,
			$images : 'sample2_1.jpg\nsample2_2.jpg\nsample2_3.jpg'
		},
		{
			$category : 2,
			$name : 'Nikolina B Lace Dress',
			$description : 'Ruched sides fan figure-flattering ripples across the fitted skirt of this striped jersey SUNDRY dress. A loose tank bodice offers relaxed balance. Scoop neckline. Double-layered skirt.\n\nFabric: Slubbed jersey.\n95% cotton/5% spandex.\nWash cold.\nMade in the USA.',
			$price : 136000,
			$retail_price : 0,
			$images : 'sample3_1.jpg\nsample3_2.jpg\nsample3_3.jpg\nsample3_4.jpg'
		},
		{
			$category : 4,
			$name : 'One Teaspoon',
			$description : 'Retro-inspired light wash jeans in a slouchy 5-pocket silhouette are given a well-loved look with revealing shredded patches. Single-button closure and zip fly.\n\nFabric: Denim.\n100% cotton.\nWash cold.\nImported, China.\n\nMEASUREMENTS\nRise: 8.5in / 21.5cm\nInseam: 28in / 71cm\nLeg opening: 12in / 30.5cm',
			$price : 149000,
			$retail_price : 165000,
			$images : 'sample4_1.jpg\nsample4_2.jpg\nsample4_3.jpg\nsample4_4.jpg'
		},
		{
			$category : 10,
			$name : 'Samara Leopard Haircalf Flats',
			$description : 'Packable Yosi Samra ballet flats, updated in spotted haircalf for a daring look. Soft elastic top line and split rubber sole.\n\nFur: Dyed haircalf (cow), from China.\nImported, China.\nThis item cannot be gift-boxed.',
			$price : 75000,
			$retail_price : 0,
			$images : 'sample5_1.jpg\nsample5_2.jpg\nsample5_3.jpg\nsample5_4.jpg'
		}
	];

	var stmt = db.prepare('INSERT INTO products (category_id, name, description, price, retail_price, images) VALUES ($category, $name, $description, $price, $retail_price, $images)');
	_.each(samples, function(data){ stmt.run(data); });
	stmt.finalize();
});

// product options
db.run('CREATE TABLE IF NOT EXISTS product_options (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, name VARCHAR, stock INTEGER, \'order\' INTEGER, active BOOLEAN)', function(){
	db.run('CREATE INDEX IF NOT EXISTS product ON product_options (product_id)');

	var sampleOptions = [
		{$product_id : 1, $name : 'Green|S', $order : 1},
		{$product_id : 1, $name : 'Green|M', $order : 2},
		{$product_id : 1, $name : 'Green|L', $order : 3},
		{$product_id : 1, $name : 'Brown|M', $order : 5},
		{$product_id : 1, $name : 'Brown|L', $order : 6},
		{$product_id : 2, $name : 'Caviar|XS', $order : 1},
		{$product_id : 2, $name : 'Caviar|S', $order : 2},
		{$product_id : 2, $name : 'Caviar|M', $order : 3},
		{$product_id : 2, $name : 'Caviar|L', $order : 4},
		{$product_id : 3, $name : 'Pearl|1', $order : 1},
		{$product_id : 3, $name : 'Pearl|2', $order : 2},
		{$product_id : 3, $name : 'Pearl|3', $order : 3},
		{$product_id : 4, $name : 'Fiasco|24', $order : 1},
		{$product_id : 4, $name : 'Fiasco|26', $order : 2},
		{$product_id : 4, $name : 'Fiasco|28', $order : 3},
		{$product_id : 4, $name : 'Fiasco|30', $order : 4},
		{$product_id : 5, $name : 'Leopard|5', $order : 1},
		{$product_id : 5, $name : 'Leopard|6', $order : 2},
		{$product_id : 5, $name : 'Leopard|7', $order : 3},
		{$product_id : 5, $name : 'Leopard|8', $order : 4},
		{$product_id : 5, $name : 'Leopard|9', $order : 5},
		{$product_id : 5, $name : 'Leopard|10', $order : 6}
	];

	var stmt = db.prepare('INSERT INTO product_options (product_id, name, stock, \'order\', active) VALUES ($product_id, $name, 10, $order, 1)');
	_.each(sampleOptions, function(data){ stmt.run(data) });
	stmt.finalize();
});

// carts
db.run('CREATE TABLE IF NOT EXISTS carts (user_id INTEGER, option_id INTEGER, quantity INTEGER)', function(){
	db.run('CREATE UNIQUE INDEX cart_id ON carts (user_id, option_id)');
});

// creating thumbnails
fs.readdir(__dirname+'/files', function(err, files){
	
	// dir for thumbnail
	_.each(['small','middle'], function(dir){
		var dir = __dirname + '/files/' + dir;
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);
	});
	
	_.each(files, function(file){
		if (!/\.(jpg|png)$/.test(file)) return;
		lwip.open(__dirname + '/files/'+file, function(err, image){
			// small image
			image.clone(function(err, clone){
				resizeTo(clone, 102*2, 181*2, __dirname+'/files/small/'+file);
			});
			
			// middle image
			image.clone(function(err, clone){
				resizeTo(clone, 217*2, 386*2, __dirname+'/files/middle/'+file);
			});
		});
	});
});

function slugify(text) {
	return text.toLowerCase().replace(/\W+/g, '_').replace(/_{2,}/g, '_');
}

function resizeTo(image, width, height, filename) {
	var w = image.width(), h = image.height(), b = image.batch();

	if (w / h > width / height) {
		b = b.resize(Math.ceil(w*height/h), height);
	} else {
		b = b.resize(width, Math.ceil(h*width/w));
	}

	b.crop(width, height).writeFile(filename, function(err){ });
}
