import { FindCursor } from 'mongodb'
import { NODE_ENV } from './enviornment'
import { connectToCluster, connectToCollection, mongoClient } from './mongo'
import { Sound } from './type'

export const dbName = 'store'

export const soundCollection =
	NODE_ENV === 'production' ? 'soundoffsounds' : 'soundoffsounds-staging'

export const getSounds = async (name?: string, query?: string) => {
	const client = await connectToCluster(mongoClient)

	const collection = await connectToCollection(
		client,
		dbName,
		soundCollection
	)

	let soundList: FindCursor<Sound>

	if (name) {
		return collection.findOne<Sound>({ name: name })
	} else if (query) {
		soundList = collection.find<Sound>({ name: `/${query}/` })
	} else {
		soundList = collection.find<Sound>({})
	}

	return soundList.toArray()
}

export const saveSound = async (sound: Sound) => {
	const client = await connectToCluster(mongoClient)

	const collection = await connectToCollection(
		client,
		dbName,
		soundCollection
	)

	return await collection.insertOne({
		name: sound.name,
		url: sound.url,
	})
}
