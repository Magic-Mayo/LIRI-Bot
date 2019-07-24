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
let artistCount = 0;
let albumCount = 0;
let trackCount = 0;

/* use moment to log the time and date of each request

function for each command eg. movie, song, concert, etc

confirm if song, artist, or album is what the user is searching for.  if false, return the next result and confirm again.  if true, return song, artist, album, link, and year(same for movies and concerts)

let user enter multiple entries for song/artist/album (same for movies and concerts)*/

userInput = () => {
    inq.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ['Spotify-It', 'OMDB-It', 'Concert-It'],
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
        
        spotify.search({type: input, query: answer.name}).then(response => {
            const artist = response.artists.items
            artistSearch = (count) => {
                if (artist.length > count){
                    console.log(
                        '\nArtist: ' + artist[count].name,
                        '\nGenres: ' + artist[count].genres.join(', '),
                        '\nSpotify Followers: ' + artist[count].followers.total,
                        '\nLink to Artist: ' + artist[count].external_urls.spotify,
                        '\n',
                        '\n--------------------------------------------------------------------------------'
                    )
                    artistCount++
                } else {
                    console.log('\n--------------------------------------------------------------------------------', '\n',
                    '\nSorry, we couldn\'t find your artist :(', '\n',
                    '\n--------------------------------------------------------------------------------')
                }
            }

            console.log('\n--------------------------------------------------------------------------------')
            if (input === 'artist'){
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
                    if (!answer.confirm){
                        artistSearch();
                    } else {
                        console.log('\n--------------------------------------------------------------------------------', '\n',
                        '\nSearch complete', '\n',
                        '\n--------------------------------------------------------------------------------')
                    }
                })
            } else if (input === 'album'){
                const album = response.albums.items
                // console.log(album[0])
                console.log(
                    '\nArtist: ' + album[0].artists[0].name,
                    '\nAlbum: ' + album[0].name,
                    '\nTotal Tracks: ' + album[0].total_tracks,
                    '\nAlbum Release: ' + moment(album[0].release_date).format('MM/DD/YYYY'),
                    '\nLink to album: ' + album[0].external_urls.spotify
                )
            } else if (input === 'track'){
                const track = response.tracks.items
                console.log(track[0])
            }

        })
    })
}

userInput()