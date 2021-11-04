import {
	GuildMember,
	Message,
	MessageAttachment,
	User,
	VoiceChannel,
} from 'discord.js'
import { getLine } from './lang'
import { PhraseList, QueuedSong, Sound } from './type'

export let queue: QueuedSong[] = []

export const addToQueue = (
	sound: Sound,
	attachment: MessageAttachment,
	message: Message,
	voiceChannel: VoiceChannel
) => {
	queue.push({
		...sound,
		attachment,
		message,
		voiceChannel,
	})
}

export const clearQueue = () => {
	queue = []
}

export const removeFromQueue = (index?: number) => {
	if (!index) {
		queue.pop()
	} else {
		queue.splice(index, 1)
	}
}

export const playQueue = (index?: number) => {
	if (!index) {
	}
}

export const play = (queue: QueuedSong) => {
	const permissions = queue.voiceChannel.permissionsFor(
		queue.message.client.user as User
	)
	if (
		!permissions ||
		!permissions.has('CONNECT') ||
		!permissions.has('SPEAK')
	) {
		queue.message.channel.send(getLine(PhraseList.permissions))
		return
	}

	queue.voiceChannel
		.join()
		.then((connection) => {
			dispatcher = connection.play(attachment.proxyURL)
			status = true
			message.channel
				.send('Now Playing:' + attachment.name)
				.then(() => {
					dispatcher.on('finish', (end) => {
						if (queue.length > 1) {
							queue.splice(0, 1)
							message.channel
								.send('Next up:' + queue[0].attachment.name)
								.then(() => {
									playURL(
										queue[0].attachment,
										queue[0].message,
										queue[0].voiceChannel
									)
								})
						} else {
							dispatcher.destroy()
							voiceChannel.leave()
							queue.splice(0, 1)
							message.channel.send('Done!')
						}
					})
				})
				.catch((error) => {
					console.log(error)
					message.channel.send(
						'Error encountered, please contact me because I clearly suck.'
					)
					voiceChannel.leave()
				})
		})
		.catch((err) => {
			console.log(err)
			message.channel.send(
				'Error encountered, please contact me because I clearly suck.'
			)
			voiceChannel.leave()
		})
}
