import * as g from "graphql";
import { connectionArgs, nodeDefinitions } from "graphql-relay";
const nodeInterface = nodeDefinitions(() => {/* */ }, () => {
    return null as any;
});
const createModel1 = new g.GraphQLObjectType({
    name: "CreateModel1Payload",
    fields: {
        test: { type: g.GraphQLString },
    },
});
const setField1 = new g.GraphQLInputObjectType({
    name: "CreateModel1InputSetField1",
    fields: {
        field1: { type: g.GraphQLString },
    },
});
const mutation = new g.GraphQLObjectType({
    name: "Mutation",
    fields: {
        createModel1: {
            args: {
                input: {
                    type: new g.GraphQLInputObjectType({
                        name: "CreateMode1lInput",
                        fields: {
                            setField1: {
                                type: setField1,
                            },
                        },
                    }),
                },
            },
            type: createModel1,
        },
    },
});
const where = new g.GraphQLInputObjectType({
    name: "Where",
    fields: {
        field1: {
            type: g.GraphQLString,
        },
    },
});
const schema = new g.GraphQLSchema({
    mutation,
    query: new g.GraphQLObjectType({
        name: "Query",
        fields: {
            node: nodeInterface.nodeField,
            viewer: {
                type: new g.GraphQLObjectType({
                    name: "Viewer",
                    fields: {
                        id: { type: new g.GraphQLNonNull(g.GraphQLID) },
                        model1: {
                            args: connectionArgs,
                            type: new g.GraphQLObjectType({
                                name: "Model1Connection",
                                fields: {
                                    edges: {
                                        type: new g.GraphQLNonNull(new g.GraphQLList(new g.GraphQLObjectType({
                                            name: "Model1ConnectionEdge",
                                            fields: {
                                                node: {
                                                    type: new g.GraphQLObjectType({
                                                        name: "Model1",
                                                        fields: {
                                                            id: { type: new g.GraphQLNonNull(g.GraphQLID) },
                                                            field1: { type: g.GraphQLString },
                                                            model2: {
                                                                args: {
                                                                    where: { type: new g.GraphQLNonNull(where) },
                                                                },
                                                                type: new g.GraphQLObjectType({
                                                                    name: "Model2",
                                                                    fields: {
                                                                        field2: { type: g.GraphQLInt },
                                                                        id: {
                                                                            type:
                                                                            new g.GraphQLNonNull(g.GraphQLID),
                                                                        },
                                                                    },
                                                                    interfaces: [nodeInterface.nodeInterface],
                                                                }),
                                                            },
                                                        },
                                                        interfaces: [nodeInterface.nodeInterface],
                                                    }),
                                                },
                                            },
                                        }))),
                                    },
                                    pageInfo: {
                                        type: new g.GraphQLObjectType({
                                            name: "Model1ConnectionPageInfo",
                                            fields: {
                                                hasNextPage: { type: g.GraphQLBoolean },
                                            },
                                        }),
                                    },
                                },
                            }),
                        },
                    },
                    interfaces: [nodeInterface.nodeInterface],
                }),
            },
        },
    }),
});
export default schema;
