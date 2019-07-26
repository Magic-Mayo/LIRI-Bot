require("dotenv").config();
const fs = require('fs')
const inq = require('inquirer');
const moment = require('moment');
const keys = require('./keys');
const axios = require('axios');
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);
let spotifyArtist = [];
let spotifyAlbum = [];
let spotifyTrack = [];
let concertVenue = [];
let artistCount = 0;
let albumCount = 0;
let trackCount = 0;
let venueCount = 0;

/* use moment to log the time and date of each request

function for each command eg. movie, song, concert, etc

confirm if song, artist, or album is what the user is searching for.  if false, return the next result and confirm again.  if true, return song, artist, album, link, and year(same for movies and concerts)

let user enter multiple entries for song/artist/album (same for movies and concerts)*/

userInput = () => {
    inq.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ['Spotify-It', 'OMDB-It', 'Concert-It', 'Randomize-It'],
            name: 'choice'
        }
    ]).then(answer=>{
        if (answer.choice === 'Spotify-It'){
            spotifyIt();
        }
        else if (answer.choice === 'OMDB-It'){
            OMDBIt();
        }
        else if (answer.choice === 'Concert-It'){
            concertIt();
        } else if (answer.choice === 'Randomize-It'){
            randomizeIt();
        }
    })
}

spotifyIt = () => {
    inq.prompt([
        {
            type: 'list',
            message: 'What do you want to Spotify?',
            choices: ['Track', 'Artist', 'Album'],
            name: 'choice'
        },{
            type: 'input',
            message: 'Enter the name',
            name: 'name'
        }
    ]).then(answer=>{
        const input = String(answer.choice.toLowerCase());

        if (answer.name === ''){
            spotify.request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE').then(response => {
                const ace = response.album;
                // console.log(response)
                console.log(
                    '\nThis is what happens when you leave it to me ;)',
                    '\n--------------------------------------------------------------------------------',
                    '\nTrack: ' + ace.name,
                    '\nArtist: ' + ace.artists[0].name,
                    '\nAlbum: ' + ace.name,
                    '\nAlbum Release Date: ' + ace.release_date,
                    '\nLink to track: ' + ace.external_urls.spotify,
                    '\n--------------------------------------------------------------------------------'
                );
            })
        } else {

            spotify.search({type: input, query: '\"' + answer.name + '\"', limit: 40}).then(response => {
                
                artistSearch = (count) => {
                    const artist = response.artists.items
                    if (artist.length > count){
                        console.log(
                            '\nArtist: ' + artist[count].name,
                            '\nGenres: ' + artist[count].genres.join(', '),
                            '\nSpotify Followers: ' + artist[count].followers.total,
                            '\nLink to Artist: ' + artist[count].external_urls.spotify,
                            '\n--------------------------------------------------------------------------------'
                        );
                        artistCount++;
                    } else {
                        console.log('\n--------------------------------------------------------------------------------', '\n',
                        '\nSorry, we couldn\'t find your artist :(', '\n',
                        '\n--------------------------------------------------------------------------------')
                    }
                }

                albumSearch = (count) => {
                    const album = response.albums.items
                    if (album.length > count){
                        console.log(
                            '\nArtist: ' + album[count].artists[0].name,
                            '\nAlbum: ' + album[count].name,
                            '\nTotal Tracks: ' + album[count].total_tracks,
                            '\nAlbum Release: ' + moment(album[count].release_date).format('MM/DD/YYYY'),
                            '\nLink to album: ' + album[count].external_urls.spotify,
                            '\n', '\n--------------------------------------------------------------------------------'
                        );
                        albumCount++;
                    } else {
                        console.log('\n--------------------------------------------------------------------------------', '\n',
                        '\nSorry, we couldn\'t find your album :(', '\n',
                        '\n--------------------------------------------------------------------------------')
                    }
                }

                trackSearch = (count) => {
                    const track = response.tracks.items;
                    if (track.length > count){
                        console.log(
                            '\nTrack: ' + track[count].name,
                            '\nArtist: ' + track[count].artists[0].name,
                            '\nAlbum: ' + track[count].album.name,
                            '\nAlbum Release Date: ' + track[count].album.release_date,
                            '\nLink to track: ' + track[count].external_urls.spotify
                        )
                        trackCount++;
                    } else {
                        console.log('\n--------------------------------------------------------------------------------', '\n',
                        '\nSorry, we couldn\'t find your track :(', '\n',
                        '\n--------------------------------------------------------------------------------')
                    }
                }

                console.log('\n--------------------------------------------------------------------------------')
                if (input === 'artist'){
                    const artist = response.artists.items
                    spotifyArtist.push(artist);
                    artistSearch(artistCount);
                    inq.prompt([
                        {
                            type: 'confirm',
                            message: 'Is this the artist you were searching for?',
                            name: 'confirm',
                            default: true
                        }
                    ]).then(answer => {
                        text = () => {
                            return '\nArtist search at ' + moment().format('HH:mm:ss MM/DD/YYYY') +
                            '\n--------------------------------------------------------------------------------'+ '\n' +
                            '\nArtist: ' + artist[artistCount-1].name +
                            '\nGenres: ' + artist[artistCount-1].genres.join(', ') +
                            '\nSpotify Followers: ' + artist[artistCount-1].followers.total +
                            '\nLink to Artist: ' + artist[artistCount-1].external_urls.spotify +
                            '\n--------------------------------------------------------------------------------'
                        }

                        if (!answer.confirm){
                            artistSearch(artistCount);
                        } else {
                            inq.prompt([
                                {
                                    type: 'confirm',
                                    message: 'Would you like to find a concert for this artist?',
                                    name: 'concert',
                                    default: false
                                }
                            ]).then(answer => {
                                fs.appendFile('log.txt', text(), err => {
                                    if (err){
                                        console.log('Error: ', err)
                                    } else {
                                        console.log('Content Added!')
                                    }
                                })
                                if (!answer.concert) {
                                    console.log('\n--------------------------------------------------------------------------------', '\n',
                                    '\nSearch complete', '\n',
                                    '\n--------------------------------------------------------------------------------');
                                    artistCount = 0;
                                    spotifyArtist = [];
                                } else {
                                    concertIt(artist[artistCount-1].name);
                                }
                            })
                        }
                    })
                } else if (input === 'album'){
                    const album = response.albums.items
                    spotifyAlbum.push(album);
                    albumSearch(albumCount);
                    inq.prompt([
                        {
                            type: 'confirm',
                            message: 'Is this the album you were searching for?',
                            name: 'confirm',
                            default: true
                        }
                    ]).then(answer => {
                        const text = `Album Search at ${moment().format('HH:MM:ss MM/DD/YYYY')}
                        \nArtist: ${album[albumCount-1].artists[0].name}
                        \nAlbum: ${album[albumCount-1].name}
                        \nTotal Tracks: ${album[albumCount-1].total_tracks}
                        \nAlbum Release: ${moment(album[albumCount-1].release_date).format('MM/DD/YYYY')}
                        \nLink to album: ${album[albumCount-1].external_urls.spotify}
                        \n--------------------------------------------------------------------------------`;

                        if (!answer.confirm){
                            albumSearch(albumCount);
                        } else {
                            fs.appendFile('log.txt', text, function(err,data){
                                if(err){
                                    console.log('Error: ', err)
                                } else {
                                    console.log('Content Added!')
                                }
                            })
                            console.log('\n--------------------------------------------------------------------------------', '\n',
                            '\nSearch complete', '\n',
                            '\n--------------------------------------------------------------------------------');
                            albumCount = 0;
                            spotifyAlbum = [];
                        }
                    })
                } else if (input === 'track'){
                    const track = response.tracks.items
                    // console.log(track[0])
                    spotifyTrack.push(track);
                    trackSearch(trackCount);
                    inq.prompt([
                        {
                            type: 'confirm',
                            message: 'Is this the track you were searching for?',
                            name: 'confirm',
                            default: true
                        }
                    ]).then(answer => {
                        const text = `\nTrack Search at ${moment().format('HH:MM:ss MM/DD/YYYY')}
                        \n--------------------------------------------------------------------------------
                        \nTrack: ${track[trackCount-1].name}
                        \nArtist: ${track[trackCount-1].artists[0].name}
                        \nAlbum: ${track[trackCount-1].album.name}
                        \nAlbum Release Date: ${track[trackCount-1].album.release_date}
                        \nLink to track: ${track[trackCount-1].external_urls.spotify}
                        \n--------------------------------------------------------------------------------`;

                        if (!answer.confirm){
                            trackSearch(trackCount);
                        } else {
                            fs.appendFile('log.txt', text, function(err,data){
                                if(err){
                                    console.log('Error: ', err)
                                } else {
                                    console.log('Content Added!')
                                }
                            })
                            console.log('\n--------------------------------------------------------------------------------', '\n',
                            '\nSearch complete', '\n',
                            '\n--------------------------------------------------------------------------------');
                            trackCount = 0;
                            spotifyTrack = [];
                        }
                    })
                }
            })
        }
    })
}

