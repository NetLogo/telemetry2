import dotenv   from "dotenv";
import { Pool } from "pg";

import type { QueryResult } from "pg";

import type { NL70xEvent  } from "./protobuf.js";

dotenv.config();

const getOrError = (key: string, descriptor: string): string => {
  const result = process.env[key];
  if (result !== undefined && result !== "") {
    return result;
  } else {
    throw new Error(`not a ${descriptor}`);
  }
};

const pgUsername: string = getOrError("PG_USERNAME" ,  "username");
const pgPassword: string = getOrError("PG_PASSWORD" ,  "password");
const pgHostName: string = getOrError("PG_HOST_NAME", "localhost");
const pgDBName:   string = getOrError("PG_DB_NAME"  ,   "DB name");

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

async function writePayload( pool: Pool, eventID: number, typ: string
                           , payload: Record<string, unknown>): Promise<void> {

  switch (typ) {

    case "App Exit":
      await pool.query(
        `INSERT INTO app_exit_payload
         (event_id, app_minutes)
         VALUES ($1, $2)`,
        [ eventID
        , payload["appMinutes"] as number
        ]
      );
      break;

    case "App Start":
      await pool.query(
        `INSERT INTO app_start_payload
         (event_id, version, is_3d, os, arch)
         VALUES ($1, $2, $3, $4, $5)`,
        [ eventID
        , payload["version"] as string
        , payload[   "is3D"] as boolean
        , payload[     "os"] as string
        , payload[   "arch"] as string
        ]
      );
      break;

    case "BehaviorSpace Run":
      await pool.query(
        `INSERT INTO behaviorspace_run_payload
         (event_id, used_table, used_spreadsheet, used_stats, used_lists)
         VALUES ($1, $2, $3, $4, $5)`,
        [ eventID
        , payload["usedTable"      ] as boolean
        , payload["usedSpreadsheet"] as boolean
        , payload["usedStats"      ] as boolean
        , payload["usedLists"      ] as boolean
        ]
      );
      break;

    case "Include Extension":
      await pool.query(
        "INSERT INTO include_extension_payload(event_id, name) VALUES ($1, $2)",
        [ eventID
        , payload["name"] as string
        ]
      );
      break;

    case "Keyword Usage":
      await pool.query(
        `INSERT INTO keyword_usage_payload (event_id, payload)
         VALUES ($1, $2)`,
        [eventID, payload]
      );
      break;

    case "Load Old Size Widgets":
      await pool.query(
        "INSERT INTO load_old_size_widgets_payload(event_id, num_widgets) VALUES ($1, $2)",
        [ eventID
        , payload["numWidgets"] as number
        ]
      );
      break;

    case "Model Code Hash":
      await pool.query(
        "INSERT INTO model_code_hash_payload(event_id, hash) VALUES ($1, $2)",
        [ eventID
        , payload["hash"] as number
        ]
      );
      break;

    case "Preference Change":
      await pool.query(
        `INSERT INTO preference_change_payload
         (event_id, name, value)
         VALUES ($1, $2, $3)`,
        [ eventID
        , payload[ "name"] as string
        , payload["value"] as string
        ]
      );
      break;

    case "Primitive Usage":
      await pool.query(
        `INSERT INTO primitive_usage_payload (event_id, payload)
         VALUES ($1, $2)`,
        [eventID, payload]
      );
      break;

    default:
      break;

  }

}

async function writeEvent(event: NL70xEvent): Promise<void> {

  try {

    const pool = event.isDeveloper ? DEV_DB : PROD_DB;

    const result: QueryResult<{ event_id: number }> =
      await pool.query(
        `INSERT INTO events (user_uuid, event_type)
         VALUES ($1, $2)
         RETURNING event_id`,
        [event.userUUID, event.eventType]
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
