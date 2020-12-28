const Discord = require('discord.js')
const setup = require('./setup.json')
const auth = require(setup.auth.path+setup.auth.name)
const words = require(setup.words.path+setup.words.name)
const listinv = require(setup.list.path+setup.list.name)
const playlists = require(setup.playlist.path+setup.playlist.name)
const fs = require('fs')

var queue = []
var dispatcher = null
var status = true

// Initialize Discord Bot
var bot = new Discord.Client()
bot.login(auth.token)

bot.once('ready', function (evt) {
    console.log('Connected')
})

bot.once('reconnecting', () => {
    console.log('Reconnecting!')
})

bot.once('disconnect', () => {
    console.log('Disconnect!')
})

const handlePlay = (attachment, message, remember) => {
    
    const voiceChannel = message.member.voice.channel
    if (!voiceChannel) {
        message.channel.send('Please enter a voice channel.')
    } else {
        if(queue.length === 0){
            AddToQueue(attachment, message, voiceChannel, remember)
            PlayURL(attachment, message, voiceChannel)
        } else {
            message.channel.send("Next up: "+ attachment.name)
            AddToQueue(attachment, message, voiceChannel, remember)
        }
    }
}

const UpdateSongName = (target, newName) => {
    if(listinv[target.toLowerCase()]){
        listinv[newName.toLowerCase()] = listinv[target.toLowerCase()]
        delete listinv[target.toLowerCase()]
        return true
    }
    return false
}

const UpdateStorage = (updateSongs, updatePlaylists) => {
    if(updateSongs){
        fs.writeFile(setup.list.name, JSON.stringify(listinv), (err) => {
            if (err) {
                console.log(err)
            }
        })
    }

    if(updatePlaylists){
        fs.writeFile(setup.playlist.name, JSON.stringify(playlists), (err) => {
            if (err) {
                console.log(err)
            }
        })
    }
}

const AddToListInv = (attachment, message) => {

    var shortened = attachment.name

    shortened = shortened.replace(".mp3", "")

    if(listinv[shortened.toLowerCase()]){
        message.channel.send('This song was already saved, and could be played with sf!play. It has now be overriden')
    }
    listinv[shortened.toLowerCase()] = attachment.proxyURL

    UpdateStorage(true)
}

const checkPrefix = (content, prefix=null) => {
    if(prefix === null){
        return content.substring(0,3) === setup.prefix
    } else {
        return content.substring(0,prefix.length) === prefix
    }
}

const AddToQueue = (attachment, message, voiceChannel, remember) => {   
    if(remember){
        AddToListInv(attachment, message)
    }
    queue.push({
        attachment: attachment,
        message: message,
        voiceChannel: voiceChannel
    })
}

const PlayURL = (attachment, message, voiceChannel) => {

    const permissions = voiceChannel.permissionsFor(message.client.user)
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        message.channel.send('I need the permissions to join and speak in your voice channel!')
        return
    }

    voiceChannel.join()
        .then(connection =>{ 
            dispatcher = connection.play(attachment.proxyURL)
            status = true
            message.channel.send('Now Playing:' + attachment.name)
                .then(() => {
                    dispatcher.on("finish", end => {
                        if(queue.length > 1){
                            queue.splice(0,1)
                            message.channel.send('Next up:' + queue[0].attachment.name)
                                .then(() => {
                                    PlayURL(queue[0].attachment, queue[0].message, queue[0].voiceChannel)
                                })
                        } else {
                            queue[0].voiceChannel.leave()
                            queue.splice(0,1)
                            message.channel.send('Done!')
                        }
                    })    
                })
                .catch(error => {
                    console.log(error)
                    message.channel.send('Error encountered, please contact me because I clearly suck.')
                    voiceChannel.leave()
                })
        })
        .catch(err => {
            console.log(err)
            message.channel.send('Error encountered, please contact me because I clearly suck.')
            voiceChannel.leave()
        })
}