// Takes user input and searches for a concert for that artist
concertIt = (artist) => {
    if (!artist){
        inq.prompt([
            {
                type: 'input',
                message: 'Please enter the name of the artist you would like to search',
                name: 'artist'
            }
    ]).then(answer => {
        const theater = answer.artist;
        axios.get(`https://rest.bandsintown.com/artists/${theater}/events?app_id=codingbootcamp`).then(response => {
            concertVenue.push(response.data);
            // console.log(venue.data)

            // Function to loop thru the venues after search if the user wants to keep searching for different venues
            venueSearch = (count) => {
                const theater = response.data
                if (concertVenue.length > count) {
                        console.log(
                        `\nVenue: ${theater[count].venue.name}
                        \nLocation: ${theater[count].venue.city}, ${theater[count].venue.region}, ${theater[count].venue.country}
                        \nConcert date: ${moment(theater[count].datetime).format('MM/DD/YYYY HH:MM:ss')}`
                    )
                    venueCount++
                } else {
                    concertVenue = [];
                    venueCount = 0;
                    return console.log(`\n--------------------------------------------------------------------------------\n
                    \nSorry, we couldn\'t find a concert for you :(\n
                    \n--------------------------------------------------------------------------------`);                                
                }
            }
            venueSearch(venueCount);

            inq.prompt([
                {
                    type: 'confirm',
                    message: 'Would you like to search for a different venue?',
                    name: 'venue',
                    default: false
                }
            ]).then(answer => {
                venue = () => {
                    const theater = response.data;
                    return `\nConcert Search at ${moment().format('HH:mm:ss MM/DD/YYYY')}              \n--------------------------------------------------------------------------------
                    \nVenue: ${theater[venueCount-1].venue.name}
                    \nLocation: ${theater[venueCount-1].venue.city}, ${theater[venueCount-1].venue.region}, ${theater[venueCount].venue.country}
                    \nConcert date: ${moment(theater[venueCount-1].datetime).format('MM/DD/YYYY')}
                    \n--------------------------------------------------------------------------------`
                }
                
                if (answer.venue) {
                    venueSearch(venueCount);
                } else {
                    fs.appendFile('log.txt', venue(), err => {
                        if (err){
                            console.log('Error: ', err)
                        } else {
                            console.log('Content Added!')
                        }
                    })
                    venueCount = 0;
                    concertVenue = [];
                }
            })
        })
    })
    } else {
        axios.get(`https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`).then(response => {
            concertVenue.push(response.data);
            console.log(concertVenue[0].length)
            venueSearch = (count) => {
                const theater = response.data
                if (concertVenue[0].length > count) {
                        console.log(
                        `\nVenue: ${theater[count].venue.name}
                        \nLocation: ${theater[count].venue.city}, ${theater[count].venue.region}, ${theater[count].venue.country}
                        \nConcert date: ${moment(theater[count].datetime).format('MM/DD/YYYY HH:MM:ss')}`
                    )
                    venueCount++
                } else {
                    concertVenue = [];
                    venueCount = 0;
                    return console.log(`\n--------------------------------------------------------------------------------\n
                    \nSorry, we couldn\'t find a concert for you :(\n
                    \n--------------------------------------------------------------------------------`);                                
                }
            }

            venueSearch(venueCount);
            inq.prompt([
                {
                    type: 'confirm',
                    message: 'Would you like to search for a different venue?',
                    name: 'venue',
                    default: false
                }
            ]).then(answer => {
                venue = () => {
                    const theater = response.data
                    return `\nConcert Search at ${moment().format('HH:mm:ss MM/DD/YYYY')}\n--------------------------------------------------------------------------------
                    \nVenue: ${theater[venueCount-1].venue.name}
                    \nLocation: ${theater[venueCount-1].venue.city}, ${theater[venueCount-1].venue.region}, ${theater[venueCount-1].venue.country}
                    \nConcert date: ${moment(theater[venueCount-1].datetime).format('MM/DD/YYYY')}
                    \n--------------------------------------------------------------------------------`
                }
                
                if (answer.venue) {
                    venueSearch(venueCount);
                } else {
                    fs.appendFile('log.txt', venue(), err => {
                        if (err){
                            console.log('Error: ', err)
                        } else {
                            console.log('Content Added!')
                        }
                    })
                    venueCount = 0;
                    concertVenue = [];
                }
            })
        })
    }
}

