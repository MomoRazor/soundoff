import Discord from  "discord.js"
import fs from "fs"
import { createRequire } from "module";

import {login, setInitialListeners, checkPrefix, listenToMessage, auth} from "./auth/index.js"
import {getLines } from "./lang/index.js"

const listPath = "list.json"
const playlistPath = "playlists.json"

const require = createRequire(import.meta.url)
const listinv = require("./"+listPath)
const playlists = require("./"+playlistPath)

var queue = []
var dispatcher = null
var status = true

// Initialize Discord Bot
var bot = new Discord.Client()

login(bot)
setInitialListeners(bot)

const handlePlay = (attachment, message, remember) => {
    
    const voiceChannel = message.member.voice.channel
    if (!voiceChannel) {
        message.channel.send(getLines("noChannel"))
    } else {
        if(queue.length === 0){
            addToQueue(attachment, message, voiceChannel, remember)
            playURL(attachment, message, voiceChannel)
        } else {
            message.channel.send(getLines("next")+ attachment.name)
            addToQueue(attachment, message, voiceChannel, remember)
        }
    }
}

const updateSongName = (target, newName) => {
    if(listinv[target.toLowerCase()]){
        listinv[newName.toLowerCase()] = listinv[target.toLowerCase()]
        delete listinv[target.toLowerCase()]
        return true
    }
    return false
}

const updateStorage = (updateSongs, updatePlaylists) => {
    if(updateSongs){
        fs.writeFile(listPath, JSON.stringify(listinv), (err) => {
            if (err) {
                console.log(err)
            }
        })
    }

    if(updatePlaylists){
        fs.writeFile(playlistPath, JSON.stringify(playlists), (err) => {
            if (err) {
                console.log(err)
            }
        })
    }
}

const addToListInv = (attachment, message) => {

    var shortened = attachment.name

    shortened = shortened.replace(".mp3", "")

    if(listinv[shortened.toLowerCase()]){
        message.channel.send('This song was already saved, and could be played with sf!play. It has now be overridden')
    }
    listinv[shortened.toLowerCase()] = attachment.proxyURL

    updateStorage(true)
}

const addToQueue = (attachment, message, voiceChannel, remember) => {   
    if(remember){
        addToListInv(attachment, message)
    }
    queue.push({
        attachment: attachment,
        message: message,
        voiceChannel: voiceChannel
    })
}

const playURL = (attachment, message, voiceChannel) => {

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
                        console.log(end)
                        if(queue.length > 1){
                            queue.splice(0,1)
                            message.channel.send('Next up:' + queue[0].attachment.name)
                                .then(() => {
                                    playURL(queue[0].attachment, queue[0].message, queue[0].voiceChannel)
                                })
                        } else {
                            dispatcher.destroy()
                            voiceChannel.leave()
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

listenToMessage(bot, (message) => {
    if (!checkPrefix(message.content.toLowerCase())){
        if(message.attachments !== undefined && message.attachments.size !== 0){
            message.attachments.map(attachment => {
                if(attachment.name.includes(".mp3")){
                    handlePlay(attachment, message, true)
                }
                return true
            })
        }
        return true
    } 

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}skip`)) {
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
                                playURL(queue[0].attachment, queue[0].message, queue[0].voiceChannel)
                            })
                    } else {
                        queue[0].voiceChannel.leave()
                        queue.splice(0,1)
                        message.channel.send('Done!')
                    }
                })
        }
        return true
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}stop`)) {
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
        return true
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}queue`)) {
        if(queue.length === 0){
            message.channel.send("Vojt habib")
        } else {
            var string = "Imbarazz fil-queue - " + queue.length +  " : \n"
            queue.map(queueitem => {
                string += "\t\t - " + queueitem.attachment.name + "\n"
            })
            message.channel.send(string)
        }
        return true
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}inventory`)) {
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
        return true
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}play`)) {
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
                    message.channel.send("Ma nafiex din, iccekja x'niftakar l-ewwel ("+auth.prefix+"inventory).")
                }

            } else {
                message.channel.send("Mhux ahjar tghidli play xix trumbetta? ("+auth.prefix+"play {name})")
            } 
        }
        return true
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}search`)) {
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
                message.channel.send("Mhux ahjar tghidli search xix french-horn? ("+auth.prefix+"play {query})")
            } 
        }
        return true
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}rename`)) {
        if(Object.keys(listinv).length === 0){
            message.channel.send("Ma tista tbidel xejn jekk ma hawn xejn kink")
        } else {
            var args = message.content.split(" ")
            if(!listinv(args[1].toLowerCase())){
                if(queue.length === 0){
                    if(args.length > 2){                 
                        if(updateSongName(args[2], args[1])){
                            updateStorage(true)
                            message.channel.send("Bumba king, bidilt '"+ args[2] + "' ghal '" + args[1] + "'")
                        } else {
                            message.channel.send("Skuzani ma sibtiex din, igiefiri ma nistax nibdilla isimha")
                        }
                    } else{
                        message.channel.send("Jekk ma hemm xejn ghaddej, trid tghidli li trid nibdel bro, minniex psychic")
                    }
                } else {
                    if(args.length > 2){
                        if(updateSongName(args[2], args[1])){
                            updateStorage(true)
                            message.channel.send("Bumba king, bidilt '"+ args[2] + "' ghal '" + args[1] + "'")
                        } else {
                            message.channel.send("Skuzani ma sibtiex din, igiefiri ma nistax nibdilla isimha")
                        }
                    } else {
                        updateSongName(queue[0].attachment.name, args[1])
                        updateStorage(true)
                        message.channel.send("Bumba king, bidilt '"+ queue[0].attachment.name + "' ghal '" + args[1] + "'")    
                    }
                }
            } else {
                message.channel.send("Ga ghandek xi haga jisima hekk bro, ma nista insemmi xejn hekk")
            }
        }   
        return true
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}delete`)) {
        if(Object.keys(listinv).length === 0){
            message.channel.send("Ma hawn xejn xi tnehhi kink")
        } else {
            var args = message.content.split(" ")
            if(queue.length === 0){
                if(args.length > 1){
                    if(listinv[args[1].toLowerCase()]){
                        delete listinv[args[1].toLowerCase()]
                        message.channel.send("Tajjeb mela ha nehhijlek din: " + args[1])
                        updateStorage(true)
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
                        updateStorage(true)
                    }else{
                        message.channel.send("What is dead may never die!")
                    }
                } else {
                    message.channel.send("Tajjeb mela ha nehhijlek '" + queue[0].attachment.name + "' li kienet qed idoqq, so ha inwaqqfuha ukoll")
                        .then(() => {
                            delete listinv[queue[0].attachment.name]
                            updateStorage(true)
                            if(dispatcher != null){
                                dispatcher.destroy()
                            }
                        })
                }
            }
        }
        return true
    }
    
    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}pause`)) {
        if(dispatcher != null){
            if(status){
                message.channel.send("Mela ha inwaqaf naqa " + queue[0].attachment.name)
                    .then(() => {
                        dispatcher.pause()
                        status = false
                    })
            }
        }else {
            message.channel.send("Ma hemm xejn ghaddej bro")
        }
        return true
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}resume`)) {
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
        return true
    }

})