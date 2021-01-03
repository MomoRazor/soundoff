import { createRequire } from "module";
const require = createRequire(import.meta.url);

export const auth = require("./auth.json");

export const login = (bot) => {
    bot.login(auth.token)
}

export const setInitialListeners = (bot) => {
    bot.once('ready', function (evt) {
        console.log('Connected')
    })
    
    bot.once('reconnecting', () => {
        console.log('Reconnecting!')
    })
    
    bot.once('disconnect', () => {
        console.log('Disconnect!')
    })
}

export const listenToMessage = (bot, callback, helpCall=true, byeCall=true, ignoreBots=true) => {
    bot.on('message', async message => { 
        if(message.author.bot && ignoreBots) return

        if(helpCall && checkPrefix(message.content.toLowerCase(),`${auth.prefix}help`)) {
            message.channel.send(
                "\nIsma naqa kemm jien semplici: \n\n" +
                "\t\t- Jekk trid idoqq xi haga, kemm itella .mp3 jew .wav. Jekk trid idoqq xi haga ohra, ghid lil John. \n" +
                "\t\t- Jekk tibda idoqq u issa qed tisthi kemm tikteb '"+auth.prefix+"skip'... pussy. \n" +
                "\t\t- Jekk trid twaqqaf kollox ghax ghandek problemi ta' commitment '"+auth.prefix+"stop'. \n" +
                "\t\t- Jekk trid twaqqaf ghal ftit biss ghax il-commitment problems tieghek naqa izghar, '"+auth.prefix+"pause'. \n" +
                "\t\t- Jekk trid darietlek d-duda reget, '"+auth.prefix+"resume'. \n" +
                "\t\t- Jekk trid ticcekja x'hemm fil-queue '"+auth.prefix+"queue'. \n" +
                "\t\t- Jekk tixtieq tara x'niftakar '"+auth.prefix+"inventory'. \n" +
                "\t\t- Jekk tixtieq tibdel l-isem ta' xi haga li niftakar, jew doqqa u bidel l-isem dak il-hin '"+auth.prefix+"rename {newname}' \n" +
                "\t\t  Jew inkella ghidli liema wahda tixtieq tibdel '"+auth.prefix+"rename {newname} {oldname}' \n" +
                "\t\t- Biex idoqq xi haga li niftakar '"+auth.prefix+"play {name}'. \n" +
                "\t\t- Jekk trid tfittex certu tip ta' diska '"+auth.prefix+"search {query}. \n" + 
                "\t\t  Jekk ha jaqalek il-pipi u ghandek bzonn tisma l-muzika malajr, kemm titfa 'play' wara indoqqlok l-ewwel wahda ez. '"+auth.prefix+"search {query} play'. \n\n" +
                "K'ma jahdiemx xi haga, wahlu f'John.")
            return 
        }

        if (byeCall && checkPrefix(message.content.toLowerCase(),`${auth.prefix}bye`)) {
            message.channel.send(getLines("bye"))
            bot.destroy()
            return
        }

        if(!callback(message)){        
            message.channel.send(getLines("404"))
        }
    })
}

export const checkPrefix = (content, prefix=null) => {
    if(prefix === null){
        return content.substring(0,auth.prefix.length) === auth.prefix
    } else {
        return content.substring(0,prefix.length) === prefix
    }
}