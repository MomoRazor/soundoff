import { config } from 'dotenv'

config()

export const { TOKEN, MONGO_CONNECT_URL, NODE_ENV } = process.env

export const envChecker = () => {
	return TOKEN && MONGO_CONNECT_URL && NODE_ENV
}
