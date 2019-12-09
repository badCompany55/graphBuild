exports.up = function(knex, Promise) {
	return knex.schema.createTable("users", tb => {
		tb.increments()
		tb.string("username", 128)
			.notNullable()
			.unique()
		tb.string("password", 255).notNullable()
	})
};

exports.down = function(knex, Promise) {
	return kenx.schema.dropTableIfExists("users")
};
