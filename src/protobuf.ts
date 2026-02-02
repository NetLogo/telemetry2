import { stringify } from "uuid";

import type Long from "long";

type NL70xEvent = { userUUID: string; isDeveloper: boolean; eventType: string; payload?: string; };

/* eslint-disable no-bitwise */
const longToBytes = (l: Long): Uint8Array => {
  return new Uint8Array(
    [ (l.high >>> 24) & 0xff
    , (l.high >>> 16) & 0xff
    , (l.high >>>  8) & 0xff
    , (l.high       ) & 0xff
    , (l.low  >>> 24) & 0xff
    , (l.low  >>> 16) & 0xff
    , (l.low  >>>  8) & 0xff
    , (l.low        ) & 0xff
    ]
  );
};
/* eslint-enable no-bitwise */

const recombobulateUUID = (part1: Long, part2: Long): string => {
  const buffer = new Uint8Array(16);
  buffer.set(longToBytes(part1), 0);
  buffer.set(longToBytes(part2), 8);
  return stringify(buffer);
};

// HEY!  Don't make modifications to this.  If you need to change the format, make a new one
// and then add it to `AnalyticsEventType.scala` in NetLogo, and ONLY EVER ADD TO THE END.
// --Jason B. (1/26/26)
const eventTypes =
  [ "App Start"
  , "App Exit"
  , "Preference Change"
  , "SDM Open"
  , "BehaviorSpace Open"
  , "BehaviorSpace Run"
  , "Open 3D View"
  , "Turtle Shape Editor Open"
  , "Turtle Shape Edit"
  , "Link Shape Editor Open"
  , "Link Shape Edit"
  , "Color Picker Open"
  , "HubNet Editor Open"
  , "HubNet Client Open"
  , "Globals Monitor Open"
  , "Turtle Monitor Open"
  , "Patch Monitor Open"
  , "Link Monitor Open"
  , "Model Code Hash"
  , "Primitive Usage"
  , "Keyword Usage"
  , "Include Extension"
  , "Load Old Size Widgets"
  , "Modeling Commons Open"
  , "Modeling Commons Upload"
  , "Save as NetLogo Web"
  , "Preview Commands Open"
  ];

const lookupEventType = (index: number): string => {
  const str = eventTypes[index];
  if (str !== undefined) {
    return str;
  } else {
    throw new Error(`Invalid event index.  Valid range: [0, ${eventTypes.length}] | Got: ${index}`);
  }
};

export      { lookupEventType, recombobulateUUID };
export type { NL70xEvent                         };
