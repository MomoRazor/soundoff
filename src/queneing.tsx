import {
	AudioPlayerStatus,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
} from '@discordjs/voice'
import { Message, MessageAttachment, User, VoiceChannel } from 'discord.js'
import { getLine } from './lang'
import { PhraseList, QueuedSong, Sound } from './type'

export let queue: QueuedSong[] = []
export const player = createAudioPlayer()

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

export const play = async (queuedSong: QueuedSong) => {
	const permissions = queuedSong.voiceChannel.permissionsFor(
		queuedSong.message.client.user as User
	)

	if (
		!permissions ||
		!permissions.has('CONNECT') ||
		!permissions.has('SPEAK')
	) {
		await queuedSong.message.channel.send(getLine(PhraseList.permissions))
		return
	}

	const connection = joinVoiceChannel({
		channelId: queuedSong.voiceChannel.id,
		guildId: queuedSong.voiceChannel.guild.id,
		adapterCreator: queuedSong.voiceChannel.guild.voiceAdapterCreator,
	})

	connection.subscribe(player)
	const resource = createAudioResource(queuedSong.url)
	player.play(resource)

	await queuedSong.message.channel.send(
		getLine(PhraseList.nowPlaying) + queuedSong.attachment.name
	)

	player.on(AudioPlayerStatus.Idle, async () => {
		removeFromQueue()

		if (queue.length > 0) {
			await queuedSong.message.channel.send(
				getLine(PhraseList.nextPlaying) + queue[0].attachment.name
			)
			play(queue[0])
		} else {
			connection.destroy()
			await queuedSong.message.channel.send(
				getLine(PhraseList.done) + queuedSong.attachment.name
			)
		}
	})
}
