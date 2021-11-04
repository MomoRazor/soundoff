import { MongoClient } from 'mongodb'
import { MONGO_CONNECT_URL } from './enviornment'

export const mongoClient = new MongoClient(MONGO_CONNECT_URL as string)

export const connectToCluster = async (client: MongoClient) => {
	await client.connect()
	console.log('Connected successfully to server')
	return client
}

export const connectToCollection = async (
	client: MongoClient,
	databaseName: string,
	collectionName: string
) => {
	const database = client.db(databaseName)
	return database.collection(collectionName)
}
