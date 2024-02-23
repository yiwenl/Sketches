import { Mesh } from "../core/Mesh";

const parseObj = (objStr) => {
  const lines = objStr.split("\n");

  const positions = [];
  const coords = [];
  const finalNormals = [];
  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  let count = 0;
  let result;

  // v float float float
  const vertexPattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

  // vn float float float
  const normalPattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

  // vt float float
  const uvPattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

  // f vertex vertex vertex ...
  const facePattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

  // f vertex/uv vertex/uv vertex/uv ...
  const facePattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

  // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
  const facePattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

  // f vertex//normal vertex//normal vertex//normal ...
  const facePattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;

  function parseVertexIndex(value) {
    const index = parseInt(value);
    return (index >= 0 ? index - 1 : index + vertices.length / 3) * 3;
  }

  function parseNormalIndex(value) {
    const index = parseInt(value);
    return (index >= 0 ? index - 1 : index + normals.length / 3) * 3;
  }

  function parseUVIndex(value) {
    const index = parseInt(value);
    return (index >= 0 ? index - 1 : index + uvs.length / 2) * 2;
  }

  function addVertex(a, b, c) {
    positions.push([vertices[a], vertices[a + 1], vertices[a + 2]]);
    positions.push([vertices[b], vertices[b + 1], vertices[b + 2]]);
    positions.push([vertices[c], vertices[c + 1], vertices[c + 2]]);

    indices.push(count * 3 + 0);
    indices.push(count * 3 + 1);
    indices.push(count * 3 + 2);

    count++;
  }

  function addUV(a, b, c) {
    coords.push([uvs[a], uvs[a + 1]]);
    coords.push([uvs[b], uvs[b + 1]]);
    coords.push([uvs[c], uvs[c + 1]]);
  }

  function addNormal(a, b, c) {
    finalNormals.push([normals[a], normals[a + 1], normals[a + 2]]);
    finalNormals.push([normals[b], normals[b + 1], normals[b + 2]]);
    finalNormals.push([normals[c], normals[c + 1], normals[c + 2]]);
  }

  function addFace(a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd) {
    let ia = parseVertexIndex(a);
    let ib = parseVertexIndex(b);
    let ic = parseVertexIndex(c);
    let id;

    if (d === undefined) {
      addVertex(ia, ib, ic);
    } else {
      id = parseVertexIndex(d);

      addVertex(ia, ib, id);
      addVertex(ib, ic, id);
    }

    if (ua !== undefined) {
      ia = parseUVIndex(ua);
      ib = parseUVIndex(ub);
      ic = parseUVIndex(uc);

      if (d === undefined) {
        addUV(ia, ib, ic);
      } else {
        id = parseUVIndex(ud);

        addUV(ia, ib, id);
        addUV(ib, ic, id);
      }
    }

    if (na !== undefined) {
      ia = parseNormalIndex(na);
      ib = parseNormalIndex(nb);
      ic = parseNormalIndex(nc);

      if (d === undefined) {
        addNormal(ia, ib, ic);
      } else {
        id = parseNormalIndex(nd);

        addNormal(ia, ib, id);
        addNormal(ib, ic, id);
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    line = line.trim();

    if (line.length === 0 || line.charAt(0) === "#") {
      continue;
    } else if ((result = vertexPattern.exec(line)) !== null) {
      vertices.push(
        parseFloat(result[1]),
        parseFloat(result[2]),
        parseFloat(result[3])
      );
    } else if ((result = normalPattern.exec(line)) !== null) {
      normals.push(
        parseFloat(result[1]),
        parseFloat(result[2]),
        parseFloat(result[3])
      );
    } else if ((result = uvPattern.exec(line)) !== null) {
      uvs.push(parseFloat(result[1]), parseFloat(result[2]));
    } else if ((result = facePattern1.exec(line)) !== null) {
      addFace(result[1], result[2], result[3], result[4]);
    } else if ((result = facePattern2.exec(line)) !== null) {
      addFace(
        result[2],
        result[5],
        result[8],
        result[11],
        result[3],
        result[6],
        result[9],
        result[12]
      );
    } else if ((result = facePattern3.exec(line)) !== null) {
      addFace(
        result[2],
        result[6],
        result[10],
        result[14],
        result[3],
        result[7],
        result[11],
        result[15],
        result[4],
        result[8],
        result[12],
        result[16]
      );
    } else if ((result = facePattern4.exec(line)) !== null) {
      addFace(
        result[2],
        result[5],
        result[8],
        result[11],
        undefined,
        undefined,
        undefined,
        undefined,
        result[3],
        result[6],
        result[9],
        result[12]
      );
    }
  }

  return generateMeshes({
    positions,
    coords,
    normals: finalNormals,
    indices,
  });
};

const generateMeshes = (o) => {
  const maxNumVertices = 65535;
  const hasNormals = o.normals.length > 0;
  const hasUVs = o.coords.length > 0;
  let mesh;

  if (o.positions.length > maxNumVertices) {
    const meshes = [];
    let lastIndex = 0;

    const oCopy = {};
    oCopy.positions = o.positions.concat();
    oCopy.coords = o.coords.concat();
    oCopy.indices = o.indices.concat();
    oCopy.normals = o.normals.concat();

    while (o.indices.length > 0) {
      const sliceNum = Math.min(maxNumVertices, o.positions.length);
      const indices = o.indices.splice(0, sliceNum);
      const positions = [];
      const coords = [];
      const normals = [];
      let index,
        tmpIndex = 0;

      for (let i = 0; i < indices.length; i++) {
        if (indices[i] > tmpIndex) {
          tmpIndex = indices[i];
        }

        index = indices[i];

        positions.push(oCopy.positions[index]);
        if (hasUVs) {
          coords.push(oCopy.coords[index]);
        }
        if (hasNormals) {
          normals.push(oCopy.normals[index]);
        }

        indices[i] -= lastIndex;
      }

      lastIndex = tmpIndex + 1;

      mesh = new Mesh();
      mesh.bufferVertex(positions);
      if (hasUVs) {
        mesh.bufferTexCoord(coords);
      }

      mesh.bufferIndex(indices);
      if (hasNormals) {
        mesh.bufferNormal(normals);
      }

      meshes.push(mesh);
    }

    return meshes;
  } else {
    mesh = new Mesh();
    mesh.bufferVertex(o.positions);
    if (hasUVs) {
      mesh.bufferTexCoord(o.coords);
    }
    mesh.bufferIndex(o.indices);
    if (hasNormals) {
      mesh.bufferNormal(o.normals);
    }

    return mesh;
  }

  return null;
};

export { parseObj };
