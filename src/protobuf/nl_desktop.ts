import { lookup, TelemetryEvent } from "./common.js";

class NL70xEvent extends TelemetryEvent {
  public constructor(
    userUUID: string,
    isDeveloper: boolean,
    eventType: string,
    payload?: string,
  ) {
    super(userUUID, isDeveloper, eventType, payload);
  }
}

// HEY!  Default to not making modifications to this.  If you need to change the format of an existing
// event, just make a new one and then add it to `AnalyticsEventType.scala` in NetLogo, and ONLY EVER ADD
// TO THE END OF THIS LIST. --Jason B. (4/16/26)
const lookupEventType: (index: number) => string =
  lookup(
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
    , "Announcement Clicked"
    ]
  );

export { lookupEventType, NL70xEvent };
