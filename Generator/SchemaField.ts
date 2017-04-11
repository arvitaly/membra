import { GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInt, GraphQLString } from "graphql";
import { ISchemaObjectConfig, ISchemaObjectConfigField } from "./SchemaObj";
export const DefaultValueString = " ";
export const DefaultValueInt = 1;
export const DefaultValueFloat = 1.1;
export const DefaultValueBoolean = true;
export const DefaultValueID = "ID";

export default class SchemaField {
    [k: string]: any;
    protected childs: { [index: string]: ISchemaFieldChild[] } = {};
    protected currentAlias = 1;
    constructor(protected config: ISchemaObjectConfig, protected isForFill = false, protected data?: any) {
        // Create and save getter for all fields
        config.fields.map((field) => {
            Object.defineProperty(this, field.name, {
                get: () => {
                    return this.getValue(field);
                },
            });
        });
    }
    public map(f: (child: ISchemaFieldChild) => any) {
        return Object.keys(this.childs).map((childName) => this.childs[childName].map(f));
    }
    public getChilds() {
        return this.childs;
    }
    protected getValue(field: ISchemaObjectConfigField): any {
        if (field.isFunction) {
            return (params: any) => {
                const child = this.getChild(field, params);
                return child.value;
            };
        }
        const child = this.getChild(field);
        return child.value;
    }
    protected generateAlias() {
        return "f" + this.currentAlias++;
    }
    protected getChild(field: ISchemaObjectConfigField, args?: any): ISchemaFieldChild {
        if (!this.childs[field.name]) {
            this.childs[field.name] = [this.createChild(field.name, field.name, field, args)];
            return this.childs[field.name][0];
        } else {
            const existingChild = this.childs[field.name].find((child) =>
                JSON.stringify(child.args) === JSON.stringify(args));
            if (existingChild) {
                return existingChild;
            } else {
                const newChild = this.createChild(this.generateAlias(), field.name, field, args);
                this.childs[field.name].push(newChild);
                return newChild;
            }
        }
    }
    protected createChild(
        name: string, realName: string,
        field: ISchemaObjectConfigField, args?: any): ISchemaFieldChild {
        let value: any;
        let obj: SchemaField | undefined;
        if (field.isObject && field.type) {
            if (field.isArray && this.isForFill) {
                value = this.data[name].map((v: any) => {
                    return field.type ? new SchemaField(field.type, true, v) : undefined;
                });
            } else {
                obj = new SchemaField(field.type, this.isForFill, this.isForFill ? this.data[name] : undefined);
                value = obj;
            }
        } else if (field.isScalar) {
            if (this.isForFill) {
                value = this.data[name];
            } else {
                switch (field.graphQLType) {
                    case GraphQLString:
                        value = DefaultValueString;
                        break;
                    case GraphQLInt:
                        value = DefaultValueInt;
                        break;
                    case GraphQLFloat:
                        value = DefaultValueFloat;
                        break;
                    case GraphQLBoolean:
                        value = DefaultValueBoolean;
                        break;
                    case GraphQLID:
                        value = DefaultValueID;
                        break;
                    default:
                }
            }
        }
        if (field.isArray && !this.isForFill) {
            value = [value];
        }
        return {
            name,
            realName,
            field,
            value,
            args,
            obj,
        };
    }
}
export interface ISchemaFieldChild {
    name: string;
    realName: string;
    field: ISchemaObjectConfigField;
    obj?: SchemaField;
    value: any;
    args?: any;
}
