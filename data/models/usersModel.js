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

const addUser = (user) => {
	const newUser = {
		username: user.username,
		password: user.password,
	}

	return db("users").insert(newUser)
}

module.exports = {
	getUsers,
	getSingleUser,
	getSingleUserById,
	addUser,
}
