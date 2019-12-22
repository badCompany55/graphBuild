const {ApolloServer, gql} = require('apollo-server')
const resolvers = require('./resolvers.js')
const typeDefs = require('./schema.js')
const Port = process.env.PORT || 8000
const usersModel = require('./data/models/usersModel.js')
const messagesModel = require('./data/models/messagesModel.js')
const bcryptHashFunctions = require('./helpers/auth.js')

const server = new ApolloServer({typeDefs, resolvers, context: ({req, connection}) => {
	if (connection) {
			const tokenWithBearer = connection.context.Authorization || ""
			const token = tokenWithBearer.split(" ")[1]
			const user = bcryptHashFunctions.getUser(token)
			if (user) {
				console.log(user)
				return {
					user,
					usersDb: usersModel,
					messagesDb: messagesModel,
					bcrypt: bcryptHashFunctions,
				}
			} else {
				throw new Error("Invalid Login")
			}
	} else {
		const tokenWithBearer = req.headers.authorization || ""
		const token = tokenWithBearer.split(" ")[1]
		const user = bcryptHashFunctions.getUser(token)

		return {
			user,
			usersDb: usersModel,
			messagesDb: messagesModel,
			bcrypt: bcryptHashFunctions,
		}
	}

}})

server.listen(Port, () => {
	console.log(`Server running on Port: ${Port}`)
})
