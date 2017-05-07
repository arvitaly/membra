import { GraphQLSchema } from "graphql";
import SchemaObj from "./SchemaObj";
export interface IExecution {
    schemaObj: SchemaObj;
    executor: (schemaObj: any, vars?: any) => any;
}
export class Generator<S>{
    constructor(protected schema: GraphQLSchema) { }
    public generate<T>(executor: (schemaObj: S, vars?: any) => T, vars?: any): IExecution {
        const schemaObj = this.createSchemaObj();
        executor(schemaObj as any, vars);
        return {
            schemaObj,
            executor,
        };
    }
    public getQuery(execution: IExecution): string {
        return execution.schemaObj.getQuery();
    }
    protected createSchemaObj() {
        return new SchemaObj(this.schema);
    }
}
export default Generator;
