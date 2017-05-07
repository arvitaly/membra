"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SchemaObj_1 = require("./SchemaObj");
class Generator {
    constructor(schema) {
        this.schema = schema;
    }
    generate(executor, vars) {
        const schemaObj = this.createSchemaObj();
        executor(schemaObj, vars);
        return {
            schemaObj,
            executor,
        };
    }
    getQuery(execution) {
        return execution.schemaObj.getQuery();
    }
    createSchemaObj() {
        return new SchemaObj_1.default(this.schema);
    }
}
exports.Generator = Generator;
exports.default = Generator;
