import * as g from "graphql";
import SchemaField, {
    DefaultValueBoolean, DefaultValueFloat,
    DefaultValueID, DefaultValueInt, DefaultValueString,
} from "./../../Generator/SchemaField";
const strField = {
    isScalar: true, name: "Str1", graphQLType: g.GraphQLString,
    isArray: false, isFunction: false, isObject: false,
};
const intField = {
    isScalar: true, name: "Int1", graphQLType: g.GraphQLInt,
    isArray: false, isFunction: false, isObject: false,
};
const floatField = {
    isScalar: true, name: "Float1", graphQLType: g.GraphQLFloat,
    isArray: false, isFunction: false, isObject: false,
};
const booleanField = {
    isScalar: true, name: "Boolean1", graphQLType: g.GraphQLBoolean,
    isArray: false, isFunction: false, isObject: false,
};
const iDField = {
    isScalar: true, name: "Id1", graphQLType: g.GraphQLID,
    isArray: false, isFunction: false, isObject: false,
};
const strSubField = {
    isScalar: true, name: "StrSub1", graphQLType: g.GraphQLString,
    isArray: false, isFunction: false, isObject: false,
};
const funcFloatSubField = {
    isScalar: true, name: "FuncFloatSub1", graphQLType: g.GraphQLFloat,
    isArray: false, isFunction: true, isObject: false,
};
const obj1Type = {
    name: "Obj1",
    fields: [strSubField, funcFloatSubField],
};
const obj2Type = {
    name: "Obj2",
    fields: [strSubField],
};
const obj1 = {
    isObject: true, name: "sub1", type: obj1Type,
    isArray: false, isFunction: false, isScalar: false,
};
const obj2 = {
    isObject: true, name: "sub2", type: obj2Type,
    isArray: true, isFunction: false, isScalar: false,
};

const arr1 = {
    isScalar: true, name: "collectionBoolean1", graphQLType: g.GraphQLBoolean,
    isArray: true, isFunction: false, isObject: false,
};
const Type1 = {
    name: "Q",
    fields: [strField, intField, floatField, booleanField, iDField, obj1, arr1, obj2],
};
describe("SchemaField", () => {
    it("when created, should has getter for all childs", () => {
        const field = new SchemaField(Type1);
        expect(field.Str1).toBe(DefaultValueString);
        expect(field.Int1).toBe(DefaultValueInt);
        expect(field.Float1).toBe(DefaultValueFloat);
        expect(field.Boolean1).toBe(DefaultValueBoolean);
        expect(field.Id1).toBe(DefaultValueID);
        expect(field.collectionBoolean1 instanceof Array).toBeTruthy();
        expect(field.collectionBoolean1[0]).toBe(DefaultValueBoolean);
        expect(field.sub1 instanceof SchemaField).toBeTruthy();
        expect(field.sub1.StrSub1).toBe(DefaultValueString);
        expect(field.sub1.FuncFloatSub1 instanceof Function).toBeTruthy();
        expect(field.sub1.FuncFloatSub1({ test: "fix" })).toBe(DefaultValueFloat);
        expect(field.sub1.FuncFloatSub1({ test2: "fix2" })).toBe(DefaultValueFloat);
        expect(field.sub2 instanceof Array).toBeTruthy();
        expect(field.sub2[0] instanceof SchemaField).toBeTruthy();
        expect(field.sub2[0].StrSub1).toBe(DefaultValueString);
        expect(field.getChilds()).toMatchSnapshot();
    });
    it("fill", () => {
        const data = {
            Str1: "str1",
            Int1: 15,
            Float1: 1.56,
            Boolean1: false,
            Id1: "Hi",
            collectionBoolean1: [false, true],
            sub1: {
                StrSub1: "str2",
                FuncFloatSub1: 7.9,
                f1: 5.8,
            },
            sub2: [{
                StrSub1: "StrSub2",
            }],
        };
        const field = new SchemaField(Type1, true, data);
        const getValue = () => {
            return {
                str1: "Teststr" + field.Str1,
                int1: 1000 + field.Int1,
                float: 500.56 + field.Float1,
                boolean1: field.Boolean1 ? "kis" : "myau",
                id1: "Hm" + field.Id1,
                collectionBoolean1: field.collectionBoolean1.map((v: boolean) => v ? "true" : "false"),
                sub1: {
                    StrSub1: field.sub1.StrSub1 + "tests",
                    FuncFloatSub1: field.sub1.FuncFloatSub1({ test: "v1" }) + 876.56,
                    FuncFloatSub2: field.sub1.FuncFloatSub1({ test2: "v2" }) + 111.12,
                },
                sub2: [{
                    StrSub1: field.sub2[0].StrSub1 + "Sub2",
                }],
            };
        };
        // First time for create accessors
        expect(getValue()).toMatchSnapshot();
    });
});
