var url = require('url')
var sqlite3 = require('sqlite3').verbose() //verbose provides more detailed stack trace

//connect to sqlite database
var db = new sqlite3.Database('data/fakebooks3005fall2018.db')

db.serialize(function() {
  //make sure a couple of users exist in the database.
  //user: ldnel password: secret
  //user: frank password: secret2
  var sqlString = "CREATE TABLE IF NOT EXISTS users (userid TEXT PRIMARY KEY, password TEXT)"
  db.run(sqlString)
  sqlString = "INSERT OR REPLACE INTO users VALUES ('ldnel', 'secret')"
  db.run(sqlString)
  sqlString = "INSERT OR REPLACE INTO users VALUES ('frank', 'secret2')"
  db.run(sqlString)
  sqlString = "INSERT OR REPLACE INTO users VALUES ('ducongo', 'secret3')"
  db.run(sqlString)
  sqlString = "INSERT OR REPLACE INTO users VALUES ('chance', 'secret4')"
  db.run(sqlString)
  sqlString = "INSERT OR REPLACE INTO users VALUES ('vivian', 'secret5')"
  db.run(sqlString)
  sqlString = "INSERT OR REPLACE INTO users VALUES ('samer', 'secret6')"
  db.run(sqlString)
  sqlString = "INSERT OR REPLACE INTO users VALUES ('chance', 'secret7')"
  db.run(sqlString)
  sqlString = "INSERT OR REPLACE INTO users VALUES ('jonathan', 'secret8')"
  db.run(sqlString)
  sqlString = "INSERT OR REPLACE INTO users VALUES ('mustafa', 'secret9')"
  db.run(sqlString)
});

exports.authenticate = function(request, response, next) {
  /*
	Middleware to do BASIC HTTP 401 authentication
  The function will check that an userid/password authentication record
  is contained in the request header from the brower. If not the response
  will result in the browser asking the client user to supply a userid/password.

  If the userid/password record is present it will used to verify that
  the user is among those in the users table of the sqlite database.

  You can bypass this authentication altogether by removing the
  app.use(routes.authenticate) statement in the server code
	*/
  var auth = request.headers.authorization
  // auth is a base64 representation of (username:password)
  //so we will need to decode the base64
  if (!auth) {
    //note here the setHeader must be before the writeHead
    response.setHeader('WWW-Authenticate', 'Basic realm="need to login"')
    response.writeHead(401, {
      'Content-Type': 'text/html'
    })
    console.log('No authorization found, send 401.')
    response.end()
  } else {
    console.log("Authorization Header: " + auth)
    //decode authorization header
    // Split on a space, the original auth
    //looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
    var tmp = auth.split(' ')

    // create a buffer and tell it the data coming in is base64
    var buf = new Buffer(tmp[1], 'base64')

    // read it back out as a string
    //should look like 'ldnel:secret'
    var plain_auth = buf.toString();
    console.log("Decoded Authorization ", plain_auth)

    //extract the userid and password as separate strings
    var credentials = plain_auth.split(':') // split on a ':'
    var username = credentials[0]
    var password = credentials[1]
    console.log("User: ", username)
    console.log("Password: ", password)

    var authorized = false
    //check database users table for user
    db.all("SELECT userid, password FROM users", function(err, rows) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].userid == username & rows[i].password == password) authorized = true
      }
      if (authorized == false) {
        //we had an authorization header by the user:password is not valid
        response.setHeader('WWW-Authenticate', 'Basic realm="need to login"')
        response.writeHead(401, {
          'Content-Type': 'text/html'
        })
        console.log('No authorization found, send 401.')
        response.end()
      } else
        next()
    });
  }
  //notice no call to next() here
}

function parseURL(request, response) {
  var parseQuery = true //parseQueryStringIfTrue
  var slashHost = true //slashDenoteHostIfTrue
  var urlObj = url.parse(request.url, parseQuery, slashHost)
  console.log('path:')
  console.log(urlObj.path)
  console.log('query:')
  console.log(urlObj.query)
  //for(x in urlObj.query) console.log(x + ': ' + urlObj.query[x]);
  return urlObj
}




