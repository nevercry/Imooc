var Index = require('../app/controllers/index')
var User = require('../app/controllers/user')
var Movie = require('../app/controllers/movie')
var Commment = require('../app/controllers/comment')


module.exports = function(app) {

	// pre handle user
	app.use(function(req, res, next) {
		var _user = req.session.user

		app.locals.user = _user

		next()
	})

	// index 
	app.get('/', Index.index)

	// User
	app.post('/user/signup', User.signup)
	app.post('/user/login', User.login)
	app.get('/login', User.showLogin)
	app.get('/signup', User.showSignup)
	app.get('/logout', User.logout)
	app.get('/admin/user/list', User.loginRequired, User.adminRequired, User.list)

	// Movie
	app.get('/movie/:id', Movie.detail)
	app.get('/admin/movie/new', User.loginRequired, User.adminRequired, Movie.new)
	app.get('/admin/movie/update/:id', User.loginRequired, User.adminRequired, Movie.update)
	app.post('/admin/movie/', User.loginRequired, User.adminRequired, Movie.save)
	app.get('/admin/movie/list', User.loginRequired, User.adminRequired, Movie.list)
	app.delete('/admin/movie/list', User.loginRequired, User.adminRequired, Movie.del)

	// Commment
	app.post('/user/comment', User.loginRequired, Commment.save)
}

