import * as PIXI from 'pixi.js';
import { Resource } from 'resource-loader';
import objParser from './objParser';

PIXI.utils.geometryCache = {};
PIXI.mesh.Geometry.from = function(url){


	return PIXI.utils.geometryCache[url];
}

export default function ()
{
    return function objLoader(resource, next)
    {
        // create a new texture if the data is an Image object
        if (resource.data && resource.type === Resource.TYPE.TEXT)
        {
        	var geometry = objParser(resource.data);
        	resource.geometry = geometry;
        	PIXI.utils.geometryCache[resource.url] = geometry;
        }

        next();
    };
}
