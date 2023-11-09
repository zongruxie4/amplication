import { print } from "@amplication/code-gen-utils";
import { Entity } from "@amplication/code-gen-types";
import { createWhereUniqueInput } from "../../create-where-unique-input";
import { createFindOneArgs, createFindOneArgsId } from "./create-find-one-args";
import {
  EXAMPLE_ID_FIELD,
  EXAMPLE_SINGLE_LINE_TEXT_FIELD,
} from "../../../util/test-data";
import { createEntityInputFiles } from "../../../create-dtos";

const EXAMPLE_ENTITY: Entity = {
  id: "EXAMPLE_ENTITY_ID",
  name: "ExampleEntity",
  displayName: "Example Entity",
  pluralName: "ExampleEntities",
  pluralDisplayName: "Example Entities",
  fields: [EXAMPLE_ID_FIELD, EXAMPLE_SINGLE_LINE_TEXT_FIELD],
  permissions: [],
};
const EXAMPLE_WHERE_UNIQUE_INPUT = createEntityInputFiles(EXAMPLE_ENTITY);
const exampleWhereUniqueInput = EXAMPLE_WHERE_UNIQUE_INPUT.whereUniqueInput;

describe("createFindOneArgs", () => {
  test("creates find one args", async () => {
    expect(
      print(await createFindOneArgs(EXAMPLE_ENTITY, exampleWhereUniqueInput))
        .code
    ).toEqual(`@ArgsType()
class ${createFindOneArgsId(EXAMPLE_ENTITY.name).name} {
  @ApiProperty({
    required: true,
    type: () => ${exampleWhereUniqueInput.id.name},
  })
  @ValidateNested()
  @Type(() => ${exampleWhereUniqueInput.id.name})
  @Field(() => ${exampleWhereUniqueInput.id.name}, { nullable: false })
  where!: ${exampleWhereUniqueInput.id.name};
}`);
  });
});
