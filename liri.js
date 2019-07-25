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
        
        spotify.search({type: input, query: '\"' + answer.name + '\"', limit: 40}).then(response => {
            
            artistSearch = (count) => {
                const artist = response.artists.items
                if (artist.length > count){
                    console.log(
                        '\nArtist: ' + artist[count].name,
                        '\nGenres: ' + artist[count].genres.join(', '),
                        '\nSpotify Followers: ' + artist[count].followers.total,
                        '\nLink to Artist: ' + artist[count].external_urls.spotify,
                        '\n',
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
                        '\nTrack: ' + answer.name,
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
                        return '\n'+ moment().format('HH:mm:ss MM/DD/YYYY') +
                        '\n--------------------------------------------------------------------------------'+ '\n' +
                        '\nArtist: ' + artist[artistCount-1].name +
                        '\nGenres: ' + artist[artistCount-1].genres.join(', ') +
                        '\nSpotify Followers: ' + artist[artistCount-1].followers.total +
                        '\nLink to Artist: ' + artist[artistCount-1].external_urls.spotify +
                        '\n' +
                        '\n--------------------------------------------------------------------------------'
                    }
                    if (!answer.confirm){
                        artistSearch(artistCount);
                    } else {
                        fs.appendFile('log.txt', text(), err => {
                            if (err){
                                console.log('Error: ', err)
                            } else {
                                console.log('Content Added!')
                            }
                        })
                        console.log('\n--------------------------------------------------------------------------------', '\n',
                        '\nSearch complete', '\n',
                        '\n--------------------------------------------------------------------------------');
                        artistCount = 0;
                        spotifyArtist = [];
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
                    if (!answer.confirm){
                        albumSearch(albumCount);
                    } else {
                        console.log('\n--------------------------------------------------------------------------------', '\n',
                        '\nSearch complete', '\n',
                        '\n--------------------------------------------------------------------------------');
                        albumCount = 0;
                        spotifyAlbum = [];
                    }
                })
            } else if (input === 'track'){
                const track = response.tracks.items
                console.log(track[0].artists[0].name)
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
                    if (!answer.confirm){
                        trackSearch(trackCount);
                    } else {
                        console.log('\n--------------------------------------------------------------------------------', '\n',
                        '\nSearch complete', '\n',
                        '\n--------------------------------------------------------------------------------');
                        trackCount = 0;
                        spotifyTrack = [];
                    }
                })
            }

        })
    })
}

userInput()