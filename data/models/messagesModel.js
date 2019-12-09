const db = require('../knexConfig.js')

const getMessages = () => {
	return db("messages")
}

const getUserMessages = (fromId, toId) => {
	return db('messages')
		.where("fromId", fromId)
		.andWhere("toId", toId)
		.orWhere("toId", fromId)
		.andWhere("fromId", toId)
}

const postUserMessage = async (fromId, toId, message) => {
	const postMessage = {
		fromId: Number(fromId),
		toId: Number(toId),
		message,
	}
	const postTheMessage = await db("messages").insert(postMessage)
	const getLastMessage = await getUserMessages(fromId, toId)
	return getLastMessage[(getLastMessage.length - 1)]
}

const deleteUserMessages = (arrIds) => {
		const deleted = arrIds.map( async x => {
			const key = x
			const del = await db("messages")
				.where("id", Number(x))
				.del()
			let returnVal = {}
			returnVal[key] = del
			return returnVal
		})
	return Promise.all(deleted).then(res => res)
}

module.exports = {
	getMessages,
	getUserMessages,
	postUserMessage,
	deleteUserMessages,
}
