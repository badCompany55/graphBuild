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
			const loggedInUser = await ctx.usersDb.getSingleUserById(ctx.user.id)
			return loggedInUser.conversation.map(async x => {
				const user = await ctx.usersDb.getSingleUserById(x.id)
				return user.username
			})
		},
		user: async (_, __, ctx) => {
			if (!ctx.user) {
				throw new Error("Not Authenticated")
			}
			let theUser = await ctx.usersDb.getSingleUserById(ctx.user.id)
			const conversations = await ctx.messagesDb.getAllUserMessages(theUser.id)
			const conversationIds = new Set()
			conversations.forEach(x => {
				if (x.fromId !== theUser.id) {
					conversationIds.add(String(x.fromId))
				}
				if (x.toId !== theUser.id) {
					conversationIds.add(String(x.toId))
				}
			})
			theUser.conversations = conversationIds
			return theUser
		},
		conversation: async(_, {input}, ctx) => {
			if (!ctx.user) {
				throw new Error("Not Authenticated")
			}
			 await ctx.messagesDb.getUserMessages(ctx.user.id, input.toId)
		},
	},

	Subscription: {
		messageSent: {
			subscribe: () => {
				pubsub.asyncIterator([MESSAGEADDED])
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
			const user = await ctx.usersDb.getSingleUser(input.username)

			if (!user) {
				throw new Error("Invalid Login")
			}

			const passMatch = await ctx.bcrypt.loginCheck(input.password, user.password)

			if (!passMatch) {
				throw new Error("Invalid Login")
			}
			const conversations = await ctx.messagesDb.getAllUserMessages(user.id)
			const conversationIds = new Set()
			conversations.forEach(x => {
				if (x.fromId !== user.id) {
					conversationIds.add(String(x.fromId))
				}
				if (x.toId !== user.id) {
					conversationIds.add(String(x.toId))
				}
			})
			user.conversations = conversationIds

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
		},

		newMessage: async (_,{input}, ctx ) => {
			const newMessage = await ctx.messagesDb.postUserMessage(ctx.user.id, input.toId, input.message)
			pubsub.publish(MESSAGEADDED, {messageSent: newMessage})
			return newMessage
		},

		deleteMessages: async (_, {input}, ctx) => {
			if (!ctx.user) {
				throw new Error("Not Authenticated")
			}
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
		},
	},
}

module.exports = resolvers
