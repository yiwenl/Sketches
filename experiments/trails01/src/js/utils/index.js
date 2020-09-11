// index.js

export { saveImage } from './saveImage';
export { saveJson } from './saveJson';
export { resize } from './resizeCanavs';

export const definesToString = function(defines) {
    let outStr = '';
    for (const def in defines) {
    	if(defines[def]) {
    		outStr += '#define ' + def + ' ' + defines[def] + '\n';	
    	}
        
    }
    return outStr;
};