const SqlTransaction = require("./sql/SqlTransaction");

class RazorLayer {
    constructor ({ config }) {
        this.config = config;
    }

    table (tableName) {
        const { config } = this;
        return new SqlTransaction({ tableName, config });
    }
}

module.exports = RazorLayer;