const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET

const createHash = async (pass, salt) => {
	try {
		const newHash = await new Promise((res, rej) => {
			bcrypt.hash(pass, salt, ((err, hash) => {
				if (err) rej(err)
				res(hash)
			}))
		})
		return newHash
	} catch(err) {
		console.log(err)
	}
}

const loginCheck = async (pass, userPass) => {
	try {
		const check = await new Promise((res, rej) => {
			bcrypt.compare(pass, userPass, ((err, pass) => {
				if (err) rej(err)
				res(pass)
			}))
		})
		return check
	} catch(err) {
		console.log(err)
	}
}

const getUser = token => {
	try {
		if (token) {
			return jwt.verify(token, SECRET)
		}
		return null
	} catch(err) {
		console.log(err)
		return null
	}
}

module.exports = {
	createHash,
	loginCheck,
	getUser,
}
