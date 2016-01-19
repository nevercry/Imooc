var Movie = require('../models/movie')
var Category = require('../models/category')

// index page 
exports.index = function(req, res) {
	Category
		.find()
		.populate({path: 'movies', options: {limit: 5}})
		.exec(function(err, categories) {
			if (err) {
			console.log(err)
		}

		res.render('index', {
			title: 'imooc 首页',
			categories: categories
		})
	})		
}

// search page 
exports.search = function(req, res) {
	var catId = req.query.cat
	var page = Number(req.query.p)
	var count = 2
	var index = page * count

	Category
		.find({_id: catId})
		.populate({
			path: 'movies',
		})
		.exec(function(err, categories) {
			if (err) {
			console.log(err)
		}

		var category = categories[0] || {}
		var movies = category.movies || []
		var results = movies.slice(index, index + count)

		res.render('results', {
			title: 'imooc 结果列表页',
			keyword: category.name,
			currentPage: (1 + page),
			query: 'cat=' + catId,
			totalPage: Math.ceil(movies.length / count),
			movies: results
		})
	})		
}