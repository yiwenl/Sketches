// Draw.js
import { GL, Mesh, GLShader } from 'alfrid';

class Draw {

	constructor() {
		this._uniforms = {};
		this._uniformTextures = [];
		this._fbo;

		this._clearColor = { r:0, g:0, b:0, a:0 };

		return this;
	}


	setClearColor(r=0, g=0, b=0, a=0) {
		this._clearColor.r = r;
		this._clearColor.g = g;
		this._clearColor.b = b;
		this._clearColor.a = a;
		return this;
	}


	useProgram(vs, fs) {
		if(vs instanceof GLShader) {
			this._shader = vs;
		} else {
			this._shader = new GLShader(vs, fs);	
		}
		
		return this;
	}


	setMesh(mMesh) {
		this._mesh = mMesh;
		return this;
	}


	createMesh(mType) {
		this._mesh = new Mesh(mType);
		return this;
	}


	bufferVertex(mArrayVertices) {
		if(!this._mesh) {
			this._mesh = new Mesh();
		}
		this._mesh.bufferVertex(mArrayVertices);
		return this;
	}


	bufferTexCoord(mArrayTexCoords) {
		if(!this._mesh) {
			this._mesh = new Mesh();
		}
		this._mesh.bufferTexCoord(mArrayTexCoords);
		return this;
	}


	bufferNormal(mArrayNormals) {
		if(!this._mesh) {
			this._mesh = new Mesh();
		}
		this._mesh.bufferNormal(mArrayNormals);
		return this;
	}


	bufferIndex(mIndices) {
		if(!this._mesh) {
			this._mesh = new Mesh();
		}
		this._mesh.bufferIndex(mIndices);
		return this;
	}

	bufferInstance(mData, mName) {
		if(!this._mesh) {
			console.warn('Need to create mesh first');
			return this;
		}

		this._mesh.bufferInstance(mData, mName);

		return this;
	}


	bufferData(mArrayData, mName) {
		if(!this._mesh) {
			this._mesh = new Mesh();
		}
		this._mesh.bufferData(mArrayData, mName);
		return this;
	}
	

	uniform(name, type, value) {
		this._uniforms[name] = {
			type,
			value
		};
		
		return this;
	}


	uniformTexture(name, texture, index) {
		if(index !== undefined) {
			this._uniformTextures[index] = {
				name,
				texture
			};	
		} else {
			this._uniformTextures.push({
				name,
				texture
			});
		}
		

		return this;
	}


	bindFrameBuffer(fbo) {
		this._fbo = fbo;
		return this;
	}


	draw() {
		if(!this._shader) {	return;	}
		if(!this._mesh) {	return;	}


		if(this._fbo) {
			const { r, g, b, a } = this._clearColor;
			this._fbo.bind();
			GL.clear(r, g, b, a);
		}

		this._shader.bind();
		for(const s in this._uniforms) {
			const o = this._uniforms[s];
			this._shader.uniform(s, o.type, o.value);
		}

		this._uniformTextures.forEach((o, i) => {
			if(o !== undefined) {
				this._shader.uniform(o.name, 'uniform1i', i);
				o.texture.bind(i);	
			}
		});

		GL.draw(this._mesh);

		if(this._fbo) {
			this._fbo.unbind();
		}

		return this;
	}


	get shader() {
		return this._shader;
	}

	get framebuffer() {
		return this._fbo;
	}
}

export default Draw;