import { Field, InputType } from "@nestjs/graphql";
import { WhereUniqueInput } from "../../../dto";

@InputType({
  isAbstract: true,
})
export class WhereBlueprintUniqueInput {
  @Field(() => WhereUniqueInput, {
    nullable: false,
  })
  blueprint!: WhereUniqueInput;

  @Field(() => String, {
    nullable: false,
  })
  relationKey!: string;
}
