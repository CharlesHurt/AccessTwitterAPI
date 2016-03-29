'use strict';

var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});


var tweets

var params = {screen_name: 'nodejs'};
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {
    console.log('your tweets are here:', tweets);
  }
});

client.get('favorites/list', function(error, tweets, response) {
  if (error) {
    console.log('Error occured getting the favorites', error);
    return
  }

  console.log('your tweets are here:', tweets);
  console.log('your response is here:', response);
});

module.exports = tweets;
