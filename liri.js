var request = require("request");
var moment = require("moment");
var Spotify = require("node-spotify-api")
var fs = require("fs");
require("dotenv").config();


var keys = require("./keys.js")
var spotify = new Spotify(keys.spotify);
var command = process.argv[2];
var input = process.argv[3];

for (var i = 4; i < process.argv.length; i++) {
    input = input + " " + process.argv[i];
}

console.log(command);
console.log(input);

switch (command) {
    case "movie-this":
        doMovie(input);
        break;
    case "concert-this":
        doConcert(input);
        break;
    case "spotify-this-song":
        doSpotify(input);
        break;
    case "do-what-it-says":
        doWhatItSays()
        break;
}

function doMovie(movieName) {
    if (!movieName) {
        movieName = "Mr. Nobody"
    }
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
    request(queryUrl, function (error, response, body) {
        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            var title = JSON.parse(body).Title
            var year = JSON.parse(body).Year
            var imdbRating = JSON.parse(body).imdbRating
            var rottenRating = JSON.parse(body).Ratings[1].Value
            var country = JSON.parse(body).Country
            var language = JSON.parse(body).Language
            var plot = JSON.parse(body).Plot
            var actors = JSON.parse(body).Actors

            console.log("Title: " + title);
            console.log("Release Year: " + year);
            console.log("IMDB Rating: " + imdbRating);
            console.log("Rotten Tomatoes Rating: " + rottenRating);
            console.log("Produced in: " + country);
            console.log("Language: " + language);
            console.log("Plot: " + plot);
            console.log("Actors: " + actors);

            var text = "-----------------------------------" +
                "\nYou entered movie-this " + movieName +
                "\nTitle: " + title +
                "\nRelease Year: " + year +
                "\nIMDB Rating: " + imdbRating +
                "\nRotten Tomamtoes Rating: " + rottenRating +
                "\nProduced in: " + country +
                "\nLanguage: " + language +
                "\nPlot: " + plot +
                "\nActors: " + actors +
                "\n-----------------------------------";
            fs.appendFile("log.txt", text, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Content Added!");
                }
            });


        }
    });
}

function doConcert(artistName) {
    var queryUrl = "https://rest.bandsintown.com/artists/" + artistName + "/events?app_id=codingbootcamp";
    request(queryUrl, function (error, response, body) {
        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            var text = "";
            for (var i = 0; i < 5; i++) {
                var venue = JSON.parse(body)[i].venue.name;
                var location = JSON.parse(body)[i].venue.city + ", " + JSON.parse(body)[i].venue.region;
                var date = moment(JSON.parse(body)[i].datetime, "YYYY-MM-DD").format("MM/DD/YYYY");
                if (i === 0) {
                    console.log("Upcoming concert dates for " + artistName + ":")
                }
                console.log((i + 1) + ". " + location + " at " + venue + " " + date);
                if (i === 0) {
                    text = text + "\n-----------------------------------" +
                        "\nYou entered concert-this " + artistName +
                        "\nUpcoming concert dates for " + artistName + ":\n";
                }
                text = text + (i + 1) + ". " + location + " at " + venue + " " + date + "\n"
                if (i === 4) {
                    text = text + "-----------------------------------\n"
                }
            }
            fs.appendFile("log.txt", text, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Content Added!");
                }
            });
        }
    });
}

function doSpotify(songName) {
    if (!songName) {
        songName = "The Sign Ace of Base"
    }
    spotify.search({ type: 'track', query: songName, limit: 5 }, function (err, data) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        }
        for (var i = 0; i < 5; i++) {
            var artist = data.tracks.items[i].artists[0].name;
            var song = data.tracks.items[i].name;
            var link = data.tracks.items[i].external_urls.spotify;
            var album = data.tracks.items[i].album.name;
            console.log(i+1)
            console.log("Artist(s): " + artist);
            console.log("Song Name: " + song);
            console.log("Preview Link: " + link);
            console.log("Album: \n" + album);
            if(i === 0){
                var text = "-----------------------------------\n" + 
                "You entered spotify-this-song " + songName + "\n";
            }
            text = text + (i+1) +
                "\nArtist: " + artist +
                "\nSong Name: " + song +
                "\nPreview Link: " + link +
                "\nAlbum: " + album + "\n";
            if(i === 4){
               text = text + "-----------------------------------\n";
            }
        }
        fs.appendFile("log.txt", text, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Content Added!");
            }
        });
    });
}

function doWhatItSays() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");
        console.log(dataArr);
        var c = dataArr[0];
        var inp = dataArr[1];
        switch (c) {
            case "movie-this":
                doMovie(inp);
                break;
            case "concert-this":
                doConcert(inp);
                break;
            case "spotify-this-song":
                doSpotify(inp);
                break;
        }
    });
}
