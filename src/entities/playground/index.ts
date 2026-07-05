import data from "./data/playground.json";
import type { PlaygroundItem } from "./model/types";
import { parsePlaygroundItems } from "./model/guards";
import {
  publicPlaygroundItems as selectPublicPlaygroundItems,
  readPlaygroundItems
} from "./repository/playgroundRepository";

export type { PlaygroundItem } from "./model/types";

export const playgroundItems: PlaygroundItem[] = parsePlaygroundItems(
  data,
  "bundled playground data"
);

export function publicPlaygroundItems(
  list: PlaygroundItem[] = playgroundItems
): PlaygroundItem[] {
  return selectPublicPlaygroundItems(list);
}

export function readBundledPlaygroundItems(): PlaygroundItem[] {
  return readPlaygroundItems();
}
