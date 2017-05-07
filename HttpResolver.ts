import fetch from "node-fetch";
import { IResolver } from ".";
export interface IResolverConfig {
    address: string;
    fetch?: typeof fetch;
}
class Resolver implements IResolver {
    protected fetchClient: typeof fetch;
    constructor(protected config: IResolverConfig) {
        this.fetchClient = this.config.fetch || fetch;
    }
    public async fetch(query: string, vars?: any, _?: string) {
        const res = await this.fetchClient(this.config.address, {
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
    public unsubscribe(_: string): Promise<void> {
        throw new Error("Not implemented");
    }
}
export default Resolver;
