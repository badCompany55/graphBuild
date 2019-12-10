const {ApolloServer, gql} = require('apollo-server')
const resolvers = require('./resolvers.js')
const typeDefs = require('./schema.js')
const Port =  8000
const usersModel = require('./data/models/usersModel.js')
const messagesModel = require('./data/models/messagesModel.js')
const bcryptHashFunctions = require('./helpers/auth.js')

const server = new ApolloServer({typeDefs, resolvers, context: ({req}) => {

	const tokenWithBearer = req.headers.authorization || ""
	const token = tokenWithBearer.split(" ")[1]
	const user = bcryptHashFunctions.getUser(token)

	return {
		user,
		usersDb: usersModel,
		messagesDb: messagesModel,
		bcrypt: bcryptHashFunctions,
	}
}})

server.listen(process.env.PORT || Port, () => {
	console.log(`Server running on Port: ${Port}`)
})
