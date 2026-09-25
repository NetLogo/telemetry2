import dotenv   from "dotenv";
import { Pool } from "pg";

import { NL70xEvent } from "../protobuf/nl_desktop.js";

import { writePayload as writeNLDPayload } from "./nl_desktop.js";

import type { QueryResult } from "pg";
import type { TelemetryEvent } from "../protobuf/common.js";

dotenv.config();

const getOrError = (key: string, descriptor: string): string => {
  const result = process.env[key];
  if (result !== undefined && result !== "") {
    return result;
  } else {
    throw new Error(`not a ${descriptor}`);
  }
};

const pgUsername: string = getOrError("POSTGRES_USERNAME",  "username");
const pgPassword: string = getOrError("POSTGRES_PASSWORD",  "password");
const pgHostName: string = getOrError("PG_HOST_NAME"     , "localhost");
const pgDBName:   string = getOrError("PG_DB_NAME"       ,   "DB name");

const poolFor = (suffix: string): Pool => {
  return new Pool({
    host:     pgHostName
  , port:     5432
  , database: `${pgDBName}_${suffix}`
  , user:     pgUsername
  , password: pgPassword
  });
};

const PROD_DB = poolFor("prod");
const  DEV_DB = poolFor( "dev");

async function writeEvent(event: TelemetryEvent): Promise<void> {

  try {

    const pool = event.isDeveloper ? DEV_DB : PROD_DB;

    const [dbName, writePayload] = (event instanceof NL70xEvent) ? ["events", writeNLDPayload] :
                                                                   ["invalid_event_type", (): void => {}];

    const result: QueryResult<{ event_id: number }> =
      await pool.query(
        `INSERT INTO $1 (user_uuid, event_type)
         VALUES ($2, $3)
         RETURNING event_id`,
        [dbName, event.userUUID, event.eventType]
      );

    const eventID = result.rows[0]?.event_id;

    if (eventID !== undefined) {
      if (event.payload !== undefined && event.payload !== "") {
        const payload = JSON.parse(event.payload) as Record<string, unknown>;
        await writePayload(pool, eventID, event.eventType, payload);
      }
    } else {
      throw new Error(`Malformed insertion result: ${JSON.stringify(result)}`);
    }

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("DB error", err);
    } else {
      console.error("Unknown DB error");
    }
  }

}

export { writeEvent };
