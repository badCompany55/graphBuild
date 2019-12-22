require('dotenv').config()
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET
const {PubSub} = require('apollo-server')
const pubsub = new PubSub()

const MESSAGEADDED = 'MESSAGEADDED'
const MESSAGEDELETED = 'MESSAGEDELETED' 

const resolvers = {
	Query: {
		users: async (_, __, ctx) => {
			if (!ctx.user) {
				throw new Error("Not Authenticated")
			}
			try {
				const loggedInUser = await ctx.usersDb.getSingleUserById(ctx.user.id)
				return loggedInUser.conversation.map(async x => {
					const user = await ctx.usersDb.getSingleUserById(x.id)
					return user.username
				})
			} catch(err) {
				console.log(err)
			}
		},
		user: async (_, __, ctx) => {
			if (!ctx.user) {
				throw new Error("Not Authenticated")
			}
			try {
				let theUser = await ctx.usersDb.getSingleUserById(ctx.user.id)
				const conversations = await ctx.messagesDb.getAllUserMessages(theUser.id)

				const awaitFunc = async(check, pushTo) => {
					const user = await ctx.usersDb.getSingleUserById(Number(check))
					const returnObj = JSON.stringify({id: user.id, username: user.username})
					pushTo.add(returnObj)
				}

				const asyncForEach =  (async (arr, call) => {
					for (let i = 0; i < arr.length; i++) {
						await call(arr[i], i, arr)
					} 
				})

				const finalAsync = async () => {
					const conversationIds = new Set()
					await asyncForEach(conversations, async (x) => {
						if (x.fromId !== theUser.id) {	
							const test = await awaitFunc(x.fromId, conversationIds)
						}
						if (x.toId !== theUser.id) {
							const test = await awaitFunc(x.toId, conversationIds)
						}
					})
					return conversationIds
				}

				const final = finalAsync().then(res => res)
				final.then(res => res)
				theUser.conversations = final

				return theUser
			} catch (err) {console.log(err)}
		},
		conversation: async(_, {input}, ctx) => {
			if (!ctx.user) {
				throw new Error("Not Authenticated")
			}
			try {
				const messages = await ctx.messagesDb.getUserMessages(ctx.user.id, input.toId)
				return messages
			} catch(err){console.log(err)}
		},
	},

	Subscription: {
		currentConversation: {
			subscribe: () => {
				return(
					pubsub.asyncIterator([MESSAGEADDED])
				)
			}
		}
	},

	Mutation: {
		register: async(_, {input}, ctx) => {
			const hashedPassword = await ctx.bcrypt.createHash(input.password, 10)
			const newUserObject = {username: input.username, password: hashedPassword}
			const newUser = await ctx.usersDb.addUser(newUserObject)
			return newUser
		},

		login: async(_, {input}, ctx) => {
			try {
				const user = await ctx.usersDb.getSingleUser(input.username)

				if (!user) {
					throw new Error("Invalid Login")
				}

				const passMatch = await ctx.bcrypt.loginCheck(input.password, user.password)

				if (!passMatch) {
					throw new Error("Invalid Login")
				}
				const conversations = await ctx.messagesDb.getAllUserMessages(user.id)

				const awaitFunc = async(check, pushTo) => {
					const user = await ctx.usersDb.getSingleUserById(Number(check))
					const returnObj = JSON.stringify({id: user.id, username: user.username})
					pushTo.add(returnObj)
				}

				const asyncForEach =  (async (arr, call) => {
					for (let i = 0; i < arr.length; i++) {
						await call(arr[i], i, arr)
					} 
				})

				const finalAsync = async () => {
					const conversationIds = new Set()
					await asyncForEach(conversations, async (x) => {
						if (x.fromId !== user.id) {	
							const test = await awaitFunc(x.fromId, conversationIds)
						}
						if (x.toId !== user.id) {
							const test = await awaitFunc(x.toId, conversationIds)
						}
					})
					return conversationIds
				}

				const final = finalAsync().then(res => res)
				final.then(res => res)
				user.conversations = final

				const token = jwt.sign(
				{
					id: user.id,
					username: user.username,
					conversations: user.conversations
				},
					SECRET,
					{
						expiresIn: '30d'
					}
				) 

				return {token, user,}
			} catch(err){console.log(err)}
		},

		newMessage: async (_,{input}, ctx ) => {
			try {
				const newMessage = await ctx.messagesDb.postUserMessage(ctx.user.id, input.toId, input.message)
				const messages = await ctx.messagesDb.getUserMessages(ctx.user.id, input.toId)
				pubsub.publish(MESSAGEADDED, {currentConversation: messages})
				return messages
			} catch(err){console.log(err)}
		},

		deleteMessages: async (_, {input}, ctx) => {
			if (!ctx.user) {
				throw new Error("Not Authenticated")
			}
			try {
				const deleteable = ctx.messagesDb.getAllUserMessages(ctx.user.id).map(x => {
					if (input.ids.includes(x.id)) {
						return x.id
					} else {
						throw new Error(`Message ${x.id} doesn't belong to you. Deletion not accepted.`)
					}
				}) 
				const returned = await ctx.messagesDb.deleteUserMessages(deleteable)
				const object = returned.map((x, i) => {
					let deleted
					x[input.ids[i]] === 0 ? deleted = false : deleted = true 
					const returnObject = {
						id: input.ids[i],
						deleted
					}
					return returnObject
				})
				return object
			} catch(err){console.log(err)}
		},
	},
}

module.exports = resolvers
