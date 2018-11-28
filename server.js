/*
Basic node.js express-based server with middleware, SQLite database, providing a JSON data API.

The server allows client to find songs, including their chord progressions, in
its SQLite database. The database provided has chord progressions
of some 1200 popular jazz standards.

In this example the server wraps the SQLite database and provideds a RESTful API to the
the data returned JSON formated strings.

Here the server does not serve any web-pages just JSON data. This has become the
most popular kind of data server these days.


Testing: (user: ldnel password: secret)
http://localhost:3000/api/users
http://localhost:3000/api/songs?title=Love
http://localhost:3000/api/song/372
*/

//Cntl+C to stop server

var http = require('http')
var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan') //console logger for dubugging

var  app = express() //create express middleware dispatcher

const PORT = process.env.PORT || 3000

app.locals.pretty = true //to generate pretty view-source code in browser

//read routes modules javascript file
var routes = require('./routes/index')

//some logger middleware functions
function methodLogger(request, response, next){
		   console.log("METHOD LOGGER")
		   console.log("================================")
		   console.log("METHOD: " + request.method)
		   console.log("URL:" + request.url)
		   next(); //call next middleware registered
}
function headerLogger(request, response, next){
		   console.log("HEADER LOGGER:")
		   console.log("Headers:")
       for(k in request.headers) console.log(k)
		   next(); //call next middleware registered
}

//register middleware with dispatcher
//ORDER MATTERS HERE
//middleware
app.use(routes.authenticate) //authenticate user
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
//app.use(methodLogger);

//JSON API routes
//returns JSON data to clients so client can render
app.get('/api/users', routes.api_users)
app.get('/api/songs', routes.api_songs)
app.get('/api/song/*', routes.api_song_details)

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
		console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)
		console.log(`Testing:`)
		console.log(`hardcoded user: ldnel, password: secret`)
		console.log(`http://localhost:3000/api/users`)
		console.log(`http://localhost:3000/api/songs?title=Girl`)
		console.log(`http://localhost:3000/api/song/372`)
		}
})