bot.on('message', async message => { 
    if(message.author.bot) return

    if (!checkPrefix(message.content.toLowerCase())){
        if(message.attachments !== undefined && message.attachments.size !== 0){
            message.attachments.map(attachment => {
                if(attachment.name.includes(".mp3")){
                    handlePlay(attachment, message, true)
                }
                return
            })
        }
        return
    } 

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}bye`)) {
        message.channel.send("Asta Pasta!")
        bot.destroy()
        return
    }

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}skip`)) {
        if(queue.length === 0){
            message.channel.send("Nothing to skip!")
        } else {
            message.channel.send("Stopping: " + queue[0].attachment.name)
                .then(() => {      
                    if(dispatcher != null){
                        dispatcher.destroy()
                    }
                    if(queue.length > 1){
                        queue.splice(0,1)
                        message.channel.send('Next up: ' + queue[0].attachment.name)
                            .then(() => {
                                PlayURL(queue[0].attachment, queue[0].message, queue[0].voiceChannel)
                            })
                    } else {
                        queue[0].voiceChannel.leave()
                        queue.splice(0,1)
                        message.channel.send('Done!')
                    }
                })
        }
        return
    }

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}stop`)) {
        if(queue.length === 0){
            message.channel.send("Int qed tiblaghhom?")
        } else {
            message.channel.send("Ha inwaqaf kollox mela")
                .then(() => {
                    queue[0].voiceChannel.leave()
                    queue = []
                    if(dispatcher != null){
                        dispatcher.destroy()
                    }
                })
        }
        return
    }

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}queue`)) {
        if(queue.length === 0){
            message.channel.send("Vojt habib")
        } else {
            var string = "Imbarazz fil-queue - " + queue.length +  " : \n"
            queue.map(queueitem => {
                string += "\t\t - " + queueitem.attachment.name + "\n"
            })
            message.channel.send(string)
        }
        return
    }

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}inventory`)) {
        var keys = Object.keys(listinv)
        if(keys.length === 0){
            message.channel.send("Xejn muzika bro.")
        } else {
            var string = "Niftakar " + keys.length +  " diski : \n"

            for(var i = 0; i < keys.length; i++){
                string += "\t\t - " + keys[i] +"\n"
            }

            message.channel.send(string)
        }
        return
    }

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}play`)) {
        var args = message.content.split(" ")
        if(Object.keys(listinv).length === 0){
            message.channel.send("Ma niftakar xejn, igiefiri ghalxejn bro")
        } else {
            if(args.length > 1){
                
                if(listinv[args[1].toLowerCase()]){
                    var attachment = {
                        name: args[1],
                        proxyURL: listinv[args[1].toLowerCase()]
                    }
                    handlePlay(attachment, message, false)
                }else{
                    message.channel.send("Ma nafiex din, iccekja x'niftakar l-ewwel ("+setup.prefix+"inventory).")
                }

            } else {
                message.channel.send("Mhux ahjar tghidli play xix trumbetta? ("+setup.prefix+"play {name})")
            } 
        }
        return
    }

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}search`)) {
        var args = message.content.split(" ")
        if(Object.keys(listinv).length === 0){
            message.channel.send("Ma niftakar xejn, igiefiri ghalxejn bro")
        } else {
            if(args.length > 1){
                var results = []
                var keys = Object.keys(listinv)
    
                for(var i = 0; i < keys.length;i++){
                    if(keys[i].toLowerCase().includes(args[1].toLowerCase())){
                        results.push(keys[i])
                    }
                }
                if(results.length != 0){
                    var string = "Dawn sibna - " + results.length +  " : \n"
                    for(var i = 0; i < results.length;i++){
                        string += "\t\t - " + results[i] +"\n"
                    }
                    message.channel.send(string)
                        .then(() => {
                            if(args[2] === "play"){
                                message.channel.send("Ha indoqq l-ewwel wahda ukoll la int bla pacenzja")
                                    .then(() => {
                                        var attachment = {
                                            name: results[0],
                                            proxyURL: listinv[results[0]]
                                        }
                                        handlePlay(attachment,message, false)
                                    })
                            } else {
                                message.channel.send("Jekk ridtni indoqq l-ewwel wahda li sibt, jew 'play' jew xejn")
                            }

                        })
                
                }
            } else {
                message.channel.send("Mhux ahjar tghidli search xix french-horn? ("+setup.prefix+"play {query})")
            } 
        }
        return
    }

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}rename`)) {
        if(Object.keys(listinv).length === 0){
            message.channel.send("Ma tista tbidel xejn jekk ma hawn xejn kink")
        } else {
            var args = message.content.split(" ")
            if(!listinv(args[1].toLowerCase())){
                if(queue.length === 0){
                    if(args.length > 2){                 
                        if(UpdateSongName(args[2], args[1])){
                            UpdateStorage(true)
                            message.channel.send("Bumba king, bidilt '"+ args[2] + "' ghal '" + args[1] + "'")
                        } else {
                            message.channel.send("Skuzani ma sibtiex din, igiefiri ma nistax nibdilla isimha")
                        }
                    } else{
                        message.channel.send("Jekk ma hemm xejn ghaddej, trid tghidli li trid nibdel bro, minniex psychic")
                    }
                } else {
                    if(args.length > 2){
                        if(UpdateSongName(args[2], args[1])){
                            UpdateStorage(true)
                            message.channel.send("Bumba king, bidilt '"+ args[2] + "' ghal '" + args[1] + "'")
                        } else {
                            message.channel.send("Skuzani ma sibtiex din, igiefiri ma nistax nibdilla isimha")
                        }
                    } else {
                        UpdateSongName(queue[0].attachment.name, args[1])
                        UpdateStorage(true)
                        message.channel.send("Bumba king, bidilt '"+ queue[0].attachment.name + "' ghal '" + args[1] + "'")    
                    }
                }
            } else {
                message.channel.send("Ga ghandek xi haga jisima hekk bro, ma nista insemmi xejn hekk")
            }
        }   
        return
    }

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}delete`)) {
        if(Object.keys(listinv).length === 0){
            message.channel.send("Ma hawn xejn xi tnehhi kink")
        } else {
            var args = message.content.split(" ")
            if(queue.length === 0){
                if(args.length > 1){
                    if(listinv[args[1].toLowerCase()]){
                        delete listinv[args[1].toLowerCase()]
                        message.channel.send("Tajjeb mela ha nehhijlek din: " + args[1])
                        UpdateStorage(true)
                    }else{
                        message.channel.send("What is dead may never die!")
                    }
                } else {
                    message.channel.send("Jekk ma hemm xejn ghaddej, trid tghidli x'ha innehi bro, erga prova")
                }
            } else {
                if(args.length > 1){
                    if(listinv[args[1].toLowerCase()]){
                        delete listinv[args[1].toLowerCase()]
                        message.channel.send("Tajjeb mela ha nehhijlek din: " + args[1])
                        UpdateStorage(true)
                    }else{
                        message.channel.send("What is dead may never die!")
                    }
                } else {
                    message.channel.send("Tajjeb mela ha nehhijlek '" + queue[0].attachment.name + "' li kienet qed idoqq, so ha inwaqqfuha ukoll")
                        .then(() => {
                            delete listinv[queue[0].attachment.name]
                            UpdateStorage(true)
                            if(dispatcher != null){
                                dispatcher.destroy()
                            }
                        })
                }
            }
        }
        return
    }
    
    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}pause`)) {
        if(dispatcher != null){
            if(status){
                message.channel.send("Mela ha inwaqaf naqa " + queue[0].attachment.name)
                    .then(() => {
                        dispatcher.pause(true)
                        status = false
                    })
            }
        }else {
            message.channel.send("Ma hemm xejn ghaddej bro")
        }
        return
    }

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}resume`)) {
        if(dispatcher != null){
            if(!status){
                message.channel.send("Ha inkomplija min " + queue[0].attachment.name)
                    .then(() => {
                        dispatcher.resume()
                        status = true
                    })
            }
        }else {
            message.channel.send("Ma hemm xejn ghaddej bro")
        }
        return
    }

    if (checkPrefix(message.content.toLowerCase(),`${setup.prefix}help`)) {
        message.channel.send(
            "\nIsma naqa kemm jien semplici: \n\n" +
            "\t\t- Jekk trid idoqq xi haga, kemm itella .mp3 jew .wav. Jekk trid idoqq xi haga ohra, ghid lil John. \n" +
            "\t\t- Jekk tibda idoqq u issa qed tisthi kemm tikteb '"+setup.prefix+"skip'... pussy. \n" +
            "\t\t- Jekk trid twaqqaf kollox ghax ghandek problemi ta' commitment '"+setup.prefix+"stop'. \n" +
            "\t\t- Jekk trid twaqqaf ghal ftit biss ghax il-commitment problems tieghek naqa izghar, '"+setup.prefix+"pause'. \n" +
            "\t\t- Jekk trid darietlek d-duda reget, '"+setup.prefix+"resume'. \n" +
            "\t\t- Jekk trid ticcekja x'hemm fil-queue '"+setup.prefix+"queue'. \n" +
            "\t\t- Jekk tixtieq tara x'niftakar '"+setup.prefix+"inventory'. \n" +
            "\t\t- Jekk tixtieq tibdel l-isem ta' xi haga li niftakar, jew doqqa u bidel l-isem dak il-hin '"+setup.prefix+"rename {newname}' \n" +
            "\t\t  Jew inkella ghidli liema wahda tixtieq tibdel '"+setup.prefix+"rename {newname} {oldname}' \n" +
            "\t\t- Biex idoqq xi haga li niftakar '"+setup.prefix+"play {name}'. \n" +
            "\t\t- Jekk trid tfittex certu tip ta' diska '"+setup.prefix+"search {query}. \n" + 
            "\t\t  Jekk ha jaqalek il-pipi u ghandek bzonn tisma l-muzika malajr, kemm titfa 'play' wara indoqqlok l-ewwel wahda ez. '"+setup.prefix+"search {query} play'. \n\n" +
            "K'ma jahdiemx xi haga, wahlu f'John.")
        return 
    }else{
        message.channel.send("Ma tezistix dik troglodit")
        return
    }
})