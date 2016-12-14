"use strict";
const graphql_1 = require("graphql");
const graphql_fields_info_1 = require("graphql-fields-info");
class QueryParser {
    constructor(schema) {
        this.schema = schema;
    }
    parse(literals, ...placeholders) {
        const query = literals.join("");
        const fieldsInfo = graphql_fields_info_1.fromQuery(query, this.schema);
        this.addIds(fieldsInfo.getFields());
        const text = "" + fieldsInfo.print();
        const fields = fieldsInfo.getFields();
        let type;
        if (fields[0].fields[0].isNode) {
            type = "node";
        }
        else if (fields[0].fields[0].isConnection) {
            type = "connection";
        }
        else {
            throw new Error("Unknown query type");
        }
        return {
            text,
            fields,
            type,
        };
    }
    addIds(fields) {
        fields.map((field) => {
            if (field.isNode) {
                if (!field.fields.find((f) => f.name === "id")) {
                    const node = {
                        name: { value: "id", kind: "Name" },
                        kind: "Field",
                    };
                    const sel = field.node.selectionSet;
                    if (sel) {
                        sel.selections.push(node);
                    }
                    field.fields.push({
                        args: [],
                        fields: [],
                        isFragment: false,
                        isConnection: false,
                        isNode: false,
                        node,
                        name: "id",
                        type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID),
                    });
                }
            }
            this.addIds(field.fields);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryParser;
