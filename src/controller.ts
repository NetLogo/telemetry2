import dotenv   from "dotenv";
import fs       from "node:fs";
import http     from "http";
import http2    from "http2";
import protobuf from "protobufjs";

import { writeEvent } from "./db.js";

import { lookupEventType, recombobulateUUID } from "./protobuf.js";

import type Long from "long";

import type { NL70xEvent } from "./protobuf.js";

dotenv.config();

type NodeRequest  = http.IncomingMessage | http2.Http2ServerRequest
type NodeResponse = http.ServerResponse  | http2.Http2ServerResponse

const port:     number = parseInt(process.env[     "PORT"] ??     "3030");
const certPath: string =          process.env["CERT_PATH"] ?? "cert.pem";
const keyPath:  string =          process.env[ "KEY_PATH"] ??  "key.pem";

const pbRoot           = await protobuf.load("src/proto/telemetry.proto");
const TelemetryEventV1 = pbRoot.lookupType("TelemetryEventV1");

const server = http.createServer(http1Handler);

const server2 =
  http2.createSecureServer({
    allowHTTP1: true
  ,       cert: fs.readFileSync(certPath)
  ,        key: fs.readFileSync( keyPath)
  });

server2.on("request", http1Handler);

function http1Handler(req: NodeRequest, res: NodeResponse): void {
  if (req.method === "POST" && req.url === "/telemetry/v2/upload") {
    void handleAnalyticsRequest(req, res);
  } else if (req.method === "GET" && req.url === "/telemetry/diagnostic") {
    res.writeHead(200);
    res.end("Success");
  } else {
    res.writeHead(404);
    res.end();
  }
};

// eslint-disable-next-line @typescript-eslint/no-misused-promises
server2.on("stream", async (stream, headers) => {
  if (headers[":method"] === "POST" && headers[":path"] === "/telemetry/v2/upload") {
    void handleUpload(stream);
  } else {
    stream.respond({ ":status": 404 });
    stream.end();
  }
});

async function handleUpload(stream: http2.ServerHttp2Stream): Promise<void> {

  let alreadyEnded = false;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  stream.on("data", async (data) => {
    try {
      await processAnalyticsMessage(data);
    } catch (err: unknown) {
      console.error(err);
      alreadyEnded = true;
      stream.end("Bad Request");
    }
  });

  stream.on("error", (err) => {
    console.error("Stream error:", err);
    if (!(stream.destroyed || stream.closed || alreadyEnded)) {
      alreadyEnded = true;
      stream.end("Internal Server Error");
    }
  });

};

async function handleAnalyticsRequest(req: NodeRequest, res: NodeResponse): Promise<void> {

  const chunks: Array<Buffer> = [];

  req.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  req.on("end", async () => {
    try {
      const body = Buffer.concat(chunks);
      chunks.length = 0;
      await processAnalyticsMessage(body);
      res.writeHead(200);
      res.end("OK");
    } catch (err: unknown) {
      console.error(`HTTP/1.1 analytics completion error: ${err}`);
      res.writeHead(400);
      res.end("Error");
    }
  });

  req.on("error", (err: unknown) => {
    console.error(`HTTP/1.1 analytics general error: ${err}`);
    res.writeHead(500);
    res.end("Request Error");
  });

}

async function processAnalyticsMessage(chunk: Buffer | string): Promise<void> {

  const   buffer = (typeof(chunk) === "string") ? Buffer.from(chunk) : chunk;
  const  decoded = TelemetryEventV1.decode(buffer);
  const rawEvent = TelemetryEventV1.toObject(decoded, { defaults: true }) as Record<string, unknown>;

  if ((rawEvent["formatVersion"] as number) === 1) {

    // Note that JS can only represent integers accurately up to 53 bits.  NetLogo breaks
    // the UUID up into two 64-bit numbers so it can be transmitted over the wire.  Then,
    // we recombobulate it into a 128-bit UUID.  But, in order to get there without
    // losing precision, we use the "long" library from NPM to read the 64-bit numbers
    // from ProtoBuf.  This happens automagically. --Jason B. (2/2/26)
    const userUUID  = recombobulateUUID(rawEvent["uuid1"] as Long, rawEvent["uuid2"] as Long);
    const eventType = lookupEventType(rawEvent["eventType"] as number);

    const event: NL70xEvent =
      { userUUID
      , isDeveloper: rawEvent["isDeveloper"] as boolean
      , eventType
      , payload:     rawEvent[    "payload"] as string
      };

    await writeEvent(event);

  } else {
    const v      = rawEvent["formatVersion"];
    const objStr = JSON.stringify(rawEvent);
    console.error(`Unexpected protobuf event version: ${v} | ${objStr}`);
    throw new Error("Bad protobuf message");
  }

}

void server2; // Disabled for now

server.listen(port, () => {
  console.log(`Telemetry server listening on :${port}`);
});
