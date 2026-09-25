import type { Pool } from "pg";

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

    case "Announcement Clicked":
      await pool.query(
        `INSERT INTO announcement_clicked_payload (event_id, announcement_id)
         VALUES ($1, $2)`,
        [ eventID
        , payload["announcementID"] as number
        ]
      );

    default:
      break;

  }

}

export { writePayload };
