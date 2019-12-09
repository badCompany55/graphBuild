const db = require("../models/usersModel.js")

exports.seed = function(knex) {
	const users = [
		{
			username: "Zach",
			password: "testing",
		},
		{
			username: "Sam",
			password: "testing",
		},
		{
			username: "Fake",
			password: "testing",
		},
	]
	console.log("users", users)
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert(users)
		})
}
