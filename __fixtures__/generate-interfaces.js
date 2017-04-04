"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const graphql_schema_to_interfaces_1 = require("graphql-schema-to-interfaces");
const schema2_1 = require("./schema2");
fs_1.writeFileSync(__dirname + "/interfaces2.ts", "// tslint:disable:member-ordering\n" + graphql_schema_to_interfaces_1.default(schema2_1.default) + "\n");
