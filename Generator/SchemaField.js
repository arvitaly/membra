"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
exports.DefaultValueString = " ";
exports.DefaultValueInt = 1;
exports.DefaultValueFloat = 1.1;
exports.DefaultValueBoolean = true;
exports.DefaultValueID = "ID";
class SchemaField {
    constructor(config, isForFill = false, data) {
        this.config = config;
        this.isForFill = isForFill;
        this.data = data;
        this.childs = {};
        this.currentAlias = 1;
        // Create and save getter for all fields
        config.fields.map((field) => {
            Object.defineProperty(this, field.name, {
                get: () => {
                    return this.getValue(field);
                },
            });
        });
    }
    map(f) {
        return Object.keys(this.childs).map((childName) => this.childs[childName].map(f));
    }
    getChilds() {
        return this.childs;
    }
    getValue(field) {
        if (field.isFunction) {
            return (params) => {
                const child = this.getChild(field, params);
                return child.value;
            };
        }
        const child = this.getChild(field);
        return child.value;
    }
    generateAlias() {
        return "f" + this.currentAlias++;
    }
    getChild(field, args) {
        if (!this.childs[field.name]) {
            this.childs[field.name] = [this.createChild(field.name, field.name, field, args)];
            return this.childs[field.name][0];
        }
        else {
            const existingChild = this.childs[field.name].find((child) => JSON.stringify(child.args) === JSON.stringify(args));
            if (existingChild) {
                return existingChild;
            }
            else {
                const newChild = this.createChild(this.generateAlias(), field.name, field, args);
                this.childs[field.name].push(newChild);
                return newChild;
            }
        }
    }
    createChild(name, realName, field, args) {
        let value;
        let obj;
        if (field.isObject && field.type) {
            if (field.isArray && this.isForFill) {
                value = this.data[name].map((v) => {
                    return field.type ? new SchemaField(field.type, true, v) : undefined;
                });
            }
            else {
                obj = new SchemaField(field.type, this.isForFill, this.isForFill ? this.data[name] : undefined);
                value = obj;
            }
        }
        else if (field.isScalar) {
            if (this.isForFill) {
                value = this.data[name];
            }
            else {
                switch (field.graphQLType) {
                    case graphql_1.GraphQLString:
                        value = exports.DefaultValueString;
                        break;
                    case graphql_1.GraphQLInt:
                        value = exports.DefaultValueInt;
                        break;
                    case graphql_1.GraphQLFloat:
                        value = exports.DefaultValueFloat;
                        break;
                    case graphql_1.GraphQLBoolean:
                        value = exports.DefaultValueBoolean;
                        break;
                    case graphql_1.GraphQLID:
                        value = exports.DefaultValueID;
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
exports.default = SchemaField;