OMDBIt = () => {
    inq.prompt([
        {
            type: 'input',
            message: 'What movie would you like to search?',
            name: 'movie'
        }
    ]).then(answer => {
        if (answer.movie === ''){
            const url = `http://www.omdbapi.com/?t=mr+nobody&y=&plot=short&apikey=trilogy`;
            axios.get(url).then(response => {
                const movie = response.data;
                console.log(`\nOMDB Search at ${moment().format('HH:MM:ss MM/DD/YYYY')}
                \n--------------------------------------------------------------------------------
                \nTitle: ${movie.Title}
                \nYear: ${movie.Year}
                \nIMDB Rating: ${movie.Ratings[0].value}
                \nRotten Tomatoes Rating: ${movie.Ratings[1].value}
                \nCountry of production: ${movie.Country}
                \nMovie Language: ${movie.Language}
                \nPlot: ${movie.Plot}
                \nActors: ${movie.Actors}
                \nGenre: ${movie.Genre}
                \nMovie Rating: ${movie.Rated}
                \n--------------------------------------------------------------------------------`);
            })
        } else {
            const movieName = answer.movie
            const url = `http://www.omdbapi.com/?t=${movieName}&y=&plot=short&apikey=trilogy`;
            axios.get(url).then(response => {
                const movie = response.data;
                // console.log(movie)
                const text = `\nOMDB Search at ${moment().format('HH:MM:ss MM/DD/YYYY')}
                \n--------------------------------------------------------------------------------
                \nTitle: ${movie.Title}
                \nYear: ${movie.Year}
                \nIMDB Rating: ${movie.Ratings[0].value}
                \nRotten Tomatoes Rating: ${movie.Ratings[1].value}
                \nCountry of production: ${movie.Country}
                \nMovie Language: ${movie.Language}
                \nPlot: ${movie.Plot}
                \nActors: ${movie.Actors}
                \nGenre: ${movie.Genre}
                \nMovie Rating: ${movie.Rated}
                \n--------------------------------------------------------------------------------`;

                console.log(text)

                fs.appendFile('log.txt', text, function(err, data){
                    if(!err){
                        console.log(`\n--------------------------------------------------------------------------------\nMovie Added!`)
                    } else {
                        console.log('Error: ', err)
                    }
                })
            })
        }
    })
}

randomizeIt = () => {
    fs.readFile('random.txt', 'utf8', read = (err, data) => {
        if (err){
            console.log('Error: ', err)
        } else {
            spotify.search({type: 'track', query: data, limit: 1}).then(response => {
                const track = response.tracks.items
                console.log(
                    '\nTrack: ' + data,
                    '\nArtist: ' + track[0].artists[0].name,
                    '\nAlbum: ' + track[0].album.name,
                    '\nAlbum Release Date: ' + track[0].album.release_date,
                    '\nLink to track: ' + track[0].external_urls.spotify
                )

            })
        }
    })
}

userInput();