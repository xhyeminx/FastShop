'use strict';

module.exports = function(app) {
	var fs = require('fs');
	var jimp = require('jimp');
	
	app.get(/^\/resize\/(\d+)x(\d+)\/(.+)$/, function(req, res, next){
		var width = +req.params[0], height = +req.params[1], file = req.params[2], ext;
		var path = 'files/'+width+'x'+height;
		
		// create a image cache directory
		if (!fs.existsSync(path)) fs.mkdirSync(path);
        if (!fs.existsSync(path)) return res.status(500).end('Cannot create directory: ' + path);
		
		path += '/' + file;
		file  = 'files/' + file;
		ext   = (file.match(/\.(png|jpg)$/)||[])[1];
		
		// if the extension is neither png or jpg,
		// end the request with 400 Bad Request.
		if (!ext) return res.status(400).end();
		
		// if the source file doesn't exist return 404.
		if (!fs.existsSync(file)) return res.status(404).end();

		// if resized image does already exist use it.
		if (fs.existsSync(path)) return res.redirect('/'+path);

		// create new resized image
		new jimp(file, function(){
			var sourceWidth = this.bitmap.width, sourceHeight = this.bitmap.height, image;

			if (sourceWidth / sourceHeight > width / height) {
				image = this.resize(Math.round(sourceWidth*height/sourceHeight), height);
			} else {
				image = this.resize(width, Math.round(sourceHeight*width/sourceWidth));
			}

			image.crop(0, 0, width, height).write(path, function(){
				if (fs.existsSync(path)) {
					res.redirect('/'+path);
				} else {
					res.status(500).end('Cannot write resized image');
				}
			});
		});
	});
};