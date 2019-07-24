require("dotenv").config();
const fs = require('fs')
const inq = require('inquirer');
const mom = require('moment');
const keys = require('./keys');
const axios = require('axios');
const spotify = require('node-spotify-api');
// const Spotify = new Spotify(keys.spotify);

/* use moment to log the time and date of each request

function for each command eg. movie, song, concert, etc

confirm if song, artist, or album is what the user is searching for.  if false, return the next result and confirm again.  if true, return song, artist, album, link, and year(same for movies and concerts)

let user enter multiple entries for song/artist/album (same for movies and concerts)*/

userInput = () => {
    inq.prompt([
        {
            type: 'list',
            message: 'What are you searching for?',
            choices: ['Song', 'Movie', 'Concert'],
            name: 'choice'
        }
    ]).then(answer=>{
        if (answer.choice === 'Song'){
            spotifyIt();
        }
        else if (answer.choice === 'Movie'){
            OMDBIt();
        }
        else if (answer.choice === 'Concert'){
            concertIt();
        }
    })
}

spotifyIt = () => {
    inq.prompt([
        {
            type: 'checkbox',
            message: 'What do you want to search(the more input the better)?',
            choices: ['Song', 'Artist', 'Album'],
            name: 'choice'
        }
    ]).then(answer=>{
        const input = String(answer.choice);
        if (input === 'Song'){
            
        } else if (input === 'Album'){
            
        } else if (input === 'Artist'){
            
        } else if (input === 'Song,Artist'){

        } else if (input === 'Song,Artist,Album'){

        } else if (input === 'Artist,Album'){

        } else if (input === 'Song,Album'){
            
        }
    })
}

userInput()