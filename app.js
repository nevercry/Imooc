var express = require('express')
var path = require('path')
var mongoose = require('mongoose')
var session = require('express-session')
var mongoStore = require('connect-mongo')(session)
var morgan = require('morgan')


var port = process.env.PORT || 3000
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var app = express()
var fs = require('fs')
var dbUrl = 'mongodb://localhost/imooc'

mongoose.connect(dbUrl)

// Models loading
var models_path = __dirname + '/app/models'
var walk = function(path) {
	fs	
		.readdirSync(path)
		.forEach(function(file) {
			var newPath = path + '/' + file
			var stat = fs.statSync(newPath)

			if (stat.isFile()) {
				if (/(.*)\.(js|coffee)/.test(file)) {
					require(newPath)
				}
			} 
			else if (stat.isDirectory()) {
				walk(newPath)
			}
		})
}

walk(models_path)

app.set('views', './app/views/pages')
app.set('view engine', 'jade')
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(session({
	secret: 'imooc',
	resave: true,
	saveUninitialized: true,
	store: new mongoStore({
		url: dbUrl,
		collection: 'sessions'
	})
}))

if ('development' === app.get('env')) {
	app.set('showStackError', true)
	app.use(morgan(':method :url :status'))
	app.locals.pretty = true
	mongoose.set('debug', true)
}

require('./config/routes')(app)

app.locals.moment = require('moment')
app.listen(port)

console.log('imooc start on port ' + port)