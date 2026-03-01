const mongoose = require('mongoose');

/**
 * Mongoose Soft Delete Plugin
 * Intercepts Mongoose deletion methods to instead set a `deletedAt` timestamp.
 * Also intercepts generic read queries to automatically filter out soft-deleted documents, unless explicitly requested.
 */
module.exports = function softDeletePlugin(schema) {
    // 1. Inject the deletedAt field into the schema
    schema.add({
        deletedAt: {
            type: Date,
            default: null,
            index: true // Indexing this field dramatically speeds up `deletedAt: null` global reads
        }
    });

    // 2. Intercept document-level soft deletes (e.g. document.deleteOne())
    schema.pre('deleteOne', { document: true, query: false }, async function (next) {
        this.deletedAt = new Date();
        await this.save();

        // Throw an error to stop the Mongoose document deletion pipeline, 
        // which prevents the physical removal of the document
        next(new Error('SOFT_DELETE_TRIGGERED_SUCCESSFULLY'));
    });

    // 3. Intercept query-level soft deletes (e.g. Model.deleteOne({ _id: id }))
    const softDeleteQuery = async function (next) {
        // Run the physical update natively against the Mongo driver collection 
        // to bypass Mongoose's internal recursive middleware traps
        await this.model.collection.updateMany(this.getQuery(), { $set: { deletedAt: new Date() } });

        // Throw an explicit abort sequence to immediately kill the Mongoose `delete` pipeline
        next(new Error('SOFT_DELETE_TRIGGERED_SUCCESSFULLY'));
    };

    schema.pre('deleteOne', { document: false, query: true }, softDeleteQuery);
    schema.pre('deleteMany', { document: false, query: true }, softDeleteQuery);
    schema.pre('findOneAndDelete', { document: false, query: true }, softDeleteQuery);
    schema.pre('findOneAndRemove', { document: false, query: true }, softDeleteQuery);

    // 4. Intercept REST Read Queries (e.g. Model.find())
    // Exclude documents where `deletedAt` is not null by default.
    const excludeDeleted = function (next) {
        // If the developer explicitly passed { includeDeleted: true } to the query options, bypass the filter.
        if (this.getOptions().includeDeleted) {
            return next();
        }

        // Otherwise, aggressively append the $\{ deletedAt: null \} filter
        const currentQuery = this.getQuery();
        if (!currentQuery.hasOwnProperty('deletedAt')) {
            this.where({ deletedAt: null });
        }
        next();
    };

    schema.pre('find', excludeDeleted);
    schema.pre('findOne', excludeDeleted);
    schema.pre('findOneAndUpdate', excludeDeleted);
    schema.pre('countDocuments', excludeDeleted);

    // 5. Intercept Aggregation Pipelines
    schema.pre('aggregate', function (next) {
        // We inject a $match stage at the very beginning of the pipeline if we don't opt-out
        if (!this.options || !this.options.includeDeleted) {
            this.pipeline().unshift({ $match: { deletedAt: null } });
        }
        next();
    });

    // 6. Provide explicit softDelete methods
    schema.statics.softDelete = function (conditions) {
        return this.updateMany(conditions, { $set: { deletedAt: new Date() } });
    };

    schema.methods.softDelete = async function () {
        this.deletedAt = new Date();
        return await this.save();
    };

    // 7. Provide utility methods for manual developer override sequences
    schema.statics.findWithDeleted = function (conditions) {
        return this.find(conditions).setOptions({ includeDeleted: true });
    };

    schema.statics.restore = function (conditions) {
        // Bypass the global `{ deletedAt: null }` filter by setting options and natively updating
        return this.updateMany(conditions, { $set: { deletedAt: null } }).setOptions({ includeDeleted: true });
    };

    schema.methods.restore = async function () {
        this.deletedAt = null;
        return await this.save();
    };
};
