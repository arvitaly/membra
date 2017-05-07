import { GraphQLObjectType, GraphQLOutputType, GraphQLScalarType, GraphQLSchema } from "graphql";
import { Mapper } from "graphql-schema-map";
import pad from "./../util/leftpad";
import SchemaField from "./SchemaField";
export default class SchemaObj {
    public query: SchemaField;
    public mutation: SchemaField;
    public queryType: "query" | "mutation" = "query";
    public types: { [index: string]: ISchemaObjectConfig } = {};
    protected currentPrefix = 0;
    constructor(protected schema: GraphQLSchema) {
        const mapper = new Mapper(schema, {});
        mapper.setMapGraphQLObjectType((config) => {
            const fields = config.fields.map((f) => {
                const isObject = f.type.realType instanceof GraphQLObjectType;
                return {
                    name: f.name,
                    graphQLType: f.type.realType,
                    type: isObject ? this.types[f.type.realType.name] : undefined,
                    isArray: f.type.isArray,
                    isFunction: f.args.args.length > 0,
                    isObject,
                    isScalar: f.type.realType instanceof GraphQLScalarType,
                };
            });
            this.types[config.type.name] = {
                name: config.type.name,
                fields,
            };
        });
        mapper.map();
        const query = new SchemaField(this.types.Query);
        const mutation = new SchemaField(this.types.Mutation);
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
    public getQuery(): string {
        if (this.queryType === "query") {
            return "query {\n" + this.getQueryForObject(this.query) + "\n}";
        } else {
            return "mutation {\n" + this.getQueryForObject(this.mutation) + "\n}";
        }
    }
    public getQueryForObject(obj: SchemaField, level = 2) {
        const res: string[] = [];
        obj.map((child) => {
            const str = (child.name !== child.realName ? child.name + ":" + child.realName : child.name) +
                (child.field.isFunction ?
                    "(" + (child.args ? this.prepareParams(child.args) : "") + ")" : "") +
                (child.obj ? " {\n" +
                    this.getQueryForObject(child.obj, level + 1).join("\n") + "\n" + pad("}", level) : "");
            res.push(pad(str, level));
        });
        return res;
    }
    public fillData(data: any, executor: (schemaObj: any, vars?: any) => any, vars?: any): any {
        if (this.queryType === "query") {
            return executor({
                query: new SchemaField(this.types.Query, true, data),
            }, vars);
        } else {
            return executor({
                mutation: new SchemaField(this.types.Mutation, true, data),
            }, vars);
        }
    }
    protected prepareParams(params: any): any {
        return Object.keys(params).map((key) => {
            if (params[key] !== null && typeof (params[key]) === "object") {
                if (Array.isArray(params[key])) {
                    return key + ": [" + (params[key] as any[]).map((value) => {
                        if (value !== null && typeof (value) === "object") {
                            return "{" + this.prepareParams(value) + "}";
                        } else {
                            return JSON.stringify(value);
                        }
                    }).join(",") + "]";
                }
                if (typeof (params[key].toJSON) === "function") {
                    return key + ": \"" + params[key].toJSON() + "\"";
                }
                return key + ": {" + this.prepareParams(params[key]) + "}";
            } else {
                return key + ": " + JSON.stringify(params[key]);
            }
        }).join(", ");
    }
}
export interface ISchemaObjectConfig {
    name: string;
    fields: ISchemaObjectConfigField[];
}

export interface ISchemaObjectConfigField {
    name: string;
    isArray: boolean;
    isFunction: boolean;
    isObject: boolean;
    isScalar: boolean;
    type?: ISchemaObjectConfig;
    graphQLType?: GraphQLOutputType;
}
