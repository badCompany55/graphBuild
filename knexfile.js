// Update with your config settings.
require("dotenv").config()

module.exports = {

  development: {
    client: 'pg',
		connection: process.env.DATABASE_URL,
		ssl: true,
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			directory: './data/migrations/',
		},
		seeds: {
			directory: './data/seeds/'
		},
		useNullAsDefault: true,

  },

  production: {
    client: 'pg',
		connection: process.env.DATABASE_URL,
		ssl: true,
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			directory: './data/migrations/',
		},
		seeds: {
			directory: './data/seeds/'
		},
		useNullAsDefault: true,
  }

};

