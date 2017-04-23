import Resolver from "./../HttpResolver";
it("when fetch, should call global fetch with true params", async () => {
    const fetchFn = jest.fn();
    (global as any).fetch = fetchFn;
    const address = "http://127.0.0.1:1337/graphql";
    const resolver = new Resolver({ address });
    fetchFn.mockImplementation(() => {
        return Promise.resolve({
            json: (): any => {
                return { data: { test: 15 } };
            },
        });
    });
    const result = await resolver.fetch(`query Q1{
        viewer{
            users{
                edges{
                    node{
                        name
                    }
                }
            }
        }
    }`, { id: 1 });
    expect(fetchFn.mock.calls).toMatchSnapshot();
    expect(result).toMatchSnapshot();
});
