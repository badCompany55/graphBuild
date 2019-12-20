const db = require('../knexConfig.js')

const getUsers = async () => {
	return await db("users")
}

const getSingleUser = async (username) => {
	return await db("users")
		.where("username", username)
		.first()
}

const getSingleUserById = (id) => {
	return db("users")
		.where("id", id)
		.first()
}

const addUser = async	(user) => {
	const newUser = {
		username: user.username,
		password: user.password,
	}

	const anotherUser = await db("users").insert(newUser)
	const users = await getUsers()
	return users[users.length - 1]

}

module.exports = {
	getUsers,
	getSingleUser,
	getSingleUserById,
	addUser,
}
