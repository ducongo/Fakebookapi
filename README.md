# Fakebookapi
Api toserve requested songs based on composers and song titles

REST API to request fake book songs from a SQL database

Technologies being used are Node.JS, NPM, Epress.JS, SQLite

run
>npm install

>node server.js

api access points:


http://localhost:3000/api/users "returns all the hardcoded users who have access to the database"
http://localhost:3000/api/songs?title=Girl "returns a list of songs that contains the keyword girl in their titles"
http://localhost:3000/api/songs?composer=a "returns a list of composer that contains the keyword a in their names"
http://localhost:3000/api/songs?composer=a& "returns a list of composer that contains the keyword a in their names"
http://localhost:3000/api/songs?title=ATitleString&composer=AComposerName "for a combination of the previous 2 access points"
http://localhost:3000/api/song/372 "provides details on a selected song"

** Please note that you can use any keywords you want in order to conduct searches via the Rest Api
