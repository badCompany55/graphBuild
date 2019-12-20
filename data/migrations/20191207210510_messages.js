
exports.up = function(knex, Promise) {
	return knex.schema.createTable("messages", tb => {
		tb.increments()
		tb.integer("fromId")
			.unsigned()
			.references("id")
			.inTable("users")
			.onDelete("CASCADE")
			.onUpdate("CASCADE")
		tb.integer("toId")
			.unsigned()
			.references("id")
			.inTable("users")
			.onDelete("CASCADE")
			.onUpdate("CASCADE")
		tb.string("message")
			.notNullable()
		tb.timestamps(true,true)
	})
  
};

exports.down = function(knex) {
	return knex.schema.dropTableIfExists("messages")
};
