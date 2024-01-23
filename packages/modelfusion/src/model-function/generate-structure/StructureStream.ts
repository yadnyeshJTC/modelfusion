import type { PartialDeep } from "type-fest";
import { Schema } from "../../core/schema/Schema.js";
import { parsePartialJson } from "../../util/parsePartialJson.js";

export type StructureStream<STRUCTURE> = AsyncIterable<{
  partialStructure: PartialDeep<STRUCTURE, { recurseIntoArrays: true }>;
  partialText: string;
  textDelta: string;
}>;

export class StructureStreamResponse extends Response {
  constructor(stream: StructureStream<unknown>, init?: ResponseInit) {
    super(StructureStreamToTextStream(stream), {
      ...init,
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

export async function* StructureStreamFromResponse<T>({
  response,
}: {
  schema: Schema<T>;
  response: Response;
}) {
  let text = "";

  const reader = response.body!.getReader();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    text += new TextDecoder().decode(value);

    const partialStructure = parsePartialJson(text) as T;

    yield { partialStructure };
  }
}

function StructureStreamToTextStream(stream: StructureStream<unknown>) {
  const textEncoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const { textDelta } of stream) {
          controller.enqueue(textEncoder.encode(textDelta));
        }
      } finally {
        controller.close();
      }
    },
  });
}
