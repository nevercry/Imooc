var _ = require('underscore')
var Movie = require('../models/movie')
var Category = require('../models/category')
var Comment = require('../models/comment')
var fs = require('fs')
var path = require('path')
var multer = require('multer')

// list page 
exports.list =  function(req, res) {
	Movie.fetch(function(err, movies){
		if (err) {
			console.log(err)
		}

		res.render('list', {
			title: 'imooc 列表页',
			movies: movies
		})
	})
}

// list delete movie
exports.del = function(req, res) {
	var id = req.query.id

	if (id) {
		Movie.remove({_id: id}, function(err, movie) {
			if (err) {
				console.log(err) 
			} else {
				res.json({success: 1})
			}
		})
	}
}

// detail page 
exports.detail = function(req, res) {
	var id = req.params.id

	Movie.findById(id, function(err, movie) {
		Comment
			.find({movie: id})
			.populate('from', 'name')
			.populate('reply.from reply.to', 'name')
			.exec(function(err, comments) {
				console.log('comments:')
				console.log(comments)
				res.render('detail', {
					title: movie.title,
					movie: movie,
					comments: comments
				})	
			})
	})
}

// admin poster 
exports.savePoster = function(req, res, next) {
	console.log(req.file)
	var posterData = req.file
	var filePath =  posterData.path
	var originalname = posterData.originalname

	if (originalname) {
		console.log('有原始图片名字')
		fs.readFile(filePath, function(err, data) {
			console.log('修改保存图片')
			var timestamp = Date.now()
			var type = posterData.mimetype.split('/')[1]
			var poster = timestamp + '.' + type
			var newPath = path.join(__dirname, '../../', 'public/upload/' + poster)

			fs.writeFile(newPath, data, function(err) {
				req.poster = poster
				next()
			})
		})
	}
	else {
		next()
	}
}

// admin post movie
exports.save = function(req, res) {
	var id = req.body.movie._id
	var movieObj = req.body.movie
	var _movie

	if (req.poster) {
		movieObj.poster = req.poster
	}

	if (id) {
		Movie.findById(id, function(err, movie) {
			if (err) {
				console.log(err)
			}

			_movie = _.extend(movie, movieObj)
			_movie.save(function(err, movie) {
				if (err) {
					console.log(err)
				}

				res.redirect('/movie/' + movie._id)
			})
		})
	} else {
		_movie = new Movie (movieObj)

		var categoryId = movieObj.category
		var categoryName = movieObj.categoryName

		console.log(movieObj)

		_movie.save(function(err, movie) {
			if (err) {
				console.log(err)
			}


			if (categoryId) {
				Category.findById(categoryId, function(err, category) {
					category.movies.push(_movie._id)
					category.save(function(err, category) {
						res.redirect('/movie/' + movie._id)
					})
				})
			} else if (categoryName) {
				var category = new Category({
					name: categoryName,
					movies: [movie._id]
				})

				category.save(function(err, category) {
					movie.category = category._id
					movie.save(function(err, movie) {
						res.redirect('/movie/' + movie._id)
					})
				})
			}
		})
	} 	
}

// admin  new page 
exports.new =  function(req, res) {
	Category.find({}, function(err, categories) {
		res.render('admin', {
		title: 'imooc 后台录入页',
		categories: categories,
		movie: {}
		})
	})
}

// admin update  movie
exports.update = function(req, res) {
	var id = req.params.id

	if (id) {
		Movie.findById(id, function(err, movie) {
			Category.find({}, function(err, categories) {
				res.render('admin', {
				title: 'imooc 后台更新页',
				movie: movie,
				categories: categories
				})
			})
		})
	}
}