require("dotenv").config();
const fs = require('fs')
const inq = require('inquirer');
const mom = require('moment');
const keys = require('./keys');
const axios = require('axios');
const spotify = require('node-spotify-api');
// const spotifyKey = new Spotify(keys.spotify);

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
    console.log('\n----------------------------------------')
    inq.prompt([
        {
            type: 'list',
            message: 'What do you want to search for?',
            choices: ['Track', 'Artist', 'Album'],
            name: 'choice'
        },{
            type: 'input',
            message: 'Enter the name',
            name: 'name'
        }
    ]).then(answer=>{

        const input = String(answer.choice);
        
        if (input === 'Song'){
            axios.get('https://api.spotify.com/v1/search/q='+answer.name).then(response => {
            console.log(
                'Artist: ' + response
            )
            })
        } else if (input === 'Album' || input === 'Artist'){
            axios.get('https://api.spotify.com/v1/search/q='+answer.name+'type='+input).then(response => {

            })
        }
    })
}

userInput()