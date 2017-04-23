import { graphql, introspectionQuery } from "graphql";
import { Membra } from "./../";
import schema from "./../__fixtures__/schema2";
it("when get client schema, should return it", async () => {
    const resolver = {
        fetch: async () => {
            return await graphql(schema, introspectionQuery);
        },
    };
    const membra = new Membra(resolver as any);
    expect(await membra.getClientSchema()).toMatchSnapshot();
});
