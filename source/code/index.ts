import { objectKeys } from "ts-extras";
import { ComponentCollectionState } from "./lib.ts";

enum MyComponentKey {
  Foo,
  Bar,
}

interface MyComponentsMap {
  [MyComponentKey.Foo]: number;
  [MyComponentKey.Bar]: string;
}

type MyComponentCollectionState = ComponentCollectionState<
  MyComponentKey,
  MyComponentsMap
>;

export { type MyComponentCollectionState };

const myComponentKeys = objectKeys(MyComponentKey).filter(
  (v) => !isNaN(Number(v))
);

const e = ComponentCollectionState.create(myComponentKeys, {});
