import { IResolver } from ".";
export interface IResolverConfig {
    address: string;
}
class Resolver implements IResolver {
    constructor(protected config: IResolverConfig) { }
    public async fetch(query: string, vars?: any, subscriptionId?: string) {
        const res = await fetch(this.config.address, {
            method: "POST",
            body: JSON.stringify({
                query,
                vars,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        return await res.json();
    }
    public unsubscribe(id: string): Promise<void> {
        throw new Error("Not implemented");
    }
}
export default Resolver;
