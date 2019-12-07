const Discord = require('discord.js');
const auth = require('./auth.json');

var isReady = true;
var dispatcher = null;

// Initialize Discord Bot
var bot = new Discord.Client();
bot.login(auth.token)

bot.once('ready', function (evt) {
    console.log('Connected');
});

bot.once('reconnecting', () => {
    console.log('Reconnecting!');
});

bot.once('disconnect', () => {
    console.log('Disconnect!');
});

bot.on('message', async message => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if(message.author.bot) return;
    if (!message.content.startsWith(auth.prefix)){

        if(message.attachments === undefined || message.attachments.size === 0){
            return
        } else {
            if(message.attachments.values().next().value.filename.includes(".wav") || message.attachments.values().next().value.filename.includes(".mp3")){
                if(isReady){
                    const voiceChannel = message.member.voiceChannel;
                    if (!voiceChannel) {
                        message.channel.send('Trid tkun voice chat basla.');
                        return 
                    }
                    const permissions = voiceChannel.permissionsFor(message.client.user);
                    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
                        message.channel.send('I need the permissions to join and speak in your voice channel!');
                        return 
                    }
        
                    isReady = false;
                    voiceChannel.join()
                        .then(connection =>{ 
                            dispatcher = connection.playArbitraryInput(message.attachments.values().next().value.proxyURL)
                            message.channel.send('Ismgha naqa broooo');
                            dispatcher.on("end", end => {
                                message.channel.send('Lest jien');
                                voiceChannel.leave();
                                dispatcher.destroy();
                                isReady = true;
                            });
                        })
                        .catch(err => {
                            console.log(err)
                            message.channel.send('Fotta xi haga John, sorry bro!');
                            voiceChannel.leave();
                        });
                    return 
                } else {
                    message.channel.send("U ghandi indoqq, tini cans")
                    return
                }
            }
            
        }
       
    } 

    if (message.content.startsWith(`${auth.prefix}bye`)) {
        message.channel.send("Bye bitch")
        bot.destroy()
        return;
    }
    if (message.content.startsWith(`${auth.prefix}test`)) {
        message.channel.send("Dan test duda!")
        return;
    }
    if (message.content.startsWith(`${auth.prefix}stop`)) {
        message.channel.send("ha inwaqaf bro dw")
        if(dispatcher != null){
            dispatcher.destroy();
        }
        return;
    }
    if (message.content.startsWith(`${auth.prefix}help`)) {
        message.channel.send(
            "Isma naqa kemm jien semplici: \n" +
            "\t\t- Jekk trid idoqq xi haga, kemm itella .mp3 jew .wav. Jekk trid idoqq xi haga ohra, ghid lil John. \n" +
            "\t\t- Jekk tibda idoqq u issa qed tisthi kemm tikteb 'sf!stop'... pussy. \n"+
            "\t\t- Jekk trid tkeccini l-hemm, l-ewwel nett 'OOFFF' u t-tieni nett, 'sf!bye'. \n"+
            "K'ma jahdiemx xi haga, wahlu f'John.")
        return ;
    }else{
        message.channel.send("Ma tezistix dik troglodit")
        return;
    }
});