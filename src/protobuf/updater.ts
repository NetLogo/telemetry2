import { lookup, TelemetryEvent } from "./common.js";

class NLUpdaterEvent extends TelemetryEvent {
  public constructor( userUUID:     string
                    , isDeveloper: boolean
                    , eventType:    string
                    , payload?:     string
                    ) {
    super(userUUID, isDeveloper, eventType, payload);
  }
}

class SelfUpdaterEvent extends TelemetryEvent {
  public constructor( userUUID:     string
                    , isDeveloper: boolean
                    , eventType:    string
                    , payload?:     string
                    ) {
    super(userUUID, isDeveloper, eventType, payload);
  }
}

// HEY!  Before modifying, see "HEY!" in `nl_desktop.ts`. --Jason B. (9/29/26)
const lookupNLUpdateEventType: (index: number) => string =
  lookup(
    [ "Download New"
    , "Add Existing"
    , "Update"
    , "Repair"
    , "Uninstall"
    , "Set Default"
    , "Launch"
    ]
  );

// HEY!  Before modifying, see "HEY!" in `nl_desktop.ts`. --Jason B. (9/29/26)
const lookupSelfUpdateEventType: (index: number) => string =
  lookup(
    [ "Update"
    ]
  );

export { lookupNLUpdateEventType, lookupSelfUpdateEventType, NLUpdaterEvent, SelfUpdaterEvent };
