const mysql = require("mysql");
const { getWhereQuery, handleOrderBySorting } = require("./SqlUtils");

class SqlTransaction {
    constructor ({ tableName, config }) {
        this.tableName = mysql.escapeId(tableName);
        this.config = config;
        this.parameters = {
            andWhereClauses: [],
            orWhereClauses: [],
            orderByClauses: []
        };
    }

    getQuery () {
        const {
            isOrderByRand,
            parameters: { whereClause, limit, offset, andWhereClauses, orWhereClauses, orderByClauses }
        } = this;

        let sql = `select * from ${this.tableName}`;

        if (whereClause) {
            sql += ` where ${getWhereQuery(whereClause)}`;
        }

        orWhereClauses.forEach(orWhereClauses => sql += ` or ${getWhereQuery(orWhereClauses)}`);

        andWhereClauses.forEach(andWhereClause => sql += ` and ${getWhereQuery(andWhereClause)}`);

        sql += handleOrderBySorting(orderByClauses, isOrderByRand);

        if (limit) {
            sql += ` limit ${mysql.escape(limit)}`;
        }

        if (offset) {
            sql += ` offset ${mysql.escape(offset)}`;
        }

        return sql;
    }

    executeQuery (fn, data) {
        const connection = mysql.createConnection(this.config);
        connection.connect();

        return new Promise((resolve, reject) => {
            const sqlFn = typeof fn === "string" ? this[fn].bind(this) : fn;

            connection.query(sqlFn(), data, (error, result) => {
                if (error) reject(error);
                connection.end();
                resolve(result);
            });
        }).catch(console.log);
    }

    limit (limit) {
        this.parameters.limit = limit;
        return this;
    }

    offset (offset) {
        this.parameters.offset = offset;
        return this;
    }

    where (columnName, value, operator) {
        this.parameters.whereClause = { columnName, value, operator };
        return this;
    }

    andWhere (columnName, value, operator) {
        this.parameters.andWhereClauses.push({ columnName, value, operator });
        return this;
    }

    orWhere (columnName, value, operator) {
        this.parameters.orWhereClauses.push({ columnName, value, operator });
        return this;
    }

    orderBy (columnName, filter) {
        this.parameters.orderByClauses.push({ columnName, filter });
        return this;
    }

    orderByRand() {
        this.isOrderByRand = true;
        return this;
    }

    findAll () {
        return this.executeQuery("getQuery");
    }

    async find (id) {
        this.where("id", id);
        this.limit(1);
        return (await this.findAll())[0];
    }

    insert (entity) {
        return this.executeQuery(() => `insert into ${this.tableName} set ?`, entity);
    }

    update (entity) {
        return this.executeQuery(() => {
            const entityData = Object.entries(entity)
                .filter(([column]) => column !== "id")
                .map(([column, value]) => `${mysql.escapeId(column)}=${mysql.escape(value)}`)
                .join(", ");

            return `update ${this.tableName} set ${entityData} where id=${mysql.escape(entity.id)}`;
        });
    }
}

module.exports = SqlTransaction;