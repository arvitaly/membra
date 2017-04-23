import { GraphQLSchema } from "graphql";
import SchemaObj from "./SchemaObj";
export interface IExecution {
    schemaObj: SchemaObj;
    executor: (schemaObj: any) => any;
}
export class Generator<S>{
    constructor(protected schema: GraphQLSchema) { }
    public generate<T>(executor: (schemaObj: S) => T): IExecution {
        const schemaObj = this.createSchemaObj();
        executor(schemaObj as any);
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
