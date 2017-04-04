"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const g = require("graphql");
const graphql_schema_map_1 = require("graphql-schema-map");
class Generator {
    constructor(schema) {
        this.schema = schema;
    }
    generate(executor) {
        const schemaObj = this.createSchemaObj();
        executor(schemaObj);
        return {
            schemaObj,
            executor,
        };
    }
    getQuery(execution) {
        return execution.schemaObj.getQuery();
    }
    createSchemaObj() {
        return new SchemaObj(this.schema);
    }
}
exports.Generator = Generator;
exports.default = Generator;
// tslint:disable:max-classes-per-file
class SchemaObj {
    constructor(schema) {
        this.schema = schema;
        this.types = {};
        this.paths = {};
        const mapper = new graphql_schema_map_1.Mapper(schema, {});
        mapper.setMapGraphQLObjectType((config) => {
            const fields = config.fields.map((f) => {
                return {
                    name: f.name,
                    type: f.type.realType,
                    isArray: f.type.isArray,
                    isFunction: f.args.args.length > 0,
                };
            });
            this.types[config.type.name] = {
                name: config.type.name,
                fields,
            };
        });
        mapper.map();
        this.query = new SchemaType("query", this.types.Query, this);
    }
    addPath(path, params) {
        this.paths[path] = params;
    }
    getQuery() {
        return this.getQueryForObject("query", "query", this.types.Query);
    }
    fillData(data, executor) {
        const rootQuery = new SchemaType("query", this.types.Query, this, data);
        return executor({
            query: rootQuery,
        });
    }
    getQueryForObject(parentName, name, obj, level = 1) {
        const isFunction = typeof (this.paths[parentName]) !== "undefined" && this.paths[parentName] !== true;
        let q = pad(name, level) + (isFunction ? "(" + (this.paths[parentName] ? this.prepareParams(this.paths[parentName]) : "") + ")" : "") + "{\n";
        const qs = [];
        obj.fields.map((f) => {
            const path = (parentName ? parentName + "." : "") + f.name;
            if (typeof (this.paths[path]) === "undefined") {
                return;
            }
            if (f.type instanceof graphql_1.GraphQLObjectType) {
                qs.push(this.getQueryForObject(parentName + "." + f.name, f.name, this.types[f.type.name], level + 1));
            }
            else {
                qs.push(pad(f.name, level + 1));
            }
        });
        q += qs.join(",\n") + "\n" + pad("}", level);
        return q;
    }
    prepareParams(params) {
        return Object.keys(params).map((key) => {
            if (typeof (params[key]) === "object") {
                return key + ": " + this.prepareParams(params[key]);
            }
            return key + ": " + JSON.stringify(params[key]);
        }).join(", ");
    }
}
exports.SchemaObj = SchemaObj;
function pad(str, n, symbol = "    ") {
    return new Array(n).join(symbol) + str;
}
class SchemaType {
    constructor(parentName, config, schemaObj, data) {
        this.parentName = parentName;
        this.config = config;
        this.schemaObj = schemaObj;
        this.data = data;
        this.name = config.name;
        config.fields.map((f) => {
            let value;
            if (f.type instanceof graphql_1.GraphQLObjectType) {
                if (this.data) {
                    if (f.isArray) {
                        value = data[f.name].map((v) => new SchemaType(this.parentName + "." + f.name, schemaObj.types[f.type.name], schemaObj, v));
                    }
                    else {
                        value = new SchemaType(this.parentName + "." + f.name, schemaObj.types[f.type.name], schemaObj, data[f.name]);
                    }
                }
                else {
                    value = new SchemaType(this.parentName + "." + f.name, schemaObj.types[f.type.name], schemaObj);
                    if (f.isArray) {
                        value = [value];
                    }
                }
            }
            else if (f.type instanceof graphql_1.GraphQLScalarType) {
                if (data) {
                    value = data[f.name];
                }
                else {
                    switch (f.type) {
                        case g.GraphQLString:
                            value = " ";
                            break;
                        case g.GraphQLInt:
                            value = 1;
                            break;
                        case g.GraphQLFloat:
                            value = 1;
                            break;
                        case g.GraphQLBoolean:
                            value = true;
                            break;
                        case g.GraphQLID:
                            value = "ID";
                            break;
                        default:
                    }
                }
            }
            Object.defineProperty(this, f.name, {
                get: () => {
                    if (!f.isFunction) {
                        this.schemaObj.addPath(this.parentName + "." + f.name, true);
                    }
                    return f.isFunction ? (params) => {
                        this.schemaObj.addPath(this.parentName + "." + f.name, params ? params : null);
                        return value;
                    } : value;
                },
            });
        });
    }
}
