const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');

var listinv = [];
var queue = [];
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

fs.readFile(auth.listpath, 'utf8', function(err, contents) {
    if(contents != "" && contents != undefined){
        var list = contents.split("|")
        list.map(listitem => {
            if(listitem != ""){
                var listitemdict = listitem.split(",")
                listinv.push({
                    filename: listitemdict[0],
                    path: listitemdict[1]
                })
            }
        })
    }
});

function AddToListInv(attachment, message){
    var found = false;

    var shortened = attachment.filename;

    shortened = shortened.replace(".wav", "")
    shortened = shortened.replace(".mp3", "")

    for(var i = 0; i < listinv.length; i++){
        if((listinv[i].filename).toLowerCase() === (shortened).toLowerCase()){
            found = true;
            break;
        }
    }
    if(!found){
        listinv.push({
            filename: shortened,
            path: attachment.proxyURL
        })
        var string = shortened + "," + attachment.proxyURL + "|";
        fs.appendFile(auth.listpath, string, function(err){
            if(err){
                return console.log(err);
            }
        })
    } else {
        message.channel.send('Kont nafha din, stajt tismghha b\'play biss ta,... pacc.');
    }
}

function checkPrefix(content, prefix=null){
    if(prefix === null){
        if(content.substring(0,3) === auth.prefix){
            return true;
        } else {
            return false;
        }
    } else {
        if(content.substring(0,prefix.length) === prefix){
            return true;
        } else {
            return false;
        }
    }
}

function AddToQueue(attachment, message, voiceChannel, remember=true){   
    if(remember){
        AddToListInv(attachment, message);
    }
    queue.push({
        attachment: attachment,
        message: message,
        voiceChannel: voiceChannel
    })
}

function PlayURL(attachment, message, voiceChannel){

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        message.channel.send('I need the permissions to join and speak in your voice channel!');
        return
    }

    voiceChannel.join()
        .then(connection =>{ 
            dispatcher = connection.playArbitraryInput(attachment.proxyURL)
            message.channel.send('Ha indoqq: ' + attachment.filename);
            dispatcher.on("end", end => {
                queue.splice(0,1)
                if(queue.length != 0){
                    message.channel.send('Ara gejja ohra: ' + attachment.filename);
                    PlayURL(queue[0].attachment, queue[0].message, queue[0].voiceChannel)
                } else {
                    message.channel.send('Lest jien');
                    voiceChannel.leave();
                }
            });
        })
        .catch(err => {
            console.log(err)
            message.channel.send('Fotta xi haga John, sorry bro!');
            voiceChannel.leave();
        });
}

