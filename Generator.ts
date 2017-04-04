import {
    FieldNode, GraphQLID, GraphQLNonNull, GraphQLObjectType,
    GraphQLScalarType, GraphQLSchema,
} from "graphql";
import * as g from "graphql";
import { IGraphQLObjectTypeFieldConfig, Mapper } from "graphql-schema-map";
export interface IExecution<T> {
    schemaObj: SchemaObj;
    executor: (schemaObj: any) => any;
}
export class Generator<S>{
    constructor(protected schema: GraphQLSchema) { }
    public generate<T>(executor: (schemaObj: S) => T): IExecution<T> {
        const schemaObj = this.createSchemaObj();
        executor(schemaObj as any);
        return {
            schemaObj,
            executor,
        };
    }
    public getQuery(execution: IExecution<any>): string {
        return execution.schemaObj.getQuery();
    }
    protected createSchemaObj() {
        return new SchemaObj(this.schema);
    }
}
export default Generator;
interface ISchemaObjectConfig {
    name: string;
    fields: Array<{
        name: string;
        type: any;
        isArray: boolean;
        isFunction: boolean;
    }>;
}
// tslint:disable:max-classes-per-file
export class SchemaObj {
    public query: any;
    public types: { [index: string]: ISchemaObjectConfig } = {};
    protected paths: {
        [index: string]: any,
    } = {};
    constructor(protected schema: GraphQLSchema) {
        const mapper = new Mapper(schema, {});
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

    public addPath(path: string, params?: any) {
        this.paths[path] = params;
    }
    public getQuery(): string {
        return this.getQueryForObject("query", "query", this.types.Query);
    }
    public fillData(data: any, executor: (schemaObj: any) => any): any {
        const rootQuery = new SchemaType("query", this.types.Query, this, data);
        return executor({
            query: rootQuery,
        });
    }
    public getQueryForObject(
        parentName: string, name: string, obj: ISchemaObjectConfig,
        level = 1): string {
        const isFunction = typeof (this.paths[parentName]) !== "undefined" && this.paths[parentName] !== true;
        let q = pad(name, level) + (isFunction ? "(" + (
            this.paths[parentName] ? this.prepareParams(this.paths[parentName]) : ""
        ) + ")" : "") + "{\n";
        const qs: string[] = [];
        obj.fields.map((f) => {
            const path = (parentName ? parentName + "." : "") + f.name;
            if (typeof (this.paths[path]) === "undefined") {
                return;
            }
            if (f.type instanceof GraphQLObjectType) {
                qs.push(this.getQueryForObject(parentName + "." + f.name, f.name,
                    this.types[f.type.name], level + 1));
            } else {
                qs.push(pad(f.name, level + 1));
            }
        });
        q += qs.join(",\n") + "\n" + pad("}", level);
        return q;
    }
    protected prepareParams(params: any): any {
        return Object.keys(params).map((key) => {
            if (typeof (params[key]) === "object") {
                return key + ": " + this.prepareParams(params[key]);
            }
            return key + ": " + JSON.stringify(params[key]);
        }).join(", ");
    }
}
function pad(str: string, n: number, symbol: string = "    ") {
    return new Array(n).join(symbol) + str;
}
class SchemaType {
    protected name: string;
    constructor(
        protected parentName: string, protected config: ISchemaObjectConfig, protected schemaObj: SchemaObj,
        protected data?: any) {
        this.name = config.name;
        config.fields.map((f) => {
            let value: any;
            if (f.type instanceof GraphQLObjectType) {
                if (this.data) {
                    if (f.isArray) {
                        value = data[f.name].map((v: any) =>
                            new SchemaType(this.parentName + "." + f.name, schemaObj.types[f.type.name], schemaObj,
                                v));
                    } else {
                        value = new SchemaType(this.parentName + "." + f.name, schemaObj.types[f.type.name], schemaObj,
                            data[f.name]);
                    }
                } else {
                    value = new SchemaType(this.parentName + "." + f.name, schemaObj.types[f.type.name], schemaObj);
                    if (f.isArray) {
                        value = [value];
                    }
                }

            } else if (f.type instanceof GraphQLScalarType) {
                if (data) {
                    value = data[f.name];
                } else {
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
                    return f.isFunction ? (params: any) => {
                        this.schemaObj.addPath(this.parentName + "." + f.name, params ? params : null);
                        return value;
                    } : value;
                },
            });
        });
    }
}
