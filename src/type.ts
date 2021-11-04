import { Message, MessageAttachment, VoiceChannel } from 'discord.js'

export type Sound = {
	_id?: string
	name: string
	url: string
}

export interface QueuedSong extends Sound {
	attachment: MessageAttachment
	message: Message
	voiceChannel: VoiceChannel
}

export enum Language {
	EN = 'EN',
	MT = 'MT',
}

export type LanguageList = {
	[key in Language]: Phrases
}

export enum PhraseList {
	noChannel = 'noChannel',
	next = 'next',
	bye = 'bye',
	hi = 'hi',
	notFound = 'notFound',
	reconnecting = 'Reconnecting',
	instruction = 'Instruction',
	permissions = 'permissions',
}

export interface LanguageConfig extends LanguageList {
	selected: Language
}

export type Phrases = {
	[key in PhraseList]: string
}
