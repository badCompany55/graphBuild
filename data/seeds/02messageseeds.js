const fake = require('faker')
const db = require('../models/usersModel.js')

exports.seed = async function(knex) {
	const randomUser = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1) + min)
	}
	const users = await db.getUsers()
	const array = [...Array(100)]
	const zach = await db.getSingleUser(1)
	const sam = await db.getSingleUser(2)
	const fak = await db.getSingleUser(3)
	const messages = array.map(x => {
		const fromUserId = randomUser(1, users.length)
		let toUserId = randomUser(1, users.length)
		while (fromUserId === toUserId) {
			toUserId = randomUser(1, users.length)
		}
		const message = fake.lorem.sentence()

		return {
			fromId: fromUserId,
			toId: toUserId,
			message
		}
	})

	// console.log(messages)
  // Deletes ALL existing entries
  return knex('messages').del()
    .then(function () {
      // Inserts seed entries
      return knex('messages').insert(messages)
		})
}
			
