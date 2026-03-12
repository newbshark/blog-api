/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable("posts", {
    id: "id",
    title: { type: "varchar(255)", notNull: true },
    content: { type: "text" },
    user_id: {
      type: "integer",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    blog_id: {
      type: "integer",
      notNull: true,
      references: '"blogs"',
      onDelete: "CASCADE",
    },
  });

  pgm.createIndex("posts", "user_id");
  pgm.createIndex("posts", "blog_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable("posts");
};
