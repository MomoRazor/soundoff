const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');

var listinv = [];
var queue = [];
var dispatcher = null;
var status = true;

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

function handlePlay(attachment, message, remember){
    
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        message.channel.send('Trid tkun voice chat basla.');
    } else {
        if(queue.length === 0){
            AddToQueue(attachment, message, voiceChannel, remember);
            PlayURL(attachment, message, voiceChannel)
        } else {
            message.channel.send("Ghal wara din: "+ attachment.name);
            AddToQueue(attachment, message, voiceChannel, remember);
        }
    }
}

function checkInv(name){
    for(var i = 0; i < listinv.length; i++){
        if((listinv[i].name).toLowerCase() === (name).toLowerCase()){
            return true;
        }
    }
    return false;
}

function ReadFile(message, callback){
    
    if(listinv.length === 0){
        fs.readFile(auth.listpath, 'utf8', function(err, contents) {
            if(contents != "" && contents != undefined){
                var list = contents.split("|")
                list.map(listitem => {
                    if(listitem != ""){
                        var listitemdict = listitem.split(",")
                        listinv.push({
                            name: listitemdict[0],
                            path: listitemdict[1]
                        })
                    }
                })
            }
            callback(message)
        });
    } else {
        callback(message)
    }
}

function DeleteSong(target){
    for(var i = 0; i < listinv.length; i++){
        if((listinv[i].name).toLowerCase() === target.toLowerCase()){
            listinv.splice(i,1);
            return target;
        }
    }
    return false;
}

function UpdateSongName(target, newName){
    for(var i = 0; i < listinv.length; i++){
        if((listinv[i].name).toLowerCase() === target.toLowerCase()){
            changed = listinv[i].name;
            listinv[i].name = newName;
            return true;
        }
    }
    return false;
}

function ReWriteFile(){
    var string = "";
    for(var i = 0; i < listinv.length; i++){
        string += listinv[i].name + "," + listinv[i].path + "|";
    }

    fs.writeFile(auth.listpath, string, function(err){
        if(err){
            return console.log(err);
        }
    })
}

function AddToListInv(attachment, message){

    var shortened = attachment.name;

    shortened = shortened.replace(".wav", "")
    shortened = shortened.replace(".mp3", "")

    if(!checkInv(shortened)){
        listinv.push({
            name: shortened,
            path: attachment.proxyURL
        })
    } else {
        message.channel.send('Kont nafha din, stajt tismghha b\'play biss ta,... Pero ha nerga nitghallima ha.')
        for(var i = 0; i < listinv.length; i++){
            if((listinv[i].name).toLowerCase() === shortened.toLowerCase()){
                listinv[i].path = attachment.proxyURL;
                break;
            }
        }
    }
    ReWriteFile()
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

function AddToQueue(attachment, message, voiceChannel, remember){   
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
            dispatcher = connection.play(attachment.proxyURL)
            status = true;
            message.channel.send('Ha indoqq: ' + attachment.name)
                .then(() => {
                    dispatcher.on("finish", end => {
                        if(queue.length > 1){
                            queue.splice(0,1)
                            message.channel.send('Ara gejja ohra: ' + queue[0].attachment.name)
                                .then(() => {
                                    PlayURL(queue[0].attachment, queue[0].message, queue[0].voiceChannel)
                                })
                        } else {
                            queue[0].voiceChannel.leave();
                            queue.splice(0,1)
                            message.channel.send('Lest jien');
                        }
                    });    
                })
                .catch(error => {
                    console.log(error)
                    message.channel.send('Fotta xi haga John, sorry bro!');
                    voiceChannel.leave();
                })
        })
        .catch(err => {
            console.log(err)
            message.channel.send('Fotta xi haga John, sorry bro!');
            voiceChannel.leave();
        });
}

