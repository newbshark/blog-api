/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
    pgm.createTable("users", {
        id: { type: "integer", primaryKey: true, sequenceGenerated: { precedence: 'ALWAYS', } },
        email: { type: "varchar(100)", notNull: true, unique: true },
        name: { type: "varchar(255)", notNull: true, unique: true },
        password: { type: "varchar(1024)", notNull: true },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
    pgm.dropTable("users");
};
