# WaveRider

WaveRider is a 3D browser game that let's you ride your own music. 
Your goal is to make it until the end of the song without falling behind, by riding a song's waveform.

Songs are currently searched through [SoundCloud](https://soundcloud.com). WaveRider is made with 
[three.js](http://threejs.org).

## demo

Enough talk already, [play it yourself](http://frenkie.github.io/waverider/)!

![screenshot](http://frenkie.github.io/waverider/waverider-thumb.jpg)


## game
The game was made during a music hackday event and in it's current form it's not at all difficult to play :)
My goal is to expand this game with enemies and puzzles based on an analysis of the played music.
Because game level difficulties are completely based on your sound input this could be a very fun game to play.


## tweak it yourself

If you want to tweak the game or provide different sound providers instead of just SoundCloud, you can build it yourself.

### prerequisites

The SoundCloud service needs a valid SoundCloud API key, which you can create by 
[registering a SoundCloud app](http://soundcloud.com/you/apps).

You then make a copy of `app/config.example.json`, rename it to `app/config.json` and enter your API key.

To build the game and run it, you need [NPM](https://www.npmjs.org), [Bower](http://www.bower.io) and 
[Gulp](http://gulpjs.com).

### install
After installing the prerequisites, use `npm install`, `bower install` and `gulp install`.
Your WaveRider game is now ready to run from `app/`. You can also use `gulp serve` to fire up
an [Express](http://expressjs.com/) server on `localhost:4000`.



## build your own sound service provider
If you don't want to use SoundCloud as a sound provider that's fine. You can create a client service yourself
as long as it exposes a certain API. You should be able to play a sound and provide the game with
waveform data per second.

I will document the way to do this as soon as possible. 