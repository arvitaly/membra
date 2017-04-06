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
        this.queryType = "query";
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
        const query = new SchemaType("query", this.types.Query, this);
        const mutation = new SchemaType("mutation", this.types.Mutation, this);
        Object.defineProperty(this, "query", {
            get: () => {
                this.queryType = "query";
                return query;
            },
        });
        Object.defineProperty(this, "mutation", {
            get: () => {
                this.queryType = "mutation";
                return mutation;
            },
        });
    }
    addPath(path, params) {
        this.paths[path] = params;
    }
    getQuery() {
        if (this.queryType === "query") {
            return this.getQueryForObject("query", "query", this.types.Query);
        }
        else {
            return this.getQueryForObject("mutation", "mutation", this.types.Mutation);
        }
    }
    fillData(data, executor) {
        if (this.queryType === "query") {
            const rootQuery = new SchemaType("query", this.types.Query, this, true, data);
            return executor({
                query: rootQuery,
            });
        }
        else {
            const rootMutation = new SchemaType("mutation", this.types.Mutation, this, true, data);
            return executor({
                mutation: rootMutation,
            });
        }
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
                if (Array.isArray(params[key])) {
                    return key + ": [" + params[key].map((a) => JSON.stringify(a)).join(",") + "]";
                }
                if (typeof (params[key].toJSON) === "function") {
                    return key + ": \"" + params[key].toJSON() + "\"";
                }
                return key + ": {" + this.prepareParams(params[key]) + "}";
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
    constructor(parentName, config, schemaObj, isForFill = false, data) {
        this.parentName = parentName;
        this.config = config;
        this.schemaObj = schemaObj;
        this.isForFill = isForFill;
        this.data = data;
        this.name = config.name;
        config.fields.map((f) => {
            let value;
            if (f.type instanceof graphql_1.GraphQLObjectType) {
                if (this.isForFill) {
                    if (f.isArray) {
                        value = data && data[f.name] ? data[f.name].map((v) => new SchemaType(this.parentName + "." + f.name, schemaObj.types[f.type.name], schemaObj, true, v)) : [];
                    }
                    else {
                        value = data && data[f.name] ? new SchemaType(this.parentName + "." + f.name, schemaObj.types[f.type.name], schemaObj, true, data[f.name]) : undefined;
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
                if (this.isForFill) {
                    value = data ? data[f.name] : undefined;
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
