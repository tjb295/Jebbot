var Botkit = require('botkit');
var http = require('http');
var config = require('./config/config');
var api_config = require('./config/api_config');
var requst = require('request');
var exec = require('child_process').exec;

//attempting to create audio bot
var fs = require('fs');
var os = require('os');
var platform = os.platform();
if (platform === 'win32'){
    var winsay = require('winsay');
}


var gen_jeb_resp = ['Jeb... exclamation point','He kept us safe', 'I got my hoodie on, Eat your heart out zuckerberg', 'im a mess'];

var jeb_memes = []
var gif_message = {
    'type': 'message',
    'text': "Say it loud I'm Jeb! and I'm proud",
    'attachments': [
        {
            'image_url': '',
            'title': '',
        }
    ],

};

var num_gifs = 100;
var random_index;
var gif_path = '/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=';

var giphy_req = {
    host: 'api.giphy.com',
    path: ''
};

var slack_token = 'xoxb-115064594371-P1qWrFMMaYoFTbbBSASyZmyU';

var controller = Botkit.slackbot({});
var bot = controller.spawn({
    token: slack_token
});

bot.startRTM(function(err, bot, payload){
    if (err){
        throw err;
    }
});

//try to control what audio is played
controller.hears('please clap',['direct_mention', 'direct_message'], function(bot, message){

        var outputDevice = '';
        var player = 'afplay';
        if(platform == 'win32'){
            player = 'mplayer';
            
            var hasTest = message.text.indexOf("test");
            if(hasTest > -1){
                console.log("TESTING");
                outputDevice = '-ao dsound:device=1 ';
            }else{
                outputDevice = '-ao dsound:device=2 ';
            }
        }

        var toPlay = 'sounds/clap.mp3';
        
        fs.exists(toPlay, function(existsMp3){
            if(existsMp3){
                console.log(player);
                exec(player + outputDevice + ' ' + toPlay);
                bot.reply(message, 'PLEASE CLAP');
            }
        });
});


controller.hears('gif',['direct_mention','direct_message'], function(bot,message){
   
    getGif( gif_path + 'jeb+bush', function(url){
        if(!url){
            bot.reply(message, 'Jeb is sleeping right now.');
        }

        else{
            gif_message['attachments'][0].image_url = url;
            
            bot.reply(message, gif_message, function(err, res){
                if (err){
                    throw err;
                }
            });
        }
    });

});

var getGif = function(search_path, cb){
     
    giphy_req.path = search_path;
    console.log(search_path);
        http.get(giphy_req, function(res){
        
                var body = "";
                res.on('data', function(d) {
            body += d;
        });

        res.on('end', function(){
            console.log(body + " hi ");
            var parsed = JSON.parse(body);
            var return_val;

            random_index = Math.floor(Math.random() * parsed.data.length);

            giphy_req.path = '';

            if(parsed.data.length == 0){
                return_val = false;
            }
            else{
                 
                return_val = parsed.data[random_index].images.original.url;
            }
            cb(return_val);
        });
    });

};

controller.hears('bot' ['direct_mention'], function(bot,message){
    bot.reply(message, "Say it loud I'm Jeb and I'm proud.");
});

//return generic jeb response if
controller.hears('',['direct_mention'], function(bot, message){
    random_index = Math.floor(Math.random() * gen_jeb_resp.length);

    bot.reply(message, gen_jeb_resp[random_index]);
});
