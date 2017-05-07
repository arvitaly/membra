"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_schema_map_1 = require("graphql-schema-map");
const leftpad_1 = require("./../util/leftpad");
const SchemaField_1 = require("./SchemaField");
class SchemaObj {
    constructor(schema) {
        this.schema = schema;
        this.queryType = "query";
        this.types = {};
        this.currentPrefix = 0;
        const mapper = new graphql_schema_map_1.Mapper(schema, {});
        mapper.setMapGraphQLObjectType((config) => {
            const fields = config.fields.map((f) => {
                const isObject = f.type.realType instanceof graphql_1.GraphQLObjectType;
                return {
                    name: f.name,
                    graphQLType: f.type.realType,
                    type: isObject ? this.types[f.type.realType.name] : undefined,
                    isArray: f.type.isArray,
                    isFunction: f.args.args.length > 0,
                    isObject,
                    isScalar: f.type.realType instanceof graphql_1.GraphQLScalarType,
                };
            });
            this.types[config.type.name] = {
                name: config.type.name,
                fields,
            };
        });
        mapper.map();
        const query = new SchemaField_1.default(this.types.Query);
        const mutation = new SchemaField_1.default(this.types.Mutation);
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
    getQuery() {
        if (this.queryType === "query") {
            return "query {\n" + this.getQueryForObject(this.query) + "\n}";
        }
        else {
            return "mutation {\n" + this.getQueryForObject(this.mutation) + "\n}";
        }
    }
    getQueryForObject(obj, level = 2) {
        const res = [];
        obj.map((child) => {
            const str = (child.name !== child.realName ? child.name + ":" + child.realName : child.name) +
                (child.field.isFunction ?
                    "(" + (child.args ? this.prepareParams(child.args) : "") + ")" : "") +
                (child.obj ? " {\n" +
                    this.getQueryForObject(child.obj, level + 1).join("\n") + "\n" + leftpad_1.default("}", level) : "");
            res.push(leftpad_1.default(str, level));
        });
        return res;
    }
    fillData(data, executor, vars) {
        if (this.queryType === "query") {
            return executor({
                query: new SchemaField_1.default(this.types.Query, true, data),
            }, vars);
        }
        else {
            return executor({
                mutation: new SchemaField_1.default(this.types.Mutation, true, data),
            }, vars);
        }
    }
    prepareParams(params) {
        return Object.keys(params).map((key) => {
            if (params[key] !== null && typeof (params[key]) === "object") {
                if (Array.isArray(params[key])) {
                    return key + ": [" + params[key].map((value) => {
                        if (value !== null && typeof (value) === "object") {
                            return "{" + this.prepareParams(value) + "}";
                        }
                        else {
                            return JSON.stringify(value);
                        }
                    }).join(",") + "]";
                }
                if (typeof (params[key].toJSON) === "function") {
                    return key + ": \"" + params[key].toJSON() + "\"";
                }
                return key + ": {" + this.prepareParams(params[key]) + "}";
            }
            else {
                return key + ": " + JSON.stringify(params[key]);
            }
        }).join(", ");
    }
}
exports.default = SchemaObj;
