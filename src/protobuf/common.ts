import { stringify } from "uuid";

import type Long from "long";

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

const lookup = (eventTypes: Array<string>) => (index: number): string => {
  const str = eventTypes[index];
  if (str !== undefined) {
    return str;
  } else {
    throw new Error(`Invalid event index.  Valid range: [0, ${eventTypes.length}] | Got: ${index}`);
  }
};

abstract class TelemetryEvent {
  public constructor(
    public userUUID: string,
    public isDeveloper: boolean,
    public eventType: string,
    public payload?: string,
  ) {}
}

export { lookup, recombobulateUUID, TelemetryEvent };