bot.on('message', async message => { 
    ReadFile(message, (message) => {
        if(message.author.bot) return;

        if (!checkPrefix(message.content.toLowerCase())){
            if(message.attachments === undefined || message.attachments.size === 0){
                return
            } else {
                message.attachments.map(attachment => {
                    if(attachment.name.includes(".wav") || attachment.name.includes(".mp3")){
                        handlePlay(attachment, message, true);
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
                .then(() => {
                    bot.destroy()
                })
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
                message.channel.send("Ha inwaqaf: " + queue[0].attachment.name)
                    .then(() => {      
                        if(dispatcher != null){
                            dispatcher.destroy();
                        }
                        if(queue.length > 1){
                            queue.splice(0,1)
                            message.channel.send('Ara gejja ohra: ' + queue[0].attachment.name)
                                .then(() => {
                                    PlayURL(queue[0].attachment, queue[0].message, queue[0].voiceChannel)
                                })
                        } else {
                            queue[0].voiceChannel.leave();
                            queue.splice(0,1)
                            message.channel.send('Lest jien');
                        }
                    })
            }
            return;
        }

        if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}stop`)) {
            if(queue.length === 0){
                message.channel.send("Int qed tiblaghhom?");
            } else {
                message.channel.send("Ha inwaqaf kollox mela")
                    .then(() => {
                        queue[0].voiceChannel.leave();
                        queue = [];
                        if(dispatcher != null){
                            dispatcher.destroy();
                        }
                    })
            }
            return;
        }

        if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}queue`)) {
            if(queue.length === 0){
                message.channel.send("Vojt habib")
            } else {
                var string = "Imbarazz fil-queue - " + queue.length +  " : \n";
                queue.map(queueitem => {
                    string += "\t\t - " + queueitem.attachment.name + "\n";
                })
                message.channel.send(string)
            }
            return;
        }
    
        if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}inventory`)) {
            if(listinv.length === 0){
                message.channel.send("Xejn muzika bro.")
            } else {
                var string = "Niftakar " + listinv.length +  " diski : \n";
                listinv.map(listitem => {
                    string += "\t\t - " + listitem.name +"\n";
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
                        if((listinv[i].name).toLowerCase() === (args[1]).toLowerCase()){
                            found = true;
                            target = listinv[i];
                            break;
                        }
                    }
                    if(found){
                        var attachment = {
                            name: target.name,
                            proxyURL: target.path
                        }
                        handlePlay(attachment, message, false);
                    }else{
                        message.channel.send("Ma nafiex din, iccekja x'niftakar l-ewwel (sf!inventory).")
                    }
                } else {
                    message.channel.send("Mhux ahjar tghidli play xix trumbetta? (sf!play {name})")
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
                        if((listinv[i].name).toLowerCase().includes((args[1]).toLowerCase())){
                            results.push(listinv[i]);
                        }
                    }
                    if(results.length != 0){
                        var string = "Dawn sibna - " + results.length +  " : \n";
                        results.map(result => {
                            string += "\t\t - " + result.name +"\n";
                        })
                        message.channel.send(string)
                            .then(() => {
                                if(args[2] === "play"){
                                    message.channel.send("Ha indoqq l-ewwel wahda ukoll la int bla pacenzja")
                                        .then(() => {
                                            var attachment = {
                                                name: results[0].name,
                                                proxyURL: results[0].path
                                            }
                                            handlePlay(attachment,message, false)
                                        })
                                } else {
                                    message.channel.send("Jekk ridtni indoqq l-ewwel wahda li sibt, jew 'play' jew xejn");
                                }

                            })
    
                    }else{
                        message.channel.send("Ma ghamilna xejn king, ahfirli.")
                    }
                } else {
                    message.channel.send("Mhux ahjar tghidli search xix french-horn? (sf!play {query})")
                } 
            }
            return;
        }
      
        if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}rename`)) {
            if(listinv.length === 0){
                message.channel.send("Ma tista tbidel xejn jekk ma hawn xejn kink")
            } else {
                var args = message.content.split(" ")
                var changed = "";
                if(!checkInv(args[1])){
                    if(queue.length === 0){
                        if(args.length > 2){                 
                            if(UpdateSongName(args[2], args[1])){
                                ReWriteFile();
                                message.channel.send("Bumba king, bidilt '"+ changed + "' ghal '" + args[1] + "'");
                            } else {
                                message.channel.send("Skuzani ma sibtiex din, igiefiri ma nistax nibdilla isimha")
                            }
                        } else{
                            message.channel.send("Jekk ma hemm xejn ghaddej, trid tghidli li trid nibdel bro, minniex psychic")
                        }
                    } else {
                        if(args.length > 2){
                            if(UpdateSongName(args[2], args[1])){
                                ReWriteFile();
                                message.channel.send("Bumba king, bidilt '"+ changed + "' ghal '" + args[1] + "'");
                            } else {
                                message.channel.send("Skuzani ma sibtiex din, igiefiri ma nistax nibdilla isimha")
                            }
                        } else {
                            for(var i = 0; i < listinv.length; i++){
                                if((listinv[i].name).toLowerCase() === (queue[0].attachment.name).toLowerCase()){
                                    queue[0].attachment.name = args[1];
                                    changed = queue[0].attachment.name;
                                    listinv[i].name = args[1];
                                    break;
                                }
                            }
                            ReWriteFile();
                            message.channel.send("Bumba king, bidilt '"+ changed + "' li qed iddoq bhalissa, ghal '" + args[1] + "'");
                        }
                    }
                } else {
                    message.channel.send("Ga ghandek xi haga jisima hekk bro, ma nista insemmi xejn hekk")
                }
            }   
            return;
        }
    
        if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}delete`)) {
            if(listinv.length === 0){
                message.channel.send("Ma hawn xejn xi tnehhi kink")
            } else {
                var args = message.content.split(" ")
                if(queue.length === 0){
                    if(args.length > 1){
                        if(DeleteSong(args[1])){
                            message.channel.send("Tajjeb mela ha nehhijlek din: " + args[1])
                                .then(() => {
                                    ReWriteFile();
                                })
                        } else {
                            message.channel.send("Skuzani ma sibtiex din, ma nistax innehija </3")
                        }
                    } else {
                        message.channel.send("Jekk ma hemm xejn ghaddej, trid tghidli x'ha innehi bro, erga prova")
                    }
                } else {
                    if(args.length > 1){
                        if(DeleteSong(args[1])){
                            message.channel.send("Tajjeb mela ha nehhijlek din: " + args[1])
                                .then(() => {
                                    ReWriteFile();
                                })
                        } else {
                            message.channel.send("Skuzani ma sibtiex din, ma nistax innehija </3")
                        }
                    } else {
                        message.channel.send("Tajjeb mela ha nehhijlek '" + DeleteSong(queue[0].attachment.name) + "' li kienet qed idoqq, so ha inwaqqfuha ukoll")
                            .then(() => {
                                ReWriteFile();
                                if(dispatcher != null){
                                    dispatcher.destroy();
                                }
                            })
                    }
                }
            }
            return;
        }
          
        if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}pause`)) {
            if(dispatcher != null){
                if(status){
                    message.channel.send("Mela ha inwaqaf naqa " + queue[0].attachment.name)
                        .then(() => {
                            dispatcher.pause(true);
                            status = false;
                        })
                }
            }else {
                message.channel.send("Ma hemm xejn ghaddej bro")
            }
            return;
        }
    
        if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}resume`)) {
            if(dispatcher != null){
                if(!status){
                    message.channel.send("Ha inkomplija min " + queue[0].attachment.name)
                        .then(() => {
                            dispatcher.resume();
                            status = true;
                        })
                }
            }else {
                message.channel.send("Ma hemm xejn ghaddej bro")
            }
            return;
        }
    
        if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}help`)) {
            message.channel.send(
                "\nIsma naqa kemm jien semplici: \n\n" +
                "\t\t- Jekk trid idoqq xi haga, kemm itella .mp3 jew .wav. Jekk trid idoqq xi haga ohra, ghid lil John. \n" +
                "\t\t- Jekk tibda idoqq u issa qed tisthi kemm tikteb 'sf!skip'... pussy. \n" +
                "\t\t- Jekk trid twaqqaf kollox ghax ghandek problemi ta' commitment 'sf!stop'. \n" +
                "\t\t- Jekk trid twaqqaf ghal ftit biss ghax il-commitment problems tieghek naqa izghar, 'sf!pause'. \n" +
                "\t\t- Jekk trid darietlek d-duda reget, 'sf!resume'. \n" +
                "\t\t- Jekk trid ticcekja x'hemm fil-queue 'sf!queue'. \n" +
                "\t\t- Jekk tixtieq tara x'niftakar 'sf!inventory'. \n" +
                "\t\t- Jekk tixtieq tibdel l-isem ta' xi haga li niftakar, jew doqqa u bidel l-isem dak il-hin 'sf!rename {newname}' \n" +
                "\t\t  Jew inkella ghidli liema wahda tixtieq tibdel 'sf!rename {newname} {oldname}' \n" +
                "\t\t- Biex idoqq xi haga li niftakar 'sf!play {name}'. \n" +
                "\t\t- Jekk trid tfittex certu tip ta' diska 'sf!search {query}. \n" + 
                "\t\t  Jekk ha jaqalek il-pipi u ghandek bzonn tisma l-muzika malajr, kemm titfa 'play' wara indoqqlok l-ewwel wahda ez. 'sf!search {query} play'. \n\n" +
                "K'ma jahdiemx xi haga, wahlu f'John.")
            return ;
        }else{
            message.channel.send("Ma tezistix dik troglodit")
            return;
        }
    })
});
