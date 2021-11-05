import { prefix } from './auth'
import { Language, LanguageConfig, PhraseList } from './type'

export let languageConfig: LanguageConfig = {
	selected: Language.EN,
	EN: {
		Instruction: `\nThese are all my commands: \n\n
                \t\t- If you'd like to play something, upload a .mp3 or .wav. \n
                \t\t- If you'd like to stop an ongoing sound, '${prefix} skip'.\n
                \t\t- If you'd like to stop the entire queue, '${prefix} stop'.\n
                \t\t- If you'd like to pause the current sound, '${prefix} pause'.\n
                \t\t- If you'd like to unpause the current sound, '${prefix} resume'.\n
                \t\t- If you'd like to check the current queue '${prefix} queue'.\n
                \t\t- If you'd like to check the list of saved sounds '${prefix} inventory'.\n
                \t\t- If you'd like to rename a sound, while playing the sound write '${prefix} rename {newname}'\n
                \t\t  or add the old name to the end of the command like so '${prefix} rename {newname} {oldname}'\n
                \t\t- To play a saved sound '${prefix} play {name}'.\n
                \t\t- If you'd like to search for saved sounds '${prefix} search {query}'.\n
                \t\t- If you'd like to play the first result of your search '${prefix} search {query} play'.\n\n
            If something fails, cry me a river.`,
		bye: 'Cheerio!',
		hi: 'Hi there!',
		next: 'Next up: ',
		noChannel: 'Please enter a voice channel!',
		notFound: 'Command not found!',
		Reconnecting: "aaaaand I'm back.",
		permissions:
			'I need the permissions to join and speak in your voice channel!',
		nowPlaying: 'Now Playing: ',
		nextPlaying: 'Next: ',
		done: 'Done!',
		nothingSkipping: 'Nothing to skip!',
	},
	MT: {
		Instruction: `\nIsma naqa kemm jien semplici: \n\n
                \t\t- Jekk trid idoqq xi haga, kemm itella .mp3 jew .wav. Jekk trid idoqq xi haga ohra, ghid lil John. \n
                \t\t- Jekk tibda idoqq u issa qed tisthi kemm tikteb '${prefix} skip'... pussy.\n
                \t\t- Jekk trid twaqqaf kollox ghax ghandek problemi ta' commitment '${prefix} stop'.\n
                \t\t- Jekk trid twaqqaf ghal ftit biss ghax il-commitment problems tieghek naqa izghar, '${prefix} pause'.\n
                \t\t- Jekk trid darietlek d-duda reget, '${prefix} resume'.\n
                \t\t- Jekk trid ticcekja x'hemm fil-queue '${prefix} queue'.\n
                \t\t- Jekk tixtieq tara x'niftakar '${prefix} inventory'.\n
                \t\t- Jekk tixtieq tibdel l-isem ta' xi haga li niftakar, jew doqqa u bidel l-isem dak il-hin '${prefix} rename {newname}'\n
                \t\t  Jew inkella ghidli liema wahda tixtieq tibdel '${prefix} rename {newname} {oldname}'\n
                \t\t- Biex idoqq xi haga li niftakar '${prefix} play {name}'.\n
                \t\t- Jekk trid tfittex certu tip ta' diska '${prefix} search {query}'.\n
                \t\t- Jekk ha jaqalek il-pipi u ghandek bzonn tisma l-muzika malajr, kemm titfa 'play' wara indoqqlok l-ewwel wahda ez. '${prefix} search {query} play'.\n\n
            K'ma jahdiemx xi haga, wahlu f'John.`,
		bye: 'Caw Brolo Baggins!',
		hi: 'Wasalt jien!',
		next: 'Issa jmiss: ',
		noChannel: "Hemm bżonn tkun f'voice channel bro.",
		notFound: "Ma sibnijiex din ta'.",
		Reconnecting: 'Ħrabt u ġejt.',
		permissions: 'Ghandek bzonn itini il-permess tal-MEPA xbin!',
		nowPlaying: 'Ha indoqq: ',
		nextPlaying: 'Issa jmiss: ',
		done: 'Bil-lest!',
		nothingSkipping: "Tajba hara, ma hawn xejn x'inwaqaf",
	},
}

export const setSelectedLanguage = (lang: Language) => {
	languageConfig.selected = lang
}

export const getLine = (line: PhraseList) => {
	return languageConfig[languageConfig.selected][line]
}
