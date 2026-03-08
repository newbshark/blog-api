/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
    pgm.createTable("blogs", {
        id: "id",
        title: { type: "varchar(255)", notNull: true },
        user_id: {
            type: "integer",
            notNull: true,
            references: '"users"',
            onDelete: "CASCADE",
        },
    });

    pgm.createIndex("blogs", "user_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
    pgm.dropTable("blogs");
};
