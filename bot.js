const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');

var gameStarted = false;
var gameBegun = false;
var playerIn = [];

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

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
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

function checkAdmin(id, message){    

    for(var i = 0; i < playerIn.length; i++){
        if(playerIn[i].id === id && playerIn[i].admin){
            return true;
        }
    }

    message.channel.send("Jekk ridt tmexxi missek bdejta int basla")

    return false
}

function StartGame(){
    var werewolves;
    var doctor;
    var angel;

    //TODO to remove
    playerIn.push({
        id: "TEST MAN",
        admin: false
    })
    
    playerIn.push({
        id: "TEST MAN2",
        admin: false
    })
    
    playerIn.push({
        id: "TEST MAN3",
        admin: false
    })

    playerIn.push({
        id: "TEST MAN4",
        admin: false
    })

    playerIn.push({
        id: "TEST MAN5",
        admin: false
    })

    var temp_players = shuffle(playerIn)

    if(temp_players.length < 7){
        werewolves = 2;
        doctor = 1;
        angel = 0;
    }else if(temp_players.length === 7){
        werewolves = 2;
        doctor = 1;
        angel = 1;
    }else if(temp_players.length >= 8){
        werewolves = Math.round(temp_players.length/3)
        doctor = 1;
        angel = 1; 
    }

    for(var i = 0; i < temp_players.length; i++){

        if(werewolves > 0){
            temp_players[i].type = "Werewolf"
            werewolves--;
        } else if(doctor > 0){
            temp_players[i].type = "Doctor"
            doctor--;
        }else if(angel > 0){
            temp_players[i].type = "Angel"
            angel--;
        }else{
            temp_players[i].type = "Civilian"
        }
    }
 
    gameBegun = true;

    playerIn = shuffle(temp_players)
}

async function YesNoListen(message){
    if(message.author.bot) return
    if(message.content === "Y"){
        //TODO allow only admin
        //TODO start Night
        message.channel.send("GHAL QATLA");
        bot.removeListener('message',YesNoListen)
        
    }else if(message.content === "N"){
        //TODO allow only admin
        //TODO start discussion
        message.channel.send("Iddiskutejna LIBA");
        bot.removeListener('message',YesNoListen)
    }else {
        message.channel.send("Ijja wiegeb 'Y' jew 'N' Banana!")
    }
}