bot.on('message', async message => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`

    if(message.author.bot) return;
    if (!checkPrefix(message.content.toLowerCase())){
        if(message.attachments === undefined || message.attachments.size === 0){
            return
        } else {
            message.attachments.map(attachment => {
                if(attachment.filename.includes(".wav") || attachment.filename.includes(".mp3")){
                    if(queue.length === 0){
                        
                        const voiceChannel = message.member.voiceChannel;
                        if (!voiceChannel) {
                            message.channel.send('Trid tkun voice chat basla.');
                        } else {
                            AddToQueue(attachment, message, voiceChannel);
                            PlayURL(attachment, message, voiceChannel)
                        }
                    } else {
                        message.channel.send("Ghal wara din: "+ attachment.filename);
                        AddToQueue(attachment, message, voiceChannel);
                    }
                } else {
                    if(Math.random() < 0.05){
                        message.channel.send("Igiefiri din mhux ghalijja ee? Meh");
                    }
                }
            })
            return
        }
       
    } 

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}bye`)) {
        message.channel.send("Bye bitch")
        bot.destroy()
        return;
    }
    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}test`)) {
        message.channel.send("Dan test duda!")
        return;
    }
    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}skip`)) {
        if(queue.length === 0){
            message.channel.send("Int qed tiblaghhom?");
        } else {
            message.channel.send("Ha inwaqaf: " + queue[0].attachment.filename)
            if(dispatcher != null){
                dispatcher.destroy();
            }
        }
        return;
    }
    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}stop`)) {
        if(queue.length === 0){
            message.channel.send("Int qed tiblaghhom?");
        } else {
            message.channel.send("Ha inwaqaf kollox mela");
            queue = [];
            if(dispatcher != null){
                dispatcher.destroy();
            }
        }
        return;
    }
    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}queue`)) {
        if(queue.length === 0){
            message.channel.send("Vojt habib")
        } else {
            var string = "Imbarazz fil-queue - " + queue.length +  " : \n";
            queue.map(queueitem => {
                string += "\t\t - " + queueitem.attachment.filename + "\n";
            })
            message.channel.send(string)
        }
        return;
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}inventory`)) {
        if(listinv.length === 0){
            message.channel.send("Xejn muzika bro.")
        } else {
            var string = "Niftakar daqshekk - " + listinv.length +  " : \n";
            listinv.map(listitem => {
                //string += "\t\t - " + listitem.filename + " --- " + listitem.path + " \n";
                string += "\t\t - " + listitem.filename +"\n";
            })
            message.channel.send(string)
        }
        return;
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}play`)) {
        var args = message.content.split(" ")
        if(listinv.length === 0){
            message.channel.send("Ma niftakar xejn, igiefiri ghalxejn bro")
        } else {
            if(args.length > 1){
                var target = null;
                var found = false;
                for(var i = 0; i < listinv.length; i++){
                    if((listinv[i].filename).toLowerCase() === (args[1]).toLowerCase()){
                        found = true;
                        target = listinv[i];
                        break;
                    }
                }
                if(found){
                    var attachment = {
                        filename: target.filename,
                        proxyURL: target.path
                    }
                    const voiceChannel = message.member.voiceChannel;
                    if (!voiceChannel) {
                        message.channel.send('Trid tkun voice chat basla.');
                    } else {
                        if(queue.length === 0){
                            AddToQueue(attachment, message, voiceChannel, false);
                            PlayURL(attachment, message, voiceChannel) 
                        } else {
                            message.channel.send("Ghal wara din: "+ attachment.filename)
                            AddToQueue(attachment, message, voiceChannel, false);
                        }
                    }
                }else{
                    message.channel.send("Ma nafiex din, iccekja x'niftakar l-ewwel (sf!inventory).")
                }
            } else {
                message.channel.send("Mhux ahjar tghidli play xix trumbetta? (sf!play {filename})")
            } 
        }
        return;
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}search`)) {
        var args = message.content.split(" ")
        if(listinv.length === 0){
            message.channel.send("Ma niftakar xejn, igiefiri ghalxejn bro")
        } else {
            if(args.length > 1){
                var results = [];
                for(var i = 0; i < listinv.length; i++){
                    if((listinv[i].filename).toLowerCase().includes((args[1]).toLowerCase())){
                        results.push(listinv[i]);
                    }
                }
                if(results.length != 0){
                    var string = "Dawn sibna - " + results.length +  " : \n";
                    results.map(result => {
                        string += "\t\t - " + result.filename +"\n";
                    })
                    message.channel.send(string)

                    if(args[2] === "play"){
                        message.channel.send("Ha indoqq l-ewwel wahda ukoll la int bla pacenzja");
                        var attachment = {
                            filename: results[0].filename,
                            proxyURL: results[0].path
                        }
                        const voiceChannel = message.member.voiceChannel;
                        if (!voiceChannel) {
                            message.channel.send('Trid tkun voice chat basla.');
                        } else {
                            if(queue.length === 0){
                                AddToQueue(attachment, message, voiceChannel, false);
                                PlayURL(attachment, message, voiceChannel) 
                            } else {
                                message.channel.send("Ghal wara din: "+ attachment.filename)
                                AddToQueue(attachment, message, voiceChannel, false);
                            }
                        }
                    } else {
                        message.channel.send("Jekk ridtni indoqq l-ewwel wahda li sibt, jew 'play' jew xejn");
                    }
                }else{
                    message.channel.send("Ma ghamilna xejn king, ahfirli.")
                }
            } else {
                message.channel.send("Mhux ahjar tghidli search xix french-horn? (sf!play {query})")
            } 
        }
        return;
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}help`)) {
        message.channel.send(
            "Isma naqa kemm jien semplici: \n" +
            "\t\t- Jekk trid idoqq xi haga, kemm itella .mp3 jew .wav. Jekk trid idoqq xi haga ohra, ghid lil John. \n" +
            "\t\t- Jekk tibda idoqq u issa qed tisthi kemm tikteb 'sf!skip'... pussy. \n" +
            "\t\t- Jekk trid twaqqaf kollox ghax ghandek problemi ta' commitment 'sf!stop'. \n" +
            "\t\t- Jekk trid ticcekja x'hemm fil-queue 'sf!queue'. \n" +
            "\t\t- Jekk tixtieq tara x'niftakar 'sf!inventory'. \n" +
            "\t\t- Biex idoqq xi haga li niftakar 'sf!play {filename}'. \n" +
            "\t\t- Jekk trid tfittex certu tip ta' diska 'sf!search {query}. \n" + 
            "\t\t\t Jekk ha jaqalek il-pipi u ghandek bzonn tisma l-muzika malajr, kemm titfa 'play' wara indoqqlok l-ewwel wahda ez. 'sf!search {query} play'. \n" +
            "K'ma jahdiemx xi haga, wahlu f'John.")
        return ;
    }else{
        message.channel.send("Ma tezistix dik troglodit")
        return;
    }
});