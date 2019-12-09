const {gql} = require('apollo-server')
const resolvers = require('./resolvers.js')

const typeDefs = gql`
	type User {
		id: ID!
		username: String!
	}

	input UserId {
		id: String!
	}

	input Conversation {
		toId: String!
	}

	input NewMessage {
		toId: String!
		message: String!
	}

	input DeleteMessages {
		ids: [String!]
	}

	input UserLogin {
		username: String!
		password: String!
	}

	type Message {
		id: String!
		fromId: String!
		toId: String!
		message: String!
		createAt: String!
		modifiedAt: String!
	}

	type Ids {
		id: String!
		deleted: Boolean!
	}

	type LoginResponse {
		token: String
		user: User
	}

	type Query {
		users: [User]
		user: User
		conversation(input: Conversation): [Message]
		messages: [Message]
	}

	type Mutation {
		register(input: UserLogin!): User!
		login(input: UserLogin!): LoginResponse!
		newMessage(input: NewMessage!): Message
		deleteMessages(input: DeleteMessages!): [Ids]
	}
`

module.exports = typeDefs
