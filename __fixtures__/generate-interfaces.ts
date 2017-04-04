import { writeFileSync } from "fs";
import generate from "graphql-schema-to-interfaces";
import schema from "./schema2";
writeFileSync(__dirname + "/interfaces2.ts", "// tslint:disable:member-ordering\n" + generate(schema) + "\n");
