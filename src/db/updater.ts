import type { Pool } from "pg";

type Out = Promise<void>;

// ===== PAYLOAD FORMATS =====
//
// Launch { name, version, checksum? }
//
// Download New { version, checksum? }
// Add Existing { version, checksum? }
// Update { version, checksum? }
// Repair { version, checksum? }
// Uninstall { version, checksum? }
// Set Default { version, checksum? }

function writePayload(isSelf: boolean): ( pool: Pool, eventID: number, typ: string
                                        , payload: Record<string, unknown>) => Out {

  const tag = isSelf ? "self" : "netlogo";

  return async (pool: Pool, eventID: number, typ: string, payload: Record<string, unknown>): Out => {

    const  version   = payload[ "version"] as string;
    const resolution = payload[  "result"] as string;
    const checksum   = payload["checksum"] as string | null;

    switch (typ) {

      case "Launch": {
        const app = payload["name"] as string;
        await pool.query(
          `INSERT INTO "updater_${tag}_launch_event_payloads"
           (event_id, app, version, resolution, checksum)
           VALUES ($1, $2, $3, $4, $5)`,
          [eventID, app, version, resolution, checksum]
        );
        break;
      }

      default: {
        await pool.query(
          `INSERT INTO "updater_${tag}_event_payloads"
           (event_id, version, resolution, checksum)
           VALUES ($1, $2, $3, $4)`,
          [eventID, version, resolution, checksum]
        );
      }

    }

  };
}

export { writePayload };
