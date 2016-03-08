// Perlin  1.0
// Ported from java (http://mrl.nyu.edu/~perlin/noise/) by Ron Valstar (http://www.sjeiti.com/)
// and some help from http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
// AS3 optimizations by Mario Klingemann http://www.quasimondo.com
// then ported to js by Ron Valstar
if (!this.Perlin) {
	var Perlin = function() {

		var oRng = Math;

		var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

		var iOctaves = 1;
		var fPersistence = 0.5;
		
		var aOctFreq; // frequency per octave
		var aOctPers; // persistence per octave
		var fPersMax; // 1 / max persistence

		var iXoffset;
		var iYoffset;
		var iZoffset;

		// octFreqPers
		var octFreqPers = function octFreqPers() {
			var fFreq, fPers;
			aOctFreq = [];
			aOctPers = [];
			fPersMax = 0;
			for (var i=0;i<iOctaves;i++) {
				fFreq = Math.pow(2,i);
				fPers = Math.pow(fPersistence,i);
				fPersMax += fPers;
				aOctFreq.push( fFreq );
				aOctPers.push( fPers );
			}
			fPersMax = 1 / fPersMax;
		};
		// setOffset
		var setOffset = function setOffset(n) {
			iXoffset = Math.floor(oRng.random()*256) * 1;
			iYoffset = Math.floor(oRng.random()*256) * 1;
			iZoffset = Math.floor(oRng.random()*256) * 1;
		};
		// init
		setOffset();
		octFreqPers();
		//
		// return
		return {
			 noise: function(x,y,z) {

				x = x||0;
				y = y||0;
				z = z||0;

				var fResult = 0;
				var fFreq, fPers;
				var xf, yf, zf, u, v, w, xx, yy, zz;
				var x1, y1, z1;
				var X, Y, Z, A, B, AA, AB, BA, BB, hash;
				var g1, g2, g3, g4, g5, g6, g7, g8;

				x += iXoffset;
				y += iYoffset;
				z += iZoffset;

				for (var i=0;i<iOctaves;i++) {
					fFreq = aOctFreq[i];
					fPers = aOctPers[i];

					xx = x * fFreq;
					yy = y * fFreq;
					zz = z * fFreq;

					xf = Math.floor(xx);
					yf = Math.floor(yy);
					zf = Math.floor(zz);

					X = Math.floor(xf & 255);
					Y = Math.floor(yf & 255);
					Z = Math.floor(zf & 255);

					xx -= xf;
					yy -= yf;
					zz -= zf;

					u = xx * xx * xx * (xx * (xx*6 - 15) + 10);
					v = yy * yy * yy * (yy * (yy*6 - 15) + 10);
					w = zz * zz * zz * (zz * (zz*6 - 15) + 10);

					A  = Math.round(p[X]) + Y;
					AA = Math.round(p[A]) + Z;
					AB = Math.round(p[Math.round(A+1)]) + Z;
					B  = Math.round(p[Math.round(X+1)]) + Y;
					BA = Math.round(p[B]) + Z;
					BB = Math.round(p[Math.round(B+1)]) + Z;

					x1 = xx-1;
					y1 = yy-1;
					z1 = zz-1;

					hash = Math.round(p[Math.round(BB+1)]) & 15;
					g1 = ((hash&1) === 0 ? (hash<8 ? x1 : y1) : (hash<8 ? -x1 : -y1)) + ((hash&2) === 0 ? hash<4 ? y1 : ( hash===12 ? x1 : z1 ) : hash<4 ? -y1 : ( hash===14 ? -x1 : -z1 ));

					hash = Math.round(p[Math.round(AB+1)]) & 15;
					g2 = ((hash&1) === 0 ? (hash<8 ? xx : y1) : (hash<8 ? -xx : -y1)) + ((hash&2) === 0 ? hash<4 ? y1 : ( hash===12 ? xx : z1 ) : hash<4 ? -y1 : ( hash===14 ? -xx : -z1 ));

					hash = Math.round(p[Math.round(BA+1)]) & 15;
					g3 = ((hash&1) === 0 ? (hash<8 ? x1 : yy) : (hash<8 ? -x1 : -yy)) + ((hash&2) === 0 ? hash<4 ? yy : ( hash===12 ? x1 : z1 ) : hash<4 ? -yy : ( hash===14 ? -x1 : -z1 ));

					hash = Math.round(p[Math.round(AA+1)]) & 15;
					g4 = ((hash&1) === 0 ? (hash<8 ? xx : yy) : (hash<8 ? -xx : -yy)) + ((hash&2) === 0 ? hash<4 ? yy : ( hash===12 ? xx : z1 ) : hash<4 ? -yy : ( hash===14 ? -xx : -z1 ));

					hash = Math.round(p[BB]) & 15;
					g5 = ((hash&1) === 0 ? (hash<8 ? x1 : y1) : (hash<8 ? -x1 : -y1)) + ((hash&2) === 0 ? hash<4 ? y1 : ( hash===12 ? x1 : zz ) : hash<4 ? -y1 : ( hash===14 ? -x1 : -zz ));

					hash = Math.round(p[AB]) & 15;
					g6 = ((hash&1) === 0 ? (hash<8 ? xx : y1) : (hash<8 ? -xx : -y1)) + ((hash&2) === 0 ? hash<4 ? y1 : ( hash===12 ? xx : zz ) : hash<4 ? -y1 : ( hash===14 ? -xx : -zz ));

					hash = Math.round(p[BA]) & 15;
					g7 = ((hash&1) === 0 ? (hash<8 ? x1 : yy) : (hash<8 ? -x1 : -yy)) + ((hash&2) === 0 ? hash<4 ? yy : ( hash===12 ? x1 : zz ) : hash<4 ? -yy : ( hash===14 ? -x1 : -zz ));

					hash = Math.round(p[AA]) & 15;
					g8 = ((hash&1) === 0 ? (hash<8 ? xx : yy) : (hash<8 ? -xx : -yy)) + ((hash&2) === 0 ? hash<4 ? yy : ( hash===12 ? xx : zz ) : hash<4 ? -yy : ( hash===14 ? -xx : -zz ));

					g2 += u * (g1 - g2);
					g4 += u * (g3 - g4);
					g6 += u * (g5 - g6);
					g8 += u * (g7 - g8);

					g4 += v * (g2 - g4);
					g8 += v * (g6 - g8);

					fResult += ( (g8 + w * (g4 - g8))) * fPers;
				}

				return ( fResult * fPersMax + 1 ) * 0.5;
			},noiseDetail: function(octaves,falloff) {
				iOctaves = octaves||iOctaves;
				fPersistence = falloff||fPersistence;
				octFreqPers();
			},setRng: function(r) {
				oRng = r;
				setOffset();
				octFreqPers();
			},toString: function() {
				return "[object Perlin "+iOctaves+" "+fPersistence+"]";
			},setOffset: function(x, y, z) {
				iXoffset = x;
				iYoffset = y;
				iZoffset = z;
			}
		};
	}();
}