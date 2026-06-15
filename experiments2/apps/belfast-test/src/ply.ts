// Minimal binary little-endian PLY parser.
//
// Built for 3D Gaussian Splat exports (one `element vertex` block of float
// properties: x/y/z, scale_*, f_dc_*, opacity, rot_*, f_rest_*). It only
// materializes the columns you ask for, so loading a 70 MB cloud doesn't keep
// 59 float arrays alive when we only need ~10.

interface PlyProperty {
  name: string;
  type: string;
  /** Byte offset of this property within a single vertex record. */
  offset: number;
  /** Byte size of this property's scalar type. */
  size: number;
}

export interface PlyData {
  count: number;
  /** One Float32Array per requested property name. */
  columns: Record<string, Float32Array>;
}

const TYPE_SIZES: Record<string, number> = {
  char: 1,
  uchar: 1,
  int8: 1,
  uint8: 1,
  short: 2,
  ushort: 2,
  int16: 2,
  uint16: 2,
  int: 4,
  uint: 4,
  int32: 4,
  uint32: 4,
  float: 4,
  float32: 4,
  double: 8,
  float64: 8,
};

function readScalar(view: DataView, byteOffset: number, type: string): number {
  switch (type) {
    case "char":
    case "int8":
      return view.getInt8(byteOffset);
    case "uchar":
    case "uint8":
      return view.getUint8(byteOffset);
    case "short":
    case "int16":
      return view.getInt16(byteOffset, true);
    case "ushort":
    case "uint16":
      return view.getUint16(byteOffset, true);
    case "int":
    case "int32":
      return view.getInt32(byteOffset, true);
    case "uint":
    case "uint32":
      return view.getUint32(byteOffset, true);
    case "float":
    case "float32":
      return view.getFloat32(byteOffset, true);
    case "double":
    case "float64":
      return view.getFloat64(byteOffset, true);
    default:
      throw new Error(`Unsupported PLY property type: ${type}`);
  }
}

function findDataStart(bytes: Uint8Array): number {
  const maxScan = Math.min(bytes.length, 256 * 1024);
  const text = new TextDecoder("latin1").decode(bytes.subarray(0, maxScan));

  if (!text.startsWith("ply")) {
    throw new Error(
      'PLY: file does not start with "ply" — wrong URL or an HTML page was fetched instead. ' +
        "For Vite dev, place .ply files in apps/belfast-test/public/.",
    );
  }

  const match = /\bend_header\r?\n/.exec(text);
  if (!match || match.index === undefined) {
    throw new Error("PLY: end_header not found in the first 256KB of the file");
  }
  return match.index + match[0].length;
}

/**
 * Parse a binary little-endian PLY and return the requested vertex columns.
 *
 * @param buffer    Raw `.ply` file bytes.
 * @param wanted    Property names to extract (e.g. `["x", "f_dc_0"]`).
 */
export function parsePly(buffer: ArrayBuffer, wanted: string[]): PlyData {
  const bytes = new Uint8Array(buffer);
  const dataStart = findDataStart(bytes);

  const headerText = new TextDecoder("latin1")
    .decode(bytes.subarray(0, dataStart))
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const headerBody = headerText.slice(0, headerText.lastIndexOf("end_header"));
  const lines = headerBody.split("\n").map((l) => l.trim());

  if (!lines.some((l) => l.startsWith("format binary_little_endian"))) {
    throw new Error("PLY: only binary_little_endian format is supported");
  }

  let vertexCount = 0;
  let inVertexElement = false;
  const properties: PlyProperty[] = [];
  let stride = 0;

  for (const line of lines) {
    if (line.startsWith("element ")) {
      const [, name, countStr] = line.split(/\s+/);
      inVertexElement = name === "vertex";
      if (inVertexElement) {
        vertexCount = Number.parseInt(countStr, 10);
      }
      continue;
    }
    if (line.startsWith("property ") && inVertexElement) {
      const parts = line.split(/\s+/);
      // `property list ...` (variable-length) isn't used by gaussian exports.
      if (parts[1] === "list") {
        throw new Error("PLY: list properties on vertex element are not supported");
      }
      const type = parts[1];
      const name = parts[2];
      const size = TYPE_SIZES[type];
      if (size === undefined) {
        throw new Error(`PLY: unknown property type "${type}"`);
      }
      properties.push({ name, type, offset: stride, size });
      stride += size;
    }
  }

  if (vertexCount <= 0) {
    throw new Error("PLY: no vertices found");
  }

  const propByName = new Map(properties.map((p) => [p.name, p]));
  const targets = wanted.map((name) => {
    const prop = propByName.get(name);
    if (!prop) {
      throw new Error(`PLY: requested property "${name}" not present in file`);
    }
    return { name, prop, out: new Float32Array(vertexCount) };
  });

  const view = new DataView(buffer);
  for (let i = 0; i < vertexCount; i++) {
    const base = dataStart + i * stride;
    for (const t of targets) {
      t.out[i] = readScalar(view, base + t.prop.offset, t.prop.type);
    }
  }

  const columns: Record<string, Float32Array> = {};
  for (const t of targets) {
    columns[t.name] = t.out;
  }
  return { count: vertexCount, columns };
}
