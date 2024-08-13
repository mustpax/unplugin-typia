import typia from "typia";
const random = (generator) => {
  const $generator = typia.createRandom.generator;
  const $ro0 = (_recursive = false, _depth = 0) => ({
    email: (generator?.customs ?? $generator.customs)?.string?.([
      {
        name: 'Format<"email">',
        kind: "format",
        value: "email"
      }
    ]) ?? (generator?.email ?? $generator.email)(),
    id: (generator?.customs ?? $generator.customs)?.string?.([
      {
        name: 'Format<"uuid">',
        kind: "format",
        value: "uuid"
      }
    ]) ?? (generator?.uuid ?? $generator.uuid)(),
    age: (generator?.customs ?? $generator.customs)?.number?.([
      {
        name: 'Type<"uint32">',
        kind: "type",
        value: "uint32"
      },
      {
        name: "ExclusiveMinimum<19>",
        kind: "exclusiveMinimum",
        value: 19
      },
      {
        name: "Maximum<100>",
        kind: "maximum",
        value: 100
      }
    ]) ?? (generator?.integer ?? $generator.integer)(19, 100)
  });
  return $ro0();
};
random();
