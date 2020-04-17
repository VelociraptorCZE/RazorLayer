const mysql = require("mysql");

module.exports = {
    getWhereQuery: ({ columnName, value, operator = "=" }) => mysql.escapeId(columnName) + operator + mysql.escape(value),
    handleOrderBySorting: (orderByClauses, isOrderByRand) => {
        let sql = "";
        const isOrderBySorting = orderByClauses.length;

        if (isOrderBySorting) {
            const orderBy = orderByClauses.map(({ columnName, filter }) => `${mysql.escapeId(columnName)} ${filter}`);
            sql += ` order by ${orderBy.join(", ")}`;
        }

        if (isOrderByRand) {
            if (!isOrderBySorting) {
                sql += " order by RAND()";
            } else {
                console.warn("You have already defined order by clauses previously, order by RAND() will be ignored");
            }
        }

        return sql;
    }
};