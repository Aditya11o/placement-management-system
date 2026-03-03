const config = require('./src/config/config');

module.exports = {
    mongodb: {
        url: config.get('mongo.uri'),

        // In migrate-mongo 7+, we can specify the databaseName explicitly or let it parse from the URL.
        // If the URL has it, it uses it. But sometimes we need to extract:
        // databaseName: 'placement_management',

        options: {
            useNewUrlParser: true, // removes a deprecation warning when connecting
            useUnifiedTopology: true, // removes a deprecating warning when connecting
        }
    },

    // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
    migrationsDir: "migrations",

    // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
    changelogCollectionName: "changelog",

    // The file extension to create migrations and search for in migration dir 
    migrationFileExtension: ".js",

    // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
    // if the file should be run.  Requires that scripts are coded to be run multiple times.
    useFileHash: false,

    // Don't change this, unless you know what you're doing
    moduleSystem: 'commonjs',
};