/*
JSON API METHODS
These route functions simply return JSON data to clients
expecting them to do their own rendering of the data
on the client side
*/

exports.api_users = function(request, response) {
  // /api/users
  let result = {users: []} //data object to send to client
  db.all("SELECT userid, password FROM users", function(err, rows) {
    for (let i = 0; i < rows.length; i++) {
      let user = {}
      user.userid = rows[i].userid
      user.password = rows[i].password
      result.users.push(user) //append to users array in result object
    }
    //write header with HTTP success code and MIME type
    response.writeHead(200, {
      'Content-Type': 'application/json'
    })
    //write JSON data and send response to client
    response.end(JSON.stringify(result))
  })
}

exports.api_songs = function(request, response) {
  // /api/songs?title=Girl
  //responds to client with JSON data
  console.log("RUNNING FIND SONGS JSON API")

  var urlObj = parseURL(request, response)
  //use prepared sql statements (the ones with ? parameters)

  //SELECT id, title FROM songs WHERE title LIKE '%Girl%'

  let sql = ""
  let query = '%' //sql match anything character
  let query_for = ''

  if (urlObj.query['title'] && urlObj.query['composer']) {
    console.log("____________________BOTH");
    sql = "SELECT rowid, title, composer, bookcode, page, length, studentnum FROM songs WHERE title  LIKE  '" + `%${urlObj.query['title']}%` +"'" +" AND composer LIKE '" + `%${urlObj.query['composer']}%` +"'"
  }else {
    if (urlObj.query['title']) {
      console.log("____________________title");
      query = `%${urlObj.query['title']}%`
      console.log("finding title: " + query)
      query_for = 'title'
      sql = "SELECT rowid, title, composer, bookcode, page, length, studentnum FROM songs WHERE title  LIKE  '" + `%${urlObj.query['title']}%` +"'"
    }else if (urlObj.query['composer']) {
      console.log("____________________composer");
      query = `%${urlObj.query['composer']}%`
      console.log("finding Composer: " + query)
      query_for = 'composer'
      sql = "SELECT rowid, title, composer, bookcode, page, length, studentnum FROM songs WHERE composer  LIKE  '" + `%${urlObj.query['composer']}%` +"'"
    }
  }

  let result = {
    songs: []
  } //data object to send to client
  db.all(sql, function(err, rows) {
    if (!err){
      for (let i = 0; i < rows.length; i++) {
        let song = {}
        song.id = rows[i].rowid
        song.title = rows[i].title
        
        result.songs.push(song)
      }
    }else{
      console.log(err);
    }

    //write header with HTTP success code and MIME type
    response.writeHead(200, {
      'Content-Type': 'application/json'
    })
    //write JSON data and send response to client
    if(err){
      response.end("ERROR OCCURED ON THE SERVER SIDE")
    }else {
      response.end(JSON.stringify(result))
    }

  })
}

exports.api_song_details = function(request, response) {
  // /api/song/235
  let urlObj = parseURL(request, response)
  let songID = urlObj.path //expected form: /song/235
  songID = songID.substring(songID.lastIndexOf("/") + 1, songID.length)

  //use of a prepared sql statement (the ones with ? parameters)
  let sql = "SELECT rowid, title, composer, bookcode, page, length, studentnum FROM songs WHERE rowid="+ songID
  console.log("API: GET SONG DETAILS: " + songID)

  let result = {} //data object to send to client
  db.all(sql, function(err, rows) {
    console.log('Song Data')
    console.log(rows)
    //note: only one result row is expected
    if (err) {
      console.log("ERROR OCCERED: "+err);
    }else {
      if(rows.length > 0){
        result.id = rows[0].rowid
        result.title = rows[0].title
        result.composer = rows[0].composer
        result.bookcode = rows[0].bookcode
        result.page = rows[0].page
        result.length = rows[0].length
        result.studentnum = rows[0].studentnum
      }else{
        console.log("ROWS LENGTH IS ZERO");
      }

    }

    //write header with HTTP success code and MIME type
    response.writeHead(200, {
      'Content-Type': 'application/json'
    })
    //write JSON data and send response to client
    response.end(JSON.stringify(result))
  })
}