bot.on('message', async message => {
    if(message.author.bot) return
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}test`)) {
        message.channel.send("Dan test duda!")
        return;
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}die`)) {
        message.channel.send("Caw Zejz!")
        bot.destroy()
        return;
    }

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}start`)){
        if(!gameStarted){
            message.channel.send("Ajma zaqqi, f'idejn <@"+ message.member.user.id +"> din. Min irid jista jithol!")
            playerIn.push({
                id: message.member.user.id,
                admin: true,
            })
            gameStarted = true;
        }else{
            message.channel.send("Ga hemm wahda ghaddej pajs, mitluf ta")
        }
        return;
    }

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}in`)){
        
        if(gameStarted){
            if(!gameBegun){
                var found = false;
        
                for(var i = 0; i < playerIn.length; i++){
                    if(playerIn[i].id === message.member.user.id){
                        found = true;
                    }
                }
        
                if(!found){
        
                    var choice = getRandomInt(4);
                    switch(choice){
                        case 0: 
                            message.channel.send("Note with thanks <@"+ message.member.user.id+">")
                            break;
                        case 1: 
                            message.channel.send("Il-liba diga bdejt iddejjaqni <@"+ message.member.user.id+">")
                            break;
                        case 2:
                            message.channel.send("\*laughing\*. Stenn actually vera ha tilghab <@"+ message.member.user.id +"> \*laughing intensifies\*")
                            break;
                        case 3:
                            message.channel.send("Welcome borza hara, awww <@"+ message.member.user.id +">")
                            break;
                        default:
                            break;
                    }
        
                    playerIn.push({
                        id: message.member.user.id,
                        admin: false,
                    })
        
                    var output = "Nies s'issa: \n";
                    for(var i = 0; i < playerIn.length; i++){
                        if(playerIn[i].admin){
                            output += "\t\t - <@"+playerIn[i].id+"> - il-boss \n";
                        }else{
                            output += "\t\t - <@"+playerIn[i].id+"> \n";
                        }
                    }
    
                    message.channel.send(output)
        
                }else{
                    var choice = getRandomInt(6);
                    switch(choice){
                        case 0: 
                            message.channel.send("Ijwa ijwa fhimtek <@"+ message.member.user.id+">")
                            break;
                        case 1: 
                            message.channel.send("Ok")
                            break;
                        case 2:
                            message.channel.send("Warlight <@"+ message.member.user.id+">")
                            break;
                        case 3:
                            message.channel.send("Jekk tibatli ohra <@"+ message.member.user.id +"> personalment nigi naqlalek il gerzuma")
                            break;
                        case 4:
                            message.channel.send("<@"+message.member.user.id +"> jekk tghidli ohra ha ncempel il pulizija")
                            break;
                        case 5:
                            message.channel.send("Ooooof, needy much <@"+ message.member.user.id+">")
                            break;
                        default:
                            break;
                    }
                }
            }else{
                message.channel.send("Ga bdiet il-loghba barri. Issa stenna u ghaggel darb' ohra")
            }
        }else{
            message.channel.send("Ma hemmx loghba ghaddej, Aqbad u ibda wahda int jekk ghandek il-Cookies")
        }
        
    }

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}list`)){
        if(gameStarted){
            var output = "Nies s'issa: \n";
            for(var i = 0; i < playerIn.length; i++){
                if(playerIn[i].admin){
                    output += "\t\t - <@"+playerIn[i].id+"> - il-boss \n";
                }else{
                    output += "\t\t - <@"+playerIn[i].id+"> \n";
                }
            }
            message.channel.send(output)
        }else{
            message.channel.send("X'lista hij? Mela qed tiblaghom?!")
        }
    }

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}stop`)){
        if(gameStarted){
            if(checkAdmin(message.member.user.id, message)){
                gameStarted = false;
                gameBegun = false;
                playerIn = []
                message.channel.send("Piff x'int spoil sport <@" + message.member.user.id + "> imma ok")
            }
        }else{
            message.channel.send("Ma hemmx loghob xi twaqqaf troglodit")
        }
        return;
    }

    if (checkPrefix(message.content.toLowerCase(), `${auth.prefix}begin`)){
        if(gameStarted){
            if(!gameBegun){
                if(checkAdmin(message.member.user.id, message)){
                    //TODO fix to 5 later
                    if(playerIn.length >= 2){
                        StartGame()
                        message.channel.send("Il-loghba lesta, ha tibda b'lejl jew le? (Y/N).")

                        bot.on('message', YesNoListen)
                    }else{          
                        message.channel.send("Irid ikun hemm alinqas 5 min nies. Tghallem ghodd.")
                    }
                }
            }else{
                message.channel.send("Taf kemm ilna li bdejna dahna?")
            }
        }else{
            message.channel.send("Irid ikun hemm loghba l-ewwel biex tibdija bocc")
        }
    }

    if (checkPrefix(message.content.toLowerCase(),`${auth.prefix}help`)) {
        message.channel.send(
            "\nJekk int Cole ma nixtieq nispjega imma fuck it: \n\n" +
            "\t\t- Jekk trid tibda Werewolf, ikteb 'ww.start', pero ha tkun responsabli taghha king. \n" +
            "\t\t- Jekk tixtieq tithol fil-loghba, ikteb 'ww.in'. Tipruvahiex jekk ghad ma hemmx loghba pacc. \n" +
            "\t\t- Jekk tixtieq tara min ha jilghab, u tiggudika, ikteb 'ww.list'. Ha jiehdu ghalihom pero. \n" +
            "\t\t- Jekk int responsabli tal-loghba, tista twaqqaf il-loghba b''ww.stop', pero kulhadd ha jobodok probabilment. \n" +
            "\t\t- Jekk int responsabli tal-loghba u dahlu alinqas 5 min-nies, mela tista tibda il-loghba billi taghmel 'ww.begin'. \n" +

            "K'ma jahdiemx xi haga, wahlu f'Gingru.")
        return ;
    }
    
});