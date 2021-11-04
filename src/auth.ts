import { Client, Message } from 'discord.js'
import { TOKEN } from './enviornment'
import { getLine } from './lang'
import { PhraseList } from './type'

export const prefix = 'sf!'

export const login = async (bot: Client) => {
	await bot.login(TOKEN)
}

export const setInitialListeners = (bot: Client) => {
	bot.once('ready', () => {
		console.log(getLine(PhraseList.hi))
	})

	bot.once('reconnecting', () => {
		console.log(PhraseList.reconnecting)
	})

	bot.once('disconnect', () => {
		console.log(PhraseList.bye)
	})
}

export const listenToMessage = (
	bot: Client,
	callback: (message: Message) => Promise<boolean>,
	byeCall = true,
	helpCall = true,
	ignoreBots = true
) => {
	bot.on('message', async (message) => {
		if (message.author.bot && ignoreBots) return
		if (
			helpCall &&
			checkPrefix(message.content.toLowerCase(), `${prefix}help`)
		) {
			message.channel.send(getLine(PhraseList.instruction))
			return
		}

		if (
			byeCall &&
			checkPrefix(message.content.toLowerCase(), `${prefix}bye`)
		) {
			message.channel.send(getLine(PhraseList.bye)).then(() => {
				bot.destroy()
			})
			return
		}

		if (!(await callback(message))) {
			message.channel.send(getLine(PhraseList.notFound))
		}
	})
}

export const checkPrefix = (content: string, passedPrefix?: string) => {
	const string = content.toLowerCase()
	if (!passedPrefix) {
		return string.substring(0, prefix.length) === prefix
	} else {
		return string.substring(0, passedPrefix.length) === prefix
	}
}
