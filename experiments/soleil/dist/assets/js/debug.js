/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/ 	var parentHotUpdateCallback = this["webpackHotUpdate"];
/******/ 	this["webpackHotUpdate"] = 
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	} ;
/******/ 	
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.type = "text/javascript";
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		head.appendChild(script);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest(requestTimeout) { // eslint-disable-line no-unused-vars
/******/ 		requestTimeout = requestTimeout || 10000;
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			if(typeof XMLHttpRequest === "undefined")
/******/ 				return reject(new Error("No browser support"));
/******/ 			try {
/******/ 				var request = new XMLHttpRequest();
/******/ 				var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 				request.open("GET", requestPath, true);
/******/ 				request.timeout = requestTimeout;
/******/ 				request.send(null);
/******/ 			} catch(err) {
/******/ 				return reject(err);
/******/ 			}
/******/ 			request.onreadystatechange = function() {
/******/ 				if(request.readyState !== 4) return;
/******/ 				if(request.status === 0) {
/******/ 					// timeout
/******/ 					reject(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 				} else if(request.status === 404) {
/******/ 					// no update available
/******/ 					resolve();
/******/ 				} else if(request.status !== 200 && request.status !== 304) {
/******/ 					// other failure
/******/ 					reject(new Error("Manifest request to " + requestPath + " failed."));
/******/ 				} else {
/******/ 					// success
/******/ 					try {
/******/ 						var update = JSON.parse(request.responseText);
/******/ 					} catch(e) {
/******/ 						reject(e);
/******/ 						return;
/******/ 					}
/******/ 					resolve(update);
/******/ 				}
/******/ 			};
/******/ 		});
/******/ 	}
/******/
/******/ 	
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "6fd31041a023e5ac6c3d"; // eslint-disable-line no-unused-vars
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if(me.children.indexOf(request) < 0)
/******/ 					me.children.push(request);
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name) && name !== "e") {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/ 	
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if(hotStatus === "prepare") {
/******/ 					if(!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 1;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if(!deferred) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve().then(function() {
/******/ 				return hotApply(hotApplyOnUpdate);
/******/ 			}).then(
/******/ 				function(result) {
/******/ 					deferred.resolve(result);
/******/ 				},
/******/ 				function(err) {
/******/ 					deferred.reject(err);
/******/ 				}
/******/ 			);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/ 	
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/ 	
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while(queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if(module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(!parent) continue;
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 	
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn("[HMR] unexpected require(" + result.moduleId + ") to disposed module");
/******/ 		};
/******/ 	
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				var result;
/******/ 				if(hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if(result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch(result.type) {
/******/ 					case "self-declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if(options.onDeclined)
/******/ 							options.onDeclined(result);
/******/ 						if(!options.ignoreDeclined)
/******/ 							abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if(options.onUnaccepted)
/******/ 							options.onUnaccepted(result);
/******/ 						if(!options.ignoreUnaccepted)
/******/ 							abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if(options.onAccepted)
/******/ 							options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if(options.onDisposed)
/******/ 							options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if(abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if(doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for(moduleId in result.outdatedDependencies) {
/******/ 						if(Object.prototype.hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
/******/ 							if(!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if(doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if(hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/ 	
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				if(module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for(j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if(idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				module = installedModules[moduleId];
/******/ 				moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				var callbacks = [];
/******/ 				for(i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 					dependency = moduleOutdatedDependencies[i];
/******/ 					cb = module.hot._acceptedDependencies[dependency];
/******/ 					if(callbacks.indexOf(cb) >= 0) continue;
/******/ 					callbacks.push(cb);
/******/ 				}
/******/ 				for(i = 0; i < callbacks.length; i++) {
/******/ 					cb = callbacks[i];
/******/ 					try {
/******/ 						cb(moduleOutdatedDependencies);
/******/ 					} catch(err) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "accept-errored",
/******/ 								moduleId: moduleId,
/******/ 								dependencyId: moduleOutdatedDependencies[i],
/******/ 								error: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err;
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err2) {
/******/ 						if(options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								orginalError: err
/******/ 							});
/******/ 						}
/******/ 						if(!options.ignoreErrored) {
/******/ 							if(!error)
/******/ 								error = err2;
/******/ 						}
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if(options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if(!options.ignoreErrored) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(20)(__webpack_require__.s = 20);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

!function(t,e){ true?module.exports=e():"function"==typeof define&&define.amd?define("alfrid",[],e):"object"==typeof exports?exports.alfrid=e():t.alfrid=e()}(this,function(){return function(t){function e(n){if(r[n])return r[n].exports;var a=r[n]={exports:{},id:n,loaded:!1};return t[n].call(a.exports,a,a.exports,e),a.loaded=!0,a.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}([function(t,e,r){t.exports=r(86)},function(t,e){"use strict";e.__esModule=!0,e.default=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}e.__esModule=!0;var a=r(118),i=n(a);e.default=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),(0,i.default)(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}()},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(8),l=n(s),f=r(114),h=n(f),c=r(113),d=n(c),v=r(115),_=n(v),m=r(116),p=n(m),M=r(66),x=(n(M),r(109)),g=n(x),E=void 0,b=function(){function t(){(0,i.default)(this,t),this.canvas,this._viewport=[0,0,0,0],this._enabledVertexAttribute=[],this.identityMatrix=l.default.mat4.create(),this._normalMatrix=l.default.mat3.create(),this._inverseModelViewMatrix=l.default.mat3.create(),this._modelMatrix=l.default.mat4.create(),this._matrix=l.default.mat4.create(),this._lastMesh=null,this._useWebGL2=!1,this._hasArrayInstance,this._extArrayInstance,this._hasCheckedExt=!1,l.default.mat4.identity(this.identityMatrix,this.identityMatrix),this.isMobile=!1,/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)&&(this.isMobile=!0)}return(0,o.default)(t,[{key:"init",value:function(t){var e=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];if(null===t||void 0===t)return void console.error("Canvas not exist");void 0!==this.canvas&&null!==this.canvas&&this.destroy(),this.canvas=t,this.setSize(window.innerWidth,window.innerHeight);var r=void 0;e.ignoreWebgl2?r=this.canvas.getContext("webgl",e)||this.canvas.getContext("experimental-webgl",e):(r=this.canvas.getContext("experimental-webgl2",e)||this.canvas.getContext("webgl2",e),r?this._useWebGL2=!0:r=this.canvas.getContext("webgl",e)||this.canvas.getContext("experimental-webgl",e)),console.log("Using WebGL 2 ?",this.webgl2),this.initWithGL(r)}},{key:"initWithGL",value:function(t){this.canvas||(this.canvas=t.canvas),E=this.gl=t,this.extensions={};for(var e=0;e<g.default.length;e++)this.extensions[g.default[e]]=E.getExtension(g.default[e]);(0,d.default)(),(0,h.default)(E,"OES_vertex_array_object"),(0,h.default)(E,"ANGLE_instanced_arrays"),(0,h.default)(E,"WEBGL_draw_buffers"),this.enable(this.DEPTH_TEST),this.enable(this.CULL_FACE),this.enable(this.BLEND),this.enableAlphaBlending()}},{key:"setViewport",value:function(t,e,r,n){var a=!1;t!==this._viewport[0]&&(a=!0),e!==this._viewport[1]&&(a=!0),r!==this._viewport[2]&&(a=!0),n!==this._viewport[3]&&(a=!0),a&&(E.viewport(t,e,r,n),this._viewport=[t,e,r,n])}},{key:"scissor",value:function(t,e,r,n){E.scissor(t,e,r,n)}},{key:"clear",value:function(t,e,r,n){E.clearColor(t,e,r,n),E.clear(E.COLOR_BUFFER_BIT|E.DEPTH_BUFFER_BIT)}},{key:"setMatrices",value:function(t){this.camera=t,this.rotate(this.identityMatrix)}},{key:"useShader",value:function(t){this.shader=t,this.shaderProgram=this.shader.shaderProgram}},{key:"rotate",value:function(t){l.default.mat4.copy(this._modelMatrix,t),l.default.mat4.multiply(this._matrix,this.camera.matrix,this._modelMatrix),l.default.mat3.fromMat4(this._normalMatrix,this._matrix),l.default.mat3.invert(this._normalMatrix,this._normalMatrix),l.default.mat3.transpose(this._normalMatrix,this._normalMatrix),l.default.mat3.fromMat4(this._inverseModelViewMatrix,this._matrix),l.default.mat3.invert(this._inverseModelViewMatrix,this._inverseModelViewMatrix)}},{key:"draw",value:function(t,e){if(t.length)for(var r=0;r<t.length;r++)this.draw(t[r]);else{t.bind(this.shaderProgram),void 0!==this.camera&&(this.shader.uniform("uProjectionMatrix","mat4",this.camera.projection),this.shader.uniform("uViewMatrix","mat4",this.camera.matrix)),this.shader.uniform("uModelMatrix","mat4",this._modelMatrix),this.shader.uniform("uNormalMatrix","mat3",this._normalMatrix),this.shader.uniform("uModelViewMatrixInverse","mat3",this._inverseModelViewMatrix);var n=t.drawType;void 0!==e&&(n=e),t.isInstanced?E.drawElementsInstanced(t.drawType,t.iBuffer.numItems,E.UNSIGNED_SHORT,0,t.numInstance):n===E.POINTS?E.drawArrays(n,0,t.vertexSize):E.drawElements(n,t.iBuffer.numItems,E.UNSIGNED_SHORT,0),t.unbind()}}},{key:"drawTransformFeedback",value:function(t){var e=t.meshSource,r=t.meshDestination,n=t.numPoints,a=t.transformFeedback;e.bind(this.shaderProgram),r.generateBuffers(this.shaderProgram),E.bindTransformFeedback(E.TRANSFORM_FEEDBACK,a),r.attributes.forEach(function(t,e){E.bindBufferBase(E.TRANSFORM_FEEDBACK_BUFFER,e,t.buffer)}),E.enable(E.RASTERIZER_DISCARD),E.beginTransformFeedback(E.POINTS),E.drawArrays(E.POINTS,0,n),E.endTransformFeedback(),E.disable(E.RASTERIZER_DISCARD),E.useProgram(null),E.bindBuffer(E.ARRAY_BUFFER,null),r.attributes.forEach(function(t,e){E.bindBufferBase(E.TRANSFORM_FEEDBACK_BUFFER,e,null)}),E.bindTransformFeedback(E.TRANSFORM_FEEDBACK,null),e.unbind()}},{key:"setSize",value:function(t,e){this._width=t,this._height=e,this.canvas.width=this._width,this.canvas.height=this._height,this._aspectRatio=this._width/this._height,E&&this.viewport(0,0,this._width,this._height)}},{key:"showExtensions",value:function(){console.log("Extensions : ",this.extensions);for(var t in this.extensions)this.extensions[t]&&console.log(t,":",this.extensions[t])}},{key:"checkExtension",value:function(t){return!!this.extensions[t]}},{key:"getExtension",value:function(t){return this.extensions[t]}},{key:"enableAlphaBlending",value:function(){E.blendFunc(E.SRC_ALPHA,E.ONE_MINUS_SRC_ALPHA)}},{key:"enableAdditiveBlending",value:function(){E.blendFunc(E.ONE,E.ONE)}},{key:"enable",value:function(t){E.enable(t)}},{key:"disable",value:function(t){E.disable(t)}},{key:"viewport",value:function(t,e,r,n){this.setViewport(t,e,r,n)}},{key:"destroy",value:function(){if(this.canvas.parentNode)try{this.canvas.parentNode.removeChild(this.canvas)}catch(t){console.log("Error : ",t)}this.canvas=null}},{key:"FLOAT",get:function(){return(0,_.default)()}},{key:"HALF_FLOAT",get:function(){return(0,p.default)()}},{key:"width",get:function(){return this._width}},{key:"height",get:function(){return this._height}},{key:"aspectRatio",get:function(){return this._aspectRatio}},{key:"webgl2",get:function(){return this._useWebGL2}}]),t}(),y=new b;e.default=y,t.exports=e.default},function(t,e,r){t.exports={"default":r(128),__esModule:!0}},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}e.__esModule=!0;var a=r(120),i=n(a),u=r(117),o=n(u),s=r(38),l=n(s);e.default=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+("undefined"==typeof e?"undefined":(0,l.default)(e)));t.prototype=(0,o.default)(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(i.default?(0,i.default)(t,e):t.__proto__=e)}},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}e.__esModule=!0;var a=r(38),i=n(a);e.default=function(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!==("undefined"==typeof e?"undefined":(0,i.default)(e))&&"function"!=typeof e?t:e}},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(38),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(3),h=n(f),c=(r(166),function(t,e){if(t.length!==e.length)return!1;for(var r=0;r<t.length;r++)if(t[r]!==e[r])return!1;return!0}),d=function(t){for(var e=t.split("\n"),r=0;r<e.length;r++)e[r]=r+1+": "+e[r];return e.join("\n")},v=function(t){return t.slice?t.slice(0):new Float32Array(t)},_=void 0,m=r(53),p=r(170),M={"float":"uniform1f",vec2:"uniform2fv",vec3:"uniform3fv",vec4:"uniform4fv","int":"uniform1i",mat3:"uniformMatrix3fv",mat4:"uniformMatrix4fv"},x=function(){function t(){var e=arguments.length<=0||void 0===arguments[0]?m:arguments[0],r=arguments.length<=1||void 0===arguments[1]?p:arguments[1],n=arguments[2];(0,o.default)(this,t),_=h.default.gl,this.parameters=[],this.uniformTextures=[],this._varyings=n,e||(e=m),r||(r=m);var a=this._createShaderProgram(e,!0),i=this._createShaderProgram(r,!1);this._attachShaderProgram(a,i)}return(0,l.default)(t,[{key:"bind",value:function(){h.default.shader!==this&&(_.useProgram(this.shaderProgram),h.default.useShader(this),this.uniformTextures=[])}},{key:"uniform",value:function(t,e,r){if("object"===("undefined"==typeof t?"undefined":(0,i.default)(t)))return void this.uniformObject(t);for(var n=M[e]||e,a=!1,u=void 0,o=-1,s=0;s<this.parameters.length;s++)if(u=this.parameters[s],u.name===t){a=!0,o=s;break}var l=!1;if(a?(this.shaderProgram[t]=u.uniformLoc,l=u.isNumber):(l="uniform1i"===n||"uniform1f"===n,this.shaderProgram[t]=_.getUniformLocation(this.shaderProgram,t),l?this.parameters.push({name:t,type:n,value:r,uniformLoc:this.shaderProgram[t],isNumber:l}):this.parameters.push({name:t,type:n,value:v(r),uniformLoc:this.shaderProgram[t],isNumber:l}),o=this.parameters.length-1),this.parameters[o].uniformLoc)if(-1===n.indexOf("Matrix"))if(l){var f=this.parameters[o].value!==r||!a;f&&(_[n](this.shaderProgram[t],r),this.parameters[o].value=r)}else c(this.parameters[o].value,r)&&a||(_[n](this.shaderProgram[t],r),this.parameters[o].value=v(r));else c(this.parameters[o].value,r)&&a||(_[n](this.shaderProgram[t],!1,r),this.parameters[o].value=v(r))}},{key:"uniformObject",value:function(e){for(var r in e){var n=e[r],a=t.getUniformType(n);if(n.concat&&n[0].concat){for(var i=[],u=0;u<n.length;u++)i=i.concat(n[u]);n=i}this.uniform(r,a,n)}}},{key:"_createShaderProgram",value:function(t,e){var r=e?h.default.VERTEX_SHADER:h.default.FRAGMENT_SHADER,n=_.createShader(r);return _.shaderSource(n,t),_.compileShader(n),_.getShaderParameter(n,_.COMPILE_STATUS)?n:(console.warn("Error in Shader : ",_.getShaderInfoLog(n)),console.log(d(t)),null)}},{key:"_attachShaderProgram",value:function(t,e){this.shaderProgram=_.createProgram(),_.attachShader(this.shaderProgram,t),_.attachShader(this.shaderProgram,e),_.deleteShader(t),_.deleteShader(e),this._varyings&&(console.log("Transform feedback setup : ",this._varyings),_.transformFeedbackVaryings(this.shaderProgram,this._varyings,_.SEPARATE_ATTRIBS)),_.linkProgram(this.shaderProgram)}}]),t}();x.getUniformType=function(t){var e=!!t.concat,r=function(t){return 9===t.length?"uniformMatrix3fv":16===t.length?"uniformMatrix4fv":"vec"+t.length};return e?r(t[0].concat?t[0]:t):"float"},e.default=x,t.exports=e.default},function(t,e,r){e.glMatrix=r(11),e.mat2=r(161),e.mat2d=r(162),e.mat3=r(79),e.mat4=r(163),e.quat=r(164),e.vec2=r(165),e.vec3=r(80),e.vec4=r(81)},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(3),l=n(s),f=function(){function t(e,r){(0,i.default)(this,t),this._mesh=e,this._shader=r}return(0,o.default)(t,[{key:"draw",value:function(){this._shader.bind(),l.default.draw(this.mesh)}},{key:"mesh",get:function(){return this._mesh}},{key:"shader",get:function(){return this._shader}}]),t}();e.default=f,t.exports=e.default},function(t,e){var r=t.exports={version:"2.4.0"};"number"==typeof __e&&(__e=r)},function(t,e){var r={};r.EPSILON=1e-6,r.ARRAY_TYPE="undefined"!=typeof Float32Array?Float32Array:Array,r.RANDOM=Math.random,r.ENABLE_SIMD=!1,r.SIMD_AVAILABLE=r.ARRAY_TYPE===Float32Array&&"SIMD"in this,r.USE_SIMD=r.ENABLE_SIMD&&r.SIMD_AVAILABLE,r.setMatrixArrayType=function(t){r.ARRAY_TYPE=t};var n=Math.PI/180;r.toRadian=function(t){return t*n},r.equals=function(t,e){return Math.abs(t-e)<=r.EPSILON*Math.max(1,Math.abs(t),Math.abs(e))},t.exports=r},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(3),l=n(s),f=r(8),h=r(66),c=n(h),d=void 0,v=35044,_=function(t){var e=void 0;return void 0!==t.buffer?e=t.buffer:(e=d.createBuffer(),t.buffer=e),e},m=function(t,e){for(var r=[],n=0;n<t.length;n+=e){for(var a=[],i=0;e>i;i++)a.push(t[n+i]);r.push(a)}return r},p=function(){function t(){var e=arguments.length<=0||void 0===arguments[0]?4:arguments[0],r=arguments.length<=1||void 0===arguments[1]?!0:arguments[1];(0,i.default)(this,t),d=l.default.gl,this.drawType=e,this._attributes=[],this._numInstance=-1,this._enabledVertexAttribute=[],this._indices=[],this._faces=[],this._bufferChanged=[],this._hasIndexBufferChanged=!1,this._hasVAO=!1,this._isInstanced=!1,this._extVAO=!!l.default.gl.createVertexArray,this._useVAO=!!this._extVAO&&r}return(0,o.default)(t,[{key:"bufferVertex",value:function(t){var e=arguments.length<=1||void 0===arguments[1]?v:arguments[1];return this.bufferData(t,"aVertexPosition",3,e),this.normals.length<this.vertices.length&&this.bufferNormal(t,e),this}},{key:"bufferTexCoord",value:function(t){var e=arguments.length<=1||void 0===arguments[1]?v:arguments[1];return this.bufferData(t,"aTextureCoord",2,e),this}},{key:"bufferNormal",value:function(t){var e=arguments.length<=1||void 0===arguments[1]?v:arguments[1];return this.bufferData(t,"aNormal",3,e),this}},{key:"bufferIndex",value:function(t){var e=arguments.length<=1||void 0===arguments[1]?!1:arguments[1];return this._drawType=e?d.DYNAMIC_DRAW:d.STATIC_DRAW,this._indices=new Uint16Array(t),this._numItems=this._indices.length,this}},{key:"bufferFlattenData",value:function(t,e,r){var n=arguments.length<=3||void 0===arguments[3]?v:arguments[3],a=arguments.length<=4||void 0===arguments[4]?!1:arguments[4],i=m(t,r);return this.bufferData(i,e,r,n=v,a=!1),this}},{key:"bufferData",value:function e(t,r,n){var a=arguments.length<=3||void 0===arguments[3]?v:arguments[3],i=arguments.length<=4||void 0===arguments[4]?!1:arguments[4],u=0,o=a,e=[];for(n||(n=t[0].length),this._isInstanced=i||this._isInstanced,u=0;u<t.length;u++)for(var s=0;s<t[u].length;s++)e.push(t[u][s]);var l=new Float32Array(e),f=this.getAttribute(r);return f?(f.itemSize=n,f.dataArray=l,f.source=t):this._attributes.push({name:r,source:t,itemSize:n,drawType:o,dataArray:l,isInstanced:i}),this._bufferChanged.push(r),this}},{key:"bufferInstance",value:function(t,e){if(!l.default.gl.vertexAttribDivisor)return void console.error("Extension : ANGLE_instanced_arrays is not supported with this device !");var r=t[0].length;this._numInstance=t.length,this.bufferData(t,e,r,v,!0)}},{key:"bind",value:function(t){this.generateBuffers(t),this.hasVAO?d.bindVertexArray(this.vao):(this.attributes.forEach(function(t){d.bindBuffer(d.ARRAY_BUFFER,t.buffer);var e=t.attrPosition;d.vertexAttribPointer(e,t.itemSize,d.FLOAT,!1,0,0),t.isInstanced&&d.vertexAttribDivisor(e,1)}),d.bindBuffer(d.ELEMENT_ARRAY_BUFFER,this.iBuffer))}},{key:"generateBuffers",value:function(t){var e=this;0!=this._bufferChanged.length&&(this._useVAO?(this._vao||(this._vao=d.createVertexArray()),d.bindVertexArray(this._vao),this._attributes.forEach(function(r){if(-1!==e._bufferChanged.indexOf(r.name)){var n=_(r);d.bindBuffer(d.ARRAY_BUFFER,n),d.bufferData(d.ARRAY_BUFFER,r.dataArray,r.drawType);var a=(0,c.default)(d,t,r.name);d.enableVertexAttribArray(a),d.vertexAttribPointer(a,r.itemSize,d.FLOAT,!1,0,0),r.attrPosition=a,r.isInstanced&&d.vertexAttribDivisor(a,1)}}),this._updateIndexBuffer(),d.bindVertexArray(null),this._hasVAO=!0):(this._attributes.forEach(function(r){if(-1!==e._bufferChanged.indexOf(r.name)){var n=_(r);d.bindBuffer(d.ARRAY_BUFFER,n),d.bufferData(d.ARRAY_BUFFER,r.dataArray,r.drawType);var a=(0,c.default)(d,t,r.name);d.enableVertexAttribArray(a),d.vertexAttribPointer(a,r.itemSize,d.FLOAT,!1,0,0),r.attrPosition=a,r.isInstanced&&d.vertexAttribDivisor(a,1)}}),this._updateIndexBuffer()),this._hasIndexBufferChanged=!1,this._bufferChanged=[])}},{key:"unbind",value:function(){this._useVAO&&d.bindVertexArray(null),this._attributes.forEach(function(t){t.isInstanced&&d.vertexAttribDivisor(t.attrPosition,0)})}},{key:"_updateIndexBuffer",value:function(){this._hasIndexBufferChanged||(this.iBuffer||(this.iBuffer=d.createBuffer()),d.bindBuffer(d.ELEMENT_ARRAY_BUFFER,this.iBuffer),d.bufferData(d.ELEMENT_ARRAY_BUFFER,this._indices,this._drawType),this.iBuffer.itemSize=1,this.iBuffer.numItems=this._numItems)}},{key:"computeNormals",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!1:arguments[0];this.generateFaces(),t?this._computeFaceNormals():this._computeVertexNormals()}},{key:"_computeFaceNormals",value:function(){for(var t=void 0,e=void 0,r=[],n=0;n<this._indices.length;n+=3){t=n/3,e=this._faces[t];var a=e.normal;r[e.indices[0]]=a,r[e.indices[1]]=a,r[e.indices[2]]=a}this.bufferNormal(r)}},{key:"_computeVertexNormals",value:function(){for(var t=void 0,e=f.vec3.create(),r=[],n=this.vertices,a=0;a<n.length;a++){f.vec3.set(e,0,0,0);for(var i=0;i<this._faces.length;i++)t=this._faces[i],t.indices.indexOf(a)>=0&&(e[0]+=t.normal[0],e[1]+=t.normal[1],e[2]+=t.normal[2]);f.vec3.normalize(e,e),r.push([e[0],e[1],e[2]])}this.bufferNormal(r)}},{key:"generateFaces",value:function(){for(var t=void 0,e=void 0,r=void 0,n=void 0,a=void 0,i=void 0,u=(f.vec3.create(),f.vec3.create(),f.vec3.create(),this.vertices),o=0;o<this._indices.length;o+=3){t=this._indices[o],e=this._indices[o+1],r=this._indices[o+2],n=u[t],a=u[e],i=u[r];var s={indices:[t,e,r],vertices:[n,a,i]};this._faces.push(s)}}},{key:"getAttribute",value:function(t){return this._attributes.find(function(e){return e.name===t})}},{key:"getSource",value:function(t){var e=this.getAttribute(t);return e?e.source:[]}},{key:"vertices",get:function(){return this.getSource("aVertexPosition")}},{key:"normals",get:function(){return this.getSource("aNormal")}},{key:"coords",get:function(){return this.getSource("aTextureCoord")}},{key:"indices",get:function(){return this._indices}},{key:"vertexSize",get:function(){return this.vertices.length}},{key:"faces",get:function(){return this._faces}},{key:"attributes",get:function(){return this._attributes}},{key:"hasVAO",get:function(){return this._hasVAO}},{key:"vao",get:function(){return this._vao}},{key:"numInstance",get:function(){return this._numInstance}},{key:"isInstanced",get:function(){return this._isInstanced}}]),t}();e.default=p,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}e.__esModule=!0;var a=r(4),i=n(a),u=r(119),o=n(u);e.default=function s(t,e,r){null===t&&(t=Function.prototype);var n=(0,o.default)(t,e);if(void 0===n){var a=(0,i.default)(t);return null===a?void 0:s(a,e,r)}if("value"in n)return n.value;var u=n.get;if(void 0!==u)return u.call(r)}},function(t,e){var r=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=r)},function(t,e,r){var n=r(137),a=r(39);t.exports=function(t){return n(a(t))}},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(12),i=n(a),u={},o=void 0;u.plane=function(t,e,r){for(var n=arguments.length<=3||void 0===arguments[3]?"xy":arguments[3],a=arguments.length<=4||void 0===arguments[4]?4:arguments[4],u=[],o=[],s=[],l=[],f=t/r,h=e/r,c=1/r,d=.5*-t,v=.5*-e,_=0,m=0;r>m;m++)for(var p=0;r>p;p++){var M=f*m+d,x=h*p+v,g=m/r,E=p/r;"xz"===n?(u.push([M,0,x+h]),u.push([M+f,0,x+h]),u.push([M+f,0,x]),u.push([M,0,x]),o.push([g,1-(E+c)]),o.push([g+c,1-(E+c)]),o.push([g+c,1-E]),o.push([g,1-E]),l.push([0,1,0]),l.push([0,1,0]),l.push([0,1,0]),l.push([0,1,0])):"yz"===n?(u.push([0,x,M]),u.push([0,x,M+f]),u.push([0,x+h,M+f]),u.push([0,x+h,M]),o.push([g,E]),o.push([g+c,E]),o.push([g+c,E+c]),o.push([g,E+c]),l.push([1,0,0]),l.push([1,0,0]),l.push([1,0,0]),l.push([1,0,0])):(u.push([M,x,0]),u.push([M+f,x,0]),u.push([M+f,x+h,0]),u.push([M,x+h,0]),o.push([g,E]),o.push([g+c,E]),o.push([g+c,E+c]),o.push([g,E+c]),l.push([0,0,1]),l.push([0,0,1]),l.push([0,0,1]),l.push([0,0,1])),s.push(4*_+0),s.push(4*_+1),s.push(4*_+2),s.push(4*_+0),s.push(4*_+2),s.push(4*_+3),_++}var b=new i.default(a);return b.bufferVertex(u),b.bufferTexCoord(o),b.bufferIndex(s),b.bufferNormal(l),b},u.sphere=function(t,e){function r(r,n){var a=arguments.length<=2||void 0===arguments[2]?!1:arguments[2],i=r/e*Math.PI-.5*Math.PI,u=n/e*Math.PI*2,o=a?1:t,s=[];s[1]=Math.sin(i)*o;var l=Math.cos(i)*o;s[0]=Math.cos(u)*l,s[2]=Math.sin(u)*l;var f=1e4;return s[0]=Math.floor(s[0]*f)/f,s[1]=Math.floor(s[1]*f)/f,s[2]=Math.floor(s[2]*f)/f,s}for(var n=arguments.length<=2||void 0===arguments[2]?!1:arguments[2],a=arguments.length<=3||void 0===arguments[3]?4:arguments[3],u=[],o=[],s=[],l=[],f=1/e,h=0,c=0;e>c;c++)for(var d=0;e>d;d++){u.push(r(c,d)),u.push(r(c+1,d)),u.push(r(c+1,d+1)),u.push(r(c,d+1)),l.push(r(c,d,!0)),l.push(r(c+1,d,!0)),l.push(r(c+1,d+1,!0)),l.push(r(c,d+1,!0));var v=d/e,_=c/e;o.push([1-v,_]),o.push([1-v,_+f]),o.push([1-v-f,_+f]),o.push([1-v-f,_]),s.push(4*h+0),s.push(4*h+1),s.push(4*h+2),s.push(4*h+0),s.push(4*h+2),s.push(4*h+3),h++}n&&s.reverse();var m=new i.default(a);return m.bufferVertex(u),m.bufferTexCoord(o),m.bufferIndex(s),m.bufferNormal(l),m},u.cube=function(t,e,r){var n=arguments.length<=3||void 0===arguments[3]?4:arguments[3];e=e||t,r=r||t;var a=t/2,u=e/2,o=r/2,s=[],l=[],f=[],h=[],c=0;s.push([-a,u,-o]),s.push([a,u,-o]),s.push([a,-u,-o]),s.push([-a,-u,-o]),h.push([0,0,-1]),h.push([0,0,-1]),h.push([0,0,-1]),h.push([0,0,-1]),l.push([0,0]),l.push([1,0]),l.push([1,1]),l.push([0,1]),f.push(4*c+0),f.push(4*c+1),f.push(4*c+2),f.push(4*c+0),f.push(4*c+2),f.push(4*c+3),c++,s.push([a,u,-o]),s.push([a,u,o]),s.push([a,-u,o]),s.push([a,-u,-o]),h.push([1,0,0]),h.push([1,0,0]),h.push([1,0,0]),h.push([1,0,0]),l.push([0,0]),l.push([1,0]),l.push([1,1]),l.push([0,1]),f.push(4*c+0),f.push(4*c+1),f.push(4*c+2),f.push(4*c+0),f.push(4*c+2),f.push(4*c+3),c++,s.push([a,u,o]),s.push([-a,u,o]),s.push([-a,-u,o]),s.push([a,-u,o]),h.push([0,0,1]),h.push([0,0,1]),h.push([0,0,1]),h.push([0,0,1]),l.push([0,0]),l.push([1,0]),l.push([1,1]),l.push([0,1]),f.push(4*c+0),f.push(4*c+1),f.push(4*c+2),f.push(4*c+0),f.push(4*c+2),f.push(4*c+3),c++,s.push([-a,u,o]),s.push([-a,u,-o]),s.push([-a,-u,-o]),s.push([-a,-u,o]),h.push([-1,0,0]),h.push([-1,0,0]),h.push([-1,0,0]),h.push([-1,0,0]),l.push([0,0]),l.push([1,0]),l.push([1,1]),l.push([0,1]),f.push(4*c+0),f.push(4*c+1),f.push(4*c+2),f.push(4*c+0),f.push(4*c+2),f.push(4*c+3),c++,s.push([a,u,-o]),s.push([-a,u,-o]),s.push([-a,u,o]),s.push([a,u,o]),h.push([0,1,0]),h.push([0,1,0]),h.push([0,1,0]),h.push([0,1,0]),l.push([0,0]),l.push([1,0]),l.push([1,1]),l.push([0,1]),f.push(4*c+0),f.push(4*c+1),f.push(4*c+2),f.push(4*c+0),f.push(4*c+2),f.push(4*c+3),c++,s.push([a,-u,o]),s.push([-a,-u,o]),s.push([-a,-u,-o]),s.push([a,-u,-o]),h.push([0,-1,0]),h.push([0,-1,0]),h.push([0,-1,0]),h.push([0,-1,0]),l.push([0,0]),l.push([1,0]),l.push([1,1]),l.push([0,1]),f.push(4*c+0),f.push(4*c+1),f.push(4*c+2),f.push(4*c+0),f.push(4*c+2),f.push(4*c+3),c++;var d=new i.default(n);return d.bufferVertex(s),d.bufferTexCoord(l),d.bufferIndex(f),d.bufferNormal(h),d},u.skybox=function(t){var e=arguments.length<=1||void 0===arguments[1]?4:arguments[1],r=[],n=[],a=[],u=[],o=0;r.push([t,t,-t]),r.push([-t,t,-t]),r.push([-t,-t,-t]),r.push([t,-t,-t]),u.push([0,0,-1]),u.push([0,0,-1]),u.push([0,0,-1]),u.push([0,0,-1]),n.push([0,0]),n.push([1,0]),n.push([1,1]),n.push([0,1]),a.push(4*o+0),a.push(4*o+1),a.push(4*o+2),a.push(4*o+0),a.push(4*o+2),a.push(4*o+3),o++,r.push([t,-t,-t]),r.push([t,-t,t]),r.push([t,t,t]),r.push([t,t,-t]),u.push([1,0,0]),u.push([1,0,0]),u.push([1,0,0]),u.push([1,0,0]),n.push([0,0]),n.push([1,0]),n.push([1,1]),n.push([0,1]),a.push(4*o+0),a.push(4*o+1),a.push(4*o+2),a.push(4*o+0),a.push(4*o+2),a.push(4*o+3),o++,r.push([-t,t,t]),r.push([t,t,t]),r.push([t,-t,t]),r.push([-t,-t,t]),u.push([0,0,1]),u.push([0,0,1]),u.push([0,0,1]),u.push([0,0,1]),n.push([0,0]),n.push([1,0]),n.push([1,1]),n.push([0,1]),a.push(4*o+0),a.push(4*o+1),a.push(4*o+2),a.push(4*o+0),a.push(4*o+2),a.push(4*o+3),o++,r.push([-t,-t,t]),r.push([-t,-t,-t]),r.push([-t,t,-t]),r.push([-t,t,t]),u.push([-1,0,0]),u.push([-1,0,0]),u.push([-1,0,0]),u.push([-1,0,0]),n.push([0,0]),n.push([1,0]),n.push([1,1]),n.push([0,1]),a.push(4*o+0),a.push(4*o+1),a.push(4*o+2),a.push(4*o+0),a.push(4*o+2),a.push(4*o+3),o++,r.push([t,t,t]),r.push([-t,t,t]),r.push([-t,t,-t]),r.push([t,t,-t]),u.push([0,1,0]),u.push([0,1,0]),u.push([0,1,0]),u.push([0,1,0]),n.push([0,0]),n.push([1,0]),n.push([1,1]),n.push([0,1]),a.push(4*o+0),a.push(4*o+1),a.push(4*o+2),a.push(4*o+0),a.push(4*o+2),a.push(4*o+3),o++,r.push([t,-t,-t]),r.push([-t,-t,-t]),r.push([-t,-t,t]),r.push([t,-t,t]),u.push([0,-1,0]),u.push([0,-1,0]),u.push([0,-1,0]),u.push([0,-1,0]),n.push([0,0]),n.push([1,0]),n.push([1,1]),n.push([0,1]),a.push(4*o+0),a.push(4*o+1),a.push(4*o+2),a.push(4*o+0),a.push(4*o+2),a.push(4*o+3);var s=new i.default(e);return s.bufferVertex(r),s.bufferTexCoord(n),s.bufferIndex(a),s.bufferNormal(u),s},u.bigTriangle=function(){if(!o){var t=[2,1,0],e=[[-1,-1],[-1,4],[4,-1]];o=new i.default,o.bufferData(e,"aPosition",2),o.bufferIndex(t)}return o},e.default=u,t.exports=e.default},function(t,e,r){t.exports=!r(25)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e){var r={}.hasOwnProperty;t.exports=function(t,e){return r.call(t,e)}},function(t,e,r){var n=r(24),a=r(70),i=r(50),u=Object.defineProperty;e.f=r(17)?Object.defineProperty:function(t,e,r){if(n(t),e=i(e,!0),n(r),a)try{return u(t,e,r)}catch(o){}if("get"in r||"set"in r)throw TypeError("Accessors not supported!");return"value"in r&&(t[e]=r.value),t}},function(t,e,r){var n=r(14),a=r(10),i=r(68),u=r(21),o="prototype",s=function(t,e,r){var l,f,h,c=t&s.F,d=t&s.G,v=t&s.S,_=t&s.P,m=t&s.B,p=t&s.W,M=d?a:a[e]||(a[e]={}),x=M[o],g=d?n:v?n[e]:(n[e]||{})[o];d&&(r=e);for(l in r)f=!c&&g&&void 0!==g[l],f&&l in M||(h=f?g[l]:r[l],M[l]=d&&"function"!=typeof g[l]?r[l]:m&&f?i(h,n):p&&g[l]==h?function(t){var e=function(e,r,n){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,r)}return new t(e,r,n)}return t.apply(this,arguments)};return e[o]=t[o],e}(h):_&&"function"==typeof h?i(Function.call,h):h,_&&((M.virtual||(M.virtual={}))[l]=h,t&s.R&&x&&!x[l]&&u(x,l,h)))};s.F=1,s.G=2,s.S=4,s.P=8,s.B=16,s.W=32,s.U=64,s.R=128,t.exports=s},function(t,e,r){var n=r(19),a=r(29);t.exports=r(17)?function(t,e,r){return n.f(t,e,a(1,r))}:function(t,e,r){return t[e]=r,t}},function(t,e,r){var n=r(48)("wks"),a=r(30),i=r(14).Symbol,u="function"==typeof i,o=t.exports=function(t){return n[t]||(n[t]=u&&i[t]||(u?i:a)("Symbol."+t))};o.store=n},function(t,e){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),a=60,i=function(){function t(){r(this,t),this._delayTasks=[],this._nextTasks=[],this._deferTasks=[],this._highTasks=[],this._usurpTask=[],this._enterframeTasks=[],this._idTable=0,this._loop()}return n(t,[{key:"addEF",value:function(t,e){e=e||[];var r=this._idTable;return this._enterframeTasks[r]={func:t,params:e},this._idTable++,r}},{key:"removeEF",value:function(t){return void 0!==this._enterframeTasks[t]&&(this._enterframeTasks[t]=null),-1}},{key:"delay",value:function(t,e,r){var n=(new Date).getTime(),a={func:t,params:e,delay:r,time:n};this._delayTasks.push(a)}},{key:"defer",value:function(t,e){var r={func:t,params:e};this._deferTasks.push(r)}},{key:"next",value:function(t,e){var r={func:t,params:e};this._nextTasks.push(r)}},{key:"usurp",value:function(t,e){var r={func:t,params:e};this._usurpTask.push(r)}},{key:"_process",value:function(){var t=0,e=void 0,r=void 0,n=void 0;for(t=0;t<this._enterframeTasks.length;t++)e=this._enterframeTasks[t],null!==e&&void 0!==e&&e.func(e.params);for(;this._highTasks.length>0;)e=this._highTasks.pop(),e.func(e.params);var i=(new Date).getTime();for(t=0;t<this._delayTasks.length;t++)e=this._delayTasks[t],i-e.time>e.delay&&(e.func(e.params),this._delayTasks.splice(t,1));for(i=(new Date).getTime(),r=1e3/a;this._deferTasks.length>0;){if(e=this._deferTasks.shift(),n=(new Date).getTime(),!(r>n-i)){this._deferTasks.unshift(e);break}e.func(e.params)}for(i=(new Date).getTime(),r=1e3/a;this._usurpTask.length>0;)e=this._usurpTask.shift(),n=(new Date).getTime(),r>n-i&&e.func(e.params);this._highTasks=this._highTasks.concat(this._nextTasks),this._nextTasks=[],this._usurpTask=[]}},{key:"_loop",value:function(){var t=this;this._process(),window.requestAnimationFrame(function(){return t._loop()})}}]),t}(),u=new i;e.default=u},function(t,e,r){var n=r(26);t.exports=function(t){if(!n(t))throw TypeError(t+" is not an object!");return t}},function(t,e){t.exports=function(t){try{return!!t()}catch(e){return!0}}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(7),l=n(s),f=r(32),h=n(f),c=r(65),d=n(c),v=function(){function t(e){var r=arguments.length<=1||void 0===arguments[1]?0:arguments[1],n=arguments.length<=2||void 0===arguments[2]?0:arguments[2];arguments.length<=3||void 0===arguments[3]?{}:arguments[3];(0,i.default)(this,t),this.shader=new l.default(d.default.bigTriangleVert,e),this._width=r,this._height=n,this._uniforms={},this._hasOwnFbo=this._width>0&&this._width>0,this._uniforms={},this._hasOwnFbo&&(this._fbo=new h.default(this._width,this.height,mParmas))}return(0,o.default)(t,[{key:"uniform",value:function(t,e){this._uniforms[t]=e}},{key:"render",value:function(t){this.shader.bind(),this.shader.uniform("texture","uniform1i",0),t.bind(0),this.shader.uniform(this._uniforms)}},{key:"width",get:function(){return this._width}},{key:"height",get:function(){return this._height}},{key:"fbo",get:function(){return this._fbo}},{key:"hasFbo",get:function(){return this._hasOwnFbo}}]),t}();e.default=v,t.exports=e.default},function(t,e,r){var n=r(75),a=r(40);t.exports=Object.keys||function(t){return n(t,a)}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){var r=0,n=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++r+n).toString(36))}},function(t,e){t.exports="// simpleColor.frag\n\n#define SHADER_NAME SIMPLE_COLOR\n\nprecision mediump float;\n#define GLSLIFY 1\n\nuniform vec3 color;\nuniform float opacity;\n\nvoid main(void) {\n    gl_FragColor = vec4(color, opacity);\n}"},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}function a(t){return 0!==t&&!(t&t-1)}Object.defineProperty(e,"__esModule",{value:!0});var i=r(1),u=n(i),o=r(2),s=n(o),l=r(3),f=n(l),h=r(33),c=n(h),d=void 0,v=void 0,_=!1,m=void 0,p=function(){return f.default.webgl2?!0:(m=f.default.getExtension("WEBGL_draw_buffers"),!!m)},M=function(){function t(e,r){var n=arguments.length<=2||void 0===arguments[2]?{}:arguments[2],i=arguments.length<=3||void 0===arguments[3]?!1:arguments[3];(0,u.default)(this,t),d=f.default.gl,v=f.default.checkExtension("WEBGL_depth_texture"),this.width=e,this.height=r,this._multipleTargets=i,this.magFilter=n.magFilter||d.LINEAR,this.minFilter=n.minFilter||d.LINEAR_MIPMAP_NEAREST,
this.wrapS=n.wrapS||d.CLAMP_TO_EDGE,this.wrapT=n.wrapT||d.CLAMP_TO_EDGE,this.useDepth=n.useDepth||!0,this.useStencil=n.useStencil||!1,this.texelType=n.type,a(this.width)&&a(this.height)||(this.wrapS=this.wrapT=d.CLAMP_TO_EDGE,this.minFilter===d.LINEAR_MIPMAP_NEAREST&&(this.minFilter=d.LINEAR)),_||p(),this._init()}return(0,s.default)(t,[{key:"_init",value:function(){var t=d.UNSIGNED_BYTE;if(this.texelType&&(t=this.texelType),this.texelType=t,this._textures=[],this._initTextures(),this.frameBuffer=d.createFramebuffer(),d.bindFramebuffer(d.FRAMEBUFFER,this.frameBuffer),f.default.webgl2){for(var e=[],r=0;r<this._textures.length;r++)d.framebufferTexture2D(d.DRAW_FRAMEBUFFER,d.COLOR_ATTACHMENT0+r,d.TEXTURE_2D,this._textures[r].texture,0),e.push(d["COLOR_ATTACHMENT"+r]);d.drawBuffers(e),d.framebufferTexture2D(d.DRAW_FRAMEBUFFER,d.DEPTH_ATTACHMENT,d.TEXTURE_2D,this.glDepthTexture.texture,0)}else{for(var n=0;n<this._textures.length;n++)d.framebufferTexture2D(d.FRAMEBUFFER,d.COLOR_ATTACHMENT0+n,d.TEXTURE_2D,this._textures[n].texture,0);this._multipleTargets&&m.drawBuffersWEBGL([m.COLOR_ATTACHMENT0_WEBGL,m.COLOR_ATTACHMENT1_WEBGL,m.COLOR_ATTACHMENT2_WEBGL,m.COLOR_ATTACHMENT3_WEBGL]),v&&d.framebufferTexture2D(d.FRAMEBUFFER,d.DEPTH_ATTACHMENT,d.TEXTURE_2D,this.glDepthTexture.texture,0)}if(this.minFilter===d.LINEAR_MIPMAP_NEAREST)for(var a=0;a<this._textures.length;a++)d.bindTexture(d.TEXTURE_2D,this._textures[a].texture),d.generateMipmap(d.TEXTURE_2D);var i=d.checkFramebufferStatus(d.FRAMEBUFFER);i!=d.FRAMEBUFFER_COMPLETE&&console.log("GL_FRAMEBUFFER_COMPLETE failed, CANNOT use Framebuffer"),d.bindTexture(d.TEXTURE_2D,null),d.bindRenderbuffer(d.RENDERBUFFER,null),d.bindFramebuffer(d.FRAMEBUFFER,null),this.clear()}},{key:"_initTextures",value:function(){for(var t=(this._multipleTargets?4:1,0);4>t;t++){var e=this._createTexture();this._textures.push(e)}f.default.webgl2?this.glDepthTexture=this._createTexture(d.DEPTH_COMPONENT16,d.UNSIGNED_SHORT,d.DEPTH_COMPONENT,!0):this.glDepthTexture=this._createTexture(d.DEPTH_COMPONENT,d.UNSIGNED_SHORT)}},{key:"_createTexture",value:function(t,e,r){var n=arguments.length<=3||void 0===arguments[3]?!1:arguments[3];void 0===t&&(t=d.RGBA),void 0===e&&(e=this.texelType),r||(r=t);var a=d.createTexture(),i=new c.default(a,!0),u=n?f.default.NEAREST:this.magFilter,o=n?f.default.NEAREST:this.minFilter;return d.bindTexture(d.TEXTURE_2D,a),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MAG_FILTER,u),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,o),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_S,this.wrapS),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_T,this.wrapT),d.texImage2D(d.TEXTURE_2D,0,t,this.width,this.height,0,r,e,null),d.bindTexture(d.TEXTURE_2D,null),i}},{key:"bind",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];t&&f.default.viewport(0,0,this.width,this.height),d.bindFramebuffer(d.FRAMEBUFFER,this.frameBuffer)}},{key:"unbind",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];t&&f.default.viewport(0,0,f.default.width,f.default.height),d.bindFramebuffer(d.FRAMEBUFFER,null)}},{key:"clear",value:function(){var t=arguments.length<=0||void 0===arguments[0]?0:arguments[0],e=arguments.length<=1||void 0===arguments[1]?0:arguments[1],r=arguments.length<=2||void 0===arguments[2]?0:arguments[2],n=arguments.length<=3||void 0===arguments[3]?0:arguments[3];this.bind(),f.default.clear(t,e,r,n),this.unbind()}},{key:"getTexture",value:function(){var t=arguments.length<=0||void 0===arguments[0]?0:arguments[0];return this._textures[t]}},{key:"getDepthTexture",value:function(){return this.glDepthTexture}},{key:"minFilter",value:function(t){return t!==d.LINEAR&&t!==d.NEAREST&&t!==d.LINEAR_MIPMAP_NEAREST?this:(this.minFilter=t,this)}},{key:"magFilter",value:function(t){return t!==d.LINEAR&&t!==d.NEAREST&&t!==d.LINEAR_MIPMAP_NEAREST?this:(this.magFilter=t,this)}},{key:"wrapS",value:function(t){return t!==d.CLAMP_TO_EDGE&&t!==d.REPEAT&&t!==d.MIRRORED_REPEAT?this:(this.wrapS=t,this)}},{key:"wrapT",value:function(t){return t!==d.CLAMP_TO_EDGE&&t!==d.REPEAT&&t!==d.MIRRORED_REPEAT?this:(this.wrapT=t,this)}}]),t}();e.default=M,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}function a(t){return 0!==t&&!(t&t-1)}function i(t){var e=t.width||t.videoWidth,r=t.height||t.videoHeight;return e&&r?a(e)&&a(r):!1}Object.defineProperty(e,"__esModule",{value:!0});var u=r(1),o=n(u),s=r(2),l=n(s),f=r(3),h=n(f),c=void 0,d=function(){function t(e){var r=arguments.length<=1||void 0===arguments[1]?!1:arguments[1],n=arguments.length<=2||void 0===arguments[2]?{}:arguments[2];if((0,o.default)(this,t),c=h.default.gl,r)this._texture=e;else{this._mSource=e,this._texture=c.createTexture(),this._isVideo="VIDEO"===e.tagName,this._premultiplyAlpha=!0,this._magFilter=n.magFilter||c.LINEAR,this._minFilter=n.minFilter||c.NEAREST_MIPMAP_LINEAR,this._wrapS=n.wrapS||c.MIRRORED_REPEAT,this._wrapT=n.wrapT||c.MIRRORED_REPEAT;var a=e.width||e.videoWidth;a?i(e)||(this._wrapS=this._wrapT=c.CLAMP_TO_EDGE,this._minFilter===c.NEAREST_MIPMAP_LINEAR&&(this._minFilter=c.LINEAR)):(this._wrapS=this._wrapT=c.CLAMP_TO_EDGE,this._minFilter===c.NEAREST_MIPMAP_LINEAR&&(this._minFilter=c.LINEAR)),c.bindTexture(c.TEXTURE_2D,this._texture),c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL,!0),e.exposure?c.texImage2D(c.TEXTURE_2D,0,c.RGBA,e.shape[0],e.shape[1],0,c.RGBA,c.FLOAT,e.data):c.texImage2D(c.TEXTURE_2D,0,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,e),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,this._magFilter),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,this._minFilter),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,this._wrapS),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,this._wrapT);var u=h.default.getExtension("EXT_texture_filter_anisotropic");if(u){var s=c.getParameter(u.MAX_TEXTURE_MAX_ANISOTROPY_EXT);c.texParameterf(c.TEXTURE_2D,u.TEXTURE_MAX_ANISOTROPY_EXT,s)}this._canGenerateMipmap()&&c.generateMipmap(c.TEXTURE_2D),c.bindTexture(c.TEXTURE_2D,null)}}return(0,l.default)(t,[{key:"generateMipmap",value:function(){this._canGenerateMipmap()&&(c.bindTexture(c.TEXTURE_2D,this._texture),c.generateMipmap(c.TEXTURE_2D),c.bindTexture(c.TEXTURE_2D,null))}},{key:"updateTexture",value:function(t){t&&(this._mSource=t),c.bindTexture(c.TEXTURE_2D,this._texture),c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL,!0),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,this._mSource),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,this._magFilter),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,this._minFilter),this._canGenerateMipmap()&&c.generateMipmap(c.TEXTURE_2D),c.bindTexture(c.TEXTURE_2D,null)}},{key:"bind",value:function(t){void 0===t&&(t=0),h.default.shader&&(c.activeTexture(c.TEXTURE0+t),c.bindTexture(c.TEXTURE_2D,this._texture),this._bindIndex=t)}},{key:"_canGenerateMipmap",value:function(){return this._minFilter===c.LINEAR_MIPMAP_NEAREST||this._minFilter===c.NEAREST_MIPMAP_LINEAR||this._minFilter===c.LINEAR_MIPMAP_LINEAR||this._minFilter===c.NEAREST_MIPMAP_NEAREST}},{key:"minFilter",set:function(t){return t!==c.LINEAR&&t!==c.NEAREST&&t!==c.NEAREST_MIPMAP_LINEAR&&t!==c.NEAREST_MIPMAP_LINEAR&&t!==c.LINEAR_MIPMAP_LINEAR&&t!==c.NEAREST_MIPMAP_NEAREST?this:(this._minFilter=t,c.bindTexture(c.TEXTURE_2D,this._texture),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,this._minFilter),void c.bindTexture(c.TEXTURE_2D,null))},get:function(){return this._minFilter}},{key:"magFilter",set:function(t){return t!==c.LINEAR&&t!==c.NEAREST?this:(this._magFilter=t,c.bindTexture(c.TEXTURE_2D,this._texture),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,this._magFilter),void c.bindTexture(c.TEXTURE_2D,null))},get:function(){return this._magFilter}},{key:"wrapS",set:function(t){return t!==c.CLAMP_TO_EDGE&&t!==c.REPEAT&&t!==c.MIRRORED_REPEAT?this:(this._wrapS=t,c.bindTexture(c.TEXTURE_2D,this._texture),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,this._wrapS),void c.bindTexture(c.TEXTURE_2D,null))},get:function(){return this._wrapS}},{key:"wrapT",set:function(t){return t!==c.CLAMP_TO_EDGE&&t!==c.REPEAT&&t!==c.MIRRORED_REPEAT?this:(this._wrapT=t,c.bindTexture(c.TEXTURE_2D,this._texture),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,this._wrapT),void c.bindTexture(c.TEXTURE_2D,null))},get:function(){return this._wrapT}},{key:"premultiplyAlpha",set:function(t){this._premultiplyAlpha=t,c.bindTexture(c.TEXTURE_2D,this._texture),console.log("premultiplyAlpha:",t),c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this._premultiplyAlpha),c.bindTexture(c.TEXTURE_2D,null)},get:function(){return this._premultiplyAlpha}},{key:"texture",get:function(){return this._texture}}]),t}(),v=void 0,_=void 0,m=void 0;d.whiteTexture=function(){if(void 0===v){var t=document.createElement("canvas");t.width=t.height=4;var e=t.getContext("2d");e.fillStyle="#fff",e.fillRect(0,0,4,4),v=new d(t)}return v},d.greyTexture=function(){if(void 0===_){var t=document.createElement("canvas");t.width=t.height=4;var e=t.getContext("2d");e.fillStyle="rgb(127, 127, 127)",e.fillRect(0,0,4,4),_=new d(t)}return _},d.blackTexture=function(){if(void 0===m){var t=document.createElement("canvas");t.width=t.height=4;var e=t.getContext("2d");e.fillStyle="rgb(127, 127, 127)",e.fillRect(0,0,4,4),m=new d(t)}return m},e.default=d,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(8),l=n(s),f=function(){function t(){(0,i.default)(this,t),this._matrix=l.default.mat4.create(),this._quat=l.default.quat.create(),this._orientation=l.default.mat4.create(),this._projection=l.default.mat4.create(),this.position=l.default.vec3.create()}return(0,o.default)(t,[{key:"lookAt",value:function(t,e){var r=arguments.length<=2||void 0===arguments[2]?[0,1,0]:arguments[2];this._eye=vec3.clone(t),this._center=vec3.clone(e),l.default.vec3.copy(this.position,t),l.default.mat4.identity(this._matrix),l.default.mat4.lookAt(this._matrix,t,e,r)}},{key:"setFromOrientation",value:function(t,e,r,n){l.default.quat.set(this._quat,t,e,r,n),l.default.mat4.fromQuat(this._orientation,this._quat),l.default.mat4.translate(this._matrix,this._orientation,this.positionOffset)}},{key:"setProjection",value:function(t){this._projection=l.default.mat4.clone(t)}},{key:"setView",value:function(t){this._matrix=l.default.mat4.clone(t)}},{key:"setFromViewProj",value:function(t,e){this.setView(t),this.setProjection(e)}},{key:"matrix",get:function(){return this._matrix}},{key:"viewMatrix",get:function(){return this._matrix}},{key:"projection",get:function(){return this._projection}},{key:"projectionMatrix",get:function(){return this._projection}},{key:"eye",get:function(){return this._eye}},{key:"center",get:function(){return this._center}}]),t}();e.default=f,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(5),d=n(c),v=r(34),_=n(v),m=r(58),p=n(m),M=r(8),x=n(M),g=x.default.mat4,E=x.default.vec3,b=g.create(),y=E.create(),S=function(t){function e(){return(0,o.default)(this,e),(0,h.default)(this,(0,i.default)(e).apply(this,arguments))}return(0,d.default)(e,t),(0,l.default)(e,[{key:"setPerspective",value:function(t,e,r,n){this._fov=t,this._near=r,this._far=n,this._aspectRatio=e,x.default.mat4.perspective(this._projection,t,e,r,n)}},{key:"setAspectRatio",value:function(t){this._aspectRatio=t,x.default.mat4.perspective(this.projection,this._fov,t,this._near,this._far)}},{key:"generateRay",value:function(t,e){var r=this.projectionMatrix,n=this.viewMatrix;return g.multiply(b,r,n),g.invert(b,b),E.transformMat4(y,t,b),E.sub(y,y,this.position),E.normalize(y,y),e?(e.origin=this.position,e.direction=y):e=new p.default(this.position,y),e}}]),e}(_.default);e.default=S,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=function(){function t(){var e=this,r=arguments.length<=0||void 0===arguments[0]?!1:arguments[0];(0,i.default)(this,t),this._req=new XMLHttpRequest,this._req.addEventListener("load",function(t){return e._onLoaded(t)}),this._req.addEventListener("progress",function(t){return e._onProgress(t)}),r&&(this._req.responseType="arraybuffer")}return(0,o.default)(t,[{key:"load",value:function(t,e){console.log("Loading : ",t),this._callback=e,this._req.open("GET",t),this._req.send()}},{key:"_onLoaded",value:function(){this._callback(this._req.response)}},{key:"_onProgress",value:function(){}}]),t}();e.default=s,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(23),l=n(s),f=function(){function t(e){var r=this,n=arguments.length<=1||void 0===arguments[1]?.1:arguments[1];(0,i.default)(this,t),this.easing=n,this._value=e,this._targetValue=e,this._efIndex=l.default.addEF(function(){return r._update()})}return(0,o.default)(t,[{key:"_update",value:function(){var t=1e-4;this._checkLimit(),this._value+=(this._targetValue-this._value)*this.easing,Math.abs(this._targetValue-this._value)<t&&(this._value=this._targetValue)}},{key:"setTo",value:function(t){this._targetValue=this._value=t}},{key:"add",value:function(t){this._targetValue+=t}},{key:"limit",value:function(t,e){return t>e?void this.limit(e,t):(this._min=t,this._max=e,void this._checkLimit())}},{key:"_checkLimit",value:function(){void 0!==this._min&&this._targetValue<this._min&&(this._targetValue=this._min),void 0!==this._max&&this._targetValue>this._max&&(this._targetValue=this._max)}},{key:"destroy",value:function(){l.default.removeEF(this._efIndex)}},{key:"value",set:function(t){this._targetValue=t},get:function(){return this._value}},{key:"targetValue",get:function(){return this._targetValue}}]),t}();e.default=f,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}e.__esModule=!0;var a=r(122),i=n(a),u=r(121),o=n(u),s="function"==typeof o.default&&"symbol"==typeof i.default?function(t){return typeof t}:function(t){return t&&"function"==typeof o.default&&t.constructor===o.default?"symbol":typeof t};e.default="function"==typeof o.default&&"symbol"===s(i.default)?function(t){return"undefined"==typeof t?"undefined":s(t)}:function(t){return t&&"function"==typeof o.default&&t.constructor===o.default?"symbol":"undefined"==typeof t?"undefined":s(t)}},function(t,e){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e){t.exports={}},function(t,e){t.exports=!0},function(t,e,r){var n=r(24),a=r(143),i=r(40),u=r(47)("IE_PROTO"),o=function(){},s="prototype",l=function(){var t,e=r(69)("iframe"),n=i.length,a=">";for(e.style.display="none",r(136).appendChild(e),e.src="javascript:",t=e.contentWindow.document,t.open(),t.write("<script>document.F=Object</script"+a),t.close(),l=t.F;n--;)delete l[s][i[n]];return l()};t.exports=Object.create||function(t,e){var r;return null!==t?(o[s]=n(t),r=new o,o[s]=null,r[u]=t):r=l(),void 0===e?r:a(r,e)}},function(t,e,r){var n=r(45),a=r(29),i=r(15),u=r(50),o=r(18),s=r(70),l=Object.getOwnPropertyDescriptor;e.f=r(17)?l:function(t,e){if(t=i(t),e=u(e,!0),s)try{return l(t,e)}catch(r){}return o(t,e)?a(!n.f.call(t,e),t[e]):void 0}},function(t,e){e.f={}.propertyIsEnumerable},function(t,e,r){var n=r(19).f,a=r(18),i=r(22)("toStringTag");t.exports=function(t,e,r){t&&!a(t=r?t:t.prototype,i)&&n(t,i,{configurable:!0,value:e})}},function(t,e,r){var n=r(48)("keys"),a=r(30);t.exports=function(t){return n[t]||(n[t]=a(t))}},function(t,e,r){var n=r(14),a="__core-js_shared__",i=n[a]||(n[a]={});t.exports=function(t){return i[t]||(i[t]={})}},function(t,e){var r=Math.ceil,n=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?n:r)(t)}},function(t,e,r){var n=r(26);t.exports=function(t,e){if(!n(t))return t;var r,a;if(e&&"function"==typeof(r=t.toString)&&!n(a=r.call(t)))return a;if("function"==typeof(r=t.valueOf)&&!n(a=r.call(t)))return a;if(!e&&"function"==typeof(r=t.toString)&&!n(a=r.call(t)))return a;throw TypeError("Can't convert object to primitive value")}},function(t,e,r){var n=r(14),a=r(10),i=r(42),u=r(52),o=r(19).f;t.exports=function(t){var e=a.Symbol||(a.Symbol=i?{}:n.Symbol||{});"_"==t.charAt(0)||t in e||o(e,t,{value:u.f(t)})}},function(t,e,r){e.f=r(22)},function(t,e){t.exports="// basic.vert\n\n#define SHADER_NAME BASIC_VERTEX\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec3 aNormal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec3 vNormal;\n\nvoid main(void) {\n    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);\n    vTextureCoord = aTextureCoord;\n    vNormal = aNormal;\n}"},function(t,e){t.exports="// bigTriangle.vert\n\n#define SHADER_NAME BIG_TRIANGLE_VERTEX\n\nprecision mediump float;\n#define GLSLIFY 1\nattribute vec2 aPosition;\nvarying vec2 vTextureCoord;\n\nvoid main(void) {\n    gl_Position = vec4(aPosition, 0.0, 1.0);\n    vTextureCoord = aPosition * .5 + .5;\n}"},function(t,e){t.exports="// copy.frag\n\n#define SHADER_NAME COPY_FRAGMENT\n\nprecision mediump float;\n#define GLSLIFY 1\n\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\n\nvoid main(void) {\n    gl_FragColor = texture2D(texture, vTextureCoord);\n}"},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(3),l=n(s),f=r(167),h=n(f),c=void 0,d=131072,v=7,_=31,m=function(){function t(e){var r=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],n=arguments.length<=2||void 0===arguments[2]?!1:arguments[2];if((0,i.default)(this,t),c=l.default.gl,n)return void(this.texture=e);var a=e.length>6;e[0].mipmapCount&&(a=e[0].mipmapCount>1),this.texture=c.createTexture(),this.magFilter=r.magFilter||c.LINEAR,this.minFilter=r.minFilter||c.LINEAR_MIPMAP_LINEAR,this.wrapS=r.wrapS||c.CLAMP_TO_EDGE,this.wrapT=r.wrapT||c.CLAMP_TO_EDGE,a||this.minFilter!=c.LINEAR_MIPMAP_LINEAR||(this.minFilter=c.LINEAR),c.bindTexture(c.TEXTURE_CUBE_MAP,this.texture);var u=[c.TEXTURE_CUBE_MAP_POSITIVE_X,c.TEXTURE_CUBE_MAP_NEGATIVE_X,c.TEXTURE_CUBE_MAP_POSITIVE_Y,c.TEXTURE_CUBE_MAP_NEGATIVE_Y,c.TEXTURE_CUBE_MAP_POSITIVE_Z,c.TEXTURE_CUBE_MAP_NEGATIVE_Z],o=1,s=0;if(o=e.length/6,this.numLevels=o,a)for(var f=0;6>f;f++)for(var h=0;o>h;h++)c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL,!1),s=f*o+h,e[s].shape?c.texImage2D(u[f],h,c.RGBA,e[s].shape[0],e[s].shape[1],0,c.RGBA,c.FLOAT,e[s].data):c.texImage2D(u[f],h,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,e[s]),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_WRAP_S,this.wrapS),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_WRAP_T,this.wrapT),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_MAG_FILTER,this.magFilter),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_MIN_FILTER,this.minFilter);else{for(var d=0,v=0;6>v;v++)d=v*o,c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL,!1),e[d].shape?c.texImage2D(u[v],0,c.RGBA,e[d].shape[0],e[d].shape[1],0,c.RGBA,c.FLOAT,e[d].data):c.texImage2D(u[v],0,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,e[d]),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_WRAP_S,this.wrapS),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_WRAP_T,this.wrapT),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_MAG_FILTER,this.magFilter),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_MIN_FILTER,this.minFilter);c.generateMipmap(c.TEXTURE_CUBE_MAP)}c.bindTexture(c.TEXTURE_CUBE_MAP,null)}return(0,o.default)(t,[{key:"bind",value:function(){var t=arguments.length<=0||void 0===arguments[0]?0:arguments[0];l.default.shader&&(c.activeTexture(c.TEXTURE0+t),c.bindTexture(c.TEXTURE_CUBE_MAP,this.texture),c.uniform1i(l.default.shader.uniformTextures[t],t),this._bindIndex=t)}},{key:"unbind",value:function(){c.bindTexture(c.TEXTURE_CUBE_MAP,null)}}]),t}();m.parseDDS=function(t){var e=(0,h.default)(t),r=e.flags,n=new Int32Array(t,0,_),a=1;r&d&&(a=Math.max(1,n[v]));var i=e.images.map(function(e){var r=new Float32Array(t.slice(e.offset,e.offset+e.length));return{data:r,shape:e.shape,mipmapCount:a}});return new m(i)},e.default=m,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(5),d=n(c),v=r(34),_=n(v),m=r(8),p=n(m),M=function(t){function e(){(0,o.default)(this,e);var t=(0,h.default)(this,(0,i.default)(e).call(this)),r=p.default.vec3.clone([0,0,15]),n=p.default.vec3.create(),a=p.default.vec3.clone([0,-1,0]);return t.lookAt(r,n,a),t.ortho(1,-1,1,-1),t}return(0,d.default)(e,t),(0,l.default)(e,[{key:"setBoundary",value:function(t,e,r,n){var a=arguments.length<=4||void 0===arguments[4]?.1:arguments[4],i=arguments.length<=5||void 0===arguments[5]?100:arguments[5];this.ortho(t,e,r,n,a,i)}},{key:"ortho",value:function(t,e,r,n){var a=arguments.length<=4||void 0===arguments[4]?.1:arguments[4],i=arguments.length<=5||void 0===arguments[5]?100:arguments[5];this.left=t,this.right=e,this.top=r,this.bottom=n,p.default.mat4.ortho(this._projection,t,e,r,n,a,i)}}]),e}(_.default);e.default=M,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(8),l=n(s),f=(l.default.mat4,l.default.vec3),h=f.create(),c=f.create(),d=f.create(),v=f.create(),_=f.create(),m=f.create(),p=f.create(),M=f.create(),x=function(){function t(e,r){(0,i.default)(this,t),this.origin=f.clone(e),this.direction=f.clone(r)}return(0,o.default)(t,[{key:"at",value:function(t){return f.copy(v,this.direction),f.scale(v,v,t),f.add(v,v,this.origin),v}},{key:"lookAt",value:function(t){f.sub(this.direction,t,this.origin),f.normalize(this.origin,this.origin)}},{key:"closestPointToPoint",value:function(t){var e=f.create();f.sub(t,this.origin);var r=f.dot(e,this.direction);return 0>r?f.clone(this.origin):(f.copy(e,this.direction),f.scale(e,e,r),f.add(e,e,this.origin),e)}},{key:"distanceToPoint",value:function(t){return Math.sqrt(this.distanceSqToPoint(t))}},{key:"distanceSqToPoint",value:function(t){var e=f.create();f.sub(e,t,this.origin);var r=f.dot(e,this.direction);return 0>r?f.squaredDistance(this.origin,t):(f.copy(e,this.direction),f.scale(e,e,r),f.add(e,e,this.origin),f.squaredDistance(e,t))}},{key:"intersectsSphere",value:function(t,e){return this.distanceToPoint(t)<=e}},{key:"intersectSphere",value:function(t,e){var r=f.create();f.sub(r,t,this.origin);var n=f.dot(r,this.direction),a=f.dot(r,r)-n*n,i=e*e;if(a>i)return null;var u=Math.sqrt(i-a),o=n-u,s=n+u;return 0>o&&0>s?null:0>o?this.at(s):this.at(o)}},{key:"distanceToPlane",value:function(t,e){f.dot(e,this.direction)}},{key:"intersectTriangle",value:function(t,e,r){var n=arguments.length<=3||void 0===arguments[3]?!0:arguments[3];f.copy(h,t),f.copy(c,e),f.copy(d,r),f.sub(_,c,h),f.sub(m,d,h),f.cross(p,_,m);var a=f.dot(this.direction,p),i=void 0;if(a>0){if(n)return null;i=1}else{if(!(0>a))return null;i=-1,a=-a}f.sub(M,this.origin,h),f.cross(m,M,m);var u=i*f.dot(this.direction,m);if(0>u)return null;f.cross(_,_,M);var o=i*f.dot(this.direction,_);if(0>o)return null;if(u+o>a)return null;var s=-i*f.dot(M,p);return 0>s?null:this.at(s/a)}}]),t}();e.default=x,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(8),l=function(){function t(){(0,i.default)(this,t),this._needUpdate=!0,this._x=0,this._y=0,this._z=0,this._sx=1,this._sy=1,this._sz=1,this._rx=0,this._ry=0,this._rz=0,this._position=s.vec3.create(),this._scale=s.vec3.fromValues(1,1,1),this._rotation=s.vec3.create(),this._matrix=s.mat4.create(),this._matrixRotation=s.mat4.create(),this._matrixScale=s.mat4.create(),this._matrixTranslation=s.mat4.create(),this._matrixQuaternion=s.mat4.create(),this._quat=s.quat.create()}return(0,o.default)(t,[{key:"_update",value:function(){s.vec3.set(this._scale,this._sx,this._sy,this._sz),s.vec3.set(this._rotation,this._rx,this._ry,this._rz),s.vec3.set(this._position,this._x,this._y,this._z),s.mat4.identity(this._matrixTranslation,this._matrixTranslation),s.mat4.identity(this._matrixScale,this._matrixScale),s.mat4.identity(this._matrixRotation,this._matrixRotation),s.mat4.rotateX(this._matrixRotation,this._matrixRotation,this._rx),s.mat4.rotateY(this._matrixRotation,this._matrixRotation,this._ry),s.mat4.rotateZ(this._matrixRotation,this._matrixRotation,this._rz),s.mat4.fromQuat(this._matrixQuaternion,this._quat),s.mat4.mul(this._matrixRotation,this._matrixQuaternion,this._matrixRotation),s.mat4.scale(this._matrixScale,this._matrixScale,this._scale),s.mat4.translate(this._matrixTranslation,this._matrixTranslation,this._position),s.mat4.mul(this._matrix,this._matrixTranslation,this._matrixRotation),s.mat4.mul(this._matrix,this._matrix,this._matrixScale),this._needUpdate=!1}},{key:"setRotationFromQuaternion",value:function(t){s.quat.copy(this._quat,t),this._needUpdate=!0}},{key:"matrix",get:function(){return this._needUpdate&&this._update(),this._matrix}},{key:"x",get:function(){return this._x},set:function(t){this._needUpdate=!0,this._x=t}},{key:"y",get:function(){return this._y},set:function(t){this._needUpdate=!0,this._y=t}},{key:"z",get:function(){return this._z},set:function(t){this._needUpdate=!0,this._z=t}},{key:"scaleX",get:function(){return this._sx},set:function(t){this._needUpdate=!0,this._sx=t}},{key:"scaleY",get:function(){return this._sy},set:function(t){this._needUpdate=!0,this._sy=t}},{key:"scaleZ",get:function(){return this._sz},set:function(t){this._needUpdate=!0,this._sz=t}},{key:"rotationX",get:function(){return this._rx},set:function(t){this._needUpdate=!0,this._rx=t}},{key:"rotationY",get:function(){return this._ry},set:function(t){this._needUpdate=!0,this._ry=t}},{key:"rotationZ",get:function(){return this._rz},set:function(t){this._needUpdate=!0,this._rz=t}}]),t}();e.default=l,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(6),l=n(s),f=r(5),h=n(f),c=r(3),d=n(c),v=r(27),_=n(v),m=r(172),p=r(173),M=r(171),x=function(t){function e(){var t=arguments.length<=0||void 0===arguments[0]?9:arguments[0],r=arguments[1],n=arguments[2],a=arguments[3],u=arguments.length<=4||void 0===arguments[4]?{}:arguments[4];(0,o.default)(this,e);var s=void 0;switch(t){case 5:default:s=m;break;case 9:s=p;break;case 13:s=M}var f=(0,l.default)(this,(0,i.default)(e).call(this,s,n,a,u));return f.uniform("uDirection",r),f.uniform("uResolution",[d.default.width,d.default.height]),f}return(0,h.default)(e,t),e}(_.default);e.default=x,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(6),l=n(s),f=r(5),h=n(f),c=r(60),d=n(c),v=function(t){function e(){var t=arguments.length<=0||void 0===arguments[0]?9:arguments[0],r=arguments[1],n=arguments[2],a=arguments[3];return(0,o.default)(this,e),(0,l.default)(this,(0,i.default)(e).call(this,t,[1,0],r,n,a))}return(0,h.default)(e,t),e}(d.default);e.default=v,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=function(){function t(){(0,i.default)(this,t),this._passes=[]}return(0,o.default)(t,[{key:"addPass",value:function(t){this._passes.push(t)}},{key:"passes",get:function(){return this._passes}}]),t}();e.default=s,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(6),l=n(s),f=r(5),h=n(f),c=r(60),d=n(c),v=function(t){function e(){var t=arguments.length<=0||void 0===arguments[0]?9:arguments[0],r=arguments[1],n=arguments[2],a=arguments[3];return(0,o.default)(this,e),(0,l.default)(this,(0,i.default)(e).call(this,t,[0,1],r,n,a))}return(0,h.default)(e,t),e}(d.default);e.default=v,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(37),l=n(s),f=r(23),h=n(f),c=r(8),d=n(c),v=function(t,e){var r=e||{};return t.touches?(r.x=t.touches[0].pageX,r.y=t.touches[0].pageY):(r.x=t.clientX,r.y=t.clientY),r},_=function(){function t(e){var r=this,n=arguments.length<=1||void 0===arguments[1]?window:arguments[1],a=arguments.length<=2||void 0===arguments[2]?500:arguments[2];(0,i.default)(this,t),this._target=e,this._listenerTarget=n,this._mouse={},this._preMouse={},this.center=d.default.vec3.create(),this._up=d.default.vec3.fromValues(0,1,0),this.radius=new l.default(a),this.position=d.default.vec3.fromValues(0,0,this.radius.value),this.positionOffset=d.default.vec3.create(),this._rx=new l.default(0),this._rx.limit(-Math.PI/2,Math.PI/2),this._ry=new l.default(0),this._preRX=0,this._preRY=0,this._isLockZoom=!1,this._isLockRotation=!1,this._isInvert=!1,this.sensitivity=1,this._listenerTarget.addEventListener("mousewheel",function(t){return r._onWheel(t)}),this._listenerTarget.addEventListener("DOMMouseScroll",function(t){return r._onWheel(t)}),this._listenerTarget.addEventListener("mousedown",function(t){return r._onDown(t)}),this._listenerTarget.addEventListener("touchstart",function(t){return r._onDown(t)}),this._listenerTarget.addEventListener("mousemove",function(t){return r._onMove(t)}),this._listenerTarget.addEventListener("touchmove",function(t){return r._onMove(t)}),window.addEventListener("touchend",function(){return r._onUp()}),window.addEventListener("mouseup",function(){return r._onUp()}),h.default.addEF(function(){return r._loop()})}return(0,o.default)(t,[{key:"lock",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];this._isLockZoom=t,this._isLockRotation=t}},{key:"lockZoom",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];this._isLockZoom=t}},{key:"lockRotation",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];this._isLockRotation=t}},{key:"inverseControl",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];this._isInvert=t}},{key:"_onDown",value:function(t){this._isLockRotation||(this._isMouseDown=!0,v(t,this._mouse),v(t,this._preMouse),this._preRX=this._rx.targetValue,this._preRY=this._ry.targetValue)}},{key:"_onMove",value:function(t){if(!this._isLockRotation&&(v(t,this._mouse),t.touches&&t.preventDefault(),this._isMouseDown)){var e=-(this._mouse.x-this._preMouse.x);this._isInvert&&(e*=-1),this._ry.value=this._preRY-.01*e*this.sensitivity;var r=-(this._mouse.y-this._preMouse.y);this._isInvert&&(r*=-1),this._rx.value=this._preRX-.01*r*this.sensitivity}}},{key:"_onUp",value:function(){this._isLockRotation||(this._isMouseDown=!1)}},{key:"_onWheel",value:function(t){if(!this._isLockZoom){var e=t.wheelDelta,r=t.detail,n=0;n=r?e?e/r/40*r>0?1:-1:-r/3:e/120,this.radius.add(2*-n)}}},{key:"_loop",value:function(){this._updatePosition(),this._target&&this._updateCamera()}},{key:"_updatePosition",value:function(){this.position[1]=Math.sin(this._rx.value)*this.radius.value;var t=Math.cos(this._rx.value)*this.radius.value;this.position[0]=Math.cos(this._ry.value+.5*Math.PI)*t,this.position[2]=Math.sin(this._ry.value+.5*Math.PI)*t,d.default.vec3.add(this.position,this.position,this.positionOffset)}},{key:"_updateCamera",value:function(){this._target.lookAt(this.position,this.center,this._up);
}},{key:"rx",get:function(){return this._rx}},{key:"ry",get:function(){return this._ry}}]),t}();e.default=_,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(31),i=n(a),u=r(54),o=n(u),s=r(83),l=n(s),f=r(55),h=n(f),c=r(53),d=n(c),v=r(85),_=n(v),m=r(84),p=n(m),M={simpleColorFrag:i.default,bigTriangleVert:o.default,generalVert:l.default,copyFrag:h.default,basicVert:d.default,skyboxVert:_.default,skyboxFrag:p.default};e.default=M,t.exports=e.default},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(t,e,r){return void 0===e.cacheAttribLoc&&(e.cacheAttribLoc={}),void 0===e.cacheAttribLoc[r]&&(e.cacheAttribLoc[r]=t.getAttribLocation(e,r)),e.cacheAttribLoc[r]},t.exports=e.default},function(t,e){var r={}.toString;t.exports=function(t){return r.call(t).slice(8,-1)}},function(t,e,r){var n=r(132);t.exports=function(t,e,r){if(n(t),void 0===e)return t;switch(r){case 1:return function(r){return t.call(e,r)};case 2:return function(r,n){return t.call(e,r,n)};case 3:return function(r,n,a){return t.call(e,r,n,a)}}return function(){return t.apply(e,arguments)}}},function(t,e,r){var n=r(26),a=r(14).document,i=n(a)&&n(a.createElement);t.exports=function(t){return i?a.createElement(t):{}}},function(t,e,r){t.exports=!r(17)&&!r(25)(function(){return 7!=Object.defineProperty(r(69)("div"),"a",{get:function(){return 7}}).a})},function(t,e,r){"use strict";var n=r(42),a=r(20),i=r(77),u=r(21),o=r(18),s=r(41),l=r(139),f=r(46),h=r(74),c=r(22)("iterator"),d=!([].keys&&"next"in[].keys()),v="@@iterator",_="keys",m="values",p=function(){return this};t.exports=function(t,e,r,M,x,g,E){l(r,e,M);var b,y,S,T=function(t){if(!d&&t in D)return D[t];switch(t){case _:return function(){return new r(this,t)};case m:return function(){return new r(this,t)}}return function(){return new r(this,t)}},I=e+" Iterator",A=x==m,F=!1,D=t.prototype,R=D[c]||D[v]||x&&D[x],w=R||T(x),P=x?A?T("entries"):w:void 0,N="Array"==e?D.entries||R:R;if(N&&(S=h(N.call(new t)),S!==Object.prototype&&(f(S,I,!0),n||o(S,c)||u(S,c,p))),A&&R&&R.name!==m&&(F=!0,w=function(){return R.call(this)}),n&&!E||!d&&!F&&D[c]||u(D,c,w),s[e]=w,s[I]=p,x)if(b={values:A?w:T(m),keys:g?w:T(_),entries:P},E)for(y in b)y in D||i(D,y,b[y]);else a(a.P+a.F*(d||F),e,b);return b}},function(t,e,r){var n=r(75),a=r(40).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return n(t,a)}},function(t,e){e.f=Object.getOwnPropertySymbols},function(t,e,r){var n=r(18),a=r(78),i=r(47)("IE_PROTO"),u=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=a(t),n(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null}},function(t,e,r){var n=r(18),a=r(15),i=r(134)(!1),u=r(47)("IE_PROTO");t.exports=function(t,e){var r,o=a(t),s=0,l=[];for(r in o)r!=u&&n(o,r)&&l.push(r);for(;e.length>s;)n(o,r=e[s++])&&(~i(l,r)||l.push(r));return l}},function(t,e,r){var n=r(20),a=r(10),i=r(25);t.exports=function(t,e){var r=(a.Object||{})[t]||Object[t],u={};u[t]=e(r),n(n.S+n.F*i(function(){r(1)}),"Object",u)}},function(t,e,r){t.exports=r(21)},function(t,e,r){var n=r(39);t.exports=function(t){return Object(n(t))}},function(t,e,r){var n=r(11),a={};a.create=function(){var t=new n.ARRAY_TYPE(9);return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},a.fromMat4=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[4],t[4]=e[5],t[5]=e[6],t[6]=e[8],t[7]=e[9],t[8]=e[10],t},a.clone=function(t){var e=new n.ARRAY_TYPE(9);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e},a.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t},a.fromValues=function(t,e,r,a,i,u,o,s,l){var f=new n.ARRAY_TYPE(9);return f[0]=t,f[1]=e,f[2]=r,f[3]=a,f[4]=i,f[5]=u,f[6]=o,f[7]=s,f[8]=l,f},a.set=function(t,e,r,n,a,i,u,o,s,l){return t[0]=e,t[1]=r,t[2]=n,t[3]=a,t[4]=i,t[5]=u,t[6]=o,t[7]=s,t[8]=l,t},a.identity=function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},a.transpose=function(t,e){if(t===e){var r=e[1],n=e[2],a=e[5];t[1]=e[3],t[2]=e[6],t[3]=r,t[5]=e[7],t[6]=n,t[7]=a}else t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8];return t},a.invert=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=e[4],o=e[5],s=e[6],l=e[7],f=e[8],h=f*u-o*l,c=-f*i+o*s,d=l*i-u*s,v=r*h+n*c+a*d;return v?(v=1/v,t[0]=h*v,t[1]=(-f*n+a*l)*v,t[2]=(o*n-a*u)*v,t[3]=c*v,t[4]=(f*r-a*s)*v,t[5]=(-o*r+a*i)*v,t[6]=d*v,t[7]=(-l*r+n*s)*v,t[8]=(u*r-n*i)*v,t):null},a.adjoint=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=e[4],o=e[5],s=e[6],l=e[7],f=e[8];return t[0]=u*f-o*l,t[1]=a*l-n*f,t[2]=n*o-a*u,t[3]=o*s-i*f,t[4]=r*f-a*s,t[5]=a*i-r*o,t[6]=i*l-u*s,t[7]=n*s-r*l,t[8]=r*u-n*i,t},a.determinant=function(t){var e=t[0],r=t[1],n=t[2],a=t[3],i=t[4],u=t[5],o=t[6],s=t[7],l=t[8];return e*(l*i-u*s)+r*(-l*a+u*o)+n*(s*a-i*o)},a.multiply=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=e[4],s=e[5],l=e[6],f=e[7],h=e[8],c=r[0],d=r[1],v=r[2],_=r[3],m=r[4],p=r[5],M=r[6],x=r[7],g=r[8];return t[0]=c*n+d*u+v*l,t[1]=c*a+d*o+v*f,t[2]=c*i+d*s+v*h,t[3]=_*n+m*u+p*l,t[4]=_*a+m*o+p*f,t[5]=_*i+m*s+p*h,t[6]=M*n+x*u+g*l,t[7]=M*a+x*o+g*f,t[8]=M*i+x*s+g*h,t},a.mul=a.multiply,a.translate=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=e[4],s=e[5],l=e[6],f=e[7],h=e[8],c=r[0],d=r[1];return t[0]=n,t[1]=a,t[2]=i,t[3]=u,t[4]=o,t[5]=s,t[6]=c*n+d*u+l,t[7]=c*a+d*o+f,t[8]=c*i+d*s+h,t},a.rotate=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=e[4],s=e[5],l=e[6],f=e[7],h=e[8],c=Math.sin(r),d=Math.cos(r);return t[0]=d*n+c*u,t[1]=d*a+c*o,t[2]=d*i+c*s,t[3]=d*u-c*n,t[4]=d*o-c*a,t[5]=d*s-c*i,t[6]=l,t[7]=f,t[8]=h,t},a.scale=function(t,e,r){var n=r[0],a=r[1];return t[0]=n*e[0],t[1]=n*e[1],t[2]=n*e[2],t[3]=a*e[3],t[4]=a*e[4],t[5]=a*e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t},a.fromTranslation=function(t,e){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=e[0],t[7]=e[1],t[8]=1,t},a.fromRotation=function(t,e){var r=Math.sin(e),n=Math.cos(e);return t[0]=n,t[1]=r,t[2]=0,t[3]=-r,t[4]=n,t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},a.fromScaling=function(t,e){return t[0]=e[0],t[1]=0,t[2]=0,t[3]=0,t[4]=e[1],t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},a.fromMat2d=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=0,t[3]=e[2],t[4]=e[3],t[5]=0,t[6]=e[4],t[7]=e[5],t[8]=1,t},a.fromQuat=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=r+r,o=n+n,s=a+a,l=r*u,f=n*u,h=n*o,c=a*u,d=a*o,v=a*s,_=i*u,m=i*o,p=i*s;return t[0]=1-h-v,t[3]=f-p,t[6]=c+m,t[1]=f+p,t[4]=1-l-v,t[7]=d-_,t[2]=c-m,t[5]=d+_,t[8]=1-l-h,t},a.normalFromMat4=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=e[4],o=e[5],s=e[6],l=e[7],f=e[8],h=e[9],c=e[10],d=e[11],v=e[12],_=e[13],m=e[14],p=e[15],M=r*o-n*u,x=r*s-a*u,g=r*l-i*u,E=n*s-a*o,b=n*l-i*o,y=a*l-i*s,S=f*_-h*v,T=f*m-c*v,I=f*p-d*v,A=h*m-c*_,F=h*p-d*_,D=c*p-d*m,R=M*D-x*F+g*A+E*I-b*T+y*S;return R?(R=1/R,t[0]=(o*D-s*F+l*A)*R,t[1]=(s*I-u*D-l*T)*R,t[2]=(u*F-o*I+l*S)*R,t[3]=(a*F-n*D-i*A)*R,t[4]=(r*D-a*I+i*T)*R,t[5]=(n*I-r*F-i*S)*R,t[6]=(_*y-m*b+p*E)*R,t[7]=(m*g-v*y-p*x)*R,t[8]=(v*b-_*g+p*M)*R,t):null},a.str=function(t){return"mat3("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+", "+t[8]+")"},a.frob=function(t){return Math.sqrt(Math.pow(t[0],2)+Math.pow(t[1],2)+Math.pow(t[2],2)+Math.pow(t[3],2)+Math.pow(t[4],2)+Math.pow(t[5],2)+Math.pow(t[6],2)+Math.pow(t[7],2)+Math.pow(t[8],2))},a.add=function(t,e,r){return t[0]=e[0]+r[0],t[1]=e[1]+r[1],t[2]=e[2]+r[2],t[3]=e[3]+r[3],t[4]=e[4]+r[4],t[5]=e[5]+r[5],t[6]=e[6]+r[6],t[7]=e[7]+r[7],t[8]=e[8]+r[8],t},a.subtract=function(t,e,r){return t[0]=e[0]-r[0],t[1]=e[1]-r[1],t[2]=e[2]-r[2],t[3]=e[3]-r[3],t[4]=e[4]-r[4],t[5]=e[5]-r[5],t[6]=e[6]-r[6],t[7]=e[7]-r[7],t[8]=e[8]-r[8],t},a.sub=a.subtract,a.multiplyScalar=function(t,e,r){return t[0]=e[0]*r,t[1]=e[1]*r,t[2]=e[2]*r,t[3]=e[3]*r,t[4]=e[4]*r,t[5]=e[5]*r,t[6]=e[6]*r,t[7]=e[7]*r,t[8]=e[8]*r,t},a.multiplyScalarAndAdd=function(t,e,r,n){return t[0]=e[0]+r[0]*n,t[1]=e[1]+r[1]*n,t[2]=e[2]+r[2]*n,t[3]=e[3]+r[3]*n,t[4]=e[4]+r[4]*n,t[5]=e[5]+r[5]*n,t[6]=e[6]+r[6]*n,t[7]=e[7]+r[7]*n,t[8]=e[8]+r[8]*n,t},a.exactEquals=function(t,e){return t[0]===e[0]&&t[1]===e[1]&&t[2]===e[2]&&t[3]===e[3]&&t[4]===e[4]&&t[5]===e[5]&&t[6]===e[6]&&t[7]===e[7]&&t[8]===e[8]},a.equals=function(t,e){var r=t[0],a=t[1],i=t[2],u=t[3],o=t[4],s=t[5],l=t[6],f=t[7],h=t[8],c=e[0],d=e[1],v=e[2],_=e[3],m=e[4],p=e[5],M=t[6],x=e[7],g=e[8];return Math.abs(r-c)<=n.EPSILON*Math.max(1,Math.abs(r),Math.abs(c))&&Math.abs(a-d)<=n.EPSILON*Math.max(1,Math.abs(a),Math.abs(d))&&Math.abs(i-v)<=n.EPSILON*Math.max(1,Math.abs(i),Math.abs(v))&&Math.abs(u-_)<=n.EPSILON*Math.max(1,Math.abs(u),Math.abs(_))&&Math.abs(o-m)<=n.EPSILON*Math.max(1,Math.abs(o),Math.abs(m))&&Math.abs(s-p)<=n.EPSILON*Math.max(1,Math.abs(s),Math.abs(p))&&Math.abs(l-M)<=n.EPSILON*Math.max(1,Math.abs(l),Math.abs(M))&&Math.abs(f-x)<=n.EPSILON*Math.max(1,Math.abs(f),Math.abs(x))&&Math.abs(h-g)<=n.EPSILON*Math.max(1,Math.abs(h),Math.abs(g))},t.exports=a},function(t,e,r){var n=r(11),a={};a.create=function(){var t=new n.ARRAY_TYPE(3);return t[0]=0,t[1]=0,t[2]=0,t},a.clone=function(t){var e=new n.ARRAY_TYPE(3);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e},a.fromValues=function(t,e,r){var a=new n.ARRAY_TYPE(3);return a[0]=t,a[1]=e,a[2]=r,a},a.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t},a.set=function(t,e,r,n){return t[0]=e,t[1]=r,t[2]=n,t},a.add=function(t,e,r){return t[0]=e[0]+r[0],t[1]=e[1]+r[1],t[2]=e[2]+r[2],t},a.subtract=function(t,e,r){return t[0]=e[0]-r[0],t[1]=e[1]-r[1],t[2]=e[2]-r[2],t},a.sub=a.subtract,a.multiply=function(t,e,r){return t[0]=e[0]*r[0],t[1]=e[1]*r[1],t[2]=e[2]*r[2],t},a.mul=a.multiply,a.divide=function(t,e,r){return t[0]=e[0]/r[0],t[1]=e[1]/r[1],t[2]=e[2]/r[2],t},a.div=a.divide,a.ceil=function(t,e){return t[0]=Math.ceil(e[0]),t[1]=Math.ceil(e[1]),t[2]=Math.ceil(e[2]),t},a.floor=function(t,e){return t[0]=Math.floor(e[0]),t[1]=Math.floor(e[1]),t[2]=Math.floor(e[2]),t},a.min=function(t,e,r){return t[0]=Math.min(e[0],r[0]),t[1]=Math.min(e[1],r[1]),t[2]=Math.min(e[2],r[2]),t},a.max=function(t,e,r){return t[0]=Math.max(e[0],r[0]),t[1]=Math.max(e[1],r[1]),t[2]=Math.max(e[2],r[2]),t},a.round=function(t,e){return t[0]=Math.round(e[0]),t[1]=Math.round(e[1]),t[2]=Math.round(e[2]),t},a.scale=function(t,e,r){return t[0]=e[0]*r,t[1]=e[1]*r,t[2]=e[2]*r,t},a.scaleAndAdd=function(t,e,r,n){return t[0]=e[0]+r[0]*n,t[1]=e[1]+r[1]*n,t[2]=e[2]+r[2]*n,t},a.distance=function(t,e){var r=e[0]-t[0],n=e[1]-t[1],a=e[2]-t[2];return Math.sqrt(r*r+n*n+a*a)},a.dist=a.distance,a.squaredDistance=function(t,e){var r=e[0]-t[0],n=e[1]-t[1],a=e[2]-t[2];return r*r+n*n+a*a},a.sqrDist=a.squaredDistance,a.length=function(t){var e=t[0],r=t[1],n=t[2];return Math.sqrt(e*e+r*r+n*n)},a.len=a.length,a.squaredLength=function(t){var e=t[0],r=t[1],n=t[2];return e*e+r*r+n*n},a.sqrLen=a.squaredLength,a.negate=function(t,e){return t[0]=-e[0],t[1]=-e[1],t[2]=-e[2],t},a.inverse=function(t,e){return t[0]=1/e[0],t[1]=1/e[1],t[2]=1/e[2],t},a.normalize=function(t,e){var r=e[0],n=e[1],a=e[2],i=r*r+n*n+a*a;return i>0&&(i=1/Math.sqrt(i),t[0]=e[0]*i,t[1]=e[1]*i,t[2]=e[2]*i),t},a.dot=function(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]},a.cross=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=r[0],o=r[1],s=r[2];return t[0]=a*s-i*o,t[1]=i*u-n*s,t[2]=n*o-a*u,t},a.lerp=function(t,e,r,n){var a=e[0],i=e[1],u=e[2];return t[0]=a+n*(r[0]-a),t[1]=i+n*(r[1]-i),t[2]=u+n*(r[2]-u),t},a.hermite=function(t,e,r,n,a,i){var u=i*i,o=u*(2*i-3)+1,s=u*(i-2)+i,l=u*(i-1),f=u*(3-2*i);return t[0]=e[0]*o+r[0]*s+n[0]*l+a[0]*f,t[1]=e[1]*o+r[1]*s+n[1]*l+a[1]*f,t[2]=e[2]*o+r[2]*s+n[2]*l+a[2]*f,t},a.bezier=function(t,e,r,n,a,i){var u=1-i,o=u*u,s=i*i,l=o*u,f=3*i*o,h=3*s*u,c=s*i;return t[0]=e[0]*l+r[0]*f+n[0]*h+a[0]*c,t[1]=e[1]*l+r[1]*f+n[1]*h+a[1]*c,t[2]=e[2]*l+r[2]*f+n[2]*h+a[2]*c,t},a.random=function(t,e){e=e||1;var r=2*n.RANDOM()*Math.PI,a=2*n.RANDOM()-1,i=Math.sqrt(1-a*a)*e;return t[0]=Math.cos(r)*i,t[1]=Math.sin(r)*i,t[2]=a*e,t},a.transformMat4=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=r[3]*n+r[7]*a+r[11]*i+r[15];return u=u||1,t[0]=(r[0]*n+r[4]*a+r[8]*i+r[12])/u,t[1]=(r[1]*n+r[5]*a+r[9]*i+r[13])/u,t[2]=(r[2]*n+r[6]*a+r[10]*i+r[14])/u,t},a.transformMat3=function(t,e,r){var n=e[0],a=e[1],i=e[2];return t[0]=n*r[0]+a*r[3]+i*r[6],t[1]=n*r[1]+a*r[4]+i*r[7],t[2]=n*r[2]+a*r[5]+i*r[8],t},a.transformQuat=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=r[0],o=r[1],s=r[2],l=r[3],f=l*n+o*i-s*a,h=l*a+s*n-u*i,c=l*i+u*a-o*n,d=-u*n-o*a-s*i;return t[0]=f*l+d*-u+h*-s-c*-o,t[1]=h*l+d*-o+c*-u-f*-s,t[2]=c*l+d*-s+f*-o-h*-u,t},a.rotateX=function(t,e,r,n){var a=[],i=[];return a[0]=e[0]-r[0],a[1]=e[1]-r[1],a[2]=e[2]-r[2],i[0]=a[0],i[1]=a[1]*Math.cos(n)-a[2]*Math.sin(n),i[2]=a[1]*Math.sin(n)+a[2]*Math.cos(n),t[0]=i[0]+r[0],t[1]=i[1]+r[1],t[2]=i[2]+r[2],t},a.rotateY=function(t,e,r,n){var a=[],i=[];return a[0]=e[0]-r[0],a[1]=e[1]-r[1],a[2]=e[2]-r[2],i[0]=a[2]*Math.sin(n)+a[0]*Math.cos(n),i[1]=a[1],i[2]=a[2]*Math.cos(n)-a[0]*Math.sin(n),t[0]=i[0]+r[0],t[1]=i[1]+r[1],t[2]=i[2]+r[2],t},a.rotateZ=function(t,e,r,n){var a=[],i=[];return a[0]=e[0]-r[0],a[1]=e[1]-r[1],a[2]=e[2]-r[2],i[0]=a[0]*Math.cos(n)-a[1]*Math.sin(n),i[1]=a[0]*Math.sin(n)+a[1]*Math.cos(n),i[2]=a[2],t[0]=i[0]+r[0],t[1]=i[1]+r[1],t[2]=i[2]+r[2],t},a.forEach=function(){var t=a.create();return function(e,r,n,a,i,u){var o,s;for(r||(r=3),n||(n=0),s=a?Math.min(a*r+n,e.length):e.length,o=n;s>o;o+=r)t[0]=e[o],t[1]=e[o+1],t[2]=e[o+2],i(t,t,u),e[o]=t[0],e[o+1]=t[1],e[o+2]=t[2];return e}}(),a.angle=function(t,e){var r=a.fromValues(t[0],t[1],t[2]),n=a.fromValues(e[0],e[1],e[2]);a.normalize(r,r),a.normalize(n,n);var i=a.dot(r,n);return i>1?0:Math.acos(i)},a.str=function(t){return"vec3("+t[0]+", "+t[1]+", "+t[2]+")"},a.exactEquals=function(t,e){return t[0]===e[0]&&t[1]===e[1]&&t[2]===e[2]},a.equals=function(t,e){var r=t[0],a=t[1],i=t[2],u=e[0],o=e[1],s=e[2];return Math.abs(r-u)<=n.EPSILON*Math.max(1,Math.abs(r),Math.abs(u))&&Math.abs(a-o)<=n.EPSILON*Math.max(1,Math.abs(a),Math.abs(o))&&Math.abs(i-s)<=n.EPSILON*Math.max(1,Math.abs(i),Math.abs(s))},t.exports=a},function(t,e,r){var n=r(11),a={};a.create=function(){var t=new n.ARRAY_TYPE(4);return t[0]=0,t[1]=0,t[2]=0,t[3]=0,t},a.clone=function(t){var e=new n.ARRAY_TYPE(4);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},a.fromValues=function(t,e,r,a){var i=new n.ARRAY_TYPE(4);return i[0]=t,i[1]=e,i[2]=r,i[3]=a,i},a.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},a.set=function(t,e,r,n,a){return t[0]=e,t[1]=r,t[2]=n,t[3]=a,t},a.add=function(t,e,r){return t[0]=e[0]+r[0],t[1]=e[1]+r[1],t[2]=e[2]+r[2],t[3]=e[3]+r[3],t},a.subtract=function(t,e,r){return t[0]=e[0]-r[0],t[1]=e[1]-r[1],t[2]=e[2]-r[2],t[3]=e[3]-r[3],t},a.sub=a.subtract,a.multiply=function(t,e,r){return t[0]=e[0]*r[0],t[1]=e[1]*r[1],t[2]=e[2]*r[2],t[3]=e[3]*r[3],t},a.mul=a.multiply,a.divide=function(t,e,r){return t[0]=e[0]/r[0],t[1]=e[1]/r[1],t[2]=e[2]/r[2],t[3]=e[3]/r[3],t},a.div=a.divide,a.ceil=function(t,e){return t[0]=Math.ceil(e[0]),t[1]=Math.ceil(e[1]),t[2]=Math.ceil(e[2]),t[3]=Math.ceil(e[3]),t},a.floor=function(t,e){return t[0]=Math.floor(e[0]),t[1]=Math.floor(e[1]),t[2]=Math.floor(e[2]),t[3]=Math.floor(e[3]),t},a.min=function(t,e,r){return t[0]=Math.min(e[0],r[0]),t[1]=Math.min(e[1],r[1]),t[2]=Math.min(e[2],r[2]),t[3]=Math.min(e[3],r[3]),t},a.max=function(t,e,r){return t[0]=Math.max(e[0],r[0]),t[1]=Math.max(e[1],r[1]),t[2]=Math.max(e[2],r[2]),t[3]=Math.max(e[3],r[3]),t},a.round=function(t,e){return t[0]=Math.round(e[0]),t[1]=Math.round(e[1]),t[2]=Math.round(e[2]),t[3]=Math.round(e[3]),t},a.scale=function(t,e,r){return t[0]=e[0]*r,t[1]=e[1]*r,t[2]=e[2]*r,t[3]=e[3]*r,t},a.scaleAndAdd=function(t,e,r,n){return t[0]=e[0]+r[0]*n,t[1]=e[1]+r[1]*n,t[2]=e[2]+r[2]*n,t[3]=e[3]+r[3]*n,t},a.distance=function(t,e){var r=e[0]-t[0],n=e[1]-t[1],a=e[2]-t[2],i=e[3]-t[3];return Math.sqrt(r*r+n*n+a*a+i*i)},a.dist=a.distance,a.squaredDistance=function(t,e){var r=e[0]-t[0],n=e[1]-t[1],a=e[2]-t[2],i=e[3]-t[3];return r*r+n*n+a*a+i*i},a.sqrDist=a.squaredDistance,a.length=function(t){var e=t[0],r=t[1],n=t[2],a=t[3];return Math.sqrt(e*e+r*r+n*n+a*a)},a.len=a.length,a.squaredLength=function(t){var e=t[0],r=t[1],n=t[2],a=t[3];return e*e+r*r+n*n+a*a},a.sqrLen=a.squaredLength,a.negate=function(t,e){return t[0]=-e[0],t[1]=-e[1],t[2]=-e[2],t[3]=-e[3],t},a.inverse=function(t,e){return t[0]=1/e[0],t[1]=1/e[1],t[2]=1/e[2],t[3]=1/e[3],t},a.normalize=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=r*r+n*n+a*a+i*i;return u>0&&(u=1/Math.sqrt(u),t[0]=r*u,t[1]=n*u,t[2]=a*u,t[3]=i*u),t},a.dot=function(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]+t[3]*e[3]},a.lerp=function(t,e,r,n){var a=e[0],i=e[1],u=e[2],o=e[3];return t[0]=a+n*(r[0]-a),t[1]=i+n*(r[1]-i),t[2]=u+n*(r[2]-u),t[3]=o+n*(r[3]-o),t},a.random=function(t,e){return e=e||1,t[0]=n.RANDOM(),t[1]=n.RANDOM(),t[2]=n.RANDOM(),t[3]=n.RANDOM(),a.normalize(t,t),a.scale(t,t,e),t},a.transformMat4=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3];return t[0]=r[0]*n+r[4]*a+r[8]*i+r[12]*u,t[1]=r[1]*n+r[5]*a+r[9]*i+r[13]*u,t[2]=r[2]*n+r[6]*a+r[10]*i+r[14]*u,t[3]=r[3]*n+r[7]*a+r[11]*i+r[15]*u,t},a.transformQuat=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=r[0],o=r[1],s=r[2],l=r[3],f=l*n+o*i-s*a,h=l*a+s*n-u*i,c=l*i+u*a-o*n,d=-u*n-o*a-s*i;return t[0]=f*l+d*-u+h*-s-c*-o,t[1]=h*l+d*-o+c*-u-f*-s,t[2]=c*l+d*-s+f*-o-h*-u,t[3]=e[3],t},a.forEach=function(){var t=a.create();return function(e,r,n,a,i,u){var o,s;for(r||(r=4),n||(n=0),s=a?Math.min(a*r+n,e.length):e.length,o=n;s>o;o+=r)t[0]=e[o],t[1]=e[o+1],t[2]=e[o+2],t[3]=e[o+3],i(t,t,u),e[o]=t[0],e[o+1]=t[1],e[o+2]=t[2],e[o+3]=t[3];return e}}(),a.str=function(t){return"vec4("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},a.exactEquals=function(t,e){return t[0]===e[0]&&t[1]===e[1]&&t[2]===e[2]&&t[3]===e[3]},a.equals=function(t,e){var r=t[0],a=t[1],i=t[2],u=t[3],o=e[0],s=e[1],l=e[2],f=e[3];return Math.abs(r-o)<=n.EPSILON*Math.max(1,Math.abs(r),Math.abs(o))&&Math.abs(a-s)<=n.EPSILON*Math.max(1,Math.abs(a),Math.abs(s))&&Math.abs(i-l)<=n.EPSILON*Math.max(1,Math.abs(i),Math.abs(l))&&Math.abs(u-f)<=n.EPSILON*Math.max(1,Math.abs(u),Math.abs(f))},t.exports=a},function(t,e){t.exports="// fxaa.frag\n\n#define SHADER_NAME FXAA\n\nprecision highp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform vec2 uResolution;\n\n\nfloat FXAA_SUBPIX_SHIFT = 1.0/4.0;\n#define FXAA_REDUCE_MIN   (1.0/ 128.0)\n#define FXAA_REDUCE_MUL   (1.0 / 8.0)\n#define FXAA_SPAN_MAX     8.0\n\n\nvec4 applyFXAA(sampler2D tex) {\n    vec4 color;\n    vec2 fragCoord = gl_FragCoord.xy;\n    vec3 rgbNW = texture2D(tex, (fragCoord + vec2(-1.0, -1.0)) * uResolution).xyz;\n    vec3 rgbNE = texture2D(tex, (fragCoord + vec2(1.0, -1.0)) * uResolution).xyz;\n    vec3 rgbSW = texture2D(tex, (fragCoord + vec2(-1.0, 1.0)) * uResolution).xyz;\n    vec3 rgbSE = texture2D(tex, (fragCoord + vec2(1.0, 1.0)) * uResolution).xyz;\n    vec3 rgbM  = texture2D(tex, fragCoord  * uResolution).xyz;\n    vec3 luma = vec3(0.299, 0.587, 0.114);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot(rgbM,  luma);\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\n    vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *\n                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\n    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n              dir * rcpDirMin)) * uResolution;\n\n    vec3 rgbA = 0.5 * (\n        texture2D(tex, fragCoord * uResolution + dir * (1.0 / 3.0 - 0.5)).xyz +\n        texture2D(tex, fragCoord * uResolution + dir * (2.0 / 3.0 - 0.5)).xyz);\n    vec3 rgbB = rgbA * 0.5 + 0.25 * (\n        texture2D(tex, fragCoord * uResolution + dir * -0.5).xyz +\n        texture2D(tex, fragCoord * uResolution + dir * 0.5).xyz);\n\n    float lumaB = dot(rgbB, luma);\n    if ((lumaB < lumaMin) || (lumaB > lumaMax))\n        color = vec4(rgbA, 1.0);\n    else\n        color = vec4(rgbB, 1.0);\n    return color;\n}\n\nvoid main(void) {\n 	vec4 color = applyFXAA(texture);\n    gl_FragColor = color;\n}"},function(t,e){t.exports="// generalWithNormal.vert\n\n#define SHADER_NAME GENERAL_VERTEX\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec3 aNormal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\nuniform mat3 uNormalMatrix;\n\nuniform vec3 position;\nuniform vec3 scale;\n\nvarying vec2 vTextureCoord;\nvarying vec3 vNormal;\n\nvoid main(void) {\n	vec3 pos      = aVertexPosition * scale;\n	pos           += position;\n	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);\n	\n	vTextureCoord = aTextureCoord;\n	vNormal       = normalize(uNormalMatrix * aNormal);\n}"},function(t,e){t.exports="// basic.frag\n\n#define SHADER_NAME SKYBOX_FRAGMENT\n\nprecision mediump float;\n#define GLSLIFY 1\nuniform samplerCube texture;\nvarying vec2 vTextureCoord;\nvarying vec3 vVertex;\n\nvoid main(void) {\n    gl_FragColor = textureCube(texture, vVertex);\n}"},function(t,e){t.exports="// basic.vert\n\n#define SHADER_NAME SKYBOX_VERTEX\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec3 aNormal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec3 vVertex;\nvarying vec3 vNormal;\n\nvoid main(void) {\n	mat4 matView = uViewMatrix;\n	matView[3][0] = 0.0;\n	matView[3][1] = 0.0;\n	matView[3][2] = 0.0;\n	\n	gl_Position = uProjectionMatrix * matView * uModelMatrix * vec4(aVertexPosition, 1.0);\n	vTextureCoord = aTextureCoord;\n	\n	vVertex = aVertexPosition;\n	vNormal = aNormal;\n}"},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(8),l=n(s),f=r(3),h=n(f),c=r(7),d=n(c),v=r(33),_=n(v),m=r(56),p=n(m),M=r(12),x=n(M),g=r(16),E=n(g),b=r(9),y=n(b),S=r(32),T=n(S),I=r(87),A=n(I),F=r(88),D=n(F),R=r(89),w=n(R),P=r(23),N=n(P),O=r(108),L=n(O),k=r(37),C=n(k),U=r(112),B=n(U),X=r(64),q=n(X),V=r(111),z=n(V),j=r(34),G=n(j),Y=r(57),W=n(Y),H=r(35),Z=n(H),Q=r(90),K=n(Q),J=r(58),$=n(J),tt=r(59),et=n(tt),rt=r(36),nt=n(rt),at=r(104),it=n(at),ut=r(103),ot=n(ut),st=r(102),lt=n(st),ft=r(105),ht=n(ft),ct=r(27),dt=n(ct),vt=r(62),_t=n(vt),mt=r(106),pt=n(mt),Mt=r(63),xt=n(Mt),gt=r(61),Et=n(gt),bt=r(107),yt=n(bt),St=r(93),Tt=n(St),It=r(91),At=n(It),Ft=r(92),Dt=n(Ft),Rt=r(94),wt=n(Rt),Pt=r(96),Nt=n(Pt),Ot=r(98),Lt=n(Ot),kt=r(97),Ct=n(kt),Ut=r(95),Bt=n(Ut),Xt=r(99),qt=n(Xt),Vt=r(100),zt=n(Vt),jt=r(101),Gt=n(jt),Yt=r(65),Wt=n(Yt),Ht="0.1.24",Zt=function(){function t(){(0,i.default)(this,t),this.glm=l.default,this.GL=h.default,this.GLTool=h.default,this.GLShader=d.default,this.GLTexture=_.default,this.GLCubeTexture=p.default,this.Mesh=x.default,this.Geom=E.default,this.Batch=y.default,this.FrameBuffer=T.default,this.CubeFrameBuffer=A.default,this.Scheduler=N.default,this.EventDispatcher=L.default,this.EaseNumber=C.default,this.TweenNumber=B.default,this.Camera=G.default,this.CameraOrtho=W.default,this.CameraPerspective=Z.default,this.Ray=$.default,this.CameraCube=K.default,this.OrbitalControl=q.default,this.QuatRotation=z.default,this.BinaryLoader=nt.default,this.ObjLoader=it.default,this.ColladaParser=lt.default,this.HDRLoader=ot.default,this.BatchCopy=Tt.default,this.BatchAxis=At.default,this.BatchBall=Dt.default,this.BatchBall=Dt.default,this.BatchLine=Nt.default,this.BatchSkybox=Lt.default,this.BatchSky=Ct.default,this.BatchFXAA=Bt.default,this.BatchDotsPlane=wt.default,this.Scene=qt.default,this.View=zt.default,this.View3D=Gt.default,this.Object3D=et.default,this.ShaderLibs=Wt.default,this.EffectComposer=ht.default,this.Pass=dt.default,this.PassMacro=_t.default,this.PassBlur=pt.default,this.PassVBlur=xt.default,this.PassHBlur=Et.default,this.PassFxaa=yt.default,this.MultisampleFrameBuffer=D.default,this.TransformFeedbackObject=w.default;for(var e in l.default)l.default[e]&&(window[e]=l.default[e])}return(0,o.default)(t,[{key:"log",value:function(){navigator.userAgent.indexOf("Chrome")>-1?console.log("%clib alfrid : VERSION "+Ht,"background: #193441; color: #FCFFF5"):console.log("lib alfrid : VERSION ",Ht),console.log("%cClasses : ","color: #193441");for(var t in this)this[t]&&console.log("%c - "+t,"color: #3E606F")}}]),t}(),Qt=new Zt;e.default=Qt,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(3),l=n(s),f=r(56),h=n(f),c=void 0,d=function(){function t(e){var r=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];(0,i.default)(this,t),c=l.default.gl,this._size=e,this.magFilter=r.magFilter||c.LINEAR,this.minFilter=r.minFilter||c.LINEAR,this.wrapS=r.wrapS||c.CLAMP_TO_EDGE,this.wrapT=r.wrapT||c.CLAMP_TO_EDGE,this._init()}return(0,o.default)(t,[{key:"_init",value:function(){this.texture=c.createTexture(),this.glTexture=new h.default(this.texture,{},!0),c.bindTexture(c.TEXTURE_CUBE_MAP,this.texture),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_MAG_FILTER,this.magFilter),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_MIN_FILTER,this.minFilter),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_WRAP_S,this.wrapS),c.texParameteri(c.TEXTURE_CUBE_MAP,c.TEXTURE_WRAP_T,this.wrapT);for(var t=[c.TEXTURE_CUBE_MAP_POSITIVE_X,c.TEXTURE_CUBE_MAP_NEGATIVE_X,c.TEXTURE_CUBE_MAP_POSITIVE_Y,c.TEXTURE_CUBE_MAP_NEGATIVE_Y,c.TEXTURE_CUBE_MAP_POSITIVE_Z,c.TEXTURE_CUBE_MAP_NEGATIVE_Z],e=0;e<t.length;e++)c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL,!1),c.texImage2D(t[e],0,c.RGBA,this.width,this.height,0,c.RGBA,c.FLOAT,null);this._frameBuffers=[];for(var r=0;r<t.length;r++){var n=c.createFramebuffer();c.bindFramebuffer(c.FRAMEBUFFER,n),c.framebufferTexture2D(c.FRAMEBUFFER,c.COLOR_ATTACHMENT0,t[r],this.texture,0);var a=c.checkFramebufferStatus(c.FRAMEBUFFER);a!==c.FRAMEBUFFER_COMPLETE&&console.log("'gl.checkFramebufferStatus() returned '"+a),this._frameBuffers.push(n)}c.bindFramebuffer(c.FRAMEBUFFER,null),c.bindRenderbuffer(c.RENDERBUFFER,null),c.bindTexture(c.TEXTURE_CUBE_MAP,null)}},{key:"bind",value:function(t){l.default.viewport(0,0,this.width,this.height),c.bindFramebuffer(c.FRAMEBUFFER,this._frameBuffers[t])}},{key:"unbind",value:function(){c.bindFramebuffer(c.FRAMEBUFFER,null),l.default.viewport(0,0,l.default.width,l.default.height)}},{key:"getTexture",value:function(){return this.glTexture}},{key:"width",get:function(){return this._size}},{key:"height",get:function(){return this._size}}]),t}();e.default=d,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}function a(t){return 0!==t&&!(t&t-1)}Object.defineProperty(e,"__esModule",{value:!0});var i=r(1),u=n(i),o=r(2),s=n(o),l=r(3),f=n(l),h=r(33),c=n(h),d=void 0,v=function(){function t(e,r){var n=arguments.length<=2||void 0===arguments[2]?{}:arguments[2];(0,u.default)(this,t),d=f.default.gl,this.width=e,this.height=r,this.magFilter=n.magFilter||d.LINEAR,this.minFilter=n.minFilter||d.LINEAR,this.wrapS=n.wrapS||d.CLAMP_TO_EDGE,this.wrapT=n.wrapT||d.CLAMP_TO_EDGE,this.useDepth=n.useDepth||!0,this.useStencil=n.useStencil||!1,this.texelType=n.type,this._numSample=n.numSample||8,a(this.width)&&a(this.height)||(this.wrapS=this.wrapT=d.CLAMP_TO_EDGE,this.minFilter===d.LINEAR_MIPMAP_NEAREST&&(this.minFilter=d.LINEAR)),this._init()}return(0,s.default)(t,[{key:"_init",value:function(){var t=d.UNSIGNED_BYTE;this.texelType&&(t=this.texelType),this.texelType=t,this.frameBuffer=d.createFramebuffer(),this.frameBufferColor=d.createFramebuffer(),this.renderBufferColor=d.createRenderbuffer(),this.renderBufferDepth=d.createRenderbuffer(),this.glTexture=this._createTexture(),this.glDepthTexture=this._createTexture(d.DEPTH_COMPONENT16,d.UNSIGNED_SHORT,d.DEPTH_COMPONENT,!0),d.bindRenderbuffer(d.RENDERBUFFER,this.renderBufferColor),d.renderbufferStorageMultisample(d.RENDERBUFFER,this._numSample,d.RGBA8,this.width,this.height),d.bindRenderbuffer(d.RENDERBUFFER,this.renderBufferDepth),d.renderbufferStorageMultisample(d.RENDERBUFFER,this._numSample,d.DEPTH_COMPONENT16,this.width,this.height),d.bindFramebuffer(d.FRAMEBUFFER,this.frameBuffer),d.framebufferRenderbuffer(d.FRAMEBUFFER,d.COLOR_ATTACHMENT0,d.RENDERBUFFER,this.renderBufferColor),d.framebufferRenderbuffer(d.FRAMEBUFFER,d.DEPTH_ATTACHMENT,d.RENDERBUFFER,this.renderBufferDepth),d.bindFramebuffer(d.FRAMEBUFFER,null),d.bindFramebuffer(d.FRAMEBUFFER,this.frameBufferColor),d.framebufferTexture2D(d.FRAMEBUFFER,d.COLOR_ATTACHMENT0,d.TEXTURE_2D,this.glTexture.texture,0),d.bindFramebuffer(d.FRAMEBUFFER,null)}},{key:"_createTexture",value:function(t,e,r){var n=arguments.length<=3||void 0===arguments[3]?!1:arguments[3];void 0===t&&(t=d.RGBA),void 0===e&&(e=this.texelType),r||(r=t);var a=d.createTexture(),i=new c.default(a,!0),u=n?f.default.NEAREST:this.magFilter,o=n?f.default.NEAREST:this.minFilter;return d.bindTexture(d.TEXTURE_2D,a),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MAG_FILTER,u),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,o),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_S,this.wrapS),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_T,this.wrapT),d.texImage2D(d.TEXTURE_2D,0,t,this.width,this.height,0,r,e,null),d.bindTexture(d.TEXTURE_2D,null),i}},{key:"bind",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];t&&f.default.viewport(0,0,this.width,this.height),d.bindFramebuffer(d.FRAMEBUFFER,this.frameBuffer)}},{key:"unbind",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];t&&f.default.viewport(0,0,f.default.width,f.default.height);var e=this.width,r=this.height;d.bindFramebuffer(d.FRAMEBUFFER,null),d.bindFramebuffer(d.READ_FRAMEBUFFER,this.frameBuffer),d.bindFramebuffer(d.DRAW_FRAMEBUFFER,this.frameBufferColor),d.clearBufferfv(d.COLOR,0,[0,0,0,0]),d.blitFramebuffer(0,0,e,r,0,0,e,r,d.COLOR_BUFFER_BIT,f.default.NEAREST),d.bindFramebuffer(d.FRAMEBUFFER,null)}},{key:"getTexture",value:function(){arguments.length<=0||void 0===arguments[0]?0:arguments[0];return this.glTexture}},{key:"getDepthTexture",value:function(){return this.glDepthTexture}}]),t}();e.default=v,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(3),l=n(s),f=r(7),h=n(f),c=r(12),d=n(c),v=void 0,_=function(){function t(e,r){(0,i.default)(this,t),v=l.default.gl,this._vs=e,this._fs=r,this._init()}return(0,o.default)(t,[{key:"_init",value:function(){this._meshCurrent=new d.default,this._meshTarget=new d.default,this._numPoints=-1,this._varyings=[],this.transformFeedback=v.createTransformFeedback()}},{key:"bufferData",value:function(t,e,r){var n=!!r;console.log("is Transform feedback ?",e,n),this._meshCurrent.bufferData(t,e,null,v.STREAM_COPY,!1),this._meshTarget.bufferData(t,e,null,v.STREAM_COPY,!1),n&&(this._varyings.push(r),this._numPoints<0&&(this._numPoints=t.length))}},{key:"bufferIndex",value:function(t){this._meshCurrent.bufferIndex(t),this._meshTarget.bufferIndex(t)}},{key:"uniform",value:function(t,e,r){this.shader&&this.shader.uniform(t,e,r)}},{key:"generate",value:function(){this.shader=new h.default(this._vs,this._fs,this._varyings)}},{key:"render",value:function(){this.shader||this.generate(),this.shader.bind(),l.default.drawTransformFeedback(this),this._swap()}},{key:"_swap",value:function(){var t=this._meshCurrent;this._meshCurrent=this._meshTarget,
this._meshTarget=t}},{key:"numPoints",get:function(){return this._numPoints}},{key:"meshCurrent",get:function(){return this._meshCurrent}},{key:"meshTarget",get:function(){return this._meshTarget}},{key:"meshSource",get:function(){return this._meshCurrent}},{key:"meshDestination",get:function(){return this._meshTarget}}]),t}();e.default=_,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(5),d=n(c),v=r(35),_=n(v),m=r(8),p=n(m),M=p.default.vec3,x=[[M.fromValues(0,0,0),M.fromValues(1,0,0),M.fromValues(0,-1,0)],[M.fromValues(0,0,0),M.fromValues(-1,0,0),M.fromValues(0,-1,0)],[M.fromValues(0,0,0),M.fromValues(0,1,0),M.fromValues(0,0,1)],[M.fromValues(0,0,0),M.fromValues(0,-1,0),M.fromValues(0,0,-1)],[M.fromValues(0,0,0),M.fromValues(0,0,1),M.fromValues(0,-1,0)],[M.fromValues(0,0,0),M.fromValues(0,0,-1),M.fromValues(0,-1,0)]],g=function(t){function e(){(0,o.default)(this,e);var t=(0,h.default)(this,(0,i.default)(e).call(this));return t.setPerspective(Math.PI/2,1,.1,1e3),t}return(0,d.default)(e,t),(0,l.default)(e,[{key:"face",value:function(t){var e=x[t];this.lookAt(e[0],e[1],e[2])}}]),e}(_.default);e.default=g,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(6),l=n(s),f=r(5),h=n(f),c=r(3),d=n(c),v=r(12),_=n(v),m=r(7),p=n(m),M=r(9),x=n(M),g=r(169),E=r(168),b=function(t){function e(){(0,o.default)(this,e);var t=[],r=[],n=[0,1,2,3,4,5],a=9999;t.push([-a,0,0]),t.push([a,0,0]),t.push([0,-a,0]),t.push([0,a,0]),t.push([0,0,-a]),t.push([0,0,a]),r.push([1,0,0]),r.push([1,0,0]),r.push([0,1,0]),r.push([0,1,0]),r.push([0,0,1]),r.push([0,0,1]);var u=new _.default(d.default.LINES);u.bufferVertex(t),u.bufferIndex(n),u.bufferData(r,"aColor",3);var s=new p.default(g,E);return(0,l.default)(this,(0,i.default)(e).call(this,u,s))}return(0,h.default)(e,t),e}(x.default);e.default=b,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(13),d=n(c),v=r(5),_=n(v),m=r(16),p=n(m),M=r(7),x=n(M),g=r(9),E=n(g),b=r(83),y=r(31),S=function(t){function e(){(0,o.default)(this,e);var t=p.default.sphere(1,24),r=new x.default(b,y);return(0,h.default)(this,(0,i.default)(e).call(this,t,r))}return(0,_.default)(e,t),(0,l.default)(e,[{key:"draw",value:function(){var t=arguments.length<=0||void 0===arguments[0]?[0,0,0]:arguments[0],r=arguments.length<=1||void 0===arguments[1]?[1,1,1]:arguments[1],n=arguments.length<=2||void 0===arguments[2]?[1,1,1]:arguments[2],a=arguments.length<=3||void 0===arguments[3]?1:arguments[3];this.shader.bind(),this.shader.uniform("position","uniform3fv",t),this.shader.uniform("scale","uniform3fv",r),this.shader.uniform("color","uniform3fv",n),this.shader.uniform("opacity","uniform1f",a),(0,d.default)((0,i.default)(e.prototype),"draw",this).call(this)}}]),e}(E.default);e.default=S,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(13),d=n(c),v=r(5),_=n(v),m=r(16),p=n(m),M=r(7),x=n(M),g=r(9),E=n(g),b=r(54),y=r(55),S=function(t){function e(){(0,o.default)(this,e);var t=p.default.bigTriangle(),r=new x.default(b,y),n=(0,h.default)(this,(0,i.default)(e).call(this,t,r));return r.bind(),r.uniform("texture","uniform1i",0),n}return(0,_.default)(e,t),(0,l.default)(e,[{key:"draw",value:function(t){this.shader.bind(),t.bind(0),(0,d.default)((0,i.default)(e.prototype),"draw",this).call(this)}}]),e}(E.default);e.default=S,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(13),d=n(c),v=r(5),_=n(v),m=r(3),p=n(m),M=r(12),x=n(M),g=r(7),E=n(g),b=r(9),y=n(b),S=r(174),T=r(31),I=function(t){function e(){(0,o.default)(this,e);var t=[],r=[],n=0,a=100,u=void 0,s=void 0;for(u=-a;a>u;u+=1)for(s=-a;a>s;s+=1)t.push([u,s,0]),r.push(n),n++,t.push([u,0,s]),r.push(n),n++;var l=new x.default(p.default.POINTS);l.bufferVertex(t),l.bufferIndex(r);var f=new E.default(S,T),c=(0,h.default)(this,(0,i.default)(e).call(this,l,f));return c.color=[1,1,1],c.opacity=.5,c}return(0,_.default)(e,t),(0,l.default)(e,[{key:"draw",value:function(){this.shader.bind(),this.shader.uniform("color","uniform3fv",this.color),this.shader.uniform("opacity","uniform1f",this.opacity),(0,d.default)((0,i.default)(e.prototype),"draw",this).call(this)}}]),e}(y.default);e.default=I,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(13),d=n(c),v=r(5),_=n(v),m=r(3),p=n(m),M=r(16),x=n(M),g=r(7),E=n(g),b=r(9),y=n(b),S=r(54),T=r(82),I=function(t){function e(){(0,o.default)(this,e);var t=x.default.bigTriangle(),r=new E.default(S,T),n=(0,h.default)(this,(0,i.default)(e).call(this,t,r));return r.bind(),r.uniform("texture","uniform1i",0),n}return(0,_.default)(e,t),(0,l.default)(e,[{key:"draw",value:function(t){this.shader.bind(),t.bind(0),this.shader.uniform("uResolution","vec2",[1/p.default.width,1/p.default.height]),(0,d.default)((0,i.default)(e.prototype),"draw",this).call(this)}}]),e}(y.default);e.default=I,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(13),d=n(c),v=r(5),_=n(v),m=r(3),p=n(m),M=r(12),x=n(M),g=r(7),E=n(g),b=r(9),y=n(b),S=r(53),T=r(31),I=function(t){function e(){(0,o.default)(this,e);var t=[],r=[0,1],n=[[0,0],[1,1]];t.push([0,0,0]),t.push([0,0,0]);var a=new x.default(p.default.LINES);a.bufferVertex(t),a.bufferTexCoord(n),a.bufferIndex(r);var u=new E.default(S,T);return(0,h.default)(this,(0,i.default)(e).call(this,a,u))}return(0,_.default)(e,t),(0,l.default)(e,[{key:"draw",value:function(t,r){var n=arguments.length<=2||void 0===arguments[2]?[1,1,1]:arguments[2],a=arguments.length<=3||void 0===arguments[3]?1:arguments[3];this._mesh.bufferVertex([t,r]),this._shader.bind(),this._shader.uniform("color","vec3",n),this._shader.uniform("opacity","float",a),(0,d.default)((0,i.default)(e.prototype),"draw",this).call(this)}}]),e}(y.default);e.default=I,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(13),d=n(c),v=r(5),_=n(v),m=r(16),p=n(m),M=r(7),x=n(M),g=r(9),E=n(g),b=r(175),y=r(55),S=function(t){function e(){var t=arguments.length<=0||void 0===arguments[0]?50:arguments[0],r=arguments.length<=1||void 0===arguments[1]?24:arguments[1];(0,o.default)(this,e);var n=p.default.sphere(t,r,!0),a=new x.default(b,y);return(0,h.default)(this,(0,i.default)(e).call(this,n,a))}return(0,_.default)(e,t),(0,l.default)(e,[{key:"draw",value:function(t){this.shader.bind(),t.bind(0),(0,d.default)((0,i.default)(e.prototype),"draw",this).call(this)}}]),e}(E.default);e.default=S,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(13),d=n(c),v=r(5),_=n(v),m=r(16),p=n(m),M=r(7),x=n(M),g=r(9),E=n(g),b=r(85),y=r(84),S=function(t){function e(){var t=arguments.length<=0||void 0===arguments[0]?20:arguments[0];(0,o.default)(this,e);var r=p.default.skybox(t),n=new x.default(b,y);return(0,h.default)(this,(0,i.default)(e).call(this,r,n))}return(0,_.default)(e,t),(0,l.default)(e,[{key:"draw",value:function(t){this.shader.bind(),t.bind(0),(0,d.default)((0,i.default)(e.prototype),"draw",this).call(this)}}]),e}(E.default);e.default=S,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(23),l=n(s),f=r(3),h=n(f),c=r(35),d=n(c),v=r(57),_=n(v),m=r(64),p=n(m),M=function(){function t(){var e=this;(0,i.default)(this,t),this._children=[],this._matrixIdentity=mat4.create(),h.default.enableAlphaBlending(),this._init(),this._initTextures(),this._initViews(),this._efIndex=l.default.addEF(function(){return e._loop()}),window.addEventListener("resize",function(){return e.resize()})}return(0,o.default)(t,[{key:"update",value:function(){}},{key:"render",value:function(){}},{key:"stop",value:function(){-1!==this._efIndex&&(this._efIndex=l.default.removeEF(this._efIndex))}},{key:"start",value:function(){var t=this;-1===this._efIndex&&(this._efIndex=l.default.addEF(function(){return t._loop()}))}},{key:"resize",value:function(){h.default.setSize(window.innerWidth,window.innerHeight),this.camera.setAspectRatio(h.default.aspectRatio)}},{key:"addChild",value:function(t){this._children.push(t)}},{key:"removeChild",value:function(t){var e=this._children.indexOf(t);return-1==e?void console.warn("Child no exist"):void this._children.splice(e,1)}},{key:"_initTextures",value:function(){}},{key:"_initViews",value:function(){}},{key:"_renderChildren",value:function(){for(var t=void 0,e=0;e<this._children.length;e++)t=this._children[e],t.toRender();h.default.rotate(this._matrixIdentity)}},{key:"_init",value:function(){this.camera=new d.default,this.camera.setPerspective(45*Math.PI/180,h.default.aspectRatio,.1,100),this.orbitalControl=new p.default(this.camera,window,15),this.orbitalControl.radius.value=10,this.cameraOrtho=new _.default}},{key:"_loop",value:function(){h.default.viewport(0,0,h.default.width,h.default.height),h.default.setMatrices(this.camera),this.update(),this._renderChildren(),this.render()}}]),t}();e.default=M,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(7),l=n(s),f=function(){function t(e,r){(0,i.default)(this,t),this.shader=new l.default(e,r),this._init()}return(0,o.default)(t,[{key:"_init",value:function(){}},{key:"render",value:function(){}}]),t}();e.default=f,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(5),d=n(c),v=r(59),_=n(v),m=r(7),p=n(m),M=r(3),x=n(M),g=function(t){function e(t,r){(0,o.default)(this,e);var n=(0,h.default)(this,(0,i.default)(e).call(this));return n._children=[],n.shader=new p.default(t,r),n._init(),n._matrixTemp=mat4.create(),n}return(0,d.default)(e,t),(0,l.default)(e,[{key:"_init",value:function(){}},{key:"addChild",value:function(t){this._children.push(t)}},{key:"removeChild",value:function(t){var e=this._children.indexOf(t);return-1==e?void console.warn("Child no exist"):void this._children.splice(e,1)}},{key:"toRender",value:function(t){void 0===t&&(t=mat4.create()),mat4.mul(this._matrixTemp,t,this.matrix),x.default.rotate(this._matrixTemp),this.render();for(var e=0;e<this._children.length;e++){var r=this._children[e];r.toRender(this.matrix)}}},{key:"render",value:function(){}}]),e}(_.default);e.default=g,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(124),i=n(a),u=r(12),o=n(u),s=function(t){var e={};t.forEach(function(t){var r=t.mesh,n=r.vertices,a=r.normals,i=r.coords,u=r.triangles,s=r.name;if(!e[s]){var l=(new o.default).bufferFlattenData(n,"aVertexPosition",3).bufferFlattenData(i,"aTextureCoord",2).bufferFlattenData(a,"aNormal",3).bufferIndex(u);e[s]=l}t.glMesh=e[s]})},l=function(t){var e=i.default.parse(t);return s(e),e},f=function(t,e){i.default.load(t,function(t){s(t),e(t)})},h={parse:l,load:f};e.default=h,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(5),d=n(c),v=r(36),_=n(v),m=r(110),p=n(m),M=function(t){function e(){return(0,o.default)(this,e),(0,h.default)(this,(0,i.default)(e).call(this,!0))}return(0,d.default)(e,t),(0,l.default)(e,[{key:"parse",value:function(t){return(0,p.default)(t)}},{key:"_onLoaded",value:function(){var t=this.parse(this._req.response);this._callback&&this._callback(t)}}]),e}(_.default);M.parse=function(t){return(0,p.default)(t)},e.default=M,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(2),l=n(s),f=r(6),h=n(f),c=r(13),d=n(c),v=r(5),_=n(v),m=r(36),p=n(m),M=r(12),x=n(M),g=function(t){function e(){return(0,o.default)(this,e),(0,h.default)(this,(0,i.default)(e).apply(this,arguments))}return(0,_.default)(e,t),(0,l.default)(e,[{key:"load",value:function(t,r){var n=arguments.length<=2||void 0===arguments[2]?4:arguments[2];this._drawType=n,(0,d.default)((0,i.default)(e.prototype),"load",this).call(this,t,r)}},{key:"_onLoaded",value:function(){this.parseObj(this._req.response)}},{key:"parseObj",value:function(t){function e(t){var e=parseInt(t);return 3*(e>=0?e-1:e+c.length/3)}function r(t){var e=parseInt(t);return 3*(e>=0?e-1:e+d.length/3)}function n(t){var e=parseInt(t);return 2*(e>=0?e-1:e+v.length/2)}function a(t,e,r){l.push([c[t],c[t+1],c[t+2]]),l.push([c[e],c[e+1],c[e+2]]),l.push([c[r],c[r+1],c[r+2]]),_.push(3*m+0),_.push(3*m+1),_.push(3*m+2),m++}function i(t,e,r){f.push([v[t],v[t+1]]),f.push([v[e],v[e+1]]),f.push([v[r],v[r+1]])}function u(t,e,r){h.push([d[t],d[t+1],d[t+2]]),h.push([d[e],d[e+1],d[e+2]]),h.push([d[r],d[r+1],d[r+2]])}function o(t,o,s,l,f,h,c,d,v,_,m,p){var M=e(t),x=e(o),g=e(s),E=void 0;void 0===l?a(M,x,g):(E=e(l),a(M,x,E),a(x,g,E)),void 0!==f&&(M=n(f),x=n(h),g=n(c),void 0===l?i(M,x,g):(E=n(d),i(M,x,E),i(x,g,E))),void 0!==v&&(M=r(v),x=r(_),g=r(m),void 0===l?u(M,x,g):(E=r(p),u(M,x,E),u(x,g,E)))}for(var s=t.split("\n"),l=[],f=[],h=[],c=[],d=[],v=[],_=[],m=0,p=void 0,M=/v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/,x=/vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/,g=/vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/,E=/f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/,b=/f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/,y=/f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/,S=/f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/,T=0;T<s.length;T++){var I=s[T];I=I.trim(),0!==I.length&&"#"!==I.charAt(0)&&(null!==(p=M.exec(I))?c.push(parseFloat(p[1]),parseFloat(p[2]),parseFloat(p[3])):null!==(p=x.exec(I))?d.push(parseFloat(p[1]),parseFloat(p[2]),parseFloat(p[3])):null!==(p=g.exec(I))?v.push(parseFloat(p[1]),parseFloat(p[2])):null!==(p=E.exec(I))?o(p[1],p[2],p[3],p[4]):null!==(p=b.exec(I))?o(p[2],p[5],p[8],p[11],p[3],p[6],p[9],p[12]):null!==(p=y.exec(I))?o(p[2],p[6],p[10],p[14],p[3],p[7],p[11],p[15],p[4],p[8],p[12],p[16]):null!==(p=S.exec(I))&&o(p[2],p[5],p[8],p[11],void 0,void 0,void 0,void 0,p[3],p[6],p[9],p[12]))}return this._generateMeshes({positions:l,coords:f,normals:h,indices:_})}},{key:"_generateMeshes",value:function(t){var e=65535,r=t.normals.length>0,n=t.coords.length>0,a=void 0;if(t.positions.length>e){var i=[],u=0,o={};for(o.positions=t.positions.concat(),o.coords=t.coords.concat(),o.indices=t.indices.concat(),o.normals=t.normals.concat();t.indices.length>0;){for(var s=Math.min(e,t.positions.length),l=t.indices.splice(0,s),f=[],h=[],c=[],d=void 0,v=0,_=0;_<l.length;_++)l[_]>v&&(v=l[_]),d=l[_],f.push(o.positions[d]),n&&h.push(o.coords[d]),r&&c.push(o.normals[d]),l[_]-=u;u=v+1,a=new x.default(this._drawType),a.bufferVertex(f),n&&a.bufferTexCoord(h),a.bufferIndex(l),r&&a.bufferNormal(c),i.push(a)}return this._callback&&this._callback(i,o),i}return a=new x.default(this._drawType),a.bufferVertex(t.positions),n&&a.bufferTexCoord(t.coords),a.bufferIndex(t.indices),r&&a.bufferNormal(t.normals),this._callback&&this._callback(a,t),a}}]),e}(p.default);g.parse=function(t){var e=new g;return e.parseObj(t)},e.default=g,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(27),l=(n(s),r(3)),f=n(l),h=r(16),c=n(h),d=r(32),v=n(d),_=function(){function t(e,r){arguments.length<=2||void 0===arguments[2]?{}:arguments[2];(0,i.default)(this,t),this._width=e||f.default.width,this._height=r||f.default.height,this._params={},this.setSize(e,r),this._mesh=c.default.bigTriangle(),this._passes=[],this._returnTexture}return(0,o.default)(t,[{key:"addPass",value:function(t){if(t.passes)return void this.addPass(t.passes);if(t.length)for(var e=0;e<t.length;e++)this._passes.push(t[e]);else this._passes.push(t)}},{key:"render",value:function(t){var e=this,r=t,n=void 0;return this._passes.forEach(function(t){n=t.hasFbo?t.fbo:e._fboTarget,n.bind(),f.default.clear(0,0,0,0),t.render(r),f.default.draw(e._mesh),n.unbind(),t.hasFbo?r=t.fbo.getTexture():(e._swap(),r=e._fboCurrent.getTexture())}),this._returnTexture=r,r}},{key:"_swap",value:function(){var t=this._fboCurrent;this._fboCurrent=this._fboTarget,this._fboTarget=t,this._current=this._fboCurrent,this._target=this._fboTarget}},{key:"setSize",value:function(t,e){this._width=t,this._height=e,this._fboCurrent=new v.default(this._width,this._height,this._params),this._fboTarget=new v.default(this._width,this._height,this._params)}},{key:"getTexture",value:function(){return this._returnTexture}},{key:"passes",get:function(){return this._passes}}]),t}();e.default=_,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(6),l=n(s),f=r(5),h=n(f),c=r(63),d=n(c),v=r(61),_=n(v),m=r(62),p=n(m),M=function(t){function e(){var t=arguments.length<=0||void 0===arguments[0]?9:arguments[0],r=arguments[1],n=arguments[2],a=arguments[3];(0,o.default)(this,e);var u=(0,l.default)(this,(0,i.default)(e).call(this)),s=new d.default(t,r,n,a),f=new _.default(t,r,n,a);return u.addPass(s),u.addPass(f),u}return(0,h.default)(e,t),e}(p.default);e.default=M,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(4),i=n(a),u=r(1),o=n(u),s=r(6),l=n(s),f=r(5),h=n(f),c=r(3),d=n(c),v=r(27),_=n(v),m=r(82),p=n(m),M=function(t){function e(){(0,o.default)(this,e);var t=(0,l.default)(this,(0,i.default)(e).call(this,p.default));return t.uniform("uResolution",[1/d.default.width,1/d.default.height]),t}return(0,h.default)(e,t),e}(_.default);e.default=M,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=!0;try{var l=document.createEvent("CustomEvent");l=null}catch(f){s=!1}var h=function(){function t(){(0,i.default)(this,t),this._eventListeners={}}return(0,o.default)(t,[{key:"addEventListener",value:function(t,e){return null!==this._eventListeners&&void 0!==this._eventListeners||(this._eventListeners={}),this._eventListeners[t]||(this._eventListeners[t]=[]),this._eventListeners[t].push(e),this}},{key:"on",value:function(t,e){return this.addEventListener(t,e)}},{key:"removeEventListener",value:function(t,e){null!==this._eventListeners&&void 0!==this._eventListeners||(this._eventListeners={});var r=this._eventListeners[t];if("undefined"==typeof r)return this;for(var n=r.length,a=0;n>a;a++)r[a]===e&&(r.splice(a,1),a--,n--);return this}},{key:"off",value:function(t,e){return this.removeEventListener(t,e)}},{key:"dispatchEvent",value:function(t){null!==this._eventListeners&&void 0!==this._eventListeners||(this._eventListeners={});var e=t.type;try{null===t.target&&(t.target=this),t.currentTarget=this}catch(r){var n={type:e,detail:t.detail,dispatcher:this};return this.dispatchEvent(n)}var a=this._eventListeners[e];if(null!==a&&void 0!==a)for(var i=this._copyArray(a),u=i.length,o=0;u>o;o++){var s=i[o];s.call(this,t)}return this}},{key:"dispatchCustomEvent",value:function(t,e){var r=void 0;return s?(r=document.createEvent("CustomEvent"),r.dispatcher=this,r.initCustomEvent(t,!1,!1,e)):r={type:t,detail:e,dispatcher:this},this.dispatchEvent(r)}},{key:"trigger",value:function(t,e){return this.dispatchCustomEvent(t,e)}},{key:"_destroy",value:function(){if(null!==this._eventListeners){for(var t in this._eventListeners)if(this._eventListeners.hasOwnProperty(t)){for(var e=this._eventListeners[t],r=e.length,n=0;r>n;n++)e[n]=null;delete this._eventListeners[t]}this._eventListeners=null}}},{key:"_copyArray",value:function(t){for(var e=new Array(t.length),r=e.length,n=0;r>n;n++)e[n]=t[n];return e}}]),t}();e.default=h,t.exports=e.default},function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=["EXT_shader_texture_lod","EXT_sRGB","EXT_frag_depth","OES_texture_float","OES_texture_half_float","OES_texture_float_linear","OES_texture_half_float_linear","OES_standard_derivatives","WEBGL_depth_texture","EXT_texture_filter_anisotropic","OES_vertex_array_object","ANGLE_instanced_arrays","WEBGL_draw_buffers"],t.exports=e.default},function(t,e){"use strict";function r(t,e,r,n,a,i){function u(e){var r=0;do e[r++]=t[n];while(++n<_&&r<e.length);return r}function o(e,r,a){var i=0;do e[r+i++]=t[n];while(++n<_&&a>i);return i}function s(t,e,r,n){var a=4*n,i=o(e,r,a);if(a>i)throw new Error("Error reading raw pixels: got "+i+" bytes, expected "+a)}for(var l=new Array(4),f=null,h=void 0,c=void 0,d=void 0,v=new Array(2),_=t.length;i>0;){if(u(l)<l.length)throw new Error("Error reading bytes: expected "+l.length);if(2!==l[0]||2!==l[1]||0!==(128&l[2]))return e[r++]=l[0],e[r++]=l[1],e[r++]=l[2],e[r++]=l[3],void s(t,e,r,a*i-1);if(((255&l[2])<<8|255&l[3])!==a)throw new Error("Wrong scanline width "+((255&l[2])<<8|255&l[3])+", expected "+a);null===f&&(f=new Array(4*a)),h=0;for(var m=0;4>m;m++)for(c=(m+1)*a;c>h;){if(u(v)<v.length)throw new Error("Error reading 2-byte buffer");if((255&v[0])>128){if(d=(255&v[0])-128,0===d||d>c-h)throw new Error("Bad scanline data");for(;d-- >0;)f[h++]=v[1]}else{if(d=255&v[0],0===d||d>c-h)throw new Error("Bad scanline data");if(f[h++]=v[1],--d>0){if(o(f,h,d)<d)throw new Error("Error reading non-run data");h+=d}}}for(var p=0;a>p;p++)e[r+0]=f[p],e[r+1]=f[p+a],e[r+2]=f[p+2*a],e[r+3]=f[p+3*a],r+=4;i--}}function n(t){function e(){var e="";do{var r=t[n];if(r===f){++n;break}e+=String.fromCharCode(r)}while(++n<l);return e}t instanceof ArrayBuffer&&(t=new Uint8Array(t));for(var n=0,l=t.length,f=10,h=0,c=0,d=1,v=1,_=!1,m=0;20>m;m++){var p=e(),M=void 0;if(M=p.match(a));else if(M=p.match(o))_=!0;else if(M=p.match(u))d=Number(M[1]);else if(M=p.match(i));else if(M=p.match(s)){c=Number(M[1]),h=Number(M[2]);break}}if(!_)throw new Error("File is not run length encoded!");var x=new Uint8Array(h*c*4),g=h,E=c;r(t,x,0,n,g,E);for(var b=new Float32Array(h*c*4),y=0;y<x.length;y+=4){var S=x[y+0]/255,T=x[y+1]/255,I=x[y+2]/255,A=x[y+3],F=Math.pow(2,A-128);S*=F,T*=F,I*=F;var D=y;b[D+0]=S,b[D+1]=T,b[D+2]=I,b[D+3]=1}return{shape:[h,c],exposure:d,gamma:v,data:b}}Object.defineProperty(e,"__esModule",{value:!0});var a="#\\?RADIANCE",i="#.*",u="EXPOSURE=\\s*([0-9]*[.][0-9]*)",o="FORMAT=32-bit_rle_rgbe",s="-Y ([0-9]+) \\+X ([0-9]+)";e.default=n,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(1),i=n(a),u=r(2),o=n(u),s=r(8),l=n(s),f=r(37),h=n(f),c=r(23),d=n(c),v=function(t,e){var r=e||{};return t.touches?(r.x=t.touches[0].pageX,r.y=t.touches[0].pageY):(r.x=t.clientX,r.y=t.clientY),r},_=function(){function t(e){var r=this,n=arguments.length<=1||void 0===arguments[1]?window:arguments[1],a=arguments.length<=2||void 0===arguments[2]?.1:arguments[2];(0,i.default)(this,t),this._target=e,this._listenerTarget=n,this.matrix=l.default.mat4.create(),this.m=l.default.mat4.create(),this._vZaxis=l.default.vec3.clone([0,0,0]),this._zAxis=l.default.vec3.clone([0,0,1]),this.preMouse={x:0,y:0},this.mouse={x:0,y:0},this._isMouseDown=!1,this._rotation=l.default.quat.create(),this.tempRotation=l.default.quat.create(),this._rotateZMargin=0,this._offset=.004,this._slerp=-1,this._isLocked=!1,this._diffX=new h.default(0,a),this._diffY=new h.default(0,a),this._listenerTarget.addEventListener("mousedown",function(t){return r._onDown(t)}),this._listenerTarget.addEventListener("touchstart",function(t){return r._onDown(t)}),this._listenerTarget.addEventListener("mousemove",function(t){return r._onMove(t)}),this._listenerTarget.addEventListener("touchmove",function(t){return r._onMove(t)}),window.addEventListener("touchend",function(){return r._onUp()}),window.addEventListener("mouseup",function(){return r._onUp()}),d.default.addEF(function(){return r._loop()})}return(0,o.default)(t,[{key:"inverseControl",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];this._isInvert=t}},{key:"lock",value:function(){var t=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];this._isLocked=t}},{key:"setCameraPos",value:function(t){var e=arguments.length<=1||void 0===arguments[1]?.1:arguments[1];if(this.easing=e,!(this._slerp>0)){var r=l.default.quat.clone(this._rotation);this._updateRotation(r),this._rotation=l.default.quat.clone(r),this._currDiffX=this.diffX=0,this._currDiffY=this.diffY=0,this._isMouseDown=!1,this._isRotateZ=0,this._targetQuat=l.default.quat.clone(t),this._slerp=1}}},{key:"resetQuat",value:function(){this._rotation=l.default.quat.clone([0,0,1,0]),this.tempRotation=l.default.quat.clone([0,0,0,0]),this._targetQuat=void 0,this._slerp=-1}},{key:"_onDown",value:function(t){if(!this._isLocked){var e=v(t),r=l.default.quat.clone(this._rotation);this._updateRotation(r),this._rotation=r,this._isMouseDown=!0,this._isRotateZ=0,this.preMouse={x:e.x,y:e.y},e.y<this._rotateZMargin||e.y>window.innerHeight-this._rotateZMargin?this._isRotateZ=1:(e.x<this._rotateZMargin||e.x>window.innerWidth-this._rotateZMargin)&&(this._isRotateZ=2),this._diffX.setTo(0),this._diffY.setTo(0)}}},{key:"_onMove",value:function(t){this._isLocked||v(t,this.mouse)}},{key:"_onUp",value:function(){this._isLocked||(this._isMouseDown=!1)}},{key:"_updateRotation",value:function(t){this._isMouseDown&&!this._isLocked&&(this._diffX.value=-(this.mouse.x-this.preMouse.x),this._diffY.value=this.mouse.y-this.preMouse.y,this._isInvert&&(this._diffX.value=-this._diffX.targetValue,this._diffY.value=-this._diffY.targetValue));var e=void 0,r=void 0;if(this._isRotateZ>0)1===this._isRotateZ?(e=-this._diffX.value*this._offset,e*=this.preMouse.y<this._rotateZMargin?-1:1,r=l.default.quat.clone([0,0,Math.sin(e),Math.cos(e)]),l.default.quat.multiply(r,t,r)):(e=-this._diffY.value*this._offset,e*=this.preMouse.x<this._rotateZMargin?1:-1,r=l.default.quat.clone([0,0,Math.sin(e),Math.cos(e)]),l.default.quat.multiply(r,t,r));else{var n=l.default.vec3.clone([this._diffX.value,this._diffY.value,0]),a=l.default.vec3.create();l.default.vec3.cross(a,n,this._zAxis),l.default.vec3.normalize(a,a),e=l.default.vec3.length(n)*this._offset,r=l.default.quat.clone([Math.sin(e)*a[0],Math.sin(e)*a[1],Math.sin(e)*a[2],Math.cos(e)]),l.default.quat.multiply(t,r,t)}}},{key:"_loop",value:function(){l.default.mat4.identity(this.m),void 0===this._targetQuat?(l.default.quat.set(this.tempRotation,this._rotation[0],this._rotation[1],this._rotation[2],this._rotation[3]),this._updateRotation(this.tempRotation)):(this._slerp+=.1*(0-this._slerp),this._slerp<5e-4?(l.default.quat.copy(this._rotation,this._targetQuat),l.default.quat.copy(this.tempRotation,this._targetQuat),this._targetQuat=void 0,this._diffX.setTo(0),this._diffY.setTo(0),this._slerp=-1):(l.default.quat.set(this.tempRotation,0,0,0,0),l.default.quat.slerp(this.tempRotation,this._targetQuat,this._rotation,this._slerp))),l.default.vec3.transformQuat(this._vZaxis,this._vZaxis,this.tempRotation),l.default.mat4.fromQuat(this.matrix,this.tempRotation)}},{key:"easing",set:function(t){this._diffX.easing=t,this._diffY.easing=t},get:function(){return this._diffX.easing}}]),t}();e.default=_,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}function a(t){switch(t){default:case"linear":return h.Linear.None;case"expIn":return h.Exponential.In;case"expOut":return h.Exponential.Out;case"expInOut":return h.Exponential.InOut;case"cubicIn":return h.Cubic.In;case"cubicOut":return h.Cubic.Out;case"cubicInOut":return h.Cubic.InOut;case"quarticIn":return h.Quartic.In;case"quarticOut":return h.Quartic.Out;case"quarticInOut":return h.Quartic.InOut;case"quinticIn":return h.Quintic.In;case"quinticOut":return h.Quintic.Out;case"quinticInOut":return h.Quintic.InOut;case"sinusoidalIn":return h.Sinusoidal.In;case"sinusoidalOut":return h.Sinusoidal.Out;case"sinusoidalInOut":return h.Sinusoidal.InOut;case"circularIn":return h.Circular.In;case"circularOut":return h.Circular.Out;case"circularInOut":return h.Circular.InOut;case"elasticIn":return h.Elastic.In;case"elasticOut":return h.Elastic.Out;case"elasticInOut":return h.Elastic.InOut;case"backIn":return h.Back.In;case"backOut":return h.Back.Out;case"backInOut":return h.Back.InOut;case"bounceIn":return h.Bounce.in;case"bounceOut":return h.Bounce.out;case"bounceInOut":return h.Bounce.inOut}}Object.defineProperty(e,"__esModule",{value:!0});var i=r(1),u=n(i),o=r(2),s=n(o),l=r(23),f=n(l),h={Linear:{None:function(t){return t}},Quadratic:{In:function(t){return t*t},Out:function(t){return t*(2-t)},InOut:function(t){return(t*=2)<1?.5*t*t:-.5*(--t*(t-2)-1)}},Cubic:{In:function(t){return t*t*t},Out:function(t){return--t*t*t+1},InOut:function(t){return(t*=2)<1?.5*t*t*t:.5*((t-=2)*t*t+2)}},Quartic:{In:function(t){return t*t*t*t},Out:function(t){return 1- --t*t*t*t},InOut:function(t){return(t*=2)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2)}},Quintic:{In:function(t){return t*t*t*t*t},Out:function(t){return--t*t*t*t*t+1},InOut:function(t){return(t*=2)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)}},Sinusoidal:{In:function(t){return 1-Math.cos(t*Math.PI/2)},Out:function(t){return Math.sin(t*Math.PI/2)},InOut:function(t){return.5*(1-Math.cos(Math.PI*t))}},Exponential:{In:function(t){return 0===t?0:Math.pow(1024,t-1)},Out:function(t){return 1===t?1:1-Math.pow(2,-10*t)},InOut:function(t){return 0===t?0:1===t?1:(t*=2)<1?.5*Math.pow(1024,t-1):.5*(-Math.pow(2,-10*(t-1))+2)}},Circular:{In:function(t){return 1-Math.sqrt(1-t*t)},Out:function(t){return Math.sqrt(1- --t*t)},InOut:function(t){return(t*=2)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)}},Elastic:{In:function(t){var e=void 0,r=.1,n=.4;return 0===t?0:1===t?1:(!r||1>r?(r=1,e=n/4):e=n*Math.asin(1/r)/(2*Math.PI),-(r*Math.pow(2,10*(t-=1))*Math.sin((t-e)*(2*Math.PI)/n)))},Out:function(t){var e=void 0,r=.1,n=.4;return 0===t?0:1===t?1:(!r||1>r?(r=1,e=n/4):e=n*Math.asin(1/r)/(2*Math.PI),r*Math.pow(2,-10*t)*Math.sin((t-e)*(2*Math.PI)/n)+1)},InOut:function(t){var e=void 0,r=.1,n=.4;return 0===t?0:1===t?1:(!r||1>r?(r=1,e=n/4):e=n*Math.asin(1/r)/(2*Math.PI),(t*=2)<1?-.5*(r*Math.pow(2,10*(t-=1))*Math.sin((t-e)*(2*Math.PI)/n)):r*Math.pow(2,-10*(t-=1))*Math.sin((t-e)*(2*Math.PI)/n)*.5+1)}},Back:{In:function(t){var e=1.70158;return t*t*((e+1)*t-e)},Out:function(t){var e=1.70158;return--t*t*((e+1)*t+e)+1},InOut:function(t){var e=2.5949095;return(t*=2)<1?.5*(t*t*((e+1)*t-e)):.5*((t-=2)*t*((e+1)*t+e)+2);
}},Bounce:{"in":function(t){return 1-h.Bounce.out(1-t)},out:function(t){return 1/2.75>t?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375},inOut:function(t){return.5>t?.5*h.Bounce.in(2*t):.5*h.Bounce.out(2*t-1)+.5}}},c=function(){function t(e){var r=this,n=arguments.length<=1||void 0===arguments[1]?"expOut":arguments[1],a=arguments.length<=2||void 0===arguments[2]?.01:arguments[2];(0,u.default)(this,t),this._value=e,this._startValue=e,this._targetValue=e,this._counter=1,this.speed=a,this.easing=n,this._needUpdate=!0,this._efIndex=f.default.addEF(function(){return r._update()})}return(0,s.default)(t,[{key:"_update",value:function(){var t=this._counter+this.speed;return t>1&&(t=1),this._counter===t?void(this._needUpdate=!1):(this._counter=t,void(this._needUpdate=!0))}},{key:"limit",value:function(t,e){return t>e?void this.limit(e,t):(this._min=t,this._max=e,void this._checkLimit())}},{key:"setTo",value:function(t){this._value=t,this._targetValue=t,this._counter=1}},{key:"_checkLimit",value:function(){void 0!==this._min&&this._targetValue<this._min&&(this._targetValue=this._min),void 0!==this._max&&this._targetValue>this._max&&(this._targetValue=this._max)}},{key:"destroy",value:function(){f.default.removeEF(this._efIndex)}},{key:"value",set:function(t){this._startValue=this._value,this._targetValue=t,this._checkLimit(),this._counter=0},get:function(){if(this._needUpdate){var t=a(this.easing),e=t(this._counter);this._value=this._startValue+e*(this._targetValue-this._startValue),this._needUpdate=!1}return this._value}},{key:"targetValue",get:function(){return this._targetValue}}]),t}();e.default=c,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(3),i=n(a),u=function(){i.default.VERTEX_SHADER=i.default.gl.VERTEX_SHADER,i.default.FRAGMENT_SHADER=i.default.gl.FRAGMENT_SHADER,i.default.COMPILE_STATUS=i.default.gl.COMPILE_STATUS,i.default.DEPTH_TEST=i.default.gl.DEPTH_TEST,i.default.CULL_FACE=i.default.gl.CULL_FACE,i.default.BLEND=i.default.gl.BLEND,i.default.POINTS=i.default.gl.POINTS,i.default.LINES=i.default.gl.LINES,i.default.TRIANGLES=i.default.gl.TRIANGLES,i.default.LINEAR=i.default.gl.LINEAR,i.default.NEAREST=i.default.gl.NEAREST,i.default.LINEAR_MIPMAP_NEAREST=i.default.gl.LINEAR_MIPMAP_NEAREST,i.default.NEAREST_MIPMAP_LINEAR=i.default.gl.NEAREST_MIPMAP_LINEAR,i.default.LINEAR_MIPMAP_LINEAR=i.default.gl.LINEAR_MIPMAP_LINEAR,i.default.NEAREST_MIPMAP_NEAREST=i.default.gl.NEAREST_MIPMAP_NEAREST,i.default.MIRRORED_REPEAT=i.default.gl.MIRRORED_REPEAT,i.default.CLAMP_TO_EDGE=i.default.gl.CLAMP_TO_EDGE,i.default.SCISSOR_TEST=i.default.gl.SCISSOR_TEST,i.default.UNSIGNED_BYTE=i.default.gl.UNSIGNED_BYTE};e.default=u,t.exports=e.default},function(t,e){"use strict";function r(t,e){var r=t.getExtension(e);if(!r)return!1;var n=e.split("_")[0],a=new RegExp(n+"$");for(var i in r){var u=r[i];if("function"==typeof u){var o=i.replace(a,"");i.substring&&(t[o]=r[i].bind(r))}}return!0}Object.defineProperty(e,"__esModule",{value:!0}),e.default=r,t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}function a(){if(u.default.webgl2)return u.default.gl.FLOAT;var t=u.default.getExtension("OES_texture_float");return t?u.default.gl.FLOAT:(console.warn("USING FLOAT BUT OES_texture_float NOT SUPPORTED"),u.default.gl.UNSIGNED_BYTE)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(){return o||(s=a()),s};var i=r(3),u=n(i),o=!1,s=void 0;t.exports=e.default},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}function a(){if(u.default.webgl2)return u.default.gl.HALF_FLOAT;var t=u.default.getExtension("OES_texture_half_float");return t?t.HALF_FLOAT_OES:(console.warn("USING HALF FLOAT BUT OES_texture_half_float NOT SUPPORTED"),u.default.gl.UNSIGNED_BYTE)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(){return o||(s=a()),s};var i=r(3),u=n(i),o=!1,s=void 0;t.exports=e.default},function(t,e,r){t.exports={"default":r(125),__esModule:!0}},function(t,e,r){t.exports={"default":r(126),__esModule:!0}},function(t,e,r){t.exports={"default":r(127),__esModule:!0}},function(t,e,r){t.exports={"default":r(129),__esModule:!0}},function(t,e,r){t.exports={"default":r(130),__esModule:!0}},function(t,e,r){t.exports={"default":r(131),__esModule:!0}},function(t,e,r){(function(n){"use strict";function a(t,e){var r=new XMLHttpRequest;r.onload=function(){this.response;200==this.status&&e&&e(this.response)},r.open("get",t,!0),r.send()}Object.defineProperty(e,"__esModule",{value:!0});var i=r(8),u=void 0===n.document,o=2*Math.PI/360,s=null,l=null,f=null,h=null,c=null,d={libsPath:"./",workerPath:"./",no_flip:!0,use_transferables:!0,onerror:null,verbose:!1,config:{forceParser:!1},init:function(t){t=t||{};for(var e in t)this[e]=t[e];if(this.config=t,u)try{importScripts(this.libsPath+"gl-matrix-min.js",this.libsPath+"tinyxml.js")}catch(r){d.throwException(d.LIBMISSING_ERROR)}s=i.mat4.create(),l=vec3.create(),f=vec3.create(),h=vec3.create(),c=i.quat.create(),u&&console.log("Collada worker ready")},load:function(t,e){a(t,function(t){e(t?d.parse(t):null)})},_xmlroot:null,_nodes_by_id:null,_transferables:null,_controllers_found:null,_geometries_found:null,safeString:function(t){return t?this.convertID?this.convertID(t):t.replace(/ /g,"_"):""},LIBMISSING_ERROR:"Libraries loading error, when using workers remember to pass the URL to the tinyxml.js in the options.libsPath",NOXMLPARSER_ERROR:"TinyXML not found, when using workers remember to pass the URL to the tinyxml.js in the options.libsPath (Workers do not allow to access the native XML DOMParser)",throwException:function(t){throw u?self.postMessage({action:"exception",msg:t}):d.onerror&&d.onerror(t),t},getFilename:function(t){var e=t.lastIndexOf("\\");return-1!=e&&(t=t.substr(e+1)),e=t.lastIndexOf("/"),-1!=e&&(t=t.substr(e+1)),t},last_name:0,generateName:function(t){t=t||"name_";var e=t+this.last_name;return this.last_name++,e},parse:function(t,e,r){e=e||{},r=r||"_dae_"+Date.now()+".dae";var a=!1,i=null,u=null;if(this._transferables=[],this.verbose&&console.log(" - XML parsing..."),n.DOMParser&&!this.config.forceParser)i=new DOMParser,u=i.parseFromString(t,"text/xml"),this.verbose&&console.log(" - XML parsed");else{if(!n.DOMImplementation)return d.throwException(d.NOXMLPARSER_ERROR);try{i=new DOMImplementation}catch(o){return d.throwException(d.NOXMLPARSER_ERROR)}u=i.loadXML(t),this.verbose&&console.log(" - XML parsed");for(var s=u._nodes_by_id={},l=0,f=u.all.length;f>l;++l){var h=u.all[l];s[h.id]=h,h.getAttribute("sid")&&(s[h.getAttribute("sid")]=h)}this.extra_functions||(this.extra_functions=!0,DOMDocument.prototype.querySelector=DOMElement.prototype.querySelector=function(t){for(var e=t.split(" "),r=this;e.length;){var n=e.shift(),a=n.split("#"),i=a[0],u=a[1],o=i?r.getElementsByTagName(i):r.childNodes;if(u){for(var s=0;s<o.length;s++)if(o.item(s).getAttribute("id")==u){if(0==e.length)return o.item(s);r=o.item(s);break}}else{if(0==e.length)return o.item(0);r=o.item(0)}}return null},DOMDocument.prototype.querySelectorAll=DOMElement.prototype.querySelectorAll=function(t){function e(t,r){if(r){var a=r.shift(),i=t.getElementsByTagName(a);if(0!=r.length)for(var u=0;u<i.length;u++)e(i.item(u),r.concat());else for(var u=0;u<i.length;u++)n.push(i.item(u))}}var r=t.split(" ");if(1==r.length)return this.getElementsByTagName(t);var n=[];e(this,r);var a=new DOMNodeList(this.documentElement);return a._nodes=n,a.length=n.length,a},Object.defineProperty(DOMElement.prototype,"textContent",{get:function(){var t=this.getChildNodes();return t.item(0).toString()},set:function(){}}))}this._xmlroot=u;var c=u.querySelector("COLLADA");c&&(this._current_DAE_version=c.getAttribute("version"),console.log("DAE Version:"+this._current_DAE_version));var v=u.getElementsByTagName("visual_scene").item(0);if(!v)throw"visual_scene XML node not found in DAE";this._nodes_by_id={},this._controllers_found={},this._geometries_found={};var _={object_type:"SceneTree",light:null,materials:{},meshes:{},resources:{},root:{children:[]},external_files:{}},m=u.getElementsByTagName("asset")[0];m&&(_.metadata=this.readAsset(m));for(var p=v.childNodes,l=0;l<p.length;l++)if("node"==p.item(l).localName){var h=this.readNodeTree(p.item(l),_,0,a);h&&_.root.children.push(h)}for(var l=0;l<p.length;l++)"node"==p.item(l).localName&&this.readNodeInfo(p.item(l),_,0,a);this.readLibraryControllers(_);var M=this.readAnimations(u,_);if(M){var x="#animations_"+r.substr(0,r.indexOf("."));_.resources[x]=M,_.root.animations=x}return _.images=this.readImages(u),this._nodes_by_id={},this._controllers_found={},this._geometries_found={},this._xmlroot=null,_},readAsset:function(t){for(var e={},r=0;r<t.childNodes.length;r++){var n=t.childNodes.item(r);if(1==n.nodeType)switch(n.localName){case"contributor":var a=n.querySelector("authoring_tool");a&&(e.authoring_tool=a.textContext);break;case"unit":e.unit=n.getAttribute("name");break;default:e[n.localName]=n.textContent}}return e},readNodeTree:function(t,e,r,n){var a=this.safeString(t.getAttribute("id")),i=this.safeString(t.getAttribute("sid"));if(!a&&!i)return null;var u={id:i||a,children:[],_depth:r},o=t.getAttribute("type");o&&(u.type=o);var s=t.getAttribute("name");s&&(u.name=s),this._nodes_by_id[u.id]=u,a&&(this._nodes_by_id[a]=u),i&&(this._nodes_by_id[i]=u),u.model=this.readTransform(t,r,n);for(var l=0;l<t.childNodes.length;l++){var f=t.childNodes.item(l);if(1==f.nodeType)if("node"!=f.localName);else{var h=this.readNodeTree(f,e,r+1,n);h&&u.children.push(h)}}return u},readNodeInfo:function(t,e,r,n,a){var i,u=this.safeString(t.getAttribute("id")),o=this.safeString(t.getAttribute("sid"));if(u||o)i=this._nodes_by_id[u||o];else{if(!a)return null;i=this._nodes_by_id[a.id||a.sid]}if(!i)return console.warn("Collada: Node not found by id: "+(u||o)),null;for(var s=0;s<t.childNodes.length;s++){var l=t.childNodes.item(s);if(1==l.nodeType)if("node"!=l.localName){if("instance_geometry"==l.localName){var f=l.getAttribute("url"),h=f.toString().substr(1);if(i.mesh=h,!e.meshes[f]){var c=this.readGeometry(f,n);c&&(c.name=h,e.meshes[h]=c)}var d=l.querySelectorAll("instance_material");if(d)for(var v=0;v<d.length;++v){var _=d.item(v);if(_){var m=_.getAttribute("target").toString().substr(1);if(!e.materials[m]){var p=this.readMaterial(m);p&&(p.id=m,e.materials[p.id]=p)}0==v?i.material=m:(i.materials||(i.materials=[]),i.materials.push(m))}else console.warn("instance_material not found: "+s)}}if("instance_controller"==l.localName){var f=l.getAttribute("url"),M=this._xmlroot.querySelector("controller"+f);if(M){var c=this.readController(M,n,e),x=l.querySelector("bind_material");if(x)for(var g=x.querySelectorAll("technique_common"),E=0;E<g.length;E++)for(var b=g.item(E),y=b.querySelectorAll("instance_material"),v=0;v<y.length;v++){var S=y.item(v);if(S){var m=S.getAttribute("target").toString().substr(1);if(!e.materials[m]){var p=this.readMaterial(m);p&&(p.id=m,e.materials[p.id]=p)}0==v?i.material=m:(i.materials||(i.materials=[]),i.materials.push(m))}else console.warn("instance_material for controller not found: "+S)}if(c){var T=c;"morph"==c.type&&(T=c.mesh,i.morph_targets=c.morph_targets),T.name=f.toString(),i.mesh=f.toString(),e.meshes[f]=T}}}if("instance_light"==l.localName){var f=l.getAttribute("url");this.readLight(i,f)}if("instance_camera"==l.localName){var f=l.getAttribute("url");this.readCamera(i,f)}}else this.readNodeInfo(l,e,r+1,n,t)}},material_translate_table:{},light_translate_table:{point:"omni",directional:"directional",spot:"spot"},camera_translate_table:{xfov:"fov",aspect_ratio:"aspect",znear:"near",zfar:"far"},querySelectorAndId:function(t,e,r){for(var n=t.querySelectorAll(e),a=0;a<n.length;a++){var i=n.item(a).getAttribute("id");if(i&&(i=i.toString(),i==r))return n.item(a)}return null},getFirstChildElement:function(t,e){for(var r=t.childNodes,n=0;n<r.length;++n){var a=r.item(n);if(a.localName&&!e||e&&e==a.localName)return a}return null},readMaterial:function(t){var e=this.querySelectorAndId(this._xmlroot,"library_materials material",t);if(!e)return null;var r=e.querySelector("instance_effect");if(!r)return null;var n=r.getAttribute("url").substr(1),a=this.querySelectorAndId(this._xmlroot,"library_effects effect",n);if(!a)return null;var i=a.querySelector("technique");if(!i)return null;for(var u=a.querySelectorAll("newparam"),o={},s=0;s<u.length;s++){var l,f=u[s].querySelector("init_from");if(f)l=f.innerHTML;else{var h=u[s].querySelector("source");l=h.innerHTML}o[u[s].getAttribute("sid")]={parent:l}}var c={},d=this.readImages(this._xmlroot),v=i.querySelector("phong");if(v||(v=i.querySelector("blinn")),v||(v=i.querySelector("lambert")),!v)return null;for(var s=0;s<v.childNodes.length;++s){var _=v.childNodes.item(s);if(_.localName){var m=_.localName.toString();this.material_translate_table[m]&&(m=this.material_translate_table[m]);var p=this.getFirstChildElement(_);if(p)if("color"!=p.localName.toString())if("float"!=p.localName.toString()){if("texture"==p.localName.toString()){c.textures||(c.textures={});var M=p.getAttribute("texture");if(!M)continue;-1===M.indexOf(".")&&(M=this.getParentParam(o,M),d[M]&&(M=d[M].path));var x={map_id:M},g=p.getAttribute("texcoord");x.uvs=g,c.textures[m]=x}}else c[m]=this.readContentAsFloats(p)[0];else{var E=this.readContentAsFloats(p);"RGB_ZERO"==_.getAttribute("opaque")?c[m]=E.subarray(0,4):c[m]=E.subarray(0,3)}}}return c.object_type="Material",c},getParentParam:function(t,e){return t[e]&&t[e].parent?this.getParentParam(t,t[e].parent):e},readLight:function(t,e){function r(t,e){for(var r=0;r<e.childNodes.length;r++){var n=e.childNodes.item(r);if(n&&1==n.nodeType)switch(n.localName){case"color":t.color=d.readContentAsFloats(n);break;case"falloff_angle":t.angle_end=d.readContentAsFloats(n)[0],t.angle=t.angle_end-10}}}var n={},a=null;if(e.length>1)a=this._xmlroot.querySelector("library_lights "+e);else{var i=this._xmlroot.querySelector("library_lights");a=this.getFirstChildElement(i,"light")}if(!a)return null;var u=[],o=a.querySelector("technique_common");if(o)for(var s=0;s<o.childNodes.length;s++)1==o.childNodes.item(s).nodeType&&u.push(o.childNodes.item(s));for(var l=a.querySelectorAll("technique"),s=0;s<l.length;s++)for(var f=l.item(s),h=0;h<f.childNodes.length;h++)1==f.childNodes.item(h).nodeType&&u.push(f.childNodes.item(h));for(var s=0;s<u.length;s++){var o=u[s];switch(o.localName){case"point":n.type=this.light_translate_table[o.localName],r(n,o);break;case"directional":n.type=this.light_translate_table[o.localName],r(n,o);break;case"spot":n.type=this.light_translate_table[o.localName],r(n,o);break;case"intensity":n.intensity=this.readContentAsFloats(o)[0]}}if(t.model){n.position=[t.model[12],t.model[13],t.model[14]];var c=[-t.model[8],-t.model[9],-t.model[10]];n.target=[n.position[0]+c[0],n.position[1]+c[1],n.position[2]+c[2]]}else console.warn("Could not read light position for light: "+t.name+". Setting defaults."),n.position=[0,0,0],n.target=[0,-1,0];t.light=n},readCamera:function(t,e){function r(t,e){for(var r=0;r<e.childNodes.length;r++){var n=e.childNodes.item(r);if(n&&1==n.nodeType){var a=d.camera_translate_table[n.localName]||n.localName;t[a]=parseFloat(n.textContent)}}}var n={},a=this._xmlroot.querySelector("library_cameras "+e);if(!a)return null;var i=[],u=a.querySelector("technique_common");if(u)for(var o=0;o<u.childNodes.length;o++)1==u.childNodes.item(o).nodeType&&i.push(u.childNodes.item(o));for(var o=0;o<i.length;o++){var s=i[o];r(n,s)}n.yfov&&!n.fov&&(n.aspect?n.fov=n.yfov*n.aspect:console.warn("Could not convert camera yfov to xfov because aspect ratio not set")),t.camera=n},readTransform:function(t,e,r){for(var n=i.mat4.create(),a=i.mat4.create(),u=i.quat.create(),s=!1,l=0;l<t.childNodes.length;l++){var f=t.childNodes.item(l);if(f&&1==f.nodeType){if("matrix"==f.localName){var n=this.readContentAsFloats(f);return this.transformMatrix(n,0==e),n}if("translate"!=f.localName)if("rotate"!=f.localName){if("scale"==f.localName){var h=this.readContentAsFloats(f);if(r){var c=h[1];h[1]=h[2],h[2]=-c}i.mat4.scale(n,n,h)}}else{var h=this.readContentAsFloats(f);if(4==h.length){var d=f.getAttribute("sid");if("jointOrientX"==d&&(h[3]+=90,s=!0),r){var c=h[1];h[1]=h[2],h[2]=-c}0!=h[3]&&(i.quat.setAxisAngle(u,h.subarray(0,3),h[3]*o),i.mat4.fromQuat(a,u),i.mat4.multiply(n,n,a))}}else{var h=this.readContentAsFloats(f);if(r&&e>0){var c=h[1];h[1]=h[2],h[2]=-c}i.mat4.translate(n,n,h)}}}return n},readTransform2:function(t,e,r){for(var n=i.mat4.create(),a=i.quat.create(),u=i.mat4.create(),s=i.quat.create(),l=vec3.create(),f=vec3.fromValues(1,1,1),h=!1,c=0;c<t.childNodes.length;c++){var d=t.childNodes.item(c);if("matrix"==d.localName){var n=this.readContentAsFloats(d);return this.transformMatrix(n,0==e),n}if("translate"!=d.localName)if("rotate"!=d.localName){if("scale"==d.localName){var v=this.readContentAsFloats(d);if(r){var _=v[1];v[1]=v[2],v[2]=-_}f.set(v)}}else{var v=this.readContentAsFloats(d);if(4==v.length){var m=d.getAttribute("sid");if("jointOrientX"==m&&(v[3]+=90,h=!0),r){var _=v[1];v[1]=v[2],v[2]=-_}0!=v[3]&&(i.quat.setAxisAngle(s,v.subarray(0,3),v[3]*o),i.quat.multiply(a,a,s))}}else{var v=this.readContentAsFloats(d);l.set(v)}}if(r&&e>0){var _=l[1];l[1]=l[2],l[2]=-_}return i.mat4.translate(n,n,l),i.mat4.fromQuat(u,a),i.mat4.multiply(n,n,u),i.mat4.scale(n,n,f),n},readGeometry:function(t,e,r){if(void 0!==this._geometries_found[t])return this._geometries_found[t];var n=this._xmlroot.getElementById(t.substr(1));if(!n)return console.warn("readGeometry: geometry not found: "+t),this._geometries_found[t]=null,null;if("controller"==n.localName){var a=this.readController(n,e,r);return this._geometries_found[t]=a,a}if("geometry"!=n.localName)return console.warn("readGeometry: tag should be geometry, instead it was found: "+n.localName),this._geometries_found[t]=null,null;var i=n.querySelector("mesh");if(!i)return console.warn("readGeometry: mesh not found in geometry: "+t),this._geometries_found[t]=null,null;for(var o={},s=i.querySelectorAll("source"),l=0;l<s.length;l++){var f=s.item(l);if(f.querySelector){var h=f.querySelector("float_array");if(h){var c=this.readContentAsFloats(h),d=f.querySelector("accessor"),v=parseInt(d.getAttribute("stride"));o[f.getAttribute("id")]={stride:v,data:c}}}}var _=i.querySelector("vertices input"),m=o[_.getAttribute("source").substr(1)];o[i.querySelector("vertices").getAttribute("id")]=m;var p=null,M=i.querySelector("polygons");if(M&&(p=this.readTriangles(M,o)),!p){var x=i.querySelectorAll("triangles");x&&x.length&&(p=this.readTriangles(x,o))}if(!p){var g=i.querySelector("polylist");g&&(p=this.readPolylist(g,o))}if(!p){var E=i.querySelector("linestrips");E&&(p=this.readLineStrip(o,E))}if(!p)return console.log("no polygons or triangles in mesh: "+t),this._geometries_found[t]=null,null;if(e&&!this.no_flip){for(var b=0,y=p.vertices,l=0,S=y.length;S>l;l+=3)b=y[l+1],y[l+1]=y[l+2],y[l+2]=-b;y=p.normals;for(var l=0,S=y.length;S>l;l+=3)b=y[l+1],y[l+1]=y[l+2],y[l+2]=-b}if(u&&this.use_transferables)for(var l in p){var T=p[l];T&&T.buffer&&T.length>100&&this._transferables.push(T.buffer)}return p.filename=t,p.object_type="Mesh",this._geometries_found[t]=p,p},readTriangles:function(t,e){for(var r=[],n=[],a=0,i={},u=[],o=[],s=0,l="",f="",h=0;h<t.length;h++){var c=t.item(h),d="triangles"==c.localName;f=c.getAttribute("material"),0==h&&(n=this.readShapeInputs(c,e));for(var v=c.querySelectorAll("p"),_=(n.length,0);_<v.length;_++){var m=v.item(_);if(!m||!m.textContent)break;var p=m.textContent.trim().split(" "),M=-1,x=-1,g=-1,E=1;for(var b in n)E=Math.max(E,n[b][4]+1);for(var y=0,S=p.length;S>y;y+=E){var T=p.slice(y,y+E).join(" ");if(g=x,i.hasOwnProperty(T))x=i[T];else{for(var I=0;I<n.length;++I){var A=n[I],F=A[1],D=A[3],R=parseInt(p[y+A[4]]);0==I&&(u[F.length/A[2]]=R),R*=A[2];for(var w=0;w<A[2];++w){if(void 0===D[R+w])throw"UNDEFINED!";F.push(D[R+w])}}x=a,a+=1,i[T]=x}d||(0==y&&(M=x),y>2&&(o.push(M),o.push(g))),o.push(x)}}var P={name:l||"group"+h,start:s,length:o.length-s,material:f||""};s=o.length,r.push(P)}var N={vertices:new Float32Array(n[0][1]),info:{groups:r},_remap:new Uint32Array(u)};return this.transformMeshInfo(N,n,o),N},readPolylist:function(t,e){var r=[],n=0,a={},i=[],u=[],o="";o=t.getAttribute("material"),r=this.readShapeInputs(t,e);for(var s=t.querySelector("vcount"),l=this.readContentAsUInt32(s),f=t.querySelector("p"),h=this.readContentAsUInt32(f),c=r.length,d=0,v=0,_=l.length;_>v;++v)for(var m=l[v],p=-1,M=-1,x=-1,g=0;m>g;++g){var E=h.subarray(d,d+c).join(" ");if(x=M,a.hasOwnProperty(E))M=a[E];else{for(var b=0;b<r.length;++b){var y=r[b],S=parseInt(h[d+b]),T=y[1],I=y[3];0==b&&(i[T.length/c]=S),S*=y[2];for(var A=0;A<y[2];++A)T.push(I[S+A])}M=n,n+=1,a[E]=M}m>3&&(0==g&&(p=M),g>2&&(u.push(p),u.push(x))),u.push(M),d+=c}var F={vertices:new Float32Array(r[0][1]),info:{},_remap:new Uint32Array(i)};return this.transformMeshInfo(F,r,u),F},readShapeInputs:function(t,e){for(var r=[],n=t.querySelectorAll("input"),a=0;a<n.length;a++){var i=n.item(a);if(i.getAttribute){var u=i.getAttribute("semantic").toUpperCase(),o=e[i.getAttribute("source").substr(1)],s=parseInt(i.getAttribute("offset")),l=0;i.getAttribute("set")&&(l=parseInt(i.getAttribute("set"))),r.push([u,[],o.stride,o.data,s,l])}}return r},transformMeshInfo:function(t,e,r){for(var n={normal:"normals",texcoord:"coords"},a=1;a<e.length;++a){var i=e[a][0].toLowerCase(),u=e[a][1];u.length&&(n[i]&&(i=n[i]),t[i]&&(i+=e[a][5]),t[i]=new Float32Array(u))}return r&&r.length&&(t.vertices.length>65536?t.triangles=new Uint32Array(r):t.triangles=new Uint16Array(r)),t},readLineStrip:function(t,e){var r=[],n=0,a={},i=[],u=[],o=0,s=e.querySelectorAll("input");if(0==o)for(var l=0;l<s.length;l++){var f=s.item(l);if(f.getAttribute){var h=f.getAttribute("semantic").toUpperCase(),c=t[f.getAttribute("source").substr(1)],d=parseInt(f.getAttribute("offset")),v=0;f.getAttribute("set")&&(v=parseInt(f.getAttribute("set"))),r.push([h,[],c.stride,c.data,d,v])}}for(var _=e.querySelectorAll("p"),m=r.length,l=0;l<_.length;l++){var p=_.item(l);if(!p||!p.textContent)break;for(var M=p.textContent.trim().split(" "),x=-1,g=-1,E=0,b=M.length;b>E;E+=m){var y=M.slice(E,E+m).join(" ");if(g=x,a.hasOwnProperty(y))x=a[y];else{for(var S=0;S<r.length;++S){var T=r[S],I=parseInt(M[E+S]),A=T[1],F=T[3];0==S&&(i[A.length/m]=I),I*=T[2];for(var D=0;D<T[2];++D)A.push(F[I+D])}x=n,n+=1,a[y]=x}u.push(x)}}var R={primitive:"line_strip",vertices:new Float32Array(r[0][1]),info:{}};return this.transformMeshInfo(R,r,u)},findXMLNodeById:function(t,e,r){if(this._xmlroot._nodes_by_id){var n=this._xmlroot._nodes_by_id[r];if(n&&n.localName==e)return n}else{var n=this._xmlroot.getElementById(r);if(n)return n}for(var a=t.childNodes,i=0;i<a.length;++i){var u=a.item(i);if(1==u.nodeType&&u.localName==e){var o=u.getAttribute("id");if(o==r)return u}}return null},readImages:function(t){var e=t.querySelector("library_images");if(!e)return null;for(var r={},n=e.childNodes,a=0;a<n.length;++a){var i=n.item(a);if(1==i.nodeType){var u=i.querySelector("init_from");if(u&&u.textContent){var o=this.getFilename(u.textContent),s=i.getAttribute("id");r[s]={filename:o,map:s,name:i.getAttribute("name"),path:u.textContent}}}}return r},readAnimations:function(t,e){var r=t.querySelector("library_animations");if(!r)return null;for(var n=r.childNodes,a={object_type:"Animation",takes:{}},i={tracks:[]},u=i.tracks,o=0;o<n.length;++o){var s=n.item(o);if(1==s.nodeType&&"animation"==s.localName){var l=s.getAttribute("id");if(l)this.readAnimation(s,u);else{var f=s.querySelectorAll("animation");if(f.length)for(var h=0;h<f.length;++h){var c=f.item(h);this.readAnimation(c,u)}else this.readAnimation(s,u)}}}if(!u.length)return null;for(var d=0,o=0;o<u.length;++o)d<u[o].duration&&(d=u[o].duration);return i.name="default",i.duration=d,a.takes[i.name]=i,a},readAnimation:function(t,e){if("animation"!=t.localName)return null;var r=(t.getAttribute("id"),t.querySelectorAll("channel"));if(!r.length)return null;for(var n=e||[],a=0;a<r.length;++a){var i=this.readChannel(r.item(a),t);i&&n.push(i)}return n},readChannel:function(t,e){if("channel"!=t.localName||"animation"!=e.localName)return null;var r=t.getAttribute("source"),n=t.getAttribute("target"),a=this.findXMLNodeById(e,"sampler",r.substr(1));if(!a)return console.error("Error DAE: Sampler not found in "+r),null;for(var i={},o={},s={},l=a.querySelectorAll("input"),f=null,h=0;h<l.length;h++){var c=l.item(h),d=c.getAttribute("source"),v=c.getAttribute("semantic"),_=this.findXMLNodeById(e,"source",d.substr(1));if(_){var m=_.querySelector("param");if(m){var p=m.getAttribute("type");i[v]={source:d,type:p};var M=null;if("float"==p||"float4x4"==p){var x=_.querySelector("float_array"),g=this.readContentAsFloats(x);s[d]=g,M=g;var E=m.getAttribute("name");"TIME"==E&&(f=M),"OUTPUT"==v&&(E=v),E?o[E]=p:console.warn("Collada: <param> without name attribute in <animation>")}}}}if(!f)return console.error("Error DAE: no TIME info found in <channel>: "+t.getAttribute("source")),null;var b=n.split("/"),y={},S=b[0],T=this._nodes_by_id[S],I=T.id+"/"+b[1];y.name=b[1],y.property=I;var p="number",A=1,F=o.OUTPUT;switch(F){case"float":A=1;break;case"float3x3":A=9,p="mat3";break;case"float4x4":A=16,p="mat4"}y.type=p,y.value_size=A,y.duration=f[f.length-1];var D=s[i.OUTPUT.source];if(!D)return null;for(var R=f.length,w=A+1,P=new Float32Array(R*w),h=0;h<f.length;++h){P[h*w]=f[h];var N=D.subarray(h*A,(h+1)*A);"float4x4"==F&&this.transformMatrix(N,T?0==T._depth:0),P.set(N,h*w+1)}if(u&&this.use_transferables){var O=P;O&&O.buffer&&O.length>100&&this._transferables.push(O.buffer)}return y.data=P,y},findNode:function(t,e){if(t.id==e)return t;if(t.children)for(var r in t.children){var n=this.findNode(t.children[r],e);if(n)return n}return null},readLibraryControllers:function(t){var e=this._xmlroot.querySelector("library_controllers");if(!e)return null;for(var r=e.childNodes,n=0;n<r.length;++n){var a=r.item(n);if(1==a.nodeType&&"controller"==a.localName){var i=a.getAttribute("id");this._controllers_found[i]||this.readController(a,null,t)}}},readController:function(t,e,r){if("controller"==!t.localName)return console.warn("readController: not a controller: "+t.localName),null;var n=t.getAttribute("id");if(this._controllers_found[n])return this._controllers_found[n];var a=null,i=t.querySelector("skin");i&&(a=this.readSkinController(i,e,r));var u=t.querySelector("morph");return u&&(a=this.readMorphController(u,e,r,a)),this._controllers_found[n]?n+="_1blah":this._controllers_found[n]=a,a},readSkinController:function(t,e,r){var n=t.getAttribute("source"),a=this.readGeometry(n,e,r);if(!a)return null;var u=this.readSources(t,e);if(!u)return null;var o=null,s=t.querySelector("bind_shape_matrix");s?(o=this.readContentAsFloats(s),this.transformMatrix(o,!0,!0)):o=i.mat4.create();var l=[],f=t.querySelector("joints");if(f){for(var h=null,c=null,d=f.querySelectorAll("input"),v=0;v<d.length;v++){var _=d[v],m=_.getAttribute("semantic").toUpperCase(),p=_.getAttribute("source"),M=u[p.substr(1)];"JOINT"==m?h=M:"INV_BIND_MATRIX"==m&&(c=M)}if(!c||!h)return console.error("Error DAE: no joints or inv_bind sources found"),null;for(var v in h){var x=c.subarray(16*v,16*v+16),g=h[v],E=this._nodes_by_id[g];E?(this.transformMatrix(x,0==E._depth,!0),l.push([g,x])):console.warn("Node "+g+" not found")}}var b=t.querySelector("vertex_weights");if(b){for(var y=null,d=b.querySelectorAll("input"),v=0;v<d.length;v++)"WEIGHT"==d[v].getAttribute("semantic").toUpperCase()&&(y=u[d.item(v).getAttribute("source").substr(1)]);if(!y)throw"no weights found";for(var S=b.querySelector("vcount"),T=this.readContentAsUInt32(S),I=b.querySelector("v"),A=this.readContentAsUInt32(I),F=a.vertices.length/3,D=new Float32Array(4*F),R=new Uint8Array(4*F),w=0,P=a._remap,N=0,v=0,O=T.length;O>v;++v){for(var L=T[v],k=w,C=R.subarray(4*v,4*v+4),U=D.subarray(4*v,4*v+4),B=0,X=0;L>X&&4>X;++X)C[X]=A[k+2*X],C[X]>N&&(N=C[X]),U[X]=y[A[k+2*X+1]],B+=U[X];if(L>4&&1>B)for(var q=1/B,X=0;4>X;++X)U[X]*=q;w+=2*L}for(var V=new Float32Array(4*F),z=new Uint8Array(4*F),j=[],v=0;F>v;++v){for(var G=4*P[v],U=D.subarray(G,G+4),C=R.subarray(G,G+4),Y=0;3>Y;++Y){for(var W=Y,H=U[Y],X=Y+1;4>X;++X)U[X]<=H||(W=X,H=U[X]);if(W!=Y){var Z=U[Y];U[Y]=U[W],U[W]=Z,Z=C[Y],C[Y]=C[W],C[W]=Z}}V.set(U,4*v),z.set(C,4*v),U[0]&&(j[C[0]]=!0),U[1]&&(j[C[1]]=!0),U[2]&&(j[C[2]]=!0),U[3]&&(j[C[3]]=!0)}N>=l.length&&console.warn("Mesh uses higher bone index than bones found");for(var Q=[],K={},v=0;v<j.length;++v)j[v]&&(K[v]=Q.length,Q.push(l[v]));if(Q.length<l.length){for(var v=0;v<z.length;v++)z[v]=K[z[v]];l=Q}a.weights=V,a.bone_indices=z,a.bones=l,a.bind_matrix=o}return a},readMorphController:function(t,e,r,n){var a=t.getAttribute("source"),i=this.readGeometry(a,e,r);if(!i)return null;var u=this.readSources(t,e),o=[],s=t.querySelector("targets");if(!s)return null;for(var l=s.querySelectorAll("input"),f=null,h=null,c=0;c<l.length;c++){var d=l.item(c),v=d.getAttribute("semantic").toUpperCase(),_=u[d.getAttribute("source").substr(1)];"MORPH_TARGET"==v?f=_:"MORPH_WEIGHT"==v&&(h=_)}if(!f||!h)return console.warn("Morph controller without targets or weights. Skipping it."),null;for(var c in f){var m="#"+f[c],p=this.readGeometry(m,e,r);r.meshes[m]=p,o.push({mesh:m,weight:h[c]})}return i.morph_targets=o,i},readBindMaterials:function(t,e){for(var r=[],n=t.querySelectorAll("technique_common"),a=0;a<n.length;a++)for(var i=n.item(a),u=i.querySelectorAll("instance_material"),o=0;o<u.length;o++){var s=u.item(o);s&&r.push(s.getAttribute("symbol"))}return r},readSources:function(t,e){for(var r={},n=t.querySelectorAll("source"),a=0;a<n.length;a++){var i=n.item(a);if(i.querySelector){var u=i.querySelector("float_array");if(u){var o=this.readContentAsFloats(i);r[i.getAttribute("id")]=o}else{var s=i.querySelector("Name_array");if(s){var l=this.readContentAsStringsArray(s);if(!l)continue;r[i.getAttribute("id")]=l}else{var f=i.querySelector("IDREF_array");if(f){var l=this.readContentAsStringsArray(f);if(!l)continue;r[i.getAttribute("id")]=l}else;}}}}return r},readContentAsUInt32:function(t){if(!t)return null;var e=t.textContent;if(e=e.replace(/\n/gi," "),e=e.trim(),0==e.length)return null;for(var r=e.split(" "),n=new Uint32Array(r.length),a=0;a<r.length;a++)n[a]=parseInt(r[a]);return n},readContentAsFloats:function(t){if(!t)return null;var e=t.textContent;e=e.replace(/\n/gi," "),e=e.replace(/\s\s+/gi," "),e=e.replace(/\t/gi,""),e=e.trim();for(var r=e.split(" "),n=t.getAttribute("count"),a=n?parseInt(n):r.length,i=new Float32Array(a),u=0;u<r.length;u++)i[u]=parseFloat(r[u]);return i},readContentAsStringsArray:function(t){if(!t)return null;var e=t.textContent;e=e.replace(/\n/gi," "),e=e.replace(/\s\s/gi," "),e=e.trim();for(var r=e.split(" "),n=0;n<r.length;n++)r[n]=r[n].trim();if(t.getAttribute("count")&&parseInt(t.getAttribute("count"))!=r.length){var a=[],i="";for(var u in r)i?i+=" "+r[u]:i=r[u],this._nodes_by_id[this.safeString(i)]&&(a.push(this.safeString(i)),i="");var o=parseInt(t.getAttribute("count"));return a.length==o?a:(console.error("Error: bone names have spaces, avoid using spaces in names"),null)}return r},max3d_matrix_0:new Float32Array([0,-1,0,0,0,0,-1,0,1,0,0,-0,0,0,0,1]),transformMatrix:function(t,e,r){if(i.mat4.transpose(t,t),this.no_flip)return t;if(e){var n=new Float32Array(t.subarray(4,8));t.set(t.subarray(8,12),4),t.set(n,8),n=t.subarray(8,12),vec4.scale(n,n,-1)}else{var a=i.mat4.create(),u=t;a.set([u[0],u[2],-u[1]],0),a.set([u[8],u[10],-u[9]],4),a.set([-u[4],-u[6],u[5]],8),a.set([u[12],u[14],-u[13]],12),u.set(a)}return t}};e.default=d,t.exports=e.default}).call(e,function(){return this}())},function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}Object.defineProperty(e,"__esModule",{value:!0});var a=r(123),i=n(a),u=r(8),o=function(t){function e(t){var e=void 0;for(var r in n)r===t&&(e=n[r]);var a={};return e.diffuse&&(a.diffuseColor=e.diffuse),
a.diffuseColor=e.diffuse||[0,0,0],a.shininess=e.shininess||0,e.textures&&(e.textures.diffuse&&(a.diffuseMapID=e.textures.diffuse.map_id),e.textures.normal&&(a.normalMapID=e.textures.normal.map_id)),a}function r(t,n){var o=u.mat4.create();if(t.model?u.mat4.multiply(o,n,t.model):u.mat4.copy(o,n),t.children.length>0&&t.children.forEach(function(t){r(t,o)}),t.mesh){var s={};s.modelMatrix=o,s.mesh=a[t.mesh],s.id=t.id,s.name=t.name,s.material=e(t.material),i.push(s)}}var n=t.materials,a=t.meshes,i=[],o=[];for(var s in a){var l=a[s],f=l.vertices,h=l.normals,c=l.coords,d=l.triangles,v={vertices:f,normals:h,coords:c,triangles:d};o.push({id:s,buffers:v})}var _=u.mat4.create();return r(t.root,_),i},s=function(t){var e=i.default.parse(t);return o(e)},l=function(t,e){i.default.load(t,function(t){e(o(t))})},f={load:l,parse:s};e.default=f,t.exports=e.default},function(t,e,r){r(150);var n=r(10).Object;t.exports=function(t,e){return n.create(t,e)}},function(t,e,r){r(151);var n=r(10).Object;t.exports=function(t,e,r){return n.defineProperty(t,e,r)}},function(t,e,r){r(152);var n=r(10).Object;t.exports=function(t,e){return n.getOwnPropertyDescriptor(t,e)}},function(t,e,r){r(153),t.exports=r(10).Object.getPrototypeOf},function(t,e,r){r(154),t.exports=r(10).Object.setPrototypeOf},function(t,e,r){r(157),r(155),r(158),r(159),t.exports=r(10).Symbol},function(t,e,r){r(156),r(160),t.exports=r(52).f("iterator")},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e){t.exports=function(){}},function(t,e,r){var n=r(15),a=r(148),i=r(147);t.exports=function(t){return function(e,r,u){var o,s=n(e),l=a(s.length),f=i(u,l);if(t&&r!=r){for(;l>f;)if(o=s[f++],o!=o)return!0}else for(;l>f;f++)if((t||f in s)&&s[f]===r)return t||f||0;return!t&&-1}}},function(t,e,r){var n=r(28),a=r(73),i=r(45);t.exports=function(t){var e=n(t),r=a.f;if(r)for(var u,o=r(t),s=i.f,l=0;o.length>l;)s.call(t,u=o[l++])&&e.push(u);return e}},function(t,e,r){t.exports=r(14).document&&document.documentElement},function(t,e,r){var n=r(67);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==n(t)?t.split(""):Object(t)}},function(t,e,r){var n=r(67);t.exports=Array.isArray||function(t){return"Array"==n(t)}},function(t,e,r){"use strict";var n=r(43),a=r(29),i=r(46),u={};r(21)(u,r(22)("iterator"),function(){return this}),t.exports=function(t,e,r){t.prototype=n(u,{next:a(1,r)}),i(t,e+" Iterator")}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,r){var n=r(28),a=r(15);t.exports=function(t,e){for(var r,i=a(t),u=n(i),o=u.length,s=0;o>s;)if(i[r=u[s++]]===e)return r}},function(t,e,r){var n=r(30)("meta"),a=r(26),i=r(18),u=r(19).f,o=0,s=Object.isExtensible||function(){return!0},l=!r(25)(function(){return s(Object.preventExtensions({}))}),f=function(t){u(t,n,{value:{i:"O"+ ++o,w:{}}})},h=function(t,e){if(!a(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,n)){if(!s(t))return"F";if(!e)return"E";f(t)}return t[n].i},c=function(t,e){if(!i(t,n)){if(!s(t))return!0;if(!e)return!1;f(t)}return t[n].w},d=function(t){return l&&v.NEED&&s(t)&&!i(t,n)&&f(t),t},v=t.exports={KEY:n,NEED:!1,fastKey:h,getWeak:c,onFreeze:d}},function(t,e,r){var n=r(19),a=r(24),i=r(28);t.exports=r(17)?Object.defineProperties:function(t,e){a(t);for(var r,u=i(e),o=u.length,s=0;o>s;)n.f(t,r=u[s++],e[r]);return t}},function(t,e,r){var n=r(15),a=r(72).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],o=function(t){try{return a(t)}catch(e){return u.slice()}};t.exports.f=function(t){return u&&"[object Window]"==i.call(t)?o(t):a(n(t))}},function(t,e,r){var n=r(26),a=r(24),i=function(t,e){if(a(t),!n(e)&&null!==e)throw TypeError(e+": can't set as prototype!")};t.exports={set:Object.setPrototypeOf||("__proto__"in{}?function(t,e,n){try{n=r(68)(Function.call,r(44).f(Object.prototype,"__proto__").set,2),n(t,[]),e=!(t instanceof Array)}catch(a){e=!0}return function(t,r){return i(t,r),e?t.__proto__=r:n(t,r),t}}({},!1):void 0),check:i}},function(t,e,r){var n=r(49),a=r(39);t.exports=function(t){return function(e,r){var i,u,o=String(a(e)),s=n(r),l=o.length;return 0>s||s>=l?t?"":void 0:(i=o.charCodeAt(s),55296>i||i>56319||s+1===l||(u=o.charCodeAt(s+1))<56320||u>57343?t?o.charAt(s):i:t?o.slice(s,s+2):(i-55296<<10)+(u-56320)+65536)}}},function(t,e,r){var n=r(49),a=Math.max,i=Math.min;t.exports=function(t,e){return t=n(t),0>t?a(t+e,0):i(t,e)}},function(t,e,r){var n=r(49),a=Math.min;t.exports=function(t){return t>0?a(n(t),9007199254740991):0}},function(t,e,r){"use strict";var n=r(133),a=r(140),i=r(41),u=r(15);t.exports=r(71)(Array,"Array",function(t,e){this._t=u(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,r=this._i++;return!t||r>=t.length?(this._t=void 0,a(1)):"keys"==e?a(0,r):"values"==e?a(0,t[r]):a(0,[r,t[r]])},"values"),i.Arguments=i.Array,n("keys"),n("values"),n("entries")},function(t,e,r){var n=r(20);n(n.S,"Object",{create:r(43)})},function(t,e,r){var n=r(20);n(n.S+n.F*!r(17),"Object",{defineProperty:r(19).f})},function(t,e,r){var n=r(15),a=r(44).f;r(76)("getOwnPropertyDescriptor",function(){return function(t,e){return a(n(t),e)}})},function(t,e,r){var n=r(78),a=r(74);r(76)("getPrototypeOf",function(){return function(t){return a(n(t))}})},function(t,e,r){var n=r(20);n(n.S,"Object",{setPrototypeOf:r(145).set})},function(t,e){},function(t,e,r){"use strict";var n=r(146)(!0);r(71)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,e=this._t,r=this._i;return r>=e.length?{value:void 0,done:!0}:(t=n(e,r),this._i+=t.length,{value:t,done:!1})})},function(t,e,r){"use strict";var n=r(14),a=r(18),i=r(17),u=r(20),o=r(77),s=r(142).KEY,l=r(25),f=r(48),h=r(46),c=r(30),d=r(22),v=r(52),_=r(51),m=r(141),p=r(135),M=r(138),x=r(24),g=r(15),E=r(50),b=r(29),y=r(43),S=r(144),T=r(44),I=r(19),A=r(28),F=T.f,D=I.f,R=S.f,w=n.Symbol,P=n.JSON,N=P&&P.stringify,O="prototype",L=d("_hidden"),k=d("toPrimitive"),C={}.propertyIsEnumerable,U=f("symbol-registry"),B=f("symbols"),X=f("op-symbols"),q=Object[O],V="function"==typeof w,z=n.QObject,j=!z||!z[O]||!z[O].findChild,G=i&&l(function(){return 7!=y(D({},"a",{get:function(){return D(this,"a",{value:7}).a}})).a})?function(t,e,r){var n=F(q,e);n&&delete q[e],D(t,e,r),n&&t!==q&&D(q,e,n)}:D,Y=function(t){var e=B[t]=y(w[O]);return e._k=t,e},W=V&&"symbol"==typeof w.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof w},H=function(t,e,r){return t===q&&H(X,e,r),x(t),e=E(e,!0),x(r),a(B,e)?(r.enumerable?(a(t,L)&&t[L][e]&&(t[L][e]=!1),r=y(r,{enumerable:b(0,!1)})):(a(t,L)||D(t,L,b(1,{})),t[L][e]=!0),G(t,e,r)):D(t,e,r)},Z=function(t,e){x(t);for(var r,n=p(e=g(e)),a=0,i=n.length;i>a;)H(t,r=n[a++],e[r]);return t},Q=function(t,e){return void 0===e?y(t):Z(y(t),e)},K=function(t){var e=C.call(this,t=E(t,!0));return this===q&&a(B,t)&&!a(X,t)?!1:e||!a(this,t)||!a(B,t)||a(this,L)&&this[L][t]?e:!0},J=function(t,e){if(t=g(t),e=E(e,!0),t!==q||!a(B,e)||a(X,e)){var r=F(t,e);return!r||!a(B,e)||a(t,L)&&t[L][e]||(r.enumerable=!0),r}},$=function(t){for(var e,r=R(g(t)),n=[],i=0;r.length>i;)a(B,e=r[i++])||e==L||e==s||n.push(e);return n},tt=function(t){for(var e,r=t===q,n=R(r?X:g(t)),i=[],u=0;n.length>u;)a(B,e=n[u++])&&(r?a(q,e):!0)&&i.push(B[e]);return i};V||(w=function(){if(this instanceof w)throw TypeError("Symbol is not a constructor!");var t=c(arguments.length>0?arguments[0]:void 0),e=function(r){this===q&&e.call(X,r),a(this,L)&&a(this[L],t)&&(this[L][t]=!1),G(this,t,b(1,r))};return i&&j&&G(q,t,{configurable:!0,set:e}),Y(t)},o(w[O],"toString",function(){return this._k}),T.f=J,I.f=H,r(72).f=S.f=$,r(45).f=K,r(73).f=tt,i&&!r(42)&&o(q,"propertyIsEnumerable",K,!0),v.f=function(t){return Y(d(t))}),u(u.G+u.W+u.F*!V,{Symbol:w});for(var et="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),rt=0;et.length>rt;)d(et[rt++]);for(var et=A(d.store),rt=0;et.length>rt;)_(et[rt++]);u(u.S+u.F*!V,"Symbol",{"for":function(t){return a(U,t+="")?U[t]:U[t]=w(t)},keyFor:function(t){if(W(t))return m(U,t);throw TypeError(t+" is not a symbol!")},useSetter:function(){j=!0},useSimple:function(){j=!1}}),u(u.S+u.F*!V,"Object",{create:Q,defineProperty:H,defineProperties:Z,getOwnPropertyDescriptor:J,getOwnPropertyNames:$,getOwnPropertySymbols:tt}),P&&u(u.S+u.F*(!V||l(function(){var t=w();return"[null]"!=N([t])||"{}"!=N({a:t})||"{}"!=N(Object(t))})),"JSON",{stringify:function(t){if(void 0!==t&&!W(t)){for(var e,r,n=[t],a=1;arguments.length>a;)n.push(arguments[a++]);return e=n[1],"function"==typeof e&&(r=e),!r&&M(e)||(e=function(t,e){return r&&(e=r.call(this,t,e)),W(e)?void 0:e}),n[1]=e,N.apply(P,n)}}}),w[O][k]||r(21)(w[O],k,w[O].valueOf),h(w,"Symbol"),h(Math,"Math",!0),h(n.JSON,"JSON",!0)},function(t,e,r){r(51)("asyncIterator")},function(t,e,r){r(51)("observable")},function(t,e,r){r(149);for(var n=r(14),a=r(21),i=r(41),u=r(22)("toStringTag"),o=["NodeList","DOMTokenList","MediaList","StyleSheetList","CSSRuleList"],s=0;5>s;s++){var l=o[s],f=n[l],h=f&&f.prototype;h&&!h[u]&&a(h,u,l),i[l]=i.Array}},function(t,e,r){var n=r(11),a={};a.create=function(){var t=new n.ARRAY_TYPE(4);return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t},a.clone=function(t){var e=new n.ARRAY_TYPE(4);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e},a.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t},a.identity=function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t},a.fromValues=function(t,e,r,a){var i=new n.ARRAY_TYPE(4);return i[0]=t,i[1]=e,i[2]=r,i[3]=a,i},a.set=function(t,e,r,n,a){return t[0]=e,t[1]=r,t[2]=n,t[3]=a,t},a.transpose=function(t,e){if(t===e){var r=e[1];t[1]=e[2],t[2]=r}else t[0]=e[0],t[1]=e[2],t[2]=e[1],t[3]=e[3];return t},a.invert=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=r*i-a*n;return u?(u=1/u,t[0]=i*u,t[1]=-n*u,t[2]=-a*u,t[3]=r*u,t):null},a.adjoint=function(t,e){var r=e[0];return t[0]=e[3],t[1]=-e[1],t[2]=-e[2],t[3]=r,t},a.determinant=function(t){return t[0]*t[3]-t[2]*t[1]},a.multiply=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=r[0],s=r[1],l=r[2],f=r[3];return t[0]=n*o+i*s,t[1]=a*o+u*s,t[2]=n*l+i*f,t[3]=a*l+u*f,t},a.mul=a.multiply,a.rotate=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=Math.sin(r),s=Math.cos(r);return t[0]=n*s+i*o,t[1]=a*s+u*o,t[2]=n*-o+i*s,t[3]=a*-o+u*s,t},a.scale=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=r[0],s=r[1];return t[0]=n*o,t[1]=a*o,t[2]=i*s,t[3]=u*s,t},a.fromRotation=function(t,e){var r=Math.sin(e),n=Math.cos(e);return t[0]=n,t[1]=r,t[2]=-r,t[3]=n,t},a.fromScaling=function(t,e){return t[0]=e[0],t[1]=0,t[2]=0,t[3]=e[1],t},a.str=function(t){return"mat2("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},a.frob=function(t){return Math.sqrt(Math.pow(t[0],2)+Math.pow(t[1],2)+Math.pow(t[2],2)+Math.pow(t[3],2))},a.LDU=function(t,e,r,n){return t[2]=n[2]/n[0],r[0]=n[0],r[1]=n[1],r[3]=n[3]-t[2]*r[1],[t,e,r]},a.add=function(t,e,r){return t[0]=e[0]+r[0],t[1]=e[1]+r[1],t[2]=e[2]+r[2],t[3]=e[3]+r[3],t},a.subtract=function(t,e,r){return t[0]=e[0]-r[0],t[1]=e[1]-r[1],t[2]=e[2]-r[2],t[3]=e[3]-r[3],t},a.sub=a.subtract,a.exactEquals=function(t,e){return t[0]===e[0]&&t[1]===e[1]&&t[2]===e[2]&&t[3]===e[3]},a.equals=function(t,e){var r=t[0],a=t[1],i=t[2],u=t[3],o=e[0],s=e[1],l=e[2],f=e[3];return Math.abs(r-o)<=n.EPSILON*Math.max(1,Math.abs(r),Math.abs(o))&&Math.abs(a-s)<=n.EPSILON*Math.max(1,Math.abs(a),Math.abs(s))&&Math.abs(i-l)<=n.EPSILON*Math.max(1,Math.abs(i),Math.abs(l))&&Math.abs(u-f)<=n.EPSILON*Math.max(1,Math.abs(u),Math.abs(f))},a.multiplyScalar=function(t,e,r){return t[0]=e[0]*r,t[1]=e[1]*r,t[2]=e[2]*r,t[3]=e[3]*r,t},a.multiplyScalarAndAdd=function(t,e,r,n){return t[0]=e[0]+r[0]*n,t[1]=e[1]+r[1]*n,t[2]=e[2]+r[2]*n,t[3]=e[3]+r[3]*n,t},t.exports=a},function(t,e,r){var n=r(11),a={};a.create=function(){var t=new n.ARRAY_TYPE(6);return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t},a.clone=function(t){var e=new n.ARRAY_TYPE(6);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e},a.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t},a.identity=function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t},a.fromValues=function(t,e,r,a,i,u){var o=new n.ARRAY_TYPE(6);return o[0]=t,o[1]=e,o[2]=r,o[3]=a,o[4]=i,o[5]=u,o},a.set=function(t,e,r,n,a,i,u){return t[0]=e,t[1]=r,t[2]=n,t[3]=a,t[4]=i,t[5]=u,t},a.invert=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=e[4],o=e[5],s=r*i-n*a;return s?(s=1/s,t[0]=i*s,t[1]=-n*s,t[2]=-a*s,t[3]=r*s,t[4]=(a*o-i*u)*s,t[5]=(n*u-r*o)*s,t):null},a.determinant=function(t){return t[0]*t[3]-t[1]*t[2]},a.multiply=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=e[4],s=e[5],l=r[0],f=r[1],h=r[2],c=r[3],d=r[4],v=r[5];return t[0]=n*l+i*f,t[1]=a*l+u*f,t[2]=n*h+i*c,t[3]=a*h+u*c,t[4]=n*d+i*v+o,t[5]=a*d+u*v+s,t},a.mul=a.multiply,a.rotate=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=e[4],s=e[5],l=Math.sin(r),f=Math.cos(r);return t[0]=n*f+i*l,t[1]=a*f+u*l,t[2]=n*-l+i*f,t[3]=a*-l+u*f,t[4]=o,t[5]=s,t},a.scale=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=e[4],s=e[5],l=r[0],f=r[1];return t[0]=n*l,t[1]=a*l,t[2]=i*f,t[3]=u*f,t[4]=o,t[5]=s,t},a.translate=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=e[4],s=e[5],l=r[0],f=r[1];return t[0]=n,t[1]=a,t[2]=i,t[3]=u,t[4]=n*l+i*f+o,t[5]=a*l+u*f+s,t},a.fromRotation=function(t,e){var r=Math.sin(e),n=Math.cos(e);return t[0]=n,t[1]=r,t[2]=-r,t[3]=n,t[4]=0,t[5]=0,t},a.fromScaling=function(t,e){return t[0]=e[0],t[1]=0,t[2]=0,t[3]=e[1],t[4]=0,t[5]=0,t},a.fromTranslation=function(t,e){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=e[0],t[5]=e[1],t},a.str=function(t){return"mat2d("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+")"},a.frob=function(t){return Math.sqrt(Math.pow(t[0],2)+Math.pow(t[1],2)+Math.pow(t[2],2)+Math.pow(t[3],2)+Math.pow(t[4],2)+Math.pow(t[5],2)+1)},a.add=function(t,e,r){return t[0]=e[0]+r[0],t[1]=e[1]+r[1],t[2]=e[2]+r[2],t[3]=e[3]+r[3],t[4]=e[4]+r[4],t[5]=e[5]+r[5],t},a.subtract=function(t,e,r){return t[0]=e[0]-r[0],t[1]=e[1]-r[1],t[2]=e[2]-r[2],t[3]=e[3]-r[3],t[4]=e[4]-r[4],t[5]=e[5]-r[5],t},a.sub=a.subtract,a.multiplyScalar=function(t,e,r){return t[0]=e[0]*r,t[1]=e[1]*r,t[2]=e[2]*r,t[3]=e[3]*r,t[4]=e[4]*r,t[5]=e[5]*r,t},a.multiplyScalarAndAdd=function(t,e,r,n){return t[0]=e[0]+r[0]*n,t[1]=e[1]+r[1]*n,t[2]=e[2]+r[2]*n,t[3]=e[3]+r[3]*n,t[4]=e[4]+r[4]*n,t[5]=e[5]+r[5]*n,t},a.exactEquals=function(t,e){return t[0]===e[0]&&t[1]===e[1]&&t[2]===e[2]&&t[3]===e[3]&&t[4]===e[4]&&t[5]===e[5]},a.equals=function(t,e){var r=t[0],a=t[1],i=t[2],u=t[3],o=t[4],s=t[5],l=e[0],f=e[1],h=e[2],c=e[3],d=e[4],v=e[5];return Math.abs(r-l)<=n.EPSILON*Math.max(1,Math.abs(r),Math.abs(l))&&Math.abs(a-f)<=n.EPSILON*Math.max(1,Math.abs(a),Math.abs(f))&&Math.abs(i-h)<=n.EPSILON*Math.max(1,Math.abs(i),Math.abs(h))&&Math.abs(u-c)<=n.EPSILON*Math.max(1,Math.abs(u),Math.abs(c))&&Math.abs(o-d)<=n.EPSILON*Math.max(1,Math.abs(o),Math.abs(d))&&Math.abs(s-v)<=n.EPSILON*Math.max(1,Math.abs(s),Math.abs(v))},t.exports=a},function(t,e,r){var n=r(11),a={scalar:{},SIMD:{}};a.create=function(){var t=new n.ARRAY_TYPE(16);return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},a.clone=function(t){var e=new n.ARRAY_TYPE(16);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},a.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},a.fromValues=function(t,e,r,a,i,u,o,s,l,f,h,c,d,v,_,m){var p=new n.ARRAY_TYPE(16);return p[0]=t,p[1]=e,p[2]=r,p[3]=a,p[4]=i,p[5]=u,p[6]=o,p[7]=s,p[8]=l,p[9]=f,p[10]=h,p[11]=c,p[12]=d,p[13]=v,p[14]=_,p[15]=m,p},a.set=function(t,e,r,n,a,i,u,o,s,l,f,h,c,d,v,_,m){return t[0]=e,t[1]=r,t[2]=n,t[3]=a,t[4]=i,t[5]=u,t[6]=o,t[7]=s,t[8]=l,t[9]=f,t[10]=h,t[11]=c,t[12]=d,t[13]=v,t[14]=_,t[15]=m,t},a.identity=function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},a.scalar.transpose=function(t,e){if(t===e){var r=e[1],n=e[2],a=e[3],i=e[6],u=e[7],o=e[11];t[1]=e[4],t[2]=e[8],t[3]=e[12],t[4]=r,t[6]=e[9],t[7]=e[13],t[8]=n,t[9]=i,t[11]=e[14],t[12]=a,t[13]=u,t[14]=o}else t[0]=e[0],t[1]=e[4],t[2]=e[8],t[3]=e[12],t[4]=e[1],t[5]=e[5],t[6]=e[9],t[7]=e[13],t[8]=e[2],t[9]=e[6],t[10]=e[10],t[11]=e[14],t[12]=e[3],t[13]=e[7],t[14]=e[11],t[15]=e[15];return t},a.SIMD.transpose=function(t,e){var r,n,a,i,u,o,s,l,f,h;return r=SIMD.Float32x4.load(e,0),n=SIMD.Float32x4.load(e,4),a=SIMD.Float32x4.load(e,8),i=SIMD.Float32x4.load(e,12),u=SIMD.Float32x4.shuffle(r,n,0,1,4,5),o=SIMD.Float32x4.shuffle(a,i,0,1,4,5),s=SIMD.Float32x4.shuffle(u,o,0,2,4,6),l=SIMD.Float32x4.shuffle(u,o,1,3,5,7),SIMD.Float32x4.store(t,0,s),SIMD.Float32x4.store(t,4,l),u=SIMD.Float32x4.shuffle(r,n,2,3,6,7),o=SIMD.Float32x4.shuffle(a,i,2,3,6,7),f=SIMD.Float32x4.shuffle(u,o,0,2,4,6),h=SIMD.Float32x4.shuffle(u,o,1,3,5,7),SIMD.Float32x4.store(t,8,f),SIMD.Float32x4.store(t,12,h),t},a.transpose=n.USE_SIMD?a.SIMD.transpose:a.scalar.transpose,a.scalar.invert=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=e[4],o=e[5],s=e[6],l=e[7],f=e[8],h=e[9],c=e[10],d=e[11],v=e[12],_=e[13],m=e[14],p=e[15],M=r*o-n*u,x=r*s-a*u,g=r*l-i*u,E=n*s-a*o,b=n*l-i*o,y=a*l-i*s,S=f*_-h*v,T=f*m-c*v,I=f*p-d*v,A=h*m-c*_,F=h*p-d*_,D=c*p-d*m,R=M*D-x*F+g*A+E*I-b*T+y*S;return R?(R=1/R,t[0]=(o*D-s*F+l*A)*R,t[1]=(a*F-n*D-i*A)*R,t[2]=(_*y-m*b+p*E)*R,t[3]=(c*b-h*y-d*E)*R,t[4]=(s*I-u*D-l*T)*R,t[5]=(r*D-a*I+i*T)*R,t[6]=(m*g-v*y-p*x)*R,t[7]=(f*y-c*g+d*x)*R,t[8]=(u*F-o*I+l*S)*R,t[9]=(n*I-r*F-i*S)*R,t[10]=(v*b-_*g+p*M)*R,t[11]=(h*g-f*b-d*M)*R,t[12]=(o*T-u*A-s*S)*R,t[13]=(r*A-n*T+a*S)*R,t[14]=(_*x-v*E-m*M)*R,t[15]=(f*E-h*x+c*M)*R,t):null},a.SIMD.invert=function(t,e){var r,n,a,i,u,o,s,l,f,h,c=SIMD.Float32x4.load(e,0),d=SIMD.Float32x4.load(e,4),v=SIMD.Float32x4.load(e,8),_=SIMD.Float32x4.load(e,12);return u=SIMD.Float32x4.shuffle(c,d,0,1,4,5),n=SIMD.Float32x4.shuffle(v,_,0,1,4,5),r=SIMD.Float32x4.shuffle(u,n,0,2,4,6),n=SIMD.Float32x4.shuffle(n,u,1,3,5,7),u=SIMD.Float32x4.shuffle(c,d,2,3,6,7),i=SIMD.Float32x4.shuffle(v,_,2,3,6,7),a=SIMD.Float32x4.shuffle(u,i,0,2,4,6),i=SIMD.Float32x4.shuffle(i,u,1,3,5,7),u=SIMD.Float32x4.mul(a,i),u=SIMD.Float32x4.swizzle(u,1,0,3,2),o=SIMD.Float32x4.mul(n,u),s=SIMD.Float32x4.mul(r,u),u=SIMD.Float32x4.swizzle(u,2,3,0,1),o=SIMD.Float32x4.sub(SIMD.Float32x4.mul(n,u),o),s=SIMD.Float32x4.sub(SIMD.Float32x4.mul(r,u),s),s=SIMD.Float32x4.swizzle(s,2,3,0,1),u=SIMD.Float32x4.mul(n,a),u=SIMD.Float32x4.swizzle(u,1,0,3,2),o=SIMD.Float32x4.add(SIMD.Float32x4.mul(i,u),o),f=SIMD.Float32x4.mul(r,u),u=SIMD.Float32x4.swizzle(u,2,3,0,1),o=SIMD.Float32x4.sub(o,SIMD.Float32x4.mul(i,u)),f=SIMD.Float32x4.sub(SIMD.Float32x4.mul(r,u),f),f=SIMD.Float32x4.swizzle(f,2,3,0,1),u=SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(n,2,3,0,1),i),u=SIMD.Float32x4.swizzle(u,1,0,3,2),a=SIMD.Float32x4.swizzle(a,2,3,0,1),o=SIMD.Float32x4.add(SIMD.Float32x4.mul(a,u),o),l=SIMD.Float32x4.mul(r,u),u=SIMD.Float32x4.swizzle(u,2,3,0,1),o=SIMD.Float32x4.sub(o,SIMD.Float32x4.mul(a,u)),l=SIMD.Float32x4.sub(SIMD.Float32x4.mul(r,u),l),l=SIMD.Float32x4.swizzle(l,2,3,0,1),u=SIMD.Float32x4.mul(r,n),u=SIMD.Float32x4.swizzle(u,1,0,3,2),l=SIMD.Float32x4.add(SIMD.Float32x4.mul(i,u),l),f=SIMD.Float32x4.sub(SIMD.Float32x4.mul(a,u),f),u=SIMD.Float32x4.swizzle(u,2,3,0,1),l=SIMD.Float32x4.sub(SIMD.Float32x4.mul(i,u),l),f=SIMD.Float32x4.sub(f,SIMD.Float32x4.mul(a,u)),u=SIMD.Float32x4.mul(r,i),u=SIMD.Float32x4.swizzle(u,1,0,3,2),s=SIMD.Float32x4.sub(s,SIMD.Float32x4.mul(a,u)),l=SIMD.Float32x4.add(SIMD.Float32x4.mul(n,u),l),u=SIMD.Float32x4.swizzle(u,2,3,0,1),s=SIMD.Float32x4.add(SIMD.Float32x4.mul(a,u),s),l=SIMD.Float32x4.sub(l,SIMD.Float32x4.mul(n,u)),u=SIMD.Float32x4.mul(r,a),u=SIMD.Float32x4.swizzle(u,1,0,3,2),s=SIMD.Float32x4.add(SIMD.Float32x4.mul(i,u),s),f=SIMD.Float32x4.sub(f,SIMD.Float32x4.mul(n,u)),u=SIMD.Float32x4.swizzle(u,2,3,0,1),s=SIMD.Float32x4.sub(s,SIMD.Float32x4.mul(i,u)),f=SIMD.Float32x4.add(SIMD.Float32x4.mul(n,u),f),h=SIMD.Float32x4.mul(r,o),h=SIMD.Float32x4.add(SIMD.Float32x4.swizzle(h,2,3,0,1),h),h=SIMD.Float32x4.add(SIMD.Float32x4.swizzle(h,1,0,3,2),h),u=SIMD.Float32x4.reciprocalApproximation(h),h=SIMD.Float32x4.sub(SIMD.Float32x4.add(u,u),SIMD.Float32x4.mul(h,SIMD.Float32x4.mul(u,u))),(h=SIMD.Float32x4.swizzle(h,0,0,0,0))?(SIMD.Float32x4.store(t,0,SIMD.Float32x4.mul(h,o)),SIMD.Float32x4.store(t,4,SIMD.Float32x4.mul(h,s)),SIMD.Float32x4.store(t,8,SIMD.Float32x4.mul(h,l)),SIMD.Float32x4.store(t,12,SIMD.Float32x4.mul(h,f)),t):null},a.invert=n.USE_SIMD?a.SIMD.invert:a.scalar.invert,a.scalar.adjoint=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=e[4],o=e[5],s=e[6],l=e[7],f=e[8],h=e[9],c=e[10],d=e[11],v=e[12],_=e[13],m=e[14],p=e[15];return t[0]=o*(c*p-d*m)-h*(s*p-l*m)+_*(s*d-l*c),t[1]=-(n*(c*p-d*m)-h*(a*p-i*m)+_*(a*d-i*c)),t[2]=n*(s*p-l*m)-o*(a*p-i*m)+_*(a*l-i*s),t[3]=-(n*(s*d-l*c)-o*(a*d-i*c)+h*(a*l-i*s)),t[4]=-(u*(c*p-d*m)-f*(s*p-l*m)+v*(s*d-l*c)),t[5]=r*(c*p-d*m)-f*(a*p-i*m)+v*(a*d-i*c),t[6]=-(r*(s*p-l*m)-u*(a*p-i*m)+v*(a*l-i*s)),t[7]=r*(s*d-l*c)-u*(a*d-i*c)+f*(a*l-i*s),t[8]=u*(h*p-d*_)-f*(o*p-l*_)+v*(o*d-l*h),t[9]=-(r*(h*p-d*_)-f*(n*p-i*_)+v*(n*d-i*h)),t[10]=r*(o*p-l*_)-u*(n*p-i*_)+v*(n*l-i*o),t[11]=-(r*(o*d-l*h)-u*(n*d-i*h)+f*(n*l-i*o)),t[12]=-(u*(h*m-c*_)-f*(o*m-s*_)+v*(o*c-s*h)),t[13]=r*(h*m-c*_)-f*(n*m-a*_)+v*(n*c-a*h),t[14]=-(r*(o*m-s*_)-u*(n*m-a*_)+v*(n*s-a*o)),t[15]=r*(o*c-s*h)-u*(n*c-a*h)+f*(n*s-a*o),t},a.SIMD.adjoint=function(t,e){var r,n,a,i,u,o,s,l,f,h,c,d,v,r=SIMD.Float32x4.load(e,0),n=SIMD.Float32x4.load(e,4),a=SIMD.Float32x4.load(e,8),i=SIMD.Float32x4.load(e,12);return f=SIMD.Float32x4.shuffle(r,n,0,1,4,5),o=SIMD.Float32x4.shuffle(a,i,0,1,4,5),u=SIMD.Float32x4.shuffle(f,o,0,2,4,6),o=SIMD.Float32x4.shuffle(o,f,1,3,5,7),f=SIMD.Float32x4.shuffle(r,n,2,3,6,7),l=SIMD.Float32x4.shuffle(a,i,2,3,6,7),s=SIMD.Float32x4.shuffle(f,l,0,2,4,6),l=SIMD.Float32x4.shuffle(l,f,1,3,5,7),f=SIMD.Float32x4.mul(s,l),f=SIMD.Float32x4.swizzle(f,1,0,3,2),h=SIMD.Float32x4.mul(o,f),c=SIMD.Float32x4.mul(u,f),f=SIMD.Float32x4.swizzle(f,2,3,0,1),h=SIMD.Float32x4.sub(SIMD.Float32x4.mul(o,f),h),c=SIMD.Float32x4.sub(SIMD.Float32x4.mul(u,f),c),c=SIMD.Float32x4.swizzle(c,2,3,0,1),f=SIMD.Float32x4.mul(o,s),f=SIMD.Float32x4.swizzle(f,1,0,3,2),h=SIMD.Float32x4.add(SIMD.Float32x4.mul(l,f),h),v=SIMD.Float32x4.mul(u,f),f=SIMD.Float32x4.swizzle(f,2,3,0,1),h=SIMD.Float32x4.sub(h,SIMD.Float32x4.mul(l,f)),v=SIMD.Float32x4.sub(SIMD.Float32x4.mul(u,f),v),v=SIMD.Float32x4.swizzle(v,2,3,0,1),f=SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(o,2,3,0,1),l),f=SIMD.Float32x4.swizzle(f,1,0,3,2),s=SIMD.Float32x4.swizzle(s,2,3,0,1),h=SIMD.Float32x4.add(SIMD.Float32x4.mul(s,f),h),d=SIMD.Float32x4.mul(u,f),f=SIMD.Float32x4.swizzle(f,2,3,0,1),h=SIMD.Float32x4.sub(h,SIMD.Float32x4.mul(s,f)),d=SIMD.Float32x4.sub(SIMD.Float32x4.mul(u,f),d),d=SIMD.Float32x4.swizzle(d,2,3,0,1),f=SIMD.Float32x4.mul(u,o),f=SIMD.Float32x4.swizzle(f,1,0,3,2),d=SIMD.Float32x4.add(SIMD.Float32x4.mul(l,f),d),v=SIMD.Float32x4.sub(SIMD.Float32x4.mul(s,f),v),f=SIMD.Float32x4.swizzle(f,2,3,0,1),d=SIMD.Float32x4.sub(SIMD.Float32x4.mul(l,f),d),v=SIMD.Float32x4.sub(v,SIMD.Float32x4.mul(s,f)),f=SIMD.Float32x4.mul(u,l),f=SIMD.Float32x4.swizzle(f,1,0,3,2),c=SIMD.Float32x4.sub(c,SIMD.Float32x4.mul(s,f)),d=SIMD.Float32x4.add(SIMD.Float32x4.mul(o,f),d),f=SIMD.Float32x4.swizzle(f,2,3,0,1),c=SIMD.Float32x4.add(SIMD.Float32x4.mul(s,f),c),d=SIMD.Float32x4.sub(d,SIMD.Float32x4.mul(o,f)),f=SIMD.Float32x4.mul(u,s),f=SIMD.Float32x4.swizzle(f,1,0,3,2),c=SIMD.Float32x4.add(SIMD.Float32x4.mul(l,f),c),v=SIMD.Float32x4.sub(v,SIMD.Float32x4.mul(o,f)),f=SIMD.Float32x4.swizzle(f,2,3,0,1),c=SIMD.Float32x4.sub(c,SIMD.Float32x4.mul(l,f)),v=SIMD.Float32x4.add(SIMD.Float32x4.mul(o,f),v),SIMD.Float32x4.store(t,0,h),SIMD.Float32x4.store(t,4,c),SIMD.Float32x4.store(t,8,d),SIMD.Float32x4.store(t,12,v),t},a.adjoint=n.USE_SIMD?a.SIMD.adjoint:a.scalar.adjoint,a.determinant=function(t){var e=t[0],r=t[1],n=t[2],a=t[3],i=t[4],u=t[5],o=t[6],s=t[7],l=t[8],f=t[9],h=t[10],c=t[11],d=t[12],v=t[13],_=t[14],m=t[15],p=e*u-r*i,M=e*o-n*i,x=e*s-a*i,g=r*o-n*u,E=r*s-a*u,b=n*s-a*o,y=l*v-f*d,S=l*_-h*d,T=l*m-c*d,I=f*_-h*v,A=f*m-c*v,F=h*m-c*_;return p*F-M*A+x*I+g*T-E*S+b*y},a.SIMD.multiply=function(t,e,r){var n=SIMD.Float32x4.load(e,0),a=SIMD.Float32x4.load(e,4),i=SIMD.Float32x4.load(e,8),u=SIMD.Float32x4.load(e,12),o=SIMD.Float32x4.load(r,0),s=SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(o,0,0,0,0),n),SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(o,1,1,1,1),a),SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(o,2,2,2,2),i),SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(o,3,3,3,3),u))));SIMD.Float32x4.store(t,0,s);var l=SIMD.Float32x4.load(r,4),f=SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(l,0,0,0,0),n),SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(l,1,1,1,1),a),SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(l,2,2,2,2),i),SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(l,3,3,3,3),u))));SIMD.Float32x4.store(t,4,f);var h=SIMD.Float32x4.load(r,8),c=SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(h,0,0,0,0),n),SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(h,1,1,1,1),a),SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(h,2,2,2,2),i),SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(h,3,3,3,3),u))));SIMD.Float32x4.store(t,8,c);var d=SIMD.Float32x4.load(r,12),v=SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(d,0,0,0,0),n),SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(d,1,1,1,1),a),SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(d,2,2,2,2),i),SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(d,3,3,3,3),u))));return SIMD.Float32x4.store(t,12,v),t},a.scalar.multiply=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=e[4],s=e[5],l=e[6],f=e[7],h=e[8],c=e[9],d=e[10],v=e[11],_=e[12],m=e[13],p=e[14],M=e[15],x=r[0],g=r[1],E=r[2],b=r[3];return t[0]=x*n+g*o+E*h+b*_,t[1]=x*a+g*s+E*c+b*m,t[2]=x*i+g*l+E*d+b*p,t[3]=x*u+g*f+E*v+b*M,x=r[4],g=r[5],E=r[6],b=r[7],t[4]=x*n+g*o+E*h+b*_,t[5]=x*a+g*s+E*c+b*m,t[6]=x*i+g*l+E*d+b*p,t[7]=x*u+g*f+E*v+b*M,x=r[8],g=r[9],E=r[10],b=r[11],t[8]=x*n+g*o+E*h+b*_,t[9]=x*a+g*s+E*c+b*m,t[10]=x*i+g*l+E*d+b*p,t[11]=x*u+g*f+E*v+b*M,x=r[12],g=r[13],E=r[14],b=r[15],t[12]=x*n+g*o+E*h+b*_,t[13]=x*a+g*s+E*c+b*m,t[14]=x*i+g*l+E*d+b*p,t[15]=x*u+g*f+E*v+b*M,t},a.multiply=n.USE_SIMD?a.SIMD.multiply:a.scalar.multiply,a.mul=a.multiply,a.scalar.translate=function(t,e,r){var n,a,i,u,o,s,l,f,h,c,d,v,_=r[0],m=r[1],p=r[2];return e===t?(t[12]=e[0]*_+e[4]*m+e[8]*p+e[12],t[13]=e[1]*_+e[5]*m+e[9]*p+e[13],t[14]=e[2]*_+e[6]*m+e[10]*p+e[14],t[15]=e[3]*_+e[7]*m+e[11]*p+e[15]):(n=e[0],a=e[1],i=e[2],u=e[3],o=e[4],s=e[5],l=e[6],f=e[7],h=e[8],c=e[9],d=e[10],v=e[11],t[0]=n,t[1]=a,t[2]=i,t[3]=u,t[4]=o,t[5]=s,t[6]=l,t[7]=f,t[8]=h,t[9]=c,t[10]=d,t[11]=v,t[12]=n*_+o*m+h*p+e[12],t[13]=a*_+s*m+c*p+e[13],t[14]=i*_+l*m+d*p+e[14],t[15]=u*_+f*m+v*p+e[15]),t},a.SIMD.translate=function(t,e,r){var n=SIMD.Float32x4.load(e,0),a=SIMD.Float32x4.load(e,4),i=SIMD.Float32x4.load(e,8),u=SIMD.Float32x4.load(e,12),o=SIMD.Float32x4(r[0],r[1],r[2],0);e!==t&&(t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11]),n=SIMD.Float32x4.mul(n,SIMD.Float32x4.swizzle(o,0,0,0,0)),a=SIMD.Float32x4.mul(a,SIMD.Float32x4.swizzle(o,1,1,1,1)),i=SIMD.Float32x4.mul(i,SIMD.Float32x4.swizzle(o,2,2,2,2));var s=SIMD.Float32x4.add(n,SIMD.Float32x4.add(a,SIMD.Float32x4.add(i,u)));return SIMD.Float32x4.store(t,12,s),t},a.translate=n.USE_SIMD?a.SIMD.translate:a.scalar.translate,a.scalar.scale=function(t,e,r){var n=r[0],a=r[1],i=r[2];return t[0]=e[0]*n,t[1]=e[1]*n,t[2]=e[2]*n,t[3]=e[3]*n,t[4]=e[4]*a,t[5]=e[5]*a,t[6]=e[6]*a,t[7]=e[7]*a,t[8]=e[8]*i,t[9]=e[9]*i,t[10]=e[10]*i,t[11]=e[11]*i,t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},a.SIMD.scale=function(t,e,r){var n,a,i,u=SIMD.Float32x4(r[0],r[1],r[2],0);return n=SIMD.Float32x4.load(e,0),SIMD.Float32x4.store(t,0,SIMD.Float32x4.mul(n,SIMD.Float32x4.swizzle(u,0,0,0,0))),a=SIMD.Float32x4.load(e,4),SIMD.Float32x4.store(t,4,SIMD.Float32x4.mul(a,SIMD.Float32x4.swizzle(u,1,1,1,1))),i=SIMD.Float32x4.load(e,8),SIMD.Float32x4.store(t,8,SIMD.Float32x4.mul(i,SIMD.Float32x4.swizzle(u,2,2,2,2))),t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},a.scale=n.USE_SIMD?a.SIMD.scale:a.scalar.scale,a.rotate=function(t,e,r,a){var i,u,o,s,l,f,h,c,d,v,_,m,p,M,x,g,E,b,y,S,T,I,A,F,D=a[0],R=a[1],w=a[2],P=Math.sqrt(D*D+R*R+w*w);return Math.abs(P)<n.EPSILON?null:(P=1/P,D*=P,R*=P,w*=P,i=Math.sin(r),u=Math.cos(r),o=1-u,s=e[0],l=e[1],f=e[2],h=e[3],c=e[4],d=e[5],v=e[6],_=e[7],m=e[8],p=e[9],M=e[10],x=e[11],g=D*D*o+u,E=R*D*o+w*i,b=w*D*o-R*i,y=D*R*o-w*i,S=R*R*o+u,T=w*R*o+D*i,I=D*w*o+R*i,A=R*w*o-D*i,F=w*w*o+u,t[0]=s*g+c*E+m*b,t[1]=l*g+d*E+p*b,t[2]=f*g+v*E+M*b,t[3]=h*g+_*E+x*b,t[4]=s*y+c*S+m*T,t[5]=l*y+d*S+p*T,t[6]=f*y+v*S+M*T,t[7]=h*y+_*S+x*T,t[8]=s*I+c*A+m*F,t[9]=l*I+d*A+p*F,t[10]=f*I+v*A+M*F,t[11]=h*I+_*A+x*F,e!==t&&(t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]),t)},a.scalar.rotateX=function(t,e,r){var n=Math.sin(r),a=Math.cos(r),i=e[4],u=e[5],o=e[6],s=e[7],l=e[8],f=e[9],h=e[10],c=e[11];return e!==t&&(t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]),t[4]=i*a+l*n,t[5]=u*a+f*n,t[6]=o*a+h*n,t[7]=s*a+c*n,t[8]=l*a-i*n,t[9]=f*a-u*n,t[10]=h*a-o*n,t[11]=c*a-s*n,t},a.SIMD.rotateX=function(t,e,r){var n=SIMD.Float32x4.splat(Math.sin(r)),a=SIMD.Float32x4.splat(Math.cos(r));e!==t&&(t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]);var i=SIMD.Float32x4.load(e,4),u=SIMD.Float32x4.load(e,8);return SIMD.Float32x4.store(t,4,SIMD.Float32x4.add(SIMD.Float32x4.mul(i,a),SIMD.Float32x4.mul(u,n))),SIMD.Float32x4.store(t,8,SIMD.Float32x4.sub(SIMD.Float32x4.mul(u,a),SIMD.Float32x4.mul(i,n))),t},a.rotateX=n.USE_SIMD?a.SIMD.rotateX:a.scalar.rotateX,a.scalar.rotateY=function(t,e,r){var n=Math.sin(r),a=Math.cos(r),i=e[0],u=e[1],o=e[2],s=e[3],l=e[8],f=e[9],h=e[10],c=e[11];return e!==t&&(t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]),t[0]=i*a-l*n,t[1]=u*a-f*n,t[2]=o*a-h*n,t[3]=s*a-c*n,t[8]=i*n+l*a,t[9]=u*n+f*a,t[10]=o*n+h*a,t[11]=s*n+c*a,t},a.SIMD.rotateY=function(t,e,r){var n=SIMD.Float32x4.splat(Math.sin(r)),a=SIMD.Float32x4.splat(Math.cos(r));e!==t&&(t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]);var i=SIMD.Float32x4.load(e,0),u=SIMD.Float32x4.load(e,8);return SIMD.Float32x4.store(t,0,SIMD.Float32x4.sub(SIMD.Float32x4.mul(i,a),SIMD.Float32x4.mul(u,n))),SIMD.Float32x4.store(t,8,SIMD.Float32x4.add(SIMD.Float32x4.mul(i,n),SIMD.Float32x4.mul(u,a))),t},a.rotateY=n.USE_SIMD?a.SIMD.rotateY:a.scalar.rotateY,a.scalar.rotateZ=function(t,e,r){var n=Math.sin(r),a=Math.cos(r),i=e[0],u=e[1],o=e[2],s=e[3],l=e[4],f=e[5],h=e[6],c=e[7];return e!==t&&(t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]),t[0]=i*a+l*n,t[1]=u*a+f*n,t[2]=o*a+h*n,t[3]=s*a+c*n,t[4]=l*a-i*n,t[5]=f*a-u*n,t[6]=h*a-o*n,t[7]=c*a-s*n,t},a.SIMD.rotateZ=function(t,e,r){var n=SIMD.Float32x4.splat(Math.sin(r)),a=SIMD.Float32x4.splat(Math.cos(r));e!==t&&(t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]);var i=SIMD.Float32x4.load(e,0),u=SIMD.Float32x4.load(e,4);return SIMD.Float32x4.store(t,0,SIMD.Float32x4.add(SIMD.Float32x4.mul(i,a),SIMD.Float32x4.mul(u,n))),SIMD.Float32x4.store(t,4,SIMD.Float32x4.sub(SIMD.Float32x4.mul(u,a),SIMD.Float32x4.mul(i,n))),t},a.rotateZ=n.USE_SIMD?a.SIMD.rotateZ:a.scalar.rotateZ,a.fromTranslation=function(t,e){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=e[0],t[13]=e[1],t[14]=e[2],t[15]=1,t},a.fromScaling=function(t,e){return t[0]=e[0],t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=e[1],t[6]=0,t[7]=0,t[8]=0,
t[9]=0,t[10]=e[2],t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},a.fromRotation=function(t,e,r){var a,i,u,o=r[0],s=r[1],l=r[2],f=Math.sqrt(o*o+s*s+l*l);return Math.abs(f)<n.EPSILON?null:(f=1/f,o*=f,s*=f,l*=f,a=Math.sin(e),i=Math.cos(e),u=1-i,t[0]=o*o*u+i,t[1]=s*o*u+l*a,t[2]=l*o*u-s*a,t[3]=0,t[4]=o*s*u-l*a,t[5]=s*s*u+i,t[6]=l*s*u+o*a,t[7]=0,t[8]=o*l*u+s*a,t[9]=s*l*u-o*a,t[10]=l*l*u+i,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t)},a.fromXRotation=function(t,e){var r=Math.sin(e),n=Math.cos(e);return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=n,t[6]=r,t[7]=0,t[8]=0,t[9]=-r,t[10]=n,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},a.fromYRotation=function(t,e){var r=Math.sin(e),n=Math.cos(e);return t[0]=n,t[1]=0,t[2]=-r,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=r,t[9]=0,t[10]=n,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},a.fromZRotation=function(t,e){var r=Math.sin(e),n=Math.cos(e);return t[0]=n,t[1]=r,t[2]=0,t[3]=0,t[4]=-r,t[5]=n,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},a.fromRotationTranslation=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=n+n,s=a+a,l=i+i,f=n*o,h=n*s,c=n*l,d=a*s,v=a*l,_=i*l,m=u*o,p=u*s,M=u*l;return t[0]=1-(d+_),t[1]=h+M,t[2]=c-p,t[3]=0,t[4]=h-M,t[5]=1-(f+_),t[6]=v+m,t[7]=0,t[8]=c+p,t[9]=v-m,t[10]=1-(f+d),t[11]=0,t[12]=r[0],t[13]=r[1],t[14]=r[2],t[15]=1,t},a.getTranslation=function(t,e){return t[0]=e[12],t[1]=e[13],t[2]=e[14],t},a.getRotation=function(t,e){var r=e[0]+e[5]+e[10],n=0;return r>0?(n=2*Math.sqrt(r+1),t[3]=.25*n,t[0]=(e[6]-e[9])/n,t[1]=(e[8]-e[2])/n,t[2]=(e[1]-e[4])/n):e[0]>e[5]&e[0]>e[10]?(n=2*Math.sqrt(1+e[0]-e[5]-e[10]),t[3]=(e[6]-e[9])/n,t[0]=.25*n,t[1]=(e[1]+e[4])/n,t[2]=(e[8]+e[2])/n):e[5]>e[10]?(n=2*Math.sqrt(1+e[5]-e[0]-e[10]),t[3]=(e[8]-e[2])/n,t[0]=(e[1]+e[4])/n,t[1]=.25*n,t[2]=(e[6]+e[9])/n):(n=2*Math.sqrt(1+e[10]-e[0]-e[5]),t[3]=(e[1]-e[4])/n,t[0]=(e[8]+e[2])/n,t[1]=(e[6]+e[9])/n,t[2]=.25*n),t},a.fromRotationTranslationScale=function(t,e,r,n){var a=e[0],i=e[1],u=e[2],o=e[3],s=a+a,l=i+i,f=u+u,h=a*s,c=a*l,d=a*f,v=i*l,_=i*f,m=u*f,p=o*s,M=o*l,x=o*f,g=n[0],E=n[1],b=n[2];return t[0]=(1-(v+m))*g,t[1]=(c+x)*g,t[2]=(d-M)*g,t[3]=0,t[4]=(c-x)*E,t[5]=(1-(h+m))*E,t[6]=(_+p)*E,t[7]=0,t[8]=(d+M)*b,t[9]=(_-p)*b,t[10]=(1-(h+v))*b,t[11]=0,t[12]=r[0],t[13]=r[1],t[14]=r[2],t[15]=1,t},a.fromRotationTranslationScaleOrigin=function(t,e,r,n,a){var i=e[0],u=e[1],o=e[2],s=e[3],l=i+i,f=u+u,h=o+o,c=i*l,d=i*f,v=i*h,_=u*f,m=u*h,p=o*h,M=s*l,x=s*f,g=s*h,E=n[0],b=n[1],y=n[2],S=a[0],T=a[1],I=a[2];return t[0]=(1-(_+p))*E,t[1]=(d+g)*E,t[2]=(v-x)*E,t[3]=0,t[4]=(d-g)*b,t[5]=(1-(c+p))*b,t[6]=(m+M)*b,t[7]=0,t[8]=(v+x)*y,t[9]=(m-M)*y,t[10]=(1-(c+_))*y,t[11]=0,t[12]=r[0]+S-(t[0]*S+t[4]*T+t[8]*I),t[13]=r[1]+T-(t[1]*S+t[5]*T+t[9]*I),t[14]=r[2]+I-(t[2]*S+t[6]*T+t[10]*I),t[15]=1,t},a.fromQuat=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=r+r,o=n+n,s=a+a,l=r*u,f=n*u,h=n*o,c=a*u,d=a*o,v=a*s,_=i*u,m=i*o,p=i*s;return t[0]=1-h-v,t[1]=f+p,t[2]=c-m,t[3]=0,t[4]=f-p,t[5]=1-l-v,t[6]=d+_,t[7]=0,t[8]=c+m,t[9]=d-_,t[10]=1-l-h,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},a.frustum=function(t,e,r,n,a,i,u){var o=1/(r-e),s=1/(a-n),l=1/(i-u);return t[0]=2*i*o,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=2*i*s,t[6]=0,t[7]=0,t[8]=(r+e)*o,t[9]=(a+n)*s,t[10]=(u+i)*l,t[11]=-1,t[12]=0,t[13]=0,t[14]=u*i*2*l,t[15]=0,t},a.perspective=function(t,e,r,n,a){var i=1/Math.tan(e/2),u=1/(n-a);return t[0]=i/r,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=i,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=(a+n)*u,t[11]=-1,t[12]=0,t[13]=0,t[14]=2*a*n*u,t[15]=0,t},a.perspectiveFromFieldOfView=function(t,e,r,n){var a=Math.tan(e.upDegrees*Math.PI/180),i=Math.tan(e.downDegrees*Math.PI/180),u=Math.tan(e.leftDegrees*Math.PI/180),o=Math.tan(e.rightDegrees*Math.PI/180),s=2/(u+o),l=2/(a+i);return t[0]=s,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=l,t[6]=0,t[7]=0,t[8]=-((u-o)*s*.5),t[9]=(a-i)*l*.5,t[10]=n/(r-n),t[11]=-1,t[12]=0,t[13]=0,t[14]=n*r/(r-n),t[15]=0,t},a.ortho=function(t,e,r,n,a,i,u){var o=1/(e-r),s=1/(n-a),l=1/(i-u);return t[0]=-2*o,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=-2*s,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=2*l,t[11]=0,t[12]=(e+r)*o,t[13]=(a+n)*s,t[14]=(u+i)*l,t[15]=1,t},a.lookAt=function(t,e,r,i){var u,o,s,l,f,h,c,d,v,_,m=e[0],p=e[1],M=e[2],x=i[0],g=i[1],E=i[2],b=r[0],y=r[1],S=r[2];return Math.abs(m-b)<n.EPSILON&&Math.abs(p-y)<n.EPSILON&&Math.abs(M-S)<n.EPSILON?a.identity(t):(c=m-b,d=p-y,v=M-S,_=1/Math.sqrt(c*c+d*d+v*v),c*=_,d*=_,v*=_,u=g*v-E*d,o=E*c-x*v,s=x*d-g*c,_=Math.sqrt(u*u+o*o+s*s),_?(_=1/_,u*=_,o*=_,s*=_):(u=0,o=0,s=0),l=d*s-v*o,f=v*u-c*s,h=c*o-d*u,_=Math.sqrt(l*l+f*f+h*h),_?(_=1/_,l*=_,f*=_,h*=_):(l=0,f=0,h=0),t[0]=u,t[1]=l,t[2]=c,t[3]=0,t[4]=o,t[5]=f,t[6]=d,t[7]=0,t[8]=s,t[9]=h,t[10]=v,t[11]=0,t[12]=-(u*m+o*p+s*M),t[13]=-(l*m+f*p+h*M),t[14]=-(c*m+d*p+v*M),t[15]=1,t)},a.str=function(t){return"mat4("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+", "+t[8]+", "+t[9]+", "+t[10]+", "+t[11]+", "+t[12]+", "+t[13]+", "+t[14]+", "+t[15]+")"},a.frob=function(t){return Math.sqrt(Math.pow(t[0],2)+Math.pow(t[1],2)+Math.pow(t[2],2)+Math.pow(t[3],2)+Math.pow(t[4],2)+Math.pow(t[5],2)+Math.pow(t[6],2)+Math.pow(t[7],2)+Math.pow(t[8],2)+Math.pow(t[9],2)+Math.pow(t[10],2)+Math.pow(t[11],2)+Math.pow(t[12],2)+Math.pow(t[13],2)+Math.pow(t[14],2)+Math.pow(t[15],2))},a.add=function(t,e,r){return t[0]=e[0]+r[0],t[1]=e[1]+r[1],t[2]=e[2]+r[2],t[3]=e[3]+r[3],t[4]=e[4]+r[4],t[5]=e[5]+r[5],t[6]=e[6]+r[6],t[7]=e[7]+r[7],t[8]=e[8]+r[8],t[9]=e[9]+r[9],t[10]=e[10]+r[10],t[11]=e[11]+r[11],t[12]=e[12]+r[12],t[13]=e[13]+r[13],t[14]=e[14]+r[14],t[15]=e[15]+r[15],t},a.subtract=function(t,e,r){return t[0]=e[0]-r[0],t[1]=e[1]-r[1],t[2]=e[2]-r[2],t[3]=e[3]-r[3],t[4]=e[4]-r[4],t[5]=e[5]-r[5],t[6]=e[6]-r[6],t[7]=e[7]-r[7],t[8]=e[8]-r[8],t[9]=e[9]-r[9],t[10]=e[10]-r[10],t[11]=e[11]-r[11],t[12]=e[12]-r[12],t[13]=e[13]-r[13],t[14]=e[14]-r[14],t[15]=e[15]-r[15],t},a.sub=a.subtract,a.multiplyScalar=function(t,e,r){return t[0]=e[0]*r,t[1]=e[1]*r,t[2]=e[2]*r,t[3]=e[3]*r,t[4]=e[4]*r,t[5]=e[5]*r,t[6]=e[6]*r,t[7]=e[7]*r,t[8]=e[8]*r,t[9]=e[9]*r,t[10]=e[10]*r,t[11]=e[11]*r,t[12]=e[12]*r,t[13]=e[13]*r,t[14]=e[14]*r,t[15]=e[15]*r,t},a.multiplyScalarAndAdd=function(t,e,r,n){return t[0]=e[0]+r[0]*n,t[1]=e[1]+r[1]*n,t[2]=e[2]+r[2]*n,t[3]=e[3]+r[3]*n,t[4]=e[4]+r[4]*n,t[5]=e[5]+r[5]*n,t[6]=e[6]+r[6]*n,t[7]=e[7]+r[7]*n,t[8]=e[8]+r[8]*n,t[9]=e[9]+r[9]*n,t[10]=e[10]+r[10]*n,t[11]=e[11]+r[11]*n,t[12]=e[12]+r[12]*n,t[13]=e[13]+r[13]*n,t[14]=e[14]+r[14]*n,t[15]=e[15]+r[15]*n,t},a.exactEquals=function(t,e){return t[0]===e[0]&&t[1]===e[1]&&t[2]===e[2]&&t[3]===e[3]&&t[4]===e[4]&&t[5]===e[5]&&t[6]===e[6]&&t[7]===e[7]&&t[8]===e[8]&&t[9]===e[9]&&t[10]===e[10]&&t[11]===e[11]&&t[12]===e[12]&&t[13]===e[13]&&t[14]===e[14]&&t[15]===e[15]},a.equals=function(t,e){var r=t[0],a=t[1],i=t[2],u=t[3],o=t[4],s=t[5],l=t[6],f=t[7],h=t[8],c=t[9],d=t[10],v=t[11],_=t[12],m=t[13],p=t[14],M=t[15],x=e[0],g=e[1],E=e[2],b=e[3],y=e[4],S=e[5],T=e[6],I=e[7],A=e[8],F=e[9],D=e[10],R=e[11],w=e[12],P=e[13],N=e[14],O=e[15];return Math.abs(r-x)<=n.EPSILON*Math.max(1,Math.abs(r),Math.abs(x))&&Math.abs(a-g)<=n.EPSILON*Math.max(1,Math.abs(a),Math.abs(g))&&Math.abs(i-E)<=n.EPSILON*Math.max(1,Math.abs(i),Math.abs(E))&&Math.abs(u-b)<=n.EPSILON*Math.max(1,Math.abs(u),Math.abs(b))&&Math.abs(o-y)<=n.EPSILON*Math.max(1,Math.abs(o),Math.abs(y))&&Math.abs(s-S)<=n.EPSILON*Math.max(1,Math.abs(s),Math.abs(S))&&Math.abs(l-T)<=n.EPSILON*Math.max(1,Math.abs(l),Math.abs(T))&&Math.abs(f-I)<=n.EPSILON*Math.max(1,Math.abs(f),Math.abs(I))&&Math.abs(h-A)<=n.EPSILON*Math.max(1,Math.abs(h),Math.abs(A))&&Math.abs(c-F)<=n.EPSILON*Math.max(1,Math.abs(c),Math.abs(F))&&Math.abs(d-D)<=n.EPSILON*Math.max(1,Math.abs(d),Math.abs(D))&&Math.abs(v-R)<=n.EPSILON*Math.max(1,Math.abs(v),Math.abs(R))&&Math.abs(_-w)<=n.EPSILON*Math.max(1,Math.abs(_),Math.abs(w))&&Math.abs(m-P)<=n.EPSILON*Math.max(1,Math.abs(m),Math.abs(P))&&Math.abs(p-N)<=n.EPSILON*Math.max(1,Math.abs(p),Math.abs(N))&&Math.abs(M-O)<=n.EPSILON*Math.max(1,Math.abs(M),Math.abs(O))},t.exports=a},function(t,e,r){var n=r(11),a=r(79),i=r(80),u=r(81),o={};o.create=function(){var t=new n.ARRAY_TYPE(4);return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t},o.rotationTo=function(){var t=i.create(),e=i.fromValues(1,0,0),r=i.fromValues(0,1,0);return function(n,a,u){var s=i.dot(a,u);return-.999999>s?(i.cross(t,e,a),i.length(t)<1e-6&&i.cross(t,r,a),i.normalize(t,t),o.setAxisAngle(n,t,Math.PI),n):s>.999999?(n[0]=0,n[1]=0,n[2]=0,n[3]=1,n):(i.cross(t,a,u),n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=1+s,o.normalize(n,n))}}(),o.setAxes=function(){var t=a.create();return function(e,r,n,a){return t[0]=n[0],t[3]=n[1],t[6]=n[2],t[1]=a[0],t[4]=a[1],t[7]=a[2],t[2]=-r[0],t[5]=-r[1],t[8]=-r[2],o.normalize(e,o.fromMat3(e,t))}}(),o.clone=u.clone,o.fromValues=u.fromValues,o.copy=u.copy,o.set=u.set,o.identity=function(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t},o.setAxisAngle=function(t,e,r){r=.5*r;var n=Math.sin(r);return t[0]=n*e[0],t[1]=n*e[1],t[2]=n*e[2],t[3]=Math.cos(r),t},o.getAxisAngle=function(t,e){var r=2*Math.acos(e[3]),n=Math.sin(r/2);return 0!=n?(t[0]=e[0]/n,t[1]=e[1]/n,t[2]=e[2]/n):(t[0]=1,t[1]=0,t[2]=0),r},o.add=u.add,o.multiply=function(t,e,r){var n=e[0],a=e[1],i=e[2],u=e[3],o=r[0],s=r[1],l=r[2],f=r[3];return t[0]=n*f+u*o+a*l-i*s,t[1]=a*f+u*s+i*o-n*l,t[2]=i*f+u*l+n*s-a*o,t[3]=u*f-n*o-a*s-i*l,t},o.mul=o.multiply,o.scale=u.scale,o.rotateX=function(t,e,r){r*=.5;var n=e[0],a=e[1],i=e[2],u=e[3],o=Math.sin(r),s=Math.cos(r);return t[0]=n*s+u*o,t[1]=a*s+i*o,t[2]=i*s-a*o,t[3]=u*s-n*o,t},o.rotateY=function(t,e,r){r*=.5;var n=e[0],a=e[1],i=e[2],u=e[3],o=Math.sin(r),s=Math.cos(r);return t[0]=n*s-i*o,t[1]=a*s+u*o,t[2]=i*s+n*o,t[3]=u*s-a*o,t},o.rotateZ=function(t,e,r){r*=.5;var n=e[0],a=e[1],i=e[2],u=e[3],o=Math.sin(r),s=Math.cos(r);return t[0]=n*s+a*o,t[1]=a*s-n*o,t[2]=i*s+u*o,t[3]=u*s-i*o,t},o.calculateW=function(t,e){var r=e[0],n=e[1],a=e[2];return t[0]=r,t[1]=n,t[2]=a,t[3]=Math.sqrt(Math.abs(1-r*r-n*n-a*a)),t},o.dot=u.dot,o.lerp=u.lerp,o.slerp=function(t,e,r,n){var a,i,u,o,s,l=e[0],f=e[1],h=e[2],c=e[3],d=r[0],v=r[1],_=r[2],m=r[3];return i=l*d+f*v+h*_+c*m,0>i&&(i=-i,d=-d,v=-v,_=-_,m=-m),1-i>1e-6?(a=Math.acos(i),u=Math.sin(a),o=Math.sin((1-n)*a)/u,s=Math.sin(n*a)/u):(o=1-n,s=n),t[0]=o*l+s*d,t[1]=o*f+s*v,t[2]=o*h+s*_,t[3]=o*c+s*m,t},o.sqlerp=function(){var t=o.create(),e=o.create();return function(r,n,a,i,u,s){return o.slerp(t,n,u,s),o.slerp(e,a,i,s),o.slerp(r,t,e,2*s*(1-s)),r}}(),o.invert=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],u=r*r+n*n+a*a+i*i,o=u?1/u:0;return t[0]=-r*o,t[1]=-n*o,t[2]=-a*o,t[3]=i*o,t},o.conjugate=function(t,e){return t[0]=-e[0],t[1]=-e[1],t[2]=-e[2],t[3]=e[3],t},o.length=u.length,o.len=o.length,o.squaredLength=u.squaredLength,o.sqrLen=o.squaredLength,o.normalize=u.normalize,o.fromMat3=function(t,e){var r,n=e[0]+e[4]+e[8];if(n>0)r=Math.sqrt(n+1),t[3]=.5*r,r=.5/r,t[0]=(e[5]-e[7])*r,t[1]=(e[6]-e[2])*r,t[2]=(e[1]-e[3])*r;else{var a=0;e[4]>e[0]&&(a=1),e[8]>e[3*a+a]&&(a=2);var i=(a+1)%3,u=(a+2)%3;r=Math.sqrt(e[3*a+a]-e[3*i+i]-e[3*u+u]+1),t[a]=.5*r,r=.5/r,t[3]=(e[3*i+u]-e[3*u+i])*r,t[i]=(e[3*i+a]+e[3*a+i])*r,t[u]=(e[3*u+a]+e[3*a+u])*r}return t},o.str=function(t){return"quat("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},o.exactEquals=u.exactEquals,o.equals=u.equals,t.exports=o},function(t,e,r){var n=r(11),a={};a.create=function(){var t=new n.ARRAY_TYPE(2);return t[0]=0,t[1]=0,t},a.clone=function(t){var e=new n.ARRAY_TYPE(2);return e[0]=t[0],e[1]=t[1],e},a.fromValues=function(t,e){var r=new n.ARRAY_TYPE(2);return r[0]=t,r[1]=e,r},a.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t},a.set=function(t,e,r){return t[0]=e,t[1]=r,t},a.add=function(t,e,r){return t[0]=e[0]+r[0],t[1]=e[1]+r[1],t},a.subtract=function(t,e,r){return t[0]=e[0]-r[0],t[1]=e[1]-r[1],t},a.sub=a.subtract,a.multiply=function(t,e,r){return t[0]=e[0]*r[0],t[1]=e[1]*r[1],t},a.mul=a.multiply,a.divide=function(t,e,r){return t[0]=e[0]/r[0],t[1]=e[1]/r[1],t},a.div=a.divide,a.ceil=function(t,e){return t[0]=Math.ceil(e[0]),t[1]=Math.ceil(e[1]),t},a.floor=function(t,e){return t[0]=Math.floor(e[0]),t[1]=Math.floor(e[1]),t},a.min=function(t,e,r){return t[0]=Math.min(e[0],r[0]),t[1]=Math.min(e[1],r[1]),t},a.max=function(t,e,r){return t[0]=Math.max(e[0],r[0]),t[1]=Math.max(e[1],r[1]),t},a.round=function(t,e){return t[0]=Math.round(e[0]),t[1]=Math.round(e[1]),t},a.scale=function(t,e,r){return t[0]=e[0]*r,t[1]=e[1]*r,t},a.scaleAndAdd=function(t,e,r,n){return t[0]=e[0]+r[0]*n,t[1]=e[1]+r[1]*n,t},a.distance=function(t,e){var r=e[0]-t[0],n=e[1]-t[1];return Math.sqrt(r*r+n*n)},a.dist=a.distance,a.squaredDistance=function(t,e){var r=e[0]-t[0],n=e[1]-t[1];return r*r+n*n},a.sqrDist=a.squaredDistance,a.length=function(t){var e=t[0],r=t[1];return Math.sqrt(e*e+r*r)},a.len=a.length,a.squaredLength=function(t){var e=t[0],r=t[1];return e*e+r*r},a.sqrLen=a.squaredLength,a.negate=function(t,e){return t[0]=-e[0],t[1]=-e[1],t},a.inverse=function(t,e){return t[0]=1/e[0],t[1]=1/e[1],t},a.normalize=function(t,e){var r=e[0],n=e[1],a=r*r+n*n;return a>0&&(a=1/Math.sqrt(a),t[0]=e[0]*a,t[1]=e[1]*a),t},a.dot=function(t,e){return t[0]*e[0]+t[1]*e[1]},a.cross=function(t,e,r){var n=e[0]*r[1]-e[1]*r[0];return t[0]=t[1]=0,t[2]=n,t},a.lerp=function(t,e,r,n){var a=e[0],i=e[1];return t[0]=a+n*(r[0]-a),t[1]=i+n*(r[1]-i),t},a.random=function(t,e){e=e||1;var r=2*n.RANDOM()*Math.PI;return t[0]=Math.cos(r)*e,t[1]=Math.sin(r)*e,t},a.transformMat2=function(t,e,r){var n=e[0],a=e[1];return t[0]=r[0]*n+r[2]*a,t[1]=r[1]*n+r[3]*a,t},a.transformMat2d=function(t,e,r){var n=e[0],a=e[1];return t[0]=r[0]*n+r[2]*a+r[4],t[1]=r[1]*n+r[3]*a+r[5],t},a.transformMat3=function(t,e,r){var n=e[0],a=e[1];return t[0]=r[0]*n+r[3]*a+r[6],t[1]=r[1]*n+r[4]*a+r[7],t},a.transformMat4=function(t,e,r){var n=e[0],a=e[1];return t[0]=r[0]*n+r[4]*a+r[12],t[1]=r[1]*n+r[5]*a+r[13],t},a.forEach=function(){var t=a.create();return function(e,r,n,a,i,u){var o,s;for(r||(r=2),n||(n=0),s=a?Math.min(a*r+n,e.length):e.length,o=n;s>o;o+=r)t[0]=e[o],t[1]=e[o+1],i(t,t,u),e[o]=t[0],e[o+1]=t[1];return e}}(),a.str=function(t){return"vec2("+t[0]+", "+t[1]+")"},a.exactEquals=function(t,e){return t[0]===e[0]&&t[1]===e[1]},a.equals=function(t,e){var r=t[0],a=t[1],i=e[0],u=e[1];return Math.abs(r-i)<=n.EPSILON*Math.max(1,Math.abs(r),Math.abs(i))&&Math.abs(a-u)<=n.EPSILON*Math.max(1,Math.abs(a),Math.abs(u))},t.exports=a},function(t,e){t.exports=function(){throw new Error("It appears that you're using glslify in browserify without its transform applied. Make sure that you've set up glslify as a source transform: https://github.com/substack/node-browserify#browserifytransform")}},function(t,e){function r(t){var e=new Int32Array(t,0,m);if(e[p]!==i)throw new Error("Invalid magic number in DDS header");if(!e[y]&o)throw new Error("Unsupported format, must contain a FourCC code");var r,n,I=e[S];switch(I){case s:r=8,n="dxt1";break;case l:r=16,n="dxt3";break;case f:r=16,n="dxt5";break;case c:n="rgba32f";break;case h:var A=new Uint32Array(t.slice(128,148));n=A[0];var F=A[1];A[2],A[3],A[4];if(F!==v||n!==_)throw new Error("Unsupported DX10 texture format "+n);n="rgba32f";break;default:throw new Error("Unsupported FourCC code: "+a(I))}var D=e[x],R=1;D&u&&(R=Math.max(1,e[b]));var w=!1,P=e[T];P&d&&(w=!0);var N,O=e[E],L=e[g],k=e[M]+4,C=O,U=L,B=[];if(I===h&&(k+=20),w)for(var X=0;6>X;X++){if("rgba32f"!==n)throw new Error("Only RGBA32f cubemaps are supported");var q=16;O=C,L=U;for(var V=Math.log(O)/Math.log(2)+1,z=0;V>z;z++)N=O*L*q,B.push({offset:k,length:N,shape:[O,L]}),R>z&&(k+=N),O=Math.floor(O/2),L=Math.floor(L/2)}else for(var z=0;R>z;z++)N=Math.max(4,O)/4*Math.max(4,L)/4*r,B.push({offset:k,length:N,shape:[O,L]}),k+=N,O=Math.floor(O/2),L=Math.floor(L/2);return{shape:[C,U],images:B,format:n,flags:D,cubemap:w}}function n(t){return t.charCodeAt(0)+(t.charCodeAt(1)<<8)+(t.charCodeAt(2)<<16)+(t.charCodeAt(3)<<24)}function a(t){return String.fromCharCode(255&t,t>>8&255,t>>16&255,t>>24&255)}var i=542327876,u=131072,o=4,s=n("DXT1"),l=n("DXT3"),f=n("DXT5"),h=n("DX10"),c=116,d=512,v=3,_=2,m=31,p=0,M=1,x=2,g=3,E=4,b=7,y=20,S=21,T=28;t.exports=r},function(t,e){t.exports="// axis.frag\n\n#define SHADER_NAME SIMPLE_TEXTURE\n\nprecision lowp float;\n#define GLSLIFY 1\nvarying vec3 vColor;\nvarying vec3 vNormal;\n\nvoid main(void) {\n	// vec3 color = vNormal;\n	vec3 color = vColor + vNormal * 0.0001;\n    gl_FragColor = vec4(color, 1.0);\n}"},function(t,e){t.exports="// axis.vert\n\n#define SHADER_NAME BASIC_VERTEX\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 aVertexPosition;\nattribute vec3 aColor;\nattribute vec3 aNormal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvarying vec3 vColor;\nvarying vec3 vNormal;\n\nvoid main(void) {\n    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);\n    vColor = aColor;\n    vNormal = aNormal;\n}"},function(t,e){t.exports="// basic.frag\n\n#define SHADER_NAME BASIC_FRAGMENT\n\nprecision lowp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform float time;\n// uniform sampler2D texture;\n\nvoid main(void) {\n    gl_FragColor = vec4(vTextureCoord, sin(time) * .5 + .5, 1.0);\n}"},function(t,e){t.exports="// blur13.frag\n// source  : https://github.com/Jam3/glsl-fast-gaussian-blur\n\n#define SHADER_NAME BLUR_13\n\nprecision highp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform vec2 uDirection;\nuniform vec2 uResolution;\n\nvec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n	vec4 color = vec4(0.0);\n	vec2 off1 = vec2(1.411764705882353) * direction;\n	vec2 off2 = vec2(3.2941176470588234) * direction;\n	vec2 off3 = vec2(5.176470588235294) * direction;\n	color += texture2D(image, uv) * 0.1964825501511404;\n	color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;\n	color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;\n	color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;\n	color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;\n	color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;\n	color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;\n	return color;\n}\n\n\nvoid main(void) {\n    gl_FragColor = blur13(texture, vTextureCoord, uResolution, uDirection);\n}"},function(t,e){t.exports="// blur5.frag\n// source  : https://github.com/Jam3/glsl-fast-gaussian-blur\n\n#define SHADER_NAME BLUR_5\n\nprecision highp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform vec2 uDirection;\nuniform vec2 uResolution;\n\nvec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n	vec4 color = vec4(0.0);\n	vec2 off1 = vec2(1.3333333333333333) * direction;\n	color += texture2D(image, uv) * 0.29411764705882354;\n	color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;\n	color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;\n	return color; \n}\n\n\nvoid main(void) {\n    gl_FragColor = blur5(texture, vTextureCoord, uResolution, uDirection);\n}"},function(t,e){t.exports="// blur9.frag\n// source  : https://github.com/Jam3/glsl-fast-gaussian-blur\n\n#define SHADER_NAME BLUR_9\n\nprecision highp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform vec2 uDirection;\nuniform vec2 uResolution;\n\nvec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n	vec4 color = vec4(0.0);\n	vec2 off1 = vec2(1.3846153846) * direction;\n	vec2 off2 = vec2(3.2307692308) * direction;\n	color += texture2D(image, uv) * 0.2270270270;\n	color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;\n	color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;\n	color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;\n	color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;\n	return color;\n}\n\n\nvoid main(void) {\n    gl_FragColor = blur9(texture, vTextureCoord, uResolution, uDirection);\n}"},function(t,e){t.exports="// basic.vert\n\n#define SHADER_NAME DOTS_PLANE_VERTEX\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 aVertexPosition;\nattribute vec3 aNormal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvarying vec3 vNormal;\n\nvoid main(void) {\n    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition + aNormal * 0.000001, 1.0);\n    gl_PointSize = 1.0;\n    vNormal = aNormal;\n}"},function(t,e){t.exports="// sky.vert\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec3 aNormal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec3 vNormal;\n\nvoid main(void) {\n	mat4 matView = uViewMatrix;\n	matView[3][0] = 0.0;\n	matView[3][1] = 0.0;\n	matView[3][2] = 0.0;\n	\n    gl_Position = uProjectionMatrix * matView * uModelMatrix * vec4(aVertexPosition, 1.0);\n    vTextureCoord = aTextureCoord;\n    vNormal = aNormal;\n}"}])});
//# sourceMappingURL=alfrid.js.map

/***/ }),

/***/ 20:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _datGui = __webpack_require__(21);

var _datGui2 = _interopRequireDefault(_datGui);

var _stats = __webpack_require__(24);

var _stats2 = _interopRequireDefault(_stats);

var _alfrid = __webpack_require__(0);

var _alfrid2 = _interopRequireDefault(_alfrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.debug = {
	init: function init() {
		console.log('Init Debug console');

		//	INIT DAT-GUI
		window.gui = new _datGui2.default.GUI({ width: 300 });

		//	STATS
		var stats = new _stats2.default();
		document.body.appendChild(stats.domElement);
		_alfrid2.default.Scheduler.addEF(function () {
			return stats.update();
		});
	}
}; // debug.js

/***/ }),

/***/ 21:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(22)
module.exports.color = __webpack_require__(23)

/***/ }),

/***/ 22:
/***/ (function(module, exports) {

/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/** @namespace */
var dat = module.exports = dat || {};

/** @namespace */
dat.gui = dat.gui || {};

/** @namespace */
dat.utils = dat.utils || {};

/** @namespace */
dat.controllers = dat.controllers || {};

/** @namespace */
dat.dom = dat.dom || {};

/** @namespace */
dat.color = dat.color || {};

dat.utils.css = (function () {
  return {
    load: function (url, doc) {
      doc = doc || document;
      var link = doc.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = url;
      doc.getElementsByTagName('head')[0].appendChild(link);
    },
    inject: function(css, doc) {
      doc = doc || document;
      var injected = document.createElement('style');
      injected.type = 'text/css';
      injected.innerHTML = css;
      doc.getElementsByTagName('head')[0].appendChild(injected);
    }
  }
})();


dat.utils.common = (function () {
  
  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;

  /**
   * Band-aid methods for things that should be a lot easier in JavaScript.
   * Implementation and structure inspired by underscore.js
   * http://documentcloud.github.com/underscore/
   */

  return { 
    
    BREAK: {},
  
    extend: function(target) {
      
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        
        for (var key in obj)
          if (!this.isUndefined(obj[key])) 
            target[key] = obj[key];
        
      }, this);
      
      return target;
      
    },
    
    defaults: function(target) {
      
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        
        for (var key in obj)
          if (this.isUndefined(target[key])) 
            target[key] = obj[key];
        
      }, this);
      
      return target;
    
    },
    
    compose: function() {
      var toCall = ARR_SLICE.call(arguments);
            return function() {
              var args = ARR_SLICE.call(arguments);
              for (var i = toCall.length -1; i >= 0; i--) {
                args = [toCall[i].apply(this, args)];
              }
              return args[0];
            }
    },
    
    each: function(obj, itr, scope) {

      
      if (ARR_EACH && obj.forEach === ARR_EACH) { 
        
        obj.forEach(itr, scope);
        
      } else if (obj.length === obj.length + 0) { // Is number but not NaN
        
        for (var key = 0, l = obj.length; key < l; key++)
          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) 
            return;
            
      } else {

        for (var key in obj) 
          if (itr.call(scope, obj[key], key) === this.BREAK)
            return;
            
      }
            
    },
    
    defer: function(fnc) {
      setTimeout(fnc, 0);
    },
    
    toArray: function(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },

    isUndefined: function(obj) {
      return obj === undefined;
    },
    
    isNull: function(obj) {
      return obj === null;
    },
    
    isNaN: function(obj) {
      return obj !== obj;
    },
    
    isArray: Array.isArray || function(obj) {
      return obj.constructor === Array;
    },
    
    isObject: function(obj) {
      return obj === Object(obj);
    },
    
    isNumber: function(obj) {
      return obj === obj+0;
    },
    
    isString: function(obj) {
      return obj === obj+'';
    },
    
    isBoolean: function(obj) {
      return obj === false || obj === true;
    },
    
    isFunction: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }
  
  };
    
})();


dat.controllers.Controller = (function (common) {

  /**
   * @class An "abstract" class that represents a given property of an object.
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var Controller = function(object, property) {

    this.initialValue = object[property];

    /**
     * Those who extend this class will put their DOM elements in here.
     * @type {DOMElement}
     */
    this.domElement = document.createElement('div');

    /**
     * The object to manipulate
     * @type {Object}
     */
    this.object = object;

    /**
     * The name of the property to manipulate
     * @type {String}
     */
    this.property = property;

    /**
     * The function to be called on change.
     * @type {Function}
     * @ignore
     */
    this.__onChange = undefined;

    /**
     * The function to be called on finishing change.
     * @type {Function}
     * @ignore
     */
    this.__onFinishChange = undefined;

  };

  common.extend(

      Controller.prototype,

      /** @lends dat.controllers.Controller.prototype */
      {

        /**
         * Specify that a function fire every time someone changes the value with
         * this Controller.
         *
         * @param {Function} fnc This function will be called whenever the value
         * is modified via this Controller.
         * @returns {dat.controllers.Controller} this
         */
        onChange: function(fnc) {
          this.__onChange = fnc;
          return this;
        },

        /**
         * Specify that a function fire every time someone "finishes" changing
         * the value wih this Controller. Useful for values that change
         * incrementally like numbers or strings.
         *
         * @param {Function} fnc This function will be called whenever
         * someone "finishes" changing the value via this Controller.
         * @returns {dat.controllers.Controller} this
         */
        onFinishChange: function(fnc) {
          this.__onFinishChange = fnc;
          return this;
        },

        /**
         * Change the value of <code>object[property]</code>
         *
         * @param {Object} newValue The new value of <code>object[property]</code>
         */
        setValue: function(newValue) {
          this.object[this.property] = newValue;
          if (this.__onChange) {
            this.__onChange.call(this, newValue);
          }
          this.updateDisplay();
          return this;
        },

        /**
         * Gets the value of <code>object[property]</code>
         *
         * @returns {Object} The current value of <code>object[property]</code>
         */
        getValue: function() {
          return this.object[this.property];
        },

        /**
         * Refreshes the visual display of a Controller in order to keep sync
         * with the object's current value.
         * @returns {dat.controllers.Controller} this
         */
        updateDisplay: function() {
          return this;
        },

        /**
         * @returns {Boolean} true if the value has deviated from initialValue
         */
        isModified: function() {
          return this.initialValue !== this.getValue()
        }

      }

  );

  return Controller;


})(dat.utils.common);


dat.dom.dom = (function (common) {

  var EVENT_MAP = {
    'HTMLEvents': ['change'],
    'MouseEvents': ['click','mousemove','mousedown','mouseup', 'mouseover'],
    'KeyboardEvents': ['keydown']
  };

  var EVENT_MAP_INV = {};
  common.each(EVENT_MAP, function(v, k) {
    common.each(v, function(e) {
      EVENT_MAP_INV[e] = k;
    });
  });

  var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;

  function cssValueToPixels(val) {

    if (val === '0' || common.isUndefined(val)) return 0;

    var match = val.match(CSS_VALUE_PIXELS);

    if (!common.isNull(match)) {
      return parseFloat(match[1]);
    }

    // TODO ...ems? %?

    return 0;

  }

  /**
   * @namespace
   * @member dat.dom
   */
  var dom = {

    /**
     * 
     * @param elem
     * @param selectable
     */
    makeSelectable: function(elem, selectable) {

      if (elem === undefined || elem.style === undefined) return;

      elem.onselectstart = selectable ? function() {
        return false;
      } : function() {
      };

      elem.style.MozUserSelect = selectable ? 'auto' : 'none';
      elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
      elem.unselectable = selectable ? 'on' : 'off';

    },

    /**
     *
     * @param elem
     * @param horizontal
     * @param vertical
     */
    makeFullscreen: function(elem, horizontal, vertical) {

      if (common.isUndefined(horizontal)) horizontal = true;
      if (common.isUndefined(vertical)) vertical = true;

      elem.style.position = 'absolute';

      if (horizontal) {
        elem.style.left = 0;
        elem.style.right = 0;
      }
      if (vertical) {
        elem.style.top = 0;
        elem.style.bottom = 0;
      }

    },

    /**
     *
     * @param elem
     * @param eventType
     * @param params
     */
    fakeEvent: function(elem, eventType, params, aux) {
      params = params || {};
      var className = EVENT_MAP_INV[eventType];
      if (!className) {
        throw new Error('Event type ' + eventType + ' not supported.');
      }
      var evt = document.createEvent(className);
      switch (className) {
        case 'MouseEvents':
          var clientX = params.x || params.clientX || 0;
          var clientY = params.y || params.clientY || 0;
          evt.initMouseEvent(eventType, params.bubbles || false,
              params.cancelable || true, window, params.clickCount || 1,
              0, //screen X
              0, //screen Y
              clientX, //client X
              clientY, //client Y
              false, false, false, false, 0, null);
          break;
        case 'KeyboardEvents':
          var init = evt.initKeyboardEvent || evt.initKeyEvent; // webkit || moz
          common.defaults(params, {
            cancelable: true,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            keyCode: undefined,
            charCode: undefined
          });
          init(eventType, params.bubbles || false,
              params.cancelable, window,
              params.ctrlKey, params.altKey,
              params.shiftKey, params.metaKey,
              params.keyCode, params.charCode);
          break;
        default:
          evt.initEvent(eventType, params.bubbles || false,
              params.cancelable || true);
          break;
      }
      common.defaults(evt, aux);
      elem.dispatchEvent(evt);
    },

    /**
     *
     * @param elem
     * @param event
     * @param func
     * @param bool
     */
    bind: function(elem, event, func, bool) {
      bool = bool || false;
      if (elem.addEventListener)
        elem.addEventListener(event, func, bool);
      else if (elem.attachEvent)
        elem.attachEvent('on' + event, func);
      return dom;
    },

    /**
     *
     * @param elem
     * @param event
     * @param func
     * @param bool
     */
    unbind: function(elem, event, func, bool) {
      bool = bool || false;
      if (elem.removeEventListener)
        elem.removeEventListener(event, func, bool);
      else if (elem.detachEvent)
        elem.detachEvent('on' + event, func);
      return dom;
    },

    /**
     *
     * @param elem
     * @param className
     */
    addClass: function(elem, className) {
      if (elem.className === undefined) {
        elem.className = className;
      } else if (elem.className !== className) {
        var classes = elem.className.split(/ +/);
        if (classes.indexOf(className) == -1) {
          classes.push(className);
          elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
        }
      }
      return dom;
    },

    /**
     *
     * @param elem
     * @param className
     */
    removeClass: function(elem, className) {
      if (className) {
        if (elem.className === undefined) {
          // elem.className = className;
        } else if (elem.className === className) {
          elem.removeAttribute('class');
        } else {
          var classes = elem.className.split(/ +/);
          var index = classes.indexOf(className);
          if (index != -1) {
            classes.splice(index, 1);
            elem.className = classes.join(' ');
          }
        }
      } else {
        elem.className = undefined;
      }
      return dom;
    },

    hasClass: function(elem, className) {
      return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
    },

    /**
     *
     * @param elem
     */
    getWidth: function(elem) {

      var style = getComputedStyle(elem);

      return cssValueToPixels(style['border-left-width']) +
          cssValueToPixels(style['border-right-width']) +
          cssValueToPixels(style['padding-left']) +
          cssValueToPixels(style['padding-right']) +
          cssValueToPixels(style['width']);
    },

    /**
     *
     * @param elem
     */
    getHeight: function(elem) {

      var style = getComputedStyle(elem);

      return cssValueToPixels(style['border-top-width']) +
          cssValueToPixels(style['border-bottom-width']) +
          cssValueToPixels(style['padding-top']) +
          cssValueToPixels(style['padding-bottom']) +
          cssValueToPixels(style['height']);
    },

    /**
     *
     * @param elem
     */
    getOffset: function(elem) {
      var offset = {left: 0, top:0};
      if (elem.offsetParent) {
        do {
          offset.left += elem.offsetLeft;
          offset.top += elem.offsetTop;
        } while (elem = elem.offsetParent);
      }
      return offset;
    },

    // http://stackoverflow.com/posts/2684561/revisions
    /**
     * 
     * @param elem
     */
    isActive: function(elem) {
      return elem === document.activeElement && ( elem.type || elem.href );
    }

  };

  return dom;

})(dat.utils.common);


dat.controllers.OptionController = (function (Controller, dom, common) {

  /**
   * @class Provides a select input to alter the property of an object, using a
   * list of accepted values.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object|string[]} options A map of labels to acceptable values, or
   * a list of acceptable string values.
   *
   * @member dat.controllers
   */
  var OptionController = function(object, property, options) {

    OptionController.superclass.call(this, object, property);

    var _this = this;

    /**
     * The drop down menu
     * @ignore
     */
    this.__select = document.createElement('select');

    if (common.isArray(options)) {
      var map = {};
      common.each(options, function(element) {
        map[element] = element;
      });
      options = map;
    }

    common.each(options, function(value, key) {

      var opt = document.createElement('option');
      opt.innerHTML = key;
      opt.setAttribute('value', value);
      _this.__select.appendChild(opt);

    });

    // Acknowledge original value
    this.updateDisplay();

    dom.bind(this.__select, 'change', function() {
      var desiredValue = this.options[this.selectedIndex].value;
      _this.setValue(desiredValue);
    });

    this.domElement.appendChild(this.__select);

  };

  OptionController.superclass = Controller;

  common.extend(

      OptionController.prototype,
      Controller.prototype,

      {

        setValue: function(v) {
          var toReturn = OptionController.superclass.prototype.setValue.call(this, v);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          return toReturn;
        },

        updateDisplay: function() {
          this.__select.value = this.getValue();
          return OptionController.superclass.prototype.updateDisplay.call(this);
        }

      }

  );

  return OptionController;

})(dat.controllers.Controller,
dat.dom.dom,
dat.utils.common);


dat.controllers.NumberController = (function (Controller, common) {

  /**
   * @class Represents a given property of an object that is a number.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object} [params] Optional parameters
   * @param {Number} [params.min] Minimum allowed value
   * @param {Number} [params.max] Maximum allowed value
   * @param {Number} [params.step] Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberController = function(object, property, params) {

    NumberController.superclass.call(this, object, property);

    params = params || {};

    this.__min = params.min;
    this.__max = params.max;
    this.__step = params.step;

    if (common.isUndefined(this.__step)) {

      if (this.initialValue == 0) {
        this.__impliedStep = 1; // What are we, psychics?
      } else {
        // Hey Doug, check this out.
        this.__impliedStep = Math.pow(10, Math.floor(Math.log(this.initialValue)/Math.LN10))/10;
      }

    } else {

      this.__impliedStep = this.__step;

    }

    this.__precision = numDecimals(this.__impliedStep);


  };

  NumberController.superclass = Controller;

  common.extend(

      NumberController.prototype,
      Controller.prototype,

      /** @lends dat.controllers.NumberController.prototype */
      {

        setValue: function(v) {

          if (this.__min !== undefined && v < this.__min) {
            v = this.__min;
          } else if (this.__max !== undefined && v > this.__max) {
            v = this.__max;
          }

          if (this.__step !== undefined && v % this.__step != 0) {
            v = Math.round(v / this.__step) * this.__step;
          }

          return NumberController.superclass.prototype.setValue.call(this, v);

        },

        /**
         * Specify a minimum value for <code>object[property]</code>.
         *
         * @param {Number} minValue The minimum value for
         * <code>object[property]</code>
         * @returns {dat.controllers.NumberController} this
         */
        min: function(v) {
          this.__min = v;
          return this;
        },

        /**
         * Specify a maximum value for <code>object[property]</code>.
         *
         * @param {Number} maxValue The maximum value for
         * <code>object[property]</code>
         * @returns {dat.controllers.NumberController} this
         */
        max: function(v) {
          this.__max = v;
          return this;
        },

        /**
         * Specify a step value that dat.controllers.NumberController
         * increments by.
         *
         * @param {Number} stepValue The step value for
         * dat.controllers.NumberController
         * @default if minimum and maximum specified increment is 1% of the
         * difference otherwise stepValue is 1
         * @returns {dat.controllers.NumberController} this
         */
        step: function(v) {
          this.__step = v;
          return this;
        }

      }

  );

  function numDecimals(x) {
    x = x.toString();
    if (x.indexOf('.') > -1) {
      return x.length - x.indexOf('.') - 1;
    } else {
      return 0;
    }
  }

  return NumberController;

})(dat.controllers.Controller,
dat.utils.common);


dat.controllers.NumberControllerBox = (function (NumberController, dom, common) {

  /**
   * @class Represents a given property of an object that is a number and
   * provides an input element with which to manipulate it.
   *
   * @extends dat.controllers.Controller
   * @extends dat.controllers.NumberController
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Object} [params] Optional parameters
   * @param {Number} [params.min] Minimum allowed value
   * @param {Number} [params.max] Maximum allowed value
   * @param {Number} [params.step] Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberControllerBox = function(object, property, params) {

    this.__truncationSuspended = false;

    NumberControllerBox.superclass.call(this, object, property, params);

    var _this = this;

    /**
     * {Number} Previous mouse y position
     * @ignore
     */
    var prev_y;

    this.__input = document.createElement('input');
    this.__input.setAttribute('type', 'text');

    // Makes it so manually specified values are not truncated.

    dom.bind(this.__input, 'change', onChange);
    dom.bind(this.__input, 'blur', onBlur);
    dom.bind(this.__input, 'mousedown', onMouseDown);
    dom.bind(this.__input, 'keydown', function(e) {

      // When pressing entire, you can be as precise as you want.
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
      }

    });

    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
    }

    function onBlur() {
      onChange();
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    function onMouseDown(e) {
      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);
      prev_y = e.clientY;
    }

    function onMouseDrag(e) {

      var diff = prev_y - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);

      prev_y = e.clientY;

    }

    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);

  };

  NumberControllerBox.superclass = NumberController;

  common.extend(

      NumberControllerBox.prototype,
      NumberController.prototype,

      {

        updateDisplay: function() {

          this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
          return NumberControllerBox.superclass.prototype.updateDisplay.call(this);
        }

      }

  );

  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }

  return NumberControllerBox;

})(dat.controllers.NumberController,
dat.dom.dom,
dat.utils.common);


dat.controllers.NumberControllerSlider = (function (NumberController, dom, css, common, styleSheet) {

  /**
   * @class Represents a given property of an object that is a number, contains
   * a minimum and maximum, and provides a slider element with which to
   * manipulate it. It should be noted that the slider element is made up of
   * <code>&lt;div&gt;</code> tags, <strong>not</strong> the html5
   * <code>&lt;slider&gt;</code> element.
   *
   * @extends dat.controllers.Controller
   * @extends dat.controllers.NumberController
   * 
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   * @param {Number} minValue Minimum allowed value
   * @param {Number} maxValue Maximum allowed value
   * @param {Number} stepValue Increment by which to change value
   *
   * @member dat.controllers
   */
  var NumberControllerSlider = function(object, property, min, max, step) {

    NumberControllerSlider.superclass.call(this, object, property, { min: min, max: max, step: step });

    var _this = this;

    this.__background = document.createElement('div');
    this.__foreground = document.createElement('div');
    


    dom.bind(this.__background, 'mousedown', onMouseDown);
    
    dom.addClass(this.__background, 'slider');
    dom.addClass(this.__foreground, 'slider-fg');

    function onMouseDown(e) {

      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);

      onMouseDrag(e);
    }

    function onMouseDrag(e) {

      e.preventDefault();

      var offset = dom.getOffset(_this.__background);
      var width = dom.getWidth(_this.__background);
      
      _this.setValue(
        map(e.clientX, offset.left, offset.left + width, _this.__min, _this.__max)
      );

      return false;

    }

    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();

    this.__background.appendChild(this.__foreground);
    this.domElement.appendChild(this.__background);

  };

  NumberControllerSlider.superclass = NumberController;

  /**
   * Injects default stylesheet for slider elements.
   */
  NumberControllerSlider.useDefaultStyles = function() {
    css.inject(styleSheet);
  };

  common.extend(

      NumberControllerSlider.prototype,
      NumberController.prototype,

      {

        updateDisplay: function() {
          var pct = (this.getValue() - this.__min)/(this.__max - this.__min);
          this.__foreground.style.width = pct*100+'%';
          return NumberControllerSlider.superclass.prototype.updateDisplay.call(this);
        }

      }



  );

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }

  return NumberControllerSlider;
  
})(dat.controllers.NumberController,
dat.dom.dom,
dat.utils.css,
dat.utils.common,
".slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");


dat.controllers.FunctionController = (function (Controller, dom, common) {

  /**
   * @class Provides a GUI interface to fire a specified method, a property of an object.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var FunctionController = function(object, property, text) {

    FunctionController.superclass.call(this, object, property);

    var _this = this;

    this.__button = document.createElement('div');
    this.__button.innerHTML = text === undefined ? 'Fire' : text;
    dom.bind(this.__button, 'click', function(e) {
      e.preventDefault();
      _this.fire();
      return false;
    });

    dom.addClass(this.__button, 'button');

    this.domElement.appendChild(this.__button);


  };

  FunctionController.superclass = Controller;

  common.extend(

      FunctionController.prototype,
      Controller.prototype,
      {
        
        fire: function() {
          if (this.__onChange) {
            this.__onChange.call(this);
          }
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          this.getValue().call(this.object);
        }
      }

  );

  return FunctionController;

})(dat.controllers.Controller,
dat.dom.dom,
dat.utils.common);


dat.controllers.BooleanController = (function (Controller, dom, common) {

  /**
   * @class Provides a checkbox input to alter the boolean property of an object.
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var BooleanController = function(object, property) {

    BooleanController.superclass.call(this, object, property);

    var _this = this;
    this.__prev = this.getValue();

    this.__checkbox = document.createElement('input');
    this.__checkbox.setAttribute('type', 'checkbox');


    dom.bind(this.__checkbox, 'change', onChange, false);

    this.domElement.appendChild(this.__checkbox);

    // Match original value
    this.updateDisplay();

    function onChange() {
      _this.setValue(!_this.__prev);
    }

  };

  BooleanController.superclass = Controller;

  common.extend(

      BooleanController.prototype,
      Controller.prototype,

      {

        setValue: function(v) {
          var toReturn = BooleanController.superclass.prototype.setValue.call(this, v);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          this.__prev = this.getValue();
          return toReturn;
        },

        updateDisplay: function() {
          
          if (this.getValue() === true) {
            this.__checkbox.setAttribute('checked', 'checked');
            this.__checkbox.checked = true;    
          } else {
              this.__checkbox.checked = false;
          }

          return BooleanController.superclass.prototype.updateDisplay.call(this);

        }


      }

  );

  return BooleanController;

})(dat.controllers.Controller,
dat.dom.dom,
dat.utils.common);


dat.color.toString = (function (common) {

  return function(color) {

    if (color.a == 1 || common.isUndefined(color.a)) {

      var s = color.hex.toString(16);
      while (s.length < 6) {
        s = '0' + s;
      }

      return '#' + s;

    } else {

      return 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + color.a + ')';

    }

  }

})(dat.utils.common);


dat.color.interpret = (function (toString, common) {

  var result, toReturn;

  var interpret = function() {

    toReturn = false;

    var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];

    common.each(INTERPRETATIONS, function(family) {

      if (family.litmus(original)) {

        common.each(family.conversions, function(conversion, conversionName) {

          result = conversion.read(original);

          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return common.BREAK;

          }

        });

        return common.BREAK;

      }

    });

    return toReturn;

  };

  var INTERPRETATIONS = [

    // Strings
    {

      litmus: common.isString,

      conversions: {

        THREE_CHAR_HEX: {

          read: function(original) {

            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
            if (test === null) return false;

            return {
              space: 'HEX',
              hex: parseInt(
                  '0x' +
                      test[1].toString() + test[1].toString() +
                      test[2].toString() + test[2].toString() +
                      test[3].toString() + test[3].toString())
            };

          },

          write: toString

        },

        SIX_CHAR_HEX: {

          read: function(original) {

            var test = original.match(/^#([A-F0-9]{6})$/i);
            if (test === null) return false;

            return {
              space: 'HEX',
              hex: parseInt('0x' + test[1].toString())
            };

          },

          write: toString

        },

        CSS_RGB: {

          read: function(original) {

            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
            if (test === null) return false;

            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3])
            };

          },

          write: toString

        },

        CSS_RGBA: {

          read: function(original) {

            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
            if (test === null) return false;

            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3]),
              a: parseFloat(test[4])
            };

          },

          write: toString

        }

      }

    },

    // Numbers
    {

      litmus: common.isNumber,

      conversions: {

        HEX: {
          read: function(original) {
            return {
              space: 'HEX',
              hex: original,
              conversionName: 'HEX'
            }
          },

          write: function(color) {
            return color.hex;
          }
        }

      }

    },

    // Arrays
    {

      litmus: common.isArray,

      conversions: {

        RGB_ARRAY: {
          read: function(original) {
            if (original.length != 3) return false;
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2]
            };
          },

          write: function(color) {
            return [color.r, color.g, color.b];
          }

        },

        RGBA_ARRAY: {
          read: function(original) {
            if (original.length != 4) return false;
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2],
              a: original[3]
            };
          },

          write: function(color) {
            return [color.r, color.g, color.b, color.a];
          }

        }

      }

    },

    // Objects
    {

      litmus: common.isObject,

      conversions: {

        RGBA_OBJ: {
          read: function(original) {
            if (common.isNumber(original.r) &&
                common.isNumber(original.g) &&
                common.isNumber(original.b) &&
                common.isNumber(original.a)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b,
                a: original.a
              }
            }
            return false;
          },

          write: function(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b,
              a: color.a
            }
          }
        },

        RGB_OBJ: {
          read: function(original) {
            if (common.isNumber(original.r) &&
                common.isNumber(original.g) &&
                common.isNumber(original.b)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b
              }
            }
            return false;
          },

          write: function(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b
            }
          }
        },

        HSVA_OBJ: {
          read: function(original) {
            if (common.isNumber(original.h) &&
                common.isNumber(original.s) &&
                common.isNumber(original.v) &&
                common.isNumber(original.a)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v,
                a: original.a
              }
            }
            return false;
          },

          write: function(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v,
              a: color.a
            }
          }
        },

        HSV_OBJ: {
          read: function(original) {
            if (common.isNumber(original.h) &&
                common.isNumber(original.s) &&
                common.isNumber(original.v)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v
              }
            }
            return false;
          },

          write: function(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v
            }
          }

        }

      }

    }


  ];

  return interpret;


})(dat.color.toString,
dat.utils.common);


dat.GUI = dat.gui.GUI = (function (css, saveDialogueContents, styleSheet, controllerFactory, Controller, BooleanController, FunctionController, NumberControllerBox, NumberControllerSlider, OptionController, ColorController, requestAnimationFrame, CenteredDiv, dom, common) {

  css.inject(styleSheet);

  /** Outer-most className for GUI's */
  var CSS_NAMESPACE = 'dg';

  var HIDE_KEY_CODE = 72;

  /** The only value shared between the JS and SCSS. Use caution. */
  var CLOSE_BUTTON_HEIGHT = 20;

  var DEFAULT_DEFAULT_PRESET_NAME = 'Default';

  var SUPPORTS_LOCAL_STORAGE = (function() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  })();

  var SAVE_DIALOGUE;

  /** Have we yet to create an autoPlace GUI? */
  var auto_place_virgin = true;

  /** Fixed position div that auto place GUI's go inside */
  var auto_place_container;

  /** Are we hiding the GUI's ? */
  var hide = false;

  /** GUI's which should be hidden */
  var hideable_guis = [];

  /**
   * A lightweight controller library for JavaScript. It allows you to easily
   * manipulate variables and fire functions on the fly.
   * @class
   *
   * @member dat.gui
   *
   * @param {Object} [params]
   * @param {String} [params.name] The name of this GUI.
   * @param {Object} [params.load] JSON object representing the saved state of
   * this GUI.
   * @param {Boolean} [params.auto=true]
   * @param {dat.gui.GUI} [params.parent] The GUI I'm nested in.
   * @param {Boolean} [params.closed] If true, starts closed
   */
  var GUI = function(params) {

    var _this = this;

    /**
     * Outermost DOM Element
     * @type DOMElement
     */
    this.domElement = document.createElement('div');
    this.__ul = document.createElement('ul');
    this.domElement.appendChild(this.__ul);

    dom.addClass(this.domElement, CSS_NAMESPACE);

    /**
     * Nested GUI's by name
     * @ignore
     */
    this.__folders = {};

    this.__controllers = [];

    /**
     * List of objects I'm remembering for save, only used in top level GUI
     * @ignore
     */
    this.__rememberedObjects = [];

    /**
     * Maps the index of remembered objects to a map of controllers, only used
     * in top level GUI.
     *
     * @private
     * @ignore
     *
     * @example
     * [
     *  {
     *    propertyName: Controller,
     *    anotherPropertyName: Controller
     *  },
     *  {
     *    propertyName: Controller
     *  }
     * ]
     */
    this.__rememberedObjectIndecesToControllers = [];

    this.__listening = [];

    params = params || {};

    // Default parameters
    params = common.defaults(params, {
      autoPlace: true,
      width: GUI.DEFAULT_WIDTH
    });

    params = common.defaults(params, {
      resizable: params.autoPlace,
      hideable: params.autoPlace
    });


    if (!common.isUndefined(params.load)) {

      // Explicit preset
      if (params.preset) params.load.preset = params.preset;

    } else {

      params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };

    }

    if (common.isUndefined(params.parent) && params.hideable) {
      hideable_guis.push(this);
    }

    // Only root level GUI's are resizable.
    params.resizable = common.isUndefined(params.parent) && params.resizable;


    if (params.autoPlace && common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }
//    params.scrollable = common.isUndefined(params.parent) && params.scrollable === true;

    // Not part of params because I don't want people passing this in via
    // constructor. Should be a 'remembered' value.
    var use_local_storage =
        SUPPORTS_LOCAL_STORAGE &&
            localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';

    Object.defineProperties(this,

        /** @lends dat.gui.GUI.prototype */
        {

          /**
           * The parent <code>GUI</code>
           * @type dat.gui.GUI
           */
          parent: {
            get: function() {
              return params.parent;
            }
          },

          scrollable: {
            get: function() {
              return params.scrollable;
            }
          },

          /**
           * Handles <code>GUI</code>'s element placement for you
           * @type Boolean
           */
          autoPlace: {
            get: function() {
              return params.autoPlace;
            }
          },

          /**
           * The identifier for a set of saved values
           * @type String
           */
          preset: {

            get: function() {
              if (_this.parent) {
                return _this.getRoot().preset;
              } else {
                return params.load.preset;
              }
            },

            set: function(v) {
              if (_this.parent) {
                _this.getRoot().preset = v;
              } else {
                params.load.preset = v;
              }
              setPresetSelectIndex(this);
              _this.revert();
            }

          },

          /**
           * The width of <code>GUI</code> element
           * @type Number
           */
          width: {
            get: function() {
              return params.width;
            },
            set: function(v) {
              params.width = v;
              setWidth(_this, v);
            }
          },

          /**
           * The name of <code>GUI</code>. Used for folders. i.e
           * a folder's name
           * @type String
           */
          name: {
            get: function() {
              return params.name;
            },
            set: function(v) {
              // TODO Check for collisions among sibling folders
              params.name = v;
              if (title_row_name) {
                title_row_name.innerHTML = params.name;
              }
            }
          },

          /**
           * Whether the <code>GUI</code> is collapsed or not
           * @type Boolean
           */
          closed: {
            get: function() {
              return params.closed;
            },
            set: function(v) {
              params.closed = v;
              if (params.closed) {
                dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
              } else {
                dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
              }
              // For browsers that aren't going to respect the CSS transition,
              // Lets just check our height against the window height right off
              // the bat.
              this.onResize();

              if (_this.__closeButton) {
                _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
              }
            }
          },

          /**
           * Contains all presets
           * @type Object
           */
          load: {
            get: function() {
              return params.load;
            }
          },

          /**
           * Determines whether or not to use <a href="https://developer.mozilla.org/en/DOM/Storage#localStorage">localStorage</a> as the means for
           * <code>remember</code>ing
           * @type Boolean
           */
          useLocalStorage: {

            get: function() {
              return use_local_storage;
            },
            set: function(bool) {
              if (SUPPORTS_LOCAL_STORAGE) {
                use_local_storage = bool;
                if (bool) {
                  dom.bind(window, 'unload', saveToLocalStorage);
                } else {
                  dom.unbind(window, 'unload', saveToLocalStorage);
                }
                localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
              }
            }

          }

        });

    // Are we a root level GUI?
    if (common.isUndefined(params.parent)) {

      params.closed = false;

      dom.addClass(this.domElement, GUI.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);

      // Are we supposed to be loading locally?
      if (SUPPORTS_LOCAL_STORAGE) {

        if (use_local_storage) {

          _this.useLocalStorage = true;

          var saved_gui = localStorage.getItem(getLocalStorageHash(this, 'gui'));

          if (saved_gui) {
            params.load = JSON.parse(saved_gui);
          }

        }

      }

      this.__closeButton = document.createElement('div');
      this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
      this.domElement.appendChild(this.__closeButton);

      dom.bind(this.__closeButton, 'click', function() {

        _this.closed = !_this.closed;


      });


      // Oh, you're a nested GUI!
    } else {

      if (params.closed === undefined) {
        params.closed = true;
      }

      var title_row_name = document.createTextNode(params.name);
      dom.addClass(title_row_name, 'controller-name');

      var title_row = addRow(_this, title_row_name);

      var on_click_title = function(e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        return false;
      };

      dom.addClass(this.__ul, GUI.CLASS_CLOSED);

      dom.addClass(title_row, 'title');
      dom.bind(title_row, 'click', on_click_title);

      if (!params.closed) {
        this.closed = false;
      }

    }

    if (params.autoPlace) {

      if (common.isUndefined(params.parent)) {

        if (auto_place_virgin) {
          auto_place_container = document.createElement('div');
          dom.addClass(auto_place_container, CSS_NAMESPACE);
          dom.addClass(auto_place_container, GUI.CLASS_AUTO_PLACE_CONTAINER);
          document.body.appendChild(auto_place_container);
          auto_place_virgin = false;
        }

        // Put it in the dom for you.
        auto_place_container.appendChild(this.domElement);

        // Apply the auto styles
        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);

      }


      // Make it not elastic.
      if (!this.parent) setWidth(_this, params.width);

    }

    dom.bind(window, 'resize', function() { _this.onResize() });
    dom.bind(this.__ul, 'webkitTransitionEnd', function() { _this.onResize(); });
    dom.bind(this.__ul, 'transitionend', function() { _this.onResize() });
    dom.bind(this.__ul, 'oTransitionEnd', function() { _this.onResize() });
    this.onResize();


    if (params.resizable) {
      addResizeHandle(this);
    }

    function saveToLocalStorage() {
      localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
    }

    var root = _this.getRoot();
    function resetWidth() {
        var root = _this.getRoot();
        root.width += 1;
        common.defer(function() {
          root.width -= 1;
        });
      }

      if (!params.parent) {
        resetWidth();
      }

  };

  GUI.toggleHide = function() {

    hide = !hide;
    common.each(hideable_guis, function(gui) {
      gui.domElement.style.zIndex = hide ? -999 : 999;
      gui.domElement.style.opacity = hide ? 0 : 1;
    });
  };

  GUI.CLASS_AUTO_PLACE = 'a';
  GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
  GUI.CLASS_MAIN = 'main';
  GUI.CLASS_CONTROLLER_ROW = 'cr';
  GUI.CLASS_TOO_TALL = 'taller-than-window';
  GUI.CLASS_CLOSED = 'closed';
  GUI.CLASS_CLOSE_BUTTON = 'close-button';
  GUI.CLASS_DRAG = 'drag';

  GUI.DEFAULT_WIDTH = 245;
  GUI.TEXT_CLOSED = 'Close Controls';
  GUI.TEXT_OPEN = 'Open Controls';

  dom.bind(window, 'keydown', function(e) {

    if (document.activeElement.type !== 'text' &&
        (e.which === HIDE_KEY_CODE || e.keyCode == HIDE_KEY_CODE)) {
      GUI.toggleHide();
    }

  }, false);

  common.extend(

      GUI.prototype,

      /** @lends dat.gui.GUI */
      {

        /**
         * @param object
         * @param property
         * @returns {dat.controllers.Controller} The new controller that was added.
         * @instance
         */
        add: function(object, property) {

          return add(
              this,
              object,
              property,
              {
                factoryArgs: Array.prototype.slice.call(arguments, 2)
              }
          );

        },

        /**
         * @param object
         * @param property
         * @returns {dat.controllers.ColorController} The new controller that was added.
         * @instance
         */
        addColor: function(object, property) {

          return add(
              this,
              object,
              property,
              {
                color: true
              }
          );

        },

        /**
         * @param controller
         * @instance
         */
        remove: function(controller) {

          // TODO listening?
          this.__ul.removeChild(controller.__li);
          this.__controllers.slice(this.__controllers.indexOf(controller), 1);
          var _this = this;
          common.defer(function() {
            _this.onResize();
          });

        },

        destroy: function() {

          if (this.autoPlace) {
            auto_place_container.removeChild(this.domElement);
          }

        },

        /**
         * @param name
         * @returns {dat.gui.GUI} The new folder.
         * @throws {Error} if this GUI already has a folder by the specified
         * name
         * @instance
         */
        addFolder: function(name) {

          // We have to prevent collisions on names in order to have a key
          // by which to remember saved values
          if (this.__folders[name] !== undefined) {
            throw new Error('You already have a folder in this GUI by the' +
                ' name "' + name + '"');
          }

          var new_gui_params = { name: name, parent: this };

          // We need to pass down the autoPlace trait so that we can
          // attach event listeners to open/close folder actions to
          // ensure that a scrollbar appears if the window is too short.
          new_gui_params.autoPlace = this.autoPlace;

          // Do we have saved appearance data for this folder?

          if (this.load && // Anything loaded?
              this.load.folders && // Was my parent a dead-end?
              this.load.folders[name]) { // Did daddy remember me?

            // Start me closed if I was closed
            new_gui_params.closed = this.load.folders[name].closed;

            // Pass down the loaded data
            new_gui_params.load = this.load.folders[name];

          }

          var gui = new GUI(new_gui_params);
          this.__folders[name] = gui;

          var li = addRow(this, gui.domElement);
          dom.addClass(li, 'folder');
          return gui;

        },

        open: function() {
          this.closed = false;
        },

        close: function() {
          this.closed = true;
        },

        onResize: function() {

          var root = this.getRoot();

          if (root.scrollable) {

            var top = dom.getOffset(root.__ul).top;
            var h = 0;

            common.each(root.__ul.childNodes, function(node) {
              if (! (root.autoPlace && node === root.__save_row))
                h += dom.getHeight(node);
            });

            if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
              dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
              root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
            } else {
              dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
              root.__ul.style.height = 'auto';
            }

          }

          if (root.__resize_handle) {
            common.defer(function() {
              root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
            });
          }

          if (root.__closeButton) {
            root.__closeButton.style.width = root.width + 'px';
          }

        },

        /**
         * Mark objects for saving. The order of these objects cannot change as
         * the GUI grows. When remembering new objects, append them to the end
         * of the list.
         *
         * @param {Object...} objects
         * @throws {Error} if not called on a top level GUI.
         * @instance
         */
        remember: function() {

          if (common.isUndefined(SAVE_DIALOGUE)) {
            SAVE_DIALOGUE = new CenteredDiv();
            SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
          }

          if (this.parent) {
            throw new Error("You can only call remember on a top level GUI.");
          }

          var _this = this;

          common.each(Array.prototype.slice.call(arguments), function(object) {
            if (_this.__rememberedObjects.length == 0) {
              addSaveMenu(_this);
            }
            if (_this.__rememberedObjects.indexOf(object) == -1) {
              _this.__rememberedObjects.push(object);
            }
          });

          if (this.autoPlace) {
            // Set save row width
            setWidth(this, this.width);
          }

        },

        /**
         * @returns {dat.gui.GUI} the topmost parent GUI of a nested GUI.
         * @instance
         */
        getRoot: function() {
          var gui = this;
          while (gui.parent) {
            gui = gui.parent;
          }
          return gui;
        },

        /**
         * @returns {Object} a JSON object representing the current state of
         * this GUI as well as its remembered properties.
         * @instance
         */
        getSaveObject: function() {

          var toReturn = this.load;

          toReturn.closed = this.closed;

          // Am I remembering any values?
          if (this.__rememberedObjects.length > 0) {

            toReturn.preset = this.preset;

            if (!toReturn.remembered) {
              toReturn.remembered = {};
            }

            toReturn.remembered[this.preset] = getCurrentPreset(this);

          }

          toReturn.folders = {};
          common.each(this.__folders, function(element, key) {
            toReturn.folders[key] = element.getSaveObject();
          });

          return toReturn;

        },

        save: function() {

          if (!this.load.remembered) {
            this.load.remembered = {};
          }

          this.load.remembered[this.preset] = getCurrentPreset(this);
          markPresetModified(this, false);

        },

        saveAs: function(presetName) {

          if (!this.load.remembered) {

            // Retain default values upon first save
            this.load.remembered = {};
            this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);

          }

          this.load.remembered[presetName] = getCurrentPreset(this);
          this.preset = presetName;
          addPresetOption(this, presetName, true);

        },

        revert: function(gui) {

          common.each(this.__controllers, function(controller) {
            // Make revert work on Default.
            if (!this.getRoot().load.remembered) {
              controller.setValue(controller.initialValue);
            } else {
              recallSavedValue(gui || this.getRoot(), controller);
            }
          }, this);

          common.each(this.__folders, function(folder) {
            folder.revert(folder);
          });

          if (!gui) {
            markPresetModified(this.getRoot(), false);
          }


        },

        listen: function(controller) {

          var init = this.__listening.length == 0;
          this.__listening.push(controller);
          if (init) updateDisplays(this.__listening);

        }

      }

  );

  function add(gui, object, property, params) {

    if (object[property] === undefined) {
      throw new Error("Object " + object + " has no property \"" + property + "\"");
    }

    var controller;

    if (params.color) {

      controller = new ColorController(object, property);

    } else {

      var factoryArgs = [object,property].concat(params.factoryArgs);
      controller = controllerFactory.apply(gui, factoryArgs);

    }

    if (params.before instanceof Controller) {
      params.before = params.before.__li;
    }

    recallSavedValue(gui, controller);

    dom.addClass(controller.domElement, 'c');

    var name = document.createElement('span');
    dom.addClass(name, 'property-name');
    name.innerHTML = controller.property;

    var container = document.createElement('div');
    container.appendChild(name);
    container.appendChild(controller.domElement);

    var li = addRow(gui, container, params.before);

    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
    dom.addClass(li, typeof controller.getValue());

    augmentController(gui, li, controller);

    gui.__controllers.push(controller);

    return controller;

  }

  /**
   * Add a row to the end of the GUI or before another row.
   *
   * @param gui
   * @param [dom] If specified, inserts the dom content in the new row
   * @param [liBefore] If specified, places the new row before another row
   */
  function addRow(gui, dom, liBefore) {
    var li = document.createElement('li');
    if (dom) li.appendChild(dom);
    if (liBefore) {
      gui.__ul.insertBefore(li, params.before);
    } else {
      gui.__ul.appendChild(li);
    }
    gui.onResize();
    return li;
  }

  function augmentController(gui, li, controller) {

    controller.__li = li;
    controller.__gui = gui;

    common.extend(controller, {

      options: function(options) {

        if (arguments.length > 1) {
          controller.remove();

          return add(
              gui,
              controller.object,
              controller.property,
              {
                before: controller.__li.nextElementSibling,
                factoryArgs: [common.toArray(arguments)]
              }
          );

        }

        if (common.isArray(options) || common.isObject(options)) {
          controller.remove();

          return add(
              gui,
              controller.object,
              controller.property,
              {
                before: controller.__li.nextElementSibling,
                factoryArgs: [options]
              }
          );

        }

      },

      name: function(v) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = v;
        return controller;
      },

      listen: function() {
        controller.__gui.listen(controller);
        return controller;
      },

      remove: function() {
        controller.__gui.remove(controller);
        return controller;
      }

    });

    // All sliders should be accompanied by a box.
    if (controller instanceof NumberControllerSlider) {

      var box = new NumberControllerBox(controller.object, controller.property,
          { min: controller.__min, max: controller.__max, step: controller.__step });

      common.each(['updateDisplay', 'onChange', 'onFinishChange'], function(method) {
        var pc = controller[method];
        var pb = box[method];
        controller[method] = box[method] = function() {
          var args = Array.prototype.slice.call(arguments);
          pc.apply(controller, args);
          return pb.apply(box, args);
        }
      });

      dom.addClass(li, 'has-slider');
      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);

    }
    else if (controller instanceof NumberControllerBox) {

      var r = function(returned) {

        // Have we defined both boundaries?
        if (common.isNumber(controller.__min) && common.isNumber(controller.__max)) {

          // Well, then lets just replace this with a slider.
          controller.remove();
          return add(
              gui,
              controller.object,
              controller.property,
              {
                before: controller.__li.nextElementSibling,
                factoryArgs: [controller.__min, controller.__max, controller.__step]
              });

        }

        return returned;

      };

      controller.min = common.compose(r, controller.min);
      controller.max = common.compose(r, controller.max);

    }
    else if (controller instanceof BooleanController) {

      dom.bind(li, 'click', function() {
        dom.fakeEvent(controller.__checkbox, 'click');
      });

      dom.bind(controller.__checkbox, 'click', function(e) {
        e.stopPropagation(); // Prevents double-toggle
      })

    }
    else if (controller instanceof FunctionController) {

      dom.bind(li, 'click', function() {
        dom.fakeEvent(controller.__button, 'click');
      });

      dom.bind(li, 'mouseover', function() {
        dom.addClass(controller.__button, 'hover');
      });

      dom.bind(li, 'mouseout', function() {
        dom.removeClass(controller.__button, 'hover');
      });

    }
    else if (controller instanceof ColorController) {

      dom.addClass(li, 'color');
      controller.updateDisplay = common.compose(function(r) {
        li.style.borderLeftColor = controller.__color.toString();
        return r;
      }, controller.updateDisplay);

      controller.updateDisplay();

    }

    controller.setValue = common.compose(function(r) {
      if (gui.getRoot().__preset_select && controller.isModified()) {
        markPresetModified(gui.getRoot(), true);
      }
      return r;
    }, controller.setValue);

  }

  function recallSavedValue(gui, controller) {

    // Find the topmost GUI, that's where remembered objects live.
    var root = gui.getRoot();

    // Does the object we're controlling match anything we've been told to
    // remember?
    var matched_index = root.__rememberedObjects.indexOf(controller.object);

    // Why yes, it does!
    if (matched_index != -1) {

      // Let me fetch a map of controllers for thcommon.isObject.
      var controller_map =
          root.__rememberedObjectIndecesToControllers[matched_index];

      // Ohp, I believe this is the first controller we've created for this
      // object. Lets make the map fresh.
      if (controller_map === undefined) {
        controller_map = {};
        root.__rememberedObjectIndecesToControllers[matched_index] =
            controller_map;
      }

      // Keep track of this controller
      controller_map[controller.property] = controller;

      // Okay, now have we saved any values for this controller?
      if (root.load && root.load.remembered) {

        var preset_map = root.load.remembered;

        // Which preset are we trying to load?
        var preset;

        if (preset_map[gui.preset]) {

          preset = preset_map[gui.preset];

        } else if (preset_map[DEFAULT_DEFAULT_PRESET_NAME]) {

          // Uhh, you can have the default instead?
          preset = preset_map[DEFAULT_DEFAULT_PRESET_NAME];

        } else {

          // Nada.

          return;

        }


        // Did the loaded object remember thcommon.isObject?
        if (preset[matched_index] &&

          // Did we remember this particular property?
            preset[matched_index][controller.property] !== undefined) {

          // We did remember something for this guy ...
          var value = preset[matched_index][controller.property];

          // And that's what it is.
          controller.initialValue = value;
          controller.setValue(value);

        }

      }

    }

  }

  function getLocalStorageHash(gui, key) {
    // TODO how does this deal with multiple GUI's?
    return document.location.href + '.' + key;

  }

  function addSaveMenu(gui) {

    var div = gui.__save_row = document.createElement('li');

    dom.addClass(gui.domElement, 'has-save');

    gui.__ul.insertBefore(div, gui.__ul.firstChild);

    dom.addClass(div, 'save-row');

    var gears = document.createElement('span');
    gears.innerHTML = '&nbsp;';
    dom.addClass(gears, 'button gears');

    // TODO replace with FunctionController
    var button = document.createElement('span');
    button.innerHTML = 'Save';
    dom.addClass(button, 'button');
    dom.addClass(button, 'save');

    var button2 = document.createElement('span');
    button2.innerHTML = 'New';
    dom.addClass(button2, 'button');
    dom.addClass(button2, 'save-as');

    var button3 = document.createElement('span');
    button3.innerHTML = 'Revert';
    dom.addClass(button3, 'button');
    dom.addClass(button3, 'revert');

    var select = gui.__preset_select = document.createElement('select');

    if (gui.load && gui.load.remembered) {

      common.each(gui.load.remembered, function(value, key) {
        addPresetOption(gui, key, key == gui.preset);
      });

    } else {
      addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
    }

    dom.bind(select, 'change', function() {


      for (var index = 0; index < gui.__preset_select.length; index++) {
        gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
      }

      gui.preset = this.value;

    });

    div.appendChild(select);
    div.appendChild(gears);
    div.appendChild(button);
    div.appendChild(button2);
    div.appendChild(button3);

    if (SUPPORTS_LOCAL_STORAGE) {

      var saveLocally = document.getElementById('dg-save-locally');
      var explain = document.getElementById('dg-local-explain');

      saveLocally.style.display = 'block';

      var localStorageCheckBox = document.getElementById('dg-local-storage');

      if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
        localStorageCheckBox.setAttribute('checked', 'checked');
      }

      function showHideExplain() {
        explain.style.display = gui.useLocalStorage ? 'block' : 'none';
      }

      showHideExplain();

      // TODO: Use a boolean controller, fool!
      dom.bind(localStorageCheckBox, 'change', function() {
        gui.useLocalStorage = !gui.useLocalStorage;
        showHideExplain();
      });

    }

    var newConstructorTextArea = document.getElementById('dg-new-constructor');

    dom.bind(newConstructorTextArea, 'keydown', function(e) {
      if (e.metaKey && (e.which === 67 || e.keyCode == 67)) {
        SAVE_DIALOGUE.hide();
      }
    });

    dom.bind(gears, 'click', function() {
      newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
      SAVE_DIALOGUE.show();
      newConstructorTextArea.focus();
      newConstructorTextArea.select();
    });

    dom.bind(button, 'click', function() {
      gui.save();
    });

    dom.bind(button2, 'click', function() {
      var presetName = prompt('Enter a new preset name.');
      if (presetName) gui.saveAs(presetName);
    });

    dom.bind(button3, 'click', function() {
      gui.revert();
    });

//    div.appendChild(button2);

  }

  function addResizeHandle(gui) {

    gui.__resize_handle = document.createElement('div');

    common.extend(gui.__resize_handle.style, {

      width: '6px',
      marginLeft: '-3px',
      height: '200px',
      cursor: 'ew-resize',
      position: 'absolute'
//      border: '1px solid blue'

    });

    var pmouseX;

    dom.bind(gui.__resize_handle, 'mousedown', dragStart);
    dom.bind(gui.__closeButton, 'mousedown', dragStart);

    gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);

    function dragStart(e) {

      e.preventDefault();

      pmouseX = e.clientX;

      dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.bind(window, 'mousemove', drag);
      dom.bind(window, 'mouseup', dragStop);

      return false;

    }

    function drag(e) {

      e.preventDefault();

      gui.width += pmouseX - e.clientX;
      gui.onResize();
      pmouseX = e.clientX;

      return false;

    }

    function dragStop() {

      dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.unbind(window, 'mousemove', drag);
      dom.unbind(window, 'mouseup', dragStop);

    }

  }

  function setWidth(gui, w) {
    gui.domElement.style.width = w + 'px';
    // Auto placed save-rows are position fixed, so we have to
    // set the width manually if we want it to bleed to the edge
    if (gui.__save_row && gui.autoPlace) {
      gui.__save_row.style.width = w + 'px';
    }if (gui.__closeButton) {
      gui.__closeButton.style.width = w + 'px';
    }
  }

  function getCurrentPreset(gui, useInitialValues) {

    var toReturn = {};

    // For each object I'm remembering
    common.each(gui.__rememberedObjects, function(val, index) {

      var saved_values = {};

      // The controllers I've made for thcommon.isObject by property
      var controller_map =
          gui.__rememberedObjectIndecesToControllers[index];

      // Remember each value for each property
      common.each(controller_map, function(controller, property) {
        saved_values[property] = useInitialValues ? controller.initialValue : controller.getValue();
      });

      // Save the values for thcommon.isObject
      toReturn[index] = saved_values;

    });

    return toReturn;

  }

  function addPresetOption(gui, name, setSelected) {
    var opt = document.createElement('option');
    opt.innerHTML = name;
    opt.value = name;
    gui.__preset_select.appendChild(opt);
    if (setSelected) {
      gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
    }
  }

  function setPresetSelectIndex(gui) {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      if (gui.__preset_select[index].value == gui.preset) {
        gui.__preset_select.selectedIndex = index;
      }
    }
  }

  function markPresetModified(gui, modified) {
    var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
//    console.log('mark', modified, opt);
    if (modified) {
      opt.innerHTML = opt.value + "*";
    } else {
      opt.innerHTML = opt.value;
    }
  }

  function updateDisplays(controllerArray) {


    if (controllerArray.length != 0) {

      requestAnimationFrame(function() {
        updateDisplays(controllerArray);
      });

    }

    common.each(controllerArray, function(c) {
      c.updateDisplay();
    });

  }

  return GUI;

})(dat.utils.css,
"<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>",
".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity 0.1s linear;-o-transition:opacity 0.1s linear;-moz-transition:opacity 0.1s linear;transition:opacity 0.1s linear;border:0;position:absolute;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-x:hidden}.dg.a.has-save ul{margin-top:27px}.dg.a.has-save ul.closed{margin-top:0}.dg.a .save-row{position:fixed;top:0;z-index:1002}.dg li{-webkit-transition:height 0.1s ease-out;-o-transition:height 0.1s ease-out;-moz-transition:height 0.1s ease-out;transition:height 0.1s ease-out}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;overflow:hidden;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li > *{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:9px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2fa1d6}.dg .cr.number input[type=text]{color:#2fa1d6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2fa1d6}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n",
dat.controllers.factory = (function (OptionController, NumberControllerBox, NumberControllerSlider, StringController, FunctionController, BooleanController, common) {

      return function(object, property) {

        var initialValue = object[property];

        // Providing options?
        if (common.isArray(arguments[2]) || common.isObject(arguments[2])) {
          return new OptionController(object, property, arguments[2]);
        }

        // Providing a map?

        if (common.isNumber(initialValue)) {

          if (common.isNumber(arguments[2]) && common.isNumber(arguments[3])) {

            // Has min and max.
            return new NumberControllerSlider(object, property, arguments[2], arguments[3]);

          } else {

            return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });

          }

        }

        if (common.isString(initialValue)) {
          return new StringController(object, property);
        }

        if (common.isFunction(initialValue)) {
          return new FunctionController(object, property, '');
        }

        if (common.isBoolean(initialValue)) {
          return new BooleanController(object, property);
        }

      }

    })(dat.controllers.OptionController,
dat.controllers.NumberControllerBox,
dat.controllers.NumberControllerSlider,
dat.controllers.StringController = (function (Controller, dom, common) {

  /**
   * @class Provides a text input to alter the string property of an object.
   *
   * @extends dat.controllers.Controller
   *
   * @param {Object} object The object to be manipulated
   * @param {string} property The name of the property to be manipulated
   *
   * @member dat.controllers
   */
  var StringController = function(object, property) {

    StringController.superclass.call(this, object, property);

    var _this = this;

    this.__input = document.createElement('input');
    this.__input.setAttribute('type', 'text');

    dom.bind(this.__input, 'keyup', onChange);
    dom.bind(this.__input, 'change', onChange);
    dom.bind(this.__input, 'blur', onBlur);
    dom.bind(this.__input, 'keydown', function(e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
    

    function onChange() {
      _this.setValue(_this.__input.value);
    }

    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }

    this.updateDisplay();

    this.domElement.appendChild(this.__input);

  };

  StringController.superclass = Controller;

  common.extend(

      StringController.prototype,
      Controller.prototype,

      {

        updateDisplay: function() {
          // Stops the caret from moving on account of:
          // keyup -> setValue -> updateDisplay
          if (!dom.isActive(this.__input)) {
            this.__input.value = this.getValue();
          }
          return StringController.superclass.prototype.updateDisplay.call(this);
        }

      }

  );

  return StringController;

})(dat.controllers.Controller,
dat.dom.dom,
dat.utils.common),
dat.controllers.FunctionController,
dat.controllers.BooleanController,
dat.utils.common),
dat.controllers.Controller,
dat.controllers.BooleanController,
dat.controllers.FunctionController,
dat.controllers.NumberControllerBox,
dat.controllers.NumberControllerSlider,
dat.controllers.OptionController,
dat.controllers.ColorController = (function (Controller, dom, Color, interpret, common) {

  var ColorController = function(object, property) {

    ColorController.superclass.call(this, object, property);

    this.__color = new Color(this.getValue());
    this.__temp = new Color(0);

    var _this = this;

    this.domElement = document.createElement('div');

    dom.makeSelectable(this.domElement, false);

    this.__selector = document.createElement('div');
    this.__selector.className = 'selector';

    this.__saturation_field = document.createElement('div');
    this.__saturation_field.className = 'saturation-field';

    this.__field_knob = document.createElement('div');
    this.__field_knob.className = 'field-knob';
    this.__field_knob_border = '2px solid ';

    this.__hue_knob = document.createElement('div');
    this.__hue_knob.className = 'hue-knob';

    this.__hue_field = document.createElement('div');
    this.__hue_field.className = 'hue-field';

    this.__input = document.createElement('input');
    this.__input.type = 'text';
    this.__input_textShadow = '0 1px 1px ';

    dom.bind(this.__input, 'keydown', function(e) {
      if (e.keyCode === 13) { // on enter
        onBlur.call(this);
      }
    });

    dom.bind(this.__input, 'blur', onBlur);

    dom.bind(this.__selector, 'mousedown', function(e) {

      dom
        .addClass(this, 'drag')
        .bind(window, 'mouseup', function(e) {
          dom.removeClass(_this.__selector, 'drag');
        });

    });

    var value_field = document.createElement('div');

    common.extend(this.__selector.style, {
      width: '122px',
      height: '102px',
      padding: '3px',
      backgroundColor: '#222',
      boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
    });

    common.extend(this.__field_knob.style, {
      position: 'absolute',
      width: '12px',
      height: '12px',
      border: this.__field_knob_border + (this.__color.v < .5 ? '#fff' : '#000'),
      boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
      borderRadius: '12px',
      zIndex: 1
    });
    
    common.extend(this.__hue_knob.style, {
      position: 'absolute',
      width: '15px',
      height: '2px',
      borderRight: '4px solid #fff',
      zIndex: 1
    });

    common.extend(this.__saturation_field.style, {
      width: '100px',
      height: '100px',
      border: '1px solid #555',
      marginRight: '3px',
      display: 'inline-block',
      cursor: 'pointer'
    });

    common.extend(value_field.style, {
      width: '100%',
      height: '100%',
      background: 'none'
    });
    
    linearGradient(value_field, 'top', 'rgba(0,0,0,0)', '#000');

    common.extend(this.__hue_field.style, {
      width: '15px',
      height: '100px',
      display: 'inline-block',
      border: '1px solid #555',
      cursor: 'ns-resize'
    });

    hueGradient(this.__hue_field);

    common.extend(this.__input.style, {
      outline: 'none',
//      width: '120px',
      textAlign: 'center',
//      padding: '4px',
//      marginBottom: '6px',
      color: '#fff',
      border: 0,
      fontWeight: 'bold',
      textShadow: this.__input_textShadow + 'rgba(0,0,0,0.7)'
    });

    dom.bind(this.__saturation_field, 'mousedown', fieldDown);
    dom.bind(this.__field_knob, 'mousedown', fieldDown);

    dom.bind(this.__hue_field, 'mousedown', function(e) {
      setH(e);
      dom.bind(window, 'mousemove', setH);
      dom.bind(window, 'mouseup', unbindH);
    });

    function fieldDown(e) {
      setSV(e);
      // document.body.style.cursor = 'none';
      dom.bind(window, 'mousemove', setSV);
      dom.bind(window, 'mouseup', unbindSV);
    }

    function unbindSV() {
      dom.unbind(window, 'mousemove', setSV);
      dom.unbind(window, 'mouseup', unbindSV);
      // document.body.style.cursor = 'default';
    }

    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }

    function unbindH() {
      dom.unbind(window, 'mousemove', setH);
      dom.unbind(window, 'mouseup', unbindH);
    }

    this.__saturation_field.appendChild(value_field);
    this.__selector.appendChild(this.__field_knob);
    this.__selector.appendChild(this.__saturation_field);
    this.__selector.appendChild(this.__hue_field);
    this.__hue_field.appendChild(this.__hue_knob);

    this.domElement.appendChild(this.__input);
    this.domElement.appendChild(this.__selector);

    this.updateDisplay();

    function setSV(e) {

      e.preventDefault();

      var w = dom.getWidth(_this.__saturation_field);
      var o = dom.getOffset(_this.__saturation_field);
      var s = (e.clientX - o.left + document.body.scrollLeft) / w;
      var v = 1 - (e.clientY - o.top + document.body.scrollTop) / w;

      if (v > 1) v = 1;
      else if (v < 0) v = 0;

      if (s > 1) s = 1;
      else if (s < 0) s = 0;

      _this.__color.v = v;
      _this.__color.s = s;

      _this.setValue(_this.__color.toOriginal());


      return false;

    }

    function setH(e) {

      e.preventDefault();

      var s = dom.getHeight(_this.__hue_field);
      var o = dom.getOffset(_this.__hue_field);
      var h = 1 - (e.clientY - o.top + document.body.scrollTop) / s;

      if (h > 1) h = 1;
      else if (h < 0) h = 0;

      _this.__color.h = h * 360;

      _this.setValue(_this.__color.toOriginal());

      return false;

    }

  };

  ColorController.superclass = Controller;

  common.extend(

      ColorController.prototype,
      Controller.prototype,

      {

        updateDisplay: function() {

          var i = interpret(this.getValue());

          if (i !== false) {

            var mismatch = false;

            // Check for mismatch on the interpreted value.

            common.each(Color.COMPONENTS, function(component) {
              if (!common.isUndefined(i[component]) &&
                  !common.isUndefined(this.__color.__state[component]) &&
                  i[component] !== this.__color.__state[component]) {
                mismatch = true;
                return {}; // break
              }
            }, this);

            // If nothing diverges, we keep our previous values
            // for statefulness, otherwise we recalculate fresh
            if (mismatch) {
              common.extend(this.__color.__state, i);
            }

          }

          common.extend(this.__temp.__state, this.__color.__state);

          this.__temp.a = 1;

          var flip = (this.__color.v < .5 || this.__color.s > .5) ? 255 : 0;
          var _flip = 255 - flip;

          common.extend(this.__field_knob.style, {
            marginLeft: 100 * this.__color.s - 7 + 'px',
            marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
            backgroundColor: this.__temp.toString(),
            border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip +')'
          });

          this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px'

          this.__temp.s = 1;
          this.__temp.v = 1;

          linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toString());

          common.extend(this.__input.style, {
            backgroundColor: this.__input.value = this.__color.toString(),
            color: 'rgb(' + flip + ',' + flip + ',' + flip +')',
            textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip +',.7)'
          });

        }

      }

  );
  
  var vendors = ['-moz-','-o-','-webkit-','-ms-',''];
  
  function linearGradient(elem, x, a, b) {
    elem.style.background = '';
    common.each(vendors, function(vendor) {
      elem.style.cssText += 'background: ' + vendor + 'linear-gradient('+x+', '+a+' 0%, ' + b + ' 100%); ';
    });
  }
  
  function hueGradient(elem) {
    elem.style.background = '';
    elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);'
    elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
    elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
    elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
    elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);'
  }


  return ColorController;

})(dat.controllers.Controller,
dat.dom.dom,
dat.color.Color = (function (interpret, math, toString, common) {

  var Color = function() {

    this.__state = interpret.apply(this, arguments);

    if (this.__state === false) {
      throw 'Failed to interpret color arguments';
    }

    this.__state.a = this.__state.a || 1;


  };

  Color.COMPONENTS = ['r','g','b','h','s','v','hex','a'];

  common.extend(Color.prototype, {

    toString: function() {
      return toString(this);
    },

    toOriginal: function() {
      return this.__state.conversion.write(this);
    }

  });

  defineRGBComponent(Color.prototype, 'r', 2);
  defineRGBComponent(Color.prototype, 'g', 1);
  defineRGBComponent(Color.prototype, 'b', 0);

  defineHSVComponent(Color.prototype, 'h');
  defineHSVComponent(Color.prototype, 's');
  defineHSVComponent(Color.prototype, 'v');

  Object.defineProperty(Color.prototype, 'a', {

    get: function() {
      return this.__state.a;
    },

    set: function(v) {
      this.__state.a = v;
    }

  });

  Object.defineProperty(Color.prototype, 'hex', {

    get: function() {

      if (!this.__state.space !== 'HEX') {
        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
      }

      return this.__state.hex;

    },

    set: function(v) {

      this.__state.space = 'HEX';
      this.__state.hex = v;

    }

  });

  function defineRGBComponent(target, component, componentHexIndex) {

    Object.defineProperty(target, component, {

      get: function() {

        if (this.__state.space === 'RGB') {
          return this.__state[component];
        }

        recalculateRGB(this, component, componentHexIndex);

        return this.__state[component];

      },

      set: function(v) {

        if (this.__state.space !== 'RGB') {
          recalculateRGB(this, component, componentHexIndex);
          this.__state.space = 'RGB';
        }

        this.__state[component] = v;

      }

    });

  }

  function defineHSVComponent(target, component) {

    Object.defineProperty(target, component, {

      get: function() {

        if (this.__state.space === 'HSV')
          return this.__state[component];

        recalculateHSV(this);

        return this.__state[component];

      },

      set: function(v) {

        if (this.__state.space !== 'HSV') {
          recalculateHSV(this);
          this.__state.space = 'HSV';
        }

        this.__state[component] = v;

      }

    });

  }

  function recalculateRGB(color, component, componentHexIndex) {

    if (color.__state.space === 'HEX') {

      color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);

    } else if (color.__state.space === 'HSV') {

      common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));

    } else {

      throw 'Corrupted color state';

    }

  }

  function recalculateHSV(color) {

    var result = math.rgb_to_hsv(color.r, color.g, color.b);

    common.extend(color.__state,
        {
          s: result.s,
          v: result.v
        }
    );

    if (!common.isNaN(result.h)) {
      color.__state.h = result.h;
    } else if (common.isUndefined(color.__state.h)) {
      color.__state.h = 0;
    }

  }

  return Color;

})(dat.color.interpret,
dat.color.math = (function () {

  var tmpComponent;

  return {

    hsv_to_rgb: function(h, s, v) {

      var hi = Math.floor(h / 60) % 6;

      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1.0 - s);
      var q = v * (1.0 - (f * s));
      var t = v * (1.0 - ((1.0 - f) * s));
      var c = [
        [v, t, p],
        [q, v, p],
        [p, v, t],
        [p, q, v],
        [t, p, v],
        [v, p, q]
      ][hi];

      return {
        r: c[0] * 255,
        g: c[1] * 255,
        b: c[2] * 255
      };

    },

    rgb_to_hsv: function(r, g, b) {

      var min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          delta = max - min,
          h, s;

      if (max != 0) {
        s = delta / max;
      } else {
        return {
          h: NaN,
          s: 0,
          v: 0
        };
      }

      if (r == max) {
        h = (g - b) / delta;
      } else if (g == max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h /= 6;
      if (h < 0) {
        h += 1;
      }

      return {
        h: h * 360,
        s: s,
        v: max / 255
      };
    },

    rgb_to_hex: function(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },

    component_from_hex: function(hex, componentIndex) {
      return (hex >> (componentIndex * 8)) & 0xFF;
    },

    hex_with_component: function(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | (hex & ~ (0xFF << tmpComponent));
    }

  }

})(),
dat.color.toString,
dat.utils.common),
dat.color.interpret,
dat.utils.common),
dat.utils.requestAnimationFrame = (function () {

  /**
   * requirejs version of Paul Irish's RequestAnimationFrame
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   */

  return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback, element) {

        window.setTimeout(callback, 1000 / 60);

      };
})(),
dat.dom.CenteredDiv = (function (dom, common) {


  var CenteredDiv = function() {

    this.backgroundElement = document.createElement('div');
    common.extend(this.backgroundElement.style, {
      backgroundColor: 'rgba(0,0,0,0.8)',
      top: 0,
      left: 0,
      display: 'none',
      zIndex: '1000',
      opacity: 0,
      WebkitTransition: 'opacity 0.2s linear'
    });

    dom.makeFullscreen(this.backgroundElement);
    this.backgroundElement.style.position = 'fixed';

    this.domElement = document.createElement('div');
    common.extend(this.domElement.style, {
      position: 'fixed',
      display: 'none',
      zIndex: '1001',
      opacity: 0,
      WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear'
    });


    document.body.appendChild(this.backgroundElement);
    document.body.appendChild(this.domElement);

    var _this = this;
    dom.bind(this.backgroundElement, 'click', function() {
      _this.hide();
    });


  };

  CenteredDiv.prototype.show = function() {

    var _this = this;
    


    this.backgroundElement.style.display = 'block';

    this.domElement.style.display = 'block';
    this.domElement.style.opacity = 0;
//    this.domElement.style.top = '52%';
    this.domElement.style.webkitTransform = 'scale(1.1)';

    this.layout();

    common.defer(function() {
      _this.backgroundElement.style.opacity = 1;
      _this.domElement.style.opacity = 1;
      _this.domElement.style.webkitTransform = 'scale(1)';
    });

  };

  CenteredDiv.prototype.hide = function() {

    var _this = this;

    var hide = function() {

      _this.domElement.style.display = 'none';
      _this.backgroundElement.style.display = 'none';

      dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
      dom.unbind(_this.domElement, 'transitionend', hide);
      dom.unbind(_this.domElement, 'oTransitionEnd', hide);

    };

    dom.bind(this.domElement, 'webkitTransitionEnd', hide);
    dom.bind(this.domElement, 'transitionend', hide);
    dom.bind(this.domElement, 'oTransitionEnd', hide);

    this.backgroundElement.style.opacity = 0;
//    this.domElement.style.top = '48%';
    this.domElement.style.opacity = 0;
    this.domElement.style.webkitTransform = 'scale(1.1)';

  };

  CenteredDiv.prototype.layout = function() {
    this.domElement.style.left = window.innerWidth/2 - dom.getWidth(this.domElement) / 2 + 'px';
    this.domElement.style.top = window.innerHeight/2 - dom.getHeight(this.domElement) / 2 + 'px';
  };
  
  function lockScroll(e) {
    console.log(e);
  }

  return CenteredDiv;

})(dat.dom.dom,
dat.utils.common),
dat.dom.dom,
dat.utils.common);

/***/ }),

/***/ 23:
/***/ (function(module, exports) {

/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/** @namespace */
var dat = module.exports = dat || {};

/** @namespace */
dat.color = dat.color || {};

/** @namespace */
dat.utils = dat.utils || {};

dat.utils.common = (function () {
  
  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;

  /**
   * Band-aid methods for things that should be a lot easier in JavaScript.
   * Implementation and structure inspired by underscore.js
   * http://documentcloud.github.com/underscore/
   */

  return { 
    
    BREAK: {},
  
    extend: function(target) {
      
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        
        for (var key in obj)
          if (!this.isUndefined(obj[key])) 
            target[key] = obj[key];
        
      }, this);
      
      return target;
      
    },
    
    defaults: function(target) {
      
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        
        for (var key in obj)
          if (this.isUndefined(target[key])) 
            target[key] = obj[key];
        
      }, this);
      
      return target;
    
    },
    
    compose: function() {
      var toCall = ARR_SLICE.call(arguments);
            return function() {
              var args = ARR_SLICE.call(arguments);
              for (var i = toCall.length -1; i >= 0; i--) {
                args = [toCall[i].apply(this, args)];
              }
              return args[0];
            }
    },
    
    each: function(obj, itr, scope) {

      
      if (ARR_EACH && obj.forEach === ARR_EACH) { 
        
        obj.forEach(itr, scope);
        
      } else if (obj.length === obj.length + 0) { // Is number but not NaN
        
        for (var key = 0, l = obj.length; key < l; key++)
          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) 
            return;
            
      } else {

        for (var key in obj) 
          if (itr.call(scope, obj[key], key) === this.BREAK)
            return;
            
      }
            
    },
    
    defer: function(fnc) {
      setTimeout(fnc, 0);
    },
    
    toArray: function(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },

    isUndefined: function(obj) {
      return obj === undefined;
    },
    
    isNull: function(obj) {
      return obj === null;
    },
    
    isNaN: function(obj) {
      return obj !== obj;
    },
    
    isArray: Array.isArray || function(obj) {
      return obj.constructor === Array;
    },
    
    isObject: function(obj) {
      return obj === Object(obj);
    },
    
    isNumber: function(obj) {
      return obj === obj+0;
    },
    
    isString: function(obj) {
      return obj === obj+'';
    },
    
    isBoolean: function(obj) {
      return obj === false || obj === true;
    },
    
    isFunction: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }
  
  };
    
})();


dat.color.toString = (function (common) {

  return function(color) {

    if (color.a == 1 || common.isUndefined(color.a)) {

      var s = color.hex.toString(16);
      while (s.length < 6) {
        s = '0' + s;
      }

      return '#' + s;

    } else {

      return 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + color.a + ')';

    }

  }

})(dat.utils.common);


dat.Color = dat.color.Color = (function (interpret, math, toString, common) {

  var Color = function() {

    this.__state = interpret.apply(this, arguments);

    if (this.__state === false) {
      throw 'Failed to interpret color arguments';
    }

    this.__state.a = this.__state.a || 1;


  };

  Color.COMPONENTS = ['r','g','b','h','s','v','hex','a'];

  common.extend(Color.prototype, {

    toString: function() {
      return toString(this);
    },

    toOriginal: function() {
      return this.__state.conversion.write(this);
    }

  });

  defineRGBComponent(Color.prototype, 'r', 2);
  defineRGBComponent(Color.prototype, 'g', 1);
  defineRGBComponent(Color.prototype, 'b', 0);

  defineHSVComponent(Color.prototype, 'h');
  defineHSVComponent(Color.prototype, 's');
  defineHSVComponent(Color.prototype, 'v');

  Object.defineProperty(Color.prototype, 'a', {

    get: function() {
      return this.__state.a;
    },

    set: function(v) {
      this.__state.a = v;
    }

  });

  Object.defineProperty(Color.prototype, 'hex', {

    get: function() {

      if (!this.__state.space !== 'HEX') {
        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
      }

      return this.__state.hex;

    },

    set: function(v) {

      this.__state.space = 'HEX';
      this.__state.hex = v;

    }

  });

  function defineRGBComponent(target, component, componentHexIndex) {

    Object.defineProperty(target, component, {

      get: function() {

        if (this.__state.space === 'RGB') {
          return this.__state[component];
        }

        recalculateRGB(this, component, componentHexIndex);

        return this.__state[component];

      },

      set: function(v) {

        if (this.__state.space !== 'RGB') {
          recalculateRGB(this, component, componentHexIndex);
          this.__state.space = 'RGB';
        }

        this.__state[component] = v;

      }

    });

  }

  function defineHSVComponent(target, component) {

    Object.defineProperty(target, component, {

      get: function() {

        if (this.__state.space === 'HSV')
          return this.__state[component];

        recalculateHSV(this);

        return this.__state[component];

      },

      set: function(v) {

        if (this.__state.space !== 'HSV') {
          recalculateHSV(this);
          this.__state.space = 'HSV';
        }

        this.__state[component] = v;

      }

    });

  }

  function recalculateRGB(color, component, componentHexIndex) {

    if (color.__state.space === 'HEX') {

      color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);

    } else if (color.__state.space === 'HSV') {

      common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));

    } else {

      throw 'Corrupted color state';

    }

  }

  function recalculateHSV(color) {

    var result = math.rgb_to_hsv(color.r, color.g, color.b);

    common.extend(color.__state,
        {
          s: result.s,
          v: result.v
        }
    );

    if (!common.isNaN(result.h)) {
      color.__state.h = result.h;
    } else if (common.isUndefined(color.__state.h)) {
      color.__state.h = 0;
    }

  }

  return Color;

})(dat.color.interpret = (function (toString, common) {

  var result, toReturn;

  var interpret = function() {

    toReturn = false;

    var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];

    common.each(INTERPRETATIONS, function(family) {

      if (family.litmus(original)) {

        common.each(family.conversions, function(conversion, conversionName) {

          result = conversion.read(original);

          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return common.BREAK;

          }

        });

        return common.BREAK;

      }

    });

    return toReturn;

  };

  var INTERPRETATIONS = [

    // Strings
    {

      litmus: common.isString,

      conversions: {

        THREE_CHAR_HEX: {

          read: function(original) {

            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
            if (test === null) return false;

            return {
              space: 'HEX',
              hex: parseInt(
                  '0x' +
                      test[1].toString() + test[1].toString() +
                      test[2].toString() + test[2].toString() +
                      test[3].toString() + test[3].toString())
            };

          },

          write: toString

        },

        SIX_CHAR_HEX: {

          read: function(original) {

            var test = original.match(/^#([A-F0-9]{6})$/i);
            if (test === null) return false;

            return {
              space: 'HEX',
              hex: parseInt('0x' + test[1].toString())
            };

          },

          write: toString

        },

        CSS_RGB: {

          read: function(original) {

            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
            if (test === null) return false;

            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3])
            };

          },

          write: toString

        },

        CSS_RGBA: {

          read: function(original) {

            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
            if (test === null) return false;

            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3]),
              a: parseFloat(test[4])
            };

          },

          write: toString

        }

      }

    },

    // Numbers
    {

      litmus: common.isNumber,

      conversions: {

        HEX: {
          read: function(original) {
            return {
              space: 'HEX',
              hex: original,
              conversionName: 'HEX'
            }
          },

          write: function(color) {
            return color.hex;
          }
        }

      }

    },

    // Arrays
    {

      litmus: common.isArray,

      conversions: {

        RGB_ARRAY: {
          read: function(original) {
            if (original.length != 3) return false;
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2]
            };
          },

          write: function(color) {
            return [color.r, color.g, color.b];
          }

        },

        RGBA_ARRAY: {
          read: function(original) {
            if (original.length != 4) return false;
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2],
              a: original[3]
            };
          },

          write: function(color) {
            return [color.r, color.g, color.b, color.a];
          }

        }

      }

    },

    // Objects
    {

      litmus: common.isObject,

      conversions: {

        RGBA_OBJ: {
          read: function(original) {
            if (common.isNumber(original.r) &&
                common.isNumber(original.g) &&
                common.isNumber(original.b) &&
                common.isNumber(original.a)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b,
                a: original.a
              }
            }
            return false;
          },

          write: function(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b,
              a: color.a
            }
          }
        },

        RGB_OBJ: {
          read: function(original) {
            if (common.isNumber(original.r) &&
                common.isNumber(original.g) &&
                common.isNumber(original.b)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b
              }
            }
            return false;
          },

          write: function(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b
            }
          }
        },

        HSVA_OBJ: {
          read: function(original) {
            if (common.isNumber(original.h) &&
                common.isNumber(original.s) &&
                common.isNumber(original.v) &&
                common.isNumber(original.a)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v,
                a: original.a
              }
            }
            return false;
          },

          write: function(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v,
              a: color.a
            }
          }
        },

        HSV_OBJ: {
          read: function(original) {
            if (common.isNumber(original.h) &&
                common.isNumber(original.s) &&
                common.isNumber(original.v)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v
              }
            }
            return false;
          },

          write: function(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v
            }
          }

        }

      }

    }


  ];

  return interpret;


})(dat.color.toString,
dat.utils.common),
dat.color.math = (function () {

  var tmpComponent;

  return {

    hsv_to_rgb: function(h, s, v) {

      var hi = Math.floor(h / 60) % 6;

      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1.0 - s);
      var q = v * (1.0 - (f * s));
      var t = v * (1.0 - ((1.0 - f) * s));
      var c = [
        [v, t, p],
        [q, v, p],
        [p, v, t],
        [p, q, v],
        [t, p, v],
        [v, p, q]
      ][hi];

      return {
        r: c[0] * 255,
        g: c[1] * 255,
        b: c[2] * 255
      };

    },

    rgb_to_hsv: function(r, g, b) {

      var min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          delta = max - min,
          h, s;

      if (max != 0) {
        s = delta / max;
      } else {
        return {
          h: NaN,
          s: 0,
          v: 0
        };
      }

      if (r == max) {
        h = (g - b) / delta;
      } else if (g == max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h /= 6;
      if (h < 0) {
        h += 1;
      }

      return {
        h: h * 360,
        s: s,
        v: max / 255
      };
    },

    rgb_to_hex: function(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },

    component_from_hex: function(hex, componentIndex) {
      return (hex >> (componentIndex * 8)) & 0xFF;
    },

    hex_with_component: function(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | (hex & ~ (0xFF << tmpComponent));
    }

  }

})(),
dat.color.toString,
dat.utils.common);

/***/ }),

/***/ 24:
/***/ (function(module, exports, __webpack_require__) {

// stats.js - http://github.com/mrdoob/stats.js
(function(f,e){ true?module.exports=e():"function"===typeof define&&define.amd?define(e):f.Stats=e()})(this,function(){var f=function(){function e(a){c.appendChild(a.dom);return a}function u(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?"block":"none";l=a}var l=0,c=document.createElement("div");c.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";c.addEventListener("click",function(a){a.preventDefault();
u(++l%c.children.length)},!1);var k=(performance||Date).now(),g=k,a=0,r=e(new f.Panel("FPS","#0ff","#002")),h=e(new f.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var t=e(new f.Panel("MB","#f08","#201"));u(0);return{REVISION:16,dom:c,addPanel:e,showPanel:u,begin:function(){k=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();h.update(c-k,200);if(c>g+1E3&&(r.update(1E3*a/(c-g),100),g=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/
1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){k=this.end()},domElement:c,setMode:u}};f.Panel=function(e,f,l){var c=Infinity,k=0,g=Math.round,a=g(window.devicePixelRatio||1),r=80*a,h=48*a,t=3*a,v=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement("canvas");q.width=r;q.height=h;q.style.cssText="width:80px;height:48px";var b=q.getContext("2d");b.font="bold "+9*a+"px Helvetica,Arial,sans-serif";b.textBaseline="top";b.fillStyle=l;b.fillRect(0,0,r,h);b.fillStyle=f;b.fillText(e,t,v);
b.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(h,w){c=Math.min(c,h);k=Math.max(k,h);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=f;b.fillText(g(h)+" "+e+" ("+g(c)+"-"+g(k)+")",t,v);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,g((1-h/w)*p))}}};return f});


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNmZkMzEwNDFhMDIzZTVhYzZjM2QiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2FsZnJpZC9idWlsZC9hbGZyaWQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2RlYnVnLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9kYXQtZ3VpL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9kYXQtZ3VpL3ZlbmRvci9kYXQuZ3VpLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9kYXQtZ3VpL3ZlbmRvci9kYXQuY29sb3IuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3N0YXRzLmpzL2J1aWxkL3N0YXRzLm1pbi5qcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJkZWJ1ZyIsImluaXQiLCJjb25zb2xlIiwibG9nIiwiZ3VpIiwiR1VJIiwid2lkdGgiLCJzdGF0cyIsImRvY3VtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwiZG9tRWxlbWVudCIsIlNjaGVkdWxlciIsImFkZEVGIiwidXBkYXRlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1FQUEyRDtBQUMzRDtBQUNBO0FBQ0EsV0FBRzs7QUFFSCxvREFBNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsd0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBTTtBQUNOO0FBQ0E7QUFDQSxjQUFNO0FBQ047QUFDQTtBQUNBLGNBQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxlQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBSTtBQUNKOzs7O0FBSUE7QUFDQSxzREFBOEM7QUFDOUM7QUFD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QUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtEQUErRDtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0Es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QixpQkFBaUIsR0FBRzs7O0FBR2xrQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBOzs7QUFHQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsQ0FBQztBQUNEO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUOztBQUVBO0FBQ0E7QUFDQSwyQztBQUNBLFdBQVc7QUFDWDtBQUNBOztBQUVBOztBQUVBOzs7QUFHQTs7QUFFQTs7QUFFQTs7QUFFQSxDQUFDO0FBQ0Q7QUFDQTs7O0FBR0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQTs7QUFFQSxDQUFDOzs7QUFHRDs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLFNBQVM7O0FBRVQ7O0FBRUE7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFXOztBQUVYOztBQUVBLFNBQVM7O0FBRVQ7O0FBRUE7O0FBRUEsbURBQW1ELEVBQUU7QUFDckQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVzs7QUFFWDs7QUFFQSxTQUFTOztBQUVUOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7O0FBRVg7O0FBRUEsU0FBUzs7QUFFVDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7O0FBRVg7O0FBRUE7O0FBRUE7O0FBRUEsS0FBSzs7QUFFTDtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7O0FBRUEsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXOztBQUVYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7OztBQUdBOztBQUVBOzs7QUFHQSxDQUFDO0FBQ0Q7OztBQUdBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsT0FBTztBQUNwQixhQUFhLE9BQU87QUFDcEIsYUFBYSxPQUFPO0FBQ3BCO0FBQ0EsYUFBYSxRQUFRO0FBQ3JCLGFBQWEsWUFBWTtBQUN6QixhQUFhLFFBQVE7QUFDckI7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7O0FBR0w7O0FBRUE7QUFDQTs7QUFFQSxLQUFLOztBQUVMLHFCQUFxQjs7QUFFckI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsU0FBUzs7QUFFVDtBQUNBOztBQUVBOztBQUVBO0FB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Q0E7QUFDQSxXQUFXOztBQUVYOztBQUVBLFNBQVM7O0FBRVQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsU0FBUzs7QUFFVDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLFNBQVM7O0FBRVQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBOzs7QUFHQSxTQUFTOztBQUVUOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsS0FBSzs7QUFFTDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQSxXQUFXLHdFQUF3RTs7QUFFbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTs7QUFFZjs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQSw0QkFBNEI7QUFDNUIsT0FBTzs7QUFFUDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQSxTQUFTOztBQUVUOztBQUVBOztBQUVBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0EsNkJBQTZCO0FBQzdCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLE9BQU87O0FBRVAsS0FBSztBQUNMO0FBQ0E7O0FBRUE7OztBQUdBLHlCQUF5QixvQ0FBb0M7QUFDN0Q7QUFDQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUJBQXVCLG9DQUFvQztBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQSxDQUFDO0FBQ0Q7QUFDQSxRQUFRLGdCQUFnQixTQUFTLFVBQVUsV0FBVyxXQUFXLE9BQU8sZUFBZSxNQUFNLE9B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QUdMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVCxLQUFLOztBQUVMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7O0FBR0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esd0dBQXdHO0FBQ3hHLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0EsNkpBQTZKO0FBQzdKLDBKQUEwSjtBQUMxSixxSkFBcUo7QUFDckosc0pBQXNKO0FBQ3RKLGtKQUFrSjtBQUNsSjs7O0FBR0E7O0FBRUEsQ0FBQztBQUNEO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsT0FBTzs7QUFFUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsT0FBTzs7QUFFUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMOztBQUVBOztBQUVBOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBOztBQUVBOztBQUVBLENBQUM7QUFDRDs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxLQUFLOztBQUVMOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsQ0FBQztBQUNEOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOzs7QUFHTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7OztBQUdMOztBQUVBOztBQUVBOzs7O0FBSUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsQ0FBQztBQUNEO0FBQ0E7QUFDQSxrQjs7Ozs7OztBQzNrSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxVOztBQUVBLGFBQWE7O0FBRWI7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLE9BQU87O0FBRVA7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBTzs7QUFFUDs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLFFBQVE7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOzs7QUFHQSxpRDs7QUFFQTs7QUFFQSxPQUFPLDBDQUEwQzs7QUFFakQseUNBQXlDLFNBQVM7QUFDbEQ7QUFDQTs7QUFFQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBOztBQUVBLENBQUM7OztBQUdEOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7O0FBRUEsQ0FBQzs7O0FBR0Q7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUEsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsT0FBTzs7QUFFUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsT0FBTzs7QUFFUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMOztBQUVBOztBQUVBOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBOztBQUVBOztBQUVBLENBQUM7O0FBRUQ7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxTQUFTOztBQUVUOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVzs7QUFFWDs7QUFFQSxTQUFTOztBQUVUOztBQUVBOztBQUVBLG1EQUFtRCxFQUFFO0FBQ3JEOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7O0FBRVg7O0FBRUEsU0FBUzs7QUFFVDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFXOztBQUVYOztBQUVBLFNBQVM7O0FBRVQ7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFXOztBQUVYOztBQUVBOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsS0FBSzs7QUFFTDtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBOztBQUVBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXOztBQUVYO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7O0FBRVg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXOztBQUVYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOzs7QUFHQTs7QUFFQTs7O0FBR0EsQ0FBQztBQUNEO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsQ0FBQztBQUNEO0FBQ0Esa0I7Ozs7Ozs7QUNsdkJBO0FBQ0EsZUFBZSxzRkFBdUksa0JBQWtCLGlCQUFpQixjQUFjLHFCQUFxQixTQUFTLGNBQWMsWUFBWSxvQkFBb0IscURBQXFELElBQUksd0NBQXdDLGdDQUFnQyxNQUFNLE9BQU8sZUFBZSxZQUFZLGVBQWUsdUNBQXVDO0FBQ2xmLHlCQUF5QixLQUFLLG1IQUFtSCxzRkFBc0YsS0FBSyxPQUFPLDBEQUEwRCw0QkFBNEIsZ0JBQWdCLElBQUksZ0NBQWdDLGtCQUFrQixtREFBbUQseUJBQXlCO0FBQzNkLG1DQUFtQyxTQUFTLG1CQUFtQixhQUFhLDBCQUEwQix3QkFBd0Isd0pBQXdKLFVBQVUsV0FBVyw0QkFBNEIsYUFBYSx5QkFBeUIsbURBQW1ELHFCQUFxQixjQUFjLG9CQUFvQixjQUFjO0FBQ3JlLG9CQUFvQixjQUFjLGlCQUFpQixvQkFBb0IsT0FBTywyQkFBMkIsZ0JBQWdCLGdCQUFnQixjQUFjLGdCQUFnQixvQkFBb0IsY0FBYyxrREFBa0QscUNBQXFDLHdCQUF3QixjQUFjLGlCQUFpQixzQ0FBc0MsU0FBUyIsImZpbGUiOiJhc3NldHMvanMvZGVidWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHRmdW5jdGlvbiBob3REaXNwb3NlQ2h1bmsoY2h1bmtJZCkge1xuIFx0XHRkZWxldGUgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdO1xuIFx0fVxuIFx0dmFyIHBhcmVudEhvdFVwZGF0ZUNhbGxiYWNrID0gdGhpc1tcIndlYnBhY2tIb3RVcGRhdGVcIl07XG4gXHR0aGlzW1wid2VicGFja0hvdFVwZGF0ZVwiXSA9IFxyXG4gXHRmdW5jdGlvbiB3ZWJwYWNrSG90VXBkYXRlQ2FsbGJhY2soY2h1bmtJZCwgbW9yZU1vZHVsZXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdGhvdEFkZFVwZGF0ZUNodW5rKGNodW5rSWQsIG1vcmVNb2R1bGVzKTtcclxuIFx0XHRpZihwYXJlbnRIb3RVcGRhdGVDYWxsYmFjaykgcGFyZW50SG90VXBkYXRlQ2FsbGJhY2soY2h1bmtJZCwgbW9yZU1vZHVsZXMpO1xyXG4gXHR9IDtcclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdERvd25sb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdFx0dmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF07XHJcbiBcdFx0dmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XHJcbiBcdFx0c2NyaXB0LnR5cGUgPSBcInRleHQvamF2YXNjcmlwdFwiO1xyXG4gXHRcdHNjcmlwdC5jaGFyc2V0ID0gXCJ1dGYtOFwiO1xyXG4gXHRcdHNjcmlwdC5zcmMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgKyBcIlwiICsgY2h1bmtJZCArIFwiLlwiICsgaG90Q3VycmVudEhhc2ggKyBcIi5ob3QtdXBkYXRlLmpzXCI7XHJcbiBcdFx0aGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3REb3dubG9hZE1hbmlmZXN0KHJlcXVlc3RUaW1lb3V0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHRyZXF1ZXN0VGltZW91dCA9IHJlcXVlc3RUaW1lb3V0IHx8IDEwMDAwO1xyXG4gXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuIFx0XHRcdGlmKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCA9PT0gXCJ1bmRlZmluZWRcIilcclxuIFx0XHRcdFx0cmV0dXJuIHJlamVjdChuZXcgRXJyb3IoXCJObyBicm93c2VyIHN1cHBvcnRcIikpO1xyXG4gXHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0dmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuIFx0XHRcdFx0dmFyIHJlcXVlc3RQYXRoID0gX193ZWJwYWNrX3JlcXVpcmVfXy5wICsgXCJcIiArIGhvdEN1cnJlbnRIYXNoICsgXCIuaG90LXVwZGF0ZS5qc29uXCI7XHJcbiBcdFx0XHRcdHJlcXVlc3Qub3BlbihcIkdFVFwiLCByZXF1ZXN0UGF0aCwgdHJ1ZSk7XHJcbiBcdFx0XHRcdHJlcXVlc3QudGltZW91dCA9IHJlcXVlc3RUaW1lb3V0O1xyXG4gXHRcdFx0XHRyZXF1ZXN0LnNlbmQobnVsbCk7XHJcbiBcdFx0XHR9IGNhdGNoKGVycikge1xyXG4gXHRcdFx0XHRyZXR1cm4gcmVqZWN0KGVycik7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRyZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gXHRcdFx0XHRpZihyZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHJldHVybjtcclxuIFx0XHRcdFx0aWYocmVxdWVzdC5zdGF0dXMgPT09IDApIHtcclxuIFx0XHRcdFx0XHQvLyB0aW1lb3V0XHJcbiBcdFx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcihcIk1hbmlmZXN0IHJlcXVlc3QgdG8gXCIgKyByZXF1ZXN0UGF0aCArIFwiIHRpbWVkIG91dC5cIikpO1xyXG4gXHRcdFx0XHR9IGVsc2UgaWYocmVxdWVzdC5zdGF0dXMgPT09IDQwNCkge1xyXG4gXHRcdFx0XHRcdC8vIG5vIHVwZGF0ZSBhdmFpbGFibGVcclxuIFx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcbiBcdFx0XHRcdH0gZWxzZSBpZihyZXF1ZXN0LnN0YXR1cyAhPT0gMjAwICYmIHJlcXVlc3Quc3RhdHVzICE9PSAzMDQpIHtcclxuIFx0XHRcdFx0XHQvLyBvdGhlciBmYWlsdXJlXHJcbiBcdFx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcihcIk1hbmlmZXN0IHJlcXVlc3QgdG8gXCIgKyByZXF1ZXN0UGF0aCArIFwiIGZhaWxlZC5cIikpO1xyXG4gXHRcdFx0XHR9IGVsc2Uge1xyXG4gXHRcdFx0XHRcdC8vIHN1Y2Nlc3NcclxuIFx0XHRcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRcdFx0dmFyIHVwZGF0ZSA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xyXG4gXHRcdFx0XHRcdH0gY2F0Y2goZSkge1xyXG4gXHRcdFx0XHRcdFx0cmVqZWN0KGUpO1xyXG4gXHRcdFx0XHRcdFx0cmV0dXJuO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRyZXNvbHZlKHVwZGF0ZSk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH07XHJcbiBcdFx0fSk7XHJcbiBcdH1cclxuXG4gXHRcclxuIFx0XHJcbiBcdHZhciBob3RBcHBseU9uVXBkYXRlID0gdHJ1ZTtcclxuIFx0dmFyIGhvdEN1cnJlbnRIYXNoID0gXCI2ZmQzMTA0MWEwMjNlNWFjNmMzZFwiOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiBcdHZhciBob3RSZXF1ZXN0VGltZW91dCA9IDEwMDAwO1xyXG4gXHR2YXIgaG90Q3VycmVudE1vZHVsZURhdGEgPSB7fTtcclxuIFx0dmFyIGhvdEN1cnJlbnRDaGlsZE1vZHVsZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHR2YXIgaG90Q3VycmVudFBhcmVudHMgPSBbXTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHR2YXIgaG90Q3VycmVudFBhcmVudHNUZW1wID0gW107IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdENyZWF0ZVJlcXVpcmUobW9kdWxlSWQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdHZhciBtZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdGlmKCFtZSkgcmV0dXJuIF9fd2VicGFja19yZXF1aXJlX187XHJcbiBcdFx0dmFyIGZuID0gZnVuY3Rpb24ocmVxdWVzdCkge1xyXG4gXHRcdFx0aWYobWUuaG90LmFjdGl2ZSkge1xyXG4gXHRcdFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW3JlcXVlc3RdKSB7XHJcbiBcdFx0XHRcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1tyZXF1ZXN0XS5wYXJlbnRzLmluZGV4T2YobW9kdWxlSWQpIDwgMClcclxuIFx0XHRcdFx0XHRcdGluc3RhbGxlZE1vZHVsZXNbcmVxdWVzdF0ucGFyZW50cy5wdXNoKG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0XHRob3RDdXJyZW50UGFyZW50cyA9IFttb2R1bGVJZF07XHJcbiBcdFx0XHRcdFx0aG90Q3VycmVudENoaWxkTW9kdWxlID0gcmVxdWVzdDtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRpZihtZS5jaGlsZHJlbi5pbmRleE9mKHJlcXVlc3QpIDwgMClcclxuIFx0XHRcdFx0XHRtZS5jaGlsZHJlbi5wdXNoKHJlcXVlc3QpO1xyXG4gXHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0Y29uc29sZS53YXJuKFwiW0hNUl0gdW5leHBlY3RlZCByZXF1aXJlKFwiICsgcmVxdWVzdCArIFwiKSBmcm9tIGRpc3Bvc2VkIG1vZHVsZSBcIiArIG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0aG90Q3VycmVudFBhcmVudHMgPSBbXTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKHJlcXVlc3QpO1xyXG4gXHRcdH07XHJcbiBcdFx0dmFyIE9iamVjdEZhY3RvcnkgPSBmdW5jdGlvbiBPYmplY3RGYWN0b3J5KG5hbWUpIHtcclxuIFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcclxuIFx0XHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuIFx0XHRcdFx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfX1tuYW1lXTtcclxuIFx0XHRcdFx0fSxcclxuIFx0XHRcdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gXHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX19bbmFtZV0gPSB2YWx1ZTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fTtcclxuIFx0XHR9O1xyXG4gXHRcdGZvcih2YXIgbmFtZSBpbiBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoX193ZWJwYWNrX3JlcXVpcmVfXywgbmFtZSkgJiYgbmFtZSAhPT0gXCJlXCIpIHtcclxuIFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCBuYW1lLCBPYmplY3RGYWN0b3J5KG5hbWUpKTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFx0Zm4uZSA9IGZ1bmN0aW9uKGNodW5rSWQpIHtcclxuIFx0XHRcdGlmKGhvdFN0YXR1cyA9PT0gXCJyZWFkeVwiKVxyXG4gXHRcdFx0XHRob3RTZXRTdGF0dXMoXCJwcmVwYXJlXCIpO1xyXG4gXHRcdFx0aG90Q2h1bmtzTG9hZGluZysrO1xyXG4gXHRcdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uZShjaHVua0lkKS50aGVuKGZpbmlzaENodW5rTG9hZGluZywgZnVuY3Rpb24oZXJyKSB7XHJcbiBcdFx0XHRcdGZpbmlzaENodW5rTG9hZGluZygpO1xyXG4gXHRcdFx0XHR0aHJvdyBlcnI7XHJcbiBcdFx0XHR9KTtcclxuIFx0XHJcbiBcdFx0XHRmdW5jdGlvbiBmaW5pc2hDaHVua0xvYWRpbmcoKSB7XHJcbiBcdFx0XHRcdGhvdENodW5rc0xvYWRpbmctLTtcclxuIFx0XHRcdFx0aWYoaG90U3RhdHVzID09PSBcInByZXBhcmVcIikge1xyXG4gXHRcdFx0XHRcdGlmKCFob3RXYWl0aW5nRmlsZXNNYXBbY2h1bmtJZF0pIHtcclxuIFx0XHRcdFx0XHRcdGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRpZihob3RDaHVua3NMb2FkaW5nID09PSAwICYmIGhvdFdhaXRpbmdGaWxlcyA9PT0gMCkge1xyXG4gXHRcdFx0XHRcdFx0aG90VXBkYXRlRG93bmxvYWRlZCgpO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH07XHJcbiBcdFx0cmV0dXJuIGZuO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RDcmVhdGVNb2R1bGUobW9kdWxlSWQpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdHZhciBob3QgPSB7XHJcbiBcdFx0XHQvLyBwcml2YXRlIHN0dWZmXHJcbiBcdFx0XHRfYWNjZXB0ZWREZXBlbmRlbmNpZXM6IHt9LFxyXG4gXHRcdFx0X2RlY2xpbmVkRGVwZW5kZW5jaWVzOiB7fSxcclxuIFx0XHRcdF9zZWxmQWNjZXB0ZWQ6IGZhbHNlLFxyXG4gXHRcdFx0X3NlbGZEZWNsaW5lZDogZmFsc2UsXHJcbiBcdFx0XHRfZGlzcG9zZUhhbmRsZXJzOiBbXSxcclxuIFx0XHRcdF9tYWluOiBob3RDdXJyZW50Q2hpbGRNb2R1bGUgIT09IG1vZHVsZUlkLFxyXG4gXHRcclxuIFx0XHRcdC8vIE1vZHVsZSBBUElcclxuIFx0XHRcdGFjdGl2ZTogdHJ1ZSxcclxuIFx0XHRcdGFjY2VwdDogZnVuY3Rpb24oZGVwLCBjYWxsYmFjaykge1xyXG4gXHRcdFx0XHRpZih0eXBlb2YgZGVwID09PSBcInVuZGVmaW5lZFwiKVxyXG4gXHRcdFx0XHRcdGhvdC5fc2VsZkFjY2VwdGVkID0gdHJ1ZTtcclxuIFx0XHRcdFx0ZWxzZSBpZih0eXBlb2YgZGVwID09PSBcImZ1bmN0aW9uXCIpXHJcbiBcdFx0XHRcdFx0aG90Ll9zZWxmQWNjZXB0ZWQgPSBkZXA7XHJcbiBcdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRlcCA9PT0gXCJvYmplY3RcIilcclxuIFx0XHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgZGVwLmxlbmd0aDsgaSsrKVxyXG4gXHRcdFx0XHRcdFx0aG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1tkZXBbaV1dID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKSB7fTtcclxuIFx0XHRcdFx0ZWxzZVxyXG4gXHRcdFx0XHRcdGhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwXSA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKCkge307XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0ZGVjbGluZTogZnVuY3Rpb24oZGVwKSB7XHJcbiBcdFx0XHRcdGlmKHR5cGVvZiBkZXAgPT09IFwidW5kZWZpbmVkXCIpXHJcbiBcdFx0XHRcdFx0aG90Ll9zZWxmRGVjbGluZWQgPSB0cnVlO1xyXG4gXHRcdFx0XHRlbHNlIGlmKHR5cGVvZiBkZXAgPT09IFwib2JqZWN0XCIpXHJcbiBcdFx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGRlcC5sZW5ndGg7IGkrKylcclxuIFx0XHRcdFx0XHRcdGhvdC5fZGVjbGluZWREZXBlbmRlbmNpZXNbZGVwW2ldXSA9IHRydWU7XHJcbiBcdFx0XHRcdGVsc2VcclxuIFx0XHRcdFx0XHRob3QuX2RlY2xpbmVkRGVwZW5kZW5jaWVzW2RlcF0gPSB0cnVlO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdGRpc3Bvc2U6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiBcdFx0XHRcdGhvdC5fZGlzcG9zZUhhbmRsZXJzLnB1c2goY2FsbGJhY2spO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdGFkZERpc3Bvc2VIYW5kbGVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gXHRcdFx0XHRob3QuX2Rpc3Bvc2VIYW5kbGVycy5wdXNoKGNhbGxiYWNrKTtcclxuIFx0XHRcdH0sXHJcbiBcdFx0XHRyZW1vdmVEaXNwb3NlSGFuZGxlcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuIFx0XHRcdFx0dmFyIGlkeCA9IGhvdC5fZGlzcG9zZUhhbmRsZXJzLmluZGV4T2YoY2FsbGJhY2spO1xyXG4gXHRcdFx0XHRpZihpZHggPj0gMCkgaG90Ll9kaXNwb3NlSGFuZGxlcnMuc3BsaWNlKGlkeCwgMSk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcclxuIFx0XHRcdC8vIE1hbmFnZW1lbnQgQVBJXHJcbiBcdFx0XHRjaGVjazogaG90Q2hlY2ssXHJcbiBcdFx0XHRhcHBseTogaG90QXBwbHksXHJcbiBcdFx0XHRzdGF0dXM6IGZ1bmN0aW9uKGwpIHtcclxuIFx0XHRcdFx0aWYoIWwpIHJldHVybiBob3RTdGF0dXM7XHJcbiBcdFx0XHRcdGhvdFN0YXR1c0hhbmRsZXJzLnB1c2gobCk7XHJcbiBcdFx0XHR9LFxyXG4gXHRcdFx0YWRkU3RhdHVzSGFuZGxlcjogZnVuY3Rpb24obCkge1xyXG4gXHRcdFx0XHRob3RTdGF0dXNIYW5kbGVycy5wdXNoKGwpO1xyXG4gXHRcdFx0fSxcclxuIFx0XHRcdHJlbW92ZVN0YXR1c0hhbmRsZXI6IGZ1bmN0aW9uKGwpIHtcclxuIFx0XHRcdFx0dmFyIGlkeCA9IGhvdFN0YXR1c0hhbmRsZXJzLmluZGV4T2YobCk7XHJcbiBcdFx0XHRcdGlmKGlkeCA+PSAwKSBob3RTdGF0dXNIYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdH0sXHJcbiBcdFxyXG4gXHRcdFx0Ly9pbmhlcml0IGZyb20gcHJldmlvdXMgZGlzcG9zZSBjYWxsXHJcbiBcdFx0XHRkYXRhOiBob3RDdXJyZW50TW9kdWxlRGF0YVttb2R1bGVJZF1cclxuIFx0XHR9O1xyXG4gXHRcdGhvdEN1cnJlbnRDaGlsZE1vZHVsZSA9IHVuZGVmaW5lZDtcclxuIFx0XHRyZXR1cm4gaG90O1xyXG4gXHR9XHJcbiBcdFxyXG4gXHR2YXIgaG90U3RhdHVzSGFuZGxlcnMgPSBbXTtcclxuIFx0dmFyIGhvdFN0YXR1cyA9IFwiaWRsZVwiO1xyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90U2V0U3RhdHVzKG5ld1N0YXR1cykge1xyXG4gXHRcdGhvdFN0YXR1cyA9IG5ld1N0YXR1cztcclxuIFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgaG90U3RhdHVzSGFuZGxlcnMubGVuZ3RoOyBpKyspXHJcbiBcdFx0XHRob3RTdGF0dXNIYW5kbGVyc1tpXS5jYWxsKG51bGwsIG5ld1N0YXR1cyk7XHJcbiBcdH1cclxuIFx0XHJcbiBcdC8vIHdoaWxlIGRvd25sb2FkaW5nXHJcbiBcdHZhciBob3RXYWl0aW5nRmlsZXMgPSAwO1xyXG4gXHR2YXIgaG90Q2h1bmtzTG9hZGluZyA9IDA7XHJcbiBcdHZhciBob3RXYWl0aW5nRmlsZXNNYXAgPSB7fTtcclxuIFx0dmFyIGhvdFJlcXVlc3RlZEZpbGVzTWFwID0ge307XHJcbiBcdHZhciBob3RBdmFpbGFibGVGaWxlc01hcCA9IHt9O1xyXG4gXHR2YXIgaG90RGVmZXJyZWQ7XHJcbiBcdFxyXG4gXHQvLyBUaGUgdXBkYXRlIGluZm9cclxuIFx0dmFyIGhvdFVwZGF0ZSwgaG90VXBkYXRlTmV3SGFzaDtcclxuIFx0XHJcbiBcdGZ1bmN0aW9uIHRvTW9kdWxlSWQoaWQpIHtcclxuIFx0XHR2YXIgaXNOdW1iZXIgPSAoK2lkKSArIFwiXCIgPT09IGlkO1xyXG4gXHRcdHJldHVybiBpc051bWJlciA/ICtpZCA6IGlkO1xyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RDaGVjayhhcHBseSkge1xyXG4gXHRcdGlmKGhvdFN0YXR1cyAhPT0gXCJpZGxlXCIpIHRocm93IG5ldyBFcnJvcihcImNoZWNrKCkgaXMgb25seSBhbGxvd2VkIGluIGlkbGUgc3RhdHVzXCIpO1xyXG4gXHRcdGhvdEFwcGx5T25VcGRhdGUgPSBhcHBseTtcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJjaGVja1wiKTtcclxuIFx0XHRyZXR1cm4gaG90RG93bmxvYWRNYW5pZmVzdChob3RSZXF1ZXN0VGltZW91dCkudGhlbihmdW5jdGlvbih1cGRhdGUpIHtcclxuIFx0XHRcdGlmKCF1cGRhdGUpIHtcclxuIFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiaWRsZVwiKTtcclxuIFx0XHRcdFx0cmV0dXJuIG51bGw7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcCA9IHt9O1xyXG4gXHRcdFx0aG90V2FpdGluZ0ZpbGVzTWFwID0ge307XHJcbiBcdFx0XHRob3RBdmFpbGFibGVGaWxlc01hcCA9IHVwZGF0ZS5jO1xyXG4gXHRcdFx0aG90VXBkYXRlTmV3SGFzaCA9IHVwZGF0ZS5oO1xyXG4gXHRcclxuIFx0XHRcdGhvdFNldFN0YXR1cyhcInByZXBhcmVcIik7XHJcbiBcdFx0XHR2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG4gXHRcdFx0XHRob3REZWZlcnJlZCA9IHtcclxuIFx0XHRcdFx0XHRyZXNvbHZlOiByZXNvbHZlLFxyXG4gXHRcdFx0XHRcdHJlamVjdDogcmVqZWN0XHJcbiBcdFx0XHRcdH07XHJcbiBcdFx0XHR9KTtcclxuIFx0XHRcdGhvdFVwZGF0ZSA9IHt9O1xyXG4gXHRcdFx0dmFyIGNodW5rSWQgPSAxO1xyXG4gXHRcdFx0eyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWxvbmUtYmxvY2tzXHJcbiBcdFx0XHRcdC8qZ2xvYmFscyBjaHVua0lkICovXHJcbiBcdFx0XHRcdGhvdEVuc3VyZVVwZGF0ZUNodW5rKGNodW5rSWQpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0aWYoaG90U3RhdHVzID09PSBcInByZXBhcmVcIiAmJiBob3RDaHVua3NMb2FkaW5nID09PSAwICYmIGhvdFdhaXRpbmdGaWxlcyA9PT0gMCkge1xyXG4gXHRcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XHJcbiBcdFx0XHR9XHJcbiBcdFx0XHRyZXR1cm4gcHJvbWlzZTtcclxuIFx0XHR9KTtcclxuIFx0fVxyXG4gXHRcclxuIFx0ZnVuY3Rpb24gaG90QWRkVXBkYXRlQ2h1bmsoY2h1bmtJZCwgbW9yZU1vZHVsZXMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gXHRcdGlmKCFob3RBdmFpbGFibGVGaWxlc01hcFtjaHVua0lkXSB8fCAhaG90UmVxdWVzdGVkRmlsZXNNYXBbY2h1bmtJZF0pXHJcbiBcdFx0XHRyZXR1cm47XHJcbiBcdFx0aG90UmVxdWVzdGVkRmlsZXNNYXBbY2h1bmtJZF0gPSBmYWxzZTtcclxuIFx0XHRmb3IodmFyIG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRob3RVcGRhdGVbbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHRpZigtLWhvdFdhaXRpbmdGaWxlcyA9PT0gMCAmJiBob3RDaHVua3NMb2FkaW5nID09PSAwKSB7XHJcbiBcdFx0XHRob3RVcGRhdGVEb3dubG9hZGVkKCk7XHJcbiBcdFx0fVxyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RFbnN1cmVVcGRhdGVDaHVuayhjaHVua0lkKSB7XHJcbiBcdFx0aWYoIWhvdEF2YWlsYWJsZUZpbGVzTWFwW2NodW5rSWRdKSB7XHJcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXNNYXBbY2h1bmtJZF0gPSB0cnVlO1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRob3RSZXF1ZXN0ZWRGaWxlc01hcFtjaHVua0lkXSA9IHRydWU7XHJcbiBcdFx0XHRob3RXYWl0aW5nRmlsZXMrKztcclxuIFx0XHRcdGhvdERvd25sb2FkVXBkYXRlQ2h1bmsoY2h1bmtJZCk7XHJcbiBcdFx0fVxyXG4gXHR9XHJcbiBcdFxyXG4gXHRmdW5jdGlvbiBob3RVcGRhdGVEb3dubG9hZGVkKCkge1xyXG4gXHRcdGhvdFNldFN0YXR1cyhcInJlYWR5XCIpO1xyXG4gXHRcdHZhciBkZWZlcnJlZCA9IGhvdERlZmVycmVkO1xyXG4gXHRcdGhvdERlZmVycmVkID0gbnVsbDtcclxuIFx0XHRpZighZGVmZXJyZWQpIHJldHVybjtcclxuIFx0XHRpZihob3RBcHBseU9uVXBkYXRlKSB7XHJcbiBcdFx0XHQvLyBXcmFwIGRlZmVycmVkIG9iamVjdCBpbiBQcm9taXNlIHRvIG1hcmsgaXQgYXMgYSB3ZWxsLWhhbmRsZWQgUHJvbWlzZSB0b1xyXG4gXHRcdFx0Ly8gYXZvaWQgdHJpZ2dlcmluZyB1bmNhdWdodCBleGNlcHRpb24gd2FybmluZyBpbiBDaHJvbWUuXHJcbiBcdFx0XHQvLyBTZWUgaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NDY1NjY2XHJcbiBcdFx0XHRQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gXHRcdFx0XHRyZXR1cm4gaG90QXBwbHkoaG90QXBwbHlPblVwZGF0ZSk7XHJcbiBcdFx0XHR9KS50aGVuKFxyXG4gXHRcdFx0XHRmdW5jdGlvbihyZXN1bHQpIHtcclxuIFx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XHJcbiBcdFx0XHRcdH0sXHJcbiBcdFx0XHRcdGZ1bmN0aW9uKGVycikge1xyXG4gXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdChlcnIpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHQpO1xyXG4gXHRcdH0gZWxzZSB7XHJcbiBcdFx0XHR2YXIgb3V0ZGF0ZWRNb2R1bGVzID0gW107XHJcbiBcdFx0XHRmb3IodmFyIGlkIGluIGhvdFVwZGF0ZSkge1xyXG4gXHRcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaG90VXBkYXRlLCBpZCkpIHtcclxuIFx0XHRcdFx0XHRvdXRkYXRlZE1vZHVsZXMucHVzaCh0b01vZHVsZUlkKGlkKSk7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHRcdGRlZmVycmVkLnJlc29sdmUob3V0ZGF0ZWRNb2R1bGVzKTtcclxuIFx0XHR9XHJcbiBcdH1cclxuIFx0XHJcbiBcdGZ1bmN0aW9uIGhvdEFwcGx5KG9wdGlvbnMpIHtcclxuIFx0XHRpZihob3RTdGF0dXMgIT09IFwicmVhZHlcIikgdGhyb3cgbmV3IEVycm9yKFwiYXBwbHkoKSBpcyBvbmx5IGFsbG93ZWQgaW4gcmVhZHkgc3RhdHVzXCIpO1xyXG4gXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG4gXHRcclxuIFx0XHR2YXIgY2I7XHJcbiBcdFx0dmFyIGk7XHJcbiBcdFx0dmFyIGo7XHJcbiBcdFx0dmFyIG1vZHVsZTtcclxuIFx0XHR2YXIgbW9kdWxlSWQ7XHJcbiBcdFxyXG4gXHRcdGZ1bmN0aW9uIGdldEFmZmVjdGVkU3R1ZmYodXBkYXRlTW9kdWxlSWQpIHtcclxuIFx0XHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbdXBkYXRlTW9kdWxlSWRdO1xyXG4gXHRcdFx0dmFyIG91dGRhdGVkRGVwZW5kZW5jaWVzID0ge307XHJcbiBcdFxyXG4gXHRcdFx0dmFyIHF1ZXVlID0gb3V0ZGF0ZWRNb2R1bGVzLnNsaWNlKCkubWFwKGZ1bmN0aW9uKGlkKSB7XHJcbiBcdFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdFx0Y2hhaW46IFtpZF0sXHJcbiBcdFx0XHRcdFx0aWQ6IGlkXHJcbiBcdFx0XHRcdH07XHJcbiBcdFx0XHR9KTtcclxuIFx0XHRcdHdoaWxlKHF1ZXVlLmxlbmd0aCA+IDApIHtcclxuIFx0XHRcdFx0dmFyIHF1ZXVlSXRlbSA9IHF1ZXVlLnBvcCgpO1xyXG4gXHRcdFx0XHR2YXIgbW9kdWxlSWQgPSBxdWV1ZUl0ZW0uaWQ7XHJcbiBcdFx0XHRcdHZhciBjaGFpbiA9IHF1ZXVlSXRlbS5jaGFpbjtcclxuIFx0XHRcdFx0bW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdGlmKCFtb2R1bGUgfHwgbW9kdWxlLmhvdC5fc2VsZkFjY2VwdGVkKVxyXG4gXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRpZihtb2R1bGUuaG90Ll9zZWxmRGVjbGluZWQpIHtcclxuIFx0XHRcdFx0XHRyZXR1cm4ge1xyXG4gXHRcdFx0XHRcdFx0dHlwZTogXCJzZWxmLWRlY2xpbmVkXCIsXHJcbiBcdFx0XHRcdFx0XHRjaGFpbjogY2hhaW4sXHJcbiBcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWRcclxuIFx0XHRcdFx0XHR9O1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGlmKG1vZHVsZS5ob3QuX21haW4pIHtcclxuIFx0XHRcdFx0XHRyZXR1cm4ge1xyXG4gXHRcdFx0XHRcdFx0dHlwZTogXCJ1bmFjY2VwdGVkXCIsXHJcbiBcdFx0XHRcdFx0XHRjaGFpbjogY2hhaW4sXHJcbiBcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWRcclxuIFx0XHRcdFx0XHR9O1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBtb2R1bGUucGFyZW50cy5sZW5ndGg7IGkrKykge1xyXG4gXHRcdFx0XHRcdHZhciBwYXJlbnRJZCA9IG1vZHVsZS5wYXJlbnRzW2ldO1xyXG4gXHRcdFx0XHRcdHZhciBwYXJlbnQgPSBpbnN0YWxsZWRNb2R1bGVzW3BhcmVudElkXTtcclxuIFx0XHRcdFx0XHRpZighcGFyZW50KSBjb250aW51ZTtcclxuIFx0XHRcdFx0XHRpZihwYXJlbnQuaG90Ll9kZWNsaW5lZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcclxuIFx0XHRcdFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdFx0XHRcdHR5cGU6IFwiZGVjbGluZWRcIixcclxuIFx0XHRcdFx0XHRcdFx0Y2hhaW46IGNoYWluLmNvbmNhdChbcGFyZW50SWRdKSxcclxuIFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxyXG4gXHRcdFx0XHRcdFx0XHRwYXJlbnRJZDogcGFyZW50SWRcclxuIFx0XHRcdFx0XHRcdH07XHJcbiBcdFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRcdGlmKG91dGRhdGVkTW9kdWxlcy5pbmRleE9mKHBhcmVudElkKSA+PSAwKSBjb250aW51ZTtcclxuIFx0XHRcdFx0XHRpZihwYXJlbnQuaG90Ll9hY2NlcHRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0pIHtcclxuIFx0XHRcdFx0XHRcdGlmKCFvdXRkYXRlZERlcGVuZGVuY2llc1twYXJlbnRJZF0pXHJcbiBcdFx0XHRcdFx0XHRcdG91dGRhdGVkRGVwZW5kZW5jaWVzW3BhcmVudElkXSA9IFtdO1xyXG4gXHRcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdLCBbbW9kdWxlSWRdKTtcclxuIFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHRkZWxldGUgb3V0ZGF0ZWREZXBlbmRlbmNpZXNbcGFyZW50SWRdO1xyXG4gXHRcdFx0XHRcdG91dGRhdGVkTW9kdWxlcy5wdXNoKHBhcmVudElkKTtcclxuIFx0XHRcdFx0XHRxdWV1ZS5wdXNoKHtcclxuIFx0XHRcdFx0XHRcdGNoYWluOiBjaGFpbi5jb25jYXQoW3BhcmVudElkXSksXHJcbiBcdFx0XHRcdFx0XHRpZDogcGFyZW50SWRcclxuIFx0XHRcdFx0XHR9KTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcclxuIFx0XHRcdHJldHVybiB7XHJcbiBcdFx0XHRcdHR5cGU6IFwiYWNjZXB0ZWRcIixcclxuIFx0XHRcdFx0bW9kdWxlSWQ6IHVwZGF0ZU1vZHVsZUlkLFxyXG4gXHRcdFx0XHRvdXRkYXRlZE1vZHVsZXM6IG91dGRhdGVkTW9kdWxlcyxcclxuIFx0XHRcdFx0b3V0ZGF0ZWREZXBlbmRlbmNpZXM6IG91dGRhdGVkRGVwZW5kZW5jaWVzXHJcbiBcdFx0XHR9O1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0ZnVuY3Rpb24gYWRkQWxsVG9TZXQoYSwgYikge1xyXG4gXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdFx0dmFyIGl0ZW0gPSBiW2ldO1xyXG4gXHRcdFx0XHRpZihhLmluZGV4T2YoaXRlbSkgPCAwKVxyXG4gXHRcdFx0XHRcdGEucHVzaChpdGVtKTtcclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIGF0IGJlZ2luIGFsbCB1cGRhdGVzIG1vZHVsZXMgYXJlIG91dGRhdGVkXHJcbiBcdFx0Ly8gdGhlIFwib3V0ZGF0ZWRcIiBzdGF0dXMgY2FuIHByb3BhZ2F0ZSB0byBwYXJlbnRzIGlmIHRoZXkgZG9uJ3QgYWNjZXB0IHRoZSBjaGlsZHJlblxyXG4gXHRcdHZhciBvdXRkYXRlZERlcGVuZGVuY2llcyA9IHt9O1xyXG4gXHRcdHZhciBvdXRkYXRlZE1vZHVsZXMgPSBbXTtcclxuIFx0XHR2YXIgYXBwbGllZFVwZGF0ZSA9IHt9O1xyXG4gXHRcclxuIFx0XHR2YXIgd2FyblVuZXhwZWN0ZWRSZXF1aXJlID0gZnVuY3Rpb24gd2FyblVuZXhwZWN0ZWRSZXF1aXJlKCkge1xyXG4gXHRcdFx0Y29uc29sZS53YXJuKFwiW0hNUl0gdW5leHBlY3RlZCByZXF1aXJlKFwiICsgcmVzdWx0Lm1vZHVsZUlkICsgXCIpIHRvIGRpc3Bvc2VkIG1vZHVsZVwiKTtcclxuIFx0XHR9O1xyXG4gXHRcclxuIFx0XHRmb3IodmFyIGlkIGluIGhvdFVwZGF0ZSkge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGhvdFVwZGF0ZSwgaWQpKSB7XHJcbiBcdFx0XHRcdG1vZHVsZUlkID0gdG9Nb2R1bGVJZChpZCk7XHJcbiBcdFx0XHRcdHZhciByZXN1bHQ7XHJcbiBcdFx0XHRcdGlmKGhvdFVwZGF0ZVtpZF0pIHtcclxuIFx0XHRcdFx0XHRyZXN1bHQgPSBnZXRBZmZlY3RlZFN0dWZmKG1vZHVsZUlkKTtcclxuIFx0XHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0XHRyZXN1bHQgPSB7XHJcbiBcdFx0XHRcdFx0XHR0eXBlOiBcImRpc3Bvc2VkXCIsXHJcbiBcdFx0XHRcdFx0XHRtb2R1bGVJZDogaWRcclxuIFx0XHRcdFx0XHR9O1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdHZhciBhYm9ydEVycm9yID0gZmFsc2U7XHJcbiBcdFx0XHRcdHZhciBkb0FwcGx5ID0gZmFsc2U7XHJcbiBcdFx0XHRcdHZhciBkb0Rpc3Bvc2UgPSBmYWxzZTtcclxuIFx0XHRcdFx0dmFyIGNoYWluSW5mbyA9IFwiXCI7XHJcbiBcdFx0XHRcdGlmKHJlc3VsdC5jaGFpbikge1xyXG4gXHRcdFx0XHRcdGNoYWluSW5mbyA9IFwiXFxuVXBkYXRlIHByb3BhZ2F0aW9uOiBcIiArIHJlc3VsdC5jaGFpbi5qb2luKFwiIC0+IFwiKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRzd2l0Y2gocmVzdWx0LnR5cGUpIHtcclxuIFx0XHRcdFx0XHRjYXNlIFwic2VsZi1kZWNsaW5lZFwiOlxyXG4gXHRcdFx0XHRcdFx0aWYob3B0aW9ucy5vbkRlY2xpbmVkKVxyXG4gXHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRGVjbGluZWQocmVzdWx0KTtcclxuIFx0XHRcdFx0XHRcdGlmKCFvcHRpb25zLmlnbm9yZURlY2xpbmVkKVxyXG4gXHRcdFx0XHRcdFx0XHRhYm9ydEVycm9yID0gbmV3IEVycm9yKFwiQWJvcnRlZCBiZWNhdXNlIG9mIHNlbGYgZGVjbGluZTogXCIgKyByZXN1bHQubW9kdWxlSWQgKyBjaGFpbkluZm8pO1xyXG4gXHRcdFx0XHRcdFx0YnJlYWs7XHJcbiBcdFx0XHRcdFx0Y2FzZSBcImRlY2xpbmVkXCI6XHJcbiBcdFx0XHRcdFx0XHRpZihvcHRpb25zLm9uRGVjbGluZWQpXHJcbiBcdFx0XHRcdFx0XHRcdG9wdGlvbnMub25EZWNsaW5lZChyZXN1bHQpO1xyXG4gXHRcdFx0XHRcdFx0aWYoIW9wdGlvbnMuaWdub3JlRGVjbGluZWQpXHJcbiBcdFx0XHRcdFx0XHRcdGFib3J0RXJyb3IgPSBuZXcgRXJyb3IoXCJBYm9ydGVkIGJlY2F1c2Ugb2YgZGVjbGluZWQgZGVwZW5kZW5jeTogXCIgKyByZXN1bHQubW9kdWxlSWQgKyBcIiBpbiBcIiArIHJlc3VsdC5wYXJlbnRJZCArIGNoYWluSW5mbyk7XHJcbiBcdFx0XHRcdFx0XHRicmVhaztcclxuIFx0XHRcdFx0XHRjYXNlIFwidW5hY2NlcHRlZFwiOlxyXG4gXHRcdFx0XHRcdFx0aWYob3B0aW9ucy5vblVuYWNjZXB0ZWQpXHJcbiBcdFx0XHRcdFx0XHRcdG9wdGlvbnMub25VbmFjY2VwdGVkKHJlc3VsdCk7XHJcbiBcdFx0XHRcdFx0XHRpZighb3B0aW9ucy5pZ25vcmVVbmFjY2VwdGVkKVxyXG4gXHRcdFx0XHRcdFx0XHRhYm9ydEVycm9yID0gbmV3IEVycm9yKFwiQWJvcnRlZCBiZWNhdXNlIFwiICsgbW9kdWxlSWQgKyBcIiBpcyBub3QgYWNjZXB0ZWRcIiArIGNoYWluSW5mbyk7XHJcbiBcdFx0XHRcdFx0XHRicmVhaztcclxuIFx0XHRcdFx0XHRjYXNlIFwiYWNjZXB0ZWRcIjpcclxuIFx0XHRcdFx0XHRcdGlmKG9wdGlvbnMub25BY2NlcHRlZClcclxuIFx0XHRcdFx0XHRcdFx0b3B0aW9ucy5vbkFjY2VwdGVkKHJlc3VsdCk7XHJcbiBcdFx0XHRcdFx0XHRkb0FwcGx5ID0gdHJ1ZTtcclxuIFx0XHRcdFx0XHRcdGJyZWFrO1xyXG4gXHRcdFx0XHRcdGNhc2UgXCJkaXNwb3NlZFwiOlxyXG4gXHRcdFx0XHRcdFx0aWYob3B0aW9ucy5vbkRpc3Bvc2VkKVxyXG4gXHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRGlzcG9zZWQocmVzdWx0KTtcclxuIFx0XHRcdFx0XHRcdGRvRGlzcG9zZSA9IHRydWU7XHJcbiBcdFx0XHRcdFx0XHRicmVhaztcclxuIFx0XHRcdFx0XHRkZWZhdWx0OlxyXG4gXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leGNlcHRpb24gdHlwZSBcIiArIHJlc3VsdC50eXBlKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRpZihhYm9ydEVycm9yKSB7XHJcbiBcdFx0XHRcdFx0aG90U2V0U3RhdHVzKFwiYWJvcnRcIik7XHJcbiBcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGFib3J0RXJyb3IpO1xyXG4gXHRcdFx0XHR9XHJcbiBcdFx0XHRcdGlmKGRvQXBwbHkpIHtcclxuIFx0XHRcdFx0XHRhcHBsaWVkVXBkYXRlW21vZHVsZUlkXSA9IGhvdFVwZGF0ZVttb2R1bGVJZF07XHJcbiBcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWRNb2R1bGVzLCByZXN1bHQub3V0ZGF0ZWRNb2R1bGVzKTtcclxuIFx0XHRcdFx0XHRmb3IobW9kdWxlSWQgaW4gcmVzdWx0Lm91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XHJcbiBcdFx0XHRcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVzdWx0Lm91dGRhdGVkRGVwZW5kZW5jaWVzLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0XHRcdFx0aWYoIW91dGRhdGVkRGVwZW5kZW5jaWVzW21vZHVsZUlkXSlcclxuIFx0XHRcdFx0XHRcdFx0XHRvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF0gPSBbXTtcclxuIFx0XHRcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdLCByZXN1bHQub3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdKTtcclxuIFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdFx0aWYoZG9EaXNwb3NlKSB7XHJcbiBcdFx0XHRcdFx0YWRkQWxsVG9TZXQob3V0ZGF0ZWRNb2R1bGVzLCBbcmVzdWx0Lm1vZHVsZUlkXSk7XHJcbiBcdFx0XHRcdFx0YXBwbGllZFVwZGF0ZVttb2R1bGVJZF0gPSB3YXJuVW5leHBlY3RlZFJlcXVpcmU7XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIFN0b3JlIHNlbGYgYWNjZXB0ZWQgb3V0ZGF0ZWQgbW9kdWxlcyB0byByZXF1aXJlIHRoZW0gbGF0ZXIgYnkgdGhlIG1vZHVsZSBzeXN0ZW1cclxuIFx0XHR2YXIgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzID0gW107XHJcbiBcdFx0Zm9yKGkgPSAwOyBpIDwgb3V0ZGF0ZWRNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRtb2R1bGVJZCA9IG91dGRhdGVkTW9kdWxlc1tpXTtcclxuIFx0XHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdICYmIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmhvdC5fc2VsZkFjY2VwdGVkKVxyXG4gXHRcdFx0XHRvdXRkYXRlZFNlbGZBY2NlcHRlZE1vZHVsZXMucHVzaCh7XHJcbiBcdFx0XHRcdFx0bW9kdWxlOiBtb2R1bGVJZCxcclxuIFx0XHRcdFx0XHRlcnJvckhhbmRsZXI6IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmhvdC5fc2VsZkFjY2VwdGVkXHJcbiBcdFx0XHRcdH0pO1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gTm93IGluIFwiZGlzcG9zZVwiIHBoYXNlXHJcbiBcdFx0aG90U2V0U3RhdHVzKFwiZGlzcG9zZVwiKTtcclxuIFx0XHRPYmplY3Qua2V5cyhob3RBdmFpbGFibGVGaWxlc01hcCkuZm9yRWFjaChmdW5jdGlvbihjaHVua0lkKSB7XHJcbiBcdFx0XHRpZihob3RBdmFpbGFibGVGaWxlc01hcFtjaHVua0lkXSA9PT0gZmFsc2UpIHtcclxuIFx0XHRcdFx0aG90RGlzcG9zZUNodW5rKGNodW5rSWQpO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH0pO1xyXG4gXHRcclxuIFx0XHR2YXIgaWR4O1xyXG4gXHRcdHZhciBxdWV1ZSA9IG91dGRhdGVkTW9kdWxlcy5zbGljZSgpO1xyXG4gXHRcdHdoaWxlKHF1ZXVlLmxlbmd0aCA+IDApIHtcclxuIFx0XHRcdG1vZHVsZUlkID0gcXVldWUucG9wKCk7XHJcbiBcdFx0XHRtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdGlmKCFtb2R1bGUpIGNvbnRpbnVlO1xyXG4gXHRcclxuIFx0XHRcdHZhciBkYXRhID0ge307XHJcbiBcdFxyXG4gXHRcdFx0Ly8gQ2FsbCBkaXNwb3NlIGhhbmRsZXJzXHJcbiBcdFx0XHR2YXIgZGlzcG9zZUhhbmRsZXJzID0gbW9kdWxlLmhvdC5fZGlzcG9zZUhhbmRsZXJzO1xyXG4gXHRcdFx0Zm9yKGogPSAwOyBqIDwgZGlzcG9zZUhhbmRsZXJzLmxlbmd0aDsgaisrKSB7XHJcbiBcdFx0XHRcdGNiID0gZGlzcG9zZUhhbmRsZXJzW2pdO1xyXG4gXHRcdFx0XHRjYihkYXRhKTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdGhvdEN1cnJlbnRNb2R1bGVEYXRhW21vZHVsZUlkXSA9IGRhdGE7XHJcbiBcdFxyXG4gXHRcdFx0Ly8gZGlzYWJsZSBtb2R1bGUgKHRoaXMgZGlzYWJsZXMgcmVxdWlyZXMgZnJvbSB0aGlzIG1vZHVsZSlcclxuIFx0XHRcdG1vZHVsZS5ob3QuYWN0aXZlID0gZmFsc2U7XHJcbiBcdFxyXG4gXHRcdFx0Ly8gcmVtb3ZlIG1vZHVsZSBmcm9tIGNhY2hlXHJcbiBcdFx0XHRkZWxldGUgaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFxyXG4gXHRcdFx0Ly8gcmVtb3ZlIFwicGFyZW50c1wiIHJlZmVyZW5jZXMgZnJvbSBhbGwgY2hpbGRyZW5cclxuIFx0XHRcdGZvcihqID0gMDsgaiA8IG1vZHVsZS5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xyXG4gXHRcdFx0XHR2YXIgY2hpbGQgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZS5jaGlsZHJlbltqXV07XHJcbiBcdFx0XHRcdGlmKCFjaGlsZCkgY29udGludWU7XHJcbiBcdFx0XHRcdGlkeCA9IGNoaWxkLnBhcmVudHMuaW5kZXhPZihtb2R1bGVJZCk7XHJcbiBcdFx0XHRcdGlmKGlkeCA+PSAwKSB7XHJcbiBcdFx0XHRcdFx0Y2hpbGQucGFyZW50cy5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gcmVtb3ZlIG91dGRhdGVkIGRlcGVuZGVuY3kgZnJvbSBtb2R1bGUgY2hpbGRyZW5cclxuIFx0XHR2YXIgZGVwZW5kZW5jeTtcclxuIFx0XHR2YXIgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXM7XHJcbiBcdFx0Zm9yKG1vZHVsZUlkIGluIG91dGRhdGVkRGVwZW5kZW5jaWVzKSB7XHJcbiBcdFx0XHRpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3V0ZGF0ZWREZXBlbmRlbmNpZXMsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXTtcclxuIFx0XHRcdFx0aWYobW9kdWxlKSB7XHJcbiBcdFx0XHRcdFx0bW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMgPSBvdXRkYXRlZERlcGVuZGVuY2llc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdFx0Zm9yKGogPSAwOyBqIDwgbW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMubGVuZ3RoOyBqKyspIHtcclxuIFx0XHRcdFx0XHRcdGRlcGVuZGVuY3kgPSBtb2R1bGVPdXRkYXRlZERlcGVuZGVuY2llc1tqXTtcclxuIFx0XHRcdFx0XHRcdGlkeCA9IG1vZHVsZS5jaGlsZHJlbi5pbmRleE9mKGRlcGVuZGVuY3kpO1xyXG4gXHRcdFx0XHRcdFx0aWYoaWR4ID49IDApIG1vZHVsZS5jaGlsZHJlbi5zcGxpY2UoaWR4LCAxKTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIE5vdCBpbiBcImFwcGx5XCIgcGhhc2VcclxuIFx0XHRob3RTZXRTdGF0dXMoXCJhcHBseVwiKTtcclxuIFx0XHJcbiBcdFx0aG90Q3VycmVudEhhc2ggPSBob3RVcGRhdGVOZXdIYXNoO1xyXG4gXHRcclxuIFx0XHQvLyBpbnNlcnQgbmV3IGNvZGVcclxuIFx0XHRmb3IobW9kdWxlSWQgaW4gYXBwbGllZFVwZGF0ZSkge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFwcGxpZWRVcGRhdGUsIG1vZHVsZUlkKSkge1xyXG4gXHRcdFx0XHRtb2R1bGVzW21vZHVsZUlkXSA9IGFwcGxpZWRVcGRhdGVbbW9kdWxlSWRdO1xyXG4gXHRcdFx0fVxyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0Ly8gY2FsbCBhY2NlcHQgaGFuZGxlcnNcclxuIFx0XHR2YXIgZXJyb3IgPSBudWxsO1xyXG4gXHRcdGZvcihtb2R1bGVJZCBpbiBvdXRkYXRlZERlcGVuZGVuY2llcykge1xyXG4gXHRcdFx0aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG91dGRhdGVkRGVwZW5kZW5jaWVzLCBtb2R1bGVJZCkpIHtcclxuIFx0XHRcdFx0bW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF07XHJcbiBcdFx0XHRcdG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzID0gb3V0ZGF0ZWREZXBlbmRlbmNpZXNbbW9kdWxlSWRdO1xyXG4gXHRcdFx0XHR2YXIgY2FsbGJhY2tzID0gW107XHJcbiBcdFx0XHRcdGZvcihpID0gMDsgaSA8IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHRcdFx0ZGVwZW5kZW5jeSA9IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzW2ldO1xyXG4gXHRcdFx0XHRcdGNiID0gbW9kdWxlLmhvdC5fYWNjZXB0ZWREZXBlbmRlbmNpZXNbZGVwZW5kZW5jeV07XHJcbiBcdFx0XHRcdFx0aWYoY2FsbGJhY2tzLmluZGV4T2YoY2IpID49IDApIGNvbnRpbnVlO1xyXG4gXHRcdFx0XHRcdGNhbGxiYWNrcy5wdXNoKGNiKTtcclxuIFx0XHRcdFx0fVxyXG4gXHRcdFx0XHRmb3IoaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcclxuIFx0XHRcdFx0XHRjYiA9IGNhbGxiYWNrc1tpXTtcclxuIFx0XHRcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRcdFx0Y2IobW9kdWxlT3V0ZGF0ZWREZXBlbmRlbmNpZXMpO1xyXG4gXHRcdFx0XHRcdH0gY2F0Y2goZXJyKSB7XHJcbiBcdFx0XHRcdFx0XHRpZihvcHRpb25zLm9uRXJyb3JlZCkge1xyXG4gXHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRXJyb3JlZCh7XHJcbiBcdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJhY2NlcHQtZXJyb3JlZFwiLFxyXG4gXHRcdFx0XHRcdFx0XHRcdG1vZHVsZUlkOiBtb2R1bGVJZCxcclxuIFx0XHRcdFx0XHRcdFx0XHRkZXBlbmRlbmN5SWQ6IG1vZHVsZU91dGRhdGVkRGVwZW5kZW5jaWVzW2ldLFxyXG4gXHRcdFx0XHRcdFx0XHRcdGVycm9yOiBlcnJcclxuIFx0XHRcdFx0XHRcdFx0fSk7XHJcbiBcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0XHRpZighb3B0aW9ucy5pZ25vcmVFcnJvcmVkKSB7XHJcbiBcdFx0XHRcdFx0XHRcdGlmKCFlcnJvcilcclxuIFx0XHRcdFx0XHRcdFx0XHRlcnJvciA9IGVycjtcclxuIFx0XHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIExvYWQgc2VsZiBhY2NlcHRlZCBtb2R1bGVzXHJcbiBcdFx0Zm9yKGkgPSAwOyBpIDwgb3V0ZGF0ZWRTZWxmQWNjZXB0ZWRNb2R1bGVzLmxlbmd0aDsgaSsrKSB7XHJcbiBcdFx0XHR2YXIgaXRlbSA9IG91dGRhdGVkU2VsZkFjY2VwdGVkTW9kdWxlc1tpXTtcclxuIFx0XHRcdG1vZHVsZUlkID0gaXRlbS5tb2R1bGU7XHJcbiBcdFx0XHRob3RDdXJyZW50UGFyZW50cyA9IFttb2R1bGVJZF07XHJcbiBcdFx0XHR0cnkge1xyXG4gXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKTtcclxuIFx0XHRcdH0gY2F0Y2goZXJyKSB7XHJcbiBcdFx0XHRcdGlmKHR5cGVvZiBpdGVtLmVycm9ySGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiBcdFx0XHRcdFx0dHJ5IHtcclxuIFx0XHRcdFx0XHRcdGl0ZW0uZXJyb3JIYW5kbGVyKGVycik7XHJcbiBcdFx0XHRcdFx0fSBjYXRjaChlcnIyKSB7XHJcbiBcdFx0XHRcdFx0XHRpZihvcHRpb25zLm9uRXJyb3JlZCkge1xyXG4gXHRcdFx0XHRcdFx0XHRvcHRpb25zLm9uRXJyb3JlZCh7XHJcbiBcdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJzZWxmLWFjY2VwdC1lcnJvci1oYW5kbGVyLWVycm9yZWRcIixcclxuIFx0XHRcdFx0XHRcdFx0XHRtb2R1bGVJZDogbW9kdWxlSWQsXHJcbiBcdFx0XHRcdFx0XHRcdFx0ZXJyb3I6IGVycjIsXHJcbiBcdFx0XHRcdFx0XHRcdFx0b3JnaW5hbEVycm9yOiBlcnJcclxuIFx0XHRcdFx0XHRcdFx0fSk7XHJcbiBcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0XHRpZighb3B0aW9ucy5pZ25vcmVFcnJvcmVkKSB7XHJcbiBcdFx0XHRcdFx0XHRcdGlmKCFlcnJvcilcclxuIFx0XHRcdFx0XHRcdFx0XHRlcnJvciA9IGVycjI7XHJcbiBcdFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0XHRpZighZXJyb3IpXHJcbiBcdFx0XHRcdFx0XHRcdGVycm9yID0gZXJyO1xyXG4gXHRcdFx0XHRcdH1cclxuIFx0XHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0XHRpZihvcHRpb25zLm9uRXJyb3JlZCkge1xyXG4gXHRcdFx0XHRcdFx0b3B0aW9ucy5vbkVycm9yZWQoe1xyXG4gXHRcdFx0XHRcdFx0XHR0eXBlOiBcInNlbGYtYWNjZXB0LWVycm9yZWRcIixcclxuIFx0XHRcdFx0XHRcdFx0bW9kdWxlSWQ6IG1vZHVsZUlkLFxyXG4gXHRcdFx0XHRcdFx0XHRlcnJvcjogZXJyXHJcbiBcdFx0XHRcdFx0XHR9KTtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdFx0aWYoIW9wdGlvbnMuaWdub3JlRXJyb3JlZCkge1xyXG4gXHRcdFx0XHRcdFx0aWYoIWVycm9yKVxyXG4gXHRcdFx0XHRcdFx0XHRlcnJvciA9IGVycjtcclxuIFx0XHRcdFx0XHR9XHJcbiBcdFx0XHRcdH1cclxuIFx0XHRcdH1cclxuIFx0XHR9XHJcbiBcdFxyXG4gXHRcdC8vIGhhbmRsZSBlcnJvcnMgaW4gYWNjZXB0IGhhbmRsZXJzIGFuZCBzZWxmIGFjY2VwdGVkIG1vZHVsZSBsb2FkXHJcbiBcdFx0aWYoZXJyb3IpIHtcclxuIFx0XHRcdGhvdFNldFN0YXR1cyhcImZhaWxcIik7XHJcbiBcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xyXG4gXHRcdH1cclxuIFx0XHJcbiBcdFx0aG90U2V0U3RhdHVzKFwiaWRsZVwiKTtcclxuIFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xyXG4gXHRcdFx0cmVzb2x2ZShvdXRkYXRlZE1vZHVsZXMpO1xyXG4gXHRcdH0pO1xyXG4gXHR9XHJcblxuIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aG90OiBob3RDcmVhdGVNb2R1bGUobW9kdWxlSWQpLFxuIFx0XHRcdHBhcmVudHM6IChob3RDdXJyZW50UGFyZW50c1RlbXAgPSBob3RDdXJyZW50UGFyZW50cywgaG90Q3VycmVudFBhcmVudHMgPSBbXSwgaG90Q3VycmVudFBhcmVudHNUZW1wKSxcbiBcdFx0XHRjaGlsZHJlbjogW11cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgaG90Q3JlYXRlUmVxdWlyZShtb2R1bGVJZCkpO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBfX3dlYnBhY2tfaGFzaF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmggPSBmdW5jdGlvbigpIHsgcmV0dXJuIGhvdEN1cnJlbnRIYXNoOyB9O1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBob3RDcmVhdGVSZXF1aXJlKDIwKShfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAyMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNmZkMzEwNDFhMDIzZTVhYzZjM2QiLCIhZnVuY3Rpb24odCxlKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz1lKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImFsZnJpZFwiLFtdLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP2V4cG9ydHMuYWxmcmlkPWUoKTp0LmFsZnJpZD1lKCl9KHRoaXMsZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24odCl7ZnVuY3Rpb24gZShuKXtpZihyW25dKXJldHVybiByW25dLmV4cG9ydHM7dmFyIGE9cltuXT17ZXhwb3J0czp7fSxpZDpuLGxvYWRlZDohMX07cmV0dXJuIHRbbl0uY2FsbChhLmV4cG9ydHMsYSxhLmV4cG9ydHMsZSksYS5sb2FkZWQ9ITAsYS5leHBvcnRzfXZhciByPXt9O3JldHVybiBlLm09dCxlLmM9cixlLnA9XCJcIixlKDApfShbZnVuY3Rpb24odCxlLHIpe3QuZXhwb3J0cz1yKDg2KX0sZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtlLl9fZXNNb2R1bGU9ITAsZS5kZWZhdWx0PWZ1bmN0aW9uKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX19LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19ZS5fX2VzTW9kdWxlPSEwO3ZhciBhPXIoMTE4KSxpPW4oYSk7ZS5kZWZhdWx0PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0LGUpe2Zvcih2YXIgcj0wO3I8ZS5sZW5ndGg7cisrKXt2YXIgbj1lW3JdO24uZW51bWVyYWJsZT1uLmVudW1lcmFibGV8fCExLG4uY29uZmlndXJhYmxlPSEwLFwidmFsdWVcImluIG4mJihuLndyaXRhYmxlPSEwKSwoMCxpLmRlZmF1bHQpKHQsbi5rZXksbil9fXJldHVybiBmdW5jdGlvbihlLHIsbil7cmV0dXJuIHImJnQoZS5wcm90b3R5cGUsciksbiYmdChlLG4pLGV9fSgpfSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoMSksaT1uKGEpLHU9cigyKSxvPW4odSkscz1yKDgpLGw9bihzKSxmPXIoMTE0KSxoPW4oZiksYz1yKDExMyksZD1uKGMpLHY9cigxMTUpLF89bih2KSxtPXIoMTE2KSxwPW4obSksTT1yKDY2KSx4PShuKE0pLHIoMTA5KSksZz1uKHgpLEU9dm9pZCAwLGI9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7KDAsaS5kZWZhdWx0KSh0aGlzLHQpLHRoaXMuY2FudmFzLHRoaXMuX3ZpZXdwb3J0PVswLDAsMCwwXSx0aGlzLl9lbmFibGVkVmVydGV4QXR0cmlidXRlPVtdLHRoaXMuaWRlbnRpdHlNYXRyaXg9bC5kZWZhdWx0Lm1hdDQuY3JlYXRlKCksdGhpcy5fbm9ybWFsTWF0cml4PWwuZGVmYXVsdC5tYXQzLmNyZWF0ZSgpLHRoaXMuX2ludmVyc2VNb2RlbFZpZXdNYXRyaXg9bC5kZWZhdWx0Lm1hdDMuY3JlYXRlKCksdGhpcy5fbW9kZWxNYXRyaXg9bC5kZWZhdWx0Lm1hdDQuY3JlYXRlKCksdGhpcy5fbWF0cml4PWwuZGVmYXVsdC5tYXQ0LmNyZWF0ZSgpLHRoaXMuX2xhc3RNZXNoPW51bGwsdGhpcy5fdXNlV2ViR0wyPSExLHRoaXMuX2hhc0FycmF5SW5zdGFuY2UsdGhpcy5fZXh0QXJyYXlJbnN0YW5jZSx0aGlzLl9oYXNDaGVja2VkRXh0PSExLGwuZGVmYXVsdC5tYXQ0LmlkZW50aXR5KHRoaXMuaWRlbnRpdHlNYXRyaXgsdGhpcy5pZGVudGl0eU1hdHJpeCksdGhpcy5pc01vYmlsZT0hMSwvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkmJih0aGlzLmlzTW9iaWxlPSEwKX1yZXR1cm4oMCxvLmRlZmF1bHQpKHQsW3trZXk6XCJpbml0XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9YXJndW1lbnRzLmxlbmd0aDw9MXx8dm9pZCAwPT09YXJndW1lbnRzWzFdP3t9OmFyZ3VtZW50c1sxXTtpZihudWxsPT09dHx8dm9pZCAwPT09dClyZXR1cm4gdm9pZCBjb25zb2xlLmVycm9yKFwiQ2FudmFzIG5vdCBleGlzdFwiKTt2b2lkIDAhPT10aGlzLmNhbnZhcyYmbnVsbCE9PXRoaXMuY2FudmFzJiZ0aGlzLmRlc3Ryb3koKSx0aGlzLmNhbnZhcz10LHRoaXMuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCx3aW5kb3cuaW5uZXJIZWlnaHQpO3ZhciByPXZvaWQgMDtlLmlnbm9yZVdlYmdsMj9yPXRoaXMuY2FudmFzLmdldENvbnRleHQoXCJ3ZWJnbFwiLGUpfHx0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIsZSk6KHI9dGhpcy5jYW52YXMuZ2V0Q29udGV4dChcImV4cGVyaW1lbnRhbC13ZWJnbDJcIixlKXx8dGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIndlYmdsMlwiLGUpLHI/dGhpcy5fdXNlV2ViR0wyPSEwOnI9dGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIndlYmdsXCIsZSl8fHRoaXMuY2FudmFzLmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIixlKSksY29uc29sZS5sb2coXCJVc2luZyBXZWJHTCAyID9cIix0aGlzLndlYmdsMiksdGhpcy5pbml0V2l0aEdMKHIpfX0se2tleTpcImluaXRXaXRoR0xcIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLmNhbnZhc3x8KHRoaXMuY2FudmFzPXQuY2FudmFzKSxFPXRoaXMuZ2w9dCx0aGlzLmV4dGVuc2lvbnM9e307Zm9yKHZhciBlPTA7ZTxnLmRlZmF1bHQubGVuZ3RoO2UrKyl0aGlzLmV4dGVuc2lvbnNbZy5kZWZhdWx0W2VdXT1FLmdldEV4dGVuc2lvbihnLmRlZmF1bHRbZV0pOygwLGQuZGVmYXVsdCkoKSwoMCxoLmRlZmF1bHQpKEUsXCJPRVNfdmVydGV4X2FycmF5X29iamVjdFwiKSwoMCxoLmRlZmF1bHQpKEUsXCJBTkdMRV9pbnN0YW5jZWRfYXJyYXlzXCIpLCgwLGguZGVmYXVsdCkoRSxcIldFQkdMX2RyYXdfYnVmZmVyc1wiKSx0aGlzLmVuYWJsZSh0aGlzLkRFUFRIX1RFU1QpLHRoaXMuZW5hYmxlKHRoaXMuQ1VMTF9GQUNFKSx0aGlzLmVuYWJsZSh0aGlzLkJMRU5EKSx0aGlzLmVuYWJsZUFscGhhQmxlbmRpbmcoKX19LHtrZXk6XCJzZXRWaWV3cG9ydFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxyLG4pe3ZhciBhPSExO3QhPT10aGlzLl92aWV3cG9ydFswXSYmKGE9ITApLGUhPT10aGlzLl92aWV3cG9ydFsxXSYmKGE9ITApLHIhPT10aGlzLl92aWV3cG9ydFsyXSYmKGE9ITApLG4hPT10aGlzLl92aWV3cG9ydFszXSYmKGE9ITApLGEmJihFLnZpZXdwb3J0KHQsZSxyLG4pLHRoaXMuX3ZpZXdwb3J0PVt0LGUscixuXSl9fSx7a2V5Olwic2Npc3NvclwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxyLG4pe0Uuc2Npc3Nvcih0LGUscixuKX19LHtrZXk6XCJjbGVhclwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxyLG4pe0UuY2xlYXJDb2xvcih0LGUscixuKSxFLmNsZWFyKEUuQ09MT1JfQlVGRkVSX0JJVHxFLkRFUFRIX0JVRkZFUl9CSVQpfX0se2tleTpcInNldE1hdHJpY2VzXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5jYW1lcmE9dCx0aGlzLnJvdGF0ZSh0aGlzLmlkZW50aXR5TWF0cml4KX19LHtrZXk6XCJ1c2VTaGFkZXJcIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLnNoYWRlcj10LHRoaXMuc2hhZGVyUHJvZ3JhbT10aGlzLnNoYWRlci5zaGFkZXJQcm9ncmFtfX0se2tleTpcInJvdGF0ZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe2wuZGVmYXVsdC5tYXQ0LmNvcHkodGhpcy5fbW9kZWxNYXRyaXgsdCksbC5kZWZhdWx0Lm1hdDQubXVsdGlwbHkodGhpcy5fbWF0cml4LHRoaXMuY2FtZXJhLm1hdHJpeCx0aGlzLl9tb2RlbE1hdHJpeCksbC5kZWZhdWx0Lm1hdDMuZnJvbU1hdDQodGhpcy5fbm9ybWFsTWF0cml4LHRoaXMuX21hdHJpeCksbC5kZWZhdWx0Lm1hdDMuaW52ZXJ0KHRoaXMuX25vcm1hbE1hdHJpeCx0aGlzLl9ub3JtYWxNYXRyaXgpLGwuZGVmYXVsdC5tYXQzLnRyYW5zcG9zZSh0aGlzLl9ub3JtYWxNYXRyaXgsdGhpcy5fbm9ybWFsTWF0cml4KSxsLmRlZmF1bHQubWF0My5mcm9tTWF0NCh0aGlzLl9pbnZlcnNlTW9kZWxWaWV3TWF0cml4LHRoaXMuX21hdHJpeCksbC5kZWZhdWx0Lm1hdDMuaW52ZXJ0KHRoaXMuX2ludmVyc2VNb2RlbFZpZXdNYXRyaXgsdGhpcy5faW52ZXJzZU1vZGVsVmlld01hdHJpeCl9fSx7a2V5OlwiZHJhd1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7aWYodC5sZW5ndGgpZm9yKHZhciByPTA7cjx0Lmxlbmd0aDtyKyspdGhpcy5kcmF3KHRbcl0pO2Vsc2V7dC5iaW5kKHRoaXMuc2hhZGVyUHJvZ3JhbSksdm9pZCAwIT09dGhpcy5jYW1lcmEmJih0aGlzLnNoYWRlci51bmlmb3JtKFwidVByb2plY3Rpb25NYXRyaXhcIixcIm1hdDRcIix0aGlzLmNhbWVyYS5wcm9qZWN0aW9uKSx0aGlzLnNoYWRlci51bmlmb3JtKFwidVZpZXdNYXRyaXhcIixcIm1hdDRcIix0aGlzLmNhbWVyYS5tYXRyaXgpKSx0aGlzLnNoYWRlci51bmlmb3JtKFwidU1vZGVsTWF0cml4XCIsXCJtYXQ0XCIsdGhpcy5fbW9kZWxNYXRyaXgpLHRoaXMuc2hhZGVyLnVuaWZvcm0oXCJ1Tm9ybWFsTWF0cml4XCIsXCJtYXQzXCIsdGhpcy5fbm9ybWFsTWF0cml4KSx0aGlzLnNoYWRlci51bmlmb3JtKFwidU1vZGVsVmlld01hdHJpeEludmVyc2VcIixcIm1hdDNcIix0aGlzLl9pbnZlcnNlTW9kZWxWaWV3TWF0cml4KTt2YXIgbj10LmRyYXdUeXBlO3ZvaWQgMCE9PWUmJihuPWUpLHQuaXNJbnN0YW5jZWQ/RS5kcmF3RWxlbWVudHNJbnN0YW5jZWQodC5kcmF3VHlwZSx0LmlCdWZmZXIubnVtSXRlbXMsRS5VTlNJR05FRF9TSE9SVCwwLHQubnVtSW5zdGFuY2UpOm49PT1FLlBPSU5UUz9FLmRyYXdBcnJheXMobiwwLHQudmVydGV4U2l6ZSk6RS5kcmF3RWxlbWVudHMobix0LmlCdWZmZXIubnVtSXRlbXMsRS5VTlNJR05FRF9TSE9SVCwwKSx0LnVuYmluZCgpfX19LHtrZXk6XCJkcmF3VHJhbnNmb3JtRmVlZGJhY2tcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10Lm1lc2hTb3VyY2Uscj10Lm1lc2hEZXN0aW5hdGlvbixuPXQubnVtUG9pbnRzLGE9dC50cmFuc2Zvcm1GZWVkYmFjaztlLmJpbmQodGhpcy5zaGFkZXJQcm9ncmFtKSxyLmdlbmVyYXRlQnVmZmVycyh0aGlzLnNoYWRlclByb2dyYW0pLEUuYmluZFRyYW5zZm9ybUZlZWRiYWNrKEUuVFJBTlNGT1JNX0ZFRURCQUNLLGEpLHIuYXR0cmlidXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHQsZSl7RS5iaW5kQnVmZmVyQmFzZShFLlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVIsZSx0LmJ1ZmZlcil9KSxFLmVuYWJsZShFLlJBU1RFUklaRVJfRElTQ0FSRCksRS5iZWdpblRyYW5zZm9ybUZlZWRiYWNrKEUuUE9JTlRTKSxFLmRyYXdBcnJheXMoRS5QT0lOVFMsMCxuKSxFLmVuZFRyYW5zZm9ybUZlZWRiYWNrKCksRS5kaXNhYmxlKEUuUkFTVEVSSVpFUl9ESVNDQVJEKSxFLnVzZVByb2dyYW0obnVsbCksRS5iaW5kQnVmZmVyKEUuQVJSQVlfQlVGRkVSLG51bGwpLHIuYXR0cmlidXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHQsZSl7RS5iaW5kQnVmZmVyQmFzZShFLlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVIsZSxudWxsKX0pLEUuYmluZFRyYW5zZm9ybUZlZWRiYWNrKEUuVFJBTlNGT1JNX0ZFRURCQUNLLG51bGwpLGUudW5iaW5kKCl9fSx7a2V5Olwic2V0U2l6ZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dGhpcy5fd2lkdGg9dCx0aGlzLl9oZWlnaHQ9ZSx0aGlzLmNhbnZhcy53aWR0aD10aGlzLl93aWR0aCx0aGlzLmNhbnZhcy5oZWlnaHQ9dGhpcy5faGVpZ2h0LHRoaXMuX2FzcGVjdFJhdGlvPXRoaXMuX3dpZHRoL3RoaXMuX2hlaWdodCxFJiZ0aGlzLnZpZXdwb3J0KDAsMCx0aGlzLl93aWR0aCx0aGlzLl9oZWlnaHQpfX0se2tleTpcInNob3dFeHRlbnNpb25zXCIsdmFsdWU6ZnVuY3Rpb24oKXtjb25zb2xlLmxvZyhcIkV4dGVuc2lvbnMgOiBcIix0aGlzLmV4dGVuc2lvbnMpO2Zvcih2YXIgdCBpbiB0aGlzLmV4dGVuc2lvbnMpdGhpcy5leHRlbnNpb25zW3RdJiZjb25zb2xlLmxvZyh0LFwiOlwiLHRoaXMuZXh0ZW5zaW9uc1t0XSl9fSx7a2V5OlwiY2hlY2tFeHRlbnNpb25cIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4hIXRoaXMuZXh0ZW5zaW9uc1t0XX19LHtrZXk6XCJnZXRFeHRlbnNpb25cIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy5leHRlbnNpb25zW3RdfX0se2tleTpcImVuYWJsZUFscGhhQmxlbmRpbmdcIix2YWx1ZTpmdW5jdGlvbigpe0UuYmxlbmRGdW5jKEUuU1JDX0FMUEhBLEUuT05FX01JTlVTX1NSQ19BTFBIQSl9fSx7a2V5OlwiZW5hYmxlQWRkaXRpdmVCbGVuZGluZ1wiLHZhbHVlOmZ1bmN0aW9uKCl7RS5ibGVuZEZ1bmMoRS5PTkUsRS5PTkUpfX0se2tleTpcImVuYWJsZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe0UuZW5hYmxlKHQpfX0se2tleTpcImRpc2FibGVcIix2YWx1ZTpmdW5jdGlvbih0KXtFLmRpc2FibGUodCl9fSx7a2V5Olwidmlld3BvcnRcIix2YWx1ZTpmdW5jdGlvbih0LGUscixuKXt0aGlzLnNldFZpZXdwb3J0KHQsZSxyLG4pfX0se2tleTpcImRlc3Ryb3lcIix2YWx1ZTpmdW5jdGlvbigpe2lmKHRoaXMuY2FudmFzLnBhcmVudE5vZGUpdHJ5e3RoaXMuY2FudmFzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jYW52YXMpfWNhdGNoKHQpe2NvbnNvbGUubG9nKFwiRXJyb3IgOiBcIix0KX10aGlzLmNhbnZhcz1udWxsfX0se2tleTpcIkZMT0FUXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuKDAsXy5kZWZhdWx0KSgpfX0se2tleTpcIkhBTEZfRkxPQVRcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4oMCxwLmRlZmF1bHQpKCl9fSx7a2V5Olwid2lkdGhcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fd2lkdGh9fSx7a2V5OlwiaGVpZ2h0XCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2hlaWdodH19LHtrZXk6XCJhc3BlY3RSYXRpb1wiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9hc3BlY3RSYXRpb319LHtrZXk6XCJ3ZWJnbDJcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdXNlV2ViR0wyfX1dKSx0fSgpLHk9bmV3IGI7ZS5kZWZhdWx0PXksdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe3QuZXhwb3J0cz17XCJkZWZhdWx0XCI6cigxMjgpLF9fZXNNb2R1bGU6ITB9fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fWUuX19lc01vZHVsZT0hMDt2YXIgYT1yKDEyMCksaT1uKGEpLHU9cigxMTcpLG89bih1KSxzPXIoMzgpLGw9bihzKTtlLmRlZmF1bHQ9ZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBlJiZudWxsIT09ZSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIisoXCJ1bmRlZmluZWRcIj09dHlwZW9mIGU/XCJ1bmRlZmluZWRcIjooMCxsLmRlZmF1bHQpKGUpKSk7dC5wcm90b3R5cGU9KDAsby5kZWZhdWx0KShlJiZlLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOnQsZW51bWVyYWJsZTohMSx3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITB9fSksZSYmKGkuZGVmYXVsdD8oMCxpLmRlZmF1bHQpKHQsZSk6dC5fX3Byb3RvX189ZSl9fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fWUuX19lc01vZHVsZT0hMDt2YXIgYT1yKDM4KSxpPW4oYSk7ZS5kZWZhdWx0PWZ1bmN0aW9uKHQsZSl7aWYoIXQpdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO3JldHVybiFlfHxcIm9iamVjdFwiIT09KFwidW5kZWZpbmVkXCI9PXR5cGVvZiBlP1widW5kZWZpbmVkXCI6KDAsaS5kZWZhdWx0KShlKSkmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIGU/dDplfX0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDM4KSxpPW4oYSksdT1yKDEpLG89bih1KSxzPXIoMiksbD1uKHMpLGY9cigzKSxoPW4oZiksYz0ocigxNjYpLGZ1bmN0aW9uKHQsZSl7aWYodC5sZW5ndGghPT1lLmxlbmd0aClyZXR1cm4hMTtmb3IodmFyIHI9MDtyPHQubGVuZ3RoO3IrKylpZih0W3JdIT09ZVtyXSlyZXR1cm4hMTtyZXR1cm4hMH0pLGQ9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXQuc3BsaXQoXCJcXG5cIikscj0wO3I8ZS5sZW5ndGg7cisrKWVbcl09cisxK1wiOiBcIitlW3JdO3JldHVybiBlLmpvaW4oXCJcXG5cIil9LHY9ZnVuY3Rpb24odCl7cmV0dXJuIHQuc2xpY2U/dC5zbGljZSgwKTpuZXcgRmxvYXQzMkFycmF5KHQpfSxfPXZvaWQgMCxtPXIoNTMpLHA9cigxNzApLE09e1wiZmxvYXRcIjpcInVuaWZvcm0xZlwiLHZlYzI6XCJ1bmlmb3JtMmZ2XCIsdmVjMzpcInVuaWZvcm0zZnZcIix2ZWM0OlwidW5pZm9ybTRmdlwiLFwiaW50XCI6XCJ1bmlmb3JtMWlcIixtYXQzOlwidW5pZm9ybU1hdHJpeDNmdlwiLG1hdDQ6XCJ1bmlmb3JtTWF0cml4NGZ2XCJ9LHg9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7dmFyIGU9YXJndW1lbnRzLmxlbmd0aDw9MHx8dm9pZCAwPT09YXJndW1lbnRzWzBdP206YXJndW1lbnRzWzBdLHI9YXJndW1lbnRzLmxlbmd0aDw9MXx8dm9pZCAwPT09YXJndW1lbnRzWzFdP3A6YXJndW1lbnRzWzFdLG49YXJndW1lbnRzWzJdOygwLG8uZGVmYXVsdCkodGhpcyx0KSxfPWguZGVmYXVsdC5nbCx0aGlzLnBhcmFtZXRlcnM9W10sdGhpcy51bmlmb3JtVGV4dHVyZXM9W10sdGhpcy5fdmFyeWluZ3M9bixlfHwoZT1tKSxyfHwocj1tKTt2YXIgYT10aGlzLl9jcmVhdGVTaGFkZXJQcm9ncmFtKGUsITApLGk9dGhpcy5fY3JlYXRlU2hhZGVyUHJvZ3JhbShyLCExKTt0aGlzLl9hdHRhY2hTaGFkZXJQcm9ncmFtKGEsaSl9cmV0dXJuKDAsbC5kZWZhdWx0KSh0LFt7a2V5OlwiYmluZFwiLHZhbHVlOmZ1bmN0aW9uKCl7aC5kZWZhdWx0LnNoYWRlciE9PXRoaXMmJihfLnVzZVByb2dyYW0odGhpcy5zaGFkZXJQcm9ncmFtKSxoLmRlZmF1bHQudXNlU2hhZGVyKHRoaXMpLHRoaXMudW5pZm9ybVRleHR1cmVzPVtdKX19LHtrZXk6XCJ1bmlmb3JtXCIsdmFsdWU6ZnVuY3Rpb24odCxlLHIpe2lmKFwib2JqZWN0XCI9PT0oXCJ1bmRlZmluZWRcIj09dHlwZW9mIHQ/XCJ1bmRlZmluZWRcIjooMCxpLmRlZmF1bHQpKHQpKSlyZXR1cm4gdm9pZCB0aGlzLnVuaWZvcm1PYmplY3QodCk7Zm9yKHZhciBuPU1bZV18fGUsYT0hMSx1PXZvaWQgMCxvPS0xLHM9MDtzPHRoaXMucGFyYW1ldGVycy5sZW5ndGg7cysrKWlmKHU9dGhpcy5wYXJhbWV0ZXJzW3NdLHUubmFtZT09PXQpe2E9ITAsbz1zO2JyZWFrfXZhciBsPSExO2lmKGE/KHRoaXMuc2hhZGVyUHJvZ3JhbVt0XT11LnVuaWZvcm1Mb2MsbD11LmlzTnVtYmVyKToobD1cInVuaWZvcm0xaVwiPT09bnx8XCJ1bmlmb3JtMWZcIj09PW4sdGhpcy5zaGFkZXJQcm9ncmFtW3RdPV8uZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuc2hhZGVyUHJvZ3JhbSx0KSxsP3RoaXMucGFyYW1ldGVycy5wdXNoKHtuYW1lOnQsdHlwZTpuLHZhbHVlOnIsdW5pZm9ybUxvYzp0aGlzLnNoYWRlclByb2dyYW1bdF0saXNOdW1iZXI6bH0pOnRoaXMucGFyYW1ldGVycy5wdXNoKHtuYW1lOnQsdHlwZTpuLHZhbHVlOnYociksdW5pZm9ybUxvYzp0aGlzLnNoYWRlclByb2dyYW1bdF0saXNOdW1iZXI6bH0pLG89dGhpcy5wYXJhbWV0ZXJzLmxlbmd0aC0xKSx0aGlzLnBhcmFtZXRlcnNbb10udW5pZm9ybUxvYylpZigtMT09PW4uaW5kZXhPZihcIk1hdHJpeFwiKSlpZihsKXt2YXIgZj10aGlzLnBhcmFtZXRlcnNbb10udmFsdWUhPT1yfHwhYTtmJiYoX1tuXSh0aGlzLnNoYWRlclByb2dyYW1bdF0sciksdGhpcy5wYXJhbWV0ZXJzW29dLnZhbHVlPXIpfWVsc2UgYyh0aGlzLnBhcmFtZXRlcnNbb10udmFsdWUscikmJmF8fChfW25dKHRoaXMuc2hhZGVyUHJvZ3JhbVt0XSxyKSx0aGlzLnBhcmFtZXRlcnNbb10udmFsdWU9dihyKSk7ZWxzZSBjKHRoaXMucGFyYW1ldGVyc1tvXS52YWx1ZSxyKSYmYXx8KF9bbl0odGhpcy5zaGFkZXJQcm9ncmFtW3RdLCExLHIpLHRoaXMucGFyYW1ldGVyc1tvXS52YWx1ZT12KHIpKX19LHtrZXk6XCJ1bmlmb3JtT2JqZWN0XCIsdmFsdWU6ZnVuY3Rpb24oZSl7Zm9yKHZhciByIGluIGUpe3ZhciBuPWVbcl0sYT10LmdldFVuaWZvcm1UeXBlKG4pO2lmKG4uY29uY2F0JiZuWzBdLmNvbmNhdCl7Zm9yKHZhciBpPVtdLHU9MDt1PG4ubGVuZ3RoO3UrKylpPWkuY29uY2F0KG5bdV0pO249aX10aGlzLnVuaWZvcm0ocixhLG4pfX19LHtrZXk6XCJfY3JlYXRlU2hhZGVyUHJvZ3JhbVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIHI9ZT9oLmRlZmF1bHQuVkVSVEVYX1NIQURFUjpoLmRlZmF1bHQuRlJBR01FTlRfU0hBREVSLG49Xy5jcmVhdGVTaGFkZXIocik7cmV0dXJuIF8uc2hhZGVyU291cmNlKG4sdCksXy5jb21waWxlU2hhZGVyKG4pLF8uZ2V0U2hhZGVyUGFyYW1ldGVyKG4sXy5DT01QSUxFX1NUQVRVUyk/bjooY29uc29sZS53YXJuKFwiRXJyb3IgaW4gU2hhZGVyIDogXCIsXy5nZXRTaGFkZXJJbmZvTG9nKG4pKSxjb25zb2xlLmxvZyhkKHQpKSxudWxsKX19LHtrZXk6XCJfYXR0YWNoU2hhZGVyUHJvZ3JhbVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dGhpcy5zaGFkZXJQcm9ncmFtPV8uY3JlYXRlUHJvZ3JhbSgpLF8uYXR0YWNoU2hhZGVyKHRoaXMuc2hhZGVyUHJvZ3JhbSx0KSxfLmF0dGFjaFNoYWRlcih0aGlzLnNoYWRlclByb2dyYW0sZSksXy5kZWxldGVTaGFkZXIodCksXy5kZWxldGVTaGFkZXIoZSksdGhpcy5fdmFyeWluZ3MmJihjb25zb2xlLmxvZyhcIlRyYW5zZm9ybSBmZWVkYmFjayBzZXR1cCA6IFwiLHRoaXMuX3ZhcnlpbmdzKSxfLnRyYW5zZm9ybUZlZWRiYWNrVmFyeWluZ3ModGhpcy5zaGFkZXJQcm9ncmFtLHRoaXMuX3ZhcnlpbmdzLF8uU0VQQVJBVEVfQVRUUklCUykpLF8ubGlua1Byb2dyYW0odGhpcy5zaGFkZXJQcm9ncmFtKX19XSksdH0oKTt4LmdldFVuaWZvcm1UeXBlPWZ1bmN0aW9uKHQpe3ZhciBlPSEhdC5jb25jYXQscj1mdW5jdGlvbih0KXtyZXR1cm4gOT09PXQubGVuZ3RoP1widW5pZm9ybU1hdHJpeDNmdlwiOjE2PT09dC5sZW5ndGg/XCJ1bmlmb3JtTWF0cml4NGZ2XCI6XCJ2ZWNcIit0Lmxlbmd0aH07cmV0dXJuIGU/cih0WzBdLmNvbmNhdD90WzBdOnQpOlwiZmxvYXRcIn0sZS5kZWZhdWx0PXgsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe2UuZ2xNYXRyaXg9cigxMSksZS5tYXQyPXIoMTYxKSxlLm1hdDJkPXIoMTYyKSxlLm1hdDM9cig3OSksZS5tYXQ0PXIoMTYzKSxlLnF1YXQ9cigxNjQpLGUudmVjMj1yKDE2NSksZS52ZWMzPXIoODApLGUudmVjND1yKDgxKX0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDEpLGk9bihhKSx1PXIoMiksbz1uKHUpLHM9cigzKSxsPW4ocyksZj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSxyKXsoMCxpLmRlZmF1bHQpKHRoaXMsdCksdGhpcy5fbWVzaD1lLHRoaXMuX3NoYWRlcj1yfXJldHVybigwLG8uZGVmYXVsdCkodCxbe2tleTpcImRyYXdcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3NoYWRlci5iaW5kKCksbC5kZWZhdWx0LmRyYXcodGhpcy5tZXNoKX19LHtrZXk6XCJtZXNoXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX21lc2h9fSx7a2V5Olwic2hhZGVyXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3NoYWRlcn19XSksdH0oKTtlLmRlZmF1bHQ9Zix0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUpe3ZhciByPXQuZXhwb3J0cz17dmVyc2lvbjpcIjIuNC4wXCJ9O1wibnVtYmVyXCI9PXR5cGVvZiBfX2UmJihfX2U9cil9LGZ1bmN0aW9uKHQsZSl7dmFyIHI9e307ci5FUFNJTE9OPTFlLTYsci5BUlJBWV9UWVBFPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBGbG9hdDMyQXJyYXk/RmxvYXQzMkFycmF5OkFycmF5LHIuUkFORE9NPU1hdGgucmFuZG9tLHIuRU5BQkxFX1NJTUQ9ITEsci5TSU1EX0FWQUlMQUJMRT1yLkFSUkFZX1RZUEU9PT1GbG9hdDMyQXJyYXkmJlwiU0lNRFwiaW4gdGhpcyxyLlVTRV9TSU1EPXIuRU5BQkxFX1NJTUQmJnIuU0lNRF9BVkFJTEFCTEUsci5zZXRNYXRyaXhBcnJheVR5cGU9ZnVuY3Rpb24odCl7ci5BUlJBWV9UWVBFPXR9O3ZhciBuPU1hdGguUEkvMTgwO3IudG9SYWRpYW49ZnVuY3Rpb24odCl7cmV0dXJuIHQqbn0sci5lcXVhbHM9ZnVuY3Rpb24odCxlKXtyZXR1cm4gTWF0aC5hYnModC1lKTw9ci5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnModCksTWF0aC5hYnMoZSkpfSx0LmV4cG9ydHM9cn0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDEpLGk9bihhKSx1PXIoMiksbz1uKHUpLHM9cigzKSxsPW4ocyksZj1yKDgpLGg9cig2NiksYz1uKGgpLGQ9dm9pZCAwLHY9MzUwNDQsXz1mdW5jdGlvbih0KXt2YXIgZT12b2lkIDA7cmV0dXJuIHZvaWQgMCE9PXQuYnVmZmVyP2U9dC5idWZmZXI6KGU9ZC5jcmVhdGVCdWZmZXIoKSx0LmJ1ZmZlcj1lKSxlfSxtPWZ1bmN0aW9uKHQsZSl7Zm9yKHZhciByPVtdLG49MDtuPHQubGVuZ3RoO24rPWUpe2Zvcih2YXIgYT1bXSxpPTA7ZT5pO2krKylhLnB1c2godFtuK2ldKTtyLnB1c2goYSl9cmV0dXJuIHJ9LHA9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7dmFyIGU9YXJndW1lbnRzLmxlbmd0aDw9MHx8dm9pZCAwPT09YXJndW1lbnRzWzBdPzQ6YXJndW1lbnRzWzBdLHI9YXJndW1lbnRzLmxlbmd0aDw9MXx8dm9pZCAwPT09YXJndW1lbnRzWzFdPyEwOmFyZ3VtZW50c1sxXTsoMCxpLmRlZmF1bHQpKHRoaXMsdCksZD1sLmRlZmF1bHQuZ2wsdGhpcy5kcmF3VHlwZT1lLHRoaXMuX2F0dHJpYnV0ZXM9W10sdGhpcy5fbnVtSW5zdGFuY2U9LTEsdGhpcy5fZW5hYmxlZFZlcnRleEF0dHJpYnV0ZT1bXSx0aGlzLl9pbmRpY2VzPVtdLHRoaXMuX2ZhY2VzPVtdLHRoaXMuX2J1ZmZlckNoYW5nZWQ9W10sdGhpcy5faGFzSW5kZXhCdWZmZXJDaGFuZ2VkPSExLHRoaXMuX2hhc1ZBTz0hMSx0aGlzLl9pc0luc3RhbmNlZD0hMSx0aGlzLl9leHRWQU89ISFsLmRlZmF1bHQuZ2wuY3JlYXRlVmVydGV4QXJyYXksdGhpcy5fdXNlVkFPPSEhdGhpcy5fZXh0VkFPJiZyfXJldHVybigwLG8uZGVmYXVsdCkodCxbe2tleTpcImJ1ZmZlclZlcnRleFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPWFyZ3VtZW50cy5sZW5ndGg8PTF8fHZvaWQgMD09PWFyZ3VtZW50c1sxXT92OmFyZ3VtZW50c1sxXTtyZXR1cm4gdGhpcy5idWZmZXJEYXRhKHQsXCJhVmVydGV4UG9zaXRpb25cIiwzLGUpLHRoaXMubm9ybWFscy5sZW5ndGg8dGhpcy52ZXJ0aWNlcy5sZW5ndGgmJnRoaXMuYnVmZmVyTm9ybWFsKHQsZSksdGhpc319LHtrZXk6XCJidWZmZXJUZXhDb29yZFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPWFyZ3VtZW50cy5sZW5ndGg8PTF8fHZvaWQgMD09PWFyZ3VtZW50c1sxXT92OmFyZ3VtZW50c1sxXTtyZXR1cm4gdGhpcy5idWZmZXJEYXRhKHQsXCJhVGV4dHVyZUNvb3JkXCIsMixlKSx0aGlzfX0se2tleTpcImJ1ZmZlck5vcm1hbFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPWFyZ3VtZW50cy5sZW5ndGg8PTF8fHZvaWQgMD09PWFyZ3VtZW50c1sxXT92OmFyZ3VtZW50c1sxXTtyZXR1cm4gdGhpcy5idWZmZXJEYXRhKHQsXCJhTm9ybWFsXCIsMyxlKSx0aGlzfX0se2tleTpcImJ1ZmZlckluZGV4XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9YXJndW1lbnRzLmxlbmd0aDw9MXx8dm9pZCAwPT09YXJndW1lbnRzWzFdPyExOmFyZ3VtZW50c1sxXTtyZXR1cm4gdGhpcy5fZHJhd1R5cGU9ZT9kLkRZTkFNSUNfRFJBVzpkLlNUQVRJQ19EUkFXLHRoaXMuX2luZGljZXM9bmV3IFVpbnQxNkFycmF5KHQpLHRoaXMuX251bUl0ZW1zPXRoaXMuX2luZGljZXMubGVuZ3RoLHRoaXN9fSx7a2V5OlwiYnVmZmVyRmxhdHRlbkRhdGFcIix2YWx1ZTpmdW5jdGlvbih0LGUscil7dmFyIG49YXJndW1lbnRzLmxlbmd0aDw9M3x8dm9pZCAwPT09YXJndW1lbnRzWzNdP3Y6YXJndW1lbnRzWzNdLGE9YXJndW1lbnRzLmxlbmd0aDw9NHx8dm9pZCAwPT09YXJndW1lbnRzWzRdPyExOmFyZ3VtZW50c1s0XSxpPW0odCxyKTtyZXR1cm4gdGhpcy5idWZmZXJEYXRhKGksZSxyLG49dixhPSExKSx0aGlzfX0se2tleTpcImJ1ZmZlckRhdGFcIix2YWx1ZTpmdW5jdGlvbiBlKHQscixuKXt2YXIgYT1hcmd1bWVudHMubGVuZ3RoPD0zfHx2b2lkIDA9PT1hcmd1bWVudHNbM10/djphcmd1bWVudHNbM10saT1hcmd1bWVudHMubGVuZ3RoPD00fHx2b2lkIDA9PT1hcmd1bWVudHNbNF0/ITE6YXJndW1lbnRzWzRdLHU9MCxvPWEsZT1bXTtmb3Iobnx8KG49dFswXS5sZW5ndGgpLHRoaXMuX2lzSW5zdGFuY2VkPWl8fHRoaXMuX2lzSW5zdGFuY2VkLHU9MDt1PHQubGVuZ3RoO3UrKylmb3IodmFyIHM9MDtzPHRbdV0ubGVuZ3RoO3MrKyllLnB1c2godFt1XVtzXSk7dmFyIGw9bmV3IEZsb2F0MzJBcnJheShlKSxmPXRoaXMuZ2V0QXR0cmlidXRlKHIpO3JldHVybiBmPyhmLml0ZW1TaXplPW4sZi5kYXRhQXJyYXk9bCxmLnNvdXJjZT10KTp0aGlzLl9hdHRyaWJ1dGVzLnB1c2goe25hbWU6cixzb3VyY2U6dCxpdGVtU2l6ZTpuLGRyYXdUeXBlOm8sZGF0YUFycmF5OmwsaXNJbnN0YW5jZWQ6aX0pLHRoaXMuX2J1ZmZlckNoYW5nZWQucHVzaChyKSx0aGlzfX0se2tleTpcImJ1ZmZlckluc3RhbmNlXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtpZighbC5kZWZhdWx0LmdsLnZlcnRleEF0dHJpYkRpdmlzb3IpcmV0dXJuIHZvaWQgY29uc29sZS5lcnJvcihcIkV4dGVuc2lvbiA6IEFOR0xFX2luc3RhbmNlZF9hcnJheXMgaXMgbm90IHN1cHBvcnRlZCB3aXRoIHRoaXMgZGV2aWNlICFcIik7dmFyIHI9dFswXS5sZW5ndGg7dGhpcy5fbnVtSW5zdGFuY2U9dC5sZW5ndGgsdGhpcy5idWZmZXJEYXRhKHQsZSxyLHYsITApfX0se2tleTpcImJpbmRcIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLmdlbmVyYXRlQnVmZmVycyh0KSx0aGlzLmhhc1ZBTz9kLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZhbyk6KHRoaXMuYXR0cmlidXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe2QuYmluZEJ1ZmZlcihkLkFSUkFZX0JVRkZFUix0LmJ1ZmZlcik7dmFyIGU9dC5hdHRyUG9zaXRpb247ZC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGUsdC5pdGVtU2l6ZSxkLkZMT0FULCExLDAsMCksdC5pc0luc3RhbmNlZCYmZC52ZXJ0ZXhBdHRyaWJEaXZpc29yKGUsMSl9KSxkLmJpbmRCdWZmZXIoZC5FTEVNRU5UX0FSUkFZX0JVRkZFUix0aGlzLmlCdWZmZXIpKX19LHtrZXk6XCJnZW5lcmF0ZUJ1ZmZlcnNcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT10aGlzOzAhPXRoaXMuX2J1ZmZlckNoYW5nZWQubGVuZ3RoJiYodGhpcy5fdXNlVkFPPyh0aGlzLl92YW98fCh0aGlzLl92YW89ZC5jcmVhdGVWZXJ0ZXhBcnJheSgpKSxkLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLl92YW8pLHRoaXMuX2F0dHJpYnV0ZXMuZm9yRWFjaChmdW5jdGlvbihyKXtpZigtMSE9PWUuX2J1ZmZlckNoYW5nZWQuaW5kZXhPZihyLm5hbWUpKXt2YXIgbj1fKHIpO2QuYmluZEJ1ZmZlcihkLkFSUkFZX0JVRkZFUixuKSxkLmJ1ZmZlckRhdGEoZC5BUlJBWV9CVUZGRVIsci5kYXRhQXJyYXksci5kcmF3VHlwZSk7dmFyIGE9KDAsYy5kZWZhdWx0KShkLHQsci5uYW1lKTtkLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGEpLGQudmVydGV4QXR0cmliUG9pbnRlcihhLHIuaXRlbVNpemUsZC5GTE9BVCwhMSwwLDApLHIuYXR0clBvc2l0aW9uPWEsci5pc0luc3RhbmNlZCYmZC52ZXJ0ZXhBdHRyaWJEaXZpc29yKGEsMSl9fSksdGhpcy5fdXBkYXRlSW5kZXhCdWZmZXIoKSxkLmJpbmRWZXJ0ZXhBcnJheShudWxsKSx0aGlzLl9oYXNWQU89ITApOih0aGlzLl9hdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24ocil7aWYoLTEhPT1lLl9idWZmZXJDaGFuZ2VkLmluZGV4T2Yoci5uYW1lKSl7dmFyIG49XyhyKTtkLmJpbmRCdWZmZXIoZC5BUlJBWV9CVUZGRVIsbiksZC5idWZmZXJEYXRhKGQuQVJSQVlfQlVGRkVSLHIuZGF0YUFycmF5LHIuZHJhd1R5cGUpO3ZhciBhPSgwLGMuZGVmYXVsdCkoZCx0LHIubmFtZSk7ZC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShhKSxkLnZlcnRleEF0dHJpYlBvaW50ZXIoYSxyLml0ZW1TaXplLGQuRkxPQVQsITEsMCwwKSxyLmF0dHJQb3NpdGlvbj1hLHIuaXNJbnN0YW5jZWQmJmQudmVydGV4QXR0cmliRGl2aXNvcihhLDEpfX0pLHRoaXMuX3VwZGF0ZUluZGV4QnVmZmVyKCkpLHRoaXMuX2hhc0luZGV4QnVmZmVyQ2hhbmdlZD0hMSx0aGlzLl9idWZmZXJDaGFuZ2VkPVtdKX19LHtrZXk6XCJ1bmJpbmRcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX3VzZVZBTyYmZC5iaW5kVmVydGV4QXJyYXkobnVsbCksdGhpcy5fYXR0cmlidXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QuaXNJbnN0YW5jZWQmJmQudmVydGV4QXR0cmliRGl2aXNvcih0LmF0dHJQb3NpdGlvbiwwKX0pfX0se2tleTpcIl91cGRhdGVJbmRleEJ1ZmZlclwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5faGFzSW5kZXhCdWZmZXJDaGFuZ2VkfHwodGhpcy5pQnVmZmVyfHwodGhpcy5pQnVmZmVyPWQuY3JlYXRlQnVmZmVyKCkpLGQuYmluZEJ1ZmZlcihkLkVMRU1FTlRfQVJSQVlfQlVGRkVSLHRoaXMuaUJ1ZmZlciksZC5idWZmZXJEYXRhKGQuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5faW5kaWNlcyx0aGlzLl9kcmF3VHlwZSksdGhpcy5pQnVmZmVyLml0ZW1TaXplPTEsdGhpcy5pQnVmZmVyLm51bUl0ZW1zPXRoaXMuX251bUl0ZW1zKX19LHtrZXk6XCJjb21wdXRlTm9ybWFsc1wiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aDw9MHx8dm9pZCAwPT09YXJndW1lbnRzWzBdPyExOmFyZ3VtZW50c1swXTt0aGlzLmdlbmVyYXRlRmFjZXMoKSx0P3RoaXMuX2NvbXB1dGVGYWNlTm9ybWFscygpOnRoaXMuX2NvbXB1dGVWZXJ0ZXhOb3JtYWxzKCl9fSx7a2V5OlwiX2NvbXB1dGVGYWNlTm9ybWFsc1wiLHZhbHVlOmZ1bmN0aW9uKCl7Zm9yKHZhciB0PXZvaWQgMCxlPXZvaWQgMCxyPVtdLG49MDtuPHRoaXMuX2luZGljZXMubGVuZ3RoO24rPTMpe3Q9bi8zLGU9dGhpcy5fZmFjZXNbdF07dmFyIGE9ZS5ub3JtYWw7cltlLmluZGljZXNbMF1dPWEscltlLmluZGljZXNbMV1dPWEscltlLmluZGljZXNbMl1dPWF9dGhpcy5idWZmZXJOb3JtYWwocil9fSx7a2V5OlwiX2NvbXB1dGVWZXJ0ZXhOb3JtYWxzXCIsdmFsdWU6ZnVuY3Rpb24oKXtmb3IodmFyIHQ9dm9pZCAwLGU9Zi52ZWMzLmNyZWF0ZSgpLHI9W10sbj10aGlzLnZlcnRpY2VzLGE9MDthPG4ubGVuZ3RoO2ErKyl7Zi52ZWMzLnNldChlLDAsMCwwKTtmb3IodmFyIGk9MDtpPHRoaXMuX2ZhY2VzLmxlbmd0aDtpKyspdD10aGlzLl9mYWNlc1tpXSx0LmluZGljZXMuaW5kZXhPZihhKT49MCYmKGVbMF0rPXQubm9ybWFsWzBdLGVbMV0rPXQubm9ybWFsWzFdLGVbMl0rPXQubm9ybWFsWzJdKTtmLnZlYzMubm9ybWFsaXplKGUsZSksci5wdXNoKFtlWzBdLGVbMV0sZVsyXV0pfXRoaXMuYnVmZmVyTm9ybWFsKHIpfX0se2tleTpcImdlbmVyYXRlRmFjZXNcIix2YWx1ZTpmdW5jdGlvbigpe2Zvcih2YXIgdD12b2lkIDAsZT12b2lkIDAscj12b2lkIDAsbj12b2lkIDAsYT12b2lkIDAsaT12b2lkIDAsdT0oZi52ZWMzLmNyZWF0ZSgpLGYudmVjMy5jcmVhdGUoKSxmLnZlYzMuY3JlYXRlKCksdGhpcy52ZXJ0aWNlcyksbz0wO288dGhpcy5faW5kaWNlcy5sZW5ndGg7bys9Myl7dD10aGlzLl9pbmRpY2VzW29dLGU9dGhpcy5faW5kaWNlc1tvKzFdLHI9dGhpcy5faW5kaWNlc1tvKzJdLG49dVt0XSxhPXVbZV0saT11W3JdO3ZhciBzPXtpbmRpY2VzOlt0LGUscl0sdmVydGljZXM6W24sYSxpXX07dGhpcy5fZmFjZXMucHVzaChzKX19fSx7a2V5OlwiZ2V0QXR0cmlidXRlXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMuX2F0dHJpYnV0ZXMuZmluZChmdW5jdGlvbihlKXtyZXR1cm4gZS5uYW1lPT09dH0pfX0se2tleTpcImdldFNvdXJjZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0QXR0cmlidXRlKHQpO3JldHVybiBlP2Uuc291cmNlOltdfX0se2tleTpcInZlcnRpY2VzXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ2V0U291cmNlKFwiYVZlcnRleFBvc2l0aW9uXCIpfX0se2tleTpcIm5vcm1hbHNcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nZXRTb3VyY2UoXCJhTm9ybWFsXCIpfX0se2tleTpcImNvb3Jkc1wiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmdldFNvdXJjZShcImFUZXh0dXJlQ29vcmRcIil9fSx7a2V5OlwiaW5kaWNlc1wiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pbmRpY2VzfX0se2tleTpcInZlcnRleFNpemVcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52ZXJ0aWNlcy5sZW5ndGh9fSx7a2V5OlwiZmFjZXNcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fZmFjZXN9fSx7a2V5OlwiYXR0cmlidXRlc1wiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9hdHRyaWJ1dGVzfX0se2tleTpcImhhc1ZBT1wiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9oYXNWQU99fSx7a2V5OlwidmFvXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3Zhb319LHtrZXk6XCJudW1JbnN0YW5jZVwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9udW1JbnN0YW5jZX19LHtrZXk6XCJpc0luc3RhbmNlZFwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pc0luc3RhbmNlZH19XSksdH0oKTtlLmRlZmF1bHQ9cCx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fWUuX19lc01vZHVsZT0hMDt2YXIgYT1yKDQpLGk9bihhKSx1PXIoMTE5KSxvPW4odSk7ZS5kZWZhdWx0PWZ1bmN0aW9uIHModCxlLHIpe251bGw9PT10JiYodD1GdW5jdGlvbi5wcm90b3R5cGUpO3ZhciBuPSgwLG8uZGVmYXVsdCkodCxlKTtpZih2b2lkIDA9PT1uKXt2YXIgYT0oMCxpLmRlZmF1bHQpKHQpO3JldHVybiBudWxsPT09YT92b2lkIDA6cyhhLGUscil9aWYoXCJ2YWx1ZVwiaW4gbilyZXR1cm4gbi52YWx1ZTt2YXIgdT1uLmdldDtpZih2b2lkIDAhPT11KXJldHVybiB1LmNhbGwocil9fSxmdW5jdGlvbih0LGUpe3ZhciByPXQuZXhwb3J0cz1cInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93JiZ3aW5kb3cuTWF0aD09TWF0aD93aW5kb3c6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGYmJnNlbGYuTWF0aD09TWF0aD9zZWxmOkZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcIm51bWJlclwiPT10eXBlb2YgX19nJiYoX19nPXIpfSxmdW5jdGlvbih0LGUscil7dmFyIG49cigxMzcpLGE9cigzOSk7dC5leHBvcnRzPWZ1bmN0aW9uKHQpe3JldHVybiBuKGEodCkpfX0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDEyKSxpPW4oYSksdT17fSxvPXZvaWQgMDt1LnBsYW5lPWZ1bmN0aW9uKHQsZSxyKXtmb3IodmFyIG49YXJndW1lbnRzLmxlbmd0aDw9M3x8dm9pZCAwPT09YXJndW1lbnRzWzNdP1wieHlcIjphcmd1bWVudHNbM10sYT1hcmd1bWVudHMubGVuZ3RoPD00fHx2b2lkIDA9PT1hcmd1bWVudHNbNF0/NDphcmd1bWVudHNbNF0sdT1bXSxvPVtdLHM9W10sbD1bXSxmPXQvcixoPWUvcixjPTEvcixkPS41Ki10LHY9LjUqLWUsXz0wLG09MDtyPm07bSsrKWZvcih2YXIgcD0wO3I+cDtwKyspe3ZhciBNPWYqbStkLHg9aCpwK3YsZz1tL3IsRT1wL3I7XCJ4elwiPT09bj8odS5wdXNoKFtNLDAseCtoXSksdS5wdXNoKFtNK2YsMCx4K2hdKSx1LnB1c2goW00rZiwwLHhdKSx1LnB1c2goW00sMCx4XSksby5wdXNoKFtnLDEtKEUrYyldKSxvLnB1c2goW2crYywxLShFK2MpXSksby5wdXNoKFtnK2MsMS1FXSksby5wdXNoKFtnLDEtRV0pLGwucHVzaChbMCwxLDBdKSxsLnB1c2goWzAsMSwwXSksbC5wdXNoKFswLDEsMF0pLGwucHVzaChbMCwxLDBdKSk6XCJ5elwiPT09bj8odS5wdXNoKFswLHgsTV0pLHUucHVzaChbMCx4LE0rZl0pLHUucHVzaChbMCx4K2gsTStmXSksdS5wdXNoKFswLHgraCxNXSksby5wdXNoKFtnLEVdKSxvLnB1c2goW2crYyxFXSksby5wdXNoKFtnK2MsRStjXSksby5wdXNoKFtnLEUrY10pLGwucHVzaChbMSwwLDBdKSxsLnB1c2goWzEsMCwwXSksbC5wdXNoKFsxLDAsMF0pLGwucHVzaChbMSwwLDBdKSk6KHUucHVzaChbTSx4LDBdKSx1LnB1c2goW00rZix4LDBdKSx1LnB1c2goW00rZix4K2gsMF0pLHUucHVzaChbTSx4K2gsMF0pLG8ucHVzaChbZyxFXSksby5wdXNoKFtnK2MsRV0pLG8ucHVzaChbZytjLEUrY10pLG8ucHVzaChbZyxFK2NdKSxsLnB1c2goWzAsMCwxXSksbC5wdXNoKFswLDAsMV0pLGwucHVzaChbMCwwLDFdKSxsLnB1c2goWzAsMCwxXSkpLHMucHVzaCg0Kl8rMCkscy5wdXNoKDQqXysxKSxzLnB1c2goNCpfKzIpLHMucHVzaCg0Kl8rMCkscy5wdXNoKDQqXysyKSxzLnB1c2goNCpfKzMpLF8rK312YXIgYj1uZXcgaS5kZWZhdWx0KGEpO3JldHVybiBiLmJ1ZmZlclZlcnRleCh1KSxiLmJ1ZmZlclRleENvb3JkKG8pLGIuYnVmZmVySW5kZXgocyksYi5idWZmZXJOb3JtYWwobCksYn0sdS5zcGhlcmU9ZnVuY3Rpb24odCxlKXtmdW5jdGlvbiByKHIsbil7dmFyIGE9YXJndW1lbnRzLmxlbmd0aDw9Mnx8dm9pZCAwPT09YXJndW1lbnRzWzJdPyExOmFyZ3VtZW50c1syXSxpPXIvZSpNYXRoLlBJLS41Kk1hdGguUEksdT1uL2UqTWF0aC5QSSoyLG89YT8xOnQscz1bXTtzWzFdPU1hdGguc2luKGkpKm87dmFyIGw9TWF0aC5jb3MoaSkqbztzWzBdPU1hdGguY29zKHUpKmwsc1syXT1NYXRoLnNpbih1KSpsO3ZhciBmPTFlNDtyZXR1cm4gc1swXT1NYXRoLmZsb29yKHNbMF0qZikvZixzWzFdPU1hdGguZmxvb3Ioc1sxXSpmKS9mLHNbMl09TWF0aC5mbG9vcihzWzJdKmYpL2Ysc31mb3IodmFyIG49YXJndW1lbnRzLmxlbmd0aDw9Mnx8dm9pZCAwPT09YXJndW1lbnRzWzJdPyExOmFyZ3VtZW50c1syXSxhPWFyZ3VtZW50cy5sZW5ndGg8PTN8fHZvaWQgMD09PWFyZ3VtZW50c1szXT80OmFyZ3VtZW50c1szXSx1PVtdLG89W10scz1bXSxsPVtdLGY9MS9lLGg9MCxjPTA7ZT5jO2MrKylmb3IodmFyIGQ9MDtlPmQ7ZCsrKXt1LnB1c2gocihjLGQpKSx1LnB1c2gocihjKzEsZCkpLHUucHVzaChyKGMrMSxkKzEpKSx1LnB1c2gocihjLGQrMSkpLGwucHVzaChyKGMsZCwhMCkpLGwucHVzaChyKGMrMSxkLCEwKSksbC5wdXNoKHIoYysxLGQrMSwhMCkpLGwucHVzaChyKGMsZCsxLCEwKSk7dmFyIHY9ZC9lLF89Yy9lO28ucHVzaChbMS12LF9dKSxvLnB1c2goWzEtdixfK2ZdKSxvLnB1c2goWzEtdi1mLF8rZl0pLG8ucHVzaChbMS12LWYsX10pLHMucHVzaCg0KmgrMCkscy5wdXNoKDQqaCsxKSxzLnB1c2goNCpoKzIpLHMucHVzaCg0KmgrMCkscy5wdXNoKDQqaCsyKSxzLnB1c2goNCpoKzMpLGgrK31uJiZzLnJldmVyc2UoKTt2YXIgbT1uZXcgaS5kZWZhdWx0KGEpO3JldHVybiBtLmJ1ZmZlclZlcnRleCh1KSxtLmJ1ZmZlclRleENvb3JkKG8pLG0uYnVmZmVySW5kZXgocyksbS5idWZmZXJOb3JtYWwobCksbX0sdS5jdWJlPWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1hcmd1bWVudHMubGVuZ3RoPD0zfHx2b2lkIDA9PT1hcmd1bWVudHNbM10/NDphcmd1bWVudHNbM107ZT1lfHx0LHI9cnx8dDt2YXIgYT10LzIsdT1lLzIsbz1yLzIscz1bXSxsPVtdLGY9W10saD1bXSxjPTA7cy5wdXNoKFstYSx1LC1vXSkscy5wdXNoKFthLHUsLW9dKSxzLnB1c2goW2EsLXUsLW9dKSxzLnB1c2goWy1hLC11LC1vXSksaC5wdXNoKFswLDAsLTFdKSxoLnB1c2goWzAsMCwtMV0pLGgucHVzaChbMCwwLC0xXSksaC5wdXNoKFswLDAsLTFdKSxsLnB1c2goWzAsMF0pLGwucHVzaChbMSwwXSksbC5wdXNoKFsxLDFdKSxsLnB1c2goWzAsMV0pLGYucHVzaCg0KmMrMCksZi5wdXNoKDQqYysxKSxmLnB1c2goNCpjKzIpLGYucHVzaCg0KmMrMCksZi5wdXNoKDQqYysyKSxmLnB1c2goNCpjKzMpLGMrKyxzLnB1c2goW2EsdSwtb10pLHMucHVzaChbYSx1LG9dKSxzLnB1c2goW2EsLXUsb10pLHMucHVzaChbYSwtdSwtb10pLGgucHVzaChbMSwwLDBdKSxoLnB1c2goWzEsMCwwXSksaC5wdXNoKFsxLDAsMF0pLGgucHVzaChbMSwwLDBdKSxsLnB1c2goWzAsMF0pLGwucHVzaChbMSwwXSksbC5wdXNoKFsxLDFdKSxsLnB1c2goWzAsMV0pLGYucHVzaCg0KmMrMCksZi5wdXNoKDQqYysxKSxmLnB1c2goNCpjKzIpLGYucHVzaCg0KmMrMCksZi5wdXNoKDQqYysyKSxmLnB1c2goNCpjKzMpLGMrKyxzLnB1c2goW2EsdSxvXSkscy5wdXNoKFstYSx1LG9dKSxzLnB1c2goWy1hLC11LG9dKSxzLnB1c2goW2EsLXUsb10pLGgucHVzaChbMCwwLDFdKSxoLnB1c2goWzAsMCwxXSksaC5wdXNoKFswLDAsMV0pLGgucHVzaChbMCwwLDFdKSxsLnB1c2goWzAsMF0pLGwucHVzaChbMSwwXSksbC5wdXNoKFsxLDFdKSxsLnB1c2goWzAsMV0pLGYucHVzaCg0KmMrMCksZi5wdXNoKDQqYysxKSxmLnB1c2goNCpjKzIpLGYucHVzaCg0KmMrMCksZi5wdXNoKDQqYysyKSxmLnB1c2goNCpjKzMpLGMrKyxzLnB1c2goWy1hLHUsb10pLHMucHVzaChbLWEsdSwtb10pLHMucHVzaChbLWEsLXUsLW9dKSxzLnB1c2goWy1hLC11LG9dKSxoLnB1c2goWy0xLDAsMF0pLGgucHVzaChbLTEsMCwwXSksaC5wdXNoKFstMSwwLDBdKSxoLnB1c2goWy0xLDAsMF0pLGwucHVzaChbMCwwXSksbC5wdXNoKFsxLDBdKSxsLnB1c2goWzEsMV0pLGwucHVzaChbMCwxXSksZi5wdXNoKDQqYyswKSxmLnB1c2goNCpjKzEpLGYucHVzaCg0KmMrMiksZi5wdXNoKDQqYyswKSxmLnB1c2goNCpjKzIpLGYucHVzaCg0KmMrMyksYysrLHMucHVzaChbYSx1LC1vXSkscy5wdXNoKFstYSx1LC1vXSkscy5wdXNoKFstYSx1LG9dKSxzLnB1c2goW2EsdSxvXSksaC5wdXNoKFswLDEsMF0pLGgucHVzaChbMCwxLDBdKSxoLnB1c2goWzAsMSwwXSksaC5wdXNoKFswLDEsMF0pLGwucHVzaChbMCwwXSksbC5wdXNoKFsxLDBdKSxsLnB1c2goWzEsMV0pLGwucHVzaChbMCwxXSksZi5wdXNoKDQqYyswKSxmLnB1c2goNCpjKzEpLGYucHVzaCg0KmMrMiksZi5wdXNoKDQqYyswKSxmLnB1c2goNCpjKzIpLGYucHVzaCg0KmMrMyksYysrLHMucHVzaChbYSwtdSxvXSkscy5wdXNoKFstYSwtdSxvXSkscy5wdXNoKFstYSwtdSwtb10pLHMucHVzaChbYSwtdSwtb10pLGgucHVzaChbMCwtMSwwXSksaC5wdXNoKFswLC0xLDBdKSxoLnB1c2goWzAsLTEsMF0pLGgucHVzaChbMCwtMSwwXSksbC5wdXNoKFswLDBdKSxsLnB1c2goWzEsMF0pLGwucHVzaChbMSwxXSksbC5wdXNoKFswLDFdKSxmLnB1c2goNCpjKzApLGYucHVzaCg0KmMrMSksZi5wdXNoKDQqYysyKSxmLnB1c2goNCpjKzApLGYucHVzaCg0KmMrMiksZi5wdXNoKDQqYyszKSxjKys7dmFyIGQ9bmV3IGkuZGVmYXVsdChuKTtyZXR1cm4gZC5idWZmZXJWZXJ0ZXgocyksZC5idWZmZXJUZXhDb29yZChsKSxkLmJ1ZmZlckluZGV4KGYpLGQuYnVmZmVyTm9ybWFsKGgpLGR9LHUuc2t5Ym94PWZ1bmN0aW9uKHQpe3ZhciBlPWFyZ3VtZW50cy5sZW5ndGg8PTF8fHZvaWQgMD09PWFyZ3VtZW50c1sxXT80OmFyZ3VtZW50c1sxXSxyPVtdLG49W10sYT1bXSx1PVtdLG89MDtyLnB1c2goW3QsdCwtdF0pLHIucHVzaChbLXQsdCwtdF0pLHIucHVzaChbLXQsLXQsLXRdKSxyLnB1c2goW3QsLXQsLXRdKSx1LnB1c2goWzAsMCwtMV0pLHUucHVzaChbMCwwLC0xXSksdS5wdXNoKFswLDAsLTFdKSx1LnB1c2goWzAsMCwtMV0pLG4ucHVzaChbMCwwXSksbi5wdXNoKFsxLDBdKSxuLnB1c2goWzEsMV0pLG4ucHVzaChbMCwxXSksYS5wdXNoKDQqbyswKSxhLnB1c2goNCpvKzEpLGEucHVzaCg0Km8rMiksYS5wdXNoKDQqbyswKSxhLnB1c2goNCpvKzIpLGEucHVzaCg0Km8rMyksbysrLHIucHVzaChbdCwtdCwtdF0pLHIucHVzaChbdCwtdCx0XSksci5wdXNoKFt0LHQsdF0pLHIucHVzaChbdCx0LC10XSksdS5wdXNoKFsxLDAsMF0pLHUucHVzaChbMSwwLDBdKSx1LnB1c2goWzEsMCwwXSksdS5wdXNoKFsxLDAsMF0pLG4ucHVzaChbMCwwXSksbi5wdXNoKFsxLDBdKSxuLnB1c2goWzEsMV0pLG4ucHVzaChbMCwxXSksYS5wdXNoKDQqbyswKSxhLnB1c2goNCpvKzEpLGEucHVzaCg0Km8rMiksYS5wdXNoKDQqbyswKSxhLnB1c2goNCpvKzIpLGEucHVzaCg0Km8rMyksbysrLHIucHVzaChbLXQsdCx0XSksci5wdXNoKFt0LHQsdF0pLHIucHVzaChbdCwtdCx0XSksci5wdXNoKFstdCwtdCx0XSksdS5wdXNoKFswLDAsMV0pLHUucHVzaChbMCwwLDFdKSx1LnB1c2goWzAsMCwxXSksdS5wdXNoKFswLDAsMV0pLG4ucHVzaChbMCwwXSksbi5wdXNoKFsxLDBdKSxuLnB1c2goWzEsMV0pLG4ucHVzaChbMCwxXSksYS5wdXNoKDQqbyswKSxhLnB1c2goNCpvKzEpLGEucHVzaCg0Km8rMiksYS5wdXNoKDQqbyswKSxhLnB1c2goNCpvKzIpLGEucHVzaCg0Km8rMyksbysrLHIucHVzaChbLXQsLXQsdF0pLHIucHVzaChbLXQsLXQsLXRdKSxyLnB1c2goWy10LHQsLXRdKSxyLnB1c2goWy10LHQsdF0pLHUucHVzaChbLTEsMCwwXSksdS5wdXNoKFstMSwwLDBdKSx1LnB1c2goWy0xLDAsMF0pLHUucHVzaChbLTEsMCwwXSksbi5wdXNoKFswLDBdKSxuLnB1c2goWzEsMF0pLG4ucHVzaChbMSwxXSksbi5wdXNoKFswLDFdKSxhLnB1c2goNCpvKzApLGEucHVzaCg0Km8rMSksYS5wdXNoKDQqbysyKSxhLnB1c2goNCpvKzApLGEucHVzaCg0Km8rMiksYS5wdXNoKDQqbyszKSxvKyssci5wdXNoKFt0LHQsdF0pLHIucHVzaChbLXQsdCx0XSksci5wdXNoKFstdCx0LC10XSksci5wdXNoKFt0LHQsLXRdKSx1LnB1c2goWzAsMSwwXSksdS5wdXNoKFswLDEsMF0pLHUucHVzaChbMCwxLDBdKSx1LnB1c2goWzAsMSwwXSksbi5wdXNoKFswLDBdKSxuLnB1c2goWzEsMF0pLG4ucHVzaChbMSwxXSksbi5wdXNoKFswLDFdKSxhLnB1c2goNCpvKzApLGEucHVzaCg0Km8rMSksYS5wdXNoKDQqbysyKSxhLnB1c2goNCpvKzApLGEucHVzaCg0Km8rMiksYS5wdXNoKDQqbyszKSxvKyssci5wdXNoKFt0LC10LC10XSksci5wdXNoKFstdCwtdCwtdF0pLHIucHVzaChbLXQsLXQsdF0pLHIucHVzaChbdCwtdCx0XSksdS5wdXNoKFswLC0xLDBdKSx1LnB1c2goWzAsLTEsMF0pLHUucHVzaChbMCwtMSwwXSksdS5wdXNoKFswLC0xLDBdKSxuLnB1c2goWzAsMF0pLG4ucHVzaChbMSwwXSksbi5wdXNoKFsxLDFdKSxuLnB1c2goWzAsMV0pLGEucHVzaCg0Km8rMCksYS5wdXNoKDQqbysxKSxhLnB1c2goNCpvKzIpLGEucHVzaCg0Km8rMCksYS5wdXNoKDQqbysyKSxhLnB1c2goNCpvKzMpO3ZhciBzPW5ldyBpLmRlZmF1bHQoZSk7cmV0dXJuIHMuYnVmZmVyVmVydGV4KHIpLHMuYnVmZmVyVGV4Q29vcmQobikscy5idWZmZXJJbmRleChhKSxzLmJ1ZmZlck5vcm1hbCh1KSxzfSx1LmJpZ1RyaWFuZ2xlPWZ1bmN0aW9uKCl7aWYoIW8pe3ZhciB0PVsyLDEsMF0sZT1bWy0xLC0xXSxbLTEsNF0sWzQsLTFdXTtvPW5ldyBpLmRlZmF1bHQsby5idWZmZXJEYXRhKGUsXCJhUG9zaXRpb25cIiwyKSxvLmJ1ZmZlckluZGV4KHQpfXJldHVybiBvfSxlLmRlZmF1bHQ9dSx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7dC5leHBvcnRzPSFyKDI1KShmdW5jdGlvbigpe3JldHVybiA3IT1PYmplY3QuZGVmaW5lUHJvcGVydHkoe30sXCJhXCIse2dldDpmdW5jdGlvbigpe3JldHVybiA3fX0pLmF9KX0sZnVuY3Rpb24odCxlKXt2YXIgcj17fS5oYXNPd25Qcm9wZXJ0eTt0LmV4cG9ydHM9ZnVuY3Rpb24odCxlKXtyZXR1cm4gci5jYWxsKHQsZSl9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigyNCksYT1yKDcwKSxpPXIoNTApLHU9T2JqZWN0LmRlZmluZVByb3BlcnR5O2UuZj1yKDE3KT9PYmplY3QuZGVmaW5lUHJvcGVydHk6ZnVuY3Rpb24odCxlLHIpe2lmKG4odCksZT1pKGUsITApLG4ociksYSl0cnl7cmV0dXJuIHUodCxlLHIpfWNhdGNoKG8pe31pZihcImdldFwiaW4gcnx8XCJzZXRcImluIHIpdGhyb3cgVHlwZUVycm9yKFwiQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhXCIpO3JldHVyblwidmFsdWVcImluIHImJih0W2VdPXIudmFsdWUpLHR9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigxNCksYT1yKDEwKSxpPXIoNjgpLHU9cigyMSksbz1cInByb3RvdHlwZVwiLHM9ZnVuY3Rpb24odCxlLHIpe3ZhciBsLGYsaCxjPXQmcy5GLGQ9dCZzLkcsdj10JnMuUyxfPXQmcy5QLG09dCZzLkIscD10JnMuVyxNPWQ/YTphW2VdfHwoYVtlXT17fSkseD1NW29dLGc9ZD9uOnY/bltlXToobltlXXx8e30pW29dO2QmJihyPWUpO2ZvcihsIGluIHIpZj0hYyYmZyYmdm9pZCAwIT09Z1tsXSxmJiZsIGluIE18fChoPWY/Z1tsXTpyW2xdLE1bbF09ZCYmXCJmdW5jdGlvblwiIT10eXBlb2YgZ1tsXT9yW2xdOm0mJmY/aShoLG4pOnAmJmdbbF09PWg/ZnVuY3Rpb24odCl7dmFyIGU9ZnVuY3Rpb24oZSxyLG4pe2lmKHRoaXMgaW5zdGFuY2VvZiB0KXtzd2l0Y2goYXJndW1lbnRzLmxlbmd0aCl7Y2FzZSAwOnJldHVybiBuZXcgdDtjYXNlIDE6cmV0dXJuIG5ldyB0KGUpO2Nhc2UgMjpyZXR1cm4gbmV3IHQoZSxyKX1yZXR1cm4gbmV3IHQoZSxyLG4pfXJldHVybiB0LmFwcGx5KHRoaXMsYXJndW1lbnRzKX07cmV0dXJuIGVbb109dFtvXSxlfShoKTpfJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBoP2koRnVuY3Rpb24uY2FsbCxoKTpoLF8mJigoTS52aXJ0dWFsfHwoTS52aXJ0dWFsPXt9KSlbbF09aCx0JnMuUiYmeCYmIXhbbF0mJnUoeCxsLGgpKSl9O3MuRj0xLHMuRz0yLHMuUz00LHMuUD04LHMuQj0xNixzLlc9MzIscy5VPTY0LHMuUj0xMjgsdC5leHBvcnRzPXN9LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDE5KSxhPXIoMjkpO3QuZXhwb3J0cz1yKDE3KT9mdW5jdGlvbih0LGUscil7cmV0dXJuIG4uZih0LGUsYSgxLHIpKX06ZnVuY3Rpb24odCxlLHIpe3JldHVybiB0W2VdPXIsdH19LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDQ4KShcIndrc1wiKSxhPXIoMzApLGk9cigxNCkuU3ltYm9sLHU9XCJmdW5jdGlvblwiPT10eXBlb2YgaSxvPXQuZXhwb3J0cz1mdW5jdGlvbih0KXtyZXR1cm4gblt0XXx8KG5bdF09dSYmaVt0XXx8KHU/aTphKShcIlN5bWJvbC5cIit0KSl9O28uc3RvcmU9bn0sZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiByKHQsZSl7aWYoISh0IGluc3RhbmNlb2YgZSkpdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgbj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQodCxlKXtmb3IodmFyIHI9MDtyPGUubGVuZ3RoO3IrKyl7dmFyIG49ZVtyXTtuLmVudW1lcmFibGU9bi5lbnVtZXJhYmxlfHwhMSxuLmNvbmZpZ3VyYWJsZT0hMCxcInZhbHVlXCJpbiBuJiYobi53cml0YWJsZT0hMCksT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsbi5rZXksbil9fXJldHVybiBmdW5jdGlvbihlLHIsbil7cmV0dXJuIHImJnQoZS5wcm90b3R5cGUsciksbiYmdChlLG4pLGV9fSgpLGE9NjAsaT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXtyKHRoaXMsdCksdGhpcy5fZGVsYXlUYXNrcz1bXSx0aGlzLl9uZXh0VGFza3M9W10sdGhpcy5fZGVmZXJUYXNrcz1bXSx0aGlzLl9oaWdoVGFza3M9W10sdGhpcy5fdXN1cnBUYXNrPVtdLHRoaXMuX2VudGVyZnJhbWVUYXNrcz1bXSx0aGlzLl9pZFRhYmxlPTAsdGhpcy5fbG9vcCgpfXJldHVybiBuKHQsW3trZXk6XCJhZGRFRlwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7ZT1lfHxbXTt2YXIgcj10aGlzLl9pZFRhYmxlO3JldHVybiB0aGlzLl9lbnRlcmZyYW1lVGFza3Nbcl09e2Z1bmM6dCxwYXJhbXM6ZX0sdGhpcy5faWRUYWJsZSsrLHJ9fSx7a2V5OlwicmVtb3ZlRUZcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdm9pZCAwIT09dGhpcy5fZW50ZXJmcmFtZVRhc2tzW3RdJiYodGhpcy5fZW50ZXJmcmFtZVRhc2tzW3RdPW51bGwpLC0xfX0se2tleTpcImRlbGF5XCIsdmFsdWU6ZnVuY3Rpb24odCxlLHIpe3ZhciBuPShuZXcgRGF0ZSkuZ2V0VGltZSgpLGE9e2Z1bmM6dCxwYXJhbXM6ZSxkZWxheTpyLHRpbWU6bn07dGhpcy5fZGVsYXlUYXNrcy5wdXNoKGEpfX0se2tleTpcImRlZmVyXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgcj17ZnVuYzp0LHBhcmFtczplfTt0aGlzLl9kZWZlclRhc2tzLnB1c2gocil9fSx7a2V5OlwibmV4dFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dmFyIHI9e2Z1bmM6dCxwYXJhbXM6ZX07dGhpcy5fbmV4dFRhc2tzLnB1c2gocil9fSx7a2V5OlwidXN1cnBcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciByPXtmdW5jOnQscGFyYW1zOmV9O3RoaXMuX3VzdXJwVGFzay5wdXNoKHIpfX0se2tleTpcIl9wcm9jZXNzXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD0wLGU9dm9pZCAwLHI9dm9pZCAwLG49dm9pZCAwO2Zvcih0PTA7dDx0aGlzLl9lbnRlcmZyYW1lVGFza3MubGVuZ3RoO3QrKyllPXRoaXMuX2VudGVyZnJhbWVUYXNrc1t0XSxudWxsIT09ZSYmdm9pZCAwIT09ZSYmZS5mdW5jKGUucGFyYW1zKTtmb3IoO3RoaXMuX2hpZ2hUYXNrcy5sZW5ndGg+MDspZT10aGlzLl9oaWdoVGFza3MucG9wKCksZS5mdW5jKGUucGFyYW1zKTt2YXIgaT0obmV3IERhdGUpLmdldFRpbWUoKTtmb3IodD0wO3Q8dGhpcy5fZGVsYXlUYXNrcy5sZW5ndGg7dCsrKWU9dGhpcy5fZGVsYXlUYXNrc1t0XSxpLWUudGltZT5lLmRlbGF5JiYoZS5mdW5jKGUucGFyYW1zKSx0aGlzLl9kZWxheVRhc2tzLnNwbGljZSh0LDEpKTtmb3IoaT0obmV3IERhdGUpLmdldFRpbWUoKSxyPTFlMy9hO3RoaXMuX2RlZmVyVGFza3MubGVuZ3RoPjA7KXtpZihlPXRoaXMuX2RlZmVyVGFza3Muc2hpZnQoKSxuPShuZXcgRGF0ZSkuZ2V0VGltZSgpLCEocj5uLWkpKXt0aGlzLl9kZWZlclRhc2tzLnVuc2hpZnQoZSk7YnJlYWt9ZS5mdW5jKGUucGFyYW1zKX1mb3IoaT0obmV3IERhdGUpLmdldFRpbWUoKSxyPTFlMy9hO3RoaXMuX3VzdXJwVGFzay5sZW5ndGg+MDspZT10aGlzLl91c3VycFRhc2suc2hpZnQoKSxuPShuZXcgRGF0ZSkuZ2V0VGltZSgpLHI+bi1pJiZlLmZ1bmMoZS5wYXJhbXMpO3RoaXMuX2hpZ2hUYXNrcz10aGlzLl9oaWdoVGFza3MuY29uY2F0KHRoaXMuX25leHRUYXNrcyksdGhpcy5fbmV4dFRhc2tzPVtdLHRoaXMuX3VzdXJwVGFzaz1bXX19LHtrZXk6XCJfbG9vcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpczt0aGlzLl9wcm9jZXNzKCksd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe3JldHVybiB0Ll9sb29wKCl9KX19XSksdH0oKSx1PW5ldyBpO2UuZGVmYXVsdD11fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigyNik7dC5leHBvcnRzPWZ1bmN0aW9uKHQpe2lmKCFuKHQpKXRocm93IFR5cGVFcnJvcih0K1wiIGlzIG5vdCBhbiBvYmplY3QhXCIpO3JldHVybiB0fX0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9ZnVuY3Rpb24odCl7dHJ5e3JldHVybiEhdCgpfWNhdGNoKGUpe3JldHVybiEwfX19LGZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPWZ1bmN0aW9uKHQpe3JldHVyblwib2JqZWN0XCI9PXR5cGVvZiB0P251bGwhPT10OlwiZnVuY3Rpb25cIj09dHlwZW9mIHR9fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoMSksaT1uKGEpLHU9cigyKSxvPW4odSkscz1yKDcpLGw9bihzKSxmPXIoMzIpLGg9bihmKSxjPXIoNjUpLGQ9bihjKSx2PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXt2YXIgcj1hcmd1bWVudHMubGVuZ3RoPD0xfHx2b2lkIDA9PT1hcmd1bWVudHNbMV0/MDphcmd1bWVudHNbMV0sbj1hcmd1bWVudHMubGVuZ3RoPD0yfHx2b2lkIDA9PT1hcmd1bWVudHNbMl0/MDphcmd1bWVudHNbMl07YXJndW1lbnRzLmxlbmd0aDw9M3x8dm9pZCAwPT09YXJndW1lbnRzWzNdP3t9OmFyZ3VtZW50c1szXTsoMCxpLmRlZmF1bHQpKHRoaXMsdCksdGhpcy5zaGFkZXI9bmV3IGwuZGVmYXVsdChkLmRlZmF1bHQuYmlnVHJpYW5nbGVWZXJ0LGUpLHRoaXMuX3dpZHRoPXIsdGhpcy5faGVpZ2h0PW4sdGhpcy5fdW5pZm9ybXM9e30sdGhpcy5faGFzT3duRmJvPXRoaXMuX3dpZHRoPjAmJnRoaXMuX3dpZHRoPjAsdGhpcy5fdW5pZm9ybXM9e30sdGhpcy5faGFzT3duRmJvJiYodGhpcy5fZmJvPW5ldyBoLmRlZmF1bHQodGhpcy5fd2lkdGgsdGhpcy5oZWlnaHQsbVBhcm1hcykpfXJldHVybigwLG8uZGVmYXVsdCkodCxbe2tleTpcInVuaWZvcm1cIix2YWx1ZTpmdW5jdGlvbih0LGUpe3RoaXMuX3VuaWZvcm1zW3RdPWV9fSx7a2V5OlwicmVuZGVyXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5zaGFkZXIuYmluZCgpLHRoaXMuc2hhZGVyLnVuaWZvcm0oXCJ0ZXh0dXJlXCIsXCJ1bmlmb3JtMWlcIiwwKSx0LmJpbmQoMCksdGhpcy5zaGFkZXIudW5pZm9ybSh0aGlzLl91bmlmb3Jtcyl9fSx7a2V5Olwid2lkdGhcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fd2lkdGh9fSx7a2V5OlwiaGVpZ2h0XCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2hlaWdodH19LHtrZXk6XCJmYm9cIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fZmJvfX0se2tleTpcImhhc0Zib1wiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9oYXNPd25GYm99fV0pLHR9KCk7ZS5kZWZhdWx0PXYsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoNzUpLGE9cig0MCk7dC5leHBvcnRzPU9iamVjdC5rZXlzfHxmdW5jdGlvbih0KXtyZXR1cm4gbih0LGEpfX0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9ZnVuY3Rpb24odCxlKXtyZXR1cm57ZW51bWVyYWJsZTohKDEmdCksY29uZmlndXJhYmxlOiEoMiZ0KSx3cml0YWJsZTohKDQmdCksdmFsdWU6ZX19fSxmdW5jdGlvbih0LGUpe3ZhciByPTAsbj1NYXRoLnJhbmRvbSgpO3QuZXhwb3J0cz1mdW5jdGlvbih0KXtyZXR1cm5cIlN5bWJvbChcIi5jb25jYXQodm9pZCAwPT09dD9cIlwiOnQsXCIpX1wiLCgrK3IrbikudG9TdHJpbmcoMzYpKX19LGZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPVwiLy8gc2ltcGxlQ29sb3IuZnJhZ1xcblxcbiNkZWZpbmUgU0hBREVSX05BTUUgU0lNUExFX0NPTE9SXFxuXFxucHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XFxuI2RlZmluZSBHTFNMSUZZIDFcXG5cXG51bmlmb3JtIHZlYzMgY29sb3I7XFxudW5pZm9ybSBmbG9hdCBvcGFjaXR5O1xcblxcbnZvaWQgbWFpbih2b2lkKSB7XFxuICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoY29sb3IsIG9wYWNpdHkpO1xcbn1cIn0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1mdW5jdGlvbiBhKHQpe3JldHVybiAwIT09dCYmISh0JnQtMSl9T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGk9cigxKSx1PW4oaSksbz1yKDIpLHM9bihvKSxsPXIoMyksZj1uKGwpLGg9cigzMyksYz1uKGgpLGQ9dm9pZCAwLHY9dm9pZCAwLF89ITEsbT12b2lkIDAscD1mdW5jdGlvbigpe3JldHVybiBmLmRlZmF1bHQud2ViZ2wyPyEwOihtPWYuZGVmYXVsdC5nZXRFeHRlbnNpb24oXCJXRUJHTF9kcmF3X2J1ZmZlcnNcIiksISFtKX0sTT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSxyKXt2YXIgbj1hcmd1bWVudHMubGVuZ3RoPD0yfHx2b2lkIDA9PT1hcmd1bWVudHNbMl0/e306YXJndW1lbnRzWzJdLGk9YXJndW1lbnRzLmxlbmd0aDw9M3x8dm9pZCAwPT09YXJndW1lbnRzWzNdPyExOmFyZ3VtZW50c1szXTsoMCx1LmRlZmF1bHQpKHRoaXMsdCksZD1mLmRlZmF1bHQuZ2wsdj1mLmRlZmF1bHQuY2hlY2tFeHRlbnNpb24oXCJXRUJHTF9kZXB0aF90ZXh0dXJlXCIpLHRoaXMud2lkdGg9ZSx0aGlzLmhlaWdodD1yLHRoaXMuX211bHRpcGxlVGFyZ2V0cz1pLHRoaXMubWFnRmlsdGVyPW4ubWFnRmlsdGVyfHxkLkxJTkVBUix0aGlzLm1pbkZpbHRlcj1uLm1pbkZpbHRlcnx8ZC5MSU5FQVJfTUlQTUFQX05FQVJFU1QsXG50aGlzLndyYXBTPW4ud3JhcFN8fGQuQ0xBTVBfVE9fRURHRSx0aGlzLndyYXBUPW4ud3JhcFR8fGQuQ0xBTVBfVE9fRURHRSx0aGlzLnVzZURlcHRoPW4udXNlRGVwdGh8fCEwLHRoaXMudXNlU3RlbmNpbD1uLnVzZVN0ZW5jaWx8fCExLHRoaXMudGV4ZWxUeXBlPW4udHlwZSxhKHRoaXMud2lkdGgpJiZhKHRoaXMuaGVpZ2h0KXx8KHRoaXMud3JhcFM9dGhpcy53cmFwVD1kLkNMQU1QX1RPX0VER0UsdGhpcy5taW5GaWx0ZXI9PT1kLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCYmKHRoaXMubWluRmlsdGVyPWQuTElORUFSKSksX3x8cCgpLHRoaXMuX2luaXQoKX1yZXR1cm4oMCxzLmRlZmF1bHQpKHQsW3trZXk6XCJfaW5pdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9ZC5VTlNJR05FRF9CWVRFO2lmKHRoaXMudGV4ZWxUeXBlJiYodD10aGlzLnRleGVsVHlwZSksdGhpcy50ZXhlbFR5cGU9dCx0aGlzLl90ZXh0dXJlcz1bXSx0aGlzLl9pbml0VGV4dHVyZXMoKSx0aGlzLmZyYW1lQnVmZmVyPWQuY3JlYXRlRnJhbWVidWZmZXIoKSxkLmJpbmRGcmFtZWJ1ZmZlcihkLkZSQU1FQlVGRkVSLHRoaXMuZnJhbWVCdWZmZXIpLGYuZGVmYXVsdC53ZWJnbDIpe2Zvcih2YXIgZT1bXSxyPTA7cjx0aGlzLl90ZXh0dXJlcy5sZW5ndGg7cisrKWQuZnJhbWVidWZmZXJUZXh0dXJlMkQoZC5EUkFXX0ZSQU1FQlVGRkVSLGQuQ09MT1JfQVRUQUNITUVOVDArcixkLlRFWFRVUkVfMkQsdGhpcy5fdGV4dHVyZXNbcl0udGV4dHVyZSwwKSxlLnB1c2goZFtcIkNPTE9SX0FUVEFDSE1FTlRcIityXSk7ZC5kcmF3QnVmZmVycyhlKSxkLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGQuRFJBV19GUkFNRUJVRkZFUixkLkRFUFRIX0FUVEFDSE1FTlQsZC5URVhUVVJFXzJELHRoaXMuZ2xEZXB0aFRleHR1cmUudGV4dHVyZSwwKX1lbHNle2Zvcih2YXIgbj0wO248dGhpcy5fdGV4dHVyZXMubGVuZ3RoO24rKylkLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGQuRlJBTUVCVUZGRVIsZC5DT0xPUl9BVFRBQ0hNRU5UMCtuLGQuVEVYVFVSRV8yRCx0aGlzLl90ZXh0dXJlc1tuXS50ZXh0dXJlLDApO3RoaXMuX211bHRpcGxlVGFyZ2V0cyYmbS5kcmF3QnVmZmVyc1dFQkdMKFttLkNPTE9SX0FUVEFDSE1FTlQwX1dFQkdMLG0uQ09MT1JfQVRUQUNITUVOVDFfV0VCR0wsbS5DT0xPUl9BVFRBQ0hNRU5UMl9XRUJHTCxtLkNPTE9SX0FUVEFDSE1FTlQzX1dFQkdMXSksdiYmZC5mcmFtZWJ1ZmZlclRleHR1cmUyRChkLkZSQU1FQlVGRkVSLGQuREVQVEhfQVRUQUNITUVOVCxkLlRFWFRVUkVfMkQsdGhpcy5nbERlcHRoVGV4dHVyZS50ZXh0dXJlLDApfWlmKHRoaXMubWluRmlsdGVyPT09ZC5MSU5FQVJfTUlQTUFQX05FQVJFU1QpZm9yKHZhciBhPTA7YTx0aGlzLl90ZXh0dXJlcy5sZW5ndGg7YSsrKWQuYmluZFRleHR1cmUoZC5URVhUVVJFXzJELHRoaXMuX3RleHR1cmVzW2FdLnRleHR1cmUpLGQuZ2VuZXJhdGVNaXBtYXAoZC5URVhUVVJFXzJEKTt2YXIgaT1kLmNoZWNrRnJhbWVidWZmZXJTdGF0dXMoZC5GUkFNRUJVRkZFUik7aSE9ZC5GUkFNRUJVRkZFUl9DT01QTEVURSYmY29uc29sZS5sb2coXCJHTF9GUkFNRUJVRkZFUl9DT01QTEVURSBmYWlsZWQsIENBTk5PVCB1c2UgRnJhbWVidWZmZXJcIiksZC5iaW5kVGV4dHVyZShkLlRFWFRVUkVfMkQsbnVsbCksZC5iaW5kUmVuZGVyYnVmZmVyKGQuUkVOREVSQlVGRkVSLG51bGwpLGQuYmluZEZyYW1lYnVmZmVyKGQuRlJBTUVCVUZGRVIsbnVsbCksdGhpcy5jbGVhcigpfX0se2tleTpcIl9pbml0VGV4dHVyZXNcIix2YWx1ZTpmdW5jdGlvbigpe2Zvcih2YXIgdD0odGhpcy5fbXVsdGlwbGVUYXJnZXRzPzQ6MSwwKTs0PnQ7dCsrKXt2YXIgZT10aGlzLl9jcmVhdGVUZXh0dXJlKCk7dGhpcy5fdGV4dHVyZXMucHVzaChlKX1mLmRlZmF1bHQud2ViZ2wyP3RoaXMuZ2xEZXB0aFRleHR1cmU9dGhpcy5fY3JlYXRlVGV4dHVyZShkLkRFUFRIX0NPTVBPTkVOVDE2LGQuVU5TSUdORURfU0hPUlQsZC5ERVBUSF9DT01QT05FTlQsITApOnRoaXMuZ2xEZXB0aFRleHR1cmU9dGhpcy5fY3JlYXRlVGV4dHVyZShkLkRFUFRIX0NPTVBPTkVOVCxkLlVOU0lHTkVEX1NIT1JUKX19LHtrZXk6XCJfY3JlYXRlVGV4dHVyZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1hcmd1bWVudHMubGVuZ3RoPD0zfHx2b2lkIDA9PT1hcmd1bWVudHNbM10/ITE6YXJndW1lbnRzWzNdO3ZvaWQgMD09PXQmJih0PWQuUkdCQSksdm9pZCAwPT09ZSYmKGU9dGhpcy50ZXhlbFR5cGUpLHJ8fChyPXQpO3ZhciBhPWQuY3JlYXRlVGV4dHVyZSgpLGk9bmV3IGMuZGVmYXVsdChhLCEwKSx1PW4/Zi5kZWZhdWx0Lk5FQVJFU1Q6dGhpcy5tYWdGaWx0ZXIsbz1uP2YuZGVmYXVsdC5ORUFSRVNUOnRoaXMubWluRmlsdGVyO3JldHVybiBkLmJpbmRUZXh0dXJlKGQuVEVYVFVSRV8yRCxhKSxkLnRleFBhcmFtZXRlcmkoZC5URVhUVVJFXzJELGQuVEVYVFVSRV9NQUdfRklMVEVSLHUpLGQudGV4UGFyYW1ldGVyaShkLlRFWFRVUkVfMkQsZC5URVhUVVJFX01JTl9GSUxURVIsbyksZC50ZXhQYXJhbWV0ZXJpKGQuVEVYVFVSRV8yRCxkLlRFWFRVUkVfV1JBUF9TLHRoaXMud3JhcFMpLGQudGV4UGFyYW1ldGVyaShkLlRFWFRVUkVfMkQsZC5URVhUVVJFX1dSQVBfVCx0aGlzLndyYXBUKSxkLnRleEltYWdlMkQoZC5URVhUVVJFXzJELDAsdCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0LDAscixlLG51bGwpLGQuYmluZFRleHR1cmUoZC5URVhUVVJFXzJELG51bGwpLGl9fSx7a2V5OlwiYmluZFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aDw9MHx8dm9pZCAwPT09YXJndW1lbnRzWzBdPyEwOmFyZ3VtZW50c1swXTt0JiZmLmRlZmF1bHQudmlld3BvcnQoMCwwLHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpLGQuYmluZEZyYW1lYnVmZmVyKGQuRlJBTUVCVUZGRVIsdGhpcy5mcmFtZUJ1ZmZlcil9fSx7a2V5OlwidW5iaW5kXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPD0wfHx2b2lkIDA9PT1hcmd1bWVudHNbMF0/ITA6YXJndW1lbnRzWzBdO3QmJmYuZGVmYXVsdC52aWV3cG9ydCgwLDAsZi5kZWZhdWx0LndpZHRoLGYuZGVmYXVsdC5oZWlnaHQpLGQuYmluZEZyYW1lYnVmZmVyKGQuRlJBTUVCVUZGRVIsbnVsbCl9fSx7a2V5OlwiY2xlYXJcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg8PTB8fHZvaWQgMD09PWFyZ3VtZW50c1swXT8wOmFyZ3VtZW50c1swXSxlPWFyZ3VtZW50cy5sZW5ndGg8PTF8fHZvaWQgMD09PWFyZ3VtZW50c1sxXT8wOmFyZ3VtZW50c1sxXSxyPWFyZ3VtZW50cy5sZW5ndGg8PTJ8fHZvaWQgMD09PWFyZ3VtZW50c1syXT8wOmFyZ3VtZW50c1syXSxuPWFyZ3VtZW50cy5sZW5ndGg8PTN8fHZvaWQgMD09PWFyZ3VtZW50c1szXT8wOmFyZ3VtZW50c1szXTt0aGlzLmJpbmQoKSxmLmRlZmF1bHQuY2xlYXIodCxlLHIsbiksdGhpcy51bmJpbmQoKX19LHtrZXk6XCJnZXRUZXh0dXJlXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPD0wfHx2b2lkIDA9PT1hcmd1bWVudHNbMF0/MDphcmd1bWVudHNbMF07cmV0dXJuIHRoaXMuX3RleHR1cmVzW3RdfX0se2tleTpcImdldERlcHRoVGV4dHVyZVwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ2xEZXB0aFRleHR1cmV9fSx7a2V5OlwibWluRmlsdGVyXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHQhPT1kLkxJTkVBUiYmdCE9PWQuTkVBUkVTVCYmdCE9PWQuTElORUFSX01JUE1BUF9ORUFSRVNUP3RoaXM6KHRoaXMubWluRmlsdGVyPXQsdGhpcyl9fSx7a2V5OlwibWFnRmlsdGVyXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHQhPT1kLkxJTkVBUiYmdCE9PWQuTkVBUkVTVCYmdCE9PWQuTElORUFSX01JUE1BUF9ORUFSRVNUP3RoaXM6KHRoaXMubWFnRmlsdGVyPXQsdGhpcyl9fSx7a2V5Olwid3JhcFNcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gdCE9PWQuQ0xBTVBfVE9fRURHRSYmdCE9PWQuUkVQRUFUJiZ0IT09ZC5NSVJST1JFRF9SRVBFQVQ/dGhpczoodGhpcy53cmFwUz10LHRoaXMpfX0se2tleTpcIndyYXBUXCIsdmFsdWU6ZnVuY3Rpb24odCl7cmV0dXJuIHQhPT1kLkNMQU1QX1RPX0VER0UmJnQhPT1kLlJFUEVBVCYmdCE9PWQuTUlSUk9SRURfUkVQRUFUP3RoaXM6KHRoaXMud3JhcFQ9dCx0aGlzKX19XSksdH0oKTtlLmRlZmF1bHQ9TSx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fWZ1bmN0aW9uIGEodCl7cmV0dXJuIDAhPT10JiYhKHQmdC0xKX1mdW5jdGlvbiBpKHQpe3ZhciBlPXQud2lkdGh8fHQudmlkZW9XaWR0aCxyPXQuaGVpZ2h0fHx0LnZpZGVvSGVpZ2h0O3JldHVybiBlJiZyP2EoZSkmJmEocik6ITF9T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIHU9cigxKSxvPW4odSkscz1yKDIpLGw9bihzKSxmPXIoMyksaD1uKGYpLGM9dm9pZCAwLGQ9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUpe3ZhciByPWFyZ3VtZW50cy5sZW5ndGg8PTF8fHZvaWQgMD09PWFyZ3VtZW50c1sxXT8hMTphcmd1bWVudHNbMV0sbj1hcmd1bWVudHMubGVuZ3RoPD0yfHx2b2lkIDA9PT1hcmd1bWVudHNbMl0/e306YXJndW1lbnRzWzJdO2lmKCgwLG8uZGVmYXVsdCkodGhpcyx0KSxjPWguZGVmYXVsdC5nbCxyKXRoaXMuX3RleHR1cmU9ZTtlbHNle3RoaXMuX21Tb3VyY2U9ZSx0aGlzLl90ZXh0dXJlPWMuY3JlYXRlVGV4dHVyZSgpLHRoaXMuX2lzVmlkZW89XCJWSURFT1wiPT09ZS50YWdOYW1lLHRoaXMuX3ByZW11bHRpcGx5QWxwaGE9ITAsdGhpcy5fbWFnRmlsdGVyPW4ubWFnRmlsdGVyfHxjLkxJTkVBUix0aGlzLl9taW5GaWx0ZXI9bi5taW5GaWx0ZXJ8fGMuTkVBUkVTVF9NSVBNQVBfTElORUFSLHRoaXMuX3dyYXBTPW4ud3JhcFN8fGMuTUlSUk9SRURfUkVQRUFULHRoaXMuX3dyYXBUPW4ud3JhcFR8fGMuTUlSUk9SRURfUkVQRUFUO3ZhciBhPWUud2lkdGh8fGUudmlkZW9XaWR0aDthP2koZSl8fCh0aGlzLl93cmFwUz10aGlzLl93cmFwVD1jLkNMQU1QX1RPX0VER0UsdGhpcy5fbWluRmlsdGVyPT09Yy5ORUFSRVNUX01JUE1BUF9MSU5FQVImJih0aGlzLl9taW5GaWx0ZXI9Yy5MSU5FQVIpKToodGhpcy5fd3JhcFM9dGhpcy5fd3JhcFQ9Yy5DTEFNUF9UT19FREdFLHRoaXMuX21pbkZpbHRlcj09PWMuTkVBUkVTVF9NSVBNQVBfTElORUFSJiYodGhpcy5fbWluRmlsdGVyPWMuTElORUFSKSksYy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfMkQsdGhpcy5fdGV4dHVyZSksYy5waXhlbFN0b3JlaShjLlVOUEFDS19GTElQX1lfV0VCR0wsITApLGUuZXhwb3N1cmU/Yy50ZXhJbWFnZTJEKGMuVEVYVFVSRV8yRCwwLGMuUkdCQSxlLnNoYXBlWzBdLGUuc2hhcGVbMV0sMCxjLlJHQkEsYy5GTE9BVCxlLmRhdGEpOmMudGV4SW1hZ2UyRChjLlRFWFRVUkVfMkQsMCxjLlJHQkEsYy5SR0JBLGMuVU5TSUdORURfQllURSxlKSxjLnRleFBhcmFtZXRlcmkoYy5URVhUVVJFXzJELGMuVEVYVFVSRV9NQUdfRklMVEVSLHRoaXMuX21hZ0ZpbHRlciksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV8yRCxjLlRFWFRVUkVfTUlOX0ZJTFRFUix0aGlzLl9taW5GaWx0ZXIpLGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX1dSQVBfUyx0aGlzLl93cmFwUyksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV8yRCxjLlRFWFRVUkVfV1JBUF9ULHRoaXMuX3dyYXBUKTt2YXIgdT1oLmRlZmF1bHQuZ2V0RXh0ZW5zaW9uKFwiRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljXCIpO2lmKHUpe3ZhciBzPWMuZ2V0UGFyYW1ldGVyKHUuTUFYX1RFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhUKTtjLnRleFBhcmFtZXRlcmYoYy5URVhUVVJFXzJELHUuVEVYVFVSRV9NQVhfQU5JU09UUk9QWV9FWFQscyl9dGhpcy5fY2FuR2VuZXJhdGVNaXBtYXAoKSYmYy5nZW5lcmF0ZU1pcG1hcChjLlRFWFRVUkVfMkQpLGMuYmluZFRleHR1cmUoYy5URVhUVVJFXzJELG51bGwpfX1yZXR1cm4oMCxsLmRlZmF1bHQpKHQsW3trZXk6XCJnZW5lcmF0ZU1pcG1hcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fY2FuR2VuZXJhdGVNaXBtYXAoKSYmKGMuYmluZFRleHR1cmUoYy5URVhUVVJFXzJELHRoaXMuX3RleHR1cmUpLGMuZ2VuZXJhdGVNaXBtYXAoYy5URVhUVVJFXzJEKSxjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCxudWxsKSl9fSx7a2V5OlwidXBkYXRlVGV4dHVyZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3QmJih0aGlzLl9tU291cmNlPXQpLGMuYmluZFRleHR1cmUoYy5URVhUVVJFXzJELHRoaXMuX3RleHR1cmUpLGMucGl4ZWxTdG9yZWkoYy5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCEwKSxjLnRleEltYWdlMkQoYy5URVhUVVJFXzJELDAsYy5SR0JBLGMuUkdCQSxjLlVOU0lHTkVEX0JZVEUsdGhpcy5fbVNvdXJjZSksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV8yRCxjLlRFWFRVUkVfTUFHX0ZJTFRFUix0aGlzLl9tYWdGaWx0ZXIpLGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX01JTl9GSUxURVIsdGhpcy5fbWluRmlsdGVyKSx0aGlzLl9jYW5HZW5lcmF0ZU1pcG1hcCgpJiZjLmdlbmVyYXRlTWlwbWFwKGMuVEVYVFVSRV8yRCksYy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfMkQsbnVsbCl9fSx7a2V5OlwiYmluZFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZvaWQgMD09PXQmJih0PTApLGguZGVmYXVsdC5zaGFkZXImJihjLmFjdGl2ZVRleHR1cmUoYy5URVhUVVJFMCt0KSxjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCx0aGlzLl90ZXh0dXJlKSx0aGlzLl9iaW5kSW5kZXg9dCl9fSx7a2V5OlwiX2NhbkdlbmVyYXRlTWlwbWFwXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbWluRmlsdGVyPT09Yy5MSU5FQVJfTUlQTUFQX05FQVJFU1R8fHRoaXMuX21pbkZpbHRlcj09PWMuTkVBUkVTVF9NSVBNQVBfTElORUFSfHx0aGlzLl9taW5GaWx0ZXI9PT1jLkxJTkVBUl9NSVBNQVBfTElORUFSfHx0aGlzLl9taW5GaWx0ZXI9PT1jLk5FQVJFU1RfTUlQTUFQX05FQVJFU1R9fSx7a2V5OlwibWluRmlsdGVyXCIsc2V0OmZ1bmN0aW9uKHQpe3JldHVybiB0IT09Yy5MSU5FQVImJnQhPT1jLk5FQVJFU1QmJnQhPT1jLk5FQVJFU1RfTUlQTUFQX0xJTkVBUiYmdCE9PWMuTkVBUkVTVF9NSVBNQVBfTElORUFSJiZ0IT09Yy5MSU5FQVJfTUlQTUFQX0xJTkVBUiYmdCE9PWMuTkVBUkVTVF9NSVBNQVBfTkVBUkVTVD90aGlzOih0aGlzLl9taW5GaWx0ZXI9dCxjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCx0aGlzLl90ZXh0dXJlKSxjLnRleFBhcmFtZXRlcmkoYy5URVhUVVJFXzJELGMuVEVYVFVSRV9NSU5fRklMVEVSLHRoaXMuX21pbkZpbHRlciksdm9pZCBjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCxudWxsKSl9LGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9taW5GaWx0ZXJ9fSx7a2V5OlwibWFnRmlsdGVyXCIsc2V0OmZ1bmN0aW9uKHQpe3JldHVybiB0IT09Yy5MSU5FQVImJnQhPT1jLk5FQVJFU1Q/dGhpczoodGhpcy5fbWFnRmlsdGVyPXQsYy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfMkQsdGhpcy5fdGV4dHVyZSksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV8yRCxjLlRFWFRVUkVfTUFHX0ZJTFRFUix0aGlzLl9tYWdGaWx0ZXIpLHZvaWQgYy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfMkQsbnVsbCkpfSxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbWFnRmlsdGVyfX0se2tleTpcIndyYXBTXCIsc2V0OmZ1bmN0aW9uKHQpe3JldHVybiB0IT09Yy5DTEFNUF9UT19FREdFJiZ0IT09Yy5SRVBFQVQmJnQhPT1jLk1JUlJPUkVEX1JFUEVBVD90aGlzOih0aGlzLl93cmFwUz10LGMuYmluZFRleHR1cmUoYy5URVhUVVJFXzJELHRoaXMuX3RleHR1cmUpLGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX1dSQVBfUyx0aGlzLl93cmFwUyksdm9pZCBjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCxudWxsKSl9LGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl93cmFwU319LHtrZXk6XCJ3cmFwVFwiLHNldDpmdW5jdGlvbih0KXtyZXR1cm4gdCE9PWMuQ0xBTVBfVE9fRURHRSYmdCE9PWMuUkVQRUFUJiZ0IT09Yy5NSVJST1JFRF9SRVBFQVQ/dGhpczoodGhpcy5fd3JhcFQ9dCxjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCx0aGlzLl90ZXh0dXJlKSxjLnRleFBhcmFtZXRlcmkoYy5URVhUVVJFXzJELGMuVEVYVFVSRV9XUkFQX1QsdGhpcy5fd3JhcFQpLHZvaWQgYy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfMkQsbnVsbCkpfSxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fd3JhcFR9fSx7a2V5OlwicHJlbXVsdGlwbHlBbHBoYVwiLHNldDpmdW5jdGlvbih0KXt0aGlzLl9wcmVtdWx0aXBseUFscGhhPXQsYy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfMkQsdGhpcy5fdGV4dHVyZSksY29uc29sZS5sb2coXCJwcmVtdWx0aXBseUFscGhhOlwiLHQpLGMucGl4ZWxTdG9yZWkoYy5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsdGhpcy5fcHJlbXVsdGlwbHlBbHBoYSksYy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfMkQsbnVsbCl9LGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9wcmVtdWx0aXBseUFscGhhfX0se2tleTpcInRleHR1cmVcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fdGV4dHVyZX19XSksdH0oKSx2PXZvaWQgMCxfPXZvaWQgMCxtPXZvaWQgMDtkLndoaXRlVGV4dHVyZT1mdW5jdGlvbigpe2lmKHZvaWQgMD09PXYpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7dC53aWR0aD10LmhlaWdodD00O3ZhciBlPXQuZ2V0Q29udGV4dChcIjJkXCIpO2UuZmlsbFN0eWxlPVwiI2ZmZlwiLGUuZmlsbFJlY3QoMCwwLDQsNCksdj1uZXcgZCh0KX1yZXR1cm4gdn0sZC5ncmV5VGV4dHVyZT1mdW5jdGlvbigpe2lmKHZvaWQgMD09PV8pe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7dC53aWR0aD10LmhlaWdodD00O3ZhciBlPXQuZ2V0Q29udGV4dChcIjJkXCIpO2UuZmlsbFN0eWxlPVwicmdiKDEyNywgMTI3LCAxMjcpXCIsZS5maWxsUmVjdCgwLDAsNCw0KSxfPW5ldyBkKHQpfXJldHVybiBffSxkLmJsYWNrVGV4dHVyZT1mdW5jdGlvbigpe2lmKHZvaWQgMD09PW0pe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7dC53aWR0aD10LmhlaWdodD00O3ZhciBlPXQuZ2V0Q29udGV4dChcIjJkXCIpO2UuZmlsbFN0eWxlPVwicmdiKDEyNywgMTI3LCAxMjcpXCIsZS5maWxsUmVjdCgwLDAsNCw0KSxtPW5ldyBkKHQpfXJldHVybiBtfSxlLmRlZmF1bHQ9ZCx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoMSksaT1uKGEpLHU9cigyKSxvPW4odSkscz1yKDgpLGw9bihzKSxmPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpeygwLGkuZGVmYXVsdCkodGhpcyx0KSx0aGlzLl9tYXRyaXg9bC5kZWZhdWx0Lm1hdDQuY3JlYXRlKCksdGhpcy5fcXVhdD1sLmRlZmF1bHQucXVhdC5jcmVhdGUoKSx0aGlzLl9vcmllbnRhdGlvbj1sLmRlZmF1bHQubWF0NC5jcmVhdGUoKSx0aGlzLl9wcm9qZWN0aW9uPWwuZGVmYXVsdC5tYXQ0LmNyZWF0ZSgpLHRoaXMucG9zaXRpb249bC5kZWZhdWx0LnZlYzMuY3JlYXRlKCl9cmV0dXJuKDAsby5kZWZhdWx0KSh0LFt7a2V5OlwibG9va0F0XCIsdmFsdWU6ZnVuY3Rpb24odCxlKXt2YXIgcj1hcmd1bWVudHMubGVuZ3RoPD0yfHx2b2lkIDA9PT1hcmd1bWVudHNbMl0/WzAsMSwwXTphcmd1bWVudHNbMl07dGhpcy5fZXllPXZlYzMuY2xvbmUodCksdGhpcy5fY2VudGVyPXZlYzMuY2xvbmUoZSksbC5kZWZhdWx0LnZlYzMuY29weSh0aGlzLnBvc2l0aW9uLHQpLGwuZGVmYXVsdC5tYXQ0LmlkZW50aXR5KHRoaXMuX21hdHJpeCksbC5kZWZhdWx0Lm1hdDQubG9va0F0KHRoaXMuX21hdHJpeCx0LGUscil9fSx7a2V5Olwic2V0RnJvbU9yaWVudGF0aW9uXCIsdmFsdWU6ZnVuY3Rpb24odCxlLHIsbil7bC5kZWZhdWx0LnF1YXQuc2V0KHRoaXMuX3F1YXQsdCxlLHIsbiksbC5kZWZhdWx0Lm1hdDQuZnJvbVF1YXQodGhpcy5fb3JpZW50YXRpb24sdGhpcy5fcXVhdCksbC5kZWZhdWx0Lm1hdDQudHJhbnNsYXRlKHRoaXMuX21hdHJpeCx0aGlzLl9vcmllbnRhdGlvbix0aGlzLnBvc2l0aW9uT2Zmc2V0KX19LHtrZXk6XCJzZXRQcm9qZWN0aW9uXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5fcHJvamVjdGlvbj1sLmRlZmF1bHQubWF0NC5jbG9uZSh0KX19LHtrZXk6XCJzZXRWaWV3XCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5fbWF0cml4PWwuZGVmYXVsdC5tYXQ0LmNsb25lKHQpfX0se2tleTpcInNldEZyb21WaWV3UHJvalwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dGhpcy5zZXRWaWV3KHQpLHRoaXMuc2V0UHJvamVjdGlvbihlKX19LHtrZXk6XCJtYXRyaXhcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbWF0cml4fX0se2tleTpcInZpZXdNYXRyaXhcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbWF0cml4fX0se2tleTpcInByb2plY3Rpb25cIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcHJvamVjdGlvbn19LHtrZXk6XCJwcm9qZWN0aW9uTWF0cml4XCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3Byb2plY3Rpb259fSx7a2V5OlwiZXllXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2V5ZX19LHtrZXk6XCJjZW50ZXJcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fY2VudGVyfX1dKSx0fSgpO2UuZGVmYXVsdD1mLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cig0KSxpPW4oYSksdT1yKDEpLG89bih1KSxzPXIoMiksbD1uKHMpLGY9cig2KSxoPW4oZiksYz1yKDUpLGQ9bihjKSx2PXIoMzQpLF89bih2KSxtPXIoNTgpLHA9bihtKSxNPXIoOCkseD1uKE0pLGc9eC5kZWZhdWx0Lm1hdDQsRT14LmRlZmF1bHQudmVjMyxiPWcuY3JlYXRlKCkseT1FLmNyZWF0ZSgpLFM9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSgpe3JldHVybigwLG8uZGVmYXVsdCkodGhpcyxlKSwoMCxoLmRlZmF1bHQpKHRoaXMsKDAsaS5kZWZhdWx0KShlKS5hcHBseSh0aGlzLGFyZ3VtZW50cykpfXJldHVybigwLGQuZGVmYXVsdCkoZSx0KSwoMCxsLmRlZmF1bHQpKGUsW3trZXk6XCJzZXRQZXJzcGVjdGl2ZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxyLG4pe3RoaXMuX2Zvdj10LHRoaXMuX25lYXI9cix0aGlzLl9mYXI9bix0aGlzLl9hc3BlY3RSYXRpbz1lLHguZGVmYXVsdC5tYXQ0LnBlcnNwZWN0aXZlKHRoaXMuX3Byb2plY3Rpb24sdCxlLHIsbil9fSx7a2V5Olwic2V0QXNwZWN0UmF0aW9cIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLl9hc3BlY3RSYXRpbz10LHguZGVmYXVsdC5tYXQ0LnBlcnNwZWN0aXZlKHRoaXMucHJvamVjdGlvbix0aGlzLl9mb3YsdCx0aGlzLl9uZWFyLHRoaXMuX2Zhcil9fSx7a2V5OlwiZ2VuZXJhdGVSYXlcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciByPXRoaXMucHJvamVjdGlvbk1hdHJpeCxuPXRoaXMudmlld01hdHJpeDtyZXR1cm4gZy5tdWx0aXBseShiLHIsbiksZy5pbnZlcnQoYixiKSxFLnRyYW5zZm9ybU1hdDQoeSx0LGIpLEUuc3ViKHkseSx0aGlzLnBvc2l0aW9uKSxFLm5vcm1hbGl6ZSh5LHkpLGU/KGUub3JpZ2luPXRoaXMucG9zaXRpb24sZS5kaXJlY3Rpb249eSk6ZT1uZXcgcC5kZWZhdWx0KHRoaXMucG9zaXRpb24seSksZX19XSksZX0oXy5kZWZhdWx0KTtlLmRlZmF1bHQ9Uyx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoMSksaT1uKGEpLHU9cigyKSxvPW4odSkscz1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXt2YXIgZT10aGlzLHI9YXJndW1lbnRzLmxlbmd0aDw9MHx8dm9pZCAwPT09YXJndW1lbnRzWzBdPyExOmFyZ3VtZW50c1swXTsoMCxpLmRlZmF1bHQpKHRoaXMsdCksdGhpcy5fcmVxPW5ldyBYTUxIdHRwUmVxdWVzdCx0aGlzLl9yZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIixmdW5jdGlvbih0KXtyZXR1cm4gZS5fb25Mb2FkZWQodCl9KSx0aGlzLl9yZXEuYWRkRXZlbnRMaXN0ZW5lcihcInByb2dyZXNzXCIsZnVuY3Rpb24odCl7cmV0dXJuIGUuX29uUHJvZ3Jlc3ModCl9KSxyJiYodGhpcy5fcmVxLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCIpfXJldHVybigwLG8uZGVmYXVsdCkodCxbe2tleTpcImxvYWRcIix2YWx1ZTpmdW5jdGlvbih0LGUpe2NvbnNvbGUubG9nKFwiTG9hZGluZyA6IFwiLHQpLHRoaXMuX2NhbGxiYWNrPWUsdGhpcy5fcmVxLm9wZW4oXCJHRVRcIix0KSx0aGlzLl9yZXEuc2VuZCgpfX0se2tleTpcIl9vbkxvYWRlZFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fY2FsbGJhY2sodGhpcy5fcmVxLnJlc3BvbnNlKX19LHtrZXk6XCJfb25Qcm9ncmVzc1wiLHZhbHVlOmZ1bmN0aW9uKCl7fX1dKSx0fSgpO2UuZGVmYXVsdD1zLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cigxKSxpPW4oYSksdT1yKDIpLG89bih1KSxzPXIoMjMpLGw9bihzKSxmPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXt2YXIgcj10aGlzLG49YXJndW1lbnRzLmxlbmd0aDw9MXx8dm9pZCAwPT09YXJndW1lbnRzWzFdPy4xOmFyZ3VtZW50c1sxXTsoMCxpLmRlZmF1bHQpKHRoaXMsdCksdGhpcy5lYXNpbmc9bix0aGlzLl92YWx1ZT1lLHRoaXMuX3RhcmdldFZhbHVlPWUsdGhpcy5fZWZJbmRleD1sLmRlZmF1bHQuYWRkRUYoZnVuY3Rpb24oKXtyZXR1cm4gci5fdXBkYXRlKCl9KX1yZXR1cm4oMCxvLmRlZmF1bHQpKHQsW3trZXk6XCJfdXBkYXRlXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD0xZS00O3RoaXMuX2NoZWNrTGltaXQoKSx0aGlzLl92YWx1ZSs9KHRoaXMuX3RhcmdldFZhbHVlLXRoaXMuX3ZhbHVlKSp0aGlzLmVhc2luZyxNYXRoLmFicyh0aGlzLl90YXJnZXRWYWx1ZS10aGlzLl92YWx1ZSk8dCYmKHRoaXMuX3ZhbHVlPXRoaXMuX3RhcmdldFZhbHVlKX19LHtrZXk6XCJzZXRUb1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuX3RhcmdldFZhbHVlPXRoaXMuX3ZhbHVlPXR9fSx7a2V5OlwiYWRkXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5fdGFyZ2V0VmFsdWUrPXR9fSx7a2V5OlwibGltaXRcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3JldHVybiB0PmU/dm9pZCB0aGlzLmxpbWl0KGUsdCk6KHRoaXMuX21pbj10LHRoaXMuX21heD1lLHZvaWQgdGhpcy5fY2hlY2tMaW1pdCgpKX19LHtrZXk6XCJfY2hlY2tMaW1pdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dm9pZCAwIT09dGhpcy5fbWluJiZ0aGlzLl90YXJnZXRWYWx1ZTx0aGlzLl9taW4mJih0aGlzLl90YXJnZXRWYWx1ZT10aGlzLl9taW4pLHZvaWQgMCE9PXRoaXMuX21heCYmdGhpcy5fdGFyZ2V0VmFsdWU+dGhpcy5fbWF4JiYodGhpcy5fdGFyZ2V0VmFsdWU9dGhpcy5fbWF4KX19LHtrZXk6XCJkZXN0cm95XCIsdmFsdWU6ZnVuY3Rpb24oKXtsLmRlZmF1bHQucmVtb3ZlRUYodGhpcy5fZWZJbmRleCl9fSx7a2V5OlwidmFsdWVcIixzZXQ6ZnVuY3Rpb24odCl7dGhpcy5fdGFyZ2V0VmFsdWU9dH0sZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3ZhbHVlfX0se2tleTpcInRhcmdldFZhbHVlXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3RhcmdldFZhbHVlfX1dKSx0fSgpO2UuZGVmYXVsdD1mLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19ZS5fX2VzTW9kdWxlPSEwO3ZhciBhPXIoMTIyKSxpPW4oYSksdT1yKDEyMSksbz1uKHUpLHM9XCJmdW5jdGlvblwiPT10eXBlb2Ygby5kZWZhdWx0JiZcInN5bWJvbFwiPT10eXBlb2YgaS5kZWZhdWx0P2Z1bmN0aW9uKHQpe3JldHVybiB0eXBlb2YgdH06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIG8uZGVmYXVsdCYmdC5jb25zdHJ1Y3Rvcj09PW8uZGVmYXVsdD9cInN5bWJvbFwiOnR5cGVvZiB0fTtlLmRlZmF1bHQ9XCJmdW5jdGlvblwiPT10eXBlb2Ygby5kZWZhdWx0JiZcInN5bWJvbFwiPT09cyhpLmRlZmF1bHQpP2Z1bmN0aW9uKHQpe3JldHVyblwidW5kZWZpbmVkXCI9PXR5cGVvZiB0P1widW5kZWZpbmVkXCI6cyh0KX06ZnVuY3Rpb24odCl7cmV0dXJuIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIG8uZGVmYXVsdCYmdC5jb25zdHJ1Y3Rvcj09PW8uZGVmYXVsdD9cInN5bWJvbFwiOlwidW5kZWZpbmVkXCI9PXR5cGVvZiB0P1widW5kZWZpbmVkXCI6cyh0KX19LGZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPWZ1bmN0aW9uKHQpe2lmKHZvaWQgMD09dCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIrdCk7cmV0dXJuIHR9fSxmdW5jdGlvbih0LGUpe3QuZXhwb3J0cz1cImNvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsdG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZlwiLnNwbGl0KFwiLFwiKX0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9e319LGZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPSEwfSxmdW5jdGlvbih0LGUscil7dmFyIG49cigyNCksYT1yKDE0MyksaT1yKDQwKSx1PXIoNDcpKFwiSUVfUFJPVE9cIiksbz1mdW5jdGlvbigpe30scz1cInByb3RvdHlwZVwiLGw9ZnVuY3Rpb24oKXt2YXIgdCxlPXIoNjkpKFwiaWZyYW1lXCIpLG49aS5sZW5ndGgsYT1cIj5cIjtmb3IoZS5zdHlsZS5kaXNwbGF5PVwibm9uZVwiLHIoMTM2KS5hcHBlbmRDaGlsZChlKSxlLnNyYz1cImphdmFzY3JpcHQ6XCIsdD1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQsdC5vcGVuKCksdC53cml0ZShcIjxzY3JpcHQ+ZG9jdW1lbnQuRj1PYmplY3Q8L3NjcmlwdFwiK2EpLHQuY2xvc2UoKSxsPXQuRjtuLS07KWRlbGV0ZSBsW3NdW2lbbl1dO3JldHVybiBsKCl9O3QuZXhwb3J0cz1PYmplY3QuY3JlYXRlfHxmdW5jdGlvbih0LGUpe3ZhciByO3JldHVybiBudWxsIT09dD8ob1tzXT1uKHQpLHI9bmV3IG8sb1tzXT1udWxsLHJbdV09dCk6cj1sKCksdm9pZCAwPT09ZT9yOmEocixlKX19LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDQ1KSxhPXIoMjkpLGk9cigxNSksdT1yKDUwKSxvPXIoMTgpLHM9cig3MCksbD1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO2UuZj1yKDE3KT9sOmZ1bmN0aW9uKHQsZSl7aWYodD1pKHQpLGU9dShlLCEwKSxzKXRyeXtyZXR1cm4gbCh0LGUpfWNhdGNoKHIpe31yZXR1cm4gbyh0LGUpP2EoIW4uZi5jYWxsKHQsZSksdFtlXSk6dm9pZCAwfX0sZnVuY3Rpb24odCxlKXtlLmY9e30ucHJvcGVydHlJc0VudW1lcmFibGV9LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDE5KS5mLGE9cigxOCksaT1yKDIyKShcInRvU3RyaW5nVGFnXCIpO3QuZXhwb3J0cz1mdW5jdGlvbih0LGUscil7dCYmIWEodD1yP3Q6dC5wcm90b3R5cGUsaSkmJm4odCxpLHtjb25maWd1cmFibGU6ITAsdmFsdWU6ZX0pfX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoNDgpKFwia2V5c1wiKSxhPXIoMzApO3QuZXhwb3J0cz1mdW5jdGlvbih0KXtyZXR1cm4gblt0XXx8KG5bdF09YSh0KSl9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigxNCksYT1cIl9fY29yZS1qc19zaGFyZWRfX1wiLGk9blthXXx8KG5bYV09e30pO3QuZXhwb3J0cz1mdW5jdGlvbih0KXtyZXR1cm4gaVt0XXx8KGlbdF09e30pfX0sZnVuY3Rpb24odCxlKXt2YXIgcj1NYXRoLmNlaWwsbj1NYXRoLmZsb29yO3QuZXhwb3J0cz1mdW5jdGlvbih0KXtyZXR1cm4gaXNOYU4odD0rdCk/MDoodD4wP246cikodCl9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigyNik7dC5leHBvcnRzPWZ1bmN0aW9uKHQsZSl7aWYoIW4odCkpcmV0dXJuIHQ7dmFyIHIsYTtpZihlJiZcImZ1bmN0aW9uXCI9PXR5cGVvZihyPXQudG9TdHJpbmcpJiYhbihhPXIuY2FsbCh0KSkpcmV0dXJuIGE7aWYoXCJmdW5jdGlvblwiPT10eXBlb2Yocj10LnZhbHVlT2YpJiYhbihhPXIuY2FsbCh0KSkpcmV0dXJuIGE7aWYoIWUmJlwiZnVuY3Rpb25cIj09dHlwZW9mKHI9dC50b1N0cmluZykmJiFuKGE9ci5jYWxsKHQpKSlyZXR1cm4gYTt0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIil9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigxNCksYT1yKDEwKSxpPXIoNDIpLHU9cig1Miksbz1yKDE5KS5mO3QuZXhwb3J0cz1mdW5jdGlvbih0KXt2YXIgZT1hLlN5bWJvbHx8KGEuU3ltYm9sPWk/e306bi5TeW1ib2x8fHt9KTtcIl9cIj09dC5jaGFyQXQoMCl8fHQgaW4gZXx8byhlLHQse3ZhbHVlOnUuZih0KX0pfX0sZnVuY3Rpb24odCxlLHIpe2UuZj1yKDIyKX0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9XCIvLyBiYXNpYy52ZXJ0XFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBCQVNJQ19WRVJURVhcXG5cXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBhVmVydGV4UG9zaXRpb247XFxuYXR0cmlidXRlIHZlYzIgYVRleHR1cmVDb29yZDtcXG5hdHRyaWJ1dGUgdmVjMyBhTm9ybWFsO1xcblxcbnVuaWZvcm0gbWF0NCB1TW9kZWxNYXRyaXg7XFxudW5pZm9ybSBtYXQ0IHVWaWV3TWF0cml4O1xcbnVuaWZvcm0gbWF0NCB1UHJvamVjdGlvbk1hdHJpeDtcXG5cXG52YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiAgICBnbF9Qb3NpdGlvbiA9IHVQcm9qZWN0aW9uTWF0cml4ICogdVZpZXdNYXRyaXggKiB1TW9kZWxNYXRyaXggKiB2ZWM0KGFWZXJ0ZXhQb3NpdGlvbiwgMS4wKTtcXG4gICAgdlRleHR1cmVDb29yZCA9IGFUZXh0dXJlQ29vcmQ7XFxuICAgIHZOb3JtYWwgPSBhTm9ybWFsO1xcbn1cIn0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9XCIvLyBiaWdUcmlhbmdsZS52ZXJ0XFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBCSUdfVFJJQU5HTEVfVkVSVEVYXFxuXFxucHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XFxuI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMiBhUG9zaXRpb247XFxudmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XFxuXFxudm9pZCBtYWluKHZvaWQpIHtcXG4gICAgZ2xfUG9zaXRpb24gPSB2ZWM0KGFQb3NpdGlvbiwgMC4wLCAxLjApO1xcbiAgICB2VGV4dHVyZUNvb3JkID0gYVBvc2l0aW9uICogLjUgKyAuNTtcXG59XCJ9LGZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPVwiLy8gY29weS5mcmFnXFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBDT1BZX0ZSQUdNRU5UXFxuXFxucHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XFxuI2RlZmluZSBHTFNMSUZZIDFcXG5cXG52YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcblxcbnZvaWQgbWFpbih2b2lkKSB7XFxuICAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh0ZXh0dXJlLCB2VGV4dHVyZUNvb3JkKTtcXG59XCJ9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cigxKSxpPW4oYSksdT1yKDIpLG89bih1KSxzPXIoMyksbD1uKHMpLGY9cigxNjcpLGg9bihmKSxjPXZvaWQgMCxkPTEzMTA3Mix2PTcsXz0zMSxtPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXt2YXIgcj1hcmd1bWVudHMubGVuZ3RoPD0xfHx2b2lkIDA9PT1hcmd1bWVudHNbMV0/e306YXJndW1lbnRzWzFdLG49YXJndW1lbnRzLmxlbmd0aDw9Mnx8dm9pZCAwPT09YXJndW1lbnRzWzJdPyExOmFyZ3VtZW50c1syXTtpZigoMCxpLmRlZmF1bHQpKHRoaXMsdCksYz1sLmRlZmF1bHQuZ2wsbilyZXR1cm4gdm9pZCh0aGlzLnRleHR1cmU9ZSk7dmFyIGE9ZS5sZW5ndGg+NjtlWzBdLm1pcG1hcENvdW50JiYoYT1lWzBdLm1pcG1hcENvdW50PjEpLHRoaXMudGV4dHVyZT1jLmNyZWF0ZVRleHR1cmUoKSx0aGlzLm1hZ0ZpbHRlcj1yLm1hZ0ZpbHRlcnx8Yy5MSU5FQVIsdGhpcy5taW5GaWx0ZXI9ci5taW5GaWx0ZXJ8fGMuTElORUFSX01JUE1BUF9MSU5FQVIsdGhpcy53cmFwUz1yLndyYXBTfHxjLkNMQU1QX1RPX0VER0UsdGhpcy53cmFwVD1yLndyYXBUfHxjLkNMQU1QX1RPX0VER0UsYXx8dGhpcy5taW5GaWx0ZXIhPWMuTElORUFSX01JUE1BUF9MSU5FQVJ8fCh0aGlzLm1pbkZpbHRlcj1jLkxJTkVBUiksYy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfQ1VCRV9NQVAsdGhpcy50ZXh0dXJlKTt2YXIgdT1bYy5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1gsYy5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1gsYy5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ksYy5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1ksYy5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1osYy5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1pdLG89MSxzPTA7aWYobz1lLmxlbmd0aC82LHRoaXMubnVtTGV2ZWxzPW8sYSlmb3IodmFyIGY9MDs2PmY7ZisrKWZvcih2YXIgaD0wO28+aDtoKyspYy5waXhlbFN0b3JlaShjLlVOUEFDS19GTElQX1lfV0VCR0wsITEpLHM9ZipvK2gsZVtzXS5zaGFwZT9jLnRleEltYWdlMkQodVtmXSxoLGMuUkdCQSxlW3NdLnNoYXBlWzBdLGVbc10uc2hhcGVbMV0sMCxjLlJHQkEsYy5GTE9BVCxlW3NdLmRhdGEpOmMudGV4SW1hZ2UyRCh1W2ZdLGgsYy5SR0JBLGMuUkdCQSxjLlVOU0lHTkVEX0JZVEUsZVtzXSksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV9DVUJFX01BUCxjLlRFWFRVUkVfV1JBUF9TLHRoaXMud3JhcFMpLGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfQ1VCRV9NQVAsYy5URVhUVVJFX1dSQVBfVCx0aGlzLndyYXBUKSxjLnRleFBhcmFtZXRlcmkoYy5URVhUVVJFX0NVQkVfTUFQLGMuVEVYVFVSRV9NQUdfRklMVEVSLHRoaXMubWFnRmlsdGVyKSxjLnRleFBhcmFtZXRlcmkoYy5URVhUVVJFX0NVQkVfTUFQLGMuVEVYVFVSRV9NSU5fRklMVEVSLHRoaXMubWluRmlsdGVyKTtlbHNle2Zvcih2YXIgZD0wLHY9MDs2PnY7disrKWQ9dipvLGMucGl4ZWxTdG9yZWkoYy5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCExKSxlW2RdLnNoYXBlP2MudGV4SW1hZ2UyRCh1W3ZdLDAsYy5SR0JBLGVbZF0uc2hhcGVbMF0sZVtkXS5zaGFwZVsxXSwwLGMuUkdCQSxjLkZMT0FULGVbZF0uZGF0YSk6Yy50ZXhJbWFnZTJEKHVbdl0sMCxjLlJHQkEsYy5SR0JBLGMuVU5TSUdORURfQllURSxlW2RdKSxjLnRleFBhcmFtZXRlcmkoYy5URVhUVVJFX0NVQkVfTUFQLGMuVEVYVFVSRV9XUkFQX1MsdGhpcy53cmFwUyksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV9DVUJFX01BUCxjLlRFWFRVUkVfV1JBUF9ULHRoaXMud3JhcFQpLGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfQ1VCRV9NQVAsYy5URVhUVVJFX01BR19GSUxURVIsdGhpcy5tYWdGaWx0ZXIpLGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfQ1VCRV9NQVAsYy5URVhUVVJFX01JTl9GSUxURVIsdGhpcy5taW5GaWx0ZXIpO2MuZ2VuZXJhdGVNaXBtYXAoYy5URVhUVVJFX0NVQkVfTUFQKX1jLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV9DVUJFX01BUCxudWxsKX1yZXR1cm4oMCxvLmRlZmF1bHQpKHQsW3trZXk6XCJiaW5kXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPD0wfHx2b2lkIDA9PT1hcmd1bWVudHNbMF0/MDphcmd1bWVudHNbMF07bC5kZWZhdWx0LnNoYWRlciYmKGMuYWN0aXZlVGV4dHVyZShjLlRFWFRVUkUwK3QpLGMuYmluZFRleHR1cmUoYy5URVhUVVJFX0NVQkVfTUFQLHRoaXMudGV4dHVyZSksYy51bmlmb3JtMWkobC5kZWZhdWx0LnNoYWRlci51bmlmb3JtVGV4dHVyZXNbdF0sdCksdGhpcy5fYmluZEluZGV4PXQpfX0se2tleTpcInVuYmluZFwiLHZhbHVlOmZ1bmN0aW9uKCl7Yy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfQ1VCRV9NQVAsbnVsbCl9fV0pLHR9KCk7bS5wYXJzZUREUz1mdW5jdGlvbih0KXt2YXIgZT0oMCxoLmRlZmF1bHQpKHQpLHI9ZS5mbGFncyxuPW5ldyBJbnQzMkFycmF5KHQsMCxfKSxhPTE7ciZkJiYoYT1NYXRoLm1heCgxLG5bdl0pKTt2YXIgaT1lLmltYWdlcy5tYXAoZnVuY3Rpb24oZSl7dmFyIHI9bmV3IEZsb2F0MzJBcnJheSh0LnNsaWNlKGUub2Zmc2V0LGUub2Zmc2V0K2UubGVuZ3RoKSk7cmV0dXJue2RhdGE6cixzaGFwZTplLnNoYXBlLG1pcG1hcENvdW50OmF9fSk7cmV0dXJuIG5ldyBtKGkpfSxlLmRlZmF1bHQ9bSx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoNCksaT1uKGEpLHU9cigxKSxvPW4odSkscz1yKDIpLGw9bihzKSxmPXIoNiksaD1uKGYpLGM9cig1KSxkPW4oYyksdj1yKDM0KSxfPW4odiksbT1yKDgpLHA9bihtKSxNPWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUoKXsoMCxvLmRlZmF1bHQpKHRoaXMsZSk7dmFyIHQ9KDAsaC5kZWZhdWx0KSh0aGlzLCgwLGkuZGVmYXVsdCkoZSkuY2FsbCh0aGlzKSkscj1wLmRlZmF1bHQudmVjMy5jbG9uZShbMCwwLDE1XSksbj1wLmRlZmF1bHQudmVjMy5jcmVhdGUoKSxhPXAuZGVmYXVsdC52ZWMzLmNsb25lKFswLC0xLDBdKTtyZXR1cm4gdC5sb29rQXQocixuLGEpLHQub3J0aG8oMSwtMSwxLC0xKSx0fXJldHVybigwLGQuZGVmYXVsdCkoZSx0KSwoMCxsLmRlZmF1bHQpKGUsW3trZXk6XCJzZXRCb3VuZGFyeVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSxyLG4pe3ZhciBhPWFyZ3VtZW50cy5sZW5ndGg8PTR8fHZvaWQgMD09PWFyZ3VtZW50c1s0XT8uMTphcmd1bWVudHNbNF0saT1hcmd1bWVudHMubGVuZ3RoPD01fHx2b2lkIDA9PT1hcmd1bWVudHNbNV0/MTAwOmFyZ3VtZW50c1s1XTt0aGlzLm9ydGhvKHQsZSxyLG4sYSxpKX19LHtrZXk6XCJvcnRob1wiLHZhbHVlOmZ1bmN0aW9uKHQsZSxyLG4pe3ZhciBhPWFyZ3VtZW50cy5sZW5ndGg8PTR8fHZvaWQgMD09PWFyZ3VtZW50c1s0XT8uMTphcmd1bWVudHNbNF0saT1hcmd1bWVudHMubGVuZ3RoPD01fHx2b2lkIDA9PT1hcmd1bWVudHNbNV0/MTAwOmFyZ3VtZW50c1s1XTt0aGlzLmxlZnQ9dCx0aGlzLnJpZ2h0PWUsdGhpcy50b3A9cix0aGlzLmJvdHRvbT1uLHAuZGVmYXVsdC5tYXQ0Lm9ydGhvKHRoaXMuX3Byb2plY3Rpb24sdCxlLHIsbixhLGkpfX1dKSxlfShfLmRlZmF1bHQpO2UuZGVmYXVsdD1NLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cigxKSxpPW4oYSksdT1yKDIpLG89bih1KSxzPXIoOCksbD1uKHMpLGY9KGwuZGVmYXVsdC5tYXQ0LGwuZGVmYXVsdC52ZWMzKSxoPWYuY3JlYXRlKCksYz1mLmNyZWF0ZSgpLGQ9Zi5jcmVhdGUoKSx2PWYuY3JlYXRlKCksXz1mLmNyZWF0ZSgpLG09Zi5jcmVhdGUoKSxwPWYuY3JlYXRlKCksTT1mLmNyZWF0ZSgpLHg9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUscil7KDAsaS5kZWZhdWx0KSh0aGlzLHQpLHRoaXMub3JpZ2luPWYuY2xvbmUoZSksdGhpcy5kaXJlY3Rpb249Zi5jbG9uZShyKX1yZXR1cm4oMCxvLmRlZmF1bHQpKHQsW3trZXk6XCJhdFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybiBmLmNvcHkodix0aGlzLmRpcmVjdGlvbiksZi5zY2FsZSh2LHYsdCksZi5hZGQodix2LHRoaXMub3JpZ2luKSx2fX0se2tleTpcImxvb2tBdFwiLHZhbHVlOmZ1bmN0aW9uKHQpe2Yuc3ViKHRoaXMuZGlyZWN0aW9uLHQsdGhpcy5vcmlnaW4pLGYubm9ybWFsaXplKHRoaXMub3JpZ2luLHRoaXMub3JpZ2luKX19LHtrZXk6XCJjbG9zZXN0UG9pbnRUb1BvaW50XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9Zi5jcmVhdGUoKTtmLnN1Yih0LHRoaXMub3JpZ2luKTt2YXIgcj1mLmRvdChlLHRoaXMuZGlyZWN0aW9uKTtyZXR1cm4gMD5yP2YuY2xvbmUodGhpcy5vcmlnaW4pOihmLmNvcHkoZSx0aGlzLmRpcmVjdGlvbiksZi5zY2FsZShlLGUsciksZi5hZGQoZSxlLHRoaXMub3JpZ2luKSxlKX19LHtrZXk6XCJkaXN0YW5jZVRvUG9pbnRcIix2YWx1ZTpmdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5zcXJ0KHRoaXMuZGlzdGFuY2VTcVRvUG9pbnQodCkpfX0se2tleTpcImRpc3RhbmNlU3FUb1BvaW50XCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9Zi5jcmVhdGUoKTtmLnN1YihlLHQsdGhpcy5vcmlnaW4pO3ZhciByPWYuZG90KGUsdGhpcy5kaXJlY3Rpb24pO3JldHVybiAwPnI/Zi5zcXVhcmVkRGlzdGFuY2UodGhpcy5vcmlnaW4sdCk6KGYuY29weShlLHRoaXMuZGlyZWN0aW9uKSxmLnNjYWxlKGUsZSxyKSxmLmFkZChlLGUsdGhpcy5vcmlnaW4pLGYuc3F1YXJlZERpc3RhbmNlKGUsdCkpfX0se2tleTpcImludGVyc2VjdHNTcGhlcmVcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLmRpc3RhbmNlVG9Qb2ludCh0KTw9ZX19LHtrZXk6XCJpbnRlcnNlY3RTcGhlcmVcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciByPWYuY3JlYXRlKCk7Zi5zdWIocix0LHRoaXMub3JpZ2luKTt2YXIgbj1mLmRvdChyLHRoaXMuZGlyZWN0aW9uKSxhPWYuZG90KHIsciktbipuLGk9ZSplO2lmKGE+aSlyZXR1cm4gbnVsbDt2YXIgdT1NYXRoLnNxcnQoaS1hKSxvPW4tdSxzPW4rdTtyZXR1cm4gMD5vJiYwPnM/bnVsbDowPm8/dGhpcy5hdChzKTp0aGlzLmF0KG8pfX0se2tleTpcImRpc3RhbmNlVG9QbGFuZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7Zi5kb3QoZSx0aGlzLmRpcmVjdGlvbil9fSx7a2V5OlwiaW50ZXJzZWN0VHJpYW5nbGVcIix2YWx1ZTpmdW5jdGlvbih0LGUscil7dmFyIG49YXJndW1lbnRzLmxlbmd0aDw9M3x8dm9pZCAwPT09YXJndW1lbnRzWzNdPyEwOmFyZ3VtZW50c1szXTtmLmNvcHkoaCx0KSxmLmNvcHkoYyxlKSxmLmNvcHkoZCxyKSxmLnN1YihfLGMsaCksZi5zdWIobSxkLGgpLGYuY3Jvc3MocCxfLG0pO3ZhciBhPWYuZG90KHRoaXMuZGlyZWN0aW9uLHApLGk9dm9pZCAwO2lmKGE+MCl7aWYobilyZXR1cm4gbnVsbDtpPTF9ZWxzZXtpZighKDA+YSkpcmV0dXJuIG51bGw7aT0tMSxhPS1hfWYuc3ViKE0sdGhpcy5vcmlnaW4saCksZi5jcm9zcyhtLE0sbSk7dmFyIHU9aSpmLmRvdCh0aGlzLmRpcmVjdGlvbixtKTtpZigwPnUpcmV0dXJuIG51bGw7Zi5jcm9zcyhfLF8sTSk7dmFyIG89aSpmLmRvdCh0aGlzLmRpcmVjdGlvbixfKTtpZigwPm8pcmV0dXJuIG51bGw7aWYodStvPmEpcmV0dXJuIG51bGw7dmFyIHM9LWkqZi5kb3QoTSxwKTtyZXR1cm4gMD5zP251bGw6dGhpcy5hdChzL2EpfX1dKSx0fSgpO2UuZGVmYXVsdD14LHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cigxKSxpPW4oYSksdT1yKDIpLG89bih1KSxzPXIoOCksbD1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXsoMCxpLmRlZmF1bHQpKHRoaXMsdCksdGhpcy5fbmVlZFVwZGF0ZT0hMCx0aGlzLl94PTAsdGhpcy5feT0wLHRoaXMuX3o9MCx0aGlzLl9zeD0xLHRoaXMuX3N5PTEsdGhpcy5fc3o9MSx0aGlzLl9yeD0wLHRoaXMuX3J5PTAsdGhpcy5fcno9MCx0aGlzLl9wb3NpdGlvbj1zLnZlYzMuY3JlYXRlKCksdGhpcy5fc2NhbGU9cy52ZWMzLmZyb21WYWx1ZXMoMSwxLDEpLHRoaXMuX3JvdGF0aW9uPXMudmVjMy5jcmVhdGUoKSx0aGlzLl9tYXRyaXg9cy5tYXQ0LmNyZWF0ZSgpLHRoaXMuX21hdHJpeFJvdGF0aW9uPXMubWF0NC5jcmVhdGUoKSx0aGlzLl9tYXRyaXhTY2FsZT1zLm1hdDQuY3JlYXRlKCksdGhpcy5fbWF0cml4VHJhbnNsYXRpb249cy5tYXQ0LmNyZWF0ZSgpLHRoaXMuX21hdHJpeFF1YXRlcm5pb249cy5tYXQ0LmNyZWF0ZSgpLHRoaXMuX3F1YXQ9cy5xdWF0LmNyZWF0ZSgpfXJldHVybigwLG8uZGVmYXVsdCkodCxbe2tleTpcIl91cGRhdGVcIix2YWx1ZTpmdW5jdGlvbigpe3MudmVjMy5zZXQodGhpcy5fc2NhbGUsdGhpcy5fc3gsdGhpcy5fc3ksdGhpcy5fc3opLHMudmVjMy5zZXQodGhpcy5fcm90YXRpb24sdGhpcy5fcngsdGhpcy5fcnksdGhpcy5fcnopLHMudmVjMy5zZXQodGhpcy5fcG9zaXRpb24sdGhpcy5feCx0aGlzLl95LHRoaXMuX3opLHMubWF0NC5pZGVudGl0eSh0aGlzLl9tYXRyaXhUcmFuc2xhdGlvbix0aGlzLl9tYXRyaXhUcmFuc2xhdGlvbikscy5tYXQ0LmlkZW50aXR5KHRoaXMuX21hdHJpeFNjYWxlLHRoaXMuX21hdHJpeFNjYWxlKSxzLm1hdDQuaWRlbnRpdHkodGhpcy5fbWF0cml4Um90YXRpb24sdGhpcy5fbWF0cml4Um90YXRpb24pLHMubWF0NC5yb3RhdGVYKHRoaXMuX21hdHJpeFJvdGF0aW9uLHRoaXMuX21hdHJpeFJvdGF0aW9uLHRoaXMuX3J4KSxzLm1hdDQucm90YXRlWSh0aGlzLl9tYXRyaXhSb3RhdGlvbix0aGlzLl9tYXRyaXhSb3RhdGlvbix0aGlzLl9yeSkscy5tYXQ0LnJvdGF0ZVoodGhpcy5fbWF0cml4Um90YXRpb24sdGhpcy5fbWF0cml4Um90YXRpb24sdGhpcy5fcnopLHMubWF0NC5mcm9tUXVhdCh0aGlzLl9tYXRyaXhRdWF0ZXJuaW9uLHRoaXMuX3F1YXQpLHMubWF0NC5tdWwodGhpcy5fbWF0cml4Um90YXRpb24sdGhpcy5fbWF0cml4UXVhdGVybmlvbix0aGlzLl9tYXRyaXhSb3RhdGlvbikscy5tYXQ0LnNjYWxlKHRoaXMuX21hdHJpeFNjYWxlLHRoaXMuX21hdHJpeFNjYWxlLHRoaXMuX3NjYWxlKSxzLm1hdDQudHJhbnNsYXRlKHRoaXMuX21hdHJpeFRyYW5zbGF0aW9uLHRoaXMuX21hdHJpeFRyYW5zbGF0aW9uLHRoaXMuX3Bvc2l0aW9uKSxzLm1hdDQubXVsKHRoaXMuX21hdHJpeCx0aGlzLl9tYXRyaXhUcmFuc2xhdGlvbix0aGlzLl9tYXRyaXhSb3RhdGlvbikscy5tYXQ0Lm11bCh0aGlzLl9tYXRyaXgsdGhpcy5fbWF0cml4LHRoaXMuX21hdHJpeFNjYWxlKSx0aGlzLl9uZWVkVXBkYXRlPSExfX0se2tleTpcInNldFJvdGF0aW9uRnJvbVF1YXRlcm5pb25cIix2YWx1ZTpmdW5jdGlvbih0KXtzLnF1YXQuY29weSh0aGlzLl9xdWF0LHQpLHRoaXMuX25lZWRVcGRhdGU9ITB9fSx7a2V5OlwibWF0cml4XCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX25lZWRVcGRhdGUmJnRoaXMuX3VwZGF0ZSgpLHRoaXMuX21hdHJpeH19LHtrZXk6XCJ4XCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3h9LHNldDpmdW5jdGlvbih0KXt0aGlzLl9uZWVkVXBkYXRlPSEwLHRoaXMuX3g9dH19LHtrZXk6XCJ5XCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3l9LHNldDpmdW5jdGlvbih0KXt0aGlzLl9uZWVkVXBkYXRlPSEwLHRoaXMuX3k9dH19LHtrZXk6XCJ6XCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3p9LHNldDpmdW5jdGlvbih0KXt0aGlzLl9uZWVkVXBkYXRlPSEwLHRoaXMuX3o9dH19LHtrZXk6XCJzY2FsZVhcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc3h9LHNldDpmdW5jdGlvbih0KXt0aGlzLl9uZWVkVXBkYXRlPSEwLHRoaXMuX3N4PXR9fSx7a2V5Olwic2NhbGVZXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3N5fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5fbmVlZFVwZGF0ZT0hMCx0aGlzLl9zeT10fX0se2tleTpcInNjYWxlWlwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zen0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMuX25lZWRVcGRhdGU9ITAsdGhpcy5fc3o9dH19LHtrZXk6XCJyb3RhdGlvblhcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcnh9LHNldDpmdW5jdGlvbih0KXt0aGlzLl9uZWVkVXBkYXRlPSEwLHRoaXMuX3J4PXR9fSx7a2V5Olwicm90YXRpb25ZXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3J5fSxzZXQ6ZnVuY3Rpb24odCl7dGhpcy5fbmVlZFVwZGF0ZT0hMCx0aGlzLl9yeT10fX0se2tleTpcInJvdGF0aW9uWlwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9yen0sc2V0OmZ1bmN0aW9uKHQpe3RoaXMuX25lZWRVcGRhdGU9ITAsdGhpcy5fcno9dH19XSksdH0oKTtlLmRlZmF1bHQ9bCx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoNCksaT1uKGEpLHU9cigxKSxvPW4odSkscz1yKDYpLGw9bihzKSxmPXIoNSksaD1uKGYpLGM9cigzKSxkPW4oYyksdj1yKDI3KSxfPW4odiksbT1yKDE3MikscD1yKDE3MyksTT1yKDE3MSkseD1mdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aDw9MHx8dm9pZCAwPT09YXJndW1lbnRzWzBdPzk6YXJndW1lbnRzWzBdLHI9YXJndW1lbnRzWzFdLG49YXJndW1lbnRzWzJdLGE9YXJndW1lbnRzWzNdLHU9YXJndW1lbnRzLmxlbmd0aDw9NHx8dm9pZCAwPT09YXJndW1lbnRzWzRdP3t9OmFyZ3VtZW50c1s0XTsoMCxvLmRlZmF1bHQpKHRoaXMsZSk7dmFyIHM9dm9pZCAwO3N3aXRjaCh0KXtjYXNlIDU6ZGVmYXVsdDpzPW07YnJlYWs7Y2FzZSA5OnM9cDticmVhaztjYXNlIDEzOnM9TX12YXIgZj0oMCxsLmRlZmF1bHQpKHRoaXMsKDAsaS5kZWZhdWx0KShlKS5jYWxsKHRoaXMscyxuLGEsdSkpO3JldHVybiBmLnVuaWZvcm0oXCJ1RGlyZWN0aW9uXCIsciksZi51bmlmb3JtKFwidVJlc29sdXRpb25cIixbZC5kZWZhdWx0LndpZHRoLGQuZGVmYXVsdC5oZWlnaHRdKSxmfXJldHVybigwLGguZGVmYXVsdCkoZSx0KSxlfShfLmRlZmF1bHQpO2UuZGVmYXVsdD14LHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cig0KSxpPW4oYSksdT1yKDEpLG89bih1KSxzPXIoNiksbD1uKHMpLGY9cig1KSxoPW4oZiksYz1yKDYwKSxkPW4oYyksdj1mdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aDw9MHx8dm9pZCAwPT09YXJndW1lbnRzWzBdPzk6YXJndW1lbnRzWzBdLHI9YXJndW1lbnRzWzFdLG49YXJndW1lbnRzWzJdLGE9YXJndW1lbnRzWzNdO3JldHVybigwLG8uZGVmYXVsdCkodGhpcyxlKSwoMCxsLmRlZmF1bHQpKHRoaXMsKDAsaS5kZWZhdWx0KShlKS5jYWxsKHRoaXMsdCxbMSwwXSxyLG4sYSkpfXJldHVybigwLGguZGVmYXVsdCkoZSx0KSxlfShkLmRlZmF1bHQpO2UuZGVmYXVsdD12LHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cigxKSxpPW4oYSksdT1yKDIpLG89bih1KSxzPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpeygwLGkuZGVmYXVsdCkodGhpcyx0KSx0aGlzLl9wYXNzZXM9W119cmV0dXJuKDAsby5kZWZhdWx0KSh0LFt7a2V5OlwiYWRkUGFzc1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuX3Bhc3Nlcy5wdXNoKHQpfX0se2tleTpcInBhc3Nlc1wiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9wYXNzZXN9fV0pLHR9KCk7ZS5kZWZhdWx0PXMsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDQpLGk9bihhKSx1PXIoMSksbz1uKHUpLHM9cig2KSxsPW4ocyksZj1yKDUpLGg9bihmKSxjPXIoNjApLGQ9bihjKSx2PWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUoKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPD0wfHx2b2lkIDA9PT1hcmd1bWVudHNbMF0/OTphcmd1bWVudHNbMF0scj1hcmd1bWVudHNbMV0sbj1hcmd1bWVudHNbMl0sYT1hcmd1bWVudHNbM107cmV0dXJuKDAsby5kZWZhdWx0KSh0aGlzLGUpLCgwLGwuZGVmYXVsdCkodGhpcywoMCxpLmRlZmF1bHQpKGUpLmNhbGwodGhpcyx0LFswLDFdLHIsbixhKSl9cmV0dXJuKDAsaC5kZWZhdWx0KShlLHQpLGV9KGQuZGVmYXVsdCk7ZS5kZWZhdWx0PXYsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDEpLGk9bihhKSx1PXIoMiksbz1uKHUpLHM9cigzNyksbD1uKHMpLGY9cigyMyksaD1uKGYpLGM9cig4KSxkPW4oYyksdj1mdW5jdGlvbih0LGUpe3ZhciByPWV8fHt9O3JldHVybiB0LnRvdWNoZXM/KHIueD10LnRvdWNoZXNbMF0ucGFnZVgsci55PXQudG91Y2hlc1swXS5wYWdlWSk6KHIueD10LmNsaWVudFgsci55PXQuY2xpZW50WSkscn0sXz1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7dmFyIHI9dGhpcyxuPWFyZ3VtZW50cy5sZW5ndGg8PTF8fHZvaWQgMD09PWFyZ3VtZW50c1sxXT93aW5kb3c6YXJndW1lbnRzWzFdLGE9YXJndW1lbnRzLmxlbmd0aDw9Mnx8dm9pZCAwPT09YXJndW1lbnRzWzJdPzUwMDphcmd1bWVudHNbMl07KDAsaS5kZWZhdWx0KSh0aGlzLHQpLHRoaXMuX3RhcmdldD1lLHRoaXMuX2xpc3RlbmVyVGFyZ2V0PW4sdGhpcy5fbW91c2U9e30sdGhpcy5fcHJlTW91c2U9e30sdGhpcy5jZW50ZXI9ZC5kZWZhdWx0LnZlYzMuY3JlYXRlKCksdGhpcy5fdXA9ZC5kZWZhdWx0LnZlYzMuZnJvbVZhbHVlcygwLDEsMCksdGhpcy5yYWRpdXM9bmV3IGwuZGVmYXVsdChhKSx0aGlzLnBvc2l0aW9uPWQuZGVmYXVsdC52ZWMzLmZyb21WYWx1ZXMoMCwwLHRoaXMucmFkaXVzLnZhbHVlKSx0aGlzLnBvc2l0aW9uT2Zmc2V0PWQuZGVmYXVsdC52ZWMzLmNyZWF0ZSgpLHRoaXMuX3J4PW5ldyBsLmRlZmF1bHQoMCksdGhpcy5fcngubGltaXQoLU1hdGguUEkvMixNYXRoLlBJLzIpLHRoaXMuX3J5PW5ldyBsLmRlZmF1bHQoMCksdGhpcy5fcHJlUlg9MCx0aGlzLl9wcmVSWT0wLHRoaXMuX2lzTG9ja1pvb209ITEsdGhpcy5faXNMb2NrUm90YXRpb249ITEsdGhpcy5faXNJbnZlcnQ9ITEsdGhpcy5zZW5zaXRpdml0eT0xLHRoaXMuX2xpc3RlbmVyVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXdoZWVsXCIsZnVuY3Rpb24odCl7cmV0dXJuIHIuX29uV2hlZWwodCl9KSx0aGlzLl9saXN0ZW5lclRhcmdldC5hZGRFdmVudExpc3RlbmVyKFwiRE9NTW91c2VTY3JvbGxcIixmdW5jdGlvbih0KXtyZXR1cm4gci5fb25XaGVlbCh0KX0pLHRoaXMuX2xpc3RlbmVyVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIixmdW5jdGlvbih0KXtyZXR1cm4gci5fb25Eb3duKHQpfSksdGhpcy5fbGlzdGVuZXJUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIixmdW5jdGlvbih0KXtyZXR1cm4gci5fb25Eb3duKHQpfSksdGhpcy5fbGlzdGVuZXJUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLGZ1bmN0aW9uKHQpe3JldHVybiByLl9vbk1vdmUodCl9KSx0aGlzLl9saXN0ZW5lclRhcmdldC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsZnVuY3Rpb24odCl7cmV0dXJuIHIuX29uTW92ZSh0KX0pLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIixmdW5jdGlvbigpe3JldHVybiByLl9vblVwKCl9KSx3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIixmdW5jdGlvbigpe3JldHVybiByLl9vblVwKCl9KSxoLmRlZmF1bHQuYWRkRUYoZnVuY3Rpb24oKXtyZXR1cm4gci5fbG9vcCgpfSl9cmV0dXJuKDAsby5kZWZhdWx0KSh0LFt7a2V5OlwibG9ja1wiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aDw9MHx8dm9pZCAwPT09YXJndW1lbnRzWzBdPyEwOmFyZ3VtZW50c1swXTt0aGlzLl9pc0xvY2tab29tPXQsdGhpcy5faXNMb2NrUm90YXRpb249dH19LHtrZXk6XCJsb2NrWm9vbVwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aDw9MHx8dm9pZCAwPT09YXJndW1lbnRzWzBdPyEwOmFyZ3VtZW50c1swXTt0aGlzLl9pc0xvY2tab29tPXR9fSx7a2V5OlwibG9ja1JvdGF0aW9uXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPD0wfHx2b2lkIDA9PT1hcmd1bWVudHNbMF0/ITA6YXJndW1lbnRzWzBdO3RoaXMuX2lzTG9ja1JvdGF0aW9uPXR9fSx7a2V5OlwiaW52ZXJzZUNvbnRyb2xcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg8PTB8fHZvaWQgMD09PWFyZ3VtZW50c1swXT8hMDphcmd1bWVudHNbMF07dGhpcy5faXNJbnZlcnQ9dH19LHtrZXk6XCJfb25Eb3duXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5faXNMb2NrUm90YXRpb258fCh0aGlzLl9pc01vdXNlRG93bj0hMCx2KHQsdGhpcy5fbW91c2UpLHYodCx0aGlzLl9wcmVNb3VzZSksdGhpcy5fcHJlUlg9dGhpcy5fcngudGFyZ2V0VmFsdWUsdGhpcy5fcHJlUlk9dGhpcy5fcnkudGFyZ2V0VmFsdWUpfX0se2tleTpcIl9vbk1vdmVcIix2YWx1ZTpmdW5jdGlvbih0KXtpZighdGhpcy5faXNMb2NrUm90YXRpb24mJih2KHQsdGhpcy5fbW91c2UpLHQudG91Y2hlcyYmdC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMuX2lzTW91c2VEb3duKSl7dmFyIGU9LSh0aGlzLl9tb3VzZS54LXRoaXMuX3ByZU1vdXNlLngpO3RoaXMuX2lzSW52ZXJ0JiYoZSo9LTEpLHRoaXMuX3J5LnZhbHVlPXRoaXMuX3ByZVJZLS4wMSplKnRoaXMuc2Vuc2l0aXZpdHk7dmFyIHI9LSh0aGlzLl9tb3VzZS55LXRoaXMuX3ByZU1vdXNlLnkpO3RoaXMuX2lzSW52ZXJ0JiYocio9LTEpLHRoaXMuX3J4LnZhbHVlPXRoaXMuX3ByZVJYLS4wMSpyKnRoaXMuc2Vuc2l0aXZpdHl9fX0se2tleTpcIl9vblVwXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl9pc0xvY2tSb3RhdGlvbnx8KHRoaXMuX2lzTW91c2VEb3duPSExKX19LHtrZXk6XCJfb25XaGVlbFwiLHZhbHVlOmZ1bmN0aW9uKHQpe2lmKCF0aGlzLl9pc0xvY2tab29tKXt2YXIgZT10LndoZWVsRGVsdGEscj10LmRldGFpbCxuPTA7bj1yP2U/ZS9yLzQwKnI+MD8xOi0xOi1yLzM6ZS8xMjAsdGhpcy5yYWRpdXMuYWRkKDIqLW4pfX19LHtrZXk6XCJfbG9vcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fdXBkYXRlUG9zaXRpb24oKSx0aGlzLl90YXJnZXQmJnRoaXMuX3VwZGF0ZUNhbWVyYSgpfX0se2tleTpcIl91cGRhdGVQb3NpdGlvblwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5wb3NpdGlvblsxXT1NYXRoLnNpbih0aGlzLl9yeC52YWx1ZSkqdGhpcy5yYWRpdXMudmFsdWU7dmFyIHQ9TWF0aC5jb3ModGhpcy5fcngudmFsdWUpKnRoaXMucmFkaXVzLnZhbHVlO3RoaXMucG9zaXRpb25bMF09TWF0aC5jb3ModGhpcy5fcnkudmFsdWUrLjUqTWF0aC5QSSkqdCx0aGlzLnBvc2l0aW9uWzJdPU1hdGguc2luKHRoaXMuX3J5LnZhbHVlKy41Kk1hdGguUEkpKnQsZC5kZWZhdWx0LnZlYzMuYWRkKHRoaXMucG9zaXRpb24sdGhpcy5wb3NpdGlvbix0aGlzLnBvc2l0aW9uT2Zmc2V0KX19LHtrZXk6XCJfdXBkYXRlQ2FtZXJhXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLl90YXJnZXQubG9va0F0KHRoaXMucG9zaXRpb24sdGhpcy5jZW50ZXIsdGhpcy5fdXApO1xufX0se2tleTpcInJ4XCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3J4fX0se2tleTpcInJ5XCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3J5fX1dKSx0fSgpO2UuZGVmYXVsdD1fLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cigzMSksaT1uKGEpLHU9cig1NCksbz1uKHUpLHM9cig4MyksbD1uKHMpLGY9cig1NSksaD1uKGYpLGM9cig1MyksZD1uKGMpLHY9cig4NSksXz1uKHYpLG09cig4NCkscD1uKG0pLE09e3NpbXBsZUNvbG9yRnJhZzppLmRlZmF1bHQsYmlnVHJpYW5nbGVWZXJ0Om8uZGVmYXVsdCxnZW5lcmFsVmVydDpsLmRlZmF1bHQsY29weUZyYWc6aC5kZWZhdWx0LGJhc2ljVmVydDpkLmRlZmF1bHQsc2t5Ym94VmVydDpfLmRlZmF1bHQsc2t5Ym94RnJhZzpwLmRlZmF1bHR9O2UuZGVmYXVsdD1NLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZS5kZWZhdWx0PWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdm9pZCAwPT09ZS5jYWNoZUF0dHJpYkxvYyYmKGUuY2FjaGVBdHRyaWJMb2M9e30pLHZvaWQgMD09PWUuY2FjaGVBdHRyaWJMb2Nbcl0mJihlLmNhY2hlQXR0cmliTG9jW3JdPXQuZ2V0QXR0cmliTG9jYXRpb24oZSxyKSksZS5jYWNoZUF0dHJpYkxvY1tyXX0sdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlKXt2YXIgcj17fS50b1N0cmluZzt0LmV4cG9ydHM9ZnVuY3Rpb24odCl7cmV0dXJuIHIuY2FsbCh0KS5zbGljZSg4LC0xKX19LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDEzMik7dC5leHBvcnRzPWZ1bmN0aW9uKHQsZSxyKXtpZihuKHQpLHZvaWQgMD09PWUpcmV0dXJuIHQ7c3dpdGNoKHIpe2Nhc2UgMTpyZXR1cm4gZnVuY3Rpb24ocil7cmV0dXJuIHQuY2FsbChlLHIpfTtjYXNlIDI6cmV0dXJuIGZ1bmN0aW9uKHIsbil7cmV0dXJuIHQuY2FsbChlLHIsbil9O2Nhc2UgMzpyZXR1cm4gZnVuY3Rpb24ocixuLGEpe3JldHVybiB0LmNhbGwoZSxyLG4sYSl9fXJldHVybiBmdW5jdGlvbigpe3JldHVybiB0LmFwcGx5KGUsYXJndW1lbnRzKX19fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigyNiksYT1yKDE0KS5kb2N1bWVudCxpPW4oYSkmJm4oYS5jcmVhdGVFbGVtZW50KTt0LmV4cG9ydHM9ZnVuY3Rpb24odCl7cmV0dXJuIGk/YS5jcmVhdGVFbGVtZW50KHQpOnt9fX0sZnVuY3Rpb24odCxlLHIpe3QuZXhwb3J0cz0hcigxNykmJiFyKDI1KShmdW5jdGlvbigpe3JldHVybiA3IT1PYmplY3QuZGVmaW5lUHJvcGVydHkocig2OSkoXCJkaXZcIiksXCJhXCIse2dldDpmdW5jdGlvbigpe3JldHVybiA3fX0pLmF9KX0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO3ZhciBuPXIoNDIpLGE9cigyMCksaT1yKDc3KSx1PXIoMjEpLG89cigxOCkscz1yKDQxKSxsPXIoMTM5KSxmPXIoNDYpLGg9cig3NCksYz1yKDIyKShcIml0ZXJhdG9yXCIpLGQ9IShbXS5rZXlzJiZcIm5leHRcImluW10ua2V5cygpKSx2PVwiQEBpdGVyYXRvclwiLF89XCJrZXlzXCIsbT1cInZhbHVlc1wiLHA9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpc307dC5leHBvcnRzPWZ1bmN0aW9uKHQsZSxyLE0seCxnLEUpe2wocixlLE0pO3ZhciBiLHksUyxUPWZ1bmN0aW9uKHQpe2lmKCFkJiZ0IGluIEQpcmV0dXJuIERbdF07c3dpdGNoKHQpe2Nhc2UgXzpyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gbmV3IHIodGhpcyx0KX07Y2FzZSBtOnJldHVybiBmdW5jdGlvbigpe3JldHVybiBuZXcgcih0aGlzLHQpfX1yZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gbmV3IHIodGhpcyx0KX19LEk9ZStcIiBJdGVyYXRvclwiLEE9eD09bSxGPSExLEQ9dC5wcm90b3R5cGUsUj1EW2NdfHxEW3ZdfHx4JiZEW3hdLHc9Unx8VCh4KSxQPXg/QT9UKFwiZW50cmllc1wiKTp3OnZvaWQgMCxOPVwiQXJyYXlcIj09ZT9ELmVudHJpZXN8fFI6UjtpZihOJiYoUz1oKE4uY2FsbChuZXcgdCkpLFMhPT1PYmplY3QucHJvdG90eXBlJiYoZihTLEksITApLG58fG8oUyxjKXx8dShTLGMscCkpKSxBJiZSJiZSLm5hbWUhPT1tJiYoRj0hMCx3PWZ1bmN0aW9uKCl7cmV0dXJuIFIuY2FsbCh0aGlzKX0pLG4mJiFFfHwhZCYmIUYmJkRbY118fHUoRCxjLHcpLHNbZV09dyxzW0ldPXAseClpZihiPXt2YWx1ZXM6QT93OlQobSksa2V5czpnP3c6VChfKSxlbnRyaWVzOlB9LEUpZm9yKHkgaW4gYil5IGluIER8fGkoRCx5LGJbeV0pO2Vsc2UgYShhLlArYS5GKihkfHxGKSxlLGIpO3JldHVybiBifX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoNzUpLGE9cig0MCkuY29uY2F0KFwibGVuZ3RoXCIsXCJwcm90b3R5cGVcIik7ZS5mPU9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzfHxmdW5jdGlvbih0KXtyZXR1cm4gbih0LGEpfX0sZnVuY3Rpb24odCxlKXtlLmY9T2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9sc30sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoMTgpLGE9cig3OCksaT1yKDQ3KShcIklFX1BST1RPXCIpLHU9T2JqZWN0LnByb3RvdHlwZTt0LmV4cG9ydHM9T2JqZWN0LmdldFByb3RvdHlwZU9mfHxmdW5jdGlvbih0KXtyZXR1cm4gdD1hKHQpLG4odCxpKT90W2ldOlwiZnVuY3Rpb25cIj09dHlwZW9mIHQuY29uc3RydWN0b3ImJnQgaW5zdGFuY2VvZiB0LmNvbnN0cnVjdG9yP3QuY29uc3RydWN0b3IucHJvdG90eXBlOnQgaW5zdGFuY2VvZiBPYmplY3Q/dTpudWxsfX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoMTgpLGE9cigxNSksaT1yKDEzNCkoITEpLHU9cig0NykoXCJJRV9QUk9UT1wiKTt0LmV4cG9ydHM9ZnVuY3Rpb24odCxlKXt2YXIgcixvPWEodCkscz0wLGw9W107Zm9yKHIgaW4gbylyIT11JiZuKG8scikmJmwucHVzaChyKTtmb3IoO2UubGVuZ3RoPnM7KW4obyxyPWVbcysrXSkmJih+aShsLHIpfHxsLnB1c2gocikpO3JldHVybiBsfX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoMjApLGE9cigxMCksaT1yKDI1KTt0LmV4cG9ydHM9ZnVuY3Rpb24odCxlKXt2YXIgcj0oYS5PYmplY3R8fHt9KVt0XXx8T2JqZWN0W3RdLHU9e307dVt0XT1lKHIpLG4obi5TK24uRippKGZ1bmN0aW9uKCl7cigxKX0pLFwiT2JqZWN0XCIsdSl9fSxmdW5jdGlvbih0LGUscil7dC5leHBvcnRzPXIoMjEpfSxmdW5jdGlvbih0LGUscil7dmFyIG49cigzOSk7dC5leHBvcnRzPWZ1bmN0aW9uKHQpe3JldHVybiBPYmplY3Qobih0KSl9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigxMSksYT17fTthLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciB0PW5ldyBuLkFSUkFZX1RZUEUoOSk7cmV0dXJuIHRbMF09MSx0WzFdPTAsdFsyXT0wLHRbM109MCx0WzRdPTEsdFs1XT0wLHRbNl09MCx0WzddPTAsdFs4XT0xLHR9LGEuZnJvbU1hdDQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzRdLHRbNF09ZVs1XSx0WzVdPWVbNl0sdFs2XT1lWzhdLHRbN109ZVs5XSx0WzhdPWVbMTBdLHR9LGEuY2xvbmU9ZnVuY3Rpb24odCl7dmFyIGU9bmV3IG4uQVJSQVlfVFlQRSg5KTtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGVbNF09dFs0XSxlWzVdPXRbNV0sZVs2XT10WzZdLGVbN109dFs3XSxlWzhdPXRbOF0sZX0sYS5jb3B5PWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzRdPWVbNF0sdFs1XT1lWzVdLHRbNl09ZVs2XSx0WzddPWVbN10sdFs4XT1lWzhdLHR9LGEuZnJvbVZhbHVlcz1mdW5jdGlvbih0LGUscixhLGksdSxvLHMsbCl7dmFyIGY9bmV3IG4uQVJSQVlfVFlQRSg5KTtyZXR1cm4gZlswXT10LGZbMV09ZSxmWzJdPXIsZlszXT1hLGZbNF09aSxmWzVdPXUsZls2XT1vLGZbN109cyxmWzhdPWwsZn0sYS5zZXQ9ZnVuY3Rpb24odCxlLHIsbixhLGksdSxvLHMsbCl7cmV0dXJuIHRbMF09ZSx0WzFdPXIsdFsyXT1uLHRbM109YSx0WzRdPWksdFs1XT11LHRbNl09byx0WzddPXMsdFs4XT1sLHR9LGEuaWRlbnRpdHk9ZnVuY3Rpb24odCl7cmV0dXJuIHRbMF09MSx0WzFdPTAsdFsyXT0wLHRbM109MCx0WzRdPTEsdFs1XT0wLHRbNl09MCx0WzddPTAsdFs4XT0xLHR9LGEudHJhbnNwb3NlPWZ1bmN0aW9uKHQsZSl7aWYodD09PWUpe3ZhciByPWVbMV0sbj1lWzJdLGE9ZVs1XTt0WzFdPWVbM10sdFsyXT1lWzZdLHRbM109cix0WzVdPWVbN10sdFs2XT1uLHRbN109YX1lbHNlIHRbMF09ZVswXSx0WzFdPWVbM10sdFsyXT1lWzZdLHRbM109ZVsxXSx0WzRdPWVbNF0sdFs1XT1lWzddLHRbNl09ZVsyXSx0WzddPWVbNV0sdFs4XT1lWzhdO3JldHVybiB0fSxhLmludmVydD1mdW5jdGlvbih0LGUpe3ZhciByPWVbMF0sbj1lWzFdLGE9ZVsyXSxpPWVbM10sdT1lWzRdLG89ZVs1XSxzPWVbNl0sbD1lWzddLGY9ZVs4XSxoPWYqdS1vKmwsYz0tZippK28qcyxkPWwqaS11KnMsdj1yKmgrbipjK2EqZDtyZXR1cm4gdj8odj0xL3YsdFswXT1oKnYsdFsxXT0oLWYqbithKmwpKnYsdFsyXT0obypuLWEqdSkqdix0WzNdPWMqdix0WzRdPShmKnItYSpzKSp2LHRbNV09KC1vKnIrYSppKSp2LHRbNl09ZCp2LHRbN109KC1sKnIrbipzKSp2LHRbOF09KHUqci1uKmkpKnYsdCk6bnVsbH0sYS5hZGpvaW50PWZ1bmN0aW9uKHQsZSl7dmFyIHI9ZVswXSxuPWVbMV0sYT1lWzJdLGk9ZVszXSx1PWVbNF0sbz1lWzVdLHM9ZVs2XSxsPWVbN10sZj1lWzhdO3JldHVybiB0WzBdPXUqZi1vKmwsdFsxXT1hKmwtbipmLHRbMl09bipvLWEqdSx0WzNdPW8qcy1pKmYsdFs0XT1yKmYtYSpzLHRbNV09YSppLXIqbyx0WzZdPWkqbC11KnMsdFs3XT1uKnMtcipsLHRbOF09cip1LW4qaSx0fSxhLmRldGVybWluYW50PWZ1bmN0aW9uKHQpe3ZhciBlPXRbMF0scj10WzFdLG49dFsyXSxhPXRbM10saT10WzRdLHU9dFs1XSxvPXRbNl0scz10WzddLGw9dFs4XTtyZXR1cm4gZSoobCppLXUqcykrciooLWwqYSt1Km8pK24qKHMqYS1pKm8pfSxhLm11bHRpcGx5PWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1lWzBdLGE9ZVsxXSxpPWVbMl0sdT1lWzNdLG89ZVs0XSxzPWVbNV0sbD1lWzZdLGY9ZVs3XSxoPWVbOF0sYz1yWzBdLGQ9clsxXSx2PXJbMl0sXz1yWzNdLG09cls0XSxwPXJbNV0sTT1yWzZdLHg9cls3XSxnPXJbOF07cmV0dXJuIHRbMF09YypuK2QqdSt2KmwsdFsxXT1jKmErZCpvK3YqZix0WzJdPWMqaStkKnMrdipoLHRbM109XypuK20qdStwKmwsdFs0XT1fKmErbSpvK3AqZix0WzVdPV8qaSttKnMrcCpoLHRbNl09TSpuK3gqdStnKmwsdFs3XT1NKmEreCpvK2cqZix0WzhdPU0qaSt4KnMrZypoLHR9LGEubXVsPWEubXVsdGlwbHksYS50cmFuc2xhdGU9ZnVuY3Rpb24odCxlLHIpe3ZhciBuPWVbMF0sYT1lWzFdLGk9ZVsyXSx1PWVbM10sbz1lWzRdLHM9ZVs1XSxsPWVbNl0sZj1lWzddLGg9ZVs4XSxjPXJbMF0sZD1yWzFdO3JldHVybiB0WzBdPW4sdFsxXT1hLHRbMl09aSx0WzNdPXUsdFs0XT1vLHRbNV09cyx0WzZdPWMqbitkKnUrbCx0WzddPWMqYStkKm8rZix0WzhdPWMqaStkKnMraCx0fSxhLnJvdGF0ZT1mdW5jdGlvbih0LGUscil7dmFyIG49ZVswXSxhPWVbMV0saT1lWzJdLHU9ZVszXSxvPWVbNF0scz1lWzVdLGw9ZVs2XSxmPWVbN10saD1lWzhdLGM9TWF0aC5zaW4ociksZD1NYXRoLmNvcyhyKTtyZXR1cm4gdFswXT1kKm4rYyp1LHRbMV09ZCphK2Mqbyx0WzJdPWQqaStjKnMsdFszXT1kKnUtYypuLHRbNF09ZCpvLWMqYSx0WzVdPWQqcy1jKmksdFs2XT1sLHRbN109Zix0WzhdPWgsdH0sYS5zY2FsZT1mdW5jdGlvbih0LGUscil7dmFyIG49clswXSxhPXJbMV07cmV0dXJuIHRbMF09biplWzBdLHRbMV09biplWzFdLHRbMl09biplWzJdLHRbM109YSplWzNdLHRbNF09YSplWzRdLHRbNV09YSplWzVdLHRbNl09ZVs2XSx0WzddPWVbN10sdFs4XT1lWzhdLHR9LGEuZnJvbVRyYW5zbGF0aW9uPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09MSx0WzFdPTAsdFsyXT0wLHRbM109MCx0WzRdPTEsdFs1XT0wLHRbNl09ZVswXSx0WzddPWVbMV0sdFs4XT0xLHR9LGEuZnJvbVJvdGF0aW9uPWZ1bmN0aW9uKHQsZSl7dmFyIHI9TWF0aC5zaW4oZSksbj1NYXRoLmNvcyhlKTtyZXR1cm4gdFswXT1uLHRbMV09cix0WzJdPTAsdFszXT0tcix0WzRdPW4sdFs1XT0wLHRbNl09MCx0WzddPTAsdFs4XT0xLHR9LGEuZnJvbVNjYWxpbmc9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT1lWzBdLHRbMV09MCx0WzJdPTAsdFszXT0wLHRbNF09ZVsxXSx0WzVdPTAsdFs2XT0wLHRbN109MCx0WzhdPTEsdH0sYS5mcm9tTWF0MmQ9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPTAsdFszXT1lWzJdLHRbNF09ZVszXSx0WzVdPTAsdFs2XT1lWzRdLHRbN109ZVs1XSx0WzhdPTEsdH0sYS5mcm9tUXVhdD1mdW5jdGlvbih0LGUpe3ZhciByPWVbMF0sbj1lWzFdLGE9ZVsyXSxpPWVbM10sdT1yK3Isbz1uK24scz1hK2EsbD1yKnUsZj1uKnUsaD1uKm8sYz1hKnUsZD1hKm8sdj1hKnMsXz1pKnUsbT1pKm8scD1pKnM7cmV0dXJuIHRbMF09MS1oLXYsdFszXT1mLXAsdFs2XT1jK20sdFsxXT1mK3AsdFs0XT0xLWwtdix0WzddPWQtXyx0WzJdPWMtbSx0WzVdPWQrXyx0WzhdPTEtbC1oLHR9LGEubm9ybWFsRnJvbU1hdDQ9ZnVuY3Rpb24odCxlKXt2YXIgcj1lWzBdLG49ZVsxXSxhPWVbMl0saT1lWzNdLHU9ZVs0XSxvPWVbNV0scz1lWzZdLGw9ZVs3XSxmPWVbOF0saD1lWzldLGM9ZVsxMF0sZD1lWzExXSx2PWVbMTJdLF89ZVsxM10sbT1lWzE0XSxwPWVbMTVdLE09cipvLW4qdSx4PXIqcy1hKnUsZz1yKmwtaSp1LEU9bipzLWEqbyxiPW4qbC1pKm8seT1hKmwtaSpzLFM9ZipfLWgqdixUPWYqbS1jKnYsST1mKnAtZCp2LEE9aCptLWMqXyxGPWgqcC1kKl8sRD1jKnAtZCptLFI9TSpELXgqRitnKkErRSpJLWIqVCt5KlM7cmV0dXJuIFI/KFI9MS9SLHRbMF09KG8qRC1zKkYrbCpBKSpSLHRbMV09KHMqSS11KkQtbCpUKSpSLHRbMl09KHUqRi1vKkkrbCpTKSpSLHRbM109KGEqRi1uKkQtaSpBKSpSLHRbNF09KHIqRC1hKkkraSpUKSpSLHRbNV09KG4qSS1yKkYtaSpTKSpSLHRbNl09KF8qeS1tKmIrcCpFKSpSLHRbN109KG0qZy12KnktcCp4KSpSLHRbOF09KHYqYi1fKmcrcCpNKSpSLHQpOm51bGx9LGEuc3RyPWZ1bmN0aW9uKHQpe3JldHVyblwibWF0MyhcIit0WzBdK1wiLCBcIit0WzFdK1wiLCBcIit0WzJdK1wiLCBcIit0WzNdK1wiLCBcIit0WzRdK1wiLCBcIit0WzVdK1wiLCBcIit0WzZdK1wiLCBcIit0WzddK1wiLCBcIit0WzhdK1wiKVwifSxhLmZyb2I9ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh0WzBdLDIpK01hdGgucG93KHRbMV0sMikrTWF0aC5wb3codFsyXSwyKStNYXRoLnBvdyh0WzNdLDIpK01hdGgucG93KHRbNF0sMikrTWF0aC5wb3codFs1XSwyKStNYXRoLnBvdyh0WzZdLDIpK01hdGgucG93KHRbN10sMikrTWF0aC5wb3codFs4XSwyKSl9LGEuYWRkPWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdK3JbMF0sdFsxXT1lWzFdK3JbMV0sdFsyXT1lWzJdK3JbMl0sdFszXT1lWzNdK3JbM10sdFs0XT1lWzRdK3JbNF0sdFs1XT1lWzVdK3JbNV0sdFs2XT1lWzZdK3JbNl0sdFs3XT1lWzddK3JbN10sdFs4XT1lWzhdK3JbOF0sdH0sYS5zdWJ0cmFjdD1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09ZVswXS1yWzBdLHRbMV09ZVsxXS1yWzFdLHRbMl09ZVsyXS1yWzJdLHRbM109ZVszXS1yWzNdLHRbNF09ZVs0XS1yWzRdLHRbNV09ZVs1XS1yWzVdLHRbNl09ZVs2XS1yWzZdLHRbN109ZVs3XS1yWzddLHRbOF09ZVs4XS1yWzhdLHR9LGEuc3ViPWEuc3VidHJhY3QsYS5tdWx0aXBseVNjYWxhcj1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09ZVswXSpyLHRbMV09ZVsxXSpyLHRbMl09ZVsyXSpyLHRbM109ZVszXSpyLHRbNF09ZVs0XSpyLHRbNV09ZVs1XSpyLHRbNl09ZVs2XSpyLHRbN109ZVs3XSpyLHRbOF09ZVs4XSpyLHR9LGEubXVsdGlwbHlTY2FsYXJBbmRBZGQ9ZnVuY3Rpb24odCxlLHIsbil7cmV0dXJuIHRbMF09ZVswXStyWzBdKm4sdFsxXT1lWzFdK3JbMV0qbix0WzJdPWVbMl0rclsyXSpuLHRbM109ZVszXStyWzNdKm4sdFs0XT1lWzRdK3JbNF0qbix0WzVdPWVbNV0rcls1XSpuLHRbNl09ZVs2XStyWzZdKm4sdFs3XT1lWzddK3JbN10qbix0WzhdPWVbOF0rcls4XSpuLHR9LGEuZXhhY3RFcXVhbHM9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT09PWVbMF0mJnRbMV09PT1lWzFdJiZ0WzJdPT09ZVsyXSYmdFszXT09PWVbM10mJnRbNF09PT1lWzRdJiZ0WzVdPT09ZVs1XSYmdFs2XT09PWVbNl0mJnRbN109PT1lWzddJiZ0WzhdPT09ZVs4XX0sYS5lcXVhbHM9ZnVuY3Rpb24odCxlKXt2YXIgcj10WzBdLGE9dFsxXSxpPXRbMl0sdT10WzNdLG89dFs0XSxzPXRbNV0sbD10WzZdLGY9dFs3XSxoPXRbOF0sYz1lWzBdLGQ9ZVsxXSx2PWVbMl0sXz1lWzNdLG09ZVs0XSxwPWVbNV0sTT10WzZdLHg9ZVs3XSxnPWVbOF07cmV0dXJuIE1hdGguYWJzKHItYyk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKHIpLE1hdGguYWJzKGMpKSYmTWF0aC5hYnMoYS1kKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMoYSksTWF0aC5hYnMoZCkpJiZNYXRoLmFicyhpLXYpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhpKSxNYXRoLmFicyh2KSkmJk1hdGguYWJzKHUtXyk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKHUpLE1hdGguYWJzKF8pKSYmTWF0aC5hYnMoby1tKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMobyksTWF0aC5hYnMobSkpJiZNYXRoLmFicyhzLXApPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhzKSxNYXRoLmFicyhwKSkmJk1hdGguYWJzKGwtTSk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKGwpLE1hdGguYWJzKE0pKSYmTWF0aC5hYnMoZi14KTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMoZiksTWF0aC5hYnMoeCkpJiZNYXRoLmFicyhoLWcpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhoKSxNYXRoLmFicyhnKSl9LHQuZXhwb3J0cz1hfSxmdW5jdGlvbih0LGUscil7dmFyIG49cigxMSksYT17fTthLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciB0PW5ldyBuLkFSUkFZX1RZUEUoMyk7cmV0dXJuIHRbMF09MCx0WzFdPTAsdFsyXT0wLHR9LGEuY2xvbmU9ZnVuY3Rpb24odCl7dmFyIGU9bmV3IG4uQVJSQVlfVFlQRSgzKTtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZX0sYS5mcm9tVmFsdWVzPWZ1bmN0aW9uKHQsZSxyKXt2YXIgYT1uZXcgbi5BUlJBWV9UWVBFKDMpO3JldHVybiBhWzBdPXQsYVsxXT1lLGFbMl09cixhfSxhLmNvcHk9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdH0sYS5zZXQ9ZnVuY3Rpb24odCxlLHIsbil7cmV0dXJuIHRbMF09ZSx0WzFdPXIsdFsyXT1uLHR9LGEuYWRkPWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdK3JbMF0sdFsxXT1lWzFdK3JbMV0sdFsyXT1lWzJdK3JbMl0sdH0sYS5zdWJ0cmFjdD1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09ZVswXS1yWzBdLHRbMV09ZVsxXS1yWzFdLHRbMl09ZVsyXS1yWzJdLHR9LGEuc3ViPWEuc3VidHJhY3QsYS5tdWx0aXBseT1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09ZVswXSpyWzBdLHRbMV09ZVsxXSpyWzFdLHRbMl09ZVsyXSpyWzJdLHR9LGEubXVsPWEubXVsdGlwbHksYS5kaXZpZGU9ZnVuY3Rpb24odCxlLHIpe3JldHVybiB0WzBdPWVbMF0vclswXSx0WzFdPWVbMV0vclsxXSx0WzJdPWVbMl0vclsyXSx0fSxhLmRpdj1hLmRpdmlkZSxhLmNlaWw9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT1NYXRoLmNlaWwoZVswXSksdFsxXT1NYXRoLmNlaWwoZVsxXSksdFsyXT1NYXRoLmNlaWwoZVsyXSksdH0sYS5mbG9vcj1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPU1hdGguZmxvb3IoZVswXSksdFsxXT1NYXRoLmZsb29yKGVbMV0pLHRbMl09TWF0aC5mbG9vcihlWzJdKSx0fSxhLm1pbj1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09TWF0aC5taW4oZVswXSxyWzBdKSx0WzFdPU1hdGgubWluKGVbMV0sclsxXSksdFsyXT1NYXRoLm1pbihlWzJdLHJbMl0pLHR9LGEubWF4PWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1NYXRoLm1heChlWzBdLHJbMF0pLHRbMV09TWF0aC5tYXgoZVsxXSxyWzFdKSx0WzJdPU1hdGgubWF4KGVbMl0sclsyXSksdH0sYS5yb3VuZD1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPU1hdGgucm91bmQoZVswXSksdFsxXT1NYXRoLnJvdW5kKGVbMV0pLHRbMl09TWF0aC5yb3VuZChlWzJdKSx0fSxhLnNjYWxlPWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdKnIsdFsxXT1lWzFdKnIsdFsyXT1lWzJdKnIsdH0sYS5zY2FsZUFuZEFkZD1mdW5jdGlvbih0LGUscixuKXtyZXR1cm4gdFswXT1lWzBdK3JbMF0qbix0WzFdPWVbMV0rclsxXSpuLHRbMl09ZVsyXStyWzJdKm4sdH0sYS5kaXN0YW5jZT1mdW5jdGlvbih0LGUpe3ZhciByPWVbMF0tdFswXSxuPWVbMV0tdFsxXSxhPWVbMl0tdFsyXTtyZXR1cm4gTWF0aC5zcXJ0KHIqcituKm4rYSphKX0sYS5kaXN0PWEuZGlzdGFuY2UsYS5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24odCxlKXt2YXIgcj1lWzBdLXRbMF0sbj1lWzFdLXRbMV0sYT1lWzJdLXRbMl07cmV0dXJuIHIqcituKm4rYSphfSxhLnNxckRpc3Q9YS5zcXVhcmVkRGlzdGFuY2UsYS5sZW5ndGg9ZnVuY3Rpb24odCl7dmFyIGU9dFswXSxyPXRbMV0sbj10WzJdO3JldHVybiBNYXRoLnNxcnQoZSplK3IqcituKm4pfSxhLmxlbj1hLmxlbmd0aCxhLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24odCl7dmFyIGU9dFswXSxyPXRbMV0sbj10WzJdO3JldHVybiBlKmUrcipyK24qbn0sYS5zcXJMZW49YS5zcXVhcmVkTGVuZ3RoLGEubmVnYXRlPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09LWVbMF0sdFsxXT0tZVsxXSx0WzJdPS1lWzJdLHR9LGEuaW52ZXJzZT1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPTEvZVswXSx0WzFdPTEvZVsxXSx0WzJdPTEvZVsyXSx0fSxhLm5vcm1hbGl6ZT1mdW5jdGlvbih0LGUpe3ZhciByPWVbMF0sbj1lWzFdLGE9ZVsyXSxpPXIqcituKm4rYSphO3JldHVybiBpPjAmJihpPTEvTWF0aC5zcXJ0KGkpLHRbMF09ZVswXSppLHRbMV09ZVsxXSppLHRbMl09ZVsyXSppKSx0fSxhLmRvdD1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdKmVbMF0rdFsxXSplWzFdK3RbMl0qZVsyXX0sYS5jcm9zcz1mdW5jdGlvbih0LGUscil7dmFyIG49ZVswXSxhPWVbMV0saT1lWzJdLHU9clswXSxvPXJbMV0scz1yWzJdO3JldHVybiB0WzBdPWEqcy1pKm8sdFsxXT1pKnUtbipzLHRbMl09bipvLWEqdSx0fSxhLmxlcnA9ZnVuY3Rpb24odCxlLHIsbil7dmFyIGE9ZVswXSxpPWVbMV0sdT1lWzJdO3JldHVybiB0WzBdPWErbiooclswXS1hKSx0WzFdPWkrbiooclsxXS1pKSx0WzJdPXUrbiooclsyXS11KSx0fSxhLmhlcm1pdGU9ZnVuY3Rpb24odCxlLHIsbixhLGkpe3ZhciB1PWkqaSxvPXUqKDIqaS0zKSsxLHM9dSooaS0yKStpLGw9dSooaS0xKSxmPXUqKDMtMippKTtyZXR1cm4gdFswXT1lWzBdKm8rclswXSpzK25bMF0qbCthWzBdKmYsdFsxXT1lWzFdKm8rclsxXSpzK25bMV0qbCthWzFdKmYsdFsyXT1lWzJdKm8rclsyXSpzK25bMl0qbCthWzJdKmYsdH0sYS5iZXppZXI9ZnVuY3Rpb24odCxlLHIsbixhLGkpe3ZhciB1PTEtaSxvPXUqdSxzPWkqaSxsPW8qdSxmPTMqaSpvLGg9MypzKnUsYz1zKmk7cmV0dXJuIHRbMF09ZVswXSpsK3JbMF0qZituWzBdKmgrYVswXSpjLHRbMV09ZVsxXSpsK3JbMV0qZituWzFdKmgrYVsxXSpjLHRbMl09ZVsyXSpsK3JbMl0qZituWzJdKmgrYVsyXSpjLHR9LGEucmFuZG9tPWZ1bmN0aW9uKHQsZSl7ZT1lfHwxO3ZhciByPTIqbi5SQU5ET00oKSpNYXRoLlBJLGE9MipuLlJBTkRPTSgpLTEsaT1NYXRoLnNxcnQoMS1hKmEpKmU7cmV0dXJuIHRbMF09TWF0aC5jb3MocikqaSx0WzFdPU1hdGguc2luKHIpKmksdFsyXT1hKmUsdH0sYS50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1lWzBdLGE9ZVsxXSxpPWVbMl0sdT1yWzNdKm4rcls3XSphK3JbMTFdKmkrclsxNV07cmV0dXJuIHU9dXx8MSx0WzBdPShyWzBdKm4rcls0XSphK3JbOF0qaStyWzEyXSkvdSx0WzFdPShyWzFdKm4rcls1XSphK3JbOV0qaStyWzEzXSkvdSx0WzJdPShyWzJdKm4rcls2XSphK3JbMTBdKmkrclsxNF0pL3UsdH0sYS50cmFuc2Zvcm1NYXQzPWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1lWzBdLGE9ZVsxXSxpPWVbMl07cmV0dXJuIHRbMF09bipyWzBdK2EqclszXStpKnJbNl0sdFsxXT1uKnJbMV0rYSpyWzRdK2kqcls3XSx0WzJdPW4qclsyXSthKnJbNV0raSpyWzhdLHR9LGEudHJhbnNmb3JtUXVhdD1mdW5jdGlvbih0LGUscil7dmFyIG49ZVswXSxhPWVbMV0saT1lWzJdLHU9clswXSxvPXJbMV0scz1yWzJdLGw9clszXSxmPWwqbitvKmktcyphLGg9bCphK3Mqbi11KmksYz1sKmkrdSphLW8qbixkPS11Km4tbyphLXMqaTtyZXR1cm4gdFswXT1mKmwrZCotdStoKi1zLWMqLW8sdFsxXT1oKmwrZCotbytjKi11LWYqLXMsdFsyXT1jKmwrZCotcytmKi1vLWgqLXUsdH0sYS5yb3RhdGVYPWZ1bmN0aW9uKHQsZSxyLG4pe3ZhciBhPVtdLGk9W107cmV0dXJuIGFbMF09ZVswXS1yWzBdLGFbMV09ZVsxXS1yWzFdLGFbMl09ZVsyXS1yWzJdLGlbMF09YVswXSxpWzFdPWFbMV0qTWF0aC5jb3MobiktYVsyXSpNYXRoLnNpbihuKSxpWzJdPWFbMV0qTWF0aC5zaW4obikrYVsyXSpNYXRoLmNvcyhuKSx0WzBdPWlbMF0rclswXSx0WzFdPWlbMV0rclsxXSx0WzJdPWlbMl0rclsyXSx0fSxhLnJvdGF0ZVk9ZnVuY3Rpb24odCxlLHIsbil7dmFyIGE9W10saT1bXTtyZXR1cm4gYVswXT1lWzBdLXJbMF0sYVsxXT1lWzFdLXJbMV0sYVsyXT1lWzJdLXJbMl0saVswXT1hWzJdKk1hdGguc2luKG4pK2FbMF0qTWF0aC5jb3MobiksaVsxXT1hWzFdLGlbMl09YVsyXSpNYXRoLmNvcyhuKS1hWzBdKk1hdGguc2luKG4pLHRbMF09aVswXStyWzBdLHRbMV09aVsxXStyWzFdLHRbMl09aVsyXStyWzJdLHR9LGEucm90YXRlWj1mdW5jdGlvbih0LGUscixuKXt2YXIgYT1bXSxpPVtdO3JldHVybiBhWzBdPWVbMF0tclswXSxhWzFdPWVbMV0tclsxXSxhWzJdPWVbMl0tclsyXSxpWzBdPWFbMF0qTWF0aC5jb3MobiktYVsxXSpNYXRoLnNpbihuKSxpWzFdPWFbMF0qTWF0aC5zaW4obikrYVsxXSpNYXRoLmNvcyhuKSxpWzJdPWFbMl0sdFswXT1pWzBdK3JbMF0sdFsxXT1pWzFdK3JbMV0sdFsyXT1pWzJdK3JbMl0sdH0sYS5mb3JFYWNoPWZ1bmN0aW9uKCl7dmFyIHQ9YS5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24oZSxyLG4sYSxpLHUpe3ZhciBvLHM7Zm9yKHJ8fChyPTMpLG58fChuPTApLHM9YT9NYXRoLm1pbihhKnIrbixlLmxlbmd0aCk6ZS5sZW5ndGgsbz1uO3M+bztvKz1yKXRbMF09ZVtvXSx0WzFdPWVbbysxXSx0WzJdPWVbbysyXSxpKHQsdCx1KSxlW29dPXRbMF0sZVtvKzFdPXRbMV0sZVtvKzJdPXRbMl07cmV0dXJuIGV9fSgpLGEuYW5nbGU9ZnVuY3Rpb24odCxlKXt2YXIgcj1hLmZyb21WYWx1ZXModFswXSx0WzFdLHRbMl0pLG49YS5mcm9tVmFsdWVzKGVbMF0sZVsxXSxlWzJdKTthLm5vcm1hbGl6ZShyLHIpLGEubm9ybWFsaXplKG4sbik7dmFyIGk9YS5kb3QocixuKTtyZXR1cm4gaT4xPzA6TWF0aC5hY29zKGkpfSxhLnN0cj1mdW5jdGlvbih0KXtyZXR1cm5cInZlYzMoXCIrdFswXStcIiwgXCIrdFsxXStcIiwgXCIrdFsyXStcIilcIn0sYS5leGFjdEVxdWFscz1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPT09ZVswXSYmdFsxXT09PWVbMV0mJnRbMl09PT1lWzJdfSxhLmVxdWFscz1mdW5jdGlvbih0LGUpe3ZhciByPXRbMF0sYT10WzFdLGk9dFsyXSx1PWVbMF0sbz1lWzFdLHM9ZVsyXTtyZXR1cm4gTWF0aC5hYnMoci11KTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMociksTWF0aC5hYnModSkpJiZNYXRoLmFicyhhLW8pPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhhKSxNYXRoLmFicyhvKSkmJk1hdGguYWJzKGktcyk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKGkpLE1hdGguYWJzKHMpKX0sdC5leHBvcnRzPWF9LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDExKSxhPXt9O2EuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIHQ9bmV3IG4uQVJSQVlfVFlQRSg0KTtyZXR1cm4gdFswXT0wLHRbMV09MCx0WzJdPTAsdFszXT0wLHR9LGEuY2xvbmU9ZnVuY3Rpb24odCl7dmFyIGU9bmV3IG4uQVJSQVlfVFlQRSg0KTtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGV9LGEuZnJvbVZhbHVlcz1mdW5jdGlvbih0LGUscixhKXt2YXIgaT1uZXcgbi5BUlJBWV9UWVBFKDQpO3JldHVybiBpWzBdPXQsaVsxXT1lLGlbMl09cixpWzNdPWEsaX0sYS5jb3B5PWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0fSxhLnNldD1mdW5jdGlvbih0LGUscixuLGEpe3JldHVybiB0WzBdPWUsdFsxXT1yLHRbMl09bix0WzNdPWEsdH0sYS5hZGQ9ZnVuY3Rpb24odCxlLHIpe3JldHVybiB0WzBdPWVbMF0rclswXSx0WzFdPWVbMV0rclsxXSx0WzJdPWVbMl0rclsyXSx0WzNdPWVbM10rclszXSx0fSxhLnN1YnRyYWN0PWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdLXJbMF0sdFsxXT1lWzFdLXJbMV0sdFsyXT1lWzJdLXJbMl0sdFszXT1lWzNdLXJbM10sdH0sYS5zdWI9YS5zdWJ0cmFjdCxhLm11bHRpcGx5PWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdKnJbMF0sdFsxXT1lWzFdKnJbMV0sdFsyXT1lWzJdKnJbMl0sdFszXT1lWzNdKnJbM10sdH0sYS5tdWw9YS5tdWx0aXBseSxhLmRpdmlkZT1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09ZVswXS9yWzBdLHRbMV09ZVsxXS9yWzFdLHRbMl09ZVsyXS9yWzJdLHRbM109ZVszXS9yWzNdLHR9LGEuZGl2PWEuZGl2aWRlLGEuY2VpbD1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPU1hdGguY2VpbChlWzBdKSx0WzFdPU1hdGguY2VpbChlWzFdKSx0WzJdPU1hdGguY2VpbChlWzJdKSx0WzNdPU1hdGguY2VpbChlWzNdKSx0fSxhLmZsb29yPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09TWF0aC5mbG9vcihlWzBdKSx0WzFdPU1hdGguZmxvb3IoZVsxXSksdFsyXT1NYXRoLmZsb29yKGVbMl0pLHRbM109TWF0aC5mbG9vcihlWzNdKSx0fSxhLm1pbj1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09TWF0aC5taW4oZVswXSxyWzBdKSx0WzFdPU1hdGgubWluKGVbMV0sclsxXSksdFsyXT1NYXRoLm1pbihlWzJdLHJbMl0pLHRbM109TWF0aC5taW4oZVszXSxyWzNdKSx0fSxhLm1heD1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09TWF0aC5tYXgoZVswXSxyWzBdKSx0WzFdPU1hdGgubWF4KGVbMV0sclsxXSksdFsyXT1NYXRoLm1heChlWzJdLHJbMl0pLHRbM109TWF0aC5tYXgoZVszXSxyWzNdKSx0fSxhLnJvdW5kPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09TWF0aC5yb3VuZChlWzBdKSx0WzFdPU1hdGgucm91bmQoZVsxXSksdFsyXT1NYXRoLnJvdW5kKGVbMl0pLHRbM109TWF0aC5yb3VuZChlWzNdKSx0fSxhLnNjYWxlPWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdKnIsdFsxXT1lWzFdKnIsdFsyXT1lWzJdKnIsdFszXT1lWzNdKnIsdH0sYS5zY2FsZUFuZEFkZD1mdW5jdGlvbih0LGUscixuKXtyZXR1cm4gdFswXT1lWzBdK3JbMF0qbix0WzFdPWVbMV0rclsxXSpuLHRbMl09ZVsyXStyWzJdKm4sdFszXT1lWzNdK3JbM10qbix0fSxhLmRpc3RhbmNlPWZ1bmN0aW9uKHQsZSl7dmFyIHI9ZVswXS10WzBdLG49ZVsxXS10WzFdLGE9ZVsyXS10WzJdLGk9ZVszXS10WzNdO3JldHVybiBNYXRoLnNxcnQocipyK24qbithKmEraSppKX0sYS5kaXN0PWEuZGlzdGFuY2UsYS5zcXVhcmVkRGlzdGFuY2U9ZnVuY3Rpb24odCxlKXt2YXIgcj1lWzBdLXRbMF0sbj1lWzFdLXRbMV0sYT1lWzJdLXRbMl0saT1lWzNdLXRbM107cmV0dXJuIHIqcituKm4rYSphK2kqaX0sYS5zcXJEaXN0PWEuc3F1YXJlZERpc3RhbmNlLGEubGVuZ3RoPWZ1bmN0aW9uKHQpe3ZhciBlPXRbMF0scj10WzFdLG49dFsyXSxhPXRbM107cmV0dXJuIE1hdGguc3FydChlKmUrcipyK24qbithKmEpfSxhLmxlbj1hLmxlbmd0aCxhLnNxdWFyZWRMZW5ndGg9ZnVuY3Rpb24odCl7dmFyIGU9dFswXSxyPXRbMV0sbj10WzJdLGE9dFszXTtyZXR1cm4gZSplK3IqcituKm4rYSphfSxhLnNxckxlbj1hLnNxdWFyZWRMZW5ndGgsYS5uZWdhdGU9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT0tZVswXSx0WzFdPS1lWzFdLHRbMl09LWVbMl0sdFszXT0tZVszXSx0fSxhLmludmVyc2U9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT0xL2VbMF0sdFsxXT0xL2VbMV0sdFsyXT0xL2VbMl0sdFszXT0xL2VbM10sdH0sYS5ub3JtYWxpemU9ZnVuY3Rpb24odCxlKXt2YXIgcj1lWzBdLG49ZVsxXSxhPWVbMl0saT1lWzNdLHU9cipyK24qbithKmEraSppO3JldHVybiB1PjAmJih1PTEvTWF0aC5zcXJ0KHUpLHRbMF09cip1LHRbMV09bip1LHRbMl09YSp1LHRbM109aSp1KSx0fSxhLmRvdD1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdKmVbMF0rdFsxXSplWzFdK3RbMl0qZVsyXSt0WzNdKmVbM119LGEubGVycD1mdW5jdGlvbih0LGUscixuKXt2YXIgYT1lWzBdLGk9ZVsxXSx1PWVbMl0sbz1lWzNdO3JldHVybiB0WzBdPWErbiooclswXS1hKSx0WzFdPWkrbiooclsxXS1pKSx0WzJdPXUrbiooclsyXS11KSx0WzNdPW8rbiooclszXS1vKSx0fSxhLnJhbmRvbT1mdW5jdGlvbih0LGUpe3JldHVybiBlPWV8fDEsdFswXT1uLlJBTkRPTSgpLHRbMV09bi5SQU5ET00oKSx0WzJdPW4uUkFORE9NKCksdFszXT1uLlJBTkRPTSgpLGEubm9ybWFsaXplKHQsdCksYS5zY2FsZSh0LHQsZSksdH0sYS50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1lWzBdLGE9ZVsxXSxpPWVbMl0sdT1lWzNdO3JldHVybiB0WzBdPXJbMF0qbityWzRdKmErcls4XSppK3JbMTJdKnUsdFsxXT1yWzFdKm4rcls1XSphK3JbOV0qaStyWzEzXSp1LHRbMl09clsyXSpuK3JbNl0qYStyWzEwXSppK3JbMTRdKnUsdFszXT1yWzNdKm4rcls3XSphK3JbMTFdKmkrclsxNV0qdSx0fSxhLnRyYW5zZm9ybVF1YXQ9ZnVuY3Rpb24odCxlLHIpe3ZhciBuPWVbMF0sYT1lWzFdLGk9ZVsyXSx1PXJbMF0sbz1yWzFdLHM9clsyXSxsPXJbM10sZj1sKm4rbyppLXMqYSxoPWwqYStzKm4tdSppLGM9bCppK3UqYS1vKm4sZD0tdSpuLW8qYS1zKmk7cmV0dXJuIHRbMF09ZipsK2QqLXUraCotcy1jKi1vLHRbMV09aCpsK2QqLW8rYyotdS1mKi1zLHRbMl09YypsK2QqLXMrZiotby1oKi11LHRbM109ZVszXSx0fSxhLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgdD1hLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbihlLHIsbixhLGksdSl7dmFyIG8scztmb3Iocnx8KHI9NCksbnx8KG49MCkscz1hP01hdGgubWluKGEqcituLGUubGVuZ3RoKTplLmxlbmd0aCxvPW47cz5vO28rPXIpdFswXT1lW29dLHRbMV09ZVtvKzFdLHRbMl09ZVtvKzJdLHRbM109ZVtvKzNdLGkodCx0LHUpLGVbb109dFswXSxlW28rMV09dFsxXSxlW28rMl09dFsyXSxlW28rM109dFszXTtyZXR1cm4gZX19KCksYS5zdHI9ZnVuY3Rpb24odCl7cmV0dXJuXCJ2ZWM0KFwiK3RbMF0rXCIsIFwiK3RbMV0rXCIsIFwiK3RbMl0rXCIsIFwiK3RbM10rXCIpXCJ9LGEuZXhhY3RFcXVhbHM9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT09PWVbMF0mJnRbMV09PT1lWzFdJiZ0WzJdPT09ZVsyXSYmdFszXT09PWVbM119LGEuZXF1YWxzPWZ1bmN0aW9uKHQsZSl7dmFyIHI9dFswXSxhPXRbMV0saT10WzJdLHU9dFszXSxvPWVbMF0scz1lWzFdLGw9ZVsyXSxmPWVbM107cmV0dXJuIE1hdGguYWJzKHItbyk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKHIpLE1hdGguYWJzKG8pKSYmTWF0aC5hYnMoYS1zKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMoYSksTWF0aC5hYnMocykpJiZNYXRoLmFicyhpLWwpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhpKSxNYXRoLmFicyhsKSkmJk1hdGguYWJzKHUtZik8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKHUpLE1hdGguYWJzKGYpKX0sdC5leHBvcnRzPWF9LGZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPVwiLy8gZnhhYS5mcmFnXFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBGWEFBXFxuXFxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xcbiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXG51bmlmb3JtIHZlYzIgdVJlc29sdXRpb247XFxuXFxuXFxuZmxvYXQgRlhBQV9TVUJQSVhfU0hJRlQgPSAxLjAvNC4wO1xcbiNkZWZpbmUgRlhBQV9SRURVQ0VfTUlOICAgKDEuMC8gMTI4LjApXFxuI2RlZmluZSBGWEFBX1JFRFVDRV9NVUwgICAoMS4wIC8gOC4wKVxcbiNkZWZpbmUgRlhBQV9TUEFOX01BWCAgICAgOC4wXFxuXFxuXFxudmVjNCBhcHBseUZYQUEoc2FtcGxlcjJEIHRleCkge1xcbiAgICB2ZWM0IGNvbG9yO1xcbiAgICB2ZWMyIGZyYWdDb29yZCA9IGdsX0ZyYWdDb29yZC54eTtcXG4gICAgdmVjMyByZ2JOVyA9IHRleHR1cmUyRCh0ZXgsIChmcmFnQ29vcmQgKyB2ZWMyKC0xLjAsIC0xLjApKSAqIHVSZXNvbHV0aW9uKS54eXo7XFxuICAgIHZlYzMgcmdiTkUgPSB0ZXh0dXJlMkQodGV4LCAoZnJhZ0Nvb3JkICsgdmVjMigxLjAsIC0xLjApKSAqIHVSZXNvbHV0aW9uKS54eXo7XFxuICAgIHZlYzMgcmdiU1cgPSB0ZXh0dXJlMkQodGV4LCAoZnJhZ0Nvb3JkICsgdmVjMigtMS4wLCAxLjApKSAqIHVSZXNvbHV0aW9uKS54eXo7XFxuICAgIHZlYzMgcmdiU0UgPSB0ZXh0dXJlMkQodGV4LCAoZnJhZ0Nvb3JkICsgdmVjMigxLjAsIDEuMCkpICogdVJlc29sdXRpb24pLnh5ejtcXG4gICAgdmVjMyByZ2JNICA9IHRleHR1cmUyRCh0ZXgsIGZyYWdDb29yZCAgKiB1UmVzb2x1dGlvbikueHl6O1xcbiAgICB2ZWMzIGx1bWEgPSB2ZWMzKDAuMjk5LCAwLjU4NywgMC4xMTQpO1xcbiAgICBmbG9hdCBsdW1hTlcgPSBkb3QocmdiTlcsIGx1bWEpO1xcbiAgICBmbG9hdCBsdW1hTkUgPSBkb3QocmdiTkUsIGx1bWEpO1xcbiAgICBmbG9hdCBsdW1hU1cgPSBkb3QocmdiU1csIGx1bWEpO1xcbiAgICBmbG9hdCBsdW1hU0UgPSBkb3QocmdiU0UsIGx1bWEpO1xcbiAgICBmbG9hdCBsdW1hTSAgPSBkb3QocmdiTSwgIGx1bWEpO1xcbiAgICBmbG9hdCBsdW1hTWluID0gbWluKGx1bWFNLCBtaW4obWluKGx1bWFOVywgbHVtYU5FKSwgbWluKGx1bWFTVywgbHVtYVNFKSkpO1xcbiAgICBmbG9hdCBsdW1hTWF4ID0gbWF4KGx1bWFNLCBtYXgobWF4KGx1bWFOVywgbHVtYU5FKSwgbWF4KGx1bWFTVywgbHVtYVNFKSkpO1xcblxcbiAgICB2ZWMyIGRpcjtcXG4gICAgZGlyLnggPSAtKChsdW1hTlcgKyBsdW1hTkUpIC0gKGx1bWFTVyArIGx1bWFTRSkpO1xcbiAgICBkaXIueSA9ICAoKGx1bWFOVyArIGx1bWFTVykgLSAobHVtYU5FICsgbHVtYVNFKSk7XFxuXFxuICAgIGZsb2F0IGRpclJlZHVjZSA9IG1heCgobHVtYU5XICsgbHVtYU5FICsgbHVtYVNXICsgbHVtYVNFKSAqXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAoMC4yNSAqIEZYQUFfUkVEVUNFX01VTCksIEZYQUFfUkVEVUNFX01JTik7XFxuXFxuICAgIGZsb2F0IHJjcERpck1pbiA9IDEuMCAvIChtaW4oYWJzKGRpci54KSwgYWJzKGRpci55KSkgKyBkaXJSZWR1Y2UpO1xcbiAgICBkaXIgPSBtaW4odmVjMihGWEFBX1NQQU5fTUFYLCBGWEFBX1NQQU5fTUFYKSxcXG4gICAgICAgICAgICAgIG1heCh2ZWMyKC1GWEFBX1NQQU5fTUFYLCAtRlhBQV9TUEFOX01BWCksXFxuICAgICAgICAgICAgICBkaXIgKiByY3BEaXJNaW4pKSAqIHVSZXNvbHV0aW9uO1xcblxcbiAgICB2ZWMzIHJnYkEgPSAwLjUgKiAoXFxuICAgICAgICB0ZXh0dXJlMkQodGV4LCBmcmFnQ29vcmQgKiB1UmVzb2x1dGlvbiArIGRpciAqICgxLjAgLyAzLjAgLSAwLjUpKS54eXogK1xcbiAgICAgICAgdGV4dHVyZTJEKHRleCwgZnJhZ0Nvb3JkICogdVJlc29sdXRpb24gKyBkaXIgKiAoMi4wIC8gMy4wIC0gMC41KSkueHl6KTtcXG4gICAgdmVjMyByZ2JCID0gcmdiQSAqIDAuNSArIDAuMjUgKiAoXFxuICAgICAgICB0ZXh0dXJlMkQodGV4LCBmcmFnQ29vcmQgKiB1UmVzb2x1dGlvbiArIGRpciAqIC0wLjUpLnh5eiArXFxuICAgICAgICB0ZXh0dXJlMkQodGV4LCBmcmFnQ29vcmQgKiB1UmVzb2x1dGlvbiArIGRpciAqIDAuNSkueHl6KTtcXG5cXG4gICAgZmxvYXQgbHVtYUIgPSBkb3QocmdiQiwgbHVtYSk7XFxuICAgIGlmICgobHVtYUIgPCBsdW1hTWluKSB8fCAobHVtYUIgPiBsdW1hTWF4KSlcXG4gICAgICAgIGNvbG9yID0gdmVjNChyZ2JBLCAxLjApO1xcbiAgICBlbHNlXFxuICAgICAgICBjb2xvciA9IHZlYzQocmdiQiwgMS4wKTtcXG4gICAgcmV0dXJuIGNvbG9yO1xcbn1cXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiBcdHZlYzQgY29sb3IgPSBhcHBseUZYQUEodGV4dHVyZSk7XFxuICAgIGdsX0ZyYWdDb2xvciA9IGNvbG9yO1xcbn1cIn0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9XCIvLyBnZW5lcmFsV2l0aE5vcm1hbC52ZXJ0XFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBHRU5FUkFMX1ZFUlRFWFxcblxcbnByZWNpc2lvbiBoaWdocCBmbG9hdDtcXG4jZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGFWZXJ0ZXhQb3NpdGlvbjtcXG5hdHRyaWJ1dGUgdmVjMiBhVGV4dHVyZUNvb3JkO1xcbmF0dHJpYnV0ZSB2ZWMzIGFOb3JtYWw7XFxuXFxudW5pZm9ybSBtYXQ0IHVNb2RlbE1hdHJpeDtcXG51bmlmb3JtIG1hdDQgdVZpZXdNYXRyaXg7XFxudW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uTWF0cml4O1xcbnVuaWZvcm0gbWF0MyB1Tm9ybWFsTWF0cml4O1xcblxcbnVuaWZvcm0gdmVjMyBwb3NpdGlvbjtcXG51bmlmb3JtIHZlYzMgc2NhbGU7XFxuXFxudmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxuXFxudm9pZCBtYWluKHZvaWQpIHtcXG5cdHZlYzMgcG9zICAgICAgPSBhVmVydGV4UG9zaXRpb24gKiBzY2FsZTtcXG5cdHBvcyAgICAgICAgICAgKz0gcG9zaXRpb247XFxuXHRnbF9Qb3NpdGlvbiAgID0gdVByb2plY3Rpb25NYXRyaXggKiB1Vmlld01hdHJpeCAqIHVNb2RlbE1hdHJpeCAqIHZlYzQocG9zLCAxLjApO1xcblx0XFxuXHR2VGV4dHVyZUNvb3JkID0gYVRleHR1cmVDb29yZDtcXG5cdHZOb3JtYWwgICAgICAgPSBub3JtYWxpemUodU5vcm1hbE1hdHJpeCAqIGFOb3JtYWwpO1xcbn1cIn0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9XCIvLyBiYXNpYy5mcmFnXFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBTS1lCT1hfRlJBR01FTlRcXG5cXG5wcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcXG4jZGVmaW5lIEdMU0xJRlkgMVxcbnVuaWZvcm0gc2FtcGxlckN1YmUgdGV4dHVyZTtcXG52YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcXG52YXJ5aW5nIHZlYzMgdlZlcnRleDtcXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlQ3ViZSh0ZXh0dXJlLCB2VmVydGV4KTtcXG59XCJ9LGZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPVwiLy8gYmFzaWMudmVydFxcblxcbiNkZWZpbmUgU0hBREVSX05BTUUgU0tZQk9YX1ZFUlRFWFxcblxcbnByZWNpc2lvbiBoaWdocCBmbG9hdDtcXG4jZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGFWZXJ0ZXhQb3NpdGlvbjtcXG5hdHRyaWJ1dGUgdmVjMiBhVGV4dHVyZUNvb3JkO1xcbmF0dHJpYnV0ZSB2ZWMzIGFOb3JtYWw7XFxuXFxudW5pZm9ybSBtYXQ0IHVNb2RlbE1hdHJpeDtcXG51bmlmb3JtIG1hdDQgdVZpZXdNYXRyaXg7XFxudW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uTWF0cml4O1xcblxcbnZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1xcbnZhcnlpbmcgdmVjMyB2VmVydGV4O1xcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcblxcbnZvaWQgbWFpbih2b2lkKSB7XFxuXHRtYXQ0IG1hdFZpZXcgPSB1Vmlld01hdHJpeDtcXG5cdG1hdFZpZXdbM11bMF0gPSAwLjA7XFxuXHRtYXRWaWV3WzNdWzFdID0gMC4wO1xcblx0bWF0Vmlld1szXVsyXSA9IDAuMDtcXG5cdFxcblx0Z2xfUG9zaXRpb24gPSB1UHJvamVjdGlvbk1hdHJpeCAqIG1hdFZpZXcgKiB1TW9kZWxNYXRyaXggKiB2ZWM0KGFWZXJ0ZXhQb3NpdGlvbiwgMS4wKTtcXG5cdHZUZXh0dXJlQ29vcmQgPSBhVGV4dHVyZUNvb3JkO1xcblx0XFxuXHR2VmVydGV4ID0gYVZlcnRleFBvc2l0aW9uO1xcblx0dk5vcm1hbCA9IGFOb3JtYWw7XFxufVwifSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoMSksaT1uKGEpLHU9cigyKSxvPW4odSkscz1yKDgpLGw9bihzKSxmPXIoMyksaD1uKGYpLGM9cig3KSxkPW4oYyksdj1yKDMzKSxfPW4odiksbT1yKDU2KSxwPW4obSksTT1yKDEyKSx4PW4oTSksZz1yKDE2KSxFPW4oZyksYj1yKDkpLHk9bihiKSxTPXIoMzIpLFQ9bihTKSxJPXIoODcpLEE9bihJKSxGPXIoODgpLEQ9bihGKSxSPXIoODkpLHc9bihSKSxQPXIoMjMpLE49bihQKSxPPXIoMTA4KSxMPW4oTyksaz1yKDM3KSxDPW4oayksVT1yKDExMiksQj1uKFUpLFg9cig2NCkscT1uKFgpLFY9cigxMTEpLHo9bihWKSxqPXIoMzQpLEc9bihqKSxZPXIoNTcpLFc9bihZKSxIPXIoMzUpLFo9bihIKSxRPXIoOTApLEs9bihRKSxKPXIoNTgpLCQ9bihKKSx0dD1yKDU5KSxldD1uKHR0KSxydD1yKDM2KSxudD1uKHJ0KSxhdD1yKDEwNCksaXQ9bihhdCksdXQ9cigxMDMpLG90PW4odXQpLHN0PXIoMTAyKSxsdD1uKHN0KSxmdD1yKDEwNSksaHQ9bihmdCksY3Q9cigyNyksZHQ9bihjdCksdnQ9cig2MiksX3Q9bih2dCksbXQ9cigxMDYpLHB0PW4obXQpLE10PXIoNjMpLHh0PW4oTXQpLGd0PXIoNjEpLEV0PW4oZ3QpLGJ0PXIoMTA3KSx5dD1uKGJ0KSxTdD1yKDkzKSxUdD1uKFN0KSxJdD1yKDkxKSxBdD1uKEl0KSxGdD1yKDkyKSxEdD1uKEZ0KSxSdD1yKDk0KSx3dD1uKFJ0KSxQdD1yKDk2KSxOdD1uKFB0KSxPdD1yKDk4KSxMdD1uKE90KSxrdD1yKDk3KSxDdD1uKGt0KSxVdD1yKDk1KSxCdD1uKFV0KSxYdD1yKDk5KSxxdD1uKFh0KSxWdD1yKDEwMCksenQ9bihWdCksanQ9cigxMDEpLEd0PW4oanQpLFl0PXIoNjUpLFd0PW4oWXQpLEh0PVwiMC4xLjI0XCIsWnQ9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KCl7KDAsaS5kZWZhdWx0KSh0aGlzLHQpLHRoaXMuZ2xtPWwuZGVmYXVsdCx0aGlzLkdMPWguZGVmYXVsdCx0aGlzLkdMVG9vbD1oLmRlZmF1bHQsdGhpcy5HTFNoYWRlcj1kLmRlZmF1bHQsdGhpcy5HTFRleHR1cmU9Xy5kZWZhdWx0LHRoaXMuR0xDdWJlVGV4dHVyZT1wLmRlZmF1bHQsdGhpcy5NZXNoPXguZGVmYXVsdCx0aGlzLkdlb209RS5kZWZhdWx0LHRoaXMuQmF0Y2g9eS5kZWZhdWx0LHRoaXMuRnJhbWVCdWZmZXI9VC5kZWZhdWx0LHRoaXMuQ3ViZUZyYW1lQnVmZmVyPUEuZGVmYXVsdCx0aGlzLlNjaGVkdWxlcj1OLmRlZmF1bHQsdGhpcy5FdmVudERpc3BhdGNoZXI9TC5kZWZhdWx0LHRoaXMuRWFzZU51bWJlcj1DLmRlZmF1bHQsdGhpcy5Ud2Vlbk51bWJlcj1CLmRlZmF1bHQsdGhpcy5DYW1lcmE9Ry5kZWZhdWx0LHRoaXMuQ2FtZXJhT3J0aG89Vy5kZWZhdWx0LHRoaXMuQ2FtZXJhUGVyc3BlY3RpdmU9Wi5kZWZhdWx0LHRoaXMuUmF5PSQuZGVmYXVsdCx0aGlzLkNhbWVyYUN1YmU9Sy5kZWZhdWx0LHRoaXMuT3JiaXRhbENvbnRyb2w9cS5kZWZhdWx0LHRoaXMuUXVhdFJvdGF0aW9uPXouZGVmYXVsdCx0aGlzLkJpbmFyeUxvYWRlcj1udC5kZWZhdWx0LHRoaXMuT2JqTG9hZGVyPWl0LmRlZmF1bHQsdGhpcy5Db2xsYWRhUGFyc2VyPWx0LmRlZmF1bHQsdGhpcy5IRFJMb2FkZXI9b3QuZGVmYXVsdCx0aGlzLkJhdGNoQ29weT1UdC5kZWZhdWx0LHRoaXMuQmF0Y2hBeGlzPUF0LmRlZmF1bHQsdGhpcy5CYXRjaEJhbGw9RHQuZGVmYXVsdCx0aGlzLkJhdGNoQmFsbD1EdC5kZWZhdWx0LHRoaXMuQmF0Y2hMaW5lPU50LmRlZmF1bHQsdGhpcy5CYXRjaFNreWJveD1MdC5kZWZhdWx0LHRoaXMuQmF0Y2hTa3k9Q3QuZGVmYXVsdCx0aGlzLkJhdGNoRlhBQT1CdC5kZWZhdWx0LHRoaXMuQmF0Y2hEb3RzUGxhbmU9d3QuZGVmYXVsdCx0aGlzLlNjZW5lPXF0LmRlZmF1bHQsdGhpcy5WaWV3PXp0LmRlZmF1bHQsdGhpcy5WaWV3M0Q9R3QuZGVmYXVsdCx0aGlzLk9iamVjdDNEPWV0LmRlZmF1bHQsdGhpcy5TaGFkZXJMaWJzPVd0LmRlZmF1bHQsdGhpcy5FZmZlY3RDb21wb3Nlcj1odC5kZWZhdWx0LHRoaXMuUGFzcz1kdC5kZWZhdWx0LHRoaXMuUGFzc01hY3JvPV90LmRlZmF1bHQsdGhpcy5QYXNzQmx1cj1wdC5kZWZhdWx0LHRoaXMuUGFzc1ZCbHVyPXh0LmRlZmF1bHQsdGhpcy5QYXNzSEJsdXI9RXQuZGVmYXVsdCx0aGlzLlBhc3NGeGFhPXl0LmRlZmF1bHQsdGhpcy5NdWx0aXNhbXBsZUZyYW1lQnVmZmVyPUQuZGVmYXVsdCx0aGlzLlRyYW5zZm9ybUZlZWRiYWNrT2JqZWN0PXcuZGVmYXVsdDtmb3IodmFyIGUgaW4gbC5kZWZhdWx0KWwuZGVmYXVsdFtlXSYmKHdpbmRvd1tlXT1sLmRlZmF1bHRbZV0pfXJldHVybigwLG8uZGVmYXVsdCkodCxbe2tleTpcImxvZ1wiLHZhbHVlOmZ1bmN0aW9uKCl7bmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKFwiQ2hyb21lXCIpPi0xP2NvbnNvbGUubG9nKFwiJWNsaWIgYWxmcmlkIDogVkVSU0lPTiBcIitIdCxcImJhY2tncm91bmQ6ICMxOTM0NDE7IGNvbG9yOiAjRkNGRkY1XCIpOmNvbnNvbGUubG9nKFwibGliIGFsZnJpZCA6IFZFUlNJT04gXCIsSHQpLGNvbnNvbGUubG9nKFwiJWNDbGFzc2VzIDogXCIsXCJjb2xvcjogIzE5MzQ0MVwiKTtmb3IodmFyIHQgaW4gdGhpcyl0aGlzW3RdJiZjb25zb2xlLmxvZyhcIiVjIC0gXCIrdCxcImNvbG9yOiAjM0U2MDZGXCIpfX1dKSx0fSgpLFF0PW5ldyBadDtlLmRlZmF1bHQ9UXQsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDEpLGk9bihhKSx1PXIoMiksbz1uKHUpLHM9cigzKSxsPW4ocyksZj1yKDU2KSxoPW4oZiksYz12b2lkIDAsZD1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7dmFyIHI9YXJndW1lbnRzLmxlbmd0aDw9MXx8dm9pZCAwPT09YXJndW1lbnRzWzFdP3t9OmFyZ3VtZW50c1sxXTsoMCxpLmRlZmF1bHQpKHRoaXMsdCksYz1sLmRlZmF1bHQuZ2wsdGhpcy5fc2l6ZT1lLHRoaXMubWFnRmlsdGVyPXIubWFnRmlsdGVyfHxjLkxJTkVBUix0aGlzLm1pbkZpbHRlcj1yLm1pbkZpbHRlcnx8Yy5MSU5FQVIsdGhpcy53cmFwUz1yLndyYXBTfHxjLkNMQU1QX1RPX0VER0UsdGhpcy53cmFwVD1yLndyYXBUfHxjLkNMQU1QX1RPX0VER0UsdGhpcy5faW5pdCgpfXJldHVybigwLG8uZGVmYXVsdCkodCxbe2tleTpcIl9pbml0XCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLnRleHR1cmU9Yy5jcmVhdGVUZXh0dXJlKCksdGhpcy5nbFRleHR1cmU9bmV3IGguZGVmYXVsdCh0aGlzLnRleHR1cmUse30sITApLGMuYmluZFRleHR1cmUoYy5URVhUVVJFX0NVQkVfTUFQLHRoaXMudGV4dHVyZSksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV9DVUJFX01BUCxjLlRFWFRVUkVfTUFHX0ZJTFRFUix0aGlzLm1hZ0ZpbHRlciksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV9DVUJFX01BUCxjLlRFWFRVUkVfTUlOX0ZJTFRFUix0aGlzLm1pbkZpbHRlciksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV9DVUJFX01BUCxjLlRFWFRVUkVfV1JBUF9TLHRoaXMud3JhcFMpLGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfQ1VCRV9NQVAsYy5URVhUVVJFX1dSQVBfVCx0aGlzLndyYXBUKTtmb3IodmFyIHQ9W2MuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YLGMuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9YLGMuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9ZLGMuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9ZLGMuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9aLGMuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9aXSxlPTA7ZTx0Lmxlbmd0aDtlKyspYy5waXhlbFN0b3JlaShjLlVOUEFDS19GTElQX1lfV0VCR0wsITEpLGMudGV4SW1hZ2UyRCh0W2VdLDAsYy5SR0JBLHRoaXMud2lkdGgsdGhpcy5oZWlnaHQsMCxjLlJHQkEsYy5GTE9BVCxudWxsKTt0aGlzLl9mcmFtZUJ1ZmZlcnM9W107Zm9yKHZhciByPTA7cjx0Lmxlbmd0aDtyKyspe3ZhciBuPWMuY3JlYXRlRnJhbWVidWZmZXIoKTtjLmJpbmRGcmFtZWJ1ZmZlcihjLkZSQU1FQlVGRkVSLG4pLGMuZnJhbWVidWZmZXJUZXh0dXJlMkQoYy5GUkFNRUJVRkZFUixjLkNPTE9SX0FUVEFDSE1FTlQwLHRbcl0sdGhpcy50ZXh0dXJlLDApO3ZhciBhPWMuY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cyhjLkZSQU1FQlVGRkVSKTthIT09Yy5GUkFNRUJVRkZFUl9DT01QTEVURSYmY29uc29sZS5sb2coXCInZ2wuY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cygpIHJldHVybmVkICdcIithKSx0aGlzLl9mcmFtZUJ1ZmZlcnMucHVzaChuKX1jLmJpbmRGcmFtZWJ1ZmZlcihjLkZSQU1FQlVGRkVSLG51bGwpLGMuYmluZFJlbmRlcmJ1ZmZlcihjLlJFTkRFUkJVRkZFUixudWxsKSxjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV9DVUJFX01BUCxudWxsKX19LHtrZXk6XCJiaW5kXCIsdmFsdWU6ZnVuY3Rpb24odCl7bC5kZWZhdWx0LnZpZXdwb3J0KDAsMCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KSxjLmJpbmRGcmFtZWJ1ZmZlcihjLkZSQU1FQlVGRkVSLHRoaXMuX2ZyYW1lQnVmZmVyc1t0XSl9fSx7a2V5OlwidW5iaW5kXCIsdmFsdWU6ZnVuY3Rpb24oKXtjLmJpbmRGcmFtZWJ1ZmZlcihjLkZSQU1FQlVGRkVSLG51bGwpLGwuZGVmYXVsdC52aWV3cG9ydCgwLDAsbC5kZWZhdWx0LndpZHRoLGwuZGVmYXVsdC5oZWlnaHQpfX0se2tleTpcImdldFRleHR1cmVcIix2YWx1ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLmdsVGV4dHVyZX19LHtrZXk6XCJ3aWR0aFwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zaXplfX0se2tleTpcImhlaWdodFwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9zaXplfX1dKSx0fSgpO2UuZGVmYXVsdD1kLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19ZnVuY3Rpb24gYSh0KXtyZXR1cm4gMCE9PXQmJiEodCZ0LTEpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBpPXIoMSksdT1uKGkpLG89cigyKSxzPW4obyksbD1yKDMpLGY9bihsKSxoPXIoMzMpLGM9bihoKSxkPXZvaWQgMCx2PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlLHIpe3ZhciBuPWFyZ3VtZW50cy5sZW5ndGg8PTJ8fHZvaWQgMD09PWFyZ3VtZW50c1syXT97fTphcmd1bWVudHNbMl07KDAsdS5kZWZhdWx0KSh0aGlzLHQpLGQ9Zi5kZWZhdWx0LmdsLHRoaXMud2lkdGg9ZSx0aGlzLmhlaWdodD1yLHRoaXMubWFnRmlsdGVyPW4ubWFnRmlsdGVyfHxkLkxJTkVBUix0aGlzLm1pbkZpbHRlcj1uLm1pbkZpbHRlcnx8ZC5MSU5FQVIsdGhpcy53cmFwUz1uLndyYXBTfHxkLkNMQU1QX1RPX0VER0UsdGhpcy53cmFwVD1uLndyYXBUfHxkLkNMQU1QX1RPX0VER0UsdGhpcy51c2VEZXB0aD1uLnVzZURlcHRofHwhMCx0aGlzLnVzZVN0ZW5jaWw9bi51c2VTdGVuY2lsfHwhMSx0aGlzLnRleGVsVHlwZT1uLnR5cGUsdGhpcy5fbnVtU2FtcGxlPW4ubnVtU2FtcGxlfHw4LGEodGhpcy53aWR0aCkmJmEodGhpcy5oZWlnaHQpfHwodGhpcy53cmFwUz10aGlzLndyYXBUPWQuQ0xBTVBfVE9fRURHRSx0aGlzLm1pbkZpbHRlcj09PWQuTElORUFSX01JUE1BUF9ORUFSRVNUJiYodGhpcy5taW5GaWx0ZXI9ZC5MSU5FQVIpKSx0aGlzLl9pbml0KCl9cmV0dXJuKDAscy5kZWZhdWx0KSh0LFt7a2V5OlwiX2luaXRcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PWQuVU5TSUdORURfQllURTt0aGlzLnRleGVsVHlwZSYmKHQ9dGhpcy50ZXhlbFR5cGUpLHRoaXMudGV4ZWxUeXBlPXQsdGhpcy5mcmFtZUJ1ZmZlcj1kLmNyZWF0ZUZyYW1lYnVmZmVyKCksdGhpcy5mcmFtZUJ1ZmZlckNvbG9yPWQuY3JlYXRlRnJhbWVidWZmZXIoKSx0aGlzLnJlbmRlckJ1ZmZlckNvbG9yPWQuY3JlYXRlUmVuZGVyYnVmZmVyKCksdGhpcy5yZW5kZXJCdWZmZXJEZXB0aD1kLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpLHRoaXMuZ2xUZXh0dXJlPXRoaXMuX2NyZWF0ZVRleHR1cmUoKSx0aGlzLmdsRGVwdGhUZXh0dXJlPXRoaXMuX2NyZWF0ZVRleHR1cmUoZC5ERVBUSF9DT01QT05FTlQxNixkLlVOU0lHTkVEX1NIT1JULGQuREVQVEhfQ09NUE9ORU5ULCEwKSxkLmJpbmRSZW5kZXJidWZmZXIoZC5SRU5ERVJCVUZGRVIsdGhpcy5yZW5kZXJCdWZmZXJDb2xvciksZC5yZW5kZXJidWZmZXJTdG9yYWdlTXVsdGlzYW1wbGUoZC5SRU5ERVJCVUZGRVIsdGhpcy5fbnVtU2FtcGxlLGQuUkdCQTgsdGhpcy53aWR0aCx0aGlzLmhlaWdodCksZC5iaW5kUmVuZGVyYnVmZmVyKGQuUkVOREVSQlVGRkVSLHRoaXMucmVuZGVyQnVmZmVyRGVwdGgpLGQucmVuZGVyYnVmZmVyU3RvcmFnZU11bHRpc2FtcGxlKGQuUkVOREVSQlVGRkVSLHRoaXMuX251bVNhbXBsZSxkLkRFUFRIX0NPTVBPTkVOVDE2LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpLGQuYmluZEZyYW1lYnVmZmVyKGQuRlJBTUVCVUZGRVIsdGhpcy5mcmFtZUJ1ZmZlciksZC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihkLkZSQU1FQlVGRkVSLGQuQ09MT1JfQVRUQUNITUVOVDAsZC5SRU5ERVJCVUZGRVIsdGhpcy5yZW5kZXJCdWZmZXJDb2xvciksZC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihkLkZSQU1FQlVGRkVSLGQuREVQVEhfQVRUQUNITUVOVCxkLlJFTkRFUkJVRkZFUix0aGlzLnJlbmRlckJ1ZmZlckRlcHRoKSxkLmJpbmRGcmFtZWJ1ZmZlcihkLkZSQU1FQlVGRkVSLG51bGwpLGQuYmluZEZyYW1lYnVmZmVyKGQuRlJBTUVCVUZGRVIsdGhpcy5mcmFtZUJ1ZmZlckNvbG9yKSxkLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGQuRlJBTUVCVUZGRVIsZC5DT0xPUl9BVFRBQ0hNRU5UMCxkLlRFWFRVUkVfMkQsdGhpcy5nbFRleHR1cmUudGV4dHVyZSwwKSxkLmJpbmRGcmFtZWJ1ZmZlcihkLkZSQU1FQlVGRkVSLG51bGwpfX0se2tleTpcIl9jcmVhdGVUZXh0dXJlXCIsdmFsdWU6ZnVuY3Rpb24odCxlLHIpe3ZhciBuPWFyZ3VtZW50cy5sZW5ndGg8PTN8fHZvaWQgMD09PWFyZ3VtZW50c1szXT8hMTphcmd1bWVudHNbM107dm9pZCAwPT09dCYmKHQ9ZC5SR0JBKSx2b2lkIDA9PT1lJiYoZT10aGlzLnRleGVsVHlwZSkscnx8KHI9dCk7dmFyIGE9ZC5jcmVhdGVUZXh0dXJlKCksaT1uZXcgYy5kZWZhdWx0KGEsITApLHU9bj9mLmRlZmF1bHQuTkVBUkVTVDp0aGlzLm1hZ0ZpbHRlcixvPW4/Zi5kZWZhdWx0Lk5FQVJFU1Q6dGhpcy5taW5GaWx0ZXI7cmV0dXJuIGQuYmluZFRleHR1cmUoZC5URVhUVVJFXzJELGEpLGQudGV4UGFyYW1ldGVyaShkLlRFWFRVUkVfMkQsZC5URVhUVVJFX01BR19GSUxURVIsdSksZC50ZXhQYXJhbWV0ZXJpKGQuVEVYVFVSRV8yRCxkLlRFWFRVUkVfTUlOX0ZJTFRFUixvKSxkLnRleFBhcmFtZXRlcmkoZC5URVhUVVJFXzJELGQuVEVYVFVSRV9XUkFQX1MsdGhpcy53cmFwUyksZC50ZXhQYXJhbWV0ZXJpKGQuVEVYVFVSRV8yRCxkLlRFWFRVUkVfV1JBUF9ULHRoaXMud3JhcFQpLGQudGV4SW1hZ2UyRChkLlRFWFRVUkVfMkQsMCx0LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQsMCxyLGUsbnVsbCksZC5iaW5kVGV4dHVyZShkLlRFWFRVUkVfMkQsbnVsbCksaX19LHtrZXk6XCJiaW5kXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPD0wfHx2b2lkIDA9PT1hcmd1bWVudHNbMF0/ITA6YXJndW1lbnRzWzBdO3QmJmYuZGVmYXVsdC52aWV3cG9ydCgwLDAsdGhpcy53aWR0aCx0aGlzLmhlaWdodCksZC5iaW5kRnJhbWVidWZmZXIoZC5GUkFNRUJVRkZFUix0aGlzLmZyYW1lQnVmZmVyKX19LHtrZXk6XCJ1bmJpbmRcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg8PTB8fHZvaWQgMD09PWFyZ3VtZW50c1swXT8hMDphcmd1bWVudHNbMF07dCYmZi5kZWZhdWx0LnZpZXdwb3J0KDAsMCxmLmRlZmF1bHQud2lkdGgsZi5kZWZhdWx0LmhlaWdodCk7dmFyIGU9dGhpcy53aWR0aCxyPXRoaXMuaGVpZ2h0O2QuYmluZEZyYW1lYnVmZmVyKGQuRlJBTUVCVUZGRVIsbnVsbCksZC5iaW5kRnJhbWVidWZmZXIoZC5SRUFEX0ZSQU1FQlVGRkVSLHRoaXMuZnJhbWVCdWZmZXIpLGQuYmluZEZyYW1lYnVmZmVyKGQuRFJBV19GUkFNRUJVRkZFUix0aGlzLmZyYW1lQnVmZmVyQ29sb3IpLGQuY2xlYXJCdWZmZXJmdihkLkNPTE9SLDAsWzAsMCwwLDBdKSxkLmJsaXRGcmFtZWJ1ZmZlcigwLDAsZSxyLDAsMCxlLHIsZC5DT0xPUl9CVUZGRVJfQklULGYuZGVmYXVsdC5ORUFSRVNUKSxkLmJpbmRGcmFtZWJ1ZmZlcihkLkZSQU1FQlVGRkVSLG51bGwpfX0se2tleTpcImdldFRleHR1cmVcIix2YWx1ZTpmdW5jdGlvbigpe2FyZ3VtZW50cy5sZW5ndGg8PTB8fHZvaWQgMD09PWFyZ3VtZW50c1swXT8wOmFyZ3VtZW50c1swXTtyZXR1cm4gdGhpcy5nbFRleHR1cmV9fSx7a2V5OlwiZ2V0RGVwdGhUZXh0dXJlXCIsdmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nbERlcHRoVGV4dHVyZX19XSksdH0oKTtlLmRlZmF1bHQ9dix0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoMSksaT1uKGEpLHU9cigyKSxvPW4odSkscz1yKDMpLGw9bihzKSxmPXIoNyksaD1uKGYpLGM9cigxMiksZD1uKGMpLHY9dm9pZCAwLF89ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KGUscil7KDAsaS5kZWZhdWx0KSh0aGlzLHQpLHY9bC5kZWZhdWx0LmdsLHRoaXMuX3ZzPWUsdGhpcy5fZnM9cix0aGlzLl9pbml0KCl9cmV0dXJuKDAsby5kZWZhdWx0KSh0LFt7a2V5OlwiX2luaXRcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX21lc2hDdXJyZW50PW5ldyBkLmRlZmF1bHQsdGhpcy5fbWVzaFRhcmdldD1uZXcgZC5kZWZhdWx0LHRoaXMuX251bVBvaW50cz0tMSx0aGlzLl92YXJ5aW5ncz1bXSx0aGlzLnRyYW5zZm9ybUZlZWRiYWNrPXYuY3JlYXRlVHJhbnNmb3JtRmVlZGJhY2soKX19LHtrZXk6XCJidWZmZXJEYXRhXCIsdmFsdWU6ZnVuY3Rpb24odCxlLHIpe3ZhciBuPSEhcjtjb25zb2xlLmxvZyhcImlzIFRyYW5zZm9ybSBmZWVkYmFjayA/XCIsZSxuKSx0aGlzLl9tZXNoQ3VycmVudC5idWZmZXJEYXRhKHQsZSxudWxsLHYuU1RSRUFNX0NPUFksITEpLHRoaXMuX21lc2hUYXJnZXQuYnVmZmVyRGF0YSh0LGUsbnVsbCx2LlNUUkVBTV9DT1BZLCExKSxuJiYodGhpcy5fdmFyeWluZ3MucHVzaChyKSx0aGlzLl9udW1Qb2ludHM8MCYmKHRoaXMuX251bVBvaW50cz10Lmxlbmd0aCkpfX0se2tleTpcImJ1ZmZlckluZGV4XCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5fbWVzaEN1cnJlbnQuYnVmZmVySW5kZXgodCksdGhpcy5fbWVzaFRhcmdldC5idWZmZXJJbmRleCh0KX19LHtrZXk6XCJ1bmlmb3JtXCIsdmFsdWU6ZnVuY3Rpb24odCxlLHIpe3RoaXMuc2hhZGVyJiZ0aGlzLnNoYWRlci51bmlmb3JtKHQsZSxyKX19LHtrZXk6XCJnZW5lcmF0ZVwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5zaGFkZXI9bmV3IGguZGVmYXVsdCh0aGlzLl92cyx0aGlzLl9mcyx0aGlzLl92YXJ5aW5ncyl9fSx7a2V5OlwicmVuZGVyXCIsdmFsdWU6ZnVuY3Rpb24oKXt0aGlzLnNoYWRlcnx8dGhpcy5nZW5lcmF0ZSgpLHRoaXMuc2hhZGVyLmJpbmQoKSxsLmRlZmF1bHQuZHJhd1RyYW5zZm9ybUZlZWRiYWNrKHRoaXMpLHRoaXMuX3N3YXAoKX19LHtrZXk6XCJfc3dhcFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fbWVzaEN1cnJlbnQ7dGhpcy5fbWVzaEN1cnJlbnQ9dGhpcy5fbWVzaFRhcmdldCxcbnRoaXMuX21lc2hUYXJnZXQ9dH19LHtrZXk6XCJudW1Qb2ludHNcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbnVtUG9pbnRzfX0se2tleTpcIm1lc2hDdXJyZW50XCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX21lc2hDdXJyZW50fX0se2tleTpcIm1lc2hUYXJnZXRcIixnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbWVzaFRhcmdldH19LHtrZXk6XCJtZXNoU291cmNlXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX21lc2hDdXJyZW50fX0se2tleTpcIm1lc2hEZXN0aW5hdGlvblwiLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9tZXNoVGFyZ2V0fX1dKSx0fSgpO2UuZGVmYXVsdD1fLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cig0KSxpPW4oYSksdT1yKDEpLG89bih1KSxzPXIoMiksbD1uKHMpLGY9cig2KSxoPW4oZiksYz1yKDUpLGQ9bihjKSx2PXIoMzUpLF89bih2KSxtPXIoOCkscD1uKG0pLE09cC5kZWZhdWx0LnZlYzMseD1bW00uZnJvbVZhbHVlcygwLDAsMCksTS5mcm9tVmFsdWVzKDEsMCwwKSxNLmZyb21WYWx1ZXMoMCwtMSwwKV0sW00uZnJvbVZhbHVlcygwLDAsMCksTS5mcm9tVmFsdWVzKC0xLDAsMCksTS5mcm9tVmFsdWVzKDAsLTEsMCldLFtNLmZyb21WYWx1ZXMoMCwwLDApLE0uZnJvbVZhbHVlcygwLDEsMCksTS5mcm9tVmFsdWVzKDAsMCwxKV0sW00uZnJvbVZhbHVlcygwLDAsMCksTS5mcm9tVmFsdWVzKDAsLTEsMCksTS5mcm9tVmFsdWVzKDAsMCwtMSldLFtNLmZyb21WYWx1ZXMoMCwwLDApLE0uZnJvbVZhbHVlcygwLDAsMSksTS5mcm9tVmFsdWVzKDAsLTEsMCldLFtNLmZyb21WYWx1ZXMoMCwwLDApLE0uZnJvbVZhbHVlcygwLDAsLTEpLE0uZnJvbVZhbHVlcygwLC0xLDApXV0sZz1mdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7KDAsby5kZWZhdWx0KSh0aGlzLGUpO3ZhciB0PSgwLGguZGVmYXVsdCkodGhpcywoMCxpLmRlZmF1bHQpKGUpLmNhbGwodGhpcykpO3JldHVybiB0LnNldFBlcnNwZWN0aXZlKE1hdGguUEkvMiwxLC4xLDFlMyksdH1yZXR1cm4oMCxkLmRlZmF1bHQpKGUsdCksKDAsbC5kZWZhdWx0KShlLFt7a2V5OlwiZmFjZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXhbdF07dGhpcy5sb29rQXQoZVswXSxlWzFdLGVbMl0pfX1dKSxlfShfLmRlZmF1bHQpO2UuZGVmYXVsdD1nLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cig0KSxpPW4oYSksdT1yKDEpLG89bih1KSxzPXIoNiksbD1uKHMpLGY9cig1KSxoPW4oZiksYz1yKDMpLGQ9bihjKSx2PXIoMTIpLF89bih2KSxtPXIoNykscD1uKG0pLE09cig5KSx4PW4oTSksZz1yKDE2OSksRT1yKDE2OCksYj1mdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7KDAsby5kZWZhdWx0KSh0aGlzLGUpO3ZhciB0PVtdLHI9W10sbj1bMCwxLDIsMyw0LDVdLGE9OTk5OTt0LnB1c2goWy1hLDAsMF0pLHQucHVzaChbYSwwLDBdKSx0LnB1c2goWzAsLWEsMF0pLHQucHVzaChbMCxhLDBdKSx0LnB1c2goWzAsMCwtYV0pLHQucHVzaChbMCwwLGFdKSxyLnB1c2goWzEsMCwwXSksci5wdXNoKFsxLDAsMF0pLHIucHVzaChbMCwxLDBdKSxyLnB1c2goWzAsMSwwXSksci5wdXNoKFswLDAsMV0pLHIucHVzaChbMCwwLDFdKTt2YXIgdT1uZXcgXy5kZWZhdWx0KGQuZGVmYXVsdC5MSU5FUyk7dS5idWZmZXJWZXJ0ZXgodCksdS5idWZmZXJJbmRleChuKSx1LmJ1ZmZlckRhdGEocixcImFDb2xvclwiLDMpO3ZhciBzPW5ldyBwLmRlZmF1bHQoZyxFKTtyZXR1cm4oMCxsLmRlZmF1bHQpKHRoaXMsKDAsaS5kZWZhdWx0KShlKS5jYWxsKHRoaXMsdSxzKSl9cmV0dXJuKDAsaC5kZWZhdWx0KShlLHQpLGV9KHguZGVmYXVsdCk7ZS5kZWZhdWx0PWIsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDQpLGk9bihhKSx1PXIoMSksbz1uKHUpLHM9cigyKSxsPW4ocyksZj1yKDYpLGg9bihmKSxjPXIoMTMpLGQ9bihjKSx2PXIoNSksXz1uKHYpLG09cigxNikscD1uKG0pLE09cig3KSx4PW4oTSksZz1yKDkpLEU9bihnKSxiPXIoODMpLHk9cigzMSksUz1mdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7KDAsby5kZWZhdWx0KSh0aGlzLGUpO3ZhciB0PXAuZGVmYXVsdC5zcGhlcmUoMSwyNCkscj1uZXcgeC5kZWZhdWx0KGIseSk7cmV0dXJuKDAsaC5kZWZhdWx0KSh0aGlzLCgwLGkuZGVmYXVsdCkoZSkuY2FsbCh0aGlzLHQscikpfXJldHVybigwLF8uZGVmYXVsdCkoZSx0KSwoMCxsLmRlZmF1bHQpKGUsW3trZXk6XCJkcmF3XCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPD0wfHx2b2lkIDA9PT1hcmd1bWVudHNbMF0/WzAsMCwwXTphcmd1bWVudHNbMF0scj1hcmd1bWVudHMubGVuZ3RoPD0xfHx2b2lkIDA9PT1hcmd1bWVudHNbMV0/WzEsMSwxXTphcmd1bWVudHNbMV0sbj1hcmd1bWVudHMubGVuZ3RoPD0yfHx2b2lkIDA9PT1hcmd1bWVudHNbMl0/WzEsMSwxXTphcmd1bWVudHNbMl0sYT1hcmd1bWVudHMubGVuZ3RoPD0zfHx2b2lkIDA9PT1hcmd1bWVudHNbM10/MTphcmd1bWVudHNbM107dGhpcy5zaGFkZXIuYmluZCgpLHRoaXMuc2hhZGVyLnVuaWZvcm0oXCJwb3NpdGlvblwiLFwidW5pZm9ybTNmdlwiLHQpLHRoaXMuc2hhZGVyLnVuaWZvcm0oXCJzY2FsZVwiLFwidW5pZm9ybTNmdlwiLHIpLHRoaXMuc2hhZGVyLnVuaWZvcm0oXCJjb2xvclwiLFwidW5pZm9ybTNmdlwiLG4pLHRoaXMuc2hhZGVyLnVuaWZvcm0oXCJvcGFjaXR5XCIsXCJ1bmlmb3JtMWZcIixhKSwoMCxkLmRlZmF1bHQpKCgwLGkuZGVmYXVsdCkoZS5wcm90b3R5cGUpLFwiZHJhd1wiLHRoaXMpLmNhbGwodGhpcyl9fV0pLGV9KEUuZGVmYXVsdCk7ZS5kZWZhdWx0PVMsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDQpLGk9bihhKSx1PXIoMSksbz1uKHUpLHM9cigyKSxsPW4ocyksZj1yKDYpLGg9bihmKSxjPXIoMTMpLGQ9bihjKSx2PXIoNSksXz1uKHYpLG09cigxNikscD1uKG0pLE09cig3KSx4PW4oTSksZz1yKDkpLEU9bihnKSxiPXIoNTQpLHk9cig1NSksUz1mdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7KDAsby5kZWZhdWx0KSh0aGlzLGUpO3ZhciB0PXAuZGVmYXVsdC5iaWdUcmlhbmdsZSgpLHI9bmV3IHguZGVmYXVsdChiLHkpLG49KDAsaC5kZWZhdWx0KSh0aGlzLCgwLGkuZGVmYXVsdCkoZSkuY2FsbCh0aGlzLHQscikpO3JldHVybiByLmJpbmQoKSxyLnVuaWZvcm0oXCJ0ZXh0dXJlXCIsXCJ1bmlmb3JtMWlcIiwwKSxufXJldHVybigwLF8uZGVmYXVsdCkoZSx0KSwoMCxsLmRlZmF1bHQpKGUsW3trZXk6XCJkcmF3XCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5zaGFkZXIuYmluZCgpLHQuYmluZCgwKSwoMCxkLmRlZmF1bHQpKCgwLGkuZGVmYXVsdCkoZS5wcm90b3R5cGUpLFwiZHJhd1wiLHRoaXMpLmNhbGwodGhpcyl9fV0pLGV9KEUuZGVmYXVsdCk7ZS5kZWZhdWx0PVMsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDQpLGk9bihhKSx1PXIoMSksbz1uKHUpLHM9cigyKSxsPW4ocyksZj1yKDYpLGg9bihmKSxjPXIoMTMpLGQ9bihjKSx2PXIoNSksXz1uKHYpLG09cigzKSxwPW4obSksTT1yKDEyKSx4PW4oTSksZz1yKDcpLEU9bihnKSxiPXIoOSkseT1uKGIpLFM9cigxNzQpLFQ9cigzMSksST1mdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7KDAsby5kZWZhdWx0KSh0aGlzLGUpO3ZhciB0PVtdLHI9W10sbj0wLGE9MTAwLHU9dm9pZCAwLHM9dm9pZCAwO2Zvcih1PS1hO2E+dTt1Kz0xKWZvcihzPS1hO2E+cztzKz0xKXQucHVzaChbdSxzLDBdKSxyLnB1c2gobiksbisrLHQucHVzaChbdSwwLHNdKSxyLnB1c2gobiksbisrO3ZhciBsPW5ldyB4LmRlZmF1bHQocC5kZWZhdWx0LlBPSU5UUyk7bC5idWZmZXJWZXJ0ZXgodCksbC5idWZmZXJJbmRleChyKTt2YXIgZj1uZXcgRS5kZWZhdWx0KFMsVCksYz0oMCxoLmRlZmF1bHQpKHRoaXMsKDAsaS5kZWZhdWx0KShlKS5jYWxsKHRoaXMsbCxmKSk7cmV0dXJuIGMuY29sb3I9WzEsMSwxXSxjLm9wYWNpdHk9LjUsY31yZXR1cm4oMCxfLmRlZmF1bHQpKGUsdCksKDAsbC5kZWZhdWx0KShlLFt7a2V5OlwiZHJhd1wiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5zaGFkZXIuYmluZCgpLHRoaXMuc2hhZGVyLnVuaWZvcm0oXCJjb2xvclwiLFwidW5pZm9ybTNmdlwiLHRoaXMuY29sb3IpLHRoaXMuc2hhZGVyLnVuaWZvcm0oXCJvcGFjaXR5XCIsXCJ1bmlmb3JtMWZcIix0aGlzLm9wYWNpdHkpLCgwLGQuZGVmYXVsdCkoKDAsaS5kZWZhdWx0KShlLnByb3RvdHlwZSksXCJkcmF3XCIsdGhpcykuY2FsbCh0aGlzKX19XSksZX0oeS5kZWZhdWx0KTtlLmRlZmF1bHQ9SSx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoNCksaT1uKGEpLHU9cigxKSxvPW4odSkscz1yKDIpLGw9bihzKSxmPXIoNiksaD1uKGYpLGM9cigxMyksZD1uKGMpLHY9cig1KSxfPW4odiksbT1yKDMpLHA9bihtKSxNPXIoMTYpLHg9bihNKSxnPXIoNyksRT1uKGcpLGI9cig5KSx5PW4oYiksUz1yKDU0KSxUPXIoODIpLEk9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSgpeygwLG8uZGVmYXVsdCkodGhpcyxlKTt2YXIgdD14LmRlZmF1bHQuYmlnVHJpYW5nbGUoKSxyPW5ldyBFLmRlZmF1bHQoUyxUKSxuPSgwLGguZGVmYXVsdCkodGhpcywoMCxpLmRlZmF1bHQpKGUpLmNhbGwodGhpcyx0LHIpKTtyZXR1cm4gci5iaW5kKCksci51bmlmb3JtKFwidGV4dHVyZVwiLFwidW5pZm9ybTFpXCIsMCksbn1yZXR1cm4oMCxfLmRlZmF1bHQpKGUsdCksKDAsbC5kZWZhdWx0KShlLFt7a2V5OlwiZHJhd1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuc2hhZGVyLmJpbmQoKSx0LmJpbmQoMCksdGhpcy5zaGFkZXIudW5pZm9ybShcInVSZXNvbHV0aW9uXCIsXCJ2ZWMyXCIsWzEvcC5kZWZhdWx0LndpZHRoLDEvcC5kZWZhdWx0LmhlaWdodF0pLCgwLGQuZGVmYXVsdCkoKDAsaS5kZWZhdWx0KShlLnByb3RvdHlwZSksXCJkcmF3XCIsdGhpcykuY2FsbCh0aGlzKX19XSksZX0oeS5kZWZhdWx0KTtlLmRlZmF1bHQ9SSx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoNCksaT1uKGEpLHU9cigxKSxvPW4odSkscz1yKDIpLGw9bihzKSxmPXIoNiksaD1uKGYpLGM9cigxMyksZD1uKGMpLHY9cig1KSxfPW4odiksbT1yKDMpLHA9bihtKSxNPXIoMTIpLHg9bihNKSxnPXIoNyksRT1uKGcpLGI9cig5KSx5PW4oYiksUz1yKDUzKSxUPXIoMzEpLEk9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSgpeygwLG8uZGVmYXVsdCkodGhpcyxlKTt2YXIgdD1bXSxyPVswLDFdLG49W1swLDBdLFsxLDFdXTt0LnB1c2goWzAsMCwwXSksdC5wdXNoKFswLDAsMF0pO3ZhciBhPW5ldyB4LmRlZmF1bHQocC5kZWZhdWx0LkxJTkVTKTthLmJ1ZmZlclZlcnRleCh0KSxhLmJ1ZmZlclRleENvb3JkKG4pLGEuYnVmZmVySW5kZXgocik7dmFyIHU9bmV3IEUuZGVmYXVsdChTLFQpO3JldHVybigwLGguZGVmYXVsdCkodGhpcywoMCxpLmRlZmF1bHQpKGUpLmNhbGwodGhpcyxhLHUpKX1yZXR1cm4oMCxfLmRlZmF1bHQpKGUsdCksKDAsbC5kZWZhdWx0KShlLFt7a2V5OlwiZHJhd1wiLHZhbHVlOmZ1bmN0aW9uKHQscil7dmFyIG49YXJndW1lbnRzLmxlbmd0aDw9Mnx8dm9pZCAwPT09YXJndW1lbnRzWzJdP1sxLDEsMV06YXJndW1lbnRzWzJdLGE9YXJndW1lbnRzLmxlbmd0aDw9M3x8dm9pZCAwPT09YXJndW1lbnRzWzNdPzE6YXJndW1lbnRzWzNdO3RoaXMuX21lc2guYnVmZmVyVmVydGV4KFt0LHJdKSx0aGlzLl9zaGFkZXIuYmluZCgpLHRoaXMuX3NoYWRlci51bmlmb3JtKFwiY29sb3JcIixcInZlYzNcIixuKSx0aGlzLl9zaGFkZXIudW5pZm9ybShcIm9wYWNpdHlcIixcImZsb2F0XCIsYSksKDAsZC5kZWZhdWx0KSgoMCxpLmRlZmF1bHQpKGUucHJvdG90eXBlKSxcImRyYXdcIix0aGlzKS5jYWxsKHRoaXMpfX1dKSxlfSh5LmRlZmF1bHQpO2UuZGVmYXVsdD1JLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cig0KSxpPW4oYSksdT1yKDEpLG89bih1KSxzPXIoMiksbD1uKHMpLGY9cig2KSxoPW4oZiksYz1yKDEzKSxkPW4oYyksdj1yKDUpLF89bih2KSxtPXIoMTYpLHA9bihtKSxNPXIoNykseD1uKE0pLGc9cig5KSxFPW4oZyksYj1yKDE3NSkseT1yKDU1KSxTPWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUoKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPD0wfHx2b2lkIDA9PT1hcmd1bWVudHNbMF0/NTA6YXJndW1lbnRzWzBdLHI9YXJndW1lbnRzLmxlbmd0aDw9MXx8dm9pZCAwPT09YXJndW1lbnRzWzFdPzI0OmFyZ3VtZW50c1sxXTsoMCxvLmRlZmF1bHQpKHRoaXMsZSk7dmFyIG49cC5kZWZhdWx0LnNwaGVyZSh0LHIsITApLGE9bmV3IHguZGVmYXVsdChiLHkpO3JldHVybigwLGguZGVmYXVsdCkodGhpcywoMCxpLmRlZmF1bHQpKGUpLmNhbGwodGhpcyxuLGEpKX1yZXR1cm4oMCxfLmRlZmF1bHQpKGUsdCksKDAsbC5kZWZhdWx0KShlLFt7a2V5OlwiZHJhd1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuc2hhZGVyLmJpbmQoKSx0LmJpbmQoMCksKDAsZC5kZWZhdWx0KSgoMCxpLmRlZmF1bHQpKGUucHJvdG90eXBlKSxcImRyYXdcIix0aGlzKS5jYWxsKHRoaXMpfX1dKSxlfShFLmRlZmF1bHQpO2UuZGVmYXVsdD1TLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cig0KSxpPW4oYSksdT1yKDEpLG89bih1KSxzPXIoMiksbD1uKHMpLGY9cig2KSxoPW4oZiksYz1yKDEzKSxkPW4oYyksdj1yKDUpLF89bih2KSxtPXIoMTYpLHA9bihtKSxNPXIoNykseD1uKE0pLGc9cig5KSxFPW4oZyksYj1yKDg1KSx5PXIoODQpLFM9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSgpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg8PTB8fHZvaWQgMD09PWFyZ3VtZW50c1swXT8yMDphcmd1bWVudHNbMF07KDAsby5kZWZhdWx0KSh0aGlzLGUpO3ZhciByPXAuZGVmYXVsdC5za3lib3godCksbj1uZXcgeC5kZWZhdWx0KGIseSk7cmV0dXJuKDAsaC5kZWZhdWx0KSh0aGlzLCgwLGkuZGVmYXVsdCkoZSkuY2FsbCh0aGlzLHIsbikpfXJldHVybigwLF8uZGVmYXVsdCkoZSx0KSwoMCxsLmRlZmF1bHQpKGUsW3trZXk6XCJkcmF3XCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5zaGFkZXIuYmluZCgpLHQuYmluZCgwKSwoMCxkLmRlZmF1bHQpKCgwLGkuZGVmYXVsdCkoZS5wcm90b3R5cGUpLFwiZHJhd1wiLHRoaXMpLmNhbGwodGhpcyl9fV0pLGV9KEUuZGVmYXVsdCk7ZS5kZWZhdWx0PVMsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDEpLGk9bihhKSx1PXIoMiksbz1uKHUpLHM9cigyMyksbD1uKHMpLGY9cigzKSxoPW4oZiksYz1yKDM1KSxkPW4oYyksdj1yKDU3KSxfPW4odiksbT1yKDY0KSxwPW4obSksTT1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXt2YXIgZT10aGlzOygwLGkuZGVmYXVsdCkodGhpcyx0KSx0aGlzLl9jaGlsZHJlbj1bXSx0aGlzLl9tYXRyaXhJZGVudGl0eT1tYXQ0LmNyZWF0ZSgpLGguZGVmYXVsdC5lbmFibGVBbHBoYUJsZW5kaW5nKCksdGhpcy5faW5pdCgpLHRoaXMuX2luaXRUZXh0dXJlcygpLHRoaXMuX2luaXRWaWV3cygpLHRoaXMuX2VmSW5kZXg9bC5kZWZhdWx0LmFkZEVGKGZ1bmN0aW9uKCl7cmV0dXJuIGUuX2xvb3AoKX0pLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsZnVuY3Rpb24oKXtyZXR1cm4gZS5yZXNpemUoKX0pfXJldHVybigwLG8uZGVmYXVsdCkodCxbe2tleTpcInVwZGF0ZVwiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcInJlbmRlclwiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcInN0b3BcIix2YWx1ZTpmdW5jdGlvbigpey0xIT09dGhpcy5fZWZJbmRleCYmKHRoaXMuX2VmSW5kZXg9bC5kZWZhdWx0LnJlbW92ZUVGKHRoaXMuX2VmSW5kZXgpKX19LHtrZXk6XCJzdGFydFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpczstMT09PXRoaXMuX2VmSW5kZXgmJih0aGlzLl9lZkluZGV4PWwuZGVmYXVsdC5hZGRFRihmdW5jdGlvbigpe3JldHVybiB0Ll9sb29wKCl9KSl9fSx7a2V5OlwicmVzaXplXCIsdmFsdWU6ZnVuY3Rpb24oKXtoLmRlZmF1bHQuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCx3aW5kb3cuaW5uZXJIZWlnaHQpLHRoaXMuY2FtZXJhLnNldEFzcGVjdFJhdGlvKGguZGVmYXVsdC5hc3BlY3RSYXRpbyl9fSx7a2V5OlwiYWRkQ2hpbGRcIix2YWx1ZTpmdW5jdGlvbih0KXt0aGlzLl9jaGlsZHJlbi5wdXNoKHQpfX0se2tleTpcInJlbW92ZUNoaWxkXCIsdmFsdWU6ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fY2hpbGRyZW4uaW5kZXhPZih0KTtyZXR1cm4tMT09ZT92b2lkIGNvbnNvbGUud2FybihcIkNoaWxkIG5vIGV4aXN0XCIpOnZvaWQgdGhpcy5fY2hpbGRyZW4uc3BsaWNlKGUsMSl9fSx7a2V5OlwiX2luaXRUZXh0dXJlc1wiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcIl9pbml0Vmlld3NcIix2YWx1ZTpmdW5jdGlvbigpe319LHtrZXk6XCJfcmVuZGVyQ2hpbGRyZW5cIix2YWx1ZTpmdW5jdGlvbigpe2Zvcih2YXIgdD12b2lkIDAsZT0wO2U8dGhpcy5fY2hpbGRyZW4ubGVuZ3RoO2UrKyl0PXRoaXMuX2NoaWxkcmVuW2VdLHQudG9SZW5kZXIoKTtoLmRlZmF1bHQucm90YXRlKHRoaXMuX21hdHJpeElkZW50aXR5KX19LHtrZXk6XCJfaW5pdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5jYW1lcmE9bmV3IGQuZGVmYXVsdCx0aGlzLmNhbWVyYS5zZXRQZXJzcGVjdGl2ZSg0NSpNYXRoLlBJLzE4MCxoLmRlZmF1bHQuYXNwZWN0UmF0aW8sLjEsMTAwKSx0aGlzLm9yYml0YWxDb250cm9sPW5ldyBwLmRlZmF1bHQodGhpcy5jYW1lcmEsd2luZG93LDE1KSx0aGlzLm9yYml0YWxDb250cm9sLnJhZGl1cy52YWx1ZT0xMCx0aGlzLmNhbWVyYU9ydGhvPW5ldyBfLmRlZmF1bHR9fSx7a2V5OlwiX2xvb3BcIix2YWx1ZTpmdW5jdGlvbigpe2guZGVmYXVsdC52aWV3cG9ydCgwLDAsaC5kZWZhdWx0LndpZHRoLGguZGVmYXVsdC5oZWlnaHQpLGguZGVmYXVsdC5zZXRNYXRyaWNlcyh0aGlzLmNhbWVyYSksdGhpcy51cGRhdGUoKSx0aGlzLl9yZW5kZXJDaGlsZHJlbigpLHRoaXMucmVuZGVyKCl9fV0pLHR9KCk7ZS5kZWZhdWx0PU0sdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDEpLGk9bihhKSx1PXIoMiksbz1uKHUpLHM9cig3KSxsPW4ocyksZj1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSxyKXsoMCxpLmRlZmF1bHQpKHRoaXMsdCksdGhpcy5zaGFkZXI9bmV3IGwuZGVmYXVsdChlLHIpLHRoaXMuX2luaXQoKX1yZXR1cm4oMCxvLmRlZmF1bHQpKHQsW3trZXk6XCJfaW5pdFwiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcInJlbmRlclwiLHZhbHVlOmZ1bmN0aW9uKCl7fX1dKSx0fSgpO2UuZGVmYXVsdD1mLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cig0KSxpPW4oYSksdT1yKDEpLG89bih1KSxzPXIoMiksbD1uKHMpLGY9cig2KSxoPW4oZiksYz1yKDUpLGQ9bihjKSx2PXIoNTkpLF89bih2KSxtPXIoNykscD1uKG0pLE09cigzKSx4PW4oTSksZz1mdW5jdGlvbih0KXtmdW5jdGlvbiBlKHQscil7KDAsby5kZWZhdWx0KSh0aGlzLGUpO3ZhciBuPSgwLGguZGVmYXVsdCkodGhpcywoMCxpLmRlZmF1bHQpKGUpLmNhbGwodGhpcykpO3JldHVybiBuLl9jaGlsZHJlbj1bXSxuLnNoYWRlcj1uZXcgcC5kZWZhdWx0KHQsciksbi5faW5pdCgpLG4uX21hdHJpeFRlbXA9bWF0NC5jcmVhdGUoKSxufXJldHVybigwLGQuZGVmYXVsdCkoZSx0KSwoMCxsLmRlZmF1bHQpKGUsW3trZXk6XCJfaW5pdFwiLHZhbHVlOmZ1bmN0aW9uKCl7fX0se2tleTpcImFkZENoaWxkXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5fY2hpbGRyZW4ucHVzaCh0KX19LHtrZXk6XCJyZW1vdmVDaGlsZFwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2NoaWxkcmVuLmluZGV4T2YodCk7cmV0dXJuLTE9PWU/dm9pZCBjb25zb2xlLndhcm4oXCJDaGlsZCBubyBleGlzdFwiKTp2b2lkIHRoaXMuX2NoaWxkcmVuLnNwbGljZShlLDEpfX0se2tleTpcInRvUmVuZGVyXCIsdmFsdWU6ZnVuY3Rpb24odCl7dm9pZCAwPT09dCYmKHQ9bWF0NC5jcmVhdGUoKSksbWF0NC5tdWwodGhpcy5fbWF0cml4VGVtcCx0LHRoaXMubWF0cml4KSx4LmRlZmF1bHQucm90YXRlKHRoaXMuX21hdHJpeFRlbXApLHRoaXMucmVuZGVyKCk7Zm9yKHZhciBlPTA7ZTx0aGlzLl9jaGlsZHJlbi5sZW5ndGg7ZSsrKXt2YXIgcj10aGlzLl9jaGlsZHJlbltlXTtyLnRvUmVuZGVyKHRoaXMubWF0cml4KX19fSx7a2V5OlwicmVuZGVyXCIsdmFsdWU6ZnVuY3Rpb24oKXt9fV0pLGV9KF8uZGVmYXVsdCk7ZS5kZWZhdWx0PWcsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDEyNCksaT1uKGEpLHU9cigxMiksbz1uKHUpLHM9ZnVuY3Rpb24odCl7dmFyIGU9e307dC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciByPXQubWVzaCxuPXIudmVydGljZXMsYT1yLm5vcm1hbHMsaT1yLmNvb3Jkcyx1PXIudHJpYW5nbGVzLHM9ci5uYW1lO2lmKCFlW3NdKXt2YXIgbD0obmV3IG8uZGVmYXVsdCkuYnVmZmVyRmxhdHRlbkRhdGEobixcImFWZXJ0ZXhQb3NpdGlvblwiLDMpLmJ1ZmZlckZsYXR0ZW5EYXRhKGksXCJhVGV4dHVyZUNvb3JkXCIsMikuYnVmZmVyRmxhdHRlbkRhdGEoYSxcImFOb3JtYWxcIiwzKS5idWZmZXJJbmRleCh1KTtlW3NdPWx9dC5nbE1lc2g9ZVtzXX0pfSxsPWZ1bmN0aW9uKHQpe3ZhciBlPWkuZGVmYXVsdC5wYXJzZSh0KTtyZXR1cm4gcyhlKSxlfSxmPWZ1bmN0aW9uKHQsZSl7aS5kZWZhdWx0LmxvYWQodCxmdW5jdGlvbih0KXtzKHQpLGUodCl9KX0saD17cGFyc2U6bCxsb2FkOmZ9O2UuZGVmYXVsdD1oLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cig0KSxpPW4oYSksdT1yKDEpLG89bih1KSxzPXIoMiksbD1uKHMpLGY9cig2KSxoPW4oZiksYz1yKDUpLGQ9bihjKSx2PXIoMzYpLF89bih2KSxtPXIoMTEwKSxwPW4obSksTT1mdW5jdGlvbih0KXtmdW5jdGlvbiBlKCl7cmV0dXJuKDAsby5kZWZhdWx0KSh0aGlzLGUpLCgwLGguZGVmYXVsdCkodGhpcywoMCxpLmRlZmF1bHQpKGUpLmNhbGwodGhpcywhMCkpfXJldHVybigwLGQuZGVmYXVsdCkoZSx0KSwoMCxsLmRlZmF1bHQpKGUsW3trZXk6XCJwYXJzZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3JldHVybigwLHAuZGVmYXVsdCkodCl9fSx7a2V5OlwiX29uTG9hZGVkXCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnBhcnNlKHRoaXMuX3JlcS5yZXNwb25zZSk7dGhpcy5fY2FsbGJhY2smJnRoaXMuX2NhbGxiYWNrKHQpfX1dKSxlfShfLmRlZmF1bHQpO00ucGFyc2U9ZnVuY3Rpb24odCl7cmV0dXJuKDAscC5kZWZhdWx0KSh0KX0sZS5kZWZhdWx0PU0sdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgYT1yKDQpLGk9bihhKSx1PXIoMSksbz1uKHUpLHM9cigyKSxsPW4ocyksZj1yKDYpLGg9bihmKSxjPXIoMTMpLGQ9bihjKSx2PXIoNSksXz1uKHYpLG09cigzNikscD1uKG0pLE09cigxMikseD1uKE0pLGc9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSgpe3JldHVybigwLG8uZGVmYXVsdCkodGhpcyxlKSwoMCxoLmRlZmF1bHQpKHRoaXMsKDAsaS5kZWZhdWx0KShlKS5hcHBseSh0aGlzLGFyZ3VtZW50cykpfXJldHVybigwLF8uZGVmYXVsdCkoZSx0KSwoMCxsLmRlZmF1bHQpKGUsW3trZXk6XCJsb2FkXCIsdmFsdWU6ZnVuY3Rpb24odCxyKXt2YXIgbj1hcmd1bWVudHMubGVuZ3RoPD0yfHx2b2lkIDA9PT1hcmd1bWVudHNbMl0/NDphcmd1bWVudHNbMl07dGhpcy5fZHJhd1R5cGU9biwoMCxkLmRlZmF1bHQpKCgwLGkuZGVmYXVsdCkoZS5wcm90b3R5cGUpLFwibG9hZFwiLHRoaXMpLmNhbGwodGhpcyx0LHIpfX0se2tleTpcIl9vbkxvYWRlZFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5wYXJzZU9iaih0aGlzLl9yZXEucmVzcG9uc2UpfX0se2tleTpcInBhcnNlT2JqXCIsdmFsdWU6ZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSh0KXt2YXIgZT1wYXJzZUludCh0KTtyZXR1cm4gMyooZT49MD9lLTE6ZStjLmxlbmd0aC8zKX1mdW5jdGlvbiByKHQpe3ZhciBlPXBhcnNlSW50KHQpO3JldHVybiAzKihlPj0wP2UtMTplK2QubGVuZ3RoLzMpfWZ1bmN0aW9uIG4odCl7dmFyIGU9cGFyc2VJbnQodCk7cmV0dXJuIDIqKGU+PTA/ZS0xOmUrdi5sZW5ndGgvMil9ZnVuY3Rpb24gYSh0LGUscil7bC5wdXNoKFtjW3RdLGNbdCsxXSxjW3QrMl1dKSxsLnB1c2goW2NbZV0sY1tlKzFdLGNbZSsyXV0pLGwucHVzaChbY1tyXSxjW3IrMV0sY1tyKzJdXSksXy5wdXNoKDMqbSswKSxfLnB1c2goMyptKzEpLF8ucHVzaCgzKm0rMiksbSsrfWZ1bmN0aW9uIGkodCxlLHIpe2YucHVzaChbdlt0XSx2W3QrMV1dKSxmLnB1c2goW3ZbZV0sdltlKzFdXSksZi5wdXNoKFt2W3JdLHZbcisxXV0pfWZ1bmN0aW9uIHUodCxlLHIpe2gucHVzaChbZFt0XSxkW3QrMV0sZFt0KzJdXSksaC5wdXNoKFtkW2VdLGRbZSsxXSxkW2UrMl1dKSxoLnB1c2goW2Rbcl0sZFtyKzFdLGRbcisyXV0pfWZ1bmN0aW9uIG8odCxvLHMsbCxmLGgsYyxkLHYsXyxtLHApe3ZhciBNPWUodCkseD1lKG8pLGc9ZShzKSxFPXZvaWQgMDt2b2lkIDA9PT1sP2EoTSx4LGcpOihFPWUobCksYShNLHgsRSksYSh4LGcsRSkpLHZvaWQgMCE9PWYmJihNPW4oZikseD1uKGgpLGc9bihjKSx2b2lkIDA9PT1sP2koTSx4LGcpOihFPW4oZCksaShNLHgsRSksaSh4LGcsRSkpKSx2b2lkIDAhPT12JiYoTT1yKHYpLHg9cihfKSxnPXIobSksdm9pZCAwPT09bD91KE0seCxnKTooRT1yKHApLHUoTSx4LEUpLHUoeCxnLEUpKSl9Zm9yKHZhciBzPXQuc3BsaXQoXCJcXG5cIiksbD1bXSxmPVtdLGg9W10sYz1bXSxkPVtdLHY9W10sXz1bXSxtPTAscD12b2lkIDAsTT0vdiggK1tcXGR8XFwufFxcK3xcXC18ZXxFXSspKCArW1xcZHxcXC58XFwrfFxcLXxlfEVdKykoICtbXFxkfFxcLnxcXCt8XFwtfGV8RV0rKS8seD0vdm4oICtbXFxkfFxcLnxcXCt8XFwtfGV8RV0rKSggK1tcXGR8XFwufFxcK3xcXC18ZXxFXSspKCArW1xcZHxcXC58XFwrfFxcLXxlfEVdKykvLGc9L3Z0KCArW1xcZHxcXC58XFwrfFxcLXxlfEVdKykoICtbXFxkfFxcLnxcXCt8XFwtfGV8RV0rKS8sRT0vZiggKy0/XFxkKykoICstP1xcZCspKCArLT9cXGQrKSggKy0/XFxkKyk/LyxiPS9mKCArKC0/XFxkKylcXC8oLT9cXGQrKSkoICsoLT9cXGQrKVxcLygtP1xcZCspKSggKygtP1xcZCspXFwvKC0/XFxkKykpKCArKC0/XFxkKylcXC8oLT9cXGQrKSk/Lyx5PS9mKCArKC0/XFxkKylcXC8oLT9cXGQrKVxcLygtP1xcZCspKSggKygtP1xcZCspXFwvKC0/XFxkKylcXC8oLT9cXGQrKSkoICsoLT9cXGQrKVxcLygtP1xcZCspXFwvKC0/XFxkKykpKCArKC0/XFxkKylcXC8oLT9cXGQrKVxcLygtP1xcZCspKT8vLFM9L2YoICsoLT9cXGQrKVxcL1xcLygtP1xcZCspKSggKygtP1xcZCspXFwvXFwvKC0/XFxkKykpKCArKC0/XFxkKylcXC9cXC8oLT9cXGQrKSkoICsoLT9cXGQrKVxcL1xcLygtP1xcZCspKT8vLFQ9MDtUPHMubGVuZ3RoO1QrKyl7dmFyIEk9c1tUXTtJPUkudHJpbSgpLDAhPT1JLmxlbmd0aCYmXCIjXCIhPT1JLmNoYXJBdCgwKSYmKG51bGwhPT0ocD1NLmV4ZWMoSSkpP2MucHVzaChwYXJzZUZsb2F0KHBbMV0pLHBhcnNlRmxvYXQocFsyXSkscGFyc2VGbG9hdChwWzNdKSk6bnVsbCE9PShwPXguZXhlYyhJKSk/ZC5wdXNoKHBhcnNlRmxvYXQocFsxXSkscGFyc2VGbG9hdChwWzJdKSxwYXJzZUZsb2F0KHBbM10pKTpudWxsIT09KHA9Zy5leGVjKEkpKT92LnB1c2gocGFyc2VGbG9hdChwWzFdKSxwYXJzZUZsb2F0KHBbMl0pKTpudWxsIT09KHA9RS5leGVjKEkpKT9vKHBbMV0scFsyXSxwWzNdLHBbNF0pOm51bGwhPT0ocD1iLmV4ZWMoSSkpP28ocFsyXSxwWzVdLHBbOF0scFsxMV0scFszXSxwWzZdLHBbOV0scFsxMl0pOm51bGwhPT0ocD15LmV4ZWMoSSkpP28ocFsyXSxwWzZdLHBbMTBdLHBbMTRdLHBbM10scFs3XSxwWzExXSxwWzE1XSxwWzRdLHBbOF0scFsxMl0scFsxNl0pOm51bGwhPT0ocD1TLmV4ZWMoSSkpJiZvKHBbMl0scFs1XSxwWzhdLHBbMTFdLHZvaWQgMCx2b2lkIDAsdm9pZCAwLHZvaWQgMCxwWzNdLHBbNl0scFs5XSxwWzEyXSkpfXJldHVybiB0aGlzLl9nZW5lcmF0ZU1lc2hlcyh7cG9zaXRpb25zOmwsY29vcmRzOmYsbm9ybWFsczpoLGluZGljZXM6X30pfX0se2tleTpcIl9nZW5lcmF0ZU1lc2hlc1wiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPTY1NTM1LHI9dC5ub3JtYWxzLmxlbmd0aD4wLG49dC5jb29yZHMubGVuZ3RoPjAsYT12b2lkIDA7aWYodC5wb3NpdGlvbnMubGVuZ3RoPmUpe3ZhciBpPVtdLHU9MCxvPXt9O2ZvcihvLnBvc2l0aW9ucz10LnBvc2l0aW9ucy5jb25jYXQoKSxvLmNvb3Jkcz10LmNvb3Jkcy5jb25jYXQoKSxvLmluZGljZXM9dC5pbmRpY2VzLmNvbmNhdCgpLG8ubm9ybWFscz10Lm5vcm1hbHMuY29uY2F0KCk7dC5pbmRpY2VzLmxlbmd0aD4wOyl7Zm9yKHZhciBzPU1hdGgubWluKGUsdC5wb3NpdGlvbnMubGVuZ3RoKSxsPXQuaW5kaWNlcy5zcGxpY2UoMCxzKSxmPVtdLGg9W10sYz1bXSxkPXZvaWQgMCx2PTAsXz0wO188bC5sZW5ndGg7XysrKWxbX10+diYmKHY9bFtfXSksZD1sW19dLGYucHVzaChvLnBvc2l0aW9uc1tkXSksbiYmaC5wdXNoKG8uY29vcmRzW2RdKSxyJiZjLnB1c2goby5ub3JtYWxzW2RdKSxsW19dLT11O3U9disxLGE9bmV3IHguZGVmYXVsdCh0aGlzLl9kcmF3VHlwZSksYS5idWZmZXJWZXJ0ZXgoZiksbiYmYS5idWZmZXJUZXhDb29yZChoKSxhLmJ1ZmZlckluZGV4KGwpLHImJmEuYnVmZmVyTm9ybWFsKGMpLGkucHVzaChhKX1yZXR1cm4gdGhpcy5fY2FsbGJhY2smJnRoaXMuX2NhbGxiYWNrKGksbyksaX1yZXR1cm4gYT1uZXcgeC5kZWZhdWx0KHRoaXMuX2RyYXdUeXBlKSxhLmJ1ZmZlclZlcnRleCh0LnBvc2l0aW9ucyksbiYmYS5idWZmZXJUZXhDb29yZCh0LmNvb3JkcyksYS5idWZmZXJJbmRleCh0LmluZGljZXMpLHImJmEuYnVmZmVyTm9ybWFsKHQubm9ybWFscyksdGhpcy5fY2FsbGJhY2smJnRoaXMuX2NhbGxiYWNrKGEsdCksYX19XSksZX0ocC5kZWZhdWx0KTtnLnBhcnNlPWZ1bmN0aW9uKHQpe3ZhciBlPW5ldyBnO3JldHVybiBlLnBhcnNlT2JqKHQpfSxlLmRlZmF1bHQ9Zyx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoMSksaT1uKGEpLHU9cigyKSxvPW4odSkscz1yKDI3KSxsPShuKHMpLHIoMykpLGY9bihsKSxoPXIoMTYpLGM9bihoKSxkPXIoMzIpLHY9bihkKSxfPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlLHIpe2FyZ3VtZW50cy5sZW5ndGg8PTJ8fHZvaWQgMD09PWFyZ3VtZW50c1syXT97fTphcmd1bWVudHNbMl07KDAsaS5kZWZhdWx0KSh0aGlzLHQpLHRoaXMuX3dpZHRoPWV8fGYuZGVmYXVsdC53aWR0aCx0aGlzLl9oZWlnaHQ9cnx8Zi5kZWZhdWx0LmhlaWdodCx0aGlzLl9wYXJhbXM9e30sdGhpcy5zZXRTaXplKGUsciksdGhpcy5fbWVzaD1jLmRlZmF1bHQuYmlnVHJpYW5nbGUoKSx0aGlzLl9wYXNzZXM9W10sdGhpcy5fcmV0dXJuVGV4dHVyZX1yZXR1cm4oMCxvLmRlZmF1bHQpKHQsW3trZXk6XCJhZGRQYXNzXCIsdmFsdWU6ZnVuY3Rpb24odCl7aWYodC5wYXNzZXMpcmV0dXJuIHZvaWQgdGhpcy5hZGRQYXNzKHQucGFzc2VzKTtpZih0Lmxlbmd0aClmb3IodmFyIGU9MDtlPHQubGVuZ3RoO2UrKyl0aGlzLl9wYXNzZXMucHVzaCh0W2VdKTtlbHNlIHRoaXMuX3Bhc3Nlcy5wdXNoKHQpfX0se2tleTpcInJlbmRlclwiLHZhbHVlOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMscj10LG49dm9pZCAwO3JldHVybiB0aGlzLl9wYXNzZXMuZm9yRWFjaChmdW5jdGlvbih0KXtuPXQuaGFzRmJvP3QuZmJvOmUuX2Zib1RhcmdldCxuLmJpbmQoKSxmLmRlZmF1bHQuY2xlYXIoMCwwLDAsMCksdC5yZW5kZXIociksZi5kZWZhdWx0LmRyYXcoZS5fbWVzaCksbi51bmJpbmQoKSx0Lmhhc0Zibz9yPXQuZmJvLmdldFRleHR1cmUoKTooZS5fc3dhcCgpLHI9ZS5fZmJvQ3VycmVudC5nZXRUZXh0dXJlKCkpfSksdGhpcy5fcmV0dXJuVGV4dHVyZT1yLHJ9fSx7a2V5OlwiX3N3YXBcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PXRoaXMuX2Zib0N1cnJlbnQ7dGhpcy5fZmJvQ3VycmVudD10aGlzLl9mYm9UYXJnZXQsdGhpcy5fZmJvVGFyZ2V0PXQsdGhpcy5fY3VycmVudD10aGlzLl9mYm9DdXJyZW50LHRoaXMuX3RhcmdldD10aGlzLl9mYm9UYXJnZXR9fSx7a2V5Olwic2V0U2l6ZVwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7dGhpcy5fd2lkdGg9dCx0aGlzLl9oZWlnaHQ9ZSx0aGlzLl9mYm9DdXJyZW50PW5ldyB2LmRlZmF1bHQodGhpcy5fd2lkdGgsdGhpcy5faGVpZ2h0LHRoaXMuX3BhcmFtcyksdGhpcy5fZmJvVGFyZ2V0PW5ldyB2LmRlZmF1bHQodGhpcy5fd2lkdGgsdGhpcy5faGVpZ2h0LHRoaXMuX3BhcmFtcyl9fSx7a2V5OlwiZ2V0VGV4dHVyZVwiLHZhbHVlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3JldHVyblRleHR1cmV9fSx7a2V5OlwicGFzc2VzXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3Bhc3Nlc319XSksdH0oKTtlLmRlZmF1bHQ9Xyx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoNCksaT1uKGEpLHU9cigxKSxvPW4odSkscz1yKDYpLGw9bihzKSxmPXIoNSksaD1uKGYpLGM9cig2MyksZD1uKGMpLHY9cig2MSksXz1uKHYpLG09cig2MikscD1uKG0pLE09ZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSgpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg8PTB8fHZvaWQgMD09PWFyZ3VtZW50c1swXT85OmFyZ3VtZW50c1swXSxyPWFyZ3VtZW50c1sxXSxuPWFyZ3VtZW50c1syXSxhPWFyZ3VtZW50c1szXTsoMCxvLmRlZmF1bHQpKHRoaXMsZSk7dmFyIHU9KDAsbC5kZWZhdWx0KSh0aGlzLCgwLGkuZGVmYXVsdCkoZSkuY2FsbCh0aGlzKSkscz1uZXcgZC5kZWZhdWx0KHQscixuLGEpLGY9bmV3IF8uZGVmYXVsdCh0LHIsbixhKTtyZXR1cm4gdS5hZGRQYXNzKHMpLHUuYWRkUGFzcyhmKSx1fXJldHVybigwLGguZGVmYXVsdCkoZSx0KSxlfShwLmRlZmF1bHQpO2UuZGVmYXVsdD1NLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cig0KSxpPW4oYSksdT1yKDEpLG89bih1KSxzPXIoNiksbD1uKHMpLGY9cig1KSxoPW4oZiksYz1yKDMpLGQ9bihjKSx2PXIoMjcpLF89bih2KSxtPXIoODIpLHA9bihtKSxNPWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUoKXsoMCxvLmRlZmF1bHQpKHRoaXMsZSk7dmFyIHQ9KDAsbC5kZWZhdWx0KSh0aGlzLCgwLGkuZGVmYXVsdCkoZSkuY2FsbCh0aGlzLHAuZGVmYXVsdCkpO3JldHVybiB0LnVuaWZvcm0oXCJ1UmVzb2x1dGlvblwiLFsxL2QuZGVmYXVsdC53aWR0aCwxL2QuZGVmYXVsdC5oZWlnaHRdKSx0fXJldHVybigwLGguZGVmYXVsdCkoZSx0KSxlfShfLmRlZmF1bHQpO2UuZGVmYXVsdD1NLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cigxKSxpPW4oYSksdT1yKDIpLG89bih1KSxzPSEwO3RyeXt2YXIgbD1kb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO2w9bnVsbH1jYXRjaChmKXtzPSExfXZhciBoPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpeygwLGkuZGVmYXVsdCkodGhpcyx0KSx0aGlzLl9ldmVudExpc3RlbmVycz17fX1yZXR1cm4oMCxvLmRlZmF1bHQpKHQsW3trZXk6XCJhZGRFdmVudExpc3RlbmVyXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtyZXR1cm4gbnVsbCE9PXRoaXMuX2V2ZW50TGlzdGVuZXJzJiZ2b2lkIDAhPT10aGlzLl9ldmVudExpc3RlbmVyc3x8KHRoaXMuX2V2ZW50TGlzdGVuZXJzPXt9KSx0aGlzLl9ldmVudExpc3RlbmVyc1t0XXx8KHRoaXMuX2V2ZW50TGlzdGVuZXJzW3RdPVtdKSx0aGlzLl9ldmVudExpc3RlbmVyc1t0XS5wdXNoKGUpLHRoaXN9fSx7a2V5Olwib25cIix2YWx1ZTpmdW5jdGlvbih0LGUpe3JldHVybiB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodCxlKX19LHtrZXk6XCJyZW1vdmVFdmVudExpc3RlbmVyXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtudWxsIT09dGhpcy5fZXZlbnRMaXN0ZW5lcnMmJnZvaWQgMCE9PXRoaXMuX2V2ZW50TGlzdGVuZXJzfHwodGhpcy5fZXZlbnRMaXN0ZW5lcnM9e30pO3ZhciByPXRoaXMuX2V2ZW50TGlzdGVuZXJzW3RdO2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiByKXJldHVybiB0aGlzO2Zvcih2YXIgbj1yLmxlbmd0aCxhPTA7bj5hO2ErKylyW2FdPT09ZSYmKHIuc3BsaWNlKGEsMSksYS0tLG4tLSk7cmV0dXJuIHRoaXN9fSx7a2V5Olwib2ZmXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHQsZSl9fSx7a2V5OlwiZGlzcGF0Y2hFdmVudFwiLHZhbHVlOmZ1bmN0aW9uKHQpe251bGwhPT10aGlzLl9ldmVudExpc3RlbmVycyYmdm9pZCAwIT09dGhpcy5fZXZlbnRMaXN0ZW5lcnN8fCh0aGlzLl9ldmVudExpc3RlbmVycz17fSk7dmFyIGU9dC50eXBlO3RyeXtudWxsPT09dC50YXJnZXQmJih0LnRhcmdldD10aGlzKSx0LmN1cnJlbnRUYXJnZXQ9dGhpc31jYXRjaChyKXt2YXIgbj17dHlwZTplLGRldGFpbDp0LmRldGFpbCxkaXNwYXRjaGVyOnRoaXN9O3JldHVybiB0aGlzLmRpc3BhdGNoRXZlbnQobil9dmFyIGE9dGhpcy5fZXZlbnRMaXN0ZW5lcnNbZV07aWYobnVsbCE9PWEmJnZvaWQgMCE9PWEpZm9yKHZhciBpPXRoaXMuX2NvcHlBcnJheShhKSx1PWkubGVuZ3RoLG89MDt1Pm87bysrKXt2YXIgcz1pW29dO3MuY2FsbCh0aGlzLHQpfXJldHVybiB0aGlzfX0se2tleTpcImRpc3BhdGNoQ3VzdG9tRXZlbnRcIix2YWx1ZTpmdW5jdGlvbih0LGUpe3ZhciByPXZvaWQgMDtyZXR1cm4gcz8ocj1kb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpLHIuZGlzcGF0Y2hlcj10aGlzLHIuaW5pdEN1c3RvbUV2ZW50KHQsITEsITEsZSkpOnI9e3R5cGU6dCxkZXRhaWw6ZSxkaXNwYXRjaGVyOnRoaXN9LHRoaXMuZGlzcGF0Y2hFdmVudChyKX19LHtrZXk6XCJ0cmlnZ2VyXCIsdmFsdWU6ZnVuY3Rpb24odCxlKXtyZXR1cm4gdGhpcy5kaXNwYXRjaEN1c3RvbUV2ZW50KHQsZSl9fSx7a2V5OlwiX2Rlc3Ryb3lcIix2YWx1ZTpmdW5jdGlvbigpe2lmKG51bGwhPT10aGlzLl9ldmVudExpc3RlbmVycyl7Zm9yKHZhciB0IGluIHRoaXMuX2V2ZW50TGlzdGVuZXJzKWlmKHRoaXMuX2V2ZW50TGlzdGVuZXJzLmhhc093blByb3BlcnR5KHQpKXtmb3IodmFyIGU9dGhpcy5fZXZlbnRMaXN0ZW5lcnNbdF0scj1lLmxlbmd0aCxuPTA7cj5uO24rKyllW25dPW51bGw7ZGVsZXRlIHRoaXMuX2V2ZW50TGlzdGVuZXJzW3RdfXRoaXMuX2V2ZW50TGlzdGVuZXJzPW51bGx9fX0se2tleTpcIl9jb3B5QXJyYXlcIix2YWx1ZTpmdW5jdGlvbih0KXtmb3IodmFyIGU9bmV3IEFycmF5KHQubGVuZ3RoKSxyPWUubGVuZ3RoLG49MDtyPm47bisrKWVbbl09dFtuXTtyZXR1cm4gZX19XSksdH0oKTtlLmRlZmF1bHQ9aCx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pLGUuZGVmYXVsdD1bXCJFWFRfc2hhZGVyX3RleHR1cmVfbG9kXCIsXCJFWFRfc1JHQlwiLFwiRVhUX2ZyYWdfZGVwdGhcIixcIk9FU190ZXh0dXJlX2Zsb2F0XCIsXCJPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0XCIsXCJPRVNfdGV4dHVyZV9mbG9hdF9saW5lYXJcIixcIk9FU190ZXh0dXJlX2hhbGZfZmxvYXRfbGluZWFyXCIsXCJPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXNcIixcIldFQkdMX2RlcHRoX3RleHR1cmVcIixcIkVYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpY1wiLFwiT0VTX3ZlcnRleF9hcnJheV9vYmplY3RcIixcIkFOR0xFX2luc3RhbmNlZF9hcnJheXNcIixcIldFQkdMX2RyYXdfYnVmZmVyc1wiXSx0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIodCxlLHIsbixhLGkpe2Z1bmN0aW9uIHUoZSl7dmFyIHI9MDtkbyBlW3IrK109dFtuXTt3aGlsZSgrK248XyYmcjxlLmxlbmd0aCk7cmV0dXJuIHJ9ZnVuY3Rpb24gbyhlLHIsYSl7dmFyIGk9MDtkbyBlW3IraSsrXT10W25dO3doaWxlKCsrbjxfJiZhPmkpO3JldHVybiBpfWZ1bmN0aW9uIHModCxlLHIsbil7dmFyIGE9NCpuLGk9byhlLHIsYSk7aWYoYT5pKXRocm93IG5ldyBFcnJvcihcIkVycm9yIHJlYWRpbmcgcmF3IHBpeGVsczogZ290IFwiK2krXCIgYnl0ZXMsIGV4cGVjdGVkIFwiK2EpfWZvcih2YXIgbD1uZXcgQXJyYXkoNCksZj1udWxsLGg9dm9pZCAwLGM9dm9pZCAwLGQ9dm9pZCAwLHY9bmV3IEFycmF5KDIpLF89dC5sZW5ndGg7aT4wOyl7aWYodShsKTxsLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciByZWFkaW5nIGJ5dGVzOiBleHBlY3RlZCBcIitsLmxlbmd0aCk7aWYoMiE9PWxbMF18fDIhPT1sWzFdfHwwIT09KDEyOCZsWzJdKSlyZXR1cm4gZVtyKytdPWxbMF0sZVtyKytdPWxbMV0sZVtyKytdPWxbMl0sZVtyKytdPWxbM10sdm9pZCBzKHQsZSxyLGEqaS0xKTtpZigoKDI1NSZsWzJdKTw8OHwyNTUmbFszXSkhPT1hKXRocm93IG5ldyBFcnJvcihcIldyb25nIHNjYW5saW5lIHdpZHRoIFwiKygoMjU1JmxbMl0pPDw4fDI1NSZsWzNdKStcIiwgZXhwZWN0ZWQgXCIrYSk7bnVsbD09PWYmJihmPW5ldyBBcnJheSg0KmEpKSxoPTA7Zm9yKHZhciBtPTA7ND5tO20rKylmb3IoYz0obSsxKSphO2M+aDspe2lmKHUodik8di5sZW5ndGgpdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgcmVhZGluZyAyLWJ5dGUgYnVmZmVyXCIpO2lmKCgyNTUmdlswXSk+MTI4KXtpZihkPSgyNTUmdlswXSktMTI4LDA9PT1kfHxkPmMtaCl0aHJvdyBuZXcgRXJyb3IoXCJCYWQgc2NhbmxpbmUgZGF0YVwiKTtmb3IoO2QtLSA+MDspZltoKytdPXZbMV19ZWxzZXtpZihkPTI1NSZ2WzBdLDA9PT1kfHxkPmMtaCl0aHJvdyBuZXcgRXJyb3IoXCJCYWQgc2NhbmxpbmUgZGF0YVwiKTtpZihmW2grK109dlsxXSwtLWQ+MCl7aWYobyhmLGgsZCk8ZCl0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciByZWFkaW5nIG5vbi1ydW4gZGF0YVwiKTtoKz1kfX19Zm9yKHZhciBwPTA7YT5wO3ArKyllW3IrMF09ZltwXSxlW3IrMV09ZltwK2FdLGVbcisyXT1mW3ArMiphXSxlW3IrM109ZltwKzMqYV0scis9NDtpLS19fWZ1bmN0aW9uIG4odCl7ZnVuY3Rpb24gZSgpe3ZhciBlPVwiXCI7ZG97dmFyIHI9dFtuXTtpZihyPT09Zil7KytuO2JyZWFrfWUrPVN0cmluZy5mcm9tQ2hhckNvZGUocil9d2hpbGUoKytuPGwpO3JldHVybiBlfXQgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciYmKHQ9bmV3IFVpbnQ4QXJyYXkodCkpO2Zvcih2YXIgbj0wLGw9dC5sZW5ndGgsZj0xMCxoPTAsYz0wLGQ9MSx2PTEsXz0hMSxtPTA7MjA+bTttKyspe3ZhciBwPWUoKSxNPXZvaWQgMDtpZihNPXAubWF0Y2goYSkpO2Vsc2UgaWYoTT1wLm1hdGNoKG8pKV89ITA7ZWxzZSBpZihNPXAubWF0Y2godSkpZD1OdW1iZXIoTVsxXSk7ZWxzZSBpZihNPXAubWF0Y2goaSkpO2Vsc2UgaWYoTT1wLm1hdGNoKHMpKXtjPU51bWJlcihNWzFdKSxoPU51bWJlcihNWzJdKTticmVha319aWYoIV8pdGhyb3cgbmV3IEVycm9yKFwiRmlsZSBpcyBub3QgcnVuIGxlbmd0aCBlbmNvZGVkIVwiKTt2YXIgeD1uZXcgVWludDhBcnJheShoKmMqNCksZz1oLEU9YztyKHQseCwwLG4sZyxFKTtmb3IodmFyIGI9bmV3IEZsb2F0MzJBcnJheShoKmMqNCkseT0wO3k8eC5sZW5ndGg7eSs9NCl7dmFyIFM9eFt5KzBdLzI1NSxUPXhbeSsxXS8yNTUsST14W3krMl0vMjU1LEE9eFt5KzNdLEY9TWF0aC5wb3coMixBLTEyOCk7Uyo9RixUKj1GLEkqPUY7dmFyIEQ9eTtiW0QrMF09UyxiW0QrMV09VCxiW0QrMl09SSxiW0QrM109MX1yZXR1cm57c2hhcGU6W2gsY10sZXhwb3N1cmU6ZCxnYW1tYTp2LGRhdGE6Yn19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9XCIjXFxcXD9SQURJQU5DRVwiLGk9XCIjLipcIix1PVwiRVhQT1NVUkU9XFxcXHMqKFswLTldKlsuXVswLTldKilcIixvPVwiRk9STUFUPTMyLWJpdF9ybGVfcmdiZVwiLHM9XCItWSAoWzAtOV0rKSBcXFxcK1ggKFswLTldKylcIjtlLmRlZmF1bHQ9bix0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoMSksaT1uKGEpLHU9cigyKSxvPW4odSkscz1yKDgpLGw9bihzKSxmPXIoMzcpLGg9bihmKSxjPXIoMjMpLGQ9bihjKSx2PWZ1bmN0aW9uKHQsZSl7dmFyIHI9ZXx8e307cmV0dXJuIHQudG91Y2hlcz8oci54PXQudG91Y2hlc1swXS5wYWdlWCxyLnk9dC50b3VjaGVzWzBdLnBhZ2VZKTooci54PXQuY2xpZW50WCxyLnk9dC5jbGllbnRZKSxyfSxfPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXt2YXIgcj10aGlzLG49YXJndW1lbnRzLmxlbmd0aDw9MXx8dm9pZCAwPT09YXJndW1lbnRzWzFdP3dpbmRvdzphcmd1bWVudHNbMV0sYT1hcmd1bWVudHMubGVuZ3RoPD0yfHx2b2lkIDA9PT1hcmd1bWVudHNbMl0/LjE6YXJndW1lbnRzWzJdOygwLGkuZGVmYXVsdCkodGhpcyx0KSx0aGlzLl90YXJnZXQ9ZSx0aGlzLl9saXN0ZW5lclRhcmdldD1uLHRoaXMubWF0cml4PWwuZGVmYXVsdC5tYXQ0LmNyZWF0ZSgpLHRoaXMubT1sLmRlZmF1bHQubWF0NC5jcmVhdGUoKSx0aGlzLl92WmF4aXM9bC5kZWZhdWx0LnZlYzMuY2xvbmUoWzAsMCwwXSksdGhpcy5fekF4aXM9bC5kZWZhdWx0LnZlYzMuY2xvbmUoWzAsMCwxXSksdGhpcy5wcmVNb3VzZT17eDowLHk6MH0sdGhpcy5tb3VzZT17eDowLHk6MH0sdGhpcy5faXNNb3VzZURvd249ITEsdGhpcy5fcm90YXRpb249bC5kZWZhdWx0LnF1YXQuY3JlYXRlKCksdGhpcy50ZW1wUm90YXRpb249bC5kZWZhdWx0LnF1YXQuY3JlYXRlKCksdGhpcy5fcm90YXRlWk1hcmdpbj0wLHRoaXMuX29mZnNldD0uMDA0LHRoaXMuX3NsZXJwPS0xLHRoaXMuX2lzTG9ja2VkPSExLHRoaXMuX2RpZmZYPW5ldyBoLmRlZmF1bHQoMCxhKSx0aGlzLl9kaWZmWT1uZXcgaC5kZWZhdWx0KDAsYSksdGhpcy5fbGlzdGVuZXJUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLGZ1bmN0aW9uKHQpe3JldHVybiByLl9vbkRvd24odCl9KSx0aGlzLl9saXN0ZW5lclRhcmdldC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLGZ1bmN0aW9uKHQpe3JldHVybiByLl9vbkRvd24odCl9KSx0aGlzLl9saXN0ZW5lclRhcmdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsZnVuY3Rpb24odCl7cmV0dXJuIHIuX29uTW92ZSh0KX0pLHRoaXMuX2xpc3RlbmVyVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIixmdW5jdGlvbih0KXtyZXR1cm4gci5fb25Nb3ZlKHQpfSksd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLGZ1bmN0aW9uKCl7cmV0dXJuIHIuX29uVXAoKX0pLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLGZ1bmN0aW9uKCl7cmV0dXJuIHIuX29uVXAoKX0pLGQuZGVmYXVsdC5hZGRFRihmdW5jdGlvbigpe3JldHVybiByLl9sb29wKCl9KX1yZXR1cm4oMCxvLmRlZmF1bHQpKHQsW3trZXk6XCJpbnZlcnNlQ29udHJvbFwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aDw9MHx8dm9pZCAwPT09YXJndW1lbnRzWzBdPyEwOmFyZ3VtZW50c1swXTt0aGlzLl9pc0ludmVydD10fX0se2tleTpcImxvY2tcIix2YWx1ZTpmdW5jdGlvbigpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg8PTB8fHZvaWQgMD09PWFyZ3VtZW50c1swXT8hMDphcmd1bWVudHNbMF07dGhpcy5faXNMb2NrZWQ9dH19LHtrZXk6XCJzZXRDYW1lcmFQb3NcIix2YWx1ZTpmdW5jdGlvbih0KXt2YXIgZT1hcmd1bWVudHMubGVuZ3RoPD0xfHx2b2lkIDA9PT1hcmd1bWVudHNbMV0/LjE6YXJndW1lbnRzWzFdO2lmKHRoaXMuZWFzaW5nPWUsISh0aGlzLl9zbGVycD4wKSl7dmFyIHI9bC5kZWZhdWx0LnF1YXQuY2xvbmUodGhpcy5fcm90YXRpb24pO3RoaXMuX3VwZGF0ZVJvdGF0aW9uKHIpLHRoaXMuX3JvdGF0aW9uPWwuZGVmYXVsdC5xdWF0LmNsb25lKHIpLHRoaXMuX2N1cnJEaWZmWD10aGlzLmRpZmZYPTAsdGhpcy5fY3VyckRpZmZZPXRoaXMuZGlmZlk9MCx0aGlzLl9pc01vdXNlRG93bj0hMSx0aGlzLl9pc1JvdGF0ZVo9MCx0aGlzLl90YXJnZXRRdWF0PWwuZGVmYXVsdC5xdWF0LmNsb25lKHQpLHRoaXMuX3NsZXJwPTF9fX0se2tleTpcInJlc2V0UXVhdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dGhpcy5fcm90YXRpb249bC5kZWZhdWx0LnF1YXQuY2xvbmUoWzAsMCwxLDBdKSx0aGlzLnRlbXBSb3RhdGlvbj1sLmRlZmF1bHQucXVhdC5jbG9uZShbMCwwLDAsMF0pLHRoaXMuX3RhcmdldFF1YXQ9dm9pZCAwLHRoaXMuX3NsZXJwPS0xfX0se2tleTpcIl9vbkRvd25cIix2YWx1ZTpmdW5jdGlvbih0KXtpZighdGhpcy5faXNMb2NrZWQpe3ZhciBlPXYodCkscj1sLmRlZmF1bHQucXVhdC5jbG9uZSh0aGlzLl9yb3RhdGlvbik7dGhpcy5fdXBkYXRlUm90YXRpb24ociksdGhpcy5fcm90YXRpb249cix0aGlzLl9pc01vdXNlRG93bj0hMCx0aGlzLl9pc1JvdGF0ZVo9MCx0aGlzLnByZU1vdXNlPXt4OmUueCx5OmUueX0sZS55PHRoaXMuX3JvdGF0ZVpNYXJnaW58fGUueT53aW5kb3cuaW5uZXJIZWlnaHQtdGhpcy5fcm90YXRlWk1hcmdpbj90aGlzLl9pc1JvdGF0ZVo9MTooZS54PHRoaXMuX3JvdGF0ZVpNYXJnaW58fGUueD53aW5kb3cuaW5uZXJXaWR0aC10aGlzLl9yb3RhdGVaTWFyZ2luKSYmKHRoaXMuX2lzUm90YXRlWj0yKSx0aGlzLl9kaWZmWC5zZXRUbygwKSx0aGlzLl9kaWZmWS5zZXRUbygwKX19fSx7a2V5OlwiX29uTW92ZVwiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuX2lzTG9ja2VkfHx2KHQsdGhpcy5tb3VzZSl9fSx7a2V5OlwiX29uVXBcIix2YWx1ZTpmdW5jdGlvbigpe3RoaXMuX2lzTG9ja2VkfHwodGhpcy5faXNNb3VzZURvd249ITEpfX0se2tleTpcIl91cGRhdGVSb3RhdGlvblwiLHZhbHVlOmZ1bmN0aW9uKHQpe3RoaXMuX2lzTW91c2VEb3duJiYhdGhpcy5faXNMb2NrZWQmJih0aGlzLl9kaWZmWC52YWx1ZT0tKHRoaXMubW91c2UueC10aGlzLnByZU1vdXNlLngpLHRoaXMuX2RpZmZZLnZhbHVlPXRoaXMubW91c2UueS10aGlzLnByZU1vdXNlLnksdGhpcy5faXNJbnZlcnQmJih0aGlzLl9kaWZmWC52YWx1ZT0tdGhpcy5fZGlmZlgudGFyZ2V0VmFsdWUsdGhpcy5fZGlmZlkudmFsdWU9LXRoaXMuX2RpZmZZLnRhcmdldFZhbHVlKSk7dmFyIGU9dm9pZCAwLHI9dm9pZCAwO2lmKHRoaXMuX2lzUm90YXRlWj4wKTE9PT10aGlzLl9pc1JvdGF0ZVo/KGU9LXRoaXMuX2RpZmZYLnZhbHVlKnRoaXMuX29mZnNldCxlKj10aGlzLnByZU1vdXNlLnk8dGhpcy5fcm90YXRlWk1hcmdpbj8tMToxLHI9bC5kZWZhdWx0LnF1YXQuY2xvbmUoWzAsMCxNYXRoLnNpbihlKSxNYXRoLmNvcyhlKV0pLGwuZGVmYXVsdC5xdWF0Lm11bHRpcGx5KHIsdCxyKSk6KGU9LXRoaXMuX2RpZmZZLnZhbHVlKnRoaXMuX29mZnNldCxlKj10aGlzLnByZU1vdXNlLng8dGhpcy5fcm90YXRlWk1hcmdpbj8xOi0xLHI9bC5kZWZhdWx0LnF1YXQuY2xvbmUoWzAsMCxNYXRoLnNpbihlKSxNYXRoLmNvcyhlKV0pLGwuZGVmYXVsdC5xdWF0Lm11bHRpcGx5KHIsdCxyKSk7ZWxzZXt2YXIgbj1sLmRlZmF1bHQudmVjMy5jbG9uZShbdGhpcy5fZGlmZlgudmFsdWUsdGhpcy5fZGlmZlkudmFsdWUsMF0pLGE9bC5kZWZhdWx0LnZlYzMuY3JlYXRlKCk7bC5kZWZhdWx0LnZlYzMuY3Jvc3MoYSxuLHRoaXMuX3pBeGlzKSxsLmRlZmF1bHQudmVjMy5ub3JtYWxpemUoYSxhKSxlPWwuZGVmYXVsdC52ZWMzLmxlbmd0aChuKSp0aGlzLl9vZmZzZXQscj1sLmRlZmF1bHQucXVhdC5jbG9uZShbTWF0aC5zaW4oZSkqYVswXSxNYXRoLnNpbihlKSphWzFdLE1hdGguc2luKGUpKmFbMl0sTWF0aC5jb3MoZSldKSxsLmRlZmF1bHQucXVhdC5tdWx0aXBseSh0LHIsdCl9fX0se2tleTpcIl9sb29wXCIsdmFsdWU6ZnVuY3Rpb24oKXtsLmRlZmF1bHQubWF0NC5pZGVudGl0eSh0aGlzLm0pLHZvaWQgMD09PXRoaXMuX3RhcmdldFF1YXQ/KGwuZGVmYXVsdC5xdWF0LnNldCh0aGlzLnRlbXBSb3RhdGlvbix0aGlzLl9yb3RhdGlvblswXSx0aGlzLl9yb3RhdGlvblsxXSx0aGlzLl9yb3RhdGlvblsyXSx0aGlzLl9yb3RhdGlvblszXSksdGhpcy5fdXBkYXRlUm90YXRpb24odGhpcy50ZW1wUm90YXRpb24pKToodGhpcy5fc2xlcnArPS4xKigwLXRoaXMuX3NsZXJwKSx0aGlzLl9zbGVycDw1ZS00PyhsLmRlZmF1bHQucXVhdC5jb3B5KHRoaXMuX3JvdGF0aW9uLHRoaXMuX3RhcmdldFF1YXQpLGwuZGVmYXVsdC5xdWF0LmNvcHkodGhpcy50ZW1wUm90YXRpb24sdGhpcy5fdGFyZ2V0UXVhdCksdGhpcy5fdGFyZ2V0UXVhdD12b2lkIDAsdGhpcy5fZGlmZlguc2V0VG8oMCksdGhpcy5fZGlmZlkuc2V0VG8oMCksdGhpcy5fc2xlcnA9LTEpOihsLmRlZmF1bHQucXVhdC5zZXQodGhpcy50ZW1wUm90YXRpb24sMCwwLDAsMCksbC5kZWZhdWx0LnF1YXQuc2xlcnAodGhpcy50ZW1wUm90YXRpb24sdGhpcy5fdGFyZ2V0UXVhdCx0aGlzLl9yb3RhdGlvbix0aGlzLl9zbGVycCkpKSxsLmRlZmF1bHQudmVjMy50cmFuc2Zvcm1RdWF0KHRoaXMuX3ZaYXhpcyx0aGlzLl92WmF4aXMsdGhpcy50ZW1wUm90YXRpb24pLGwuZGVmYXVsdC5tYXQ0LmZyb21RdWF0KHRoaXMubWF0cml4LHRoaXMudGVtcFJvdGF0aW9uKX19LHtrZXk6XCJlYXNpbmdcIixzZXQ6ZnVuY3Rpb24odCl7dGhpcy5fZGlmZlguZWFzaW5nPXQsdGhpcy5fZGlmZlkuZWFzaW5nPXR9LGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9kaWZmWC5lYXNpbmd9fV0pLHR9KCk7ZS5kZWZhdWx0PV8sdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1mdW5jdGlvbiBhKHQpe3N3aXRjaCh0KXtkZWZhdWx0OmNhc2VcImxpbmVhclwiOnJldHVybiBoLkxpbmVhci5Ob25lO2Nhc2VcImV4cEluXCI6cmV0dXJuIGguRXhwb25lbnRpYWwuSW47Y2FzZVwiZXhwT3V0XCI6cmV0dXJuIGguRXhwb25lbnRpYWwuT3V0O2Nhc2VcImV4cEluT3V0XCI6cmV0dXJuIGguRXhwb25lbnRpYWwuSW5PdXQ7Y2FzZVwiY3ViaWNJblwiOnJldHVybiBoLkN1YmljLkluO2Nhc2VcImN1YmljT3V0XCI6cmV0dXJuIGguQ3ViaWMuT3V0O2Nhc2VcImN1YmljSW5PdXRcIjpyZXR1cm4gaC5DdWJpYy5Jbk91dDtjYXNlXCJxdWFydGljSW5cIjpyZXR1cm4gaC5RdWFydGljLkluO2Nhc2VcInF1YXJ0aWNPdXRcIjpyZXR1cm4gaC5RdWFydGljLk91dDtjYXNlXCJxdWFydGljSW5PdXRcIjpyZXR1cm4gaC5RdWFydGljLkluT3V0O2Nhc2VcInF1aW50aWNJblwiOnJldHVybiBoLlF1aW50aWMuSW47Y2FzZVwicXVpbnRpY091dFwiOnJldHVybiBoLlF1aW50aWMuT3V0O2Nhc2VcInF1aW50aWNJbk91dFwiOnJldHVybiBoLlF1aW50aWMuSW5PdXQ7Y2FzZVwic2ludXNvaWRhbEluXCI6cmV0dXJuIGguU2ludXNvaWRhbC5JbjtjYXNlXCJzaW51c29pZGFsT3V0XCI6cmV0dXJuIGguU2ludXNvaWRhbC5PdXQ7Y2FzZVwic2ludXNvaWRhbEluT3V0XCI6cmV0dXJuIGguU2ludXNvaWRhbC5Jbk91dDtjYXNlXCJjaXJjdWxhckluXCI6cmV0dXJuIGguQ2lyY3VsYXIuSW47Y2FzZVwiY2lyY3VsYXJPdXRcIjpyZXR1cm4gaC5DaXJjdWxhci5PdXQ7Y2FzZVwiY2lyY3VsYXJJbk91dFwiOnJldHVybiBoLkNpcmN1bGFyLkluT3V0O2Nhc2VcImVsYXN0aWNJblwiOnJldHVybiBoLkVsYXN0aWMuSW47Y2FzZVwiZWxhc3RpY091dFwiOnJldHVybiBoLkVsYXN0aWMuT3V0O2Nhc2VcImVsYXN0aWNJbk91dFwiOnJldHVybiBoLkVsYXN0aWMuSW5PdXQ7Y2FzZVwiYmFja0luXCI6cmV0dXJuIGguQmFjay5JbjtjYXNlXCJiYWNrT3V0XCI6cmV0dXJuIGguQmFjay5PdXQ7Y2FzZVwiYmFja0luT3V0XCI6cmV0dXJuIGguQmFjay5Jbk91dDtjYXNlXCJib3VuY2VJblwiOnJldHVybiBoLkJvdW5jZS5pbjtjYXNlXCJib3VuY2VPdXRcIjpyZXR1cm4gaC5Cb3VuY2Uub3V0O2Nhc2VcImJvdW5jZUluT3V0XCI6cmV0dXJuIGguQm91bmNlLmluT3V0fX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgaT1yKDEpLHU9bihpKSxvPXIoMikscz1uKG8pLGw9cigyMyksZj1uKGwpLGg9e0xpbmVhcjp7Tm9uZTpmdW5jdGlvbih0KXtyZXR1cm4gdH19LFF1YWRyYXRpYzp7SW46ZnVuY3Rpb24odCl7cmV0dXJuIHQqdH0sT3V0OmZ1bmN0aW9uKHQpe3JldHVybiB0KigyLXQpfSxJbk91dDpmdW5jdGlvbih0KXtyZXR1cm4odCo9Mik8MT8uNSp0KnQ6LS41KigtLXQqKHQtMiktMSl9fSxDdWJpYzp7SW46ZnVuY3Rpb24odCl7cmV0dXJuIHQqdCp0fSxPdXQ6ZnVuY3Rpb24odCl7cmV0dXJuLS10KnQqdCsxfSxJbk91dDpmdW5jdGlvbih0KXtyZXR1cm4odCo9Mik8MT8uNSp0KnQqdDouNSooKHQtPTIpKnQqdCsyKX19LFF1YXJ0aWM6e0luOmZ1bmN0aW9uKHQpe3JldHVybiB0KnQqdCp0fSxPdXQ6ZnVuY3Rpb24odCl7cmV0dXJuIDEtIC0tdCp0KnQqdH0sSW5PdXQ6ZnVuY3Rpb24odCl7cmV0dXJuKHQqPTIpPDE/LjUqdCp0KnQqdDotLjUqKCh0LT0yKSp0KnQqdC0yKX19LFF1aW50aWM6e0luOmZ1bmN0aW9uKHQpe3JldHVybiB0KnQqdCp0KnR9LE91dDpmdW5jdGlvbih0KXtyZXR1cm4tLXQqdCp0KnQqdCsxfSxJbk91dDpmdW5jdGlvbih0KXtyZXR1cm4odCo9Mik8MT8uNSp0KnQqdCp0KnQ6LjUqKCh0LT0yKSp0KnQqdCp0KzIpfX0sU2ludXNvaWRhbDp7SW46ZnVuY3Rpb24odCl7cmV0dXJuIDEtTWF0aC5jb3ModCpNYXRoLlBJLzIpfSxPdXQ6ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguc2luKHQqTWF0aC5QSS8yKX0sSW5PdXQ6ZnVuY3Rpb24odCl7cmV0dXJuLjUqKDEtTWF0aC5jb3MoTWF0aC5QSSp0KSl9fSxFeHBvbmVudGlhbDp7SW46ZnVuY3Rpb24odCl7cmV0dXJuIDA9PT10PzA6TWF0aC5wb3coMTAyNCx0LTEpfSxPdXQ6ZnVuY3Rpb24odCl7cmV0dXJuIDE9PT10PzE6MS1NYXRoLnBvdygyLC0xMCp0KX0sSW5PdXQ6ZnVuY3Rpb24odCl7cmV0dXJuIDA9PT10PzA6MT09PXQ/MToodCo9Mik8MT8uNSpNYXRoLnBvdygxMDI0LHQtMSk6LjUqKC1NYXRoLnBvdygyLC0xMCoodC0xKSkrMil9fSxDaXJjdWxhcjp7SW46ZnVuY3Rpb24odCl7cmV0dXJuIDEtTWF0aC5zcXJ0KDEtdCp0KX0sT3V0OmZ1bmN0aW9uKHQpe3JldHVybiBNYXRoLnNxcnQoMS0gLS10KnQpfSxJbk91dDpmdW5jdGlvbih0KXtyZXR1cm4odCo9Mik8MT8tLjUqKE1hdGguc3FydCgxLXQqdCktMSk6LjUqKE1hdGguc3FydCgxLSh0LT0yKSp0KSsxKX19LEVsYXN0aWM6e0luOmZ1bmN0aW9uKHQpe3ZhciBlPXZvaWQgMCxyPS4xLG49LjQ7cmV0dXJuIDA9PT10PzA6MT09PXQ/MTooIXJ8fDE+cj8ocj0xLGU9bi80KTplPW4qTWF0aC5hc2luKDEvcikvKDIqTWF0aC5QSSksLShyKk1hdGgucG93KDIsMTAqKHQtPTEpKSpNYXRoLnNpbigodC1lKSooMipNYXRoLlBJKS9uKSkpfSxPdXQ6ZnVuY3Rpb24odCl7dmFyIGU9dm9pZCAwLHI9LjEsbj0uNDtyZXR1cm4gMD09PXQ/MDoxPT09dD8xOighcnx8MT5yPyhyPTEsZT1uLzQpOmU9bipNYXRoLmFzaW4oMS9yKS8oMipNYXRoLlBJKSxyKk1hdGgucG93KDIsLTEwKnQpKk1hdGguc2luKCh0LWUpKigyKk1hdGguUEkpL24pKzEpfSxJbk91dDpmdW5jdGlvbih0KXt2YXIgZT12b2lkIDAscj0uMSxuPS40O3JldHVybiAwPT09dD8wOjE9PT10PzE6KCFyfHwxPnI/KHI9MSxlPW4vNCk6ZT1uKk1hdGguYXNpbigxL3IpLygyKk1hdGguUEkpLCh0Kj0yKTwxPy0uNSoocipNYXRoLnBvdygyLDEwKih0LT0xKSkqTWF0aC5zaW4oKHQtZSkqKDIqTWF0aC5QSSkvbikpOnIqTWF0aC5wb3coMiwtMTAqKHQtPTEpKSpNYXRoLnNpbigodC1lKSooMipNYXRoLlBJKS9uKSouNSsxKX19LEJhY2s6e0luOmZ1bmN0aW9uKHQpe3ZhciBlPTEuNzAxNTg7cmV0dXJuIHQqdCooKGUrMSkqdC1lKX0sT3V0OmZ1bmN0aW9uKHQpe3ZhciBlPTEuNzAxNTg7cmV0dXJuLS10KnQqKChlKzEpKnQrZSkrMX0sSW5PdXQ6ZnVuY3Rpb24odCl7dmFyIGU9Mi41OTQ5MDk1O3JldHVybih0Kj0yKTwxPy41Kih0KnQqKChlKzEpKnQtZSkpOi41KigodC09MikqdCooKGUrMSkqdCtlKSsyKTtcbn19LEJvdW5jZTp7XCJpblwiOmZ1bmN0aW9uKHQpe3JldHVybiAxLWguQm91bmNlLm91dCgxLXQpfSxvdXQ6ZnVuY3Rpb24odCl7cmV0dXJuIDEvMi43NT50PzcuNTYyNSp0KnQ6Mi8yLjc1PnQ/Ny41NjI1Kih0LT0xLjUvMi43NSkqdCsuNzU6Mi41LzIuNzU+dD83LjU2MjUqKHQtPTIuMjUvMi43NSkqdCsuOTM3NTo3LjU2MjUqKHQtPTIuNjI1LzIuNzUpKnQrLjk4NDM3NX0saW5PdXQ6ZnVuY3Rpb24odCl7cmV0dXJuLjU+dD8uNSpoLkJvdW5jZS5pbigyKnQpOi41KmguQm91bmNlLm91dCgyKnQtMSkrLjV9fX0sYz1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7dmFyIHI9dGhpcyxuPWFyZ3VtZW50cy5sZW5ndGg8PTF8fHZvaWQgMD09PWFyZ3VtZW50c1sxXT9cImV4cE91dFwiOmFyZ3VtZW50c1sxXSxhPWFyZ3VtZW50cy5sZW5ndGg8PTJ8fHZvaWQgMD09PWFyZ3VtZW50c1syXT8uMDE6YXJndW1lbnRzWzJdOygwLHUuZGVmYXVsdCkodGhpcyx0KSx0aGlzLl92YWx1ZT1lLHRoaXMuX3N0YXJ0VmFsdWU9ZSx0aGlzLl90YXJnZXRWYWx1ZT1lLHRoaXMuX2NvdW50ZXI9MSx0aGlzLnNwZWVkPWEsdGhpcy5lYXNpbmc9bix0aGlzLl9uZWVkVXBkYXRlPSEwLHRoaXMuX2VmSW5kZXg9Zi5kZWZhdWx0LmFkZEVGKGZ1bmN0aW9uKCl7cmV0dXJuIHIuX3VwZGF0ZSgpfSl9cmV0dXJuKDAscy5kZWZhdWx0KSh0LFt7a2V5OlwiX3VwZGF0ZVwiLHZhbHVlOmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5fY291bnRlcit0aGlzLnNwZWVkO3JldHVybiB0PjEmJih0PTEpLHRoaXMuX2NvdW50ZXI9PT10P3ZvaWQodGhpcy5fbmVlZFVwZGF0ZT0hMSk6KHRoaXMuX2NvdW50ZXI9dCx2b2lkKHRoaXMuX25lZWRVcGRhdGU9ITApKX19LHtrZXk6XCJsaW1pdFwiLHZhbHVlOmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQ+ZT92b2lkIHRoaXMubGltaXQoZSx0KToodGhpcy5fbWluPXQsdGhpcy5fbWF4PWUsdm9pZCB0aGlzLl9jaGVja0xpbWl0KCkpfX0se2tleTpcInNldFRvXCIsdmFsdWU6ZnVuY3Rpb24odCl7dGhpcy5fdmFsdWU9dCx0aGlzLl90YXJnZXRWYWx1ZT10LHRoaXMuX2NvdW50ZXI9MX19LHtrZXk6XCJfY2hlY2tMaW1pdFwiLHZhbHVlOmZ1bmN0aW9uKCl7dm9pZCAwIT09dGhpcy5fbWluJiZ0aGlzLl90YXJnZXRWYWx1ZTx0aGlzLl9taW4mJih0aGlzLl90YXJnZXRWYWx1ZT10aGlzLl9taW4pLHZvaWQgMCE9PXRoaXMuX21heCYmdGhpcy5fdGFyZ2V0VmFsdWU+dGhpcy5fbWF4JiYodGhpcy5fdGFyZ2V0VmFsdWU9dGhpcy5fbWF4KX19LHtrZXk6XCJkZXN0cm95XCIsdmFsdWU6ZnVuY3Rpb24oKXtmLmRlZmF1bHQucmVtb3ZlRUYodGhpcy5fZWZJbmRleCl9fSx7a2V5OlwidmFsdWVcIixzZXQ6ZnVuY3Rpb24odCl7dGhpcy5fc3RhcnRWYWx1ZT10aGlzLl92YWx1ZSx0aGlzLl90YXJnZXRWYWx1ZT10LHRoaXMuX2NoZWNrTGltaXQoKSx0aGlzLl9jb3VudGVyPTB9LGdldDpmdW5jdGlvbigpe2lmKHRoaXMuX25lZWRVcGRhdGUpe3ZhciB0PWEodGhpcy5lYXNpbmcpLGU9dCh0aGlzLl9jb3VudGVyKTt0aGlzLl92YWx1ZT10aGlzLl9zdGFydFZhbHVlK2UqKHRoaXMuX3RhcmdldFZhbHVlLXRoaXMuX3N0YXJ0VmFsdWUpLHRoaXMuX25lZWRVcGRhdGU9ITF9cmV0dXJuIHRoaXMuX3ZhbHVlfX0se2tleTpcInRhcmdldFZhbHVlXCIsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3RhcmdldFZhbHVlfX1dKSx0fSgpO2UuZGVmYXVsdD1jLHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGE9cigzKSxpPW4oYSksdT1mdW5jdGlvbigpe2kuZGVmYXVsdC5WRVJURVhfU0hBREVSPWkuZGVmYXVsdC5nbC5WRVJURVhfU0hBREVSLGkuZGVmYXVsdC5GUkFHTUVOVF9TSEFERVI9aS5kZWZhdWx0LmdsLkZSQUdNRU5UX1NIQURFUixpLmRlZmF1bHQuQ09NUElMRV9TVEFUVVM9aS5kZWZhdWx0LmdsLkNPTVBJTEVfU1RBVFVTLGkuZGVmYXVsdC5ERVBUSF9URVNUPWkuZGVmYXVsdC5nbC5ERVBUSF9URVNULGkuZGVmYXVsdC5DVUxMX0ZBQ0U9aS5kZWZhdWx0LmdsLkNVTExfRkFDRSxpLmRlZmF1bHQuQkxFTkQ9aS5kZWZhdWx0LmdsLkJMRU5ELGkuZGVmYXVsdC5QT0lOVFM9aS5kZWZhdWx0LmdsLlBPSU5UUyxpLmRlZmF1bHQuTElORVM9aS5kZWZhdWx0LmdsLkxJTkVTLGkuZGVmYXVsdC5UUklBTkdMRVM9aS5kZWZhdWx0LmdsLlRSSUFOR0xFUyxpLmRlZmF1bHQuTElORUFSPWkuZGVmYXVsdC5nbC5MSU5FQVIsaS5kZWZhdWx0Lk5FQVJFU1Q9aS5kZWZhdWx0LmdsLk5FQVJFU1QsaS5kZWZhdWx0LkxJTkVBUl9NSVBNQVBfTkVBUkVTVD1pLmRlZmF1bHQuZ2wuTElORUFSX01JUE1BUF9ORUFSRVNULGkuZGVmYXVsdC5ORUFSRVNUX01JUE1BUF9MSU5FQVI9aS5kZWZhdWx0LmdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUixpLmRlZmF1bHQuTElORUFSX01JUE1BUF9MSU5FQVI9aS5kZWZhdWx0LmdsLkxJTkVBUl9NSVBNQVBfTElORUFSLGkuZGVmYXVsdC5ORUFSRVNUX01JUE1BUF9ORUFSRVNUPWkuZGVmYXVsdC5nbC5ORUFSRVNUX01JUE1BUF9ORUFSRVNULGkuZGVmYXVsdC5NSVJST1JFRF9SRVBFQVQ9aS5kZWZhdWx0LmdsLk1JUlJPUkVEX1JFUEVBVCxpLmRlZmF1bHQuQ0xBTVBfVE9fRURHRT1pLmRlZmF1bHQuZ2wuQ0xBTVBfVE9fRURHRSxpLmRlZmF1bHQuU0NJU1NPUl9URVNUPWkuZGVmYXVsdC5nbC5TQ0lTU09SX1RFU1QsaS5kZWZhdWx0LlVOU0lHTkVEX0JZVEU9aS5kZWZhdWx0LmdsLlVOU0lHTkVEX0JZVEV9O2UuZGVmYXVsdD11LHQuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcih0LGUpe3ZhciByPXQuZ2V0RXh0ZW5zaW9uKGUpO2lmKCFyKXJldHVybiExO3ZhciBuPWUuc3BsaXQoXCJfXCIpWzBdLGE9bmV3IFJlZ0V4cChuK1wiJFwiKTtmb3IodmFyIGkgaW4gcil7dmFyIHU9cltpXTtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiB1KXt2YXIgbz1pLnJlcGxhY2UoYSxcIlwiKTtpLnN1YnN0cmluZyYmKHRbb109cltpXS5iaW5kKHIpKX19cmV0dXJuITB9T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZS5kZWZhdWx0PXIsdC5leHBvcnRzPWUuZGVmYXVsdH0sZnVuY3Rpb24odCxlLHIpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4odCl7cmV0dXJuIHQmJnQuX19lc01vZHVsZT90OntcImRlZmF1bHRcIjp0fX1mdW5jdGlvbiBhKCl7aWYodS5kZWZhdWx0LndlYmdsMilyZXR1cm4gdS5kZWZhdWx0LmdsLkZMT0FUO3ZhciB0PXUuZGVmYXVsdC5nZXRFeHRlbnNpb24oXCJPRVNfdGV4dHVyZV9mbG9hdFwiKTtyZXR1cm4gdD91LmRlZmF1bHQuZ2wuRkxPQVQ6KGNvbnNvbGUud2FybihcIlVTSU5HIEZMT0FUIEJVVCBPRVNfdGV4dHVyZV9mbG9hdCBOT1QgU1VQUE9SVEVEXCIpLHUuZGVmYXVsdC5nbC5VTlNJR05FRF9CWVRFKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KSxlLmRlZmF1bHQ9ZnVuY3Rpb24oKXtyZXR1cm4gb3x8KHM9YSgpKSxzfTt2YXIgaT1yKDMpLHU9bihpKSxvPSExLHM9dm9pZCAwO3QuZXhwb3J0cz1lLmRlZmF1bHR9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe3JldHVybiB0JiZ0Ll9fZXNNb2R1bGU/dDp7XCJkZWZhdWx0XCI6dH19ZnVuY3Rpb24gYSgpe2lmKHUuZGVmYXVsdC53ZWJnbDIpcmV0dXJuIHUuZGVmYXVsdC5nbC5IQUxGX0ZMT0FUO3ZhciB0PXUuZGVmYXVsdC5nZXRFeHRlbnNpb24oXCJPRVNfdGV4dHVyZV9oYWxmX2Zsb2F0XCIpO3JldHVybiB0P3QuSEFMRl9GTE9BVF9PRVM6KGNvbnNvbGUud2FybihcIlVTSU5HIEhBTEYgRkxPQVQgQlVUIE9FU190ZXh0dXJlX2hhbGZfZmxvYXQgTk9UIFNVUFBPUlRFRFwiKSx1LmRlZmF1bHQuZ2wuVU5TSUdORURfQllURSl9T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSksZS5kZWZhdWx0PWZ1bmN0aW9uKCl7cmV0dXJuIG98fChzPWEoKSksc307dmFyIGk9cigzKSx1PW4oaSksbz0hMSxzPXZvaWQgMDt0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7dC5leHBvcnRzPXtcImRlZmF1bHRcIjpyKDEyNSksX19lc01vZHVsZTohMH19LGZ1bmN0aW9uKHQsZSxyKXt0LmV4cG9ydHM9e1wiZGVmYXVsdFwiOnIoMTI2KSxfX2VzTW9kdWxlOiEwfX0sZnVuY3Rpb24odCxlLHIpe3QuZXhwb3J0cz17XCJkZWZhdWx0XCI6cigxMjcpLF9fZXNNb2R1bGU6ITB9fSxmdW5jdGlvbih0LGUscil7dC5leHBvcnRzPXtcImRlZmF1bHRcIjpyKDEyOSksX19lc01vZHVsZTohMH19LGZ1bmN0aW9uKHQsZSxyKXt0LmV4cG9ydHM9e1wiZGVmYXVsdFwiOnIoMTMwKSxfX2VzTW9kdWxlOiEwfX0sZnVuY3Rpb24odCxlLHIpe3QuZXhwb3J0cz17XCJkZWZhdWx0XCI6cigxMzEpLF9fZXNNb2R1bGU6ITB9fSxmdW5jdGlvbih0LGUscil7KGZ1bmN0aW9uKG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGEodCxlKXt2YXIgcj1uZXcgWE1MSHR0cFJlcXVlc3Q7ci5vbmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLnJlc3BvbnNlOzIwMD09dGhpcy5zdGF0dXMmJmUmJmUodGhpcy5yZXNwb25zZSl9LHIub3BlbihcImdldFwiLHQsITApLHIuc2VuZCgpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBpPXIoOCksdT12b2lkIDA9PT1uLmRvY3VtZW50LG89MipNYXRoLlBJLzM2MCxzPW51bGwsbD1udWxsLGY9bnVsbCxoPW51bGwsYz1udWxsLGQ9e2xpYnNQYXRoOlwiLi9cIix3b3JrZXJQYXRoOlwiLi9cIixub19mbGlwOiEwLHVzZV90cmFuc2ZlcmFibGVzOiEwLG9uZXJyb3I6bnVsbCx2ZXJib3NlOiExLGNvbmZpZzp7Zm9yY2VQYXJzZXI6ITF9LGluaXQ6ZnVuY3Rpb24odCl7dD10fHx7fTtmb3IodmFyIGUgaW4gdCl0aGlzW2VdPXRbZV07aWYodGhpcy5jb25maWc9dCx1KXRyeXtpbXBvcnRTY3JpcHRzKHRoaXMubGlic1BhdGgrXCJnbC1tYXRyaXgtbWluLmpzXCIsdGhpcy5saWJzUGF0aCtcInRpbnl4bWwuanNcIil9Y2F0Y2gocil7ZC50aHJvd0V4Y2VwdGlvbihkLkxJQk1JU1NJTkdfRVJST1IpfXM9aS5tYXQ0LmNyZWF0ZSgpLGw9dmVjMy5jcmVhdGUoKSxmPXZlYzMuY3JlYXRlKCksaD12ZWMzLmNyZWF0ZSgpLGM9aS5xdWF0LmNyZWF0ZSgpLHUmJmNvbnNvbGUubG9nKFwiQ29sbGFkYSB3b3JrZXIgcmVhZHlcIil9LGxvYWQ6ZnVuY3Rpb24odCxlKXthKHQsZnVuY3Rpb24odCl7ZSh0P2QucGFyc2UodCk6bnVsbCl9KX0sX3htbHJvb3Q6bnVsbCxfbm9kZXNfYnlfaWQ6bnVsbCxfdHJhbnNmZXJhYmxlczpudWxsLF9jb250cm9sbGVyc19mb3VuZDpudWxsLF9nZW9tZXRyaWVzX2ZvdW5kOm51bGwsc2FmZVN0cmluZzpmdW5jdGlvbih0KXtyZXR1cm4gdD90aGlzLmNvbnZlcnRJRD90aGlzLmNvbnZlcnRJRCh0KTp0LnJlcGxhY2UoLyAvZyxcIl9cIik6XCJcIn0sTElCTUlTU0lOR19FUlJPUjpcIkxpYnJhcmllcyBsb2FkaW5nIGVycm9yLCB3aGVuIHVzaW5nIHdvcmtlcnMgcmVtZW1iZXIgdG8gcGFzcyB0aGUgVVJMIHRvIHRoZSB0aW55eG1sLmpzIGluIHRoZSBvcHRpb25zLmxpYnNQYXRoXCIsTk9YTUxQQVJTRVJfRVJST1I6XCJUaW55WE1MIG5vdCBmb3VuZCwgd2hlbiB1c2luZyB3b3JrZXJzIHJlbWVtYmVyIHRvIHBhc3MgdGhlIFVSTCB0byB0aGUgdGlueXhtbC5qcyBpbiB0aGUgb3B0aW9ucy5saWJzUGF0aCAoV29ya2VycyBkbyBub3QgYWxsb3cgdG8gYWNjZXNzIHRoZSBuYXRpdmUgWE1MIERPTVBhcnNlcilcIix0aHJvd0V4Y2VwdGlvbjpmdW5jdGlvbih0KXt0aHJvdyB1P3NlbGYucG9zdE1lc3NhZ2Uoe2FjdGlvbjpcImV4Y2VwdGlvblwiLG1zZzp0fSk6ZC5vbmVycm9yJiZkLm9uZXJyb3IodCksdH0sZ2V0RmlsZW5hbWU6ZnVuY3Rpb24odCl7dmFyIGU9dC5sYXN0SW5kZXhPZihcIlxcXFxcIik7cmV0dXJuLTEhPWUmJih0PXQuc3Vic3RyKGUrMSkpLGU9dC5sYXN0SW5kZXhPZihcIi9cIiksLTEhPWUmJih0PXQuc3Vic3RyKGUrMSkpLHR9LGxhc3RfbmFtZTowLGdlbmVyYXRlTmFtZTpmdW5jdGlvbih0KXt0PXR8fFwibmFtZV9cIjt2YXIgZT10K3RoaXMubGFzdF9uYW1lO3JldHVybiB0aGlzLmxhc3RfbmFtZSsrLGV9LHBhcnNlOmZ1bmN0aW9uKHQsZSxyKXtlPWV8fHt9LHI9cnx8XCJfZGFlX1wiK0RhdGUubm93KCkrXCIuZGFlXCI7dmFyIGE9ITEsaT1udWxsLHU9bnVsbDtpZih0aGlzLl90cmFuc2ZlcmFibGVzPVtdLHRoaXMudmVyYm9zZSYmY29uc29sZS5sb2coXCIgLSBYTUwgcGFyc2luZy4uLlwiKSxuLkRPTVBhcnNlciYmIXRoaXMuY29uZmlnLmZvcmNlUGFyc2VyKWk9bmV3IERPTVBhcnNlcix1PWkucGFyc2VGcm9tU3RyaW5nKHQsXCJ0ZXh0L3htbFwiKSx0aGlzLnZlcmJvc2UmJmNvbnNvbGUubG9nKFwiIC0gWE1MIHBhcnNlZFwiKTtlbHNle2lmKCFuLkRPTUltcGxlbWVudGF0aW9uKXJldHVybiBkLnRocm93RXhjZXB0aW9uKGQuTk9YTUxQQVJTRVJfRVJST1IpO3RyeXtpPW5ldyBET01JbXBsZW1lbnRhdGlvbn1jYXRjaChvKXtyZXR1cm4gZC50aHJvd0V4Y2VwdGlvbihkLk5PWE1MUEFSU0VSX0VSUk9SKX11PWkubG9hZFhNTCh0KSx0aGlzLnZlcmJvc2UmJmNvbnNvbGUubG9nKFwiIC0gWE1MIHBhcnNlZFwiKTtmb3IodmFyIHM9dS5fbm9kZXNfYnlfaWQ9e30sbD0wLGY9dS5hbGwubGVuZ3RoO2Y+bDsrK2wpe3ZhciBoPXUuYWxsW2xdO3NbaC5pZF09aCxoLmdldEF0dHJpYnV0ZShcInNpZFwiKSYmKHNbaC5nZXRBdHRyaWJ1dGUoXCJzaWRcIildPWgpfXRoaXMuZXh0cmFfZnVuY3Rpb25zfHwodGhpcy5leHRyYV9mdW5jdGlvbnM9ITAsRE9NRG9jdW1lbnQucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3I9RE9NRWxlbWVudC5wcm90b3R5cGUucXVlcnlTZWxlY3Rvcj1mdW5jdGlvbih0KXtmb3IodmFyIGU9dC5zcGxpdChcIiBcIikscj10aGlzO2UubGVuZ3RoOyl7dmFyIG49ZS5zaGlmdCgpLGE9bi5zcGxpdChcIiNcIiksaT1hWzBdLHU9YVsxXSxvPWk/ci5nZXRFbGVtZW50c0J5VGFnTmFtZShpKTpyLmNoaWxkTm9kZXM7aWYodSl7Zm9yKHZhciBzPTA7czxvLmxlbmd0aDtzKyspaWYoby5pdGVtKHMpLmdldEF0dHJpYnV0ZShcImlkXCIpPT11KXtpZigwPT1lLmxlbmd0aClyZXR1cm4gby5pdGVtKHMpO3I9by5pdGVtKHMpO2JyZWFrfX1lbHNle2lmKDA9PWUubGVuZ3RoKXJldHVybiBvLml0ZW0oMCk7cj1vLml0ZW0oMCl9fXJldHVybiBudWxsfSxET01Eb2N1bWVudC5wcm90b3R5cGUucXVlcnlTZWxlY3RvckFsbD1ET01FbGVtZW50LnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsPWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIGUodCxyKXtpZihyKXt2YXIgYT1yLnNoaWZ0KCksaT10LmdldEVsZW1lbnRzQnlUYWdOYW1lKGEpO2lmKDAhPXIubGVuZ3RoKWZvcih2YXIgdT0wO3U8aS5sZW5ndGg7dSsrKWUoaS5pdGVtKHUpLHIuY29uY2F0KCkpO2Vsc2UgZm9yKHZhciB1PTA7dTxpLmxlbmd0aDt1Kyspbi5wdXNoKGkuaXRlbSh1KSl9fXZhciByPXQuc3BsaXQoXCIgXCIpO2lmKDE9PXIubGVuZ3RoKXJldHVybiB0aGlzLmdldEVsZW1lbnRzQnlUYWdOYW1lKHQpO3ZhciBuPVtdO2UodGhpcyxyKTt2YXIgYT1uZXcgRE9NTm9kZUxpc3QodGhpcy5kb2N1bWVudEVsZW1lbnQpO3JldHVybiBhLl9ub2Rlcz1uLGEubGVuZ3RoPW4ubGVuZ3RoLGF9LE9iamVjdC5kZWZpbmVQcm9wZXJ0eShET01FbGVtZW50LnByb3RvdHlwZSxcInRleHRDb250ZW50XCIse2dldDpmdW5jdGlvbigpe3ZhciB0PXRoaXMuZ2V0Q2hpbGROb2RlcygpO3JldHVybiB0Lml0ZW0oMCkudG9TdHJpbmcoKX0sc2V0OmZ1bmN0aW9uKCl7fX0pKX10aGlzLl94bWxyb290PXU7dmFyIGM9dS5xdWVyeVNlbGVjdG9yKFwiQ09MTEFEQVwiKTtjJiYodGhpcy5fY3VycmVudF9EQUVfdmVyc2lvbj1jLmdldEF0dHJpYnV0ZShcInZlcnNpb25cIiksY29uc29sZS5sb2coXCJEQUUgVmVyc2lvbjpcIit0aGlzLl9jdXJyZW50X0RBRV92ZXJzaW9uKSk7dmFyIHY9dS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInZpc3VhbF9zY2VuZVwiKS5pdGVtKDApO2lmKCF2KXRocm93XCJ2aXN1YWxfc2NlbmUgWE1MIG5vZGUgbm90IGZvdW5kIGluIERBRVwiO3RoaXMuX25vZGVzX2J5X2lkPXt9LHRoaXMuX2NvbnRyb2xsZXJzX2ZvdW5kPXt9LHRoaXMuX2dlb21ldHJpZXNfZm91bmQ9e307dmFyIF89e29iamVjdF90eXBlOlwiU2NlbmVUcmVlXCIsbGlnaHQ6bnVsbCxtYXRlcmlhbHM6e30sbWVzaGVzOnt9LHJlc291cmNlczp7fSxyb290OntjaGlsZHJlbjpbXX0sZXh0ZXJuYWxfZmlsZXM6e319LG09dS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImFzc2V0XCIpWzBdO20mJihfLm1ldGFkYXRhPXRoaXMucmVhZEFzc2V0KG0pKTtmb3IodmFyIHA9di5jaGlsZE5vZGVzLGw9MDtsPHAubGVuZ3RoO2wrKylpZihcIm5vZGVcIj09cC5pdGVtKGwpLmxvY2FsTmFtZSl7dmFyIGg9dGhpcy5yZWFkTm9kZVRyZWUocC5pdGVtKGwpLF8sMCxhKTtoJiZfLnJvb3QuY2hpbGRyZW4ucHVzaChoKX1mb3IodmFyIGw9MDtsPHAubGVuZ3RoO2wrKylcIm5vZGVcIj09cC5pdGVtKGwpLmxvY2FsTmFtZSYmdGhpcy5yZWFkTm9kZUluZm8ocC5pdGVtKGwpLF8sMCxhKTt0aGlzLnJlYWRMaWJyYXJ5Q29udHJvbGxlcnMoXyk7dmFyIE09dGhpcy5yZWFkQW5pbWF0aW9ucyh1LF8pO2lmKE0pe3ZhciB4PVwiI2FuaW1hdGlvbnNfXCIrci5zdWJzdHIoMCxyLmluZGV4T2YoXCIuXCIpKTtfLnJlc291cmNlc1t4XT1NLF8ucm9vdC5hbmltYXRpb25zPXh9cmV0dXJuIF8uaW1hZ2VzPXRoaXMucmVhZEltYWdlcyh1KSx0aGlzLl9ub2Rlc19ieV9pZD17fSx0aGlzLl9jb250cm9sbGVyc19mb3VuZD17fSx0aGlzLl9nZW9tZXRyaWVzX2ZvdW5kPXt9LHRoaXMuX3htbHJvb3Q9bnVsbCxffSxyZWFkQXNzZXQ6ZnVuY3Rpb24odCl7Zm9yKHZhciBlPXt9LHI9MDtyPHQuY2hpbGROb2Rlcy5sZW5ndGg7cisrKXt2YXIgbj10LmNoaWxkTm9kZXMuaXRlbShyKTtpZigxPT1uLm5vZGVUeXBlKXN3aXRjaChuLmxvY2FsTmFtZSl7Y2FzZVwiY29udHJpYnV0b3JcIjp2YXIgYT1uLnF1ZXJ5U2VsZWN0b3IoXCJhdXRob3JpbmdfdG9vbFwiKTthJiYoZS5hdXRob3JpbmdfdG9vbD1hLnRleHRDb250ZXh0KTticmVhaztjYXNlXCJ1bml0XCI6ZS51bml0PW4uZ2V0QXR0cmlidXRlKFwibmFtZVwiKTticmVhaztkZWZhdWx0OmVbbi5sb2NhbE5hbWVdPW4udGV4dENvbnRlbnR9fXJldHVybiBlfSxyZWFkTm9kZVRyZWU6ZnVuY3Rpb24odCxlLHIsbil7dmFyIGE9dGhpcy5zYWZlU3RyaW5nKHQuZ2V0QXR0cmlidXRlKFwiaWRcIikpLGk9dGhpcy5zYWZlU3RyaW5nKHQuZ2V0QXR0cmlidXRlKFwic2lkXCIpKTtpZighYSYmIWkpcmV0dXJuIG51bGw7dmFyIHU9e2lkOml8fGEsY2hpbGRyZW46W10sX2RlcHRoOnJ9LG89dC5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpO28mJih1LnR5cGU9byk7dmFyIHM9dC5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpO3MmJih1Lm5hbWU9cyksdGhpcy5fbm9kZXNfYnlfaWRbdS5pZF09dSxhJiYodGhpcy5fbm9kZXNfYnlfaWRbYV09dSksaSYmKHRoaXMuX25vZGVzX2J5X2lkW2ldPXUpLHUubW9kZWw9dGhpcy5yZWFkVHJhbnNmb3JtKHQscixuKTtmb3IodmFyIGw9MDtsPHQuY2hpbGROb2Rlcy5sZW5ndGg7bCsrKXt2YXIgZj10LmNoaWxkTm9kZXMuaXRlbShsKTtpZigxPT1mLm5vZGVUeXBlKWlmKFwibm9kZVwiIT1mLmxvY2FsTmFtZSk7ZWxzZXt2YXIgaD10aGlzLnJlYWROb2RlVHJlZShmLGUscisxLG4pO2gmJnUuY2hpbGRyZW4ucHVzaChoKX19cmV0dXJuIHV9LHJlYWROb2RlSW5mbzpmdW5jdGlvbih0LGUscixuLGEpe3ZhciBpLHU9dGhpcy5zYWZlU3RyaW5nKHQuZ2V0QXR0cmlidXRlKFwiaWRcIikpLG89dGhpcy5zYWZlU3RyaW5nKHQuZ2V0QXR0cmlidXRlKFwic2lkXCIpKTtpZih1fHxvKWk9dGhpcy5fbm9kZXNfYnlfaWRbdXx8b107ZWxzZXtpZighYSlyZXR1cm4gbnVsbDtpPXRoaXMuX25vZGVzX2J5X2lkW2EuaWR8fGEuc2lkXX1pZighaSlyZXR1cm4gY29uc29sZS53YXJuKFwiQ29sbGFkYTogTm9kZSBub3QgZm91bmQgYnkgaWQ6IFwiKyh1fHxvKSksbnVsbDtmb3IodmFyIHM9MDtzPHQuY2hpbGROb2Rlcy5sZW5ndGg7cysrKXt2YXIgbD10LmNoaWxkTm9kZXMuaXRlbShzKTtpZigxPT1sLm5vZGVUeXBlKWlmKFwibm9kZVwiIT1sLmxvY2FsTmFtZSl7aWYoXCJpbnN0YW5jZV9nZW9tZXRyeVwiPT1sLmxvY2FsTmFtZSl7dmFyIGY9bC5nZXRBdHRyaWJ1dGUoXCJ1cmxcIiksaD1mLnRvU3RyaW5nKCkuc3Vic3RyKDEpO2lmKGkubWVzaD1oLCFlLm1lc2hlc1tmXSl7dmFyIGM9dGhpcy5yZWFkR2VvbWV0cnkoZixuKTtjJiYoYy5uYW1lPWgsZS5tZXNoZXNbaF09Yyl9dmFyIGQ9bC5xdWVyeVNlbGVjdG9yQWxsKFwiaW5zdGFuY2VfbWF0ZXJpYWxcIik7aWYoZClmb3IodmFyIHY9MDt2PGQubGVuZ3RoOysrdil7dmFyIF89ZC5pdGVtKHYpO2lmKF8pe3ZhciBtPV8uZ2V0QXR0cmlidXRlKFwidGFyZ2V0XCIpLnRvU3RyaW5nKCkuc3Vic3RyKDEpO2lmKCFlLm1hdGVyaWFsc1ttXSl7dmFyIHA9dGhpcy5yZWFkTWF0ZXJpYWwobSk7cCYmKHAuaWQ9bSxlLm1hdGVyaWFsc1twLmlkXT1wKX0wPT12P2kubWF0ZXJpYWw9bTooaS5tYXRlcmlhbHN8fChpLm1hdGVyaWFscz1bXSksaS5tYXRlcmlhbHMucHVzaChtKSl9ZWxzZSBjb25zb2xlLndhcm4oXCJpbnN0YW5jZV9tYXRlcmlhbCBub3QgZm91bmQ6IFwiK3MpfX1pZihcImluc3RhbmNlX2NvbnRyb2xsZXJcIj09bC5sb2NhbE5hbWUpe3ZhciBmPWwuZ2V0QXR0cmlidXRlKFwidXJsXCIpLE09dGhpcy5feG1scm9vdC5xdWVyeVNlbGVjdG9yKFwiY29udHJvbGxlclwiK2YpO2lmKE0pe3ZhciBjPXRoaXMucmVhZENvbnRyb2xsZXIoTSxuLGUpLHg9bC5xdWVyeVNlbGVjdG9yKFwiYmluZF9tYXRlcmlhbFwiKTtpZih4KWZvcih2YXIgZz14LnF1ZXJ5U2VsZWN0b3JBbGwoXCJ0ZWNobmlxdWVfY29tbW9uXCIpLEU9MDtFPGcubGVuZ3RoO0UrKylmb3IodmFyIGI9Zy5pdGVtKEUpLHk9Yi5xdWVyeVNlbGVjdG9yQWxsKFwiaW5zdGFuY2VfbWF0ZXJpYWxcIiksdj0wO3Y8eS5sZW5ndGg7disrKXt2YXIgUz15Lml0ZW0odik7aWYoUyl7dmFyIG09Uy5nZXRBdHRyaWJ1dGUoXCJ0YXJnZXRcIikudG9TdHJpbmcoKS5zdWJzdHIoMSk7aWYoIWUubWF0ZXJpYWxzW21dKXt2YXIgcD10aGlzLnJlYWRNYXRlcmlhbChtKTtwJiYocC5pZD1tLGUubWF0ZXJpYWxzW3AuaWRdPXApfTA9PXY/aS5tYXRlcmlhbD1tOihpLm1hdGVyaWFsc3x8KGkubWF0ZXJpYWxzPVtdKSxpLm1hdGVyaWFscy5wdXNoKG0pKX1lbHNlIGNvbnNvbGUud2FybihcImluc3RhbmNlX21hdGVyaWFsIGZvciBjb250cm9sbGVyIG5vdCBmb3VuZDogXCIrUyl9aWYoYyl7dmFyIFQ9YztcIm1vcnBoXCI9PWMudHlwZSYmKFQ9Yy5tZXNoLGkubW9ycGhfdGFyZ2V0cz1jLm1vcnBoX3RhcmdldHMpLFQubmFtZT1mLnRvU3RyaW5nKCksaS5tZXNoPWYudG9TdHJpbmcoKSxlLm1lc2hlc1tmXT1UfX19aWYoXCJpbnN0YW5jZV9saWdodFwiPT1sLmxvY2FsTmFtZSl7dmFyIGY9bC5nZXRBdHRyaWJ1dGUoXCJ1cmxcIik7dGhpcy5yZWFkTGlnaHQoaSxmKX1pZihcImluc3RhbmNlX2NhbWVyYVwiPT1sLmxvY2FsTmFtZSl7dmFyIGY9bC5nZXRBdHRyaWJ1dGUoXCJ1cmxcIik7dGhpcy5yZWFkQ2FtZXJhKGksZil9fWVsc2UgdGhpcy5yZWFkTm9kZUluZm8obCxlLHIrMSxuLHQpfX0sbWF0ZXJpYWxfdHJhbnNsYXRlX3RhYmxlOnt9LGxpZ2h0X3RyYW5zbGF0ZV90YWJsZTp7cG9pbnQ6XCJvbW5pXCIsZGlyZWN0aW9uYWw6XCJkaXJlY3Rpb25hbFwiLHNwb3Q6XCJzcG90XCJ9LGNhbWVyYV90cmFuc2xhdGVfdGFibGU6e3hmb3Y6XCJmb3ZcIixhc3BlY3RfcmF0aW86XCJhc3BlY3RcIix6bmVhcjpcIm5lYXJcIix6ZmFyOlwiZmFyXCJ9LHF1ZXJ5U2VsZWN0b3JBbmRJZDpmdW5jdGlvbih0LGUscil7Zm9yKHZhciBuPXQucXVlcnlTZWxlY3RvckFsbChlKSxhPTA7YTxuLmxlbmd0aDthKyspe3ZhciBpPW4uaXRlbShhKS5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtpZihpJiYoaT1pLnRvU3RyaW5nKCksaT09cikpcmV0dXJuIG4uaXRlbShhKX1yZXR1cm4gbnVsbH0sZ2V0Rmlyc3RDaGlsZEVsZW1lbnQ6ZnVuY3Rpb24odCxlKXtmb3IodmFyIHI9dC5jaGlsZE5vZGVzLG49MDtuPHIubGVuZ3RoOysrbil7dmFyIGE9ci5pdGVtKG4pO2lmKGEubG9jYWxOYW1lJiYhZXx8ZSYmZT09YS5sb2NhbE5hbWUpcmV0dXJuIGF9cmV0dXJuIG51bGx9LHJlYWRNYXRlcmlhbDpmdW5jdGlvbih0KXt2YXIgZT10aGlzLnF1ZXJ5U2VsZWN0b3JBbmRJZCh0aGlzLl94bWxyb290LFwibGlicmFyeV9tYXRlcmlhbHMgbWF0ZXJpYWxcIix0KTtpZighZSlyZXR1cm4gbnVsbDt2YXIgcj1lLnF1ZXJ5U2VsZWN0b3IoXCJpbnN0YW5jZV9lZmZlY3RcIik7aWYoIXIpcmV0dXJuIG51bGw7dmFyIG49ci5nZXRBdHRyaWJ1dGUoXCJ1cmxcIikuc3Vic3RyKDEpLGE9dGhpcy5xdWVyeVNlbGVjdG9yQW5kSWQodGhpcy5feG1scm9vdCxcImxpYnJhcnlfZWZmZWN0cyBlZmZlY3RcIixuKTtpZighYSlyZXR1cm4gbnVsbDt2YXIgaT1hLnF1ZXJ5U2VsZWN0b3IoXCJ0ZWNobmlxdWVcIik7aWYoIWkpcmV0dXJuIG51bGw7Zm9yKHZhciB1PWEucXVlcnlTZWxlY3RvckFsbChcIm5ld3BhcmFtXCIpLG89e30scz0wO3M8dS5sZW5ndGg7cysrKXt2YXIgbCxmPXVbc10ucXVlcnlTZWxlY3RvcihcImluaXRfZnJvbVwiKTtpZihmKWw9Zi5pbm5lckhUTUw7ZWxzZXt2YXIgaD11W3NdLnF1ZXJ5U2VsZWN0b3IoXCJzb3VyY2VcIik7bD1oLmlubmVySFRNTH1vW3Vbc10uZ2V0QXR0cmlidXRlKFwic2lkXCIpXT17cGFyZW50Omx9fXZhciBjPXt9LGQ9dGhpcy5yZWFkSW1hZ2VzKHRoaXMuX3htbHJvb3QpLHY9aS5xdWVyeVNlbGVjdG9yKFwicGhvbmdcIik7aWYodnx8KHY9aS5xdWVyeVNlbGVjdG9yKFwiYmxpbm5cIikpLHZ8fCh2PWkucXVlcnlTZWxlY3RvcihcImxhbWJlcnRcIikpLCF2KXJldHVybiBudWxsO2Zvcih2YXIgcz0wO3M8di5jaGlsZE5vZGVzLmxlbmd0aDsrK3Mpe3ZhciBfPXYuY2hpbGROb2Rlcy5pdGVtKHMpO2lmKF8ubG9jYWxOYW1lKXt2YXIgbT1fLmxvY2FsTmFtZS50b1N0cmluZygpO3RoaXMubWF0ZXJpYWxfdHJhbnNsYXRlX3RhYmxlW21dJiYobT10aGlzLm1hdGVyaWFsX3RyYW5zbGF0ZV90YWJsZVttXSk7dmFyIHA9dGhpcy5nZXRGaXJzdENoaWxkRWxlbWVudChfKTtpZihwKWlmKFwiY29sb3JcIiE9cC5sb2NhbE5hbWUudG9TdHJpbmcoKSlpZihcImZsb2F0XCIhPXAubG9jYWxOYW1lLnRvU3RyaW5nKCkpe2lmKFwidGV4dHVyZVwiPT1wLmxvY2FsTmFtZS50b1N0cmluZygpKXtjLnRleHR1cmVzfHwoYy50ZXh0dXJlcz17fSk7dmFyIE09cC5nZXRBdHRyaWJ1dGUoXCJ0ZXh0dXJlXCIpO2lmKCFNKWNvbnRpbnVlOy0xPT09TS5pbmRleE9mKFwiLlwiKSYmKE09dGhpcy5nZXRQYXJlbnRQYXJhbShvLE0pLGRbTV0mJihNPWRbTV0ucGF0aCkpO3ZhciB4PXttYXBfaWQ6TX0sZz1wLmdldEF0dHJpYnV0ZShcInRleGNvb3JkXCIpO3gudXZzPWcsYy50ZXh0dXJlc1ttXT14fX1lbHNlIGNbbV09dGhpcy5yZWFkQ29udGVudEFzRmxvYXRzKHApWzBdO2Vsc2V7dmFyIEU9dGhpcy5yZWFkQ29udGVudEFzRmxvYXRzKHApO1wiUkdCX1pFUk9cIj09Xy5nZXRBdHRyaWJ1dGUoXCJvcGFxdWVcIik/Y1ttXT1FLnN1YmFycmF5KDAsNCk6Y1ttXT1FLnN1YmFycmF5KDAsMyl9fX1yZXR1cm4gYy5vYmplY3RfdHlwZT1cIk1hdGVyaWFsXCIsY30sZ2V0UGFyZW50UGFyYW06ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFtlXSYmdFtlXS5wYXJlbnQ/dGhpcy5nZXRQYXJlbnRQYXJhbSh0LHRbZV0ucGFyZW50KTplfSxyZWFkTGlnaHQ6ZnVuY3Rpb24odCxlKXtmdW5jdGlvbiByKHQsZSl7Zm9yKHZhciByPTA7cjxlLmNoaWxkTm9kZXMubGVuZ3RoO3IrKyl7dmFyIG49ZS5jaGlsZE5vZGVzLml0ZW0ocik7aWYobiYmMT09bi5ub2RlVHlwZSlzd2l0Y2gobi5sb2NhbE5hbWUpe2Nhc2VcImNvbG9yXCI6dC5jb2xvcj1kLnJlYWRDb250ZW50QXNGbG9hdHMobik7YnJlYWs7Y2FzZVwiZmFsbG9mZl9hbmdsZVwiOnQuYW5nbGVfZW5kPWQucmVhZENvbnRlbnRBc0Zsb2F0cyhuKVswXSx0LmFuZ2xlPXQuYW5nbGVfZW5kLTEwfX19dmFyIG49e30sYT1udWxsO2lmKGUubGVuZ3RoPjEpYT10aGlzLl94bWxyb290LnF1ZXJ5U2VsZWN0b3IoXCJsaWJyYXJ5X2xpZ2h0cyBcIitlKTtlbHNle3ZhciBpPXRoaXMuX3htbHJvb3QucXVlcnlTZWxlY3RvcihcImxpYnJhcnlfbGlnaHRzXCIpO2E9dGhpcy5nZXRGaXJzdENoaWxkRWxlbWVudChpLFwibGlnaHRcIil9aWYoIWEpcmV0dXJuIG51bGw7dmFyIHU9W10sbz1hLnF1ZXJ5U2VsZWN0b3IoXCJ0ZWNobmlxdWVfY29tbW9uXCIpO2lmKG8pZm9yKHZhciBzPTA7czxvLmNoaWxkTm9kZXMubGVuZ3RoO3MrKykxPT1vLmNoaWxkTm9kZXMuaXRlbShzKS5ub2RlVHlwZSYmdS5wdXNoKG8uY2hpbGROb2Rlcy5pdGVtKHMpKTtmb3IodmFyIGw9YS5xdWVyeVNlbGVjdG9yQWxsKFwidGVjaG5pcXVlXCIpLHM9MDtzPGwubGVuZ3RoO3MrKylmb3IodmFyIGY9bC5pdGVtKHMpLGg9MDtoPGYuY2hpbGROb2Rlcy5sZW5ndGg7aCsrKTE9PWYuY2hpbGROb2Rlcy5pdGVtKGgpLm5vZGVUeXBlJiZ1LnB1c2goZi5jaGlsZE5vZGVzLml0ZW0oaCkpO2Zvcih2YXIgcz0wO3M8dS5sZW5ndGg7cysrKXt2YXIgbz11W3NdO3N3aXRjaChvLmxvY2FsTmFtZSl7Y2FzZVwicG9pbnRcIjpuLnR5cGU9dGhpcy5saWdodF90cmFuc2xhdGVfdGFibGVbby5sb2NhbE5hbWVdLHIobixvKTticmVhaztjYXNlXCJkaXJlY3Rpb25hbFwiOm4udHlwZT10aGlzLmxpZ2h0X3RyYW5zbGF0ZV90YWJsZVtvLmxvY2FsTmFtZV0scihuLG8pO2JyZWFrO2Nhc2VcInNwb3RcIjpuLnR5cGU9dGhpcy5saWdodF90cmFuc2xhdGVfdGFibGVbby5sb2NhbE5hbWVdLHIobixvKTticmVhaztjYXNlXCJpbnRlbnNpdHlcIjpuLmludGVuc2l0eT10aGlzLnJlYWRDb250ZW50QXNGbG9hdHMobylbMF19fWlmKHQubW9kZWwpe24ucG9zaXRpb249W3QubW9kZWxbMTJdLHQubW9kZWxbMTNdLHQubW9kZWxbMTRdXTt2YXIgYz1bLXQubW9kZWxbOF0sLXQubW9kZWxbOV0sLXQubW9kZWxbMTBdXTtuLnRhcmdldD1bbi5wb3NpdGlvblswXStjWzBdLG4ucG9zaXRpb25bMV0rY1sxXSxuLnBvc2l0aW9uWzJdK2NbMl1dfWVsc2UgY29uc29sZS53YXJuKFwiQ291bGQgbm90IHJlYWQgbGlnaHQgcG9zaXRpb24gZm9yIGxpZ2h0OiBcIit0Lm5hbWUrXCIuIFNldHRpbmcgZGVmYXVsdHMuXCIpLG4ucG9zaXRpb249WzAsMCwwXSxuLnRhcmdldD1bMCwtMSwwXTt0LmxpZ2h0PW59LHJlYWRDYW1lcmE6ZnVuY3Rpb24odCxlKXtmdW5jdGlvbiByKHQsZSl7Zm9yKHZhciByPTA7cjxlLmNoaWxkTm9kZXMubGVuZ3RoO3IrKyl7dmFyIG49ZS5jaGlsZE5vZGVzLml0ZW0ocik7aWYobiYmMT09bi5ub2RlVHlwZSl7dmFyIGE9ZC5jYW1lcmFfdHJhbnNsYXRlX3RhYmxlW24ubG9jYWxOYW1lXXx8bi5sb2NhbE5hbWU7dFthXT1wYXJzZUZsb2F0KG4udGV4dENvbnRlbnQpfX19dmFyIG49e30sYT10aGlzLl94bWxyb290LnF1ZXJ5U2VsZWN0b3IoXCJsaWJyYXJ5X2NhbWVyYXMgXCIrZSk7aWYoIWEpcmV0dXJuIG51bGw7dmFyIGk9W10sdT1hLnF1ZXJ5U2VsZWN0b3IoXCJ0ZWNobmlxdWVfY29tbW9uXCIpO2lmKHUpZm9yKHZhciBvPTA7bzx1LmNoaWxkTm9kZXMubGVuZ3RoO28rKykxPT11LmNoaWxkTm9kZXMuaXRlbShvKS5ub2RlVHlwZSYmaS5wdXNoKHUuY2hpbGROb2Rlcy5pdGVtKG8pKTtmb3IodmFyIG89MDtvPGkubGVuZ3RoO28rKyl7dmFyIHM9aVtvXTtyKG4scyl9bi55Zm92JiYhbi5mb3YmJihuLmFzcGVjdD9uLmZvdj1uLnlmb3Yqbi5hc3BlY3Q6Y29uc29sZS53YXJuKFwiQ291bGQgbm90IGNvbnZlcnQgY2FtZXJhIHlmb3YgdG8geGZvdiBiZWNhdXNlIGFzcGVjdCByYXRpbyBub3Qgc2V0XCIpKSx0LmNhbWVyYT1ufSxyZWFkVHJhbnNmb3JtOmZ1bmN0aW9uKHQsZSxyKXtmb3IodmFyIG49aS5tYXQ0LmNyZWF0ZSgpLGE9aS5tYXQ0LmNyZWF0ZSgpLHU9aS5xdWF0LmNyZWF0ZSgpLHM9ITEsbD0wO2w8dC5jaGlsZE5vZGVzLmxlbmd0aDtsKyspe3ZhciBmPXQuY2hpbGROb2Rlcy5pdGVtKGwpO2lmKGYmJjE9PWYubm9kZVR5cGUpe2lmKFwibWF0cml4XCI9PWYubG9jYWxOYW1lKXt2YXIgbj10aGlzLnJlYWRDb250ZW50QXNGbG9hdHMoZik7cmV0dXJuIHRoaXMudHJhbnNmb3JtTWF0cml4KG4sMD09ZSksbn1pZihcInRyYW5zbGF0ZVwiIT1mLmxvY2FsTmFtZSlpZihcInJvdGF0ZVwiIT1mLmxvY2FsTmFtZSl7aWYoXCJzY2FsZVwiPT1mLmxvY2FsTmFtZSl7dmFyIGg9dGhpcy5yZWFkQ29udGVudEFzRmxvYXRzKGYpO2lmKHIpe3ZhciBjPWhbMV07aFsxXT1oWzJdLGhbMl09LWN9aS5tYXQ0LnNjYWxlKG4sbixoKX19ZWxzZXt2YXIgaD10aGlzLnJlYWRDb250ZW50QXNGbG9hdHMoZik7aWYoND09aC5sZW5ndGgpe3ZhciBkPWYuZ2V0QXR0cmlidXRlKFwic2lkXCIpO2lmKFwiam9pbnRPcmllbnRYXCI9PWQmJihoWzNdKz05MCxzPSEwKSxyKXt2YXIgYz1oWzFdO2hbMV09aFsyXSxoWzJdPS1jfTAhPWhbM10mJihpLnF1YXQuc2V0QXhpc0FuZ2xlKHUsaC5zdWJhcnJheSgwLDMpLGhbM10qbyksaS5tYXQ0LmZyb21RdWF0KGEsdSksaS5tYXQ0Lm11bHRpcGx5KG4sbixhKSl9fWVsc2V7dmFyIGg9dGhpcy5yZWFkQ29udGVudEFzRmxvYXRzKGYpO2lmKHImJmU+MCl7dmFyIGM9aFsxXTtoWzFdPWhbMl0saFsyXT0tY31pLm1hdDQudHJhbnNsYXRlKG4sbixoKX19fXJldHVybiBufSxyZWFkVHJhbnNmb3JtMjpmdW5jdGlvbih0LGUscil7Zm9yKHZhciBuPWkubWF0NC5jcmVhdGUoKSxhPWkucXVhdC5jcmVhdGUoKSx1PWkubWF0NC5jcmVhdGUoKSxzPWkucXVhdC5jcmVhdGUoKSxsPXZlYzMuY3JlYXRlKCksZj12ZWMzLmZyb21WYWx1ZXMoMSwxLDEpLGg9ITEsYz0wO2M8dC5jaGlsZE5vZGVzLmxlbmd0aDtjKyspe3ZhciBkPXQuY2hpbGROb2Rlcy5pdGVtKGMpO2lmKFwibWF0cml4XCI9PWQubG9jYWxOYW1lKXt2YXIgbj10aGlzLnJlYWRDb250ZW50QXNGbG9hdHMoZCk7cmV0dXJuIHRoaXMudHJhbnNmb3JtTWF0cml4KG4sMD09ZSksbn1pZihcInRyYW5zbGF0ZVwiIT1kLmxvY2FsTmFtZSlpZihcInJvdGF0ZVwiIT1kLmxvY2FsTmFtZSl7aWYoXCJzY2FsZVwiPT1kLmxvY2FsTmFtZSl7dmFyIHY9dGhpcy5yZWFkQ29udGVudEFzRmxvYXRzKGQpO2lmKHIpe3ZhciBfPXZbMV07dlsxXT12WzJdLHZbMl09LV99Zi5zZXQodil9fWVsc2V7dmFyIHY9dGhpcy5yZWFkQ29udGVudEFzRmxvYXRzKGQpO2lmKDQ9PXYubGVuZ3RoKXt2YXIgbT1kLmdldEF0dHJpYnV0ZShcInNpZFwiKTtpZihcImpvaW50T3JpZW50WFwiPT1tJiYodlszXSs9OTAsaD0hMCkscil7dmFyIF89dlsxXTt2WzFdPXZbMl0sdlsyXT0tX30wIT12WzNdJiYoaS5xdWF0LnNldEF4aXNBbmdsZShzLHYuc3ViYXJyYXkoMCwzKSx2WzNdKm8pLGkucXVhdC5tdWx0aXBseShhLGEscykpfX1lbHNle3ZhciB2PXRoaXMucmVhZENvbnRlbnRBc0Zsb2F0cyhkKTtsLnNldCh2KX19aWYociYmZT4wKXt2YXIgXz1sWzFdO2xbMV09bFsyXSxsWzJdPS1ffXJldHVybiBpLm1hdDQudHJhbnNsYXRlKG4sbixsKSxpLm1hdDQuZnJvbVF1YXQodSxhKSxpLm1hdDQubXVsdGlwbHkobixuLHUpLGkubWF0NC5zY2FsZShuLG4sZiksbn0scmVhZEdlb21ldHJ5OmZ1bmN0aW9uKHQsZSxyKXtpZih2b2lkIDAhPT10aGlzLl9nZW9tZXRyaWVzX2ZvdW5kW3RdKXJldHVybiB0aGlzLl9nZW9tZXRyaWVzX2ZvdW5kW3RdO3ZhciBuPXRoaXMuX3htbHJvb3QuZ2V0RWxlbWVudEJ5SWQodC5zdWJzdHIoMSkpO2lmKCFuKXJldHVybiBjb25zb2xlLndhcm4oXCJyZWFkR2VvbWV0cnk6IGdlb21ldHJ5IG5vdCBmb3VuZDogXCIrdCksdGhpcy5fZ2VvbWV0cmllc19mb3VuZFt0XT1udWxsLG51bGw7aWYoXCJjb250cm9sbGVyXCI9PW4ubG9jYWxOYW1lKXt2YXIgYT10aGlzLnJlYWRDb250cm9sbGVyKG4sZSxyKTtyZXR1cm4gdGhpcy5fZ2VvbWV0cmllc19mb3VuZFt0XT1hLGF9aWYoXCJnZW9tZXRyeVwiIT1uLmxvY2FsTmFtZSlyZXR1cm4gY29uc29sZS53YXJuKFwicmVhZEdlb21ldHJ5OiB0YWcgc2hvdWxkIGJlIGdlb21ldHJ5LCBpbnN0ZWFkIGl0IHdhcyBmb3VuZDogXCIrbi5sb2NhbE5hbWUpLHRoaXMuX2dlb21ldHJpZXNfZm91bmRbdF09bnVsbCxudWxsO3ZhciBpPW4ucXVlcnlTZWxlY3RvcihcIm1lc2hcIik7aWYoIWkpcmV0dXJuIGNvbnNvbGUud2FybihcInJlYWRHZW9tZXRyeTogbWVzaCBub3QgZm91bmQgaW4gZ2VvbWV0cnk6IFwiK3QpLHRoaXMuX2dlb21ldHJpZXNfZm91bmRbdF09bnVsbCxudWxsO2Zvcih2YXIgbz17fSxzPWkucXVlcnlTZWxlY3RvckFsbChcInNvdXJjZVwiKSxsPTA7bDxzLmxlbmd0aDtsKyspe3ZhciBmPXMuaXRlbShsKTtpZihmLnF1ZXJ5U2VsZWN0b3Ipe3ZhciBoPWYucXVlcnlTZWxlY3RvcihcImZsb2F0X2FycmF5XCIpO2lmKGgpe3ZhciBjPXRoaXMucmVhZENvbnRlbnRBc0Zsb2F0cyhoKSxkPWYucXVlcnlTZWxlY3RvcihcImFjY2Vzc29yXCIpLHY9cGFyc2VJbnQoZC5nZXRBdHRyaWJ1dGUoXCJzdHJpZGVcIikpO29bZi5nZXRBdHRyaWJ1dGUoXCJpZFwiKV09e3N0cmlkZTp2LGRhdGE6Y319fX12YXIgXz1pLnF1ZXJ5U2VsZWN0b3IoXCJ2ZXJ0aWNlcyBpbnB1dFwiKSxtPW9bXy5nZXRBdHRyaWJ1dGUoXCJzb3VyY2VcIikuc3Vic3RyKDEpXTtvW2kucXVlcnlTZWxlY3RvcihcInZlcnRpY2VzXCIpLmdldEF0dHJpYnV0ZShcImlkXCIpXT1tO3ZhciBwPW51bGwsTT1pLnF1ZXJ5U2VsZWN0b3IoXCJwb2x5Z29uc1wiKTtpZihNJiYocD10aGlzLnJlYWRUcmlhbmdsZXMoTSxvKSksIXApe3ZhciB4PWkucXVlcnlTZWxlY3RvckFsbChcInRyaWFuZ2xlc1wiKTt4JiZ4Lmxlbmd0aCYmKHA9dGhpcy5yZWFkVHJpYW5nbGVzKHgsbykpfWlmKCFwKXt2YXIgZz1pLnF1ZXJ5U2VsZWN0b3IoXCJwb2x5bGlzdFwiKTtnJiYocD10aGlzLnJlYWRQb2x5bGlzdChnLG8pKX1pZighcCl7dmFyIEU9aS5xdWVyeVNlbGVjdG9yKFwibGluZXN0cmlwc1wiKTtFJiYocD10aGlzLnJlYWRMaW5lU3RyaXAobyxFKSl9aWYoIXApcmV0dXJuIGNvbnNvbGUubG9nKFwibm8gcG9seWdvbnMgb3IgdHJpYW5nbGVzIGluIG1lc2g6IFwiK3QpLHRoaXMuX2dlb21ldHJpZXNfZm91bmRbdF09bnVsbCxudWxsO2lmKGUmJiF0aGlzLm5vX2ZsaXApe2Zvcih2YXIgYj0wLHk9cC52ZXJ0aWNlcyxsPTAsUz15Lmxlbmd0aDtTPmw7bCs9MyliPXlbbCsxXSx5W2wrMV09eVtsKzJdLHlbbCsyXT0tYjt5PXAubm9ybWFscztmb3IodmFyIGw9MCxTPXkubGVuZ3RoO1M+bDtsKz0zKWI9eVtsKzFdLHlbbCsxXT15W2wrMl0seVtsKzJdPS1ifWlmKHUmJnRoaXMudXNlX3RyYW5zZmVyYWJsZXMpZm9yKHZhciBsIGluIHApe3ZhciBUPXBbbF07VCYmVC5idWZmZXImJlQubGVuZ3RoPjEwMCYmdGhpcy5fdHJhbnNmZXJhYmxlcy5wdXNoKFQuYnVmZmVyKX1yZXR1cm4gcC5maWxlbmFtZT10LHAub2JqZWN0X3R5cGU9XCJNZXNoXCIsdGhpcy5fZ2VvbWV0cmllc19mb3VuZFt0XT1wLHB9LHJlYWRUcmlhbmdsZXM6ZnVuY3Rpb24odCxlKXtmb3IodmFyIHI9W10sbj1bXSxhPTAsaT17fSx1PVtdLG89W10scz0wLGw9XCJcIixmPVwiXCIsaD0wO2g8dC5sZW5ndGg7aCsrKXt2YXIgYz10Lml0ZW0oaCksZD1cInRyaWFuZ2xlc1wiPT1jLmxvY2FsTmFtZTtmPWMuZ2V0QXR0cmlidXRlKFwibWF0ZXJpYWxcIiksMD09aCYmKG49dGhpcy5yZWFkU2hhcGVJbnB1dHMoYyxlKSk7Zm9yKHZhciB2PWMucXVlcnlTZWxlY3RvckFsbChcInBcIiksXz0obi5sZW5ndGgsMCk7Xzx2Lmxlbmd0aDtfKyspe3ZhciBtPXYuaXRlbShfKTtpZighbXx8IW0udGV4dENvbnRlbnQpYnJlYWs7dmFyIHA9bS50ZXh0Q29udGVudC50cmltKCkuc3BsaXQoXCIgXCIpLE09LTEseD0tMSxnPS0xLEU9MTtmb3IodmFyIGIgaW4gbilFPU1hdGgubWF4KEUsbltiXVs0XSsxKTtmb3IodmFyIHk9MCxTPXAubGVuZ3RoO1M+eTt5Kz1FKXt2YXIgVD1wLnNsaWNlKHkseStFKS5qb2luKFwiIFwiKTtpZihnPXgsaS5oYXNPd25Qcm9wZXJ0eShUKSl4PWlbVF07ZWxzZXtmb3IodmFyIEk9MDtJPG4ubGVuZ3RoOysrSSl7dmFyIEE9bltJXSxGPUFbMV0sRD1BWzNdLFI9cGFyc2VJbnQocFt5K0FbNF1dKTswPT1JJiYodVtGLmxlbmd0aC9BWzJdXT1SKSxSKj1BWzJdO2Zvcih2YXIgdz0wO3c8QVsyXTsrK3cpe2lmKHZvaWQgMD09PURbUit3XSl0aHJvd1wiVU5ERUZJTkVEIVwiO0YucHVzaChEW1Ird10pfX14PWEsYSs9MSxpW1RdPXh9ZHx8KDA9PXkmJihNPXgpLHk+MiYmKG8ucHVzaChNKSxvLnB1c2goZykpKSxvLnB1c2goeCl9fXZhciBQPXtuYW1lOmx8fFwiZ3JvdXBcIitoLHN0YXJ0OnMsbGVuZ3RoOm8ubGVuZ3RoLXMsbWF0ZXJpYWw6Znx8XCJcIn07cz1vLmxlbmd0aCxyLnB1c2goUCl9dmFyIE49e3ZlcnRpY2VzOm5ldyBGbG9hdDMyQXJyYXkoblswXVsxXSksaW5mbzp7Z3JvdXBzOnJ9LF9yZW1hcDpuZXcgVWludDMyQXJyYXkodSl9O3JldHVybiB0aGlzLnRyYW5zZm9ybU1lc2hJbmZvKE4sbixvKSxOfSxyZWFkUG9seWxpc3Q6ZnVuY3Rpb24odCxlKXt2YXIgcj1bXSxuPTAsYT17fSxpPVtdLHU9W10sbz1cIlwiO289dC5nZXRBdHRyaWJ1dGUoXCJtYXRlcmlhbFwiKSxyPXRoaXMucmVhZFNoYXBlSW5wdXRzKHQsZSk7Zm9yKHZhciBzPXQucXVlcnlTZWxlY3RvcihcInZjb3VudFwiKSxsPXRoaXMucmVhZENvbnRlbnRBc1VJbnQzMihzKSxmPXQucXVlcnlTZWxlY3RvcihcInBcIiksaD10aGlzLnJlYWRDb250ZW50QXNVSW50MzIoZiksYz1yLmxlbmd0aCxkPTAsdj0wLF89bC5sZW5ndGg7Xz52Oysrdilmb3IodmFyIG09bFt2XSxwPS0xLE09LTEseD0tMSxnPTA7bT5nOysrZyl7dmFyIEU9aC5zdWJhcnJheShkLGQrYykuam9pbihcIiBcIik7aWYoeD1NLGEuaGFzT3duUHJvcGVydHkoRSkpTT1hW0VdO2Vsc2V7Zm9yKHZhciBiPTA7YjxyLmxlbmd0aDsrK2Ipe3ZhciB5PXJbYl0sUz1wYXJzZUludChoW2QrYl0pLFQ9eVsxXSxJPXlbM107MD09YiYmKGlbVC5sZW5ndGgvY109UyksUyo9eVsyXTtmb3IodmFyIEE9MDtBPHlbMl07KytBKVQucHVzaChJW1MrQV0pfU09bixuKz0xLGFbRV09TX1tPjMmJigwPT1nJiYocD1NKSxnPjImJih1LnB1c2gocCksdS5wdXNoKHgpKSksdS5wdXNoKE0pLGQrPWN9dmFyIEY9e3ZlcnRpY2VzOm5ldyBGbG9hdDMyQXJyYXkoclswXVsxXSksaW5mbzp7fSxfcmVtYXA6bmV3IFVpbnQzMkFycmF5KGkpfTtyZXR1cm4gdGhpcy50cmFuc2Zvcm1NZXNoSW5mbyhGLHIsdSksRn0scmVhZFNoYXBlSW5wdXRzOmZ1bmN0aW9uKHQsZSl7Zm9yKHZhciByPVtdLG49dC5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIiksYT0wO2E8bi5sZW5ndGg7YSsrKXt2YXIgaT1uLml0ZW0oYSk7aWYoaS5nZXRBdHRyaWJ1dGUpe3ZhciB1PWkuZ2V0QXR0cmlidXRlKFwic2VtYW50aWNcIikudG9VcHBlckNhc2UoKSxvPWVbaS5nZXRBdHRyaWJ1dGUoXCJzb3VyY2VcIikuc3Vic3RyKDEpXSxzPXBhcnNlSW50KGkuZ2V0QXR0cmlidXRlKFwib2Zmc2V0XCIpKSxsPTA7aS5nZXRBdHRyaWJ1dGUoXCJzZXRcIikmJihsPXBhcnNlSW50KGkuZ2V0QXR0cmlidXRlKFwic2V0XCIpKSksci5wdXNoKFt1LFtdLG8uc3RyaWRlLG8uZGF0YSxzLGxdKX19cmV0dXJuIHJ9LHRyYW5zZm9ybU1lc2hJbmZvOmZ1bmN0aW9uKHQsZSxyKXtmb3IodmFyIG49e25vcm1hbDpcIm5vcm1hbHNcIix0ZXhjb29yZDpcImNvb3Jkc1wifSxhPTE7YTxlLmxlbmd0aDsrK2Epe3ZhciBpPWVbYV1bMF0udG9Mb3dlckNhc2UoKSx1PWVbYV1bMV07dS5sZW5ndGgmJihuW2ldJiYoaT1uW2ldKSx0W2ldJiYoaSs9ZVthXVs1XSksdFtpXT1uZXcgRmxvYXQzMkFycmF5KHUpKX1yZXR1cm4gciYmci5sZW5ndGgmJih0LnZlcnRpY2VzLmxlbmd0aD42NTUzNj90LnRyaWFuZ2xlcz1uZXcgVWludDMyQXJyYXkocik6dC50cmlhbmdsZXM9bmV3IFVpbnQxNkFycmF5KHIpKSx0fSxyZWFkTGluZVN0cmlwOmZ1bmN0aW9uKHQsZSl7dmFyIHI9W10sbj0wLGE9e30saT1bXSx1PVtdLG89MCxzPWUucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpO2lmKDA9PW8pZm9yKHZhciBsPTA7bDxzLmxlbmd0aDtsKyspe3ZhciBmPXMuaXRlbShsKTtpZihmLmdldEF0dHJpYnV0ZSl7dmFyIGg9Zi5nZXRBdHRyaWJ1dGUoXCJzZW1hbnRpY1wiKS50b1VwcGVyQ2FzZSgpLGM9dFtmLmdldEF0dHJpYnV0ZShcInNvdXJjZVwiKS5zdWJzdHIoMSldLGQ9cGFyc2VJbnQoZi5nZXRBdHRyaWJ1dGUoXCJvZmZzZXRcIikpLHY9MDtmLmdldEF0dHJpYnV0ZShcInNldFwiKSYmKHY9cGFyc2VJbnQoZi5nZXRBdHRyaWJ1dGUoXCJzZXRcIikpKSxyLnB1c2goW2gsW10sYy5zdHJpZGUsYy5kYXRhLGQsdl0pfX1mb3IodmFyIF89ZS5xdWVyeVNlbGVjdG9yQWxsKFwicFwiKSxtPXIubGVuZ3RoLGw9MDtsPF8ubGVuZ3RoO2wrKyl7dmFyIHA9Xy5pdGVtKGwpO2lmKCFwfHwhcC50ZXh0Q29udGVudClicmVhaztmb3IodmFyIE09cC50ZXh0Q29udGVudC50cmltKCkuc3BsaXQoXCIgXCIpLHg9LTEsZz0tMSxFPTAsYj1NLmxlbmd0aDtiPkU7RSs9bSl7dmFyIHk9TS5zbGljZShFLEUrbSkuam9pbihcIiBcIik7aWYoZz14LGEuaGFzT3duUHJvcGVydHkoeSkpeD1hW3ldO2Vsc2V7Zm9yKHZhciBTPTA7UzxyLmxlbmd0aDsrK1Mpe3ZhciBUPXJbU10sST1wYXJzZUludChNW0UrU10pLEE9VFsxXSxGPVRbM107MD09UyYmKGlbQS5sZW5ndGgvbV09SSksSSo9VFsyXTtmb3IodmFyIEQ9MDtEPFRbMl07KytEKUEucHVzaChGW0krRF0pfXg9bixuKz0xLGFbeV09eH11LnB1c2goeCl9fXZhciBSPXtwcmltaXRpdmU6XCJsaW5lX3N0cmlwXCIsdmVydGljZXM6bmV3IEZsb2F0MzJBcnJheShyWzBdWzFdKSxpbmZvOnt9fTtyZXR1cm4gdGhpcy50cmFuc2Zvcm1NZXNoSW5mbyhSLHIsdSl9LGZpbmRYTUxOb2RlQnlJZDpmdW5jdGlvbih0LGUscil7aWYodGhpcy5feG1scm9vdC5fbm9kZXNfYnlfaWQpe3ZhciBuPXRoaXMuX3htbHJvb3QuX25vZGVzX2J5X2lkW3JdO2lmKG4mJm4ubG9jYWxOYW1lPT1lKXJldHVybiBufWVsc2V7dmFyIG49dGhpcy5feG1scm9vdC5nZXRFbGVtZW50QnlJZChyKTtpZihuKXJldHVybiBufWZvcih2YXIgYT10LmNoaWxkTm9kZXMsaT0wO2k8YS5sZW5ndGg7KytpKXt2YXIgdT1hLml0ZW0oaSk7aWYoMT09dS5ub2RlVHlwZSYmdS5sb2NhbE5hbWU9PWUpe3ZhciBvPXUuZ2V0QXR0cmlidXRlKFwiaWRcIik7aWYobz09cilyZXR1cm4gdX19cmV0dXJuIG51bGx9LHJlYWRJbWFnZXM6ZnVuY3Rpb24odCl7dmFyIGU9dC5xdWVyeVNlbGVjdG9yKFwibGlicmFyeV9pbWFnZXNcIik7aWYoIWUpcmV0dXJuIG51bGw7Zm9yKHZhciByPXt9LG49ZS5jaGlsZE5vZGVzLGE9MDthPG4ubGVuZ3RoOysrYSl7dmFyIGk9bi5pdGVtKGEpO2lmKDE9PWkubm9kZVR5cGUpe3ZhciB1PWkucXVlcnlTZWxlY3RvcihcImluaXRfZnJvbVwiKTtpZih1JiZ1LnRleHRDb250ZW50KXt2YXIgbz10aGlzLmdldEZpbGVuYW1lKHUudGV4dENvbnRlbnQpLHM9aS5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtyW3NdPXtmaWxlbmFtZTpvLG1hcDpzLG5hbWU6aS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpLHBhdGg6dS50ZXh0Q29udGVudH19fX1yZXR1cm4gcn0scmVhZEFuaW1hdGlvbnM6ZnVuY3Rpb24odCxlKXt2YXIgcj10LnF1ZXJ5U2VsZWN0b3IoXCJsaWJyYXJ5X2FuaW1hdGlvbnNcIik7aWYoIXIpcmV0dXJuIG51bGw7Zm9yKHZhciBuPXIuY2hpbGROb2RlcyxhPXtvYmplY3RfdHlwZTpcIkFuaW1hdGlvblwiLHRha2VzOnt9fSxpPXt0cmFja3M6W119LHU9aS50cmFja3Msbz0wO288bi5sZW5ndGg7KytvKXt2YXIgcz1uLml0ZW0obyk7aWYoMT09cy5ub2RlVHlwZSYmXCJhbmltYXRpb25cIj09cy5sb2NhbE5hbWUpe3ZhciBsPXMuZ2V0QXR0cmlidXRlKFwiaWRcIik7aWYobCl0aGlzLnJlYWRBbmltYXRpb24ocyx1KTtlbHNle3ZhciBmPXMucXVlcnlTZWxlY3RvckFsbChcImFuaW1hdGlvblwiKTtpZihmLmxlbmd0aClmb3IodmFyIGg9MDtoPGYubGVuZ3RoOysraCl7dmFyIGM9Zi5pdGVtKGgpO3RoaXMucmVhZEFuaW1hdGlvbihjLHUpfWVsc2UgdGhpcy5yZWFkQW5pbWF0aW9uKHMsdSl9fX1pZighdS5sZW5ndGgpcmV0dXJuIG51bGw7Zm9yKHZhciBkPTAsbz0wO288dS5sZW5ndGg7KytvKWQ8dVtvXS5kdXJhdGlvbiYmKGQ9dVtvXS5kdXJhdGlvbik7cmV0dXJuIGkubmFtZT1cImRlZmF1bHRcIixpLmR1cmF0aW9uPWQsYS50YWtlc1tpLm5hbWVdPWksYX0scmVhZEFuaW1hdGlvbjpmdW5jdGlvbih0LGUpe2lmKFwiYW5pbWF0aW9uXCIhPXQubG9jYWxOYW1lKXJldHVybiBudWxsO3ZhciByPSh0LmdldEF0dHJpYnV0ZShcImlkXCIpLHQucXVlcnlTZWxlY3RvckFsbChcImNoYW5uZWxcIikpO2lmKCFyLmxlbmd0aClyZXR1cm4gbnVsbDtmb3IodmFyIG49ZXx8W10sYT0wO2E8ci5sZW5ndGg7KythKXt2YXIgaT10aGlzLnJlYWRDaGFubmVsKHIuaXRlbShhKSx0KTtpJiZuLnB1c2goaSl9cmV0dXJuIG59LHJlYWRDaGFubmVsOmZ1bmN0aW9uKHQsZSl7aWYoXCJjaGFubmVsXCIhPXQubG9jYWxOYW1lfHxcImFuaW1hdGlvblwiIT1lLmxvY2FsTmFtZSlyZXR1cm4gbnVsbDt2YXIgcj10LmdldEF0dHJpYnV0ZShcInNvdXJjZVwiKSxuPXQuZ2V0QXR0cmlidXRlKFwidGFyZ2V0XCIpLGE9dGhpcy5maW5kWE1MTm9kZUJ5SWQoZSxcInNhbXBsZXJcIixyLnN1YnN0cigxKSk7aWYoIWEpcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBEQUU6IFNhbXBsZXIgbm90IGZvdW5kIGluIFwiK3IpLG51bGw7Zm9yKHZhciBpPXt9LG89e30scz17fSxsPWEucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpLGY9bnVsbCxoPTA7aDxsLmxlbmd0aDtoKyspe3ZhciBjPWwuaXRlbShoKSxkPWMuZ2V0QXR0cmlidXRlKFwic291cmNlXCIpLHY9Yy5nZXRBdHRyaWJ1dGUoXCJzZW1hbnRpY1wiKSxfPXRoaXMuZmluZFhNTE5vZGVCeUlkKGUsXCJzb3VyY2VcIixkLnN1YnN0cigxKSk7aWYoXyl7dmFyIG09Xy5xdWVyeVNlbGVjdG9yKFwicGFyYW1cIik7aWYobSl7dmFyIHA9bS5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpO2lbdl09e3NvdXJjZTpkLHR5cGU6cH07dmFyIE09bnVsbDtpZihcImZsb2F0XCI9PXB8fFwiZmxvYXQ0eDRcIj09cCl7dmFyIHg9Xy5xdWVyeVNlbGVjdG9yKFwiZmxvYXRfYXJyYXlcIiksZz10aGlzLnJlYWRDb250ZW50QXNGbG9hdHMoeCk7c1tkXT1nLE09Zzt2YXIgRT1tLmdldEF0dHJpYnV0ZShcIm5hbWVcIik7XCJUSU1FXCI9PUUmJihmPU0pLFwiT1VUUFVUXCI9PXYmJihFPXYpLEU/b1tFXT1wOmNvbnNvbGUud2FybihcIkNvbGxhZGE6IDxwYXJhbT4gd2l0aG91dCBuYW1lIGF0dHJpYnV0ZSBpbiA8YW5pbWF0aW9uPlwiKX19fX1pZighZilyZXR1cm4gY29uc29sZS5lcnJvcihcIkVycm9yIERBRTogbm8gVElNRSBpbmZvIGZvdW5kIGluIDxjaGFubmVsPjogXCIrdC5nZXRBdHRyaWJ1dGUoXCJzb3VyY2VcIikpLG51bGw7dmFyIGI9bi5zcGxpdChcIi9cIikseT17fSxTPWJbMF0sVD10aGlzLl9ub2Rlc19ieV9pZFtTXSxJPVQuaWQrXCIvXCIrYlsxXTt5Lm5hbWU9YlsxXSx5LnByb3BlcnR5PUk7dmFyIHA9XCJudW1iZXJcIixBPTEsRj1vLk9VVFBVVDtzd2l0Y2goRil7Y2FzZVwiZmxvYXRcIjpBPTE7YnJlYWs7Y2FzZVwiZmxvYXQzeDNcIjpBPTkscD1cIm1hdDNcIjticmVhaztjYXNlXCJmbG9hdDR4NFwiOkE9MTYscD1cIm1hdDRcIn15LnR5cGU9cCx5LnZhbHVlX3NpemU9QSx5LmR1cmF0aW9uPWZbZi5sZW5ndGgtMV07dmFyIEQ9c1tpLk9VVFBVVC5zb3VyY2VdO2lmKCFEKXJldHVybiBudWxsO2Zvcih2YXIgUj1mLmxlbmd0aCx3PUErMSxQPW5ldyBGbG9hdDMyQXJyYXkoUip3KSxoPTA7aDxmLmxlbmd0aDsrK2gpe1BbaCp3XT1mW2hdO3ZhciBOPUQuc3ViYXJyYXkoaCpBLChoKzEpKkEpO1wiZmxvYXQ0eDRcIj09RiYmdGhpcy50cmFuc2Zvcm1NYXRyaXgoTixUPzA9PVQuX2RlcHRoOjApLFAuc2V0KE4saCp3KzEpfWlmKHUmJnRoaXMudXNlX3RyYW5zZmVyYWJsZXMpe3ZhciBPPVA7TyYmTy5idWZmZXImJk8ubGVuZ3RoPjEwMCYmdGhpcy5fdHJhbnNmZXJhYmxlcy5wdXNoKE8uYnVmZmVyKX1yZXR1cm4geS5kYXRhPVAseX0sZmluZE5vZGU6ZnVuY3Rpb24odCxlKXtpZih0LmlkPT1lKXJldHVybiB0O2lmKHQuY2hpbGRyZW4pZm9yKHZhciByIGluIHQuY2hpbGRyZW4pe3ZhciBuPXRoaXMuZmluZE5vZGUodC5jaGlsZHJlbltyXSxlKTtpZihuKXJldHVybiBufXJldHVybiBudWxsfSxyZWFkTGlicmFyeUNvbnRyb2xsZXJzOmZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX3htbHJvb3QucXVlcnlTZWxlY3RvcihcImxpYnJhcnlfY29udHJvbGxlcnNcIik7aWYoIWUpcmV0dXJuIG51bGw7Zm9yKHZhciByPWUuY2hpbGROb2RlcyxuPTA7bjxyLmxlbmd0aDsrK24pe3ZhciBhPXIuaXRlbShuKTtpZigxPT1hLm5vZGVUeXBlJiZcImNvbnRyb2xsZXJcIj09YS5sb2NhbE5hbWUpe3ZhciBpPWEuZ2V0QXR0cmlidXRlKFwiaWRcIik7dGhpcy5fY29udHJvbGxlcnNfZm91bmRbaV18fHRoaXMucmVhZENvbnRyb2xsZXIoYSxudWxsLHQpfX19LHJlYWRDb250cm9sbGVyOmZ1bmN0aW9uKHQsZSxyKXtpZihcImNvbnRyb2xsZXJcIj09IXQubG9jYWxOYW1lKXJldHVybiBjb25zb2xlLndhcm4oXCJyZWFkQ29udHJvbGxlcjogbm90IGEgY29udHJvbGxlcjogXCIrdC5sb2NhbE5hbWUpLG51bGw7dmFyIG49dC5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtpZih0aGlzLl9jb250cm9sbGVyc19mb3VuZFtuXSlyZXR1cm4gdGhpcy5fY29udHJvbGxlcnNfZm91bmRbbl07dmFyIGE9bnVsbCxpPXQucXVlcnlTZWxlY3RvcihcInNraW5cIik7aSYmKGE9dGhpcy5yZWFkU2tpbkNvbnRyb2xsZXIoaSxlLHIpKTt2YXIgdT10LnF1ZXJ5U2VsZWN0b3IoXCJtb3JwaFwiKTtyZXR1cm4gdSYmKGE9dGhpcy5yZWFkTW9ycGhDb250cm9sbGVyKHUsZSxyLGEpKSx0aGlzLl9jb250cm9sbGVyc19mb3VuZFtuXT9uKz1cIl8xYmxhaFwiOnRoaXMuX2NvbnRyb2xsZXJzX2ZvdW5kW25dPWEsYX0scmVhZFNraW5Db250cm9sbGVyOmZ1bmN0aW9uKHQsZSxyKXt2YXIgbj10LmdldEF0dHJpYnV0ZShcInNvdXJjZVwiKSxhPXRoaXMucmVhZEdlb21ldHJ5KG4sZSxyKTtpZighYSlyZXR1cm4gbnVsbDt2YXIgdT10aGlzLnJlYWRTb3VyY2VzKHQsZSk7aWYoIXUpcmV0dXJuIG51bGw7dmFyIG89bnVsbCxzPXQucXVlcnlTZWxlY3RvcihcImJpbmRfc2hhcGVfbWF0cml4XCIpO3M/KG89dGhpcy5yZWFkQ29udGVudEFzRmxvYXRzKHMpLHRoaXMudHJhbnNmb3JtTWF0cml4KG8sITAsITApKTpvPWkubWF0NC5jcmVhdGUoKTt2YXIgbD1bXSxmPXQucXVlcnlTZWxlY3RvcihcImpvaW50c1wiKTtpZihmKXtmb3IodmFyIGg9bnVsbCxjPW51bGwsZD1mLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKSx2PTA7djxkLmxlbmd0aDt2Kyspe3ZhciBfPWRbdl0sbT1fLmdldEF0dHJpYnV0ZShcInNlbWFudGljXCIpLnRvVXBwZXJDYXNlKCkscD1fLmdldEF0dHJpYnV0ZShcInNvdXJjZVwiKSxNPXVbcC5zdWJzdHIoMSldO1wiSk9JTlRcIj09bT9oPU06XCJJTlZfQklORF9NQVRSSVhcIj09bSYmKGM9TSl9aWYoIWN8fCFoKXJldHVybiBjb25zb2xlLmVycm9yKFwiRXJyb3IgREFFOiBubyBqb2ludHMgb3IgaW52X2JpbmQgc291cmNlcyBmb3VuZFwiKSxudWxsO2Zvcih2YXIgdiBpbiBoKXt2YXIgeD1jLnN1YmFycmF5KDE2KnYsMTYqdisxNiksZz1oW3ZdLEU9dGhpcy5fbm9kZXNfYnlfaWRbZ107RT8odGhpcy50cmFuc2Zvcm1NYXRyaXgoeCwwPT1FLl9kZXB0aCwhMCksbC5wdXNoKFtnLHhdKSk6Y29uc29sZS53YXJuKFwiTm9kZSBcIitnK1wiIG5vdCBmb3VuZFwiKX19dmFyIGI9dC5xdWVyeVNlbGVjdG9yKFwidmVydGV4X3dlaWdodHNcIik7aWYoYil7Zm9yKHZhciB5PW51bGwsZD1iLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKSx2PTA7djxkLmxlbmd0aDt2KyspXCJXRUlHSFRcIj09ZFt2XS5nZXRBdHRyaWJ1dGUoXCJzZW1hbnRpY1wiKS50b1VwcGVyQ2FzZSgpJiYoeT11W2QuaXRlbSh2KS5nZXRBdHRyaWJ1dGUoXCJzb3VyY2VcIikuc3Vic3RyKDEpXSk7aWYoIXkpdGhyb3dcIm5vIHdlaWdodHMgZm91bmRcIjtmb3IodmFyIFM9Yi5xdWVyeVNlbGVjdG9yKFwidmNvdW50XCIpLFQ9dGhpcy5yZWFkQ29udGVudEFzVUludDMyKFMpLEk9Yi5xdWVyeVNlbGVjdG9yKFwidlwiKSxBPXRoaXMucmVhZENvbnRlbnRBc1VJbnQzMihJKSxGPWEudmVydGljZXMubGVuZ3RoLzMsRD1uZXcgRmxvYXQzMkFycmF5KDQqRiksUj1uZXcgVWludDhBcnJheSg0KkYpLHc9MCxQPWEuX3JlbWFwLE49MCx2PTAsTz1ULmxlbmd0aDtPPnY7Kyt2KXtmb3IodmFyIEw9VFt2XSxrPXcsQz1SLnN1YmFycmF5KDQqdiw0KnYrNCksVT1ELnN1YmFycmF5KDQqdiw0KnYrNCksQj0wLFg9MDtMPlgmJjQ+WDsrK1gpQ1tYXT1BW2srMipYXSxDW1hdPk4mJihOPUNbWF0pLFVbWF09eVtBW2srMipYKzFdXSxCKz1VW1hdO2lmKEw+NCYmMT5CKWZvcih2YXIgcT0xL0IsWD0wOzQ+WDsrK1gpVVtYXSo9cTt3Kz0yKkx9Zm9yKHZhciBWPW5ldyBGbG9hdDMyQXJyYXkoNCpGKSx6PW5ldyBVaW50OEFycmF5KDQqRiksaj1bXSx2PTA7Rj52Oysrdil7Zm9yKHZhciBHPTQqUFt2XSxVPUQuc3ViYXJyYXkoRyxHKzQpLEM9Ui5zdWJhcnJheShHLEcrNCksWT0wOzM+WTsrK1kpe2Zvcih2YXIgVz1ZLEg9VVtZXSxYPVkrMTs0Plg7KytYKVVbWF08PUh8fChXPVgsSD1VW1hdKTtpZihXIT1ZKXt2YXIgWj1VW1ldO1VbWV09VVtXXSxVW1ddPVosWj1DW1ldLENbWV09Q1tXXSxDW1ddPVp9fVYuc2V0KFUsNCp2KSx6LnNldChDLDQqdiksVVswXSYmKGpbQ1swXV09ITApLFVbMV0mJihqW0NbMV1dPSEwKSxVWzJdJiYoaltDWzJdXT0hMCksVVszXSYmKGpbQ1szXV09ITApfU4+PWwubGVuZ3RoJiZjb25zb2xlLndhcm4oXCJNZXNoIHVzZXMgaGlnaGVyIGJvbmUgaW5kZXggdGhhbiBib25lcyBmb3VuZFwiKTtmb3IodmFyIFE9W10sSz17fSx2PTA7djxqLmxlbmd0aDsrK3Ypalt2XSYmKEtbdl09US5sZW5ndGgsUS5wdXNoKGxbdl0pKTtpZihRLmxlbmd0aDxsLmxlbmd0aCl7Zm9yKHZhciB2PTA7djx6Lmxlbmd0aDt2Kyspelt2XT1LW3pbdl1dO2w9UX1hLndlaWdodHM9VixhLmJvbmVfaW5kaWNlcz16LGEuYm9uZXM9bCxhLmJpbmRfbWF0cml4PW99cmV0dXJuIGF9LHJlYWRNb3JwaENvbnRyb2xsZXI6ZnVuY3Rpb24odCxlLHIsbil7dmFyIGE9dC5nZXRBdHRyaWJ1dGUoXCJzb3VyY2VcIiksaT10aGlzLnJlYWRHZW9tZXRyeShhLGUscik7aWYoIWkpcmV0dXJuIG51bGw7dmFyIHU9dGhpcy5yZWFkU291cmNlcyh0LGUpLG89W10scz10LnF1ZXJ5U2VsZWN0b3IoXCJ0YXJnZXRzXCIpO2lmKCFzKXJldHVybiBudWxsO2Zvcih2YXIgbD1zLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKSxmPW51bGwsaD1udWxsLGM9MDtjPGwubGVuZ3RoO2MrKyl7dmFyIGQ9bC5pdGVtKGMpLHY9ZC5nZXRBdHRyaWJ1dGUoXCJzZW1hbnRpY1wiKS50b1VwcGVyQ2FzZSgpLF89dVtkLmdldEF0dHJpYnV0ZShcInNvdXJjZVwiKS5zdWJzdHIoMSldO1wiTU9SUEhfVEFSR0VUXCI9PXY/Zj1fOlwiTU9SUEhfV0VJR0hUXCI9PXYmJihoPV8pfWlmKCFmfHwhaClyZXR1cm4gY29uc29sZS53YXJuKFwiTW9ycGggY29udHJvbGxlciB3aXRob3V0IHRhcmdldHMgb3Igd2VpZ2h0cy4gU2tpcHBpbmcgaXQuXCIpLG51bGw7Zm9yKHZhciBjIGluIGYpe3ZhciBtPVwiI1wiK2ZbY10scD10aGlzLnJlYWRHZW9tZXRyeShtLGUscik7ci5tZXNoZXNbbV09cCxvLnB1c2goe21lc2g6bSx3ZWlnaHQ6aFtjXX0pfXJldHVybiBpLm1vcnBoX3RhcmdldHM9byxpfSxyZWFkQmluZE1hdGVyaWFsczpmdW5jdGlvbih0LGUpe2Zvcih2YXIgcj1bXSxuPXQucXVlcnlTZWxlY3RvckFsbChcInRlY2huaXF1ZV9jb21tb25cIiksYT0wO2E8bi5sZW5ndGg7YSsrKWZvcih2YXIgaT1uLml0ZW0oYSksdT1pLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnN0YW5jZV9tYXRlcmlhbFwiKSxvPTA7bzx1Lmxlbmd0aDtvKyspe3ZhciBzPXUuaXRlbShvKTtzJiZyLnB1c2gocy5nZXRBdHRyaWJ1dGUoXCJzeW1ib2xcIikpfXJldHVybiByfSxyZWFkU291cmNlczpmdW5jdGlvbih0LGUpe2Zvcih2YXIgcj17fSxuPXQucXVlcnlTZWxlY3RvckFsbChcInNvdXJjZVwiKSxhPTA7YTxuLmxlbmd0aDthKyspe3ZhciBpPW4uaXRlbShhKTtpZihpLnF1ZXJ5U2VsZWN0b3Ipe3ZhciB1PWkucXVlcnlTZWxlY3RvcihcImZsb2F0X2FycmF5XCIpO2lmKHUpe3ZhciBvPXRoaXMucmVhZENvbnRlbnRBc0Zsb2F0cyhpKTtyW2kuZ2V0QXR0cmlidXRlKFwiaWRcIildPW99ZWxzZXt2YXIgcz1pLnF1ZXJ5U2VsZWN0b3IoXCJOYW1lX2FycmF5XCIpO2lmKHMpe3ZhciBsPXRoaXMucmVhZENvbnRlbnRBc1N0cmluZ3NBcnJheShzKTtpZighbCljb250aW51ZTtyW2kuZ2V0QXR0cmlidXRlKFwiaWRcIildPWx9ZWxzZXt2YXIgZj1pLnF1ZXJ5U2VsZWN0b3IoXCJJRFJFRl9hcnJheVwiKTtpZihmKXt2YXIgbD10aGlzLnJlYWRDb250ZW50QXNTdHJpbmdzQXJyYXkoZik7aWYoIWwpY29udGludWU7cltpLmdldEF0dHJpYnV0ZShcImlkXCIpXT1sfWVsc2U7fX19fXJldHVybiByfSxyZWFkQ29udGVudEFzVUludDMyOmZ1bmN0aW9uKHQpe2lmKCF0KXJldHVybiBudWxsO3ZhciBlPXQudGV4dENvbnRlbnQ7aWYoZT1lLnJlcGxhY2UoL1xcbi9naSxcIiBcIiksZT1lLnRyaW0oKSwwPT1lLmxlbmd0aClyZXR1cm4gbnVsbDtmb3IodmFyIHI9ZS5zcGxpdChcIiBcIiksbj1uZXcgVWludDMyQXJyYXkoci5sZW5ndGgpLGE9MDthPHIubGVuZ3RoO2ErKyluW2FdPXBhcnNlSW50KHJbYV0pO3JldHVybiBufSxyZWFkQ29udGVudEFzRmxvYXRzOmZ1bmN0aW9uKHQpe2lmKCF0KXJldHVybiBudWxsO3ZhciBlPXQudGV4dENvbnRlbnQ7ZT1lLnJlcGxhY2UoL1xcbi9naSxcIiBcIiksZT1lLnJlcGxhY2UoL1xcc1xccysvZ2ksXCIgXCIpLGU9ZS5yZXBsYWNlKC9cXHQvZ2ksXCJcIiksZT1lLnRyaW0oKTtmb3IodmFyIHI9ZS5zcGxpdChcIiBcIiksbj10LmdldEF0dHJpYnV0ZShcImNvdW50XCIpLGE9bj9wYXJzZUludChuKTpyLmxlbmd0aCxpPW5ldyBGbG9hdDMyQXJyYXkoYSksdT0wO3U8ci5sZW5ndGg7dSsrKWlbdV09cGFyc2VGbG9hdChyW3VdKTtyZXR1cm4gaX0scmVhZENvbnRlbnRBc1N0cmluZ3NBcnJheTpmdW5jdGlvbih0KXtpZighdClyZXR1cm4gbnVsbDt2YXIgZT10LnRleHRDb250ZW50O2U9ZS5yZXBsYWNlKC9cXG4vZ2ksXCIgXCIpLGU9ZS5yZXBsYWNlKC9cXHNcXHMvZ2ksXCIgXCIpLGU9ZS50cmltKCk7Zm9yKHZhciByPWUuc3BsaXQoXCIgXCIpLG49MDtuPHIubGVuZ3RoO24rKylyW25dPXJbbl0udHJpbSgpO2lmKHQuZ2V0QXR0cmlidXRlKFwiY291bnRcIikmJnBhcnNlSW50KHQuZ2V0QXR0cmlidXRlKFwiY291bnRcIikpIT1yLmxlbmd0aCl7dmFyIGE9W10saT1cIlwiO2Zvcih2YXIgdSBpbiByKWk/aSs9XCIgXCIrclt1XTppPXJbdV0sdGhpcy5fbm9kZXNfYnlfaWRbdGhpcy5zYWZlU3RyaW5nKGkpXSYmKGEucHVzaCh0aGlzLnNhZmVTdHJpbmcoaSkpLGk9XCJcIik7dmFyIG89cGFyc2VJbnQodC5nZXRBdHRyaWJ1dGUoXCJjb3VudFwiKSk7cmV0dXJuIGEubGVuZ3RoPT1vP2E6KGNvbnNvbGUuZXJyb3IoXCJFcnJvcjogYm9uZSBuYW1lcyBoYXZlIHNwYWNlcywgYXZvaWQgdXNpbmcgc3BhY2VzIGluIG5hbWVzXCIpLG51bGwpfXJldHVybiByfSxtYXgzZF9tYXRyaXhfMDpuZXcgRmxvYXQzMkFycmF5KFswLC0xLDAsMCwwLDAsLTEsMCwxLDAsMCwtMCwwLDAsMCwxXSksdHJhbnNmb3JtTWF0cml4OmZ1bmN0aW9uKHQsZSxyKXtpZihpLm1hdDQudHJhbnNwb3NlKHQsdCksdGhpcy5ub19mbGlwKXJldHVybiB0O2lmKGUpe3ZhciBuPW5ldyBGbG9hdDMyQXJyYXkodC5zdWJhcnJheSg0LDgpKTt0LnNldCh0LnN1YmFycmF5KDgsMTIpLDQpLHQuc2V0KG4sOCksbj10LnN1YmFycmF5KDgsMTIpLHZlYzQuc2NhbGUobixuLC0xKX1lbHNle3ZhciBhPWkubWF0NC5jcmVhdGUoKSx1PXQ7YS5zZXQoW3VbMF0sdVsyXSwtdVsxXV0sMCksYS5zZXQoW3VbOF0sdVsxMF0sLXVbOV1dLDQpLGEuc2V0KFstdVs0XSwtdVs2XSx1WzVdXSw4KSxhLnNldChbdVsxMl0sdVsxNF0sLXVbMTNdXSwxMiksdS5zZXQoYSl9cmV0dXJuIHR9fTtlLmRlZmF1bHQ9ZCx0LmV4cG9ydHM9ZS5kZWZhdWx0fSkuY2FsbChlLGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KCkpfSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtyZXR1cm4gdCYmdC5fX2VzTW9kdWxlP3Q6e1wiZGVmYXVsdFwiOnR9fU9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBhPXIoMTIzKSxpPW4oYSksdT1yKDgpLG89ZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSh0KXt2YXIgZT12b2lkIDA7Zm9yKHZhciByIGluIG4pcj09PXQmJihlPW5bcl0pO3ZhciBhPXt9O3JldHVybiBlLmRpZmZ1c2UmJihhLmRpZmZ1c2VDb2xvcj1lLmRpZmZ1c2UpLFxuYS5kaWZmdXNlQ29sb3I9ZS5kaWZmdXNlfHxbMCwwLDBdLGEuc2hpbmluZXNzPWUuc2hpbmluZXNzfHwwLGUudGV4dHVyZXMmJihlLnRleHR1cmVzLmRpZmZ1c2UmJihhLmRpZmZ1c2VNYXBJRD1lLnRleHR1cmVzLmRpZmZ1c2UubWFwX2lkKSxlLnRleHR1cmVzLm5vcm1hbCYmKGEubm9ybWFsTWFwSUQ9ZS50ZXh0dXJlcy5ub3JtYWwubWFwX2lkKSksYX1mdW5jdGlvbiByKHQsbil7dmFyIG89dS5tYXQ0LmNyZWF0ZSgpO2lmKHQubW9kZWw/dS5tYXQ0Lm11bHRpcGx5KG8sbix0Lm1vZGVsKTp1Lm1hdDQuY29weShvLG4pLHQuY2hpbGRyZW4ubGVuZ3RoPjAmJnQuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbih0KXtyKHQsbyl9KSx0Lm1lc2gpe3ZhciBzPXt9O3MubW9kZWxNYXRyaXg9byxzLm1lc2g9YVt0Lm1lc2hdLHMuaWQ9dC5pZCxzLm5hbWU9dC5uYW1lLHMubWF0ZXJpYWw9ZSh0Lm1hdGVyaWFsKSxpLnB1c2gocyl9fXZhciBuPXQubWF0ZXJpYWxzLGE9dC5tZXNoZXMsaT1bXSxvPVtdO2Zvcih2YXIgcyBpbiBhKXt2YXIgbD1hW3NdLGY9bC52ZXJ0aWNlcyxoPWwubm9ybWFscyxjPWwuY29vcmRzLGQ9bC50cmlhbmdsZXMsdj17dmVydGljZXM6Zixub3JtYWxzOmgsY29vcmRzOmMsdHJpYW5nbGVzOmR9O28ucHVzaCh7aWQ6cyxidWZmZXJzOnZ9KX12YXIgXz11Lm1hdDQuY3JlYXRlKCk7cmV0dXJuIHIodC5yb290LF8pLGl9LHM9ZnVuY3Rpb24odCl7dmFyIGU9aS5kZWZhdWx0LnBhcnNlKHQpO3JldHVybiBvKGUpfSxsPWZ1bmN0aW9uKHQsZSl7aS5kZWZhdWx0LmxvYWQodCxmdW5jdGlvbih0KXtlKG8odCkpfSl9LGY9e2xvYWQ6bCxwYXJzZTpzfTtlLmRlZmF1bHQ9Zix0LmV4cG9ydHM9ZS5kZWZhdWx0fSxmdW5jdGlvbih0LGUscil7cigxNTApO3ZhciBuPXIoMTApLk9iamVjdDt0LmV4cG9ydHM9ZnVuY3Rpb24odCxlKXtyZXR1cm4gbi5jcmVhdGUodCxlKX19LGZ1bmN0aW9uKHQsZSxyKXtyKDE1MSk7dmFyIG49cigxMCkuT2JqZWN0O3QuZXhwb3J0cz1mdW5jdGlvbih0LGUscil7cmV0dXJuIG4uZGVmaW5lUHJvcGVydHkodCxlLHIpfX0sZnVuY3Rpb24odCxlLHIpe3IoMTUyKTt2YXIgbj1yKDEwKS5PYmplY3Q7dC5leHBvcnRzPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIG4uZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsZSl9fSxmdW5jdGlvbih0LGUscil7cigxNTMpLHQuZXhwb3J0cz1yKDEwKS5PYmplY3QuZ2V0UHJvdG90eXBlT2Z9LGZ1bmN0aW9uKHQsZSxyKXtyKDE1NCksdC5leHBvcnRzPXIoMTApLk9iamVjdC5zZXRQcm90b3R5cGVPZn0sZnVuY3Rpb24odCxlLHIpe3IoMTU3KSxyKDE1NSkscigxNTgpLHIoMTU5KSx0LmV4cG9ydHM9cigxMCkuU3ltYm9sfSxmdW5jdGlvbih0LGUscil7cigxNTYpLHIoMTYwKSx0LmV4cG9ydHM9cig1MikuZihcIml0ZXJhdG9yXCIpfSxmdW5jdGlvbih0LGUpe3QuZXhwb3J0cz1mdW5jdGlvbih0KXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0KXRocm93IFR5cGVFcnJvcih0K1wiIGlzIG5vdCBhIGZ1bmN0aW9uIVwiKTtyZXR1cm4gdH19LGZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPWZ1bmN0aW9uKCl7fX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoMTUpLGE9cigxNDgpLGk9cigxNDcpO3QuZXhwb3J0cz1mdW5jdGlvbih0KXtyZXR1cm4gZnVuY3Rpb24oZSxyLHUpe3ZhciBvLHM9bihlKSxsPWEocy5sZW5ndGgpLGY9aSh1LGwpO2lmKHQmJnIhPXIpe2Zvcig7bD5mOylpZihvPXNbZisrXSxvIT1vKXJldHVybiEwfWVsc2UgZm9yKDtsPmY7ZisrKWlmKCh0fHxmIGluIHMpJiZzW2ZdPT09cilyZXR1cm4gdHx8Znx8MDtyZXR1cm4hdCYmLTF9fX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoMjgpLGE9cig3MyksaT1yKDQ1KTt0LmV4cG9ydHM9ZnVuY3Rpb24odCl7dmFyIGU9bih0KSxyPWEuZjtpZihyKWZvcih2YXIgdSxvPXIodCkscz1pLmYsbD0wO28ubGVuZ3RoPmw7KXMuY2FsbCh0LHU9b1tsKytdKSYmZS5wdXNoKHUpO3JldHVybiBlfX0sZnVuY3Rpb24odCxlLHIpe3QuZXhwb3J0cz1yKDE0KS5kb2N1bWVudCYmZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50fSxmdW5jdGlvbih0LGUscil7dmFyIG49cig2Nyk7dC5leHBvcnRzPU9iamVjdChcInpcIikucHJvcGVydHlJc0VudW1lcmFibGUoMCk/T2JqZWN0OmZ1bmN0aW9uKHQpe3JldHVyblwiU3RyaW5nXCI9PW4odCk/dC5zcGxpdChcIlwiKTpPYmplY3QodCl9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cig2Nyk7dC5leHBvcnRzPUFycmF5LmlzQXJyYXl8fGZ1bmN0aW9uKHQpe3JldHVyblwiQXJyYXlcIj09bih0KX19LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjt2YXIgbj1yKDQzKSxhPXIoMjkpLGk9cig0NiksdT17fTtyKDIxKSh1LHIoMjIpKFwiaXRlcmF0b3JcIiksZnVuY3Rpb24oKXtyZXR1cm4gdGhpc30pLHQuZXhwb3J0cz1mdW5jdGlvbih0LGUscil7dC5wcm90b3R5cGU9bih1LHtuZXh0OmEoMSxyKX0pLGkodCxlK1wiIEl0ZXJhdG9yXCIpfX0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9ZnVuY3Rpb24odCxlKXtyZXR1cm57dmFsdWU6ZSxkb25lOiEhdH19fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigyOCksYT1yKDE1KTt0LmV4cG9ydHM9ZnVuY3Rpb24odCxlKXtmb3IodmFyIHIsaT1hKHQpLHU9bihpKSxvPXUubGVuZ3RoLHM9MDtvPnM7KWlmKGlbcj11W3MrK11dPT09ZSlyZXR1cm4gcn19LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDMwKShcIm1ldGFcIiksYT1yKDI2KSxpPXIoMTgpLHU9cigxOSkuZixvPTAscz1PYmplY3QuaXNFeHRlbnNpYmxlfHxmdW5jdGlvbigpe3JldHVybiEwfSxsPSFyKDI1KShmdW5jdGlvbigpe3JldHVybiBzKE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh7fSkpfSksZj1mdW5jdGlvbih0KXt1KHQsbix7dmFsdWU6e2k6XCJPXCIrICsrbyx3Ont9fX0pfSxoPWZ1bmN0aW9uKHQsZSl7aWYoIWEodCkpcmV0dXJuXCJzeW1ib2xcIj09dHlwZW9mIHQ/dDooXCJzdHJpbmdcIj09dHlwZW9mIHQ/XCJTXCI6XCJQXCIpK3Q7aWYoIWkodCxuKSl7aWYoIXModCkpcmV0dXJuXCJGXCI7aWYoIWUpcmV0dXJuXCJFXCI7Zih0KX1yZXR1cm4gdFtuXS5pfSxjPWZ1bmN0aW9uKHQsZSl7aWYoIWkodCxuKSl7aWYoIXModCkpcmV0dXJuITA7aWYoIWUpcmV0dXJuITE7Zih0KX1yZXR1cm4gdFtuXS53fSxkPWZ1bmN0aW9uKHQpe3JldHVybiBsJiZ2Lk5FRUQmJnModCkmJiFpKHQsbikmJmYodCksdH0sdj10LmV4cG9ydHM9e0tFWTpuLE5FRUQ6ITEsZmFzdEtleTpoLGdldFdlYWs6YyxvbkZyZWV6ZTpkfX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoMTkpLGE9cigyNCksaT1yKDI4KTt0LmV4cG9ydHM9cigxNyk/T2JqZWN0LmRlZmluZVByb3BlcnRpZXM6ZnVuY3Rpb24odCxlKXthKHQpO2Zvcih2YXIgcix1PWkoZSksbz11Lmxlbmd0aCxzPTA7bz5zOyluLmYodCxyPXVbcysrXSxlW3JdKTtyZXR1cm4gdH19LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDE1KSxhPXIoNzIpLmYsaT17fS50b1N0cmluZyx1PVwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3cmJndpbmRvdyYmT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM/T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMod2luZG93KTpbXSxvPWZ1bmN0aW9uKHQpe3RyeXtyZXR1cm4gYSh0KX1jYXRjaChlKXtyZXR1cm4gdS5zbGljZSgpfX07dC5leHBvcnRzLmY9ZnVuY3Rpb24odCl7cmV0dXJuIHUmJlwiW29iamVjdCBXaW5kb3ddXCI9PWkuY2FsbCh0KT9vKHQpOmEobih0KSl9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigyNiksYT1yKDI0KSxpPWZ1bmN0aW9uKHQsZSl7aWYoYSh0KSwhbihlKSYmbnVsbCE9PWUpdGhyb3cgVHlwZUVycm9yKGUrXCI6IGNhbid0IHNldCBhcyBwcm90b3R5cGUhXCIpfTt0LmV4cG9ydHM9e3NldDpPYmplY3Quc2V0UHJvdG90eXBlT2Z8fChcIl9fcHJvdG9fX1wiaW57fT9mdW5jdGlvbih0LGUsbil7dHJ5e249cig2OCkoRnVuY3Rpb24uY2FsbCxyKDQ0KS5mKE9iamVjdC5wcm90b3R5cGUsXCJfX3Byb3RvX19cIikuc2V0LDIpLG4odCxbXSksZT0hKHQgaW5zdGFuY2VvZiBBcnJheSl9Y2F0Y2goYSl7ZT0hMH1yZXR1cm4gZnVuY3Rpb24odCxyKXtyZXR1cm4gaSh0LHIpLGU/dC5fX3Byb3RvX189cjpuKHQsciksdH19KHt9LCExKTp2b2lkIDApLGNoZWNrOml9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cig0OSksYT1yKDM5KTt0LmV4cG9ydHM9ZnVuY3Rpb24odCl7cmV0dXJuIGZ1bmN0aW9uKGUscil7dmFyIGksdSxvPVN0cmluZyhhKGUpKSxzPW4ociksbD1vLmxlbmd0aDtyZXR1cm4gMD5zfHxzPj1sP3Q/XCJcIjp2b2lkIDA6KGk9by5jaGFyQ29kZUF0KHMpLDU1Mjk2Pml8fGk+NTYzMTl8fHMrMT09PWx8fCh1PW8uY2hhckNvZGVBdChzKzEpKTw1NjMyMHx8dT41NzM0Mz90P28uY2hhckF0KHMpOmk6dD9vLnNsaWNlKHMscysyKTooaS01NTI5Njw8MTApKyh1LTU2MzIwKSs2NTUzNil9fX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoNDkpLGE9TWF0aC5tYXgsaT1NYXRoLm1pbjt0LmV4cG9ydHM9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdD1uKHQpLDA+dD9hKHQrZSwwKTppKHQsZSl9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cig0OSksYT1NYXRoLm1pbjt0LmV4cG9ydHM9ZnVuY3Rpb24odCl7cmV0dXJuIHQ+MD9hKG4odCksOTAwNzE5OTI1NDc0MDk5MSk6MH19LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjt2YXIgbj1yKDEzMyksYT1yKDE0MCksaT1yKDQxKSx1PXIoMTUpO3QuZXhwb3J0cz1yKDcxKShBcnJheSxcIkFycmF5XCIsZnVuY3Rpb24odCxlKXt0aGlzLl90PXUodCksdGhpcy5faT0wLHRoaXMuX2s9ZX0sZnVuY3Rpb24oKXt2YXIgdD10aGlzLl90LGU9dGhpcy5fayxyPXRoaXMuX2krKztyZXR1cm4hdHx8cj49dC5sZW5ndGg/KHRoaXMuX3Q9dm9pZCAwLGEoMSkpOlwia2V5c1wiPT1lP2EoMCxyKTpcInZhbHVlc1wiPT1lP2EoMCx0W3JdKTphKDAsW3IsdFtyXV0pfSxcInZhbHVlc1wiKSxpLkFyZ3VtZW50cz1pLkFycmF5LG4oXCJrZXlzXCIpLG4oXCJ2YWx1ZXNcIiksbihcImVudHJpZXNcIil9LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDIwKTtuKG4uUyxcIk9iamVjdFwiLHtjcmVhdGU6cig0Myl9KX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoMjApO24obi5TK24uRiohcigxNyksXCJPYmplY3RcIix7ZGVmaW5lUHJvcGVydHk6cigxOSkuZn0pfSxmdW5jdGlvbih0LGUscil7dmFyIG49cigxNSksYT1yKDQ0KS5mO3IoNzYpKFwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yXCIsZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24odCxlKXtyZXR1cm4gYShuKHQpLGUpfX0pfSxmdW5jdGlvbih0LGUscil7dmFyIG49cig3OCksYT1yKDc0KTtyKDc2KShcImdldFByb3RvdHlwZU9mXCIsZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIGEobih0KSl9fSl9LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDIwKTtuKG4uUyxcIk9iamVjdFwiLHtzZXRQcm90b3R5cGVPZjpyKDE0NSkuc2V0fSl9LGZ1bmN0aW9uKHQsZSl7fSxmdW5jdGlvbih0LGUscil7XCJ1c2Ugc3RyaWN0XCI7dmFyIG49cigxNDYpKCEwKTtyKDcxKShTdHJpbmcsXCJTdHJpbmdcIixmdW5jdGlvbih0KXt0aGlzLl90PVN0cmluZyh0KSx0aGlzLl9pPTB9LGZ1bmN0aW9uKCl7dmFyIHQsZT10aGlzLl90LHI9dGhpcy5faTtyZXR1cm4gcj49ZS5sZW5ndGg/e3ZhbHVlOnZvaWQgMCxkb25lOiEwfToodD1uKGUsciksdGhpcy5faSs9dC5sZW5ndGgse3ZhbHVlOnQsZG9uZTohMX0pfSl9LGZ1bmN0aW9uKHQsZSxyKXtcInVzZSBzdHJpY3RcIjt2YXIgbj1yKDE0KSxhPXIoMTgpLGk9cigxNyksdT1yKDIwKSxvPXIoNzcpLHM9cigxNDIpLktFWSxsPXIoMjUpLGY9cig0OCksaD1yKDQ2KSxjPXIoMzApLGQ9cigyMiksdj1yKDUyKSxfPXIoNTEpLG09cigxNDEpLHA9cigxMzUpLE09cigxMzgpLHg9cigyNCksZz1yKDE1KSxFPXIoNTApLGI9cigyOSkseT1yKDQzKSxTPXIoMTQ0KSxUPXIoNDQpLEk9cigxOSksQT1yKDI4KSxGPVQuZixEPUkuZixSPVMuZix3PW4uU3ltYm9sLFA9bi5KU09OLE49UCYmUC5zdHJpbmdpZnksTz1cInByb3RvdHlwZVwiLEw9ZChcIl9oaWRkZW5cIiksaz1kKFwidG9QcmltaXRpdmVcIiksQz17fS5wcm9wZXJ0eUlzRW51bWVyYWJsZSxVPWYoXCJzeW1ib2wtcmVnaXN0cnlcIiksQj1mKFwic3ltYm9sc1wiKSxYPWYoXCJvcC1zeW1ib2xzXCIpLHE9T2JqZWN0W09dLFY9XCJmdW5jdGlvblwiPT10eXBlb2Ygdyx6PW4uUU9iamVjdCxqPSF6fHwheltPXXx8IXpbT10uZmluZENoaWxkLEc9aSYmbChmdW5jdGlvbigpe3JldHVybiA3IT15KEQoe30sXCJhXCIse2dldDpmdW5jdGlvbigpe3JldHVybiBEKHRoaXMsXCJhXCIse3ZhbHVlOjd9KS5hfX0pKS5hfSk/ZnVuY3Rpb24odCxlLHIpe3ZhciBuPUYocSxlKTtuJiZkZWxldGUgcVtlXSxEKHQsZSxyKSxuJiZ0IT09cSYmRChxLGUsbil9OkQsWT1mdW5jdGlvbih0KXt2YXIgZT1CW3RdPXkod1tPXSk7cmV0dXJuIGUuX2s9dCxlfSxXPVYmJlwic3ltYm9sXCI9PXR5cGVvZiB3Lml0ZXJhdG9yP2Z1bmN0aW9uKHQpe3JldHVyblwic3ltYm9sXCI9PXR5cGVvZiB0fTpmdW5jdGlvbih0KXtyZXR1cm4gdCBpbnN0YW5jZW9mIHd9LEg9ZnVuY3Rpb24odCxlLHIpe3JldHVybiB0PT09cSYmSChYLGUscikseCh0KSxlPUUoZSwhMCkseChyKSxhKEIsZSk/KHIuZW51bWVyYWJsZT8oYSh0LEwpJiZ0W0xdW2VdJiYodFtMXVtlXT0hMSkscj15KHIse2VudW1lcmFibGU6YigwLCExKX0pKTooYSh0LEwpfHxEKHQsTCxiKDEse30pKSx0W0xdW2VdPSEwKSxHKHQsZSxyKSk6RCh0LGUscil9LFo9ZnVuY3Rpb24odCxlKXt4KHQpO2Zvcih2YXIgcixuPXAoZT1nKGUpKSxhPTAsaT1uLmxlbmd0aDtpPmE7KUgodCxyPW5bYSsrXSxlW3JdKTtyZXR1cm4gdH0sUT1mdW5jdGlvbih0LGUpe3JldHVybiB2b2lkIDA9PT1lP3kodCk6Wih5KHQpLGUpfSxLPWZ1bmN0aW9uKHQpe3ZhciBlPUMuY2FsbCh0aGlzLHQ9RSh0LCEwKSk7cmV0dXJuIHRoaXM9PT1xJiZhKEIsdCkmJiFhKFgsdCk/ITE6ZXx8IWEodGhpcyx0KXx8IWEoQix0KXx8YSh0aGlzLEwpJiZ0aGlzW0xdW3RdP2U6ITB9LEo9ZnVuY3Rpb24odCxlKXtpZih0PWcodCksZT1FKGUsITApLHQhPT1xfHwhYShCLGUpfHxhKFgsZSkpe3ZhciByPUYodCxlKTtyZXR1cm4hcnx8IWEoQixlKXx8YSh0LEwpJiZ0W0xdW2VdfHwoci5lbnVtZXJhYmxlPSEwKSxyfX0sJD1mdW5jdGlvbih0KXtmb3IodmFyIGUscj1SKGcodCkpLG49W10saT0wO3IubGVuZ3RoPmk7KWEoQixlPXJbaSsrXSl8fGU9PUx8fGU9PXN8fG4ucHVzaChlKTtyZXR1cm4gbn0sdHQ9ZnVuY3Rpb24odCl7Zm9yKHZhciBlLHI9dD09PXEsbj1SKHI/WDpnKHQpKSxpPVtdLHU9MDtuLmxlbmd0aD51OylhKEIsZT1uW3UrK10pJiYocj9hKHEsZSk6ITApJiZpLnB1c2goQltlXSk7cmV0dXJuIGl9O1Z8fCh3PWZ1bmN0aW9uKCl7aWYodGhpcyBpbnN0YW5jZW9mIHcpdGhyb3cgVHlwZUVycm9yKFwiU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yIVwiKTt2YXIgdD1jKGFyZ3VtZW50cy5sZW5ndGg+MD9hcmd1bWVudHNbMF06dm9pZCAwKSxlPWZ1bmN0aW9uKHIpe3RoaXM9PT1xJiZlLmNhbGwoWCxyKSxhKHRoaXMsTCkmJmEodGhpc1tMXSx0KSYmKHRoaXNbTF1bdF09ITEpLEcodGhpcyx0LGIoMSxyKSl9O3JldHVybiBpJiZqJiZHKHEsdCx7Y29uZmlndXJhYmxlOiEwLHNldDplfSksWSh0KX0sbyh3W09dLFwidG9TdHJpbmdcIixmdW5jdGlvbigpe3JldHVybiB0aGlzLl9rfSksVC5mPUosSS5mPUgscig3MikuZj1TLmY9JCxyKDQ1KS5mPUsscig3MykuZj10dCxpJiYhcig0MikmJm8ocSxcInByb3BlcnR5SXNFbnVtZXJhYmxlXCIsSywhMCksdi5mPWZ1bmN0aW9uKHQpe3JldHVybiBZKGQodCkpfSksdSh1LkcrdS5XK3UuRiohVix7U3ltYm9sOnd9KTtmb3IodmFyIGV0PVwiaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLHNwZWNpZXMsc3BsaXQsdG9QcmltaXRpdmUsdG9TdHJpbmdUYWcsdW5zY29wYWJsZXNcIi5zcGxpdChcIixcIikscnQ9MDtldC5sZW5ndGg+cnQ7KWQoZXRbcnQrK10pO2Zvcih2YXIgZXQ9QShkLnN0b3JlKSxydD0wO2V0Lmxlbmd0aD5ydDspXyhldFtydCsrXSk7dSh1LlMrdS5GKiFWLFwiU3ltYm9sXCIse1wiZm9yXCI6ZnVuY3Rpb24odCl7cmV0dXJuIGEoVSx0Kz1cIlwiKT9VW3RdOlVbdF09dyh0KX0sa2V5Rm9yOmZ1bmN0aW9uKHQpe2lmKFcodCkpcmV0dXJuIG0oVSx0KTt0aHJvdyBUeXBlRXJyb3IodCtcIiBpcyBub3QgYSBzeW1ib2whXCIpfSx1c2VTZXR0ZXI6ZnVuY3Rpb24oKXtqPSEwfSx1c2VTaW1wbGU6ZnVuY3Rpb24oKXtqPSExfX0pLHUodS5TK3UuRiohVixcIk9iamVjdFwiLHtjcmVhdGU6USxkZWZpbmVQcm9wZXJ0eTpILGRlZmluZVByb3BlcnRpZXM6WixnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6SixnZXRPd25Qcm9wZXJ0eU5hbWVzOiQsZ2V0T3duUHJvcGVydHlTeW1ib2xzOnR0fSksUCYmdSh1LlMrdS5GKighVnx8bChmdW5jdGlvbigpe3ZhciB0PXcoKTtyZXR1cm5cIltudWxsXVwiIT1OKFt0XSl8fFwie31cIiE9Tih7YTp0fSl8fFwie31cIiE9TihPYmplY3QodCkpfSkpLFwiSlNPTlwiLHtzdHJpbmdpZnk6ZnVuY3Rpb24odCl7aWYodm9pZCAwIT09dCYmIVcodCkpe2Zvcih2YXIgZSxyLG49W3RdLGE9MTthcmd1bWVudHMubGVuZ3RoPmE7KW4ucHVzaChhcmd1bWVudHNbYSsrXSk7cmV0dXJuIGU9blsxXSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBlJiYocj1lKSwhciYmTShlKXx8KGU9ZnVuY3Rpb24odCxlKXtyZXR1cm4gciYmKGU9ci5jYWxsKHRoaXMsdCxlKSksVyhlKT92b2lkIDA6ZX0pLG5bMV09ZSxOLmFwcGx5KFAsbil9fX0pLHdbT11ba118fHIoMjEpKHdbT10sayx3W09dLnZhbHVlT2YpLGgodyxcIlN5bWJvbFwiKSxoKE1hdGgsXCJNYXRoXCIsITApLGgobi5KU09OLFwiSlNPTlwiLCEwKX0sZnVuY3Rpb24odCxlLHIpe3IoNTEpKFwiYXN5bmNJdGVyYXRvclwiKX0sZnVuY3Rpb24odCxlLHIpe3IoNTEpKFwib2JzZXJ2YWJsZVwiKX0sZnVuY3Rpb24odCxlLHIpe3IoMTQ5KTtmb3IodmFyIG49cigxNCksYT1yKDIxKSxpPXIoNDEpLHU9cigyMikoXCJ0b1N0cmluZ1RhZ1wiKSxvPVtcIk5vZGVMaXN0XCIsXCJET01Ub2tlbkxpc3RcIixcIk1lZGlhTGlzdFwiLFwiU3R5bGVTaGVldExpc3RcIixcIkNTU1J1bGVMaXN0XCJdLHM9MDs1PnM7cysrKXt2YXIgbD1vW3NdLGY9bltsXSxoPWYmJmYucHJvdG90eXBlO2gmJiFoW3VdJiZhKGgsdSxsKSxpW2xdPWkuQXJyYXl9fSxmdW5jdGlvbih0LGUscil7dmFyIG49cigxMSksYT17fTthLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciB0PW5ldyBuLkFSUkFZX1RZUEUoNCk7cmV0dXJuIHRbMF09MSx0WzFdPTAsdFsyXT0wLHRbM109MSx0fSxhLmNsb25lPWZ1bmN0aW9uKHQpe3ZhciBlPW5ldyBuLkFSUkFZX1RZUEUoNCk7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlfSxhLmNvcHk9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHR9LGEuaWRlbnRpdHk9ZnVuY3Rpb24odCl7cmV0dXJuIHRbMF09MSx0WzFdPTAsdFsyXT0wLHRbM109MSx0fSxhLmZyb21WYWx1ZXM9ZnVuY3Rpb24odCxlLHIsYSl7dmFyIGk9bmV3IG4uQVJSQVlfVFlQRSg0KTtyZXR1cm4gaVswXT10LGlbMV09ZSxpWzJdPXIsaVszXT1hLGl9LGEuc2V0PWZ1bmN0aW9uKHQsZSxyLG4sYSl7cmV0dXJuIHRbMF09ZSx0WzFdPXIsdFsyXT1uLHRbM109YSx0fSxhLnRyYW5zcG9zZT1mdW5jdGlvbih0LGUpe2lmKHQ9PT1lKXt2YXIgcj1lWzFdO3RbMV09ZVsyXSx0WzJdPXJ9ZWxzZSB0WzBdPWVbMF0sdFsxXT1lWzJdLHRbMl09ZVsxXSx0WzNdPWVbM107cmV0dXJuIHR9LGEuaW52ZXJ0PWZ1bmN0aW9uKHQsZSl7dmFyIHI9ZVswXSxuPWVbMV0sYT1lWzJdLGk9ZVszXSx1PXIqaS1hKm47cmV0dXJuIHU/KHU9MS91LHRbMF09aSp1LHRbMV09LW4qdSx0WzJdPS1hKnUsdFszXT1yKnUsdCk6bnVsbH0sYS5hZGpvaW50PWZ1bmN0aW9uKHQsZSl7dmFyIHI9ZVswXTtyZXR1cm4gdFswXT1lWzNdLHRbMV09LWVbMV0sdFsyXT0tZVsyXSx0WzNdPXIsdH0sYS5kZXRlcm1pbmFudD1mdW5jdGlvbih0KXtyZXR1cm4gdFswXSp0WzNdLXRbMl0qdFsxXX0sYS5tdWx0aXBseT1mdW5jdGlvbih0LGUscil7dmFyIG49ZVswXSxhPWVbMV0saT1lWzJdLHU9ZVszXSxvPXJbMF0scz1yWzFdLGw9clsyXSxmPXJbM107cmV0dXJuIHRbMF09bipvK2kqcyx0WzFdPWEqbyt1KnMsdFsyXT1uKmwraSpmLHRbM109YSpsK3UqZix0fSxhLm11bD1hLm11bHRpcGx5LGEucm90YXRlPWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1lWzBdLGE9ZVsxXSxpPWVbMl0sdT1lWzNdLG89TWF0aC5zaW4ocikscz1NYXRoLmNvcyhyKTtyZXR1cm4gdFswXT1uKnMraSpvLHRbMV09YSpzK3Uqbyx0WzJdPW4qLW8raSpzLHRbM109YSotbyt1KnMsdH0sYS5zY2FsZT1mdW5jdGlvbih0LGUscil7dmFyIG49ZVswXSxhPWVbMV0saT1lWzJdLHU9ZVszXSxvPXJbMF0scz1yWzFdO3JldHVybiB0WzBdPW4qbyx0WzFdPWEqbyx0WzJdPWkqcyx0WzNdPXUqcyx0fSxhLmZyb21Sb3RhdGlvbj1mdW5jdGlvbih0LGUpe3ZhciByPU1hdGguc2luKGUpLG49TWF0aC5jb3MoZSk7cmV0dXJuIHRbMF09bix0WzFdPXIsdFsyXT0tcix0WzNdPW4sdH0sYS5mcm9tU2NhbGluZz1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPWVbMF0sdFsxXT0wLHRbMl09MCx0WzNdPWVbMV0sdH0sYS5zdHI9ZnVuY3Rpb24odCl7cmV0dXJuXCJtYXQyKFwiK3RbMF0rXCIsIFwiK3RbMV0rXCIsIFwiK3RbMl0rXCIsIFwiK3RbM10rXCIpXCJ9LGEuZnJvYj1mdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHRbMF0sMikrTWF0aC5wb3codFsxXSwyKStNYXRoLnBvdyh0WzJdLDIpK01hdGgucG93KHRbM10sMikpfSxhLkxEVT1mdW5jdGlvbih0LGUscixuKXtyZXR1cm4gdFsyXT1uWzJdL25bMF0sclswXT1uWzBdLHJbMV09blsxXSxyWzNdPW5bM10tdFsyXSpyWzFdLFt0LGUscl19LGEuYWRkPWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdK3JbMF0sdFsxXT1lWzFdK3JbMV0sdFsyXT1lWzJdK3JbMl0sdFszXT1lWzNdK3JbM10sdH0sYS5zdWJ0cmFjdD1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09ZVswXS1yWzBdLHRbMV09ZVsxXS1yWzFdLHRbMl09ZVsyXS1yWzJdLHRbM109ZVszXS1yWzNdLHR9LGEuc3ViPWEuc3VidHJhY3QsYS5leGFjdEVxdWFscz1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPT09ZVswXSYmdFsxXT09PWVbMV0mJnRbMl09PT1lWzJdJiZ0WzNdPT09ZVszXX0sYS5lcXVhbHM9ZnVuY3Rpb24odCxlKXt2YXIgcj10WzBdLGE9dFsxXSxpPXRbMl0sdT10WzNdLG89ZVswXSxzPWVbMV0sbD1lWzJdLGY9ZVszXTtyZXR1cm4gTWF0aC5hYnMoci1vKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMociksTWF0aC5hYnMobykpJiZNYXRoLmFicyhhLXMpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhhKSxNYXRoLmFicyhzKSkmJk1hdGguYWJzKGktbCk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKGkpLE1hdGguYWJzKGwpKSYmTWF0aC5hYnModS1mKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnModSksTWF0aC5hYnMoZikpfSxhLm11bHRpcGx5U2NhbGFyPWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdKnIsdFsxXT1lWzFdKnIsdFsyXT1lWzJdKnIsdFszXT1lWzNdKnIsdH0sYS5tdWx0aXBseVNjYWxhckFuZEFkZD1mdW5jdGlvbih0LGUscixuKXtyZXR1cm4gdFswXT1lWzBdK3JbMF0qbix0WzFdPWVbMV0rclsxXSpuLHRbMl09ZVsyXStyWzJdKm4sdFszXT1lWzNdK3JbM10qbix0fSx0LmV4cG9ydHM9YX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoMTEpLGE9e307YS5jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgdD1uZXcgbi5BUlJBWV9UWVBFKDYpO3JldHVybiB0WzBdPTEsdFsxXT0wLHRbMl09MCx0WzNdPTEsdFs0XT0wLHRbNV09MCx0fSxhLmNsb25lPWZ1bmN0aW9uKHQpe3ZhciBlPW5ldyBuLkFSUkFZX1RZUEUoNik7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZVsyXT10WzJdLGVbM109dFszXSxlWzRdPXRbNF0sZVs1XT10WzVdLGV9LGEuY29weT1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdFs0XT1lWzRdLHRbNV09ZVs1XSx0fSxhLmlkZW50aXR5PWZ1bmN0aW9uKHQpe3JldHVybiB0WzBdPTEsdFsxXT0wLHRbMl09MCx0WzNdPTEsdFs0XT0wLHRbNV09MCx0fSxhLmZyb21WYWx1ZXM9ZnVuY3Rpb24odCxlLHIsYSxpLHUpe3ZhciBvPW5ldyBuLkFSUkFZX1RZUEUoNik7cmV0dXJuIG9bMF09dCxvWzFdPWUsb1syXT1yLG9bM109YSxvWzRdPWksb1s1XT11LG99LGEuc2V0PWZ1bmN0aW9uKHQsZSxyLG4sYSxpLHUpe3JldHVybiB0WzBdPWUsdFsxXT1yLHRbMl09bix0WzNdPWEsdFs0XT1pLHRbNV09dSx0fSxhLmludmVydD1mdW5jdGlvbih0LGUpe3ZhciByPWVbMF0sbj1lWzFdLGE9ZVsyXSxpPWVbM10sdT1lWzRdLG89ZVs1XSxzPXIqaS1uKmE7cmV0dXJuIHM/KHM9MS9zLHRbMF09aSpzLHRbMV09LW4qcyx0WzJdPS1hKnMsdFszXT1yKnMsdFs0XT0oYSpvLWkqdSkqcyx0WzVdPShuKnUtcipvKSpzLHQpOm51bGx9LGEuZGV0ZXJtaW5hbnQ9ZnVuY3Rpb24odCl7cmV0dXJuIHRbMF0qdFszXS10WzFdKnRbMl19LGEubXVsdGlwbHk9ZnVuY3Rpb24odCxlLHIpe3ZhciBuPWVbMF0sYT1lWzFdLGk9ZVsyXSx1PWVbM10sbz1lWzRdLHM9ZVs1XSxsPXJbMF0sZj1yWzFdLGg9clsyXSxjPXJbM10sZD1yWzRdLHY9cls1XTtyZXR1cm4gdFswXT1uKmwraSpmLHRbMV09YSpsK3UqZix0WzJdPW4qaCtpKmMsdFszXT1hKmgrdSpjLHRbNF09bipkK2kqditvLHRbNV09YSpkK3UqditzLHR9LGEubXVsPWEubXVsdGlwbHksYS5yb3RhdGU9ZnVuY3Rpb24odCxlLHIpe3ZhciBuPWVbMF0sYT1lWzFdLGk9ZVsyXSx1PWVbM10sbz1lWzRdLHM9ZVs1XSxsPU1hdGguc2luKHIpLGY9TWF0aC5jb3Mocik7cmV0dXJuIHRbMF09bipmK2kqbCx0WzFdPWEqZit1KmwsdFsyXT1uKi1sK2kqZix0WzNdPWEqLWwrdSpmLHRbNF09byx0WzVdPXMsdH0sYS5zY2FsZT1mdW5jdGlvbih0LGUscil7dmFyIG49ZVswXSxhPWVbMV0saT1lWzJdLHU9ZVszXSxvPWVbNF0scz1lWzVdLGw9clswXSxmPXJbMV07cmV0dXJuIHRbMF09bipsLHRbMV09YSpsLHRbMl09aSpmLHRbM109dSpmLHRbNF09byx0WzVdPXMsdH0sYS50cmFuc2xhdGU9ZnVuY3Rpb24odCxlLHIpe3ZhciBuPWVbMF0sYT1lWzFdLGk9ZVsyXSx1PWVbM10sbz1lWzRdLHM9ZVs1XSxsPXJbMF0sZj1yWzFdO3JldHVybiB0WzBdPW4sdFsxXT1hLHRbMl09aSx0WzNdPXUsdFs0XT1uKmwraSpmK28sdFs1XT1hKmwrdSpmK3MsdH0sYS5mcm9tUm90YXRpb249ZnVuY3Rpb24odCxlKXt2YXIgcj1NYXRoLnNpbihlKSxuPU1hdGguY29zKGUpO3JldHVybiB0WzBdPW4sdFsxXT1yLHRbMl09LXIsdFszXT1uLHRbNF09MCx0WzVdPTAsdH0sYS5mcm9tU2NhbGluZz1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPWVbMF0sdFsxXT0wLHRbMl09MCx0WzNdPWVbMV0sdFs0XT0wLHRbNV09MCx0fSxhLmZyb21UcmFuc2xhdGlvbj1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPTEsdFsxXT0wLHRbMl09MCx0WzNdPTEsdFs0XT1lWzBdLHRbNV09ZVsxXSx0fSxhLnN0cj1mdW5jdGlvbih0KXtyZXR1cm5cIm1hdDJkKFwiK3RbMF0rXCIsIFwiK3RbMV0rXCIsIFwiK3RbMl0rXCIsIFwiK3RbM10rXCIsIFwiK3RbNF0rXCIsIFwiK3RbNV0rXCIpXCJ9LGEuZnJvYj1mdW5jdGlvbih0KXtyZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHRbMF0sMikrTWF0aC5wb3codFsxXSwyKStNYXRoLnBvdyh0WzJdLDIpK01hdGgucG93KHRbM10sMikrTWF0aC5wb3codFs0XSwyKStNYXRoLnBvdyh0WzVdLDIpKzEpfSxhLmFkZD1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09ZVswXStyWzBdLHRbMV09ZVsxXStyWzFdLHRbMl09ZVsyXStyWzJdLHRbM109ZVszXStyWzNdLHRbNF09ZVs0XStyWzRdLHRbNV09ZVs1XStyWzVdLHR9LGEuc3VidHJhY3Q9ZnVuY3Rpb24odCxlLHIpe3JldHVybiB0WzBdPWVbMF0tclswXSx0WzFdPWVbMV0tclsxXSx0WzJdPWVbMl0tclsyXSx0WzNdPWVbM10tclszXSx0WzRdPWVbNF0tcls0XSx0WzVdPWVbNV0tcls1XSx0fSxhLnN1Yj1hLnN1YnRyYWN0LGEubXVsdGlwbHlTY2FsYXI9ZnVuY3Rpb24odCxlLHIpe3JldHVybiB0WzBdPWVbMF0qcix0WzFdPWVbMV0qcix0WzJdPWVbMl0qcix0WzNdPWVbM10qcix0WzRdPWVbNF0qcix0WzVdPWVbNV0qcix0fSxhLm11bHRpcGx5U2NhbGFyQW5kQWRkPWZ1bmN0aW9uKHQsZSxyLG4pe3JldHVybiB0WzBdPWVbMF0rclswXSpuLHRbMV09ZVsxXStyWzFdKm4sdFsyXT1lWzJdK3JbMl0qbix0WzNdPWVbM10rclszXSpuLHRbNF09ZVs0XStyWzRdKm4sdFs1XT1lWzVdK3JbNV0qbix0fSxhLmV4YWN0RXF1YWxzPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09PT1lWzBdJiZ0WzFdPT09ZVsxXSYmdFsyXT09PWVbMl0mJnRbM109PT1lWzNdJiZ0WzRdPT09ZVs0XSYmdFs1XT09PWVbNV19LGEuZXF1YWxzPWZ1bmN0aW9uKHQsZSl7dmFyIHI9dFswXSxhPXRbMV0saT10WzJdLHU9dFszXSxvPXRbNF0scz10WzVdLGw9ZVswXSxmPWVbMV0saD1lWzJdLGM9ZVszXSxkPWVbNF0sdj1lWzVdO3JldHVybiBNYXRoLmFicyhyLWwpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhyKSxNYXRoLmFicyhsKSkmJk1hdGguYWJzKGEtZik8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKGEpLE1hdGguYWJzKGYpKSYmTWF0aC5hYnMoaS1oKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMoaSksTWF0aC5hYnMoaCkpJiZNYXRoLmFicyh1LWMpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyh1KSxNYXRoLmFicyhjKSkmJk1hdGguYWJzKG8tZCk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKG8pLE1hdGguYWJzKGQpKSYmTWF0aC5hYnMocy12KTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMocyksTWF0aC5hYnModikpfSx0LmV4cG9ydHM9YX0sZnVuY3Rpb24odCxlLHIpe3ZhciBuPXIoMTEpLGE9e3NjYWxhcjp7fSxTSU1EOnt9fTthLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciB0PW5ldyBuLkFSUkFZX1RZUEUoMTYpO3JldHVybiB0WzBdPTEsdFsxXT0wLHRbMl09MCx0WzNdPTAsdFs0XT0wLHRbNV09MSx0WzZdPTAsdFs3XT0wLHRbOF09MCx0WzldPTAsdFsxMF09MSx0WzExXT0wLHRbMTJdPTAsdFsxM109MCx0WzE0XT0wLHRbMTVdPTEsdH0sYS5jbG9uZT1mdW5jdGlvbih0KXt2YXIgZT1uZXcgbi5BUlJBWV9UWVBFKDE2KTtyZXR1cm4gZVswXT10WzBdLGVbMV09dFsxXSxlWzJdPXRbMl0sZVszXT10WzNdLGVbNF09dFs0XSxlWzVdPXRbNV0sZVs2XT10WzZdLGVbN109dFs3XSxlWzhdPXRbOF0sZVs5XT10WzldLGVbMTBdPXRbMTBdLGVbMTFdPXRbMTFdLGVbMTJdPXRbMTJdLGVbMTNdPXRbMTNdLGVbMTRdPXRbMTRdLGVbMTVdPXRbMTVdLGV9LGEuY29weT1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdFs0XT1lWzRdLHRbNV09ZVs1XSx0WzZdPWVbNl0sdFs3XT1lWzddLHRbOF09ZVs4XSx0WzldPWVbOV0sdFsxMF09ZVsxMF0sdFsxMV09ZVsxMV0sdFsxMl09ZVsxMl0sdFsxM109ZVsxM10sdFsxNF09ZVsxNF0sdFsxNV09ZVsxNV0sdH0sYS5mcm9tVmFsdWVzPWZ1bmN0aW9uKHQsZSxyLGEsaSx1LG8scyxsLGYsaCxjLGQsdixfLG0pe3ZhciBwPW5ldyBuLkFSUkFZX1RZUEUoMTYpO3JldHVybiBwWzBdPXQscFsxXT1lLHBbMl09cixwWzNdPWEscFs0XT1pLHBbNV09dSxwWzZdPW8scFs3XT1zLHBbOF09bCxwWzldPWYscFsxMF09aCxwWzExXT1jLHBbMTJdPWQscFsxM109dixwWzE0XT1fLHBbMTVdPW0scH0sYS5zZXQ9ZnVuY3Rpb24odCxlLHIsbixhLGksdSxvLHMsbCxmLGgsYyxkLHYsXyxtKXtyZXR1cm4gdFswXT1lLHRbMV09cix0WzJdPW4sdFszXT1hLHRbNF09aSx0WzVdPXUsdFs2XT1vLHRbN109cyx0WzhdPWwsdFs5XT1mLHRbMTBdPWgsdFsxMV09Yyx0WzEyXT1kLHRbMTNdPXYsdFsxNF09Xyx0WzE1XT1tLHR9LGEuaWRlbnRpdHk9ZnVuY3Rpb24odCl7cmV0dXJuIHRbMF09MSx0WzFdPTAsdFsyXT0wLHRbM109MCx0WzRdPTAsdFs1XT0xLHRbNl09MCx0WzddPTAsdFs4XT0wLHRbOV09MCx0WzEwXT0xLHRbMTFdPTAsdFsxMl09MCx0WzEzXT0wLHRbMTRdPTAsdFsxNV09MSx0fSxhLnNjYWxhci50cmFuc3Bvc2U9ZnVuY3Rpb24odCxlKXtpZih0PT09ZSl7dmFyIHI9ZVsxXSxuPWVbMl0sYT1lWzNdLGk9ZVs2XSx1PWVbN10sbz1lWzExXTt0WzFdPWVbNF0sdFsyXT1lWzhdLHRbM109ZVsxMl0sdFs0XT1yLHRbNl09ZVs5XSx0WzddPWVbMTNdLHRbOF09bix0WzldPWksdFsxMV09ZVsxNF0sdFsxMl09YSx0WzEzXT11LHRbMTRdPW99ZWxzZSB0WzBdPWVbMF0sdFsxXT1lWzRdLHRbMl09ZVs4XSx0WzNdPWVbMTJdLHRbNF09ZVsxXSx0WzVdPWVbNV0sdFs2XT1lWzldLHRbN109ZVsxM10sdFs4XT1lWzJdLHRbOV09ZVs2XSx0WzEwXT1lWzEwXSx0WzExXT1lWzE0XSx0WzEyXT1lWzNdLHRbMTNdPWVbN10sdFsxNF09ZVsxMV0sdFsxNV09ZVsxNV07cmV0dXJuIHR9LGEuU0lNRC50cmFuc3Bvc2U9ZnVuY3Rpb24odCxlKXt2YXIgcixuLGEsaSx1LG8scyxsLGYsaDtyZXR1cm4gcj1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsMCksbj1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsNCksYT1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsOCksaT1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsMTIpLHU9U0lNRC5GbG9hdDMyeDQuc2h1ZmZsZShyLG4sMCwxLDQsNSksbz1TSU1ELkZsb2F0MzJ4NC5zaHVmZmxlKGEsaSwwLDEsNCw1KSxzPVNJTUQuRmxvYXQzMng0LnNodWZmbGUodSxvLDAsMiw0LDYpLGw9U0lNRC5GbG9hdDMyeDQuc2h1ZmZsZSh1LG8sMSwzLDUsNyksU0lNRC5GbG9hdDMyeDQuc3RvcmUodCwwLHMpLFNJTUQuRmxvYXQzMng0LnN0b3JlKHQsNCxsKSx1PVNJTUQuRmxvYXQzMng0LnNodWZmbGUocixuLDIsMyw2LDcpLG89U0lNRC5GbG9hdDMyeDQuc2h1ZmZsZShhLGksMiwzLDYsNyksZj1TSU1ELkZsb2F0MzJ4NC5zaHVmZmxlKHUsbywwLDIsNCw2KSxoPVNJTUQuRmxvYXQzMng0LnNodWZmbGUodSxvLDEsMyw1LDcpLFNJTUQuRmxvYXQzMng0LnN0b3JlKHQsOCxmKSxTSU1ELkZsb2F0MzJ4NC5zdG9yZSh0LDEyLGgpLHR9LGEudHJhbnNwb3NlPW4uVVNFX1NJTUQ/YS5TSU1ELnRyYW5zcG9zZTphLnNjYWxhci50cmFuc3Bvc2UsYS5zY2FsYXIuaW52ZXJ0PWZ1bmN0aW9uKHQsZSl7dmFyIHI9ZVswXSxuPWVbMV0sYT1lWzJdLGk9ZVszXSx1PWVbNF0sbz1lWzVdLHM9ZVs2XSxsPWVbN10sZj1lWzhdLGg9ZVs5XSxjPWVbMTBdLGQ9ZVsxMV0sdj1lWzEyXSxfPWVbMTNdLG09ZVsxNF0scD1lWzE1XSxNPXIqby1uKnUseD1yKnMtYSp1LGc9cipsLWkqdSxFPW4qcy1hKm8sYj1uKmwtaSpvLHk9YSpsLWkqcyxTPWYqXy1oKnYsVD1mKm0tYyp2LEk9ZipwLWQqdixBPWgqbS1jKl8sRj1oKnAtZCpfLEQ9YypwLWQqbSxSPU0qRC14KkYrZypBK0UqSS1iKlQreSpTO3JldHVybiBSPyhSPTEvUix0WzBdPShvKkQtcypGK2wqQSkqUix0WzFdPShhKkYtbipELWkqQSkqUix0WzJdPShfKnktbSpiK3AqRSkqUix0WzNdPShjKmItaCp5LWQqRSkqUix0WzRdPShzKkktdSpELWwqVCkqUix0WzVdPShyKkQtYSpJK2kqVCkqUix0WzZdPShtKmctdip5LXAqeCkqUix0WzddPShmKnktYypnK2QqeCkqUix0WzhdPSh1KkYtbypJK2wqUykqUix0WzldPShuKkktcipGLWkqUykqUix0WzEwXT0odipiLV8qZytwKk0pKlIsdFsxMV09KGgqZy1mKmItZCpNKSpSLHRbMTJdPShvKlQtdSpBLXMqUykqUix0WzEzXT0ocipBLW4qVCthKlMpKlIsdFsxNF09KF8qeC12KkUtbSpNKSpSLHRbMTVdPShmKkUtaCp4K2MqTSkqUix0KTpudWxsfSxhLlNJTUQuaW52ZXJ0PWZ1bmN0aW9uKHQsZSl7dmFyIHIsbixhLGksdSxvLHMsbCxmLGgsYz1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsMCksZD1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsNCksdj1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsOCksXz1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsMTIpO3JldHVybiB1PVNJTUQuRmxvYXQzMng0LnNodWZmbGUoYyxkLDAsMSw0LDUpLG49U0lNRC5GbG9hdDMyeDQuc2h1ZmZsZSh2LF8sMCwxLDQsNSkscj1TSU1ELkZsb2F0MzJ4NC5zaHVmZmxlKHUsbiwwLDIsNCw2KSxuPVNJTUQuRmxvYXQzMng0LnNodWZmbGUobix1LDEsMyw1LDcpLHU9U0lNRC5GbG9hdDMyeDQuc2h1ZmZsZShjLGQsMiwzLDYsNyksaT1TSU1ELkZsb2F0MzJ4NC5zaHVmZmxlKHYsXywyLDMsNiw3KSxhPVNJTUQuRmxvYXQzMng0LnNodWZmbGUodSxpLDAsMiw0LDYpLGk9U0lNRC5GbG9hdDMyeDQuc2h1ZmZsZShpLHUsMSwzLDUsNyksdT1TSU1ELkZsb2F0MzJ4NC5tdWwoYSxpKSx1PVNJTUQuRmxvYXQzMng0LnN3aXp6bGUodSwxLDAsMywyKSxvPVNJTUQuRmxvYXQzMng0Lm11bChuLHUpLHM9U0lNRC5GbG9hdDMyeDQubXVsKHIsdSksdT1TSU1ELkZsb2F0MzJ4NC5zd2l6emxlKHUsMiwzLDAsMSksbz1TSU1ELkZsb2F0MzJ4NC5zdWIoU0lNRC5GbG9hdDMyeDQubXVsKG4sdSksbykscz1TSU1ELkZsb2F0MzJ4NC5zdWIoU0lNRC5GbG9hdDMyeDQubXVsKHIsdSkscykscz1TSU1ELkZsb2F0MzJ4NC5zd2l6emxlKHMsMiwzLDAsMSksdT1TSU1ELkZsb2F0MzJ4NC5tdWwobixhKSx1PVNJTUQuRmxvYXQzMng0LnN3aXp6bGUodSwxLDAsMywyKSxvPVNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwoaSx1KSxvKSxmPVNJTUQuRmxvYXQzMng0Lm11bChyLHUpLHU9U0lNRC5GbG9hdDMyeDQuc3dpenpsZSh1LDIsMywwLDEpLG89U0lNRC5GbG9hdDMyeDQuc3ViKG8sU0lNRC5GbG9hdDMyeDQubXVsKGksdSkpLGY9U0lNRC5GbG9hdDMyeDQuc3ViKFNJTUQuRmxvYXQzMng0Lm11bChyLHUpLGYpLGY9U0lNRC5GbG9hdDMyeDQuc3dpenpsZShmLDIsMywwLDEpLHU9U0lNRC5GbG9hdDMyeDQubXVsKFNJTUQuRmxvYXQzMng0LnN3aXp6bGUobiwyLDMsMCwxKSxpKSx1PVNJTUQuRmxvYXQzMng0LnN3aXp6bGUodSwxLDAsMywyKSxhPVNJTUQuRmxvYXQzMng0LnN3aXp6bGUoYSwyLDMsMCwxKSxvPVNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwoYSx1KSxvKSxsPVNJTUQuRmxvYXQzMng0Lm11bChyLHUpLHU9U0lNRC5GbG9hdDMyeDQuc3dpenpsZSh1LDIsMywwLDEpLG89U0lNRC5GbG9hdDMyeDQuc3ViKG8sU0lNRC5GbG9hdDMyeDQubXVsKGEsdSkpLGw9U0lNRC5GbG9hdDMyeDQuc3ViKFNJTUQuRmxvYXQzMng0Lm11bChyLHUpLGwpLGw9U0lNRC5GbG9hdDMyeDQuc3dpenpsZShsLDIsMywwLDEpLHU9U0lNRC5GbG9hdDMyeDQubXVsKHIsbiksdT1TSU1ELkZsb2F0MzJ4NC5zd2l6emxlKHUsMSwwLDMsMiksbD1TSU1ELkZsb2F0MzJ4NC5hZGQoU0lNRC5GbG9hdDMyeDQubXVsKGksdSksbCksZj1TSU1ELkZsb2F0MzJ4NC5zdWIoU0lNRC5GbG9hdDMyeDQubXVsKGEsdSksZiksdT1TSU1ELkZsb2F0MzJ4NC5zd2l6emxlKHUsMiwzLDAsMSksbD1TSU1ELkZsb2F0MzJ4NC5zdWIoU0lNRC5GbG9hdDMyeDQubXVsKGksdSksbCksZj1TSU1ELkZsb2F0MzJ4NC5zdWIoZixTSU1ELkZsb2F0MzJ4NC5tdWwoYSx1KSksdT1TSU1ELkZsb2F0MzJ4NC5tdWwocixpKSx1PVNJTUQuRmxvYXQzMng0LnN3aXp6bGUodSwxLDAsMywyKSxzPVNJTUQuRmxvYXQzMng0LnN1YihzLFNJTUQuRmxvYXQzMng0Lm11bChhLHUpKSxsPVNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwobix1KSxsKSx1PVNJTUQuRmxvYXQzMng0LnN3aXp6bGUodSwyLDMsMCwxKSxzPVNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwoYSx1KSxzKSxsPVNJTUQuRmxvYXQzMng0LnN1YihsLFNJTUQuRmxvYXQzMng0Lm11bChuLHUpKSx1PVNJTUQuRmxvYXQzMng0Lm11bChyLGEpLHU9U0lNRC5GbG9hdDMyeDQuc3dpenpsZSh1LDEsMCwzLDIpLHM9U0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChpLHUpLHMpLGY9U0lNRC5GbG9hdDMyeDQuc3ViKGYsU0lNRC5GbG9hdDMyeDQubXVsKG4sdSkpLHU9U0lNRC5GbG9hdDMyeDQuc3dpenpsZSh1LDIsMywwLDEpLHM9U0lNRC5GbG9hdDMyeDQuc3ViKHMsU0lNRC5GbG9hdDMyeDQubXVsKGksdSkpLGY9U0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChuLHUpLGYpLGg9U0lNRC5GbG9hdDMyeDQubXVsKHIsbyksaD1TSU1ELkZsb2F0MzJ4NC5hZGQoU0lNRC5GbG9hdDMyeDQuc3dpenpsZShoLDIsMywwLDEpLGgpLGg9U0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0LnN3aXp6bGUoaCwxLDAsMywyKSxoKSx1PVNJTUQuRmxvYXQzMng0LnJlY2lwcm9jYWxBcHByb3hpbWF0aW9uKGgpLGg9U0lNRC5GbG9hdDMyeDQuc3ViKFNJTUQuRmxvYXQzMng0LmFkZCh1LHUpLFNJTUQuRmxvYXQzMng0Lm11bChoLFNJTUQuRmxvYXQzMng0Lm11bCh1LHUpKSksKGg9U0lNRC5GbG9hdDMyeDQuc3dpenpsZShoLDAsMCwwLDApKT8oU0lNRC5GbG9hdDMyeDQuc3RvcmUodCwwLFNJTUQuRmxvYXQzMng0Lm11bChoLG8pKSxTSU1ELkZsb2F0MzJ4NC5zdG9yZSh0LDQsU0lNRC5GbG9hdDMyeDQubXVsKGgscykpLFNJTUQuRmxvYXQzMng0LnN0b3JlKHQsOCxTSU1ELkZsb2F0MzJ4NC5tdWwoaCxsKSksU0lNRC5GbG9hdDMyeDQuc3RvcmUodCwxMixTSU1ELkZsb2F0MzJ4NC5tdWwoaCxmKSksdCk6bnVsbH0sYS5pbnZlcnQ9bi5VU0VfU0lNRD9hLlNJTUQuaW52ZXJ0OmEuc2NhbGFyLmludmVydCxhLnNjYWxhci5hZGpvaW50PWZ1bmN0aW9uKHQsZSl7dmFyIHI9ZVswXSxuPWVbMV0sYT1lWzJdLGk9ZVszXSx1PWVbNF0sbz1lWzVdLHM9ZVs2XSxsPWVbN10sZj1lWzhdLGg9ZVs5XSxjPWVbMTBdLGQ9ZVsxMV0sdj1lWzEyXSxfPWVbMTNdLG09ZVsxNF0scD1lWzE1XTtyZXR1cm4gdFswXT1vKihjKnAtZCptKS1oKihzKnAtbCptKStfKihzKmQtbCpjKSx0WzFdPS0obiooYypwLWQqbSktaCooYSpwLWkqbSkrXyooYSpkLWkqYykpLHRbMl09bioocypwLWwqbSktbyooYSpwLWkqbSkrXyooYSpsLWkqcyksdFszXT0tKG4qKHMqZC1sKmMpLW8qKGEqZC1pKmMpK2gqKGEqbC1pKnMpKSx0WzRdPS0odSooYypwLWQqbSktZioocypwLWwqbSkrdioocypkLWwqYykpLHRbNV09ciooYypwLWQqbSktZiooYSpwLWkqbSkrdiooYSpkLWkqYyksdFs2XT0tKHIqKHMqcC1sKm0pLXUqKGEqcC1pKm0pK3YqKGEqbC1pKnMpKSx0WzddPXIqKHMqZC1sKmMpLXUqKGEqZC1pKmMpK2YqKGEqbC1pKnMpLHRbOF09dSooaCpwLWQqXyktZioobypwLWwqXykrdioobypkLWwqaCksdFs5XT0tKHIqKGgqcC1kKl8pLWYqKG4qcC1pKl8pK3YqKG4qZC1pKmgpKSx0WzEwXT1yKihvKnAtbCpfKS11KihuKnAtaSpfKSt2KihuKmwtaSpvKSx0WzExXT0tKHIqKG8qZC1sKmgpLXUqKG4qZC1pKmgpK2YqKG4qbC1pKm8pKSx0WzEyXT0tKHUqKGgqbS1jKl8pLWYqKG8qbS1zKl8pK3YqKG8qYy1zKmgpKSx0WzEzXT1yKihoKm0tYypfKS1mKihuKm0tYSpfKSt2KihuKmMtYSpoKSx0WzE0XT0tKHIqKG8qbS1zKl8pLXUqKG4qbS1hKl8pK3YqKG4qcy1hKm8pKSx0WzE1XT1yKihvKmMtcypoKS11KihuKmMtYSpoKStmKihuKnMtYSpvKSx0fSxhLlNJTUQuYWRqb2ludD1mdW5jdGlvbih0LGUpe3ZhciByLG4sYSxpLHUsbyxzLGwsZixoLGMsZCx2LHI9U0lNRC5GbG9hdDMyeDQubG9hZChlLDApLG49U0lNRC5GbG9hdDMyeDQubG9hZChlLDQpLGE9U0lNRC5GbG9hdDMyeDQubG9hZChlLDgpLGk9U0lNRC5GbG9hdDMyeDQubG9hZChlLDEyKTtyZXR1cm4gZj1TSU1ELkZsb2F0MzJ4NC5zaHVmZmxlKHIsbiwwLDEsNCw1KSxvPVNJTUQuRmxvYXQzMng0LnNodWZmbGUoYSxpLDAsMSw0LDUpLHU9U0lNRC5GbG9hdDMyeDQuc2h1ZmZsZShmLG8sMCwyLDQsNiksbz1TSU1ELkZsb2F0MzJ4NC5zaHVmZmxlKG8sZiwxLDMsNSw3KSxmPVNJTUQuRmxvYXQzMng0LnNodWZmbGUocixuLDIsMyw2LDcpLGw9U0lNRC5GbG9hdDMyeDQuc2h1ZmZsZShhLGksMiwzLDYsNykscz1TSU1ELkZsb2F0MzJ4NC5zaHVmZmxlKGYsbCwwLDIsNCw2KSxsPVNJTUQuRmxvYXQzMng0LnNodWZmbGUobCxmLDEsMyw1LDcpLGY9U0lNRC5GbG9hdDMyeDQubXVsKHMsbCksZj1TSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGYsMSwwLDMsMiksaD1TSU1ELkZsb2F0MzJ4NC5tdWwobyxmKSxjPVNJTUQuRmxvYXQzMng0Lm11bCh1LGYpLGY9U0lNRC5GbG9hdDMyeDQuc3dpenpsZShmLDIsMywwLDEpLGg9U0lNRC5GbG9hdDMyeDQuc3ViKFNJTUQuRmxvYXQzMng0Lm11bChvLGYpLGgpLGM9U0lNRC5GbG9hdDMyeDQuc3ViKFNJTUQuRmxvYXQzMng0Lm11bCh1LGYpLGMpLGM9U0lNRC5GbG9hdDMyeDQuc3dpenpsZShjLDIsMywwLDEpLGY9U0lNRC5GbG9hdDMyeDQubXVsKG8scyksZj1TSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGYsMSwwLDMsMiksaD1TSU1ELkZsb2F0MzJ4NC5hZGQoU0lNRC5GbG9hdDMyeDQubXVsKGwsZiksaCksdj1TSU1ELkZsb2F0MzJ4NC5tdWwodSxmKSxmPVNJTUQuRmxvYXQzMng0LnN3aXp6bGUoZiwyLDMsMCwxKSxoPVNJTUQuRmxvYXQzMng0LnN1YihoLFNJTUQuRmxvYXQzMng0Lm11bChsLGYpKSx2PVNJTUQuRmxvYXQzMng0LnN1YihTSU1ELkZsb2F0MzJ4NC5tdWwodSxmKSx2KSx2PVNJTUQuRmxvYXQzMng0LnN3aXp6bGUodiwyLDMsMCwxKSxmPVNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKG8sMiwzLDAsMSksbCksZj1TSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGYsMSwwLDMsMikscz1TSU1ELkZsb2F0MzJ4NC5zd2l6emxlKHMsMiwzLDAsMSksaD1TSU1ELkZsb2F0MzJ4NC5hZGQoU0lNRC5GbG9hdDMyeDQubXVsKHMsZiksaCksZD1TSU1ELkZsb2F0MzJ4NC5tdWwodSxmKSxmPVNJTUQuRmxvYXQzMng0LnN3aXp6bGUoZiwyLDMsMCwxKSxoPVNJTUQuRmxvYXQzMng0LnN1YihoLFNJTUQuRmxvYXQzMng0Lm11bChzLGYpKSxkPVNJTUQuRmxvYXQzMng0LnN1YihTSU1ELkZsb2F0MzJ4NC5tdWwodSxmKSxkKSxkPVNJTUQuRmxvYXQzMng0LnN3aXp6bGUoZCwyLDMsMCwxKSxmPVNJTUQuRmxvYXQzMng0Lm11bCh1LG8pLGY9U0lNRC5GbG9hdDMyeDQuc3dpenpsZShmLDEsMCwzLDIpLGQ9U0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChsLGYpLGQpLHY9U0lNRC5GbG9hdDMyeDQuc3ViKFNJTUQuRmxvYXQzMng0Lm11bChzLGYpLHYpLGY9U0lNRC5GbG9hdDMyeDQuc3dpenpsZShmLDIsMywwLDEpLGQ9U0lNRC5GbG9hdDMyeDQuc3ViKFNJTUQuRmxvYXQzMng0Lm11bChsLGYpLGQpLHY9U0lNRC5GbG9hdDMyeDQuc3ViKHYsU0lNRC5GbG9hdDMyeDQubXVsKHMsZikpLGY9U0lNRC5GbG9hdDMyeDQubXVsKHUsbCksZj1TSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGYsMSwwLDMsMiksYz1TSU1ELkZsb2F0MzJ4NC5zdWIoYyxTSU1ELkZsb2F0MzJ4NC5tdWwocyxmKSksZD1TSU1ELkZsb2F0MzJ4NC5hZGQoU0lNRC5GbG9hdDMyeDQubXVsKG8sZiksZCksZj1TSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGYsMiwzLDAsMSksYz1TSU1ELkZsb2F0MzJ4NC5hZGQoU0lNRC5GbG9hdDMyeDQubXVsKHMsZiksYyksZD1TSU1ELkZsb2F0MzJ4NC5zdWIoZCxTSU1ELkZsb2F0MzJ4NC5tdWwobyxmKSksZj1TSU1ELkZsb2F0MzJ4NC5tdWwodSxzKSxmPVNJTUQuRmxvYXQzMng0LnN3aXp6bGUoZiwxLDAsMywyKSxjPVNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwobCxmKSxjKSx2PVNJTUQuRmxvYXQzMng0LnN1Yih2LFNJTUQuRmxvYXQzMng0Lm11bChvLGYpKSxmPVNJTUQuRmxvYXQzMng0LnN3aXp6bGUoZiwyLDMsMCwxKSxjPVNJTUQuRmxvYXQzMng0LnN1YihjLFNJTUQuRmxvYXQzMng0Lm11bChsLGYpKSx2PVNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwobyxmKSx2KSxTSU1ELkZsb2F0MzJ4NC5zdG9yZSh0LDAsaCksU0lNRC5GbG9hdDMyeDQuc3RvcmUodCw0LGMpLFNJTUQuRmxvYXQzMng0LnN0b3JlKHQsOCxkKSxTSU1ELkZsb2F0MzJ4NC5zdG9yZSh0LDEyLHYpLHR9LGEuYWRqb2ludD1uLlVTRV9TSU1EP2EuU0lNRC5hZGpvaW50OmEuc2NhbGFyLmFkam9pbnQsYS5kZXRlcm1pbmFudD1mdW5jdGlvbih0KXt2YXIgZT10WzBdLHI9dFsxXSxuPXRbMl0sYT10WzNdLGk9dFs0XSx1PXRbNV0sbz10WzZdLHM9dFs3XSxsPXRbOF0sZj10WzldLGg9dFsxMF0sYz10WzExXSxkPXRbMTJdLHY9dFsxM10sXz10WzE0XSxtPXRbMTVdLHA9ZSp1LXIqaSxNPWUqby1uKmkseD1lKnMtYSppLGc9cipvLW4qdSxFPXIqcy1hKnUsYj1uKnMtYSpvLHk9bCp2LWYqZCxTPWwqXy1oKmQsVD1sKm0tYypkLEk9ZipfLWgqdixBPWYqbS1jKnYsRj1oKm0tYypfO3JldHVybiBwKkYtTSpBK3gqSStnKlQtRSpTK2IqeX0sYS5TSU1ELm11bHRpcGx5PWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsMCksYT1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsNCksaT1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsOCksdT1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsMTIpLG89U0lNRC5GbG9hdDMyeDQubG9hZChyLDApLHM9U0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKG8sMCwwLDAsMCksbiksU0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKG8sMSwxLDEsMSksYSksU0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKG8sMiwyLDIsMiksaSksU0lNRC5GbG9hdDMyeDQubXVsKFNJTUQuRmxvYXQzMng0LnN3aXp6bGUobywzLDMsMywzKSx1KSkpKTtTSU1ELkZsb2F0MzJ4NC5zdG9yZSh0LDAscyk7dmFyIGw9U0lNRC5GbG9hdDMyeDQubG9hZChyLDQpLGY9U0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGwsMCwwLDAsMCksbiksU0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGwsMSwxLDEsMSksYSksU0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGwsMiwyLDIsMiksaSksU0lNRC5GbG9hdDMyeDQubXVsKFNJTUQuRmxvYXQzMng0LnN3aXp6bGUobCwzLDMsMywzKSx1KSkpKTtTSU1ELkZsb2F0MzJ4NC5zdG9yZSh0LDQsZik7dmFyIGg9U0lNRC5GbG9hdDMyeDQubG9hZChyLDgpLGM9U0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGgsMCwwLDAsMCksbiksU0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGgsMSwxLDEsMSksYSksU0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGgsMiwyLDIsMiksaSksU0lNRC5GbG9hdDMyeDQubXVsKFNJTUQuRmxvYXQzMng0LnN3aXp6bGUoaCwzLDMsMywzKSx1KSkpKTtTSU1ELkZsb2F0MzJ4NC5zdG9yZSh0LDgsYyk7dmFyIGQ9U0lNRC5GbG9hdDMyeDQubG9hZChyLDEyKSx2PVNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwoU0lNRC5GbG9hdDMyeDQuc3dpenpsZShkLDAsMCwwLDApLG4pLFNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwoU0lNRC5GbG9hdDMyeDQuc3dpenpsZShkLDEsMSwxLDEpLGEpLFNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwoU0lNRC5GbG9hdDMyeDQuc3dpenpsZShkLDIsMiwyLDIpLGkpLFNJTUQuRmxvYXQzMng0Lm11bChTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKGQsMywzLDMsMyksdSkpKSk7cmV0dXJuIFNJTUQuRmxvYXQzMng0LnN0b3JlKHQsMTIsdiksdH0sYS5zY2FsYXIubXVsdGlwbHk9ZnVuY3Rpb24odCxlLHIpe3ZhciBuPWVbMF0sYT1lWzFdLGk9ZVsyXSx1PWVbM10sbz1lWzRdLHM9ZVs1XSxsPWVbNl0sZj1lWzddLGg9ZVs4XSxjPWVbOV0sZD1lWzEwXSx2PWVbMTFdLF89ZVsxMl0sbT1lWzEzXSxwPWVbMTRdLE09ZVsxNV0seD1yWzBdLGc9clsxXSxFPXJbMl0sYj1yWzNdO3JldHVybiB0WzBdPXgqbitnKm8rRSpoK2IqXyx0WzFdPXgqYStnKnMrRSpjK2IqbSx0WzJdPXgqaStnKmwrRSpkK2IqcCx0WzNdPXgqdStnKmYrRSp2K2IqTSx4PXJbNF0sZz1yWzVdLEU9cls2XSxiPXJbN10sdFs0XT14Km4rZypvK0UqaCtiKl8sdFs1XT14KmErZypzK0UqYytiKm0sdFs2XT14KmkrZypsK0UqZCtiKnAsdFs3XT14KnUrZypmK0UqditiKk0seD1yWzhdLGc9cls5XSxFPXJbMTBdLGI9clsxMV0sdFs4XT14Km4rZypvK0UqaCtiKl8sdFs5XT14KmErZypzK0UqYytiKm0sdFsxMF09eCppK2cqbCtFKmQrYipwLHRbMTFdPXgqdStnKmYrRSp2K2IqTSx4PXJbMTJdLGc9clsxM10sRT1yWzE0XSxiPXJbMTVdLHRbMTJdPXgqbitnKm8rRSpoK2IqXyx0WzEzXT14KmErZypzK0UqYytiKm0sdFsxNF09eCppK2cqbCtFKmQrYipwLHRbMTVdPXgqdStnKmYrRSp2K2IqTSx0fSxhLm11bHRpcGx5PW4uVVNFX1NJTUQ/YS5TSU1ELm11bHRpcGx5OmEuc2NhbGFyLm11bHRpcGx5LGEubXVsPWEubXVsdGlwbHksYS5zY2FsYXIudHJhbnNsYXRlPWZ1bmN0aW9uKHQsZSxyKXt2YXIgbixhLGksdSxvLHMsbCxmLGgsYyxkLHYsXz1yWzBdLG09clsxXSxwPXJbMl07cmV0dXJuIGU9PT10Pyh0WzEyXT1lWzBdKl8rZVs0XSptK2VbOF0qcCtlWzEyXSx0WzEzXT1lWzFdKl8rZVs1XSptK2VbOV0qcCtlWzEzXSx0WzE0XT1lWzJdKl8rZVs2XSptK2VbMTBdKnArZVsxNF0sdFsxNV09ZVszXSpfK2VbN10qbStlWzExXSpwK2VbMTVdKToobj1lWzBdLGE9ZVsxXSxpPWVbMl0sdT1lWzNdLG89ZVs0XSxzPWVbNV0sbD1lWzZdLGY9ZVs3XSxoPWVbOF0sYz1lWzldLGQ9ZVsxMF0sdj1lWzExXSx0WzBdPW4sdFsxXT1hLHRbMl09aSx0WzNdPXUsdFs0XT1vLHRbNV09cyx0WzZdPWwsdFs3XT1mLHRbOF09aCx0WzldPWMsdFsxMF09ZCx0WzExXT12LHRbMTJdPW4qXytvKm0raCpwK2VbMTJdLHRbMTNdPWEqXytzKm0rYypwK2VbMTNdLHRbMTRdPWkqXytsKm0rZCpwK2VbMTRdLHRbMTVdPXUqXytmKm0rdipwK2VbMTVdKSx0fSxhLlNJTUQudHJhbnNsYXRlPWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsMCksYT1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsNCksaT1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsOCksdT1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsMTIpLG89U0lNRC5GbG9hdDMyeDQoclswXSxyWzFdLHJbMl0sMCk7ZSE9PXQmJih0WzBdPWVbMF0sdFsxXT1lWzFdLHRbMl09ZVsyXSx0WzNdPWVbM10sdFs0XT1lWzRdLHRbNV09ZVs1XSx0WzZdPWVbNl0sdFs3XT1lWzddLHRbOF09ZVs4XSx0WzldPWVbOV0sdFsxMF09ZVsxMF0sdFsxMV09ZVsxMV0pLG49U0lNRC5GbG9hdDMyeDQubXVsKG4sU0lNRC5GbG9hdDMyeDQuc3dpenpsZShvLDAsMCwwLDApKSxhPVNJTUQuRmxvYXQzMng0Lm11bChhLFNJTUQuRmxvYXQzMng0LnN3aXp6bGUobywxLDEsMSwxKSksaT1TSU1ELkZsb2F0MzJ4NC5tdWwoaSxTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKG8sMiwyLDIsMikpO3ZhciBzPVNJTUQuRmxvYXQzMng0LmFkZChuLFNJTUQuRmxvYXQzMng0LmFkZChhLFNJTUQuRmxvYXQzMng0LmFkZChpLHUpKSk7cmV0dXJuIFNJTUQuRmxvYXQzMng0LnN0b3JlKHQsMTIscyksdH0sYS50cmFuc2xhdGU9bi5VU0VfU0lNRD9hLlNJTUQudHJhbnNsYXRlOmEuc2NhbGFyLnRyYW5zbGF0ZSxhLnNjYWxhci5zY2FsZT1mdW5jdGlvbih0LGUscil7dmFyIG49clswXSxhPXJbMV0saT1yWzJdO3JldHVybiB0WzBdPWVbMF0qbix0WzFdPWVbMV0qbix0WzJdPWVbMl0qbix0WzNdPWVbM10qbix0WzRdPWVbNF0qYSx0WzVdPWVbNV0qYSx0WzZdPWVbNl0qYSx0WzddPWVbN10qYSx0WzhdPWVbOF0qaSx0WzldPWVbOV0qaSx0WzEwXT1lWzEwXSppLHRbMTFdPWVbMTFdKmksdFsxMl09ZVsxMl0sdFsxM109ZVsxM10sdFsxNF09ZVsxNF0sdFsxNV09ZVsxNV0sdH0sYS5TSU1ELnNjYWxlPWZ1bmN0aW9uKHQsZSxyKXt2YXIgbixhLGksdT1TSU1ELkZsb2F0MzJ4NChyWzBdLHJbMV0sclsyXSwwKTtyZXR1cm4gbj1TSU1ELkZsb2F0MzJ4NC5sb2FkKGUsMCksU0lNRC5GbG9hdDMyeDQuc3RvcmUodCwwLFNJTUQuRmxvYXQzMng0Lm11bChuLFNJTUQuRmxvYXQzMng0LnN3aXp6bGUodSwwLDAsMCwwKSkpLGE9U0lNRC5GbG9hdDMyeDQubG9hZChlLDQpLFNJTUQuRmxvYXQzMng0LnN0b3JlKHQsNCxTSU1ELkZsb2F0MzJ4NC5tdWwoYSxTSU1ELkZsb2F0MzJ4NC5zd2l6emxlKHUsMSwxLDEsMSkpKSxpPVNJTUQuRmxvYXQzMng0LmxvYWQoZSw4KSxTSU1ELkZsb2F0MzJ4NC5zdG9yZSh0LDgsU0lNRC5GbG9hdDMyeDQubXVsKGksU0lNRC5GbG9hdDMyeDQuc3dpenpsZSh1LDIsMiwyLDIpKSksdFsxMl09ZVsxMl0sdFsxM109ZVsxM10sdFsxNF09ZVsxNF0sdFsxNV09ZVsxNV0sdH0sYS5zY2FsZT1uLlVTRV9TSU1EP2EuU0lNRC5zY2FsZTphLnNjYWxhci5zY2FsZSxhLnJvdGF0ZT1mdW5jdGlvbih0LGUscixhKXt2YXIgaSx1LG8scyxsLGYsaCxjLGQsdixfLG0scCxNLHgsZyxFLGIseSxTLFQsSSxBLEYsRD1hWzBdLFI9YVsxXSx3PWFbMl0sUD1NYXRoLnNxcnQoRCpEK1IqUit3KncpO3JldHVybiBNYXRoLmFicyhQKTxuLkVQU0lMT04/bnVsbDooUD0xL1AsRCo9UCxSKj1QLHcqPVAsaT1NYXRoLnNpbihyKSx1PU1hdGguY29zKHIpLG89MS11LHM9ZVswXSxsPWVbMV0sZj1lWzJdLGg9ZVszXSxjPWVbNF0sZD1lWzVdLHY9ZVs2XSxfPWVbN10sbT1lWzhdLHA9ZVs5XSxNPWVbMTBdLHg9ZVsxMV0sZz1EKkQqbyt1LEU9UipEKm8rdyppLGI9dypEKm8tUippLHk9RCpSKm8tdyppLFM9UipSKm8rdSxUPXcqUipvK0QqaSxJPUQqdypvK1IqaSxBPVIqdypvLUQqaSxGPXcqdypvK3UsdFswXT1zKmcrYypFK20qYix0WzFdPWwqZytkKkUrcCpiLHRbMl09ZipnK3YqRStNKmIsdFszXT1oKmcrXypFK3gqYix0WzRdPXMqeStjKlMrbSpULHRbNV09bCp5K2QqUytwKlQsdFs2XT1mKnkrdipTK00qVCx0WzddPWgqeStfKlMreCpULHRbOF09cypJK2MqQSttKkYsdFs5XT1sKkkrZCpBK3AqRix0WzEwXT1mKkkrdipBK00qRix0WzExXT1oKkkrXypBK3gqRixlIT09dCYmKHRbMTJdPWVbMTJdLHRbMTNdPWVbMTNdLHRbMTRdPWVbMTRdLHRbMTVdPWVbMTVdKSx0KX0sYS5zY2FsYXIucm90YXRlWD1mdW5jdGlvbih0LGUscil7dmFyIG49TWF0aC5zaW4ociksYT1NYXRoLmNvcyhyKSxpPWVbNF0sdT1lWzVdLG89ZVs2XSxzPWVbN10sbD1lWzhdLGY9ZVs5XSxoPWVbMTBdLGM9ZVsxMV07cmV0dXJuIGUhPT10JiYodFswXT1lWzBdLHRbMV09ZVsxXSx0WzJdPWVbMl0sdFszXT1lWzNdLHRbMTJdPWVbMTJdLHRbMTNdPWVbMTNdLHRbMTRdPWVbMTRdLHRbMTVdPWVbMTVdKSx0WzRdPWkqYStsKm4sdFs1XT11KmErZipuLHRbNl09byphK2gqbix0WzddPXMqYStjKm4sdFs4XT1sKmEtaSpuLHRbOV09ZiphLXUqbix0WzEwXT1oKmEtbypuLHRbMTFdPWMqYS1zKm4sdH0sYS5TSU1ELnJvdGF0ZVg9ZnVuY3Rpb24odCxlLHIpe3ZhciBuPVNJTUQuRmxvYXQzMng0LnNwbGF0KE1hdGguc2luKHIpKSxhPVNJTUQuRmxvYXQzMng0LnNwbGF0KE1hdGguY29zKHIpKTtlIT09dCYmKHRbMF09ZVswXSx0WzFdPWVbMV0sdFsyXT1lWzJdLHRbM109ZVszXSx0WzEyXT1lWzEyXSx0WzEzXT1lWzEzXSx0WzE0XT1lWzE0XSx0WzE1XT1lWzE1XSk7dmFyIGk9U0lNRC5GbG9hdDMyeDQubG9hZChlLDQpLHU9U0lNRC5GbG9hdDMyeDQubG9hZChlLDgpO3JldHVybiBTSU1ELkZsb2F0MzJ4NC5zdG9yZSh0LDQsU0lNRC5GbG9hdDMyeDQuYWRkKFNJTUQuRmxvYXQzMng0Lm11bChpLGEpLFNJTUQuRmxvYXQzMng0Lm11bCh1LG4pKSksU0lNRC5GbG9hdDMyeDQuc3RvcmUodCw4LFNJTUQuRmxvYXQzMng0LnN1YihTSU1ELkZsb2F0MzJ4NC5tdWwodSxhKSxTSU1ELkZsb2F0MzJ4NC5tdWwoaSxuKSkpLHR9LGEucm90YXRlWD1uLlVTRV9TSU1EP2EuU0lNRC5yb3RhdGVYOmEuc2NhbGFyLnJvdGF0ZVgsYS5zY2FsYXIucm90YXRlWT1mdW5jdGlvbih0LGUscil7dmFyIG49TWF0aC5zaW4ociksYT1NYXRoLmNvcyhyKSxpPWVbMF0sdT1lWzFdLG89ZVsyXSxzPWVbM10sbD1lWzhdLGY9ZVs5XSxoPWVbMTBdLGM9ZVsxMV07cmV0dXJuIGUhPT10JiYodFs0XT1lWzRdLHRbNV09ZVs1XSx0WzZdPWVbNl0sdFs3XT1lWzddLHRbMTJdPWVbMTJdLHRbMTNdPWVbMTNdLHRbMTRdPWVbMTRdLHRbMTVdPWVbMTVdKSx0WzBdPWkqYS1sKm4sdFsxXT11KmEtZipuLHRbMl09byphLWgqbix0WzNdPXMqYS1jKm4sdFs4XT1pKm4rbCphLHRbOV09dSpuK2YqYSx0WzEwXT1vKm4raCphLHRbMTFdPXMqbitjKmEsdH0sYS5TSU1ELnJvdGF0ZVk9ZnVuY3Rpb24odCxlLHIpe3ZhciBuPVNJTUQuRmxvYXQzMng0LnNwbGF0KE1hdGguc2luKHIpKSxhPVNJTUQuRmxvYXQzMng0LnNwbGF0KE1hdGguY29zKHIpKTtlIT09dCYmKHRbNF09ZVs0XSx0WzVdPWVbNV0sdFs2XT1lWzZdLHRbN109ZVs3XSx0WzEyXT1lWzEyXSx0WzEzXT1lWzEzXSx0WzE0XT1lWzE0XSx0WzE1XT1lWzE1XSk7dmFyIGk9U0lNRC5GbG9hdDMyeDQubG9hZChlLDApLHU9U0lNRC5GbG9hdDMyeDQubG9hZChlLDgpO3JldHVybiBTSU1ELkZsb2F0MzJ4NC5zdG9yZSh0LDAsU0lNRC5GbG9hdDMyeDQuc3ViKFNJTUQuRmxvYXQzMng0Lm11bChpLGEpLFNJTUQuRmxvYXQzMng0Lm11bCh1LG4pKSksU0lNRC5GbG9hdDMyeDQuc3RvcmUodCw4LFNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwoaSxuKSxTSU1ELkZsb2F0MzJ4NC5tdWwodSxhKSkpLHR9LGEucm90YXRlWT1uLlVTRV9TSU1EP2EuU0lNRC5yb3RhdGVZOmEuc2NhbGFyLnJvdGF0ZVksYS5zY2FsYXIucm90YXRlWj1mdW5jdGlvbih0LGUscil7dmFyIG49TWF0aC5zaW4ociksYT1NYXRoLmNvcyhyKSxpPWVbMF0sdT1lWzFdLG89ZVsyXSxzPWVbM10sbD1lWzRdLGY9ZVs1XSxoPWVbNl0sYz1lWzddO3JldHVybiBlIT09dCYmKHRbOF09ZVs4XSx0WzldPWVbOV0sdFsxMF09ZVsxMF0sdFsxMV09ZVsxMV0sdFsxMl09ZVsxMl0sdFsxM109ZVsxM10sdFsxNF09ZVsxNF0sdFsxNV09ZVsxNV0pLHRbMF09aSphK2wqbix0WzFdPXUqYStmKm4sdFsyXT1vKmEraCpuLHRbM109cyphK2Mqbix0WzRdPWwqYS1pKm4sdFs1XT1mKmEtdSpuLHRbNl09aCphLW8qbix0WzddPWMqYS1zKm4sdH0sYS5TSU1ELnJvdGF0ZVo9ZnVuY3Rpb24odCxlLHIpe3ZhciBuPVNJTUQuRmxvYXQzMng0LnNwbGF0KE1hdGguc2luKHIpKSxhPVNJTUQuRmxvYXQzMng0LnNwbGF0KE1hdGguY29zKHIpKTtlIT09dCYmKHRbOF09ZVs4XSx0WzldPWVbOV0sdFsxMF09ZVsxMF0sdFsxMV09ZVsxMV0sdFsxMl09ZVsxMl0sdFsxM109ZVsxM10sdFsxNF09ZVsxNF0sdFsxNV09ZVsxNV0pO3ZhciBpPVNJTUQuRmxvYXQzMng0LmxvYWQoZSwwKSx1PVNJTUQuRmxvYXQzMng0LmxvYWQoZSw0KTtyZXR1cm4gU0lNRC5GbG9hdDMyeDQuc3RvcmUodCwwLFNJTUQuRmxvYXQzMng0LmFkZChTSU1ELkZsb2F0MzJ4NC5tdWwoaSxhKSxTSU1ELkZsb2F0MzJ4NC5tdWwodSxuKSkpLFNJTUQuRmxvYXQzMng0LnN0b3JlKHQsNCxTSU1ELkZsb2F0MzJ4NC5zdWIoU0lNRC5GbG9hdDMyeDQubXVsKHUsYSksU0lNRC5GbG9hdDMyeDQubXVsKGksbikpKSx0fSxhLnJvdGF0ZVo9bi5VU0VfU0lNRD9hLlNJTUQucm90YXRlWjphLnNjYWxhci5yb3RhdGVaLGEuZnJvbVRyYW5zbGF0aW9uPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09MSx0WzFdPTAsdFsyXT0wLHRbM109MCx0WzRdPTAsdFs1XT0xLHRbNl09MCx0WzddPTAsdFs4XT0wLHRbOV09MCx0WzEwXT0xLHRbMTFdPTAsdFsxMl09ZVswXSx0WzEzXT1lWzFdLHRbMTRdPWVbMl0sdFsxNV09MSx0fSxhLmZyb21TY2FsaW5nPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09ZVswXSx0WzFdPTAsdFsyXT0wLHRbM109MCx0WzRdPTAsdFs1XT1lWzFdLHRbNl09MCx0WzddPTAsdFs4XT0wLFxudFs5XT0wLHRbMTBdPWVbMl0sdFsxMV09MCx0WzEyXT0wLHRbMTNdPTAsdFsxNF09MCx0WzE1XT0xLHR9LGEuZnJvbVJvdGF0aW9uPWZ1bmN0aW9uKHQsZSxyKXt2YXIgYSxpLHUsbz1yWzBdLHM9clsxXSxsPXJbMl0sZj1NYXRoLnNxcnQobypvK3MqcytsKmwpO3JldHVybiBNYXRoLmFicyhmKTxuLkVQU0lMT04/bnVsbDooZj0xL2Ysbyo9ZixzKj1mLGwqPWYsYT1NYXRoLnNpbihlKSxpPU1hdGguY29zKGUpLHU9MS1pLHRbMF09bypvKnUraSx0WzFdPXMqbyp1K2wqYSx0WzJdPWwqbyp1LXMqYSx0WzNdPTAsdFs0XT1vKnMqdS1sKmEsdFs1XT1zKnMqdStpLHRbNl09bCpzKnUrbyphLHRbN109MCx0WzhdPW8qbCp1K3MqYSx0WzldPXMqbCp1LW8qYSx0WzEwXT1sKmwqdStpLHRbMTFdPTAsdFsxMl09MCx0WzEzXT0wLHRbMTRdPTAsdFsxNV09MSx0KX0sYS5mcm9tWFJvdGF0aW9uPWZ1bmN0aW9uKHQsZSl7dmFyIHI9TWF0aC5zaW4oZSksbj1NYXRoLmNvcyhlKTtyZXR1cm4gdFswXT0xLHRbMV09MCx0WzJdPTAsdFszXT0wLHRbNF09MCx0WzVdPW4sdFs2XT1yLHRbN109MCx0WzhdPTAsdFs5XT0tcix0WzEwXT1uLHRbMTFdPTAsdFsxMl09MCx0WzEzXT0wLHRbMTRdPTAsdFsxNV09MSx0fSxhLmZyb21ZUm90YXRpb249ZnVuY3Rpb24odCxlKXt2YXIgcj1NYXRoLnNpbihlKSxuPU1hdGguY29zKGUpO3JldHVybiB0WzBdPW4sdFsxXT0wLHRbMl09LXIsdFszXT0wLHRbNF09MCx0WzVdPTEsdFs2XT0wLHRbN109MCx0WzhdPXIsdFs5XT0wLHRbMTBdPW4sdFsxMV09MCx0WzEyXT0wLHRbMTNdPTAsdFsxNF09MCx0WzE1XT0xLHR9LGEuZnJvbVpSb3RhdGlvbj1mdW5jdGlvbih0LGUpe3ZhciByPU1hdGguc2luKGUpLG49TWF0aC5jb3MoZSk7cmV0dXJuIHRbMF09bix0WzFdPXIsdFsyXT0wLHRbM109MCx0WzRdPS1yLHRbNV09bix0WzZdPTAsdFs3XT0wLHRbOF09MCx0WzldPTAsdFsxMF09MSx0WzExXT0wLHRbMTJdPTAsdFsxM109MCx0WzE0XT0wLHRbMTVdPTEsdH0sYS5mcm9tUm90YXRpb25UcmFuc2xhdGlvbj1mdW5jdGlvbih0LGUscil7dmFyIG49ZVswXSxhPWVbMV0saT1lWzJdLHU9ZVszXSxvPW4rbixzPWErYSxsPWkraSxmPW4qbyxoPW4qcyxjPW4qbCxkPWEqcyx2PWEqbCxfPWkqbCxtPXUqbyxwPXUqcyxNPXUqbDtyZXR1cm4gdFswXT0xLShkK18pLHRbMV09aCtNLHRbMl09Yy1wLHRbM109MCx0WzRdPWgtTSx0WzVdPTEtKGYrXyksdFs2XT12K20sdFs3XT0wLHRbOF09YytwLHRbOV09di1tLHRbMTBdPTEtKGYrZCksdFsxMV09MCx0WzEyXT1yWzBdLHRbMTNdPXJbMV0sdFsxNF09clsyXSx0WzE1XT0xLHR9LGEuZ2V0VHJhbnNsYXRpb249ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT1lWzEyXSx0WzFdPWVbMTNdLHRbMl09ZVsxNF0sdH0sYS5nZXRSb3RhdGlvbj1mdW5jdGlvbih0LGUpe3ZhciByPWVbMF0rZVs1XStlWzEwXSxuPTA7cmV0dXJuIHI+MD8obj0yKk1hdGguc3FydChyKzEpLHRbM109LjI1Km4sdFswXT0oZVs2XS1lWzldKS9uLHRbMV09KGVbOF0tZVsyXSkvbix0WzJdPShlWzFdLWVbNF0pL24pOmVbMF0+ZVs1XSZlWzBdPmVbMTBdPyhuPTIqTWF0aC5zcXJ0KDErZVswXS1lWzVdLWVbMTBdKSx0WzNdPShlWzZdLWVbOV0pL24sdFswXT0uMjUqbix0WzFdPShlWzFdK2VbNF0pL24sdFsyXT0oZVs4XStlWzJdKS9uKTplWzVdPmVbMTBdPyhuPTIqTWF0aC5zcXJ0KDErZVs1XS1lWzBdLWVbMTBdKSx0WzNdPShlWzhdLWVbMl0pL24sdFswXT0oZVsxXStlWzRdKS9uLHRbMV09LjI1Km4sdFsyXT0oZVs2XStlWzldKS9uKToobj0yKk1hdGguc3FydCgxK2VbMTBdLWVbMF0tZVs1XSksdFszXT0oZVsxXS1lWzRdKS9uLHRbMF09KGVbOF0rZVsyXSkvbix0WzFdPShlWzZdK2VbOV0pL24sdFsyXT0uMjUqbiksdH0sYS5mcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlPWZ1bmN0aW9uKHQsZSxyLG4pe3ZhciBhPWVbMF0saT1lWzFdLHU9ZVsyXSxvPWVbM10scz1hK2EsbD1pK2ksZj11K3UsaD1hKnMsYz1hKmwsZD1hKmYsdj1pKmwsXz1pKmYsbT11KmYscD1vKnMsTT1vKmwseD1vKmYsZz1uWzBdLEU9blsxXSxiPW5bMl07cmV0dXJuIHRbMF09KDEtKHYrbSkpKmcsdFsxXT0oYyt4KSpnLHRbMl09KGQtTSkqZyx0WzNdPTAsdFs0XT0oYy14KSpFLHRbNV09KDEtKGgrbSkpKkUsdFs2XT0oXytwKSpFLHRbN109MCx0WzhdPShkK00pKmIsdFs5XT0oXy1wKSpiLHRbMTBdPSgxLShoK3YpKSpiLHRbMTFdPTAsdFsxMl09clswXSx0WzEzXT1yWzFdLHRbMTRdPXJbMl0sdFsxNV09MSx0fSxhLmZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVPcmlnaW49ZnVuY3Rpb24odCxlLHIsbixhKXt2YXIgaT1lWzBdLHU9ZVsxXSxvPWVbMl0scz1lWzNdLGw9aStpLGY9dSt1LGg9bytvLGM9aSpsLGQ9aSpmLHY9aSpoLF89dSpmLG09dSpoLHA9bypoLE09cypsLHg9cypmLGc9cypoLEU9blswXSxiPW5bMV0seT1uWzJdLFM9YVswXSxUPWFbMV0sST1hWzJdO3JldHVybiB0WzBdPSgxLShfK3ApKSpFLHRbMV09KGQrZykqRSx0WzJdPSh2LXgpKkUsdFszXT0wLHRbNF09KGQtZykqYix0WzVdPSgxLShjK3ApKSpiLHRbNl09KG0rTSkqYix0WzddPTAsdFs4XT0odit4KSp5LHRbOV09KG0tTSkqeSx0WzEwXT0oMS0oYytfKSkqeSx0WzExXT0wLHRbMTJdPXJbMF0rUy0odFswXSpTK3RbNF0qVCt0WzhdKkkpLHRbMTNdPXJbMV0rVC0odFsxXSpTK3RbNV0qVCt0WzldKkkpLHRbMTRdPXJbMl0rSS0odFsyXSpTK3RbNl0qVCt0WzEwXSpJKSx0WzE1XT0xLHR9LGEuZnJvbVF1YXQ9ZnVuY3Rpb24odCxlKXt2YXIgcj1lWzBdLG49ZVsxXSxhPWVbMl0saT1lWzNdLHU9cityLG89bituLHM9YSthLGw9cip1LGY9bip1LGg9bipvLGM9YSp1LGQ9YSpvLHY9YSpzLF89aSp1LG09aSpvLHA9aSpzO3JldHVybiB0WzBdPTEtaC12LHRbMV09ZitwLHRbMl09Yy1tLHRbM109MCx0WzRdPWYtcCx0WzVdPTEtbC12LHRbNl09ZCtfLHRbN109MCx0WzhdPWMrbSx0WzldPWQtXyx0WzEwXT0xLWwtaCx0WzExXT0wLHRbMTJdPTAsdFsxM109MCx0WzE0XT0wLHRbMTVdPTEsdH0sYS5mcnVzdHVtPWZ1bmN0aW9uKHQsZSxyLG4sYSxpLHUpe3ZhciBvPTEvKHItZSkscz0xLyhhLW4pLGw9MS8oaS11KTtyZXR1cm4gdFswXT0yKmkqbyx0WzFdPTAsdFsyXT0wLHRbM109MCx0WzRdPTAsdFs1XT0yKmkqcyx0WzZdPTAsdFs3XT0wLHRbOF09KHIrZSkqbyx0WzldPShhK24pKnMsdFsxMF09KHUraSkqbCx0WzExXT0tMSx0WzEyXT0wLHRbMTNdPTAsdFsxNF09dSppKjIqbCx0WzE1XT0wLHR9LGEucGVyc3BlY3RpdmU9ZnVuY3Rpb24odCxlLHIsbixhKXt2YXIgaT0xL01hdGgudGFuKGUvMiksdT0xLyhuLWEpO3JldHVybiB0WzBdPWkvcix0WzFdPTAsdFsyXT0wLHRbM109MCx0WzRdPTAsdFs1XT1pLHRbNl09MCx0WzddPTAsdFs4XT0wLHRbOV09MCx0WzEwXT0oYStuKSp1LHRbMTFdPS0xLHRbMTJdPTAsdFsxM109MCx0WzE0XT0yKmEqbip1LHRbMTVdPTAsdH0sYS5wZXJzcGVjdGl2ZUZyb21GaWVsZE9mVmlldz1mdW5jdGlvbih0LGUscixuKXt2YXIgYT1NYXRoLnRhbihlLnVwRGVncmVlcypNYXRoLlBJLzE4MCksaT1NYXRoLnRhbihlLmRvd25EZWdyZWVzKk1hdGguUEkvMTgwKSx1PU1hdGgudGFuKGUubGVmdERlZ3JlZXMqTWF0aC5QSS8xODApLG89TWF0aC50YW4oZS5yaWdodERlZ3JlZXMqTWF0aC5QSS8xODApLHM9Mi8odStvKSxsPTIvKGEraSk7cmV0dXJuIHRbMF09cyx0WzFdPTAsdFsyXT0wLHRbM109MCx0WzRdPTAsdFs1XT1sLHRbNl09MCx0WzddPTAsdFs4XT0tKCh1LW8pKnMqLjUpLHRbOV09KGEtaSkqbCouNSx0WzEwXT1uLyhyLW4pLHRbMTFdPS0xLHRbMTJdPTAsdFsxM109MCx0WzE0XT1uKnIvKHItbiksdFsxNV09MCx0fSxhLm9ydGhvPWZ1bmN0aW9uKHQsZSxyLG4sYSxpLHUpe3ZhciBvPTEvKGUtcikscz0xLyhuLWEpLGw9MS8oaS11KTtyZXR1cm4gdFswXT0tMipvLHRbMV09MCx0WzJdPTAsdFszXT0wLHRbNF09MCx0WzVdPS0yKnMsdFs2XT0wLHRbN109MCx0WzhdPTAsdFs5XT0wLHRbMTBdPTIqbCx0WzExXT0wLHRbMTJdPShlK3IpKm8sdFsxM109KGErbikqcyx0WzE0XT0odStpKSpsLHRbMTVdPTEsdH0sYS5sb29rQXQ9ZnVuY3Rpb24odCxlLHIsaSl7dmFyIHUsbyxzLGwsZixoLGMsZCx2LF8sbT1lWzBdLHA9ZVsxXSxNPWVbMl0seD1pWzBdLGc9aVsxXSxFPWlbMl0sYj1yWzBdLHk9clsxXSxTPXJbMl07cmV0dXJuIE1hdGguYWJzKG0tYik8bi5FUFNJTE9OJiZNYXRoLmFicyhwLXkpPG4uRVBTSUxPTiYmTWF0aC5hYnMoTS1TKTxuLkVQU0lMT04/YS5pZGVudGl0eSh0KTooYz1tLWIsZD1wLXksdj1NLVMsXz0xL01hdGguc3FydChjKmMrZCpkK3YqdiksYyo9XyxkKj1fLHYqPV8sdT1nKnYtRSpkLG89RSpjLXgqdixzPXgqZC1nKmMsXz1NYXRoLnNxcnQodSp1K28qbytzKnMpLF8/KF89MS9fLHUqPV8sbyo9XyxzKj1fKToodT0wLG89MCxzPTApLGw9ZCpzLXYqbyxmPXYqdS1jKnMsaD1jKm8tZCp1LF89TWF0aC5zcXJ0KGwqbCtmKmYraCpoKSxfPyhfPTEvXyxsKj1fLGYqPV8saCo9Xyk6KGw9MCxmPTAsaD0wKSx0WzBdPXUsdFsxXT1sLHRbMl09Yyx0WzNdPTAsdFs0XT1vLHRbNV09Zix0WzZdPWQsdFs3XT0wLHRbOF09cyx0WzldPWgsdFsxMF09dix0WzExXT0wLHRbMTJdPS0odSptK28qcCtzKk0pLHRbMTNdPS0obCptK2YqcCtoKk0pLHRbMTRdPS0oYyptK2QqcCt2Kk0pLHRbMTVdPTEsdCl9LGEuc3RyPWZ1bmN0aW9uKHQpe3JldHVyblwibWF0NChcIit0WzBdK1wiLCBcIit0WzFdK1wiLCBcIit0WzJdK1wiLCBcIit0WzNdK1wiLCBcIit0WzRdK1wiLCBcIit0WzVdK1wiLCBcIit0WzZdK1wiLCBcIit0WzddK1wiLCBcIit0WzhdK1wiLCBcIit0WzldK1wiLCBcIit0WzEwXStcIiwgXCIrdFsxMV0rXCIsIFwiK3RbMTJdK1wiLCBcIit0WzEzXStcIiwgXCIrdFsxNF0rXCIsIFwiK3RbMTVdK1wiKVwifSxhLmZyb2I9ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh0WzBdLDIpK01hdGgucG93KHRbMV0sMikrTWF0aC5wb3codFsyXSwyKStNYXRoLnBvdyh0WzNdLDIpK01hdGgucG93KHRbNF0sMikrTWF0aC5wb3codFs1XSwyKStNYXRoLnBvdyh0WzZdLDIpK01hdGgucG93KHRbN10sMikrTWF0aC5wb3codFs4XSwyKStNYXRoLnBvdyh0WzldLDIpK01hdGgucG93KHRbMTBdLDIpK01hdGgucG93KHRbMTFdLDIpK01hdGgucG93KHRbMTJdLDIpK01hdGgucG93KHRbMTNdLDIpK01hdGgucG93KHRbMTRdLDIpK01hdGgucG93KHRbMTVdLDIpKX0sYS5hZGQ9ZnVuY3Rpb24odCxlLHIpe3JldHVybiB0WzBdPWVbMF0rclswXSx0WzFdPWVbMV0rclsxXSx0WzJdPWVbMl0rclsyXSx0WzNdPWVbM10rclszXSx0WzRdPWVbNF0rcls0XSx0WzVdPWVbNV0rcls1XSx0WzZdPWVbNl0rcls2XSx0WzddPWVbN10rcls3XSx0WzhdPWVbOF0rcls4XSx0WzldPWVbOV0rcls5XSx0WzEwXT1lWzEwXStyWzEwXSx0WzExXT1lWzExXStyWzExXSx0WzEyXT1lWzEyXStyWzEyXSx0WzEzXT1lWzEzXStyWzEzXSx0WzE0XT1lWzE0XStyWzE0XSx0WzE1XT1lWzE1XStyWzE1XSx0fSxhLnN1YnRyYWN0PWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdLXJbMF0sdFsxXT1lWzFdLXJbMV0sdFsyXT1lWzJdLXJbMl0sdFszXT1lWzNdLXJbM10sdFs0XT1lWzRdLXJbNF0sdFs1XT1lWzVdLXJbNV0sdFs2XT1lWzZdLXJbNl0sdFs3XT1lWzddLXJbN10sdFs4XT1lWzhdLXJbOF0sdFs5XT1lWzldLXJbOV0sdFsxMF09ZVsxMF0tclsxMF0sdFsxMV09ZVsxMV0tclsxMV0sdFsxMl09ZVsxMl0tclsxMl0sdFsxM109ZVsxM10tclsxM10sdFsxNF09ZVsxNF0tclsxNF0sdFsxNV09ZVsxNV0tclsxNV0sdH0sYS5zdWI9YS5zdWJ0cmFjdCxhLm11bHRpcGx5U2NhbGFyPWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdKnIsdFsxXT1lWzFdKnIsdFsyXT1lWzJdKnIsdFszXT1lWzNdKnIsdFs0XT1lWzRdKnIsdFs1XT1lWzVdKnIsdFs2XT1lWzZdKnIsdFs3XT1lWzddKnIsdFs4XT1lWzhdKnIsdFs5XT1lWzldKnIsdFsxMF09ZVsxMF0qcix0WzExXT1lWzExXSpyLHRbMTJdPWVbMTJdKnIsdFsxM109ZVsxM10qcix0WzE0XT1lWzE0XSpyLHRbMTVdPWVbMTVdKnIsdH0sYS5tdWx0aXBseVNjYWxhckFuZEFkZD1mdW5jdGlvbih0LGUscixuKXtyZXR1cm4gdFswXT1lWzBdK3JbMF0qbix0WzFdPWVbMV0rclsxXSpuLHRbMl09ZVsyXStyWzJdKm4sdFszXT1lWzNdK3JbM10qbix0WzRdPWVbNF0rcls0XSpuLHRbNV09ZVs1XStyWzVdKm4sdFs2XT1lWzZdK3JbNl0qbix0WzddPWVbN10rcls3XSpuLHRbOF09ZVs4XStyWzhdKm4sdFs5XT1lWzldK3JbOV0qbix0WzEwXT1lWzEwXStyWzEwXSpuLHRbMTFdPWVbMTFdK3JbMTFdKm4sdFsxMl09ZVsxMl0rclsxMl0qbix0WzEzXT1lWzEzXStyWzEzXSpuLHRbMTRdPWVbMTRdK3JbMTRdKm4sdFsxNV09ZVsxNV0rclsxNV0qbix0fSxhLmV4YWN0RXF1YWxzPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09PT1lWzBdJiZ0WzFdPT09ZVsxXSYmdFsyXT09PWVbMl0mJnRbM109PT1lWzNdJiZ0WzRdPT09ZVs0XSYmdFs1XT09PWVbNV0mJnRbNl09PT1lWzZdJiZ0WzddPT09ZVs3XSYmdFs4XT09PWVbOF0mJnRbOV09PT1lWzldJiZ0WzEwXT09PWVbMTBdJiZ0WzExXT09PWVbMTFdJiZ0WzEyXT09PWVbMTJdJiZ0WzEzXT09PWVbMTNdJiZ0WzE0XT09PWVbMTRdJiZ0WzE1XT09PWVbMTVdfSxhLmVxdWFscz1mdW5jdGlvbih0LGUpe3ZhciByPXRbMF0sYT10WzFdLGk9dFsyXSx1PXRbM10sbz10WzRdLHM9dFs1XSxsPXRbNl0sZj10WzddLGg9dFs4XSxjPXRbOV0sZD10WzEwXSx2PXRbMTFdLF89dFsxMl0sbT10WzEzXSxwPXRbMTRdLE09dFsxNV0seD1lWzBdLGc9ZVsxXSxFPWVbMl0sYj1lWzNdLHk9ZVs0XSxTPWVbNV0sVD1lWzZdLEk9ZVs3XSxBPWVbOF0sRj1lWzldLEQ9ZVsxMF0sUj1lWzExXSx3PWVbMTJdLFA9ZVsxM10sTj1lWzE0XSxPPWVbMTVdO3JldHVybiBNYXRoLmFicyhyLXgpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhyKSxNYXRoLmFicyh4KSkmJk1hdGguYWJzKGEtZyk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKGEpLE1hdGguYWJzKGcpKSYmTWF0aC5hYnMoaS1FKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMoaSksTWF0aC5hYnMoRSkpJiZNYXRoLmFicyh1LWIpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyh1KSxNYXRoLmFicyhiKSkmJk1hdGguYWJzKG8teSk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKG8pLE1hdGguYWJzKHkpKSYmTWF0aC5hYnMocy1TKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMocyksTWF0aC5hYnMoUykpJiZNYXRoLmFicyhsLVQpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhsKSxNYXRoLmFicyhUKSkmJk1hdGguYWJzKGYtSSk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKGYpLE1hdGguYWJzKEkpKSYmTWF0aC5hYnMoaC1BKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMoaCksTWF0aC5hYnMoQSkpJiZNYXRoLmFicyhjLUYpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhjKSxNYXRoLmFicyhGKSkmJk1hdGguYWJzKGQtRCk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKGQpLE1hdGguYWJzKEQpKSYmTWF0aC5hYnModi1SKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnModiksTWF0aC5hYnMoUikpJiZNYXRoLmFicyhfLXcpPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhfKSxNYXRoLmFicyh3KSkmJk1hdGguYWJzKG0tUCk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKG0pLE1hdGguYWJzKFApKSYmTWF0aC5hYnMocC1OKTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMocCksTWF0aC5hYnMoTikpJiZNYXRoLmFicyhNLU8pPD1uLkVQU0lMT04qTWF0aC5tYXgoMSxNYXRoLmFicyhNKSxNYXRoLmFicyhPKSl9LHQuZXhwb3J0cz1hfSxmdW5jdGlvbih0LGUscil7dmFyIG49cigxMSksYT1yKDc5KSxpPXIoODApLHU9cig4MSksbz17fTtvLmNyZWF0ZT1mdW5jdGlvbigpe3ZhciB0PW5ldyBuLkFSUkFZX1RZUEUoNCk7cmV0dXJuIHRbMF09MCx0WzFdPTAsdFsyXT0wLHRbM109MSx0fSxvLnJvdGF0aW9uVG89ZnVuY3Rpb24oKXt2YXIgdD1pLmNyZWF0ZSgpLGU9aS5mcm9tVmFsdWVzKDEsMCwwKSxyPWkuZnJvbVZhbHVlcygwLDEsMCk7cmV0dXJuIGZ1bmN0aW9uKG4sYSx1KXt2YXIgcz1pLmRvdChhLHUpO3JldHVybi0uOTk5OTk5PnM/KGkuY3Jvc3ModCxlLGEpLGkubGVuZ3RoKHQpPDFlLTYmJmkuY3Jvc3ModCxyLGEpLGkubm9ybWFsaXplKHQsdCksby5zZXRBeGlzQW5nbGUobix0LE1hdGguUEkpLG4pOnM+Ljk5OTk5OT8oblswXT0wLG5bMV09MCxuWzJdPTAsblszXT0xLG4pOihpLmNyb3NzKHQsYSx1KSxuWzBdPXRbMF0sblsxXT10WzFdLG5bMl09dFsyXSxuWzNdPTErcyxvLm5vcm1hbGl6ZShuLG4pKX19KCksby5zZXRBeGVzPWZ1bmN0aW9uKCl7dmFyIHQ9YS5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24oZSxyLG4sYSl7cmV0dXJuIHRbMF09blswXSx0WzNdPW5bMV0sdFs2XT1uWzJdLHRbMV09YVswXSx0WzRdPWFbMV0sdFs3XT1hWzJdLHRbMl09LXJbMF0sdFs1XT0tclsxXSx0WzhdPS1yWzJdLG8ubm9ybWFsaXplKGUsby5mcm9tTWF0MyhlLHQpKX19KCksby5jbG9uZT11LmNsb25lLG8uZnJvbVZhbHVlcz11LmZyb21WYWx1ZXMsby5jb3B5PXUuY29weSxvLnNldD11LnNldCxvLmlkZW50aXR5PWZ1bmN0aW9uKHQpe3JldHVybiB0WzBdPTAsdFsxXT0wLHRbMl09MCx0WzNdPTEsdH0sby5zZXRBeGlzQW5nbGU9ZnVuY3Rpb24odCxlLHIpe3I9LjUqcjt2YXIgbj1NYXRoLnNpbihyKTtyZXR1cm4gdFswXT1uKmVbMF0sdFsxXT1uKmVbMV0sdFsyXT1uKmVbMl0sdFszXT1NYXRoLmNvcyhyKSx0fSxvLmdldEF4aXNBbmdsZT1mdW5jdGlvbih0LGUpe3ZhciByPTIqTWF0aC5hY29zKGVbM10pLG49TWF0aC5zaW4oci8yKTtyZXR1cm4gMCE9bj8odFswXT1lWzBdL24sdFsxXT1lWzFdL24sdFsyXT1lWzJdL24pOih0WzBdPTEsdFsxXT0wLHRbMl09MCkscn0sby5hZGQ9dS5hZGQsby5tdWx0aXBseT1mdW5jdGlvbih0LGUscil7dmFyIG49ZVswXSxhPWVbMV0saT1lWzJdLHU9ZVszXSxvPXJbMF0scz1yWzFdLGw9clsyXSxmPXJbM107cmV0dXJuIHRbMF09bipmK3UqbythKmwtaSpzLHRbMV09YSpmK3UqcytpKm8tbipsLHRbMl09aSpmK3UqbCtuKnMtYSpvLHRbM109dSpmLW4qby1hKnMtaSpsLHR9LG8ubXVsPW8ubXVsdGlwbHksby5zY2FsZT11LnNjYWxlLG8ucm90YXRlWD1mdW5jdGlvbih0LGUscil7cio9LjU7dmFyIG49ZVswXSxhPWVbMV0saT1lWzJdLHU9ZVszXSxvPU1hdGguc2luKHIpLHM9TWF0aC5jb3Mocik7cmV0dXJuIHRbMF09bipzK3Uqbyx0WzFdPWEqcytpKm8sdFsyXT1pKnMtYSpvLHRbM109dSpzLW4qbyx0fSxvLnJvdGF0ZVk9ZnVuY3Rpb24odCxlLHIpe3IqPS41O3ZhciBuPWVbMF0sYT1lWzFdLGk9ZVsyXSx1PWVbM10sbz1NYXRoLnNpbihyKSxzPU1hdGguY29zKHIpO3JldHVybiB0WzBdPW4qcy1pKm8sdFsxXT1hKnMrdSpvLHRbMl09aSpzK24qbyx0WzNdPXUqcy1hKm8sdH0sby5yb3RhdGVaPWZ1bmN0aW9uKHQsZSxyKXtyKj0uNTt2YXIgbj1lWzBdLGE9ZVsxXSxpPWVbMl0sdT1lWzNdLG89TWF0aC5zaW4ocikscz1NYXRoLmNvcyhyKTtyZXR1cm4gdFswXT1uKnMrYSpvLHRbMV09YSpzLW4qbyx0WzJdPWkqcyt1Km8sdFszXT11KnMtaSpvLHR9LG8uY2FsY3VsYXRlVz1mdW5jdGlvbih0LGUpe3ZhciByPWVbMF0sbj1lWzFdLGE9ZVsyXTtyZXR1cm4gdFswXT1yLHRbMV09bix0WzJdPWEsdFszXT1NYXRoLnNxcnQoTWF0aC5hYnMoMS1yKnItbipuLWEqYSkpLHR9LG8uZG90PXUuZG90LG8ubGVycD11LmxlcnAsby5zbGVycD1mdW5jdGlvbih0LGUscixuKXt2YXIgYSxpLHUsbyxzLGw9ZVswXSxmPWVbMV0saD1lWzJdLGM9ZVszXSxkPXJbMF0sdj1yWzFdLF89clsyXSxtPXJbM107cmV0dXJuIGk9bCpkK2YqditoKl8rYyptLDA+aSYmKGk9LWksZD0tZCx2PS12LF89LV8sbT0tbSksMS1pPjFlLTY/KGE9TWF0aC5hY29zKGkpLHU9TWF0aC5zaW4oYSksbz1NYXRoLnNpbigoMS1uKSphKS91LHM9TWF0aC5zaW4obiphKS91KToobz0xLW4scz1uKSx0WzBdPW8qbCtzKmQsdFsxXT1vKmYrcyp2LHRbMl09bypoK3MqXyx0WzNdPW8qYytzKm0sdH0sby5zcWxlcnA9ZnVuY3Rpb24oKXt2YXIgdD1vLmNyZWF0ZSgpLGU9by5jcmVhdGUoKTtyZXR1cm4gZnVuY3Rpb24ocixuLGEsaSx1LHMpe3JldHVybiBvLnNsZXJwKHQsbix1LHMpLG8uc2xlcnAoZSxhLGkscyksby5zbGVycChyLHQsZSwyKnMqKDEtcykpLHJ9fSgpLG8uaW52ZXJ0PWZ1bmN0aW9uKHQsZSl7dmFyIHI9ZVswXSxuPWVbMV0sYT1lWzJdLGk9ZVszXSx1PXIqcituKm4rYSphK2kqaSxvPXU/MS91OjA7cmV0dXJuIHRbMF09LXIqbyx0WzFdPS1uKm8sdFsyXT0tYSpvLHRbM109aSpvLHR9LG8uY29uanVnYXRlPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09LWVbMF0sdFsxXT0tZVsxXSx0WzJdPS1lWzJdLHRbM109ZVszXSx0fSxvLmxlbmd0aD11Lmxlbmd0aCxvLmxlbj1vLmxlbmd0aCxvLnNxdWFyZWRMZW5ndGg9dS5zcXVhcmVkTGVuZ3RoLG8uc3FyTGVuPW8uc3F1YXJlZExlbmd0aCxvLm5vcm1hbGl6ZT11Lm5vcm1hbGl6ZSxvLmZyb21NYXQzPWZ1bmN0aW9uKHQsZSl7dmFyIHIsbj1lWzBdK2VbNF0rZVs4XTtpZihuPjApcj1NYXRoLnNxcnQobisxKSx0WzNdPS41KnIscj0uNS9yLHRbMF09KGVbNV0tZVs3XSkqcix0WzFdPShlWzZdLWVbMl0pKnIsdFsyXT0oZVsxXS1lWzNdKSpyO2Vsc2V7dmFyIGE9MDtlWzRdPmVbMF0mJihhPTEpLGVbOF0+ZVszKmErYV0mJihhPTIpO3ZhciBpPShhKzEpJTMsdT0oYSsyKSUzO3I9TWF0aC5zcXJ0KGVbMyphK2FdLWVbMyppK2ldLWVbMyp1K3VdKzEpLHRbYV09LjUqcixyPS41L3IsdFszXT0oZVszKmkrdV0tZVszKnUraV0pKnIsdFtpXT0oZVszKmkrYV0rZVszKmEraV0pKnIsdFt1XT0oZVszKnUrYV0rZVszKmErdV0pKnJ9cmV0dXJuIHR9LG8uc3RyPWZ1bmN0aW9uKHQpe3JldHVyblwicXVhdChcIit0WzBdK1wiLCBcIit0WzFdK1wiLCBcIit0WzJdK1wiLCBcIit0WzNdK1wiKVwifSxvLmV4YWN0RXF1YWxzPXUuZXhhY3RFcXVhbHMsby5lcXVhbHM9dS5lcXVhbHMsdC5leHBvcnRzPW99LGZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1yKDExKSxhPXt9O2EuY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIHQ9bmV3IG4uQVJSQVlfVFlQRSgyKTtyZXR1cm4gdFswXT0wLHRbMV09MCx0fSxhLmNsb25lPWZ1bmN0aW9uKHQpe3ZhciBlPW5ldyBuLkFSUkFZX1RZUEUoMik7cmV0dXJuIGVbMF09dFswXSxlWzFdPXRbMV0sZX0sYS5mcm9tVmFsdWVzPWZ1bmN0aW9uKHQsZSl7dmFyIHI9bmV3IG4uQVJSQVlfVFlQRSgyKTtyZXR1cm4gclswXT10LHJbMV09ZSxyfSxhLmNvcHk9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT1lWzBdLHRbMV09ZVsxXSx0fSxhLnNldD1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09ZSx0WzFdPXIsdH0sYS5hZGQ9ZnVuY3Rpb24odCxlLHIpe3JldHVybiB0WzBdPWVbMF0rclswXSx0WzFdPWVbMV0rclsxXSx0fSxhLnN1YnRyYWN0PWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdLXJbMF0sdFsxXT1lWzFdLXJbMV0sdH0sYS5zdWI9YS5zdWJ0cmFjdCxhLm11bHRpcGx5PWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1lWzBdKnJbMF0sdFsxXT1lWzFdKnJbMV0sdH0sYS5tdWw9YS5tdWx0aXBseSxhLmRpdmlkZT1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09ZVswXS9yWzBdLHRbMV09ZVsxXS9yWzFdLHR9LGEuZGl2PWEuZGl2aWRlLGEuY2VpbD1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPU1hdGguY2VpbChlWzBdKSx0WzFdPU1hdGguY2VpbChlWzFdKSx0fSxhLmZsb29yPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09TWF0aC5mbG9vcihlWzBdKSx0WzFdPU1hdGguZmxvb3IoZVsxXSksdH0sYS5taW49ZnVuY3Rpb24odCxlLHIpe3JldHVybiB0WzBdPU1hdGgubWluKGVbMF0sclswXSksdFsxXT1NYXRoLm1pbihlWzFdLHJbMV0pLHR9LGEubWF4PWZ1bmN0aW9uKHQsZSxyKXtyZXR1cm4gdFswXT1NYXRoLm1heChlWzBdLHJbMF0pLHRbMV09TWF0aC5tYXgoZVsxXSxyWzFdKSx0fSxhLnJvdW5kPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHRbMF09TWF0aC5yb3VuZChlWzBdKSx0WzFdPU1hdGgucm91bmQoZVsxXSksdH0sYS5zY2FsZT1mdW5jdGlvbih0LGUscil7cmV0dXJuIHRbMF09ZVswXSpyLHRbMV09ZVsxXSpyLHR9LGEuc2NhbGVBbmRBZGQ9ZnVuY3Rpb24odCxlLHIsbil7cmV0dXJuIHRbMF09ZVswXStyWzBdKm4sdFsxXT1lWzFdK3JbMV0qbix0fSxhLmRpc3RhbmNlPWZ1bmN0aW9uKHQsZSl7dmFyIHI9ZVswXS10WzBdLG49ZVsxXS10WzFdO3JldHVybiBNYXRoLnNxcnQocipyK24qbil9LGEuZGlzdD1hLmRpc3RhbmNlLGEuc3F1YXJlZERpc3RhbmNlPWZ1bmN0aW9uKHQsZSl7dmFyIHI9ZVswXS10WzBdLG49ZVsxXS10WzFdO3JldHVybiByKnIrbipufSxhLnNxckRpc3Q9YS5zcXVhcmVkRGlzdGFuY2UsYS5sZW5ndGg9ZnVuY3Rpb24odCl7dmFyIGU9dFswXSxyPXRbMV07cmV0dXJuIE1hdGguc3FydChlKmUrcipyKX0sYS5sZW49YS5sZW5ndGgsYS5zcXVhcmVkTGVuZ3RoPWZ1bmN0aW9uKHQpe3ZhciBlPXRbMF0scj10WzFdO3JldHVybiBlKmUrcipyfSxhLnNxckxlbj1hLnNxdWFyZWRMZW5ndGgsYS5uZWdhdGU9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT0tZVswXSx0WzFdPS1lWzFdLHR9LGEuaW52ZXJzZT1mdW5jdGlvbih0LGUpe3JldHVybiB0WzBdPTEvZVswXSx0WzFdPTEvZVsxXSx0fSxhLm5vcm1hbGl6ZT1mdW5jdGlvbih0LGUpe3ZhciByPWVbMF0sbj1lWzFdLGE9cipyK24qbjtyZXR1cm4gYT4wJiYoYT0xL01hdGguc3FydChhKSx0WzBdPWVbMF0qYSx0WzFdPWVbMV0qYSksdH0sYS5kb3Q9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXSplWzBdK3RbMV0qZVsxXX0sYS5jcm9zcz1mdW5jdGlvbih0LGUscil7dmFyIG49ZVswXSpyWzFdLWVbMV0qclswXTtyZXR1cm4gdFswXT10WzFdPTAsdFsyXT1uLHR9LGEubGVycD1mdW5jdGlvbih0LGUscixuKXt2YXIgYT1lWzBdLGk9ZVsxXTtyZXR1cm4gdFswXT1hK24qKHJbMF0tYSksdFsxXT1pK24qKHJbMV0taSksdH0sYS5yYW5kb209ZnVuY3Rpb24odCxlKXtlPWV8fDE7dmFyIHI9MipuLlJBTkRPTSgpKk1hdGguUEk7cmV0dXJuIHRbMF09TWF0aC5jb3MocikqZSx0WzFdPU1hdGguc2luKHIpKmUsdH0sYS50cmFuc2Zvcm1NYXQyPWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1lWzBdLGE9ZVsxXTtyZXR1cm4gdFswXT1yWzBdKm4rclsyXSphLHRbMV09clsxXSpuK3JbM10qYSx0fSxhLnRyYW5zZm9ybU1hdDJkPWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1lWzBdLGE9ZVsxXTtyZXR1cm4gdFswXT1yWzBdKm4rclsyXSphK3JbNF0sdFsxXT1yWzFdKm4rclszXSphK3JbNV0sdH0sYS50cmFuc2Zvcm1NYXQzPWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1lWzBdLGE9ZVsxXTtyZXR1cm4gdFswXT1yWzBdKm4rclszXSphK3JbNl0sdFsxXT1yWzFdKm4rcls0XSphK3JbN10sdH0sYS50cmFuc2Zvcm1NYXQ0PWZ1bmN0aW9uKHQsZSxyKXt2YXIgbj1lWzBdLGE9ZVsxXTtyZXR1cm4gdFswXT1yWzBdKm4rcls0XSphK3JbMTJdLHRbMV09clsxXSpuK3JbNV0qYStyWzEzXSx0fSxhLmZvckVhY2g9ZnVuY3Rpb24oKXt2YXIgdD1hLmNyZWF0ZSgpO3JldHVybiBmdW5jdGlvbihlLHIsbixhLGksdSl7dmFyIG8scztmb3Iocnx8KHI9Miksbnx8KG49MCkscz1hP01hdGgubWluKGEqcituLGUubGVuZ3RoKTplLmxlbmd0aCxvPW47cz5vO28rPXIpdFswXT1lW29dLHRbMV09ZVtvKzFdLGkodCx0LHUpLGVbb109dFswXSxlW28rMV09dFsxXTtyZXR1cm4gZX19KCksYS5zdHI9ZnVuY3Rpb24odCl7cmV0dXJuXCJ2ZWMyKFwiK3RbMF0rXCIsIFwiK3RbMV0rXCIpXCJ9LGEuZXhhY3RFcXVhbHM9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdFswXT09PWVbMF0mJnRbMV09PT1lWzFdfSxhLmVxdWFscz1mdW5jdGlvbih0LGUpe3ZhciByPXRbMF0sYT10WzFdLGk9ZVswXSx1PWVbMV07cmV0dXJuIE1hdGguYWJzKHItaSk8PW4uRVBTSUxPTipNYXRoLm1heCgxLE1hdGguYWJzKHIpLE1hdGguYWJzKGkpKSYmTWF0aC5hYnMoYS11KTw9bi5FUFNJTE9OKk1hdGgubWF4KDEsTWF0aC5hYnMoYSksTWF0aC5hYnModSkpfSx0LmV4cG9ydHM9YX0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9ZnVuY3Rpb24oKXt0aHJvdyBuZXcgRXJyb3IoXCJJdCBhcHBlYXJzIHRoYXQgeW91J3JlIHVzaW5nIGdsc2xpZnkgaW4gYnJvd3NlcmlmeSB3aXRob3V0IGl0cyB0cmFuc2Zvcm0gYXBwbGllZC4gTWFrZSBzdXJlIHRoYXQgeW91J3ZlIHNldCB1cCBnbHNsaWZ5IGFzIGEgc291cmNlIHRyYW5zZm9ybTogaHR0cHM6Ly9naXRodWIuY29tL3N1YnN0YWNrL25vZGUtYnJvd3NlcmlmeSNicm93c2VyaWZ5dHJhbnNmb3JtXCIpfX0sZnVuY3Rpb24odCxlKXtmdW5jdGlvbiByKHQpe3ZhciBlPW5ldyBJbnQzMkFycmF5KHQsMCxtKTtpZihlW3BdIT09aSl0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1hZ2ljIG51bWJlciBpbiBERFMgaGVhZGVyXCIpO2lmKCFlW3ldJm8pdGhyb3cgbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgZm9ybWF0LCBtdXN0IGNvbnRhaW4gYSBGb3VyQ0MgY29kZVwiKTt2YXIgcixuLEk9ZVtTXTtzd2l0Y2goSSl7Y2FzZSBzOnI9OCxuPVwiZHh0MVwiO2JyZWFrO2Nhc2UgbDpyPTE2LG49XCJkeHQzXCI7YnJlYWs7Y2FzZSBmOnI9MTYsbj1cImR4dDVcIjticmVhaztjYXNlIGM6bj1cInJnYmEzMmZcIjticmVhaztjYXNlIGg6dmFyIEE9bmV3IFVpbnQzMkFycmF5KHQuc2xpY2UoMTI4LDE0OCkpO249QVswXTt2YXIgRj1BWzFdO0FbMl0sQVszXSxBWzRdO2lmKEYhPT12fHxuIT09Xyl0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBEWDEwIHRleHR1cmUgZm9ybWF0IFwiK24pO249XCJyZ2JhMzJmXCI7YnJlYWs7ZGVmYXVsdDp0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBGb3VyQ0MgY29kZTogXCIrYShJKSl9dmFyIEQ9ZVt4XSxSPTE7RCZ1JiYoUj1NYXRoLm1heCgxLGVbYl0pKTt2YXIgdz0hMSxQPWVbVF07UCZkJiYodz0hMCk7dmFyIE4sTz1lW0VdLEw9ZVtnXSxrPWVbTV0rNCxDPU8sVT1MLEI9W107aWYoST09PWgmJihrKz0yMCksdylmb3IodmFyIFg9MDs2Plg7WCsrKXtpZihcInJnYmEzMmZcIiE9PW4pdGhyb3cgbmV3IEVycm9yKFwiT25seSBSR0JBMzJmIGN1YmVtYXBzIGFyZSBzdXBwb3J0ZWRcIik7dmFyIHE9MTY7Tz1DLEw9VTtmb3IodmFyIFY9TWF0aC5sb2coTykvTWF0aC5sb2coMikrMSx6PTA7Vj56O3orKylOPU8qTCpxLEIucHVzaCh7b2Zmc2V0OmssbGVuZ3RoOk4sc2hhcGU6W08sTF19KSxSPnomJihrKz1OKSxPPU1hdGguZmxvb3IoTy8yKSxMPU1hdGguZmxvb3IoTC8yKX1lbHNlIGZvcih2YXIgej0wO1I+ejt6KyspTj1NYXRoLm1heCg0LE8pLzQqTWF0aC5tYXgoNCxMKS80KnIsQi5wdXNoKHtvZmZzZXQ6ayxsZW5ndGg6TixzaGFwZTpbTyxMXX0pLGsrPU4sTz1NYXRoLmZsb29yKE8vMiksTD1NYXRoLmZsb29yKEwvMik7cmV0dXJue3NoYXBlOltDLFVdLGltYWdlczpCLGZvcm1hdDpuLGZsYWdzOkQsY3ViZW1hcDp3fX1mdW5jdGlvbiBuKHQpe3JldHVybiB0LmNoYXJDb2RlQXQoMCkrKHQuY2hhckNvZGVBdCgxKTw8OCkrKHQuY2hhckNvZGVBdCgyKTw8MTYpKyh0LmNoYXJDb2RlQXQoMyk8PDI0KX1mdW5jdGlvbiBhKHQpe3JldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDI1NSZ0LHQ+PjgmMjU1LHQ+PjE2JjI1NSx0Pj4yNCYyNTUpfXZhciBpPTU0MjMyNzg3Nix1PTEzMTA3MixvPTQscz1uKFwiRFhUMVwiKSxsPW4oXCJEWFQzXCIpLGY9bihcIkRYVDVcIiksaD1uKFwiRFgxMFwiKSxjPTExNixkPTUxMix2PTMsXz0yLG09MzEscD0wLE09MSx4PTIsZz0zLEU9NCxiPTcseT0yMCxTPTIxLFQ9Mjg7dC5leHBvcnRzPXJ9LGZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPVwiLy8gYXhpcy5mcmFnXFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBTSU1QTEVfVEVYVFVSRVxcblxcbnByZWNpc2lvbiBsb3dwIGZsb2F0O1xcbiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMzIHZDb2xvcjtcXG52YXJ5aW5nIHZlYzMgdk5vcm1hbDtcXG5cXG52b2lkIG1haW4odm9pZCkge1xcblx0Ly8gdmVjMyBjb2xvciA9IHZOb3JtYWw7XFxuXHR2ZWMzIGNvbG9yID0gdkNvbG9yICsgdk5vcm1hbCAqIDAuMDAwMTtcXG4gICAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4wKTtcXG59XCJ9LGZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPVwiLy8gYXhpcy52ZXJ0XFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBCQVNJQ19WRVJURVhcXG5cXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuI2RlZmluZSBHTFNMSUZZIDFcXG5hdHRyaWJ1dGUgdmVjMyBhVmVydGV4UG9zaXRpb247XFxuYXR0cmlidXRlIHZlYzMgYUNvbG9yO1xcbmF0dHJpYnV0ZSB2ZWMzIGFOb3JtYWw7XFxuXFxudW5pZm9ybSBtYXQ0IHVNb2RlbE1hdHJpeDtcXG51bmlmb3JtIG1hdDQgdVZpZXdNYXRyaXg7XFxudW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uTWF0cml4O1xcblxcbnZhcnlpbmcgdmVjMyB2Q29sb3I7XFxudmFyeWluZyB2ZWMzIHZOb3JtYWw7XFxuXFxudm9pZCBtYWluKHZvaWQpIHtcXG4gICAgZ2xfUG9zaXRpb24gPSB1UHJvamVjdGlvbk1hdHJpeCAqIHVWaWV3TWF0cml4ICogdU1vZGVsTWF0cml4ICogdmVjNChhVmVydGV4UG9zaXRpb24sIDEuMCk7XFxuICAgIHZDb2xvciA9IGFDb2xvcjtcXG4gICAgdk5vcm1hbCA9IGFOb3JtYWw7XFxufVwifSxmdW5jdGlvbih0LGUpe3QuZXhwb3J0cz1cIi8vIGJhc2ljLmZyYWdcXG5cXG4jZGVmaW5lIFNIQURFUl9OQU1FIEJBU0lDX0ZSQUdNRU5UXFxuXFxucHJlY2lzaW9uIGxvd3AgZmxvYXQ7XFxuI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcXG51bmlmb3JtIGZsb2F0IHRpbWU7XFxuLy8gdW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZUZXh0dXJlQ29vcmQsIHNpbih0aW1lKSAqIC41ICsgLjUsIDEuMCk7XFxufVwifSxmdW5jdGlvbih0LGUpe3QuZXhwb3J0cz1cIi8vIGJsdXIxMy5mcmFnXFxuLy8gc291cmNlICA6IGh0dHBzOi8vZ2l0aHViLmNvbS9KYW0zL2dsc2wtZmFzdC1nYXVzc2lhbi1ibHVyXFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBCTFVSXzEzXFxuXFxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xcbiNkZWZpbmUgR0xTTElGWSAxXFxudmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XFxudW5pZm9ybSBzYW1wbGVyMkQgdGV4dHVyZTtcXG51bmlmb3JtIHZlYzIgdURpcmVjdGlvbjtcXG51bmlmb3JtIHZlYzIgdVJlc29sdXRpb247XFxuXFxudmVjNCBibHVyMTMoc2FtcGxlcjJEIGltYWdlLCB2ZWMyIHV2LCB2ZWMyIHJlc29sdXRpb24sIHZlYzIgZGlyZWN0aW9uKSB7XFxuXHR2ZWM0IGNvbG9yID0gdmVjNCgwLjApO1xcblx0dmVjMiBvZmYxID0gdmVjMigxLjQxMTc2NDcwNTg4MjM1MykgKiBkaXJlY3Rpb247XFxuXHR2ZWMyIG9mZjIgPSB2ZWMyKDMuMjk0MTE3NjQ3MDU4ODIzNCkgKiBkaXJlY3Rpb247XFxuXHR2ZWMyIG9mZjMgPSB2ZWMyKDUuMTc2NDcwNTg4MjM1Mjk0KSAqIGRpcmVjdGlvbjtcXG5cdGNvbG9yICs9IHRleHR1cmUyRChpbWFnZSwgdXYpICogMC4xOTY0ODI1NTAxNTExNDA0O1xcblx0Y29sb3IgKz0gdGV4dHVyZTJEKGltYWdlLCB1diArIChvZmYxIC8gcmVzb2x1dGlvbikpICogMC4yOTY5MDY5NjQ2NzI4MzQ0O1xcblx0Y29sb3IgKz0gdGV4dHVyZTJEKGltYWdlLCB1diAtIChvZmYxIC8gcmVzb2x1dGlvbikpICogMC4yOTY5MDY5NjQ2NzI4MzQ0O1xcblx0Y29sb3IgKz0gdGV4dHVyZTJEKGltYWdlLCB1diArIChvZmYyIC8gcmVzb2x1dGlvbikpICogMC4wOTQ0NzAzOTc4NTA0NDczMjtcXG5cdGNvbG9yICs9IHRleHR1cmUyRChpbWFnZSwgdXYgLSAob2ZmMiAvIHJlc29sdXRpb24pKSAqIDAuMDk0NDcwMzk3ODUwNDQ3MzI7XFxuXHRjb2xvciArPSB0ZXh0dXJlMkQoaW1hZ2UsIHV2ICsgKG9mZjMgLyByZXNvbHV0aW9uKSkgKiAwLjAxMDM4MTM2MjQwMTE0ODA1NztcXG5cdGNvbG9yICs9IHRleHR1cmUyRChpbWFnZSwgdXYgLSAob2ZmMyAvIHJlc29sdXRpb24pKSAqIDAuMDEwMzgxMzYyNDAxMTQ4MDU3O1xcblx0cmV0dXJuIGNvbG9yO1xcbn1cXG5cXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiAgICBnbF9GcmFnQ29sb3IgPSBibHVyMTModGV4dHVyZSwgdlRleHR1cmVDb29yZCwgdVJlc29sdXRpb24sIHVEaXJlY3Rpb24pO1xcbn1cIn0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9XCIvLyBibHVyNS5mcmFnXFxuLy8gc291cmNlICA6IGh0dHBzOi8vZ2l0aHViLmNvbS9KYW0zL2dsc2wtZmFzdC1nYXVzc2lhbi1ibHVyXFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBCTFVSXzVcXG5cXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcbnVuaWZvcm0gdmVjMiB1RGlyZWN0aW9uO1xcbnVuaWZvcm0gdmVjMiB1UmVzb2x1dGlvbjtcXG5cXG52ZWM0IGJsdXI1KHNhbXBsZXIyRCBpbWFnZSwgdmVjMiB1diwgdmVjMiByZXNvbHV0aW9uLCB2ZWMyIGRpcmVjdGlvbikge1xcblx0dmVjNCBjb2xvciA9IHZlYzQoMC4wKTtcXG5cdHZlYzIgb2ZmMSA9IHZlYzIoMS4zMzMzMzMzMzMzMzMzMzMzKSAqIGRpcmVjdGlvbjtcXG5cdGNvbG9yICs9IHRleHR1cmUyRChpbWFnZSwgdXYpICogMC4yOTQxMTc2NDcwNTg4MjM1NDtcXG5cdGNvbG9yICs9IHRleHR1cmUyRChpbWFnZSwgdXYgKyAob2ZmMSAvIHJlc29sdXRpb24pKSAqIDAuMzUyOTQxMTc2NDcwNTg4MjY7XFxuXHRjb2xvciArPSB0ZXh0dXJlMkQoaW1hZ2UsIHV2IC0gKG9mZjEgLyByZXNvbHV0aW9uKSkgKiAwLjM1Mjk0MTE3NjQ3MDU4ODI2O1xcblx0cmV0dXJuIGNvbG9yOyBcXG59XFxuXFxuXFxudm9pZCBtYWluKHZvaWQpIHtcXG4gICAgZ2xfRnJhZ0NvbG9yID0gYmx1cjUodGV4dHVyZSwgdlRleHR1cmVDb29yZCwgdVJlc29sdXRpb24sIHVEaXJlY3Rpb24pO1xcbn1cIn0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9XCIvLyBibHVyOS5mcmFnXFxuLy8gc291cmNlICA6IGh0dHBzOi8vZ2l0aHViLmNvbS9KYW0zL2dsc2wtZmFzdC1nYXVzc2lhbi1ibHVyXFxuXFxuI2RlZmluZSBTSEFERVJfTkFNRSBCTFVSXzlcXG5cXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuI2RlZmluZSBHTFNMSUZZIDFcXG52YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcbnVuaWZvcm0gdmVjMiB1RGlyZWN0aW9uO1xcbnVuaWZvcm0gdmVjMiB1UmVzb2x1dGlvbjtcXG5cXG52ZWM0IGJsdXI5KHNhbXBsZXIyRCBpbWFnZSwgdmVjMiB1diwgdmVjMiByZXNvbHV0aW9uLCB2ZWMyIGRpcmVjdGlvbikge1xcblx0dmVjNCBjb2xvciA9IHZlYzQoMC4wKTtcXG5cdHZlYzIgb2ZmMSA9IHZlYzIoMS4zODQ2MTUzODQ2KSAqIGRpcmVjdGlvbjtcXG5cdHZlYzIgb2ZmMiA9IHZlYzIoMy4yMzA3NjkyMzA4KSAqIGRpcmVjdGlvbjtcXG5cdGNvbG9yICs9IHRleHR1cmUyRChpbWFnZSwgdXYpICogMC4yMjcwMjcwMjcwO1xcblx0Y29sb3IgKz0gdGV4dHVyZTJEKGltYWdlLCB1diArIChvZmYxIC8gcmVzb2x1dGlvbikpICogMC4zMTYyMTYyMTYyO1xcblx0Y29sb3IgKz0gdGV4dHVyZTJEKGltYWdlLCB1diAtIChvZmYxIC8gcmVzb2x1dGlvbikpICogMC4zMTYyMTYyMTYyO1xcblx0Y29sb3IgKz0gdGV4dHVyZTJEKGltYWdlLCB1diArIChvZmYyIC8gcmVzb2x1dGlvbikpICogMC4wNzAyNzAyNzAzO1xcblx0Y29sb3IgKz0gdGV4dHVyZTJEKGltYWdlLCB1diAtIChvZmYyIC8gcmVzb2x1dGlvbikpICogMC4wNzAyNzAyNzAzO1xcblx0cmV0dXJuIGNvbG9yO1xcbn1cXG5cXG5cXG52b2lkIG1haW4odm9pZCkge1xcbiAgICBnbF9GcmFnQ29sb3IgPSBibHVyOSh0ZXh0dXJlLCB2VGV4dHVyZUNvb3JkLCB1UmVzb2x1dGlvbiwgdURpcmVjdGlvbik7XFxufVwifSxmdW5jdGlvbih0LGUpe3QuZXhwb3J0cz1cIi8vIGJhc2ljLnZlcnRcXG5cXG4jZGVmaW5lIFNIQURFUl9OQU1FIERPVFNfUExBTkVfVkVSVEVYXFxuXFxucHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xcbiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgYVZlcnRleFBvc2l0aW9uO1xcbmF0dHJpYnV0ZSB2ZWMzIGFOb3JtYWw7XFxuXFxudW5pZm9ybSBtYXQ0IHVNb2RlbE1hdHJpeDtcXG51bmlmb3JtIG1hdDQgdVZpZXdNYXRyaXg7XFxudW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uTWF0cml4O1xcblxcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcblxcbnZvaWQgbWFpbih2b2lkKSB7XFxuICAgIGdsX1Bvc2l0aW9uID0gdVByb2plY3Rpb25NYXRyaXggKiB1Vmlld01hdHJpeCAqIHVNb2RlbE1hdHJpeCAqIHZlYzQoYVZlcnRleFBvc2l0aW9uICsgYU5vcm1hbCAqIDAuMDAwMDAxLCAxLjApO1xcbiAgICBnbF9Qb2ludFNpemUgPSAxLjA7XFxuICAgIHZOb3JtYWwgPSBhTm9ybWFsO1xcbn1cIn0sZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9XCIvLyBza3kudmVydFxcblxcbnByZWNpc2lvbiBoaWdocCBmbG9hdDtcXG4jZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIGFWZXJ0ZXhQb3NpdGlvbjtcXG5hdHRyaWJ1dGUgdmVjMiBhVGV4dHVyZUNvb3JkO1xcbmF0dHJpYnV0ZSB2ZWMzIGFOb3JtYWw7XFxuXFxudW5pZm9ybSBtYXQ0IHVNb2RlbE1hdHJpeDtcXG51bmlmb3JtIG1hdDQgdVZpZXdNYXRyaXg7XFxudW5pZm9ybSBtYXQ0IHVQcm9qZWN0aW9uTWF0cml4O1xcblxcbnZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1xcbnZhcnlpbmcgdmVjMyB2Tm9ybWFsO1xcblxcbnZvaWQgbWFpbih2b2lkKSB7XFxuXHRtYXQ0IG1hdFZpZXcgPSB1Vmlld01hdHJpeDtcXG5cdG1hdFZpZXdbM11bMF0gPSAwLjA7XFxuXHRtYXRWaWV3WzNdWzFdID0gMC4wO1xcblx0bWF0Vmlld1szXVsyXSA9IDAuMDtcXG5cdFxcbiAgICBnbF9Qb3NpdGlvbiA9IHVQcm9qZWN0aW9uTWF0cml4ICogbWF0VmlldyAqIHVNb2RlbE1hdHJpeCAqIHZlYzQoYVZlcnRleFBvc2l0aW9uLCAxLjApO1xcbiAgICB2VGV4dHVyZUNvb3JkID0gYVRleHR1cmVDb29yZDtcXG4gICAgdk5vcm1hbCA9IGFOb3JtYWw7XFxufVwifV0pfSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hbGZyaWQuanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvYWxmcmlkL2J1aWxkL2FsZnJpZC5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsIi8vIGRlYnVnLmpzXG5pbXBvcnQgZGF0IGZyb20gJ2RhdC1ndWknO1xuaW1wb3J0IFN0YXRzIGZyb20gJ3N0YXRzLmpzJztcbmltcG9ydCBhbGZyaWQsIHsgR0wgfSBmcm9tICdhbGZyaWQnO1xuXG53aW5kb3cuZGVidWcgPSB7XG5cdGluaXQ6KCk9PiB7XG5cdFx0Y29uc29sZS5sb2coJ0luaXQgRGVidWcgY29uc29sZScpO1xuXG5cdFx0Ly9cdElOSVQgREFULUdVSVxuXHRcdHdpbmRvdy5ndWkgPSBuZXcgZGF0LkdVSSh7IHdpZHRoOjMwMCB9KTtcblxuXHRcdC8vXHRTVEFUU1xuXHRcdGNvbnN0IHN0YXRzID0gbmV3IFN0YXRzKCk7XG5cdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdGF0cy5kb21FbGVtZW50KTtcblx0XHRhbGZyaWQuU2NoZWR1bGVyLmFkZEVGKCgpPT5zdGF0cy51cGRhdGUoKSk7XG5cdH1cbn1cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvanMvZGVidWcuanMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vdmVuZG9yL2RhdC5ndWknKVxubW9kdWxlLmV4cG9ydHMuY29sb3IgPSByZXF1aXJlKCcuL3ZlbmRvci9kYXQuY29sb3InKVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2RhdC1ndWkvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDIxXG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIi8qKlxuICogZGF0LWd1aSBKYXZhU2NyaXB0IENvbnRyb2xsZXIgTGlicmFyeVxuICogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2RhdC1ndWlcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMSBEYXRhIEFydHMgVGVhbSwgR29vZ2xlIENyZWF0aXZlIExhYlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqL1xuXG4vKiogQG5hbWVzcGFjZSAqL1xudmFyIGRhdCA9IG1vZHVsZS5leHBvcnRzID0gZGF0IHx8IHt9O1xuXG4vKiogQG5hbWVzcGFjZSAqL1xuZGF0Lmd1aSA9IGRhdC5ndWkgfHwge307XG5cbi8qKiBAbmFtZXNwYWNlICovXG5kYXQudXRpbHMgPSBkYXQudXRpbHMgfHwge307XG5cbi8qKiBAbmFtZXNwYWNlICovXG5kYXQuY29udHJvbGxlcnMgPSBkYXQuY29udHJvbGxlcnMgfHwge307XG5cbi8qKiBAbmFtZXNwYWNlICovXG5kYXQuZG9tID0gZGF0LmRvbSB8fCB7fTtcblxuLyoqIEBuYW1lc3BhY2UgKi9cbmRhdC5jb2xvciA9IGRhdC5jb2xvciB8fCB7fTtcblxuZGF0LnV0aWxzLmNzcyA9IChmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgbG9hZDogZnVuY3Rpb24gKHVybCwgZG9jKSB7XG4gICAgICBkb2MgPSBkb2MgfHwgZG9jdW1lbnQ7XG4gICAgICB2YXIgbGluayA9IGRvYy5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICBsaW5rLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gICAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgICBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICB9LFxuICAgIGluamVjdDogZnVuY3Rpb24oY3NzLCBkb2MpIHtcbiAgICAgIGRvYyA9IGRvYyB8fCBkb2N1bWVudDtcbiAgICAgIHZhciBpbmplY3RlZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICBpbmplY3RlZC50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgIGluamVjdGVkLmlubmVySFRNTCA9IGNzcztcbiAgICAgIGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKGluamVjdGVkKTtcbiAgICB9XG4gIH1cbn0pKCk7XG5cblxuZGF0LnV0aWxzLmNvbW1vbiA9IChmdW5jdGlvbiAoKSB7XG4gIFxuICB2YXIgQVJSX0VBQ0ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaDtcbiAgdmFyIEFSUl9TTElDRSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuICAvKipcbiAgICogQmFuZC1haWQgbWV0aG9kcyBmb3IgdGhpbmdzIHRoYXQgc2hvdWxkIGJlIGEgbG90IGVhc2llciBpbiBKYXZhU2NyaXB0LlxuICAgKiBJbXBsZW1lbnRhdGlvbiBhbmQgc3RydWN0dXJlIGluc3BpcmVkIGJ5IHVuZGVyc2NvcmUuanNcbiAgICogaHR0cDovL2RvY3VtZW50Y2xvdWQuZ2l0aHViLmNvbS91bmRlcnNjb3JlL1xuICAgKi9cblxuICByZXR1cm4geyBcbiAgICBcbiAgICBCUkVBSzoge30sXG4gIFxuICAgIGV4dGVuZDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBcbiAgICAgIHRoaXMuZWFjaChBUlJfU0xJQ0UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopXG4gICAgICAgICAgaWYgKCF0aGlzLmlzVW5kZWZpbmVkKG9ialtrZXldKSkgXG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IG9ialtrZXldO1xuICAgICAgICBcbiAgICAgIH0sIHRoaXMpO1xuICAgICAgXG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgXG4gICAgfSxcbiAgICBcbiAgICBkZWZhdWx0czogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBcbiAgICAgIHRoaXMuZWFjaChBUlJfU0xJQ0UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopXG4gICAgICAgICAgaWYgKHRoaXMuaXNVbmRlZmluZWQodGFyZ2V0W2tleV0pKSBcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gb2JqW2tleV07XG4gICAgICAgIFxuICAgICAgfSwgdGhpcyk7XG4gICAgICBcbiAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgXG4gICAgfSxcbiAgICBcbiAgICBjb21wb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0b0NhbGwgPSBBUlJfU0xJQ0UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgYXJncyA9IEFSUl9TTElDRS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSB0b0NhbGwubGVuZ3RoIC0xOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBbdG9DYWxsW2ldLmFwcGx5KHRoaXMsIGFyZ3MpXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gYXJnc1swXTtcbiAgICAgICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGVhY2g6IGZ1bmN0aW9uKG9iaiwgaXRyLCBzY29wZSkge1xuXG4gICAgICBcbiAgICAgIGlmIChBUlJfRUFDSCAmJiBvYmouZm9yRWFjaCA9PT0gQVJSX0VBQ0gpIHsgXG4gICAgICAgIFxuICAgICAgICBvYmouZm9yRWFjaChpdHIsIHNjb3BlKTtcbiAgICAgICAgXG4gICAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggPT09IG9iai5sZW5ndGggKyAwKSB7IC8vIElzIG51bWJlciBidXQgbm90IE5hTlxuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIga2V5ID0gMCwgbCA9IG9iai5sZW5ndGg7IGtleSA8IGw7IGtleSsrKVxuICAgICAgICAgIGlmIChrZXkgaW4gb2JqICYmIGl0ci5jYWxsKHNjb3BlLCBvYmpba2V5XSwga2V5KSA9PT0gdGhpcy5CUkVBSykgXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iaikgXG4gICAgICAgICAgaWYgKGl0ci5jYWxsKHNjb3BlLCBvYmpba2V5XSwga2V5KSA9PT0gdGhpcy5CUkVBSylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIFxuICAgICAgfVxuICAgICAgICAgICAgXG4gICAgfSxcbiAgICBcbiAgICBkZWZlcjogZnVuY3Rpb24oZm5jKSB7XG4gICAgICBzZXRUaW1lb3V0KGZuYywgMCk7XG4gICAgfSxcbiAgICBcbiAgICB0b0FycmF5OiBmdW5jdGlvbihvYmopIHtcbiAgICAgIGlmIChvYmoudG9BcnJheSkgcmV0dXJuIG9iai50b0FycmF5KCk7XG4gICAgICByZXR1cm4gQVJSX1NMSUNFLmNhbGwob2JqKTtcbiAgICB9LFxuXG4gICAgaXNVbmRlZmluZWQ6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkO1xuICAgIH0sXG4gICAgXG4gICAgaXNOdWxsOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBpc05hTjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICE9PSBvYmo7XG4gICAgfSxcbiAgICBcbiAgICBpc0FycmF5OiBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iai5jb25zdHJ1Y3RvciA9PT0gQXJyYXk7XG4gICAgfSxcbiAgICBcbiAgICBpc09iamVjdDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbiAgICB9LFxuICAgIFxuICAgIGlzTnVtYmVyOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT09IG9iaiswO1xuICAgIH0sXG4gICAgXG4gICAgaXNTdHJpbmc6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiA9PT0gb2JqKycnO1xuICAgIH0sXG4gICAgXG4gICAgaXNCb29sZWFuOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT09IGZhbHNlIHx8IG9iaiA9PT0gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIGlzRnVuY3Rpb246IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH1cbiAgXG4gIH07XG4gICAgXG59KSgpO1xuXG5cbmRhdC5jb250cm9sbGVycy5Db250cm9sbGVyID0gKGZ1bmN0aW9uIChjb21tb24pIHtcblxuICAvKipcbiAgICogQGNsYXNzIEFuIFwiYWJzdHJhY3RcIiBjbGFzcyB0aGF0IHJlcHJlc2VudHMgYSBnaXZlbiBwcm9wZXJ0eSBvZiBhbiBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBiZSBtYW5pcHVsYXRlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGJlIG1hbmlwdWxhdGVkXG4gICAqXG4gICAqIEBtZW1iZXIgZGF0LmNvbnRyb2xsZXJzXG4gICAqL1xuICB2YXIgQ29udHJvbGxlciA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcblxuICAgIHRoaXMuaW5pdGlhbFZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTtcblxuICAgIC8qKlxuICAgICAqIFRob3NlIHdobyBleHRlbmQgdGhpcyBjbGFzcyB3aWxsIHB1dCB0aGVpciBET00gZWxlbWVudHMgaW4gaGVyZS5cbiAgICAgKiBAdHlwZSB7RE9NRWxlbWVudH1cbiAgICAgKi9cbiAgICB0aGlzLmRvbUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBvYmplY3QgdG8gbWFuaXB1bGF0ZVxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gbWFuaXB1bGF0ZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBjaGFuZ2UuXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICB0aGlzLl9fb25DaGFuZ2UgPSB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGZpbmlzaGluZyBjaGFuZ2UuXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICB0aGlzLl9fb25GaW5pc2hDaGFuZ2UgPSB1bmRlZmluZWQ7XG5cbiAgfTtcblxuICBjb21tb24uZXh0ZW5kKFxuXG4gICAgICBDb250cm9sbGVyLnByb3RvdHlwZSxcblxuICAgICAgLyoqIEBsZW5kcyBkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlci5wcm90b3R5cGUgKi9cbiAgICAgIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3BlY2lmeSB0aGF0IGEgZnVuY3Rpb24gZmlyZSBldmVyeSB0aW1lIHNvbWVvbmUgY2hhbmdlcyB0aGUgdmFsdWUgd2l0aFxuICAgICAgICAgKiB0aGlzIENvbnRyb2xsZXIuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuYyBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIHdoZW5ldmVyIHRoZSB2YWx1ZVxuICAgICAgICAgKiBpcyBtb2RpZmllZCB2aWEgdGhpcyBDb250cm9sbGVyLlxuICAgICAgICAgKiBAcmV0dXJucyB7ZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXJ9IHRoaXNcbiAgICAgICAgICovXG4gICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihmbmMpIHtcbiAgICAgICAgICB0aGlzLl9fb25DaGFuZ2UgPSBmbmM7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNwZWNpZnkgdGhhdCBhIGZ1bmN0aW9uIGZpcmUgZXZlcnkgdGltZSBzb21lb25lIFwiZmluaXNoZXNcIiBjaGFuZ2luZ1xuICAgICAgICAgKiB0aGUgdmFsdWUgd2loIHRoaXMgQ29udHJvbGxlci4gVXNlZnVsIGZvciB2YWx1ZXMgdGhhdCBjaGFuZ2VcbiAgICAgICAgICogaW5jcmVtZW50YWxseSBsaWtlIG51bWJlcnMgb3Igc3RyaW5ncy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5jIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgd2hlbmV2ZXJcbiAgICAgICAgICogc29tZW9uZSBcImZpbmlzaGVzXCIgY2hhbmdpbmcgdGhlIHZhbHVlIHZpYSB0aGlzIENvbnRyb2xsZXIuXG4gICAgICAgICAqIEByZXR1cm5zIHtkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcn0gdGhpc1xuICAgICAgICAgKi9cbiAgICAgICAgb25GaW5pc2hDaGFuZ2U6IGZ1bmN0aW9uKGZuYykge1xuICAgICAgICAgIHRoaXMuX19vbkZpbmlzaENoYW5nZSA9IGZuYztcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hhbmdlIHRoZSB2YWx1ZSBvZiA8Y29kZT5vYmplY3RbcHJvcGVydHldPC9jb2RlPlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbmV3VmFsdWUgVGhlIG5ldyB2YWx1ZSBvZiA8Y29kZT5vYmplY3RbcHJvcGVydHldPC9jb2RlPlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgdGhpcy5vYmplY3RbdGhpcy5wcm9wZXJ0eV0gPSBuZXdWYWx1ZTtcbiAgICAgICAgICBpZiAodGhpcy5fX29uQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLl9fb25DaGFuZ2UuY2FsbCh0aGlzLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXRzIHRoZSB2YWx1ZSBvZiA8Y29kZT5vYmplY3RbcHJvcGVydHldPC9jb2RlPlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgY3VycmVudCB2YWx1ZSBvZiA8Y29kZT5vYmplY3RbcHJvcGVydHldPC9jb2RlPlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm9iamVjdFt0aGlzLnByb3BlcnR5XTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVmcmVzaGVzIHRoZSB2aXN1YWwgZGlzcGxheSBvZiBhIENvbnRyb2xsZXIgaW4gb3JkZXIgdG8ga2VlcCBzeW5jXG4gICAgICAgICAqIHdpdGggdGhlIG9iamVjdCdzIGN1cnJlbnQgdmFsdWUuXG4gICAgICAgICAqIEByZXR1cm5zIHtkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcn0gdGhpc1xuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlRGlzcGxheTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm5zIHtCb29sZWFufSB0cnVlIGlmIHRoZSB2YWx1ZSBoYXMgZGV2aWF0ZWQgZnJvbSBpbml0aWFsVmFsdWVcbiAgICAgICAgICovXG4gICAgICAgIGlzTW9kaWZpZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmluaXRpYWxWYWx1ZSAhPT0gdGhpcy5nZXRWYWx1ZSgpXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICk7XG5cbiAgcmV0dXJuIENvbnRyb2xsZXI7XG5cblxufSkoZGF0LnV0aWxzLmNvbW1vbik7XG5cblxuZGF0LmRvbS5kb20gPSAoZnVuY3Rpb24gKGNvbW1vbikge1xuXG4gIHZhciBFVkVOVF9NQVAgPSB7XG4gICAgJ0hUTUxFdmVudHMnOiBbJ2NoYW5nZSddLFxuICAgICdNb3VzZUV2ZW50cyc6IFsnY2xpY2snLCdtb3VzZW1vdmUnLCdtb3VzZWRvd24nLCdtb3VzZXVwJywgJ21vdXNlb3ZlciddLFxuICAgICdLZXlib2FyZEV2ZW50cyc6IFsna2V5ZG93biddXG4gIH07XG5cbiAgdmFyIEVWRU5UX01BUF9JTlYgPSB7fTtcbiAgY29tbW9uLmVhY2goRVZFTlRfTUFQLCBmdW5jdGlvbih2LCBrKSB7XG4gICAgY29tbW9uLmVhY2godiwgZnVuY3Rpb24oZSkge1xuICAgICAgRVZFTlRfTUFQX0lOVltlXSA9IGs7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHZhciBDU1NfVkFMVUVfUElYRUxTID0gLyhcXGQrKFxcLlxcZCspPylweC87XG5cbiAgZnVuY3Rpb24gY3NzVmFsdWVUb1BpeGVscyh2YWwpIHtcblxuICAgIGlmICh2YWwgPT09ICcwJyB8fCBjb21tb24uaXNVbmRlZmluZWQodmFsKSkgcmV0dXJuIDA7XG5cbiAgICB2YXIgbWF0Y2ggPSB2YWwubWF0Y2goQ1NTX1ZBTFVFX1BJWEVMUyk7XG5cbiAgICBpZiAoIWNvbW1vbi5pc051bGwobWF0Y2gpKSB7XG4gICAgICByZXR1cm4gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyAuLi5lbXM/ICU/XG5cbiAgICByZXR1cm4gMDtcblxuICB9XG5cbiAgLyoqXG4gICAqIEBuYW1lc3BhY2VcbiAgICogQG1lbWJlciBkYXQuZG9tXG4gICAqL1xuICB2YXIgZG9tID0ge1xuXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIGVsZW1cbiAgICAgKiBAcGFyYW0gc2VsZWN0YWJsZVxuICAgICAqL1xuICAgIG1ha2VTZWxlY3RhYmxlOiBmdW5jdGlvbihlbGVtLCBzZWxlY3RhYmxlKSB7XG5cbiAgICAgIGlmIChlbGVtID09PSB1bmRlZmluZWQgfHwgZWxlbS5zdHlsZSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICAgIGVsZW0ub25zZWxlY3RzdGFydCA9IHNlbGVjdGFibGUgPyBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSA6IGZ1bmN0aW9uKCkge1xuICAgICAgfTtcblxuICAgICAgZWxlbS5zdHlsZS5Nb3pVc2VyU2VsZWN0ID0gc2VsZWN0YWJsZSA/ICdhdXRvJyA6ICdub25lJztcbiAgICAgIGVsZW0uc3R5bGUuS2h0bWxVc2VyU2VsZWN0ID0gc2VsZWN0YWJsZSA/ICdhdXRvJyA6ICdub25lJztcbiAgICAgIGVsZW0udW5zZWxlY3RhYmxlID0gc2VsZWN0YWJsZSA/ICdvbicgOiAnb2ZmJztcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtXG4gICAgICogQHBhcmFtIGhvcml6b250YWxcbiAgICAgKiBAcGFyYW0gdmVydGljYWxcbiAgICAgKi9cbiAgICBtYWtlRnVsbHNjcmVlbjogZnVuY3Rpb24oZWxlbSwgaG9yaXpvbnRhbCwgdmVydGljYWwpIHtcblxuICAgICAgaWYgKGNvbW1vbi5pc1VuZGVmaW5lZChob3Jpem9udGFsKSkgaG9yaXpvbnRhbCA9IHRydWU7XG4gICAgICBpZiAoY29tbW9uLmlzVW5kZWZpbmVkKHZlcnRpY2FsKSkgdmVydGljYWwgPSB0cnVlO1xuXG4gICAgICBlbGVtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblxuICAgICAgaWYgKGhvcml6b250YWwpIHtcbiAgICAgICAgZWxlbS5zdHlsZS5sZWZ0ID0gMDtcbiAgICAgICAgZWxlbS5zdHlsZS5yaWdodCA9IDA7XG4gICAgICB9XG4gICAgICBpZiAodmVydGljYWwpIHtcbiAgICAgICAgZWxlbS5zdHlsZS50b3AgPSAwO1xuICAgICAgICBlbGVtLnN0eWxlLmJvdHRvbSA9IDA7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbVxuICAgICAqIEBwYXJhbSBldmVudFR5cGVcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICovXG4gICAgZmFrZUV2ZW50OiBmdW5jdGlvbihlbGVtLCBldmVudFR5cGUsIHBhcmFtcywgYXV4KSB7XG4gICAgICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gICAgICB2YXIgY2xhc3NOYW1lID0gRVZFTlRfTUFQX0lOVltldmVudFR5cGVdO1xuICAgICAgaWYgKCFjbGFzc05hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFdmVudCB0eXBlICcgKyBldmVudFR5cGUgKyAnIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICB9XG4gICAgICB2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoY2xhc3NOYW1lKTtcbiAgICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAgIGNhc2UgJ01vdXNlRXZlbnRzJzpcbiAgICAgICAgICB2YXIgY2xpZW50WCA9IHBhcmFtcy54IHx8IHBhcmFtcy5jbGllbnRYIHx8IDA7XG4gICAgICAgICAgdmFyIGNsaWVudFkgPSBwYXJhbXMueSB8fCBwYXJhbXMuY2xpZW50WSB8fCAwO1xuICAgICAgICAgIGV2dC5pbml0TW91c2VFdmVudChldmVudFR5cGUsIHBhcmFtcy5idWJibGVzIHx8IGZhbHNlLFxuICAgICAgICAgICAgICBwYXJhbXMuY2FuY2VsYWJsZSB8fCB0cnVlLCB3aW5kb3csIHBhcmFtcy5jbGlja0NvdW50IHx8IDEsXG4gICAgICAgICAgICAgIDAsIC8vc2NyZWVuIFhcbiAgICAgICAgICAgICAgMCwgLy9zY3JlZW4gWVxuICAgICAgICAgICAgICBjbGllbnRYLCAvL2NsaWVudCBYXG4gICAgICAgICAgICAgIGNsaWVudFksIC8vY2xpZW50IFlcbiAgICAgICAgICAgICAgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAsIG51bGwpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdLZXlib2FyZEV2ZW50cyc6XG4gICAgICAgICAgdmFyIGluaXQgPSBldnQuaW5pdEtleWJvYXJkRXZlbnQgfHwgZXZ0LmluaXRLZXlFdmVudDsgLy8gd2Via2l0IHx8IG1velxuICAgICAgICAgIGNvbW1vbi5kZWZhdWx0cyhwYXJhbXMsIHtcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICBjdHJsS2V5OiBmYWxzZSxcbiAgICAgICAgICAgIGFsdEtleTogZmFsc2UsXG4gICAgICAgICAgICBzaGlmdEtleTogZmFsc2UsXG4gICAgICAgICAgICBtZXRhS2V5OiBmYWxzZSxcbiAgICAgICAgICAgIGtleUNvZGU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGNoYXJDb2RlOiB1bmRlZmluZWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpbml0KGV2ZW50VHlwZSwgcGFyYW1zLmJ1YmJsZXMgfHwgZmFsc2UsXG4gICAgICAgICAgICAgIHBhcmFtcy5jYW5jZWxhYmxlLCB3aW5kb3csXG4gICAgICAgICAgICAgIHBhcmFtcy5jdHJsS2V5LCBwYXJhbXMuYWx0S2V5LFxuICAgICAgICAgICAgICBwYXJhbXMuc2hpZnRLZXksIHBhcmFtcy5tZXRhS2V5LFxuICAgICAgICAgICAgICBwYXJhbXMua2V5Q29kZSwgcGFyYW1zLmNoYXJDb2RlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBldnQuaW5pdEV2ZW50KGV2ZW50VHlwZSwgcGFyYW1zLmJ1YmJsZXMgfHwgZmFsc2UsXG4gICAgICAgICAgICAgIHBhcmFtcy5jYW5jZWxhYmxlIHx8IHRydWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29tbW9uLmRlZmF1bHRzKGV2dCwgYXV4KTtcbiAgICAgIGVsZW0uZGlzcGF0Y2hFdmVudChldnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICogQHBhcmFtIGZ1bmNcbiAgICAgKiBAcGFyYW0gYm9vbFxuICAgICAqL1xuICAgIGJpbmQ6IGZ1bmN0aW9uKGVsZW0sIGV2ZW50LCBmdW5jLCBib29sKSB7XG4gICAgICBib29sID0gYm9vbCB8fCBmYWxzZTtcbiAgICAgIGlmIChlbGVtLmFkZEV2ZW50TGlzdGVuZXIpXG4gICAgICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZnVuYywgYm9vbCk7XG4gICAgICBlbHNlIGlmIChlbGVtLmF0dGFjaEV2ZW50KVxuICAgICAgICBlbGVtLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudCwgZnVuYyk7XG4gICAgICByZXR1cm4gZG9tO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtXG4gICAgICogQHBhcmFtIGV2ZW50XG4gICAgICogQHBhcmFtIGZ1bmNcbiAgICAgKiBAcGFyYW0gYm9vbFxuICAgICAqL1xuICAgIHVuYmluZDogZnVuY3Rpb24oZWxlbSwgZXZlbnQsIGZ1bmMsIGJvb2wpIHtcbiAgICAgIGJvb2wgPSBib29sIHx8IGZhbHNlO1xuICAgICAgaWYgKGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lcilcbiAgICAgICAgZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jLCBib29sKTtcbiAgICAgIGVsc2UgaWYgKGVsZW0uZGV0YWNoRXZlbnQpXG4gICAgICAgIGVsZW0uZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50LCBmdW5jKTtcbiAgICAgIHJldHVybiBkb207XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1cbiAgICAgKiBAcGFyYW0gY2xhc3NOYW1lXG4gICAgICovXG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uKGVsZW0sIGNsYXNzTmFtZSkge1xuICAgICAgaWYgKGVsZW0uY2xhc3NOYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZWxlbS5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgICB9IGVsc2UgaWYgKGVsZW0uY2xhc3NOYW1lICE9PSBjbGFzc05hbWUpIHtcbiAgICAgICAgdmFyIGNsYXNzZXMgPSBlbGVtLmNsYXNzTmFtZS5zcGxpdCgvICsvKTtcbiAgICAgICAgaWYgKGNsYXNzZXMuaW5kZXhPZihjbGFzc05hbWUpID09IC0xKSB7XG4gICAgICAgICAgY2xhc3Nlcy5wdXNoKGNsYXNzTmFtZSk7XG4gICAgICAgICAgZWxlbS5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oJyAnKS5yZXBsYWNlKC9eXFxzKy8sICcnKS5yZXBsYWNlKC9cXHMrJC8sICcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGRvbTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbVxuICAgICAqIEBwYXJhbSBjbGFzc05hbWVcbiAgICAgKi9cbiAgICByZW1vdmVDbGFzczogZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKSB7XG4gICAgICBpZiAoY2xhc3NOYW1lKSB7XG4gICAgICAgIGlmIChlbGVtLmNsYXNzTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gZWxlbS5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgICAgIH0gZWxzZSBpZiAoZWxlbS5jbGFzc05hbWUgPT09IGNsYXNzTmFtZSkge1xuICAgICAgICAgIGVsZW0ucmVtb3ZlQXR0cmlidXRlKCdjbGFzcycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBjbGFzc2VzID0gZWxlbS5jbGFzc05hbWUuc3BsaXQoLyArLyk7XG4gICAgICAgICAgdmFyIGluZGV4ID0gY2xhc3Nlcy5pbmRleE9mKGNsYXNzTmFtZSk7XG4gICAgICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XG4gICAgICAgICAgICBjbGFzc2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICBlbGVtLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbS5jbGFzc05hbWUgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gZG9tO1xuICAgIH0sXG5cbiAgICBoYXNDbGFzczogZnVuY3Rpb24oZWxlbSwgY2xhc3NOYW1lKSB7XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cCgnKD86XnxcXFxccyspJyArIGNsYXNzTmFtZSArICcoPzpcXFxccyt8JCknKS50ZXN0KGVsZW0uY2xhc3NOYW1lKSB8fCBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbVxuICAgICAqL1xuICAgIGdldFdpZHRoOiBmdW5jdGlvbihlbGVtKSB7XG5cbiAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbSk7XG5cbiAgICAgIHJldHVybiBjc3NWYWx1ZVRvUGl4ZWxzKHN0eWxlWydib3JkZXItbGVmdC13aWR0aCddKSArXG4gICAgICAgICAgY3NzVmFsdWVUb1BpeGVscyhzdHlsZVsnYm9yZGVyLXJpZ2h0LXdpZHRoJ10pICtcbiAgICAgICAgICBjc3NWYWx1ZVRvUGl4ZWxzKHN0eWxlWydwYWRkaW5nLWxlZnQnXSkgK1xuICAgICAgICAgIGNzc1ZhbHVlVG9QaXhlbHMoc3R5bGVbJ3BhZGRpbmctcmlnaHQnXSkgK1xuICAgICAgICAgIGNzc1ZhbHVlVG9QaXhlbHMoc3R5bGVbJ3dpZHRoJ10pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbGVtXG4gICAgICovXG4gICAgZ2V0SGVpZ2h0OiBmdW5jdGlvbihlbGVtKSB7XG5cbiAgICAgIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbSk7XG5cbiAgICAgIHJldHVybiBjc3NWYWx1ZVRvUGl4ZWxzKHN0eWxlWydib3JkZXItdG9wLXdpZHRoJ10pICtcbiAgICAgICAgICBjc3NWYWx1ZVRvUGl4ZWxzKHN0eWxlWydib3JkZXItYm90dG9tLXdpZHRoJ10pICtcbiAgICAgICAgICBjc3NWYWx1ZVRvUGl4ZWxzKHN0eWxlWydwYWRkaW5nLXRvcCddKSArXG4gICAgICAgICAgY3NzVmFsdWVUb1BpeGVscyhzdHlsZVsncGFkZGluZy1ib3R0b20nXSkgK1xuICAgICAgICAgIGNzc1ZhbHVlVG9QaXhlbHMoc3R5bGVbJ2hlaWdodCddKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbVxuICAgICAqL1xuICAgIGdldE9mZnNldDogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgdmFyIG9mZnNldCA9IHtsZWZ0OiAwLCB0b3A6MH07XG4gICAgICBpZiAoZWxlbS5vZmZzZXRQYXJlbnQpIHtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIG9mZnNldC5sZWZ0ICs9IGVsZW0ub2Zmc2V0TGVmdDtcbiAgICAgICAgICBvZmZzZXQudG9wICs9IGVsZW0ub2Zmc2V0VG9wO1xuICAgICAgICB9IHdoaWxlIChlbGVtID0gZWxlbS5vZmZzZXRQYXJlbnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9mZnNldDtcbiAgICB9LFxuXG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3Bvc3RzLzI2ODQ1NjEvcmV2aXNpb25zXG4gICAgLyoqXG4gICAgICogXG4gICAgICogQHBhcmFtIGVsZW1cbiAgICAgKi9cbiAgICBpc0FjdGl2ZTogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgcmV0dXJuIGVsZW0gPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgKCBlbGVtLnR5cGUgfHwgZWxlbS5ocmVmICk7XG4gICAgfVxuXG4gIH07XG5cbiAgcmV0dXJuIGRvbTtcblxufSkoZGF0LnV0aWxzLmNvbW1vbik7XG5cblxuZGF0LmNvbnRyb2xsZXJzLk9wdGlvbkNvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKENvbnRyb2xsZXIsIGRvbSwgY29tbW9uKSB7XG5cbiAgLyoqXG4gICAqIEBjbGFzcyBQcm92aWRlcyBhIHNlbGVjdCBpbnB1dCB0byBhbHRlciB0aGUgcHJvcGVydHkgb2YgYW4gb2JqZWN0LCB1c2luZyBhXG4gICAqIGxpc3Qgb2YgYWNjZXB0ZWQgdmFsdWVzLlxuICAgKlxuICAgKiBAZXh0ZW5kcyBkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlclxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gYmUgbWFuaXB1bGF0ZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBiZSBtYW5pcHVsYXRlZFxuICAgKiBAcGFyYW0ge09iamVjdHxzdHJpbmdbXX0gb3B0aW9ucyBBIG1hcCBvZiBsYWJlbHMgdG8gYWNjZXB0YWJsZSB2YWx1ZXMsIG9yXG4gICAqIGEgbGlzdCBvZiBhY2NlcHRhYmxlIHN0cmluZyB2YWx1ZXMuXG4gICAqXG4gICAqIEBtZW1iZXIgZGF0LmNvbnRyb2xsZXJzXG4gICAqL1xuICB2YXIgT3B0aW9uQ29udHJvbGxlciA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHksIG9wdGlvbnMpIHtcblxuICAgIE9wdGlvbkNvbnRyb2xsZXIuc3VwZXJjbGFzcy5jYWxsKHRoaXMsIG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIC8qKlxuICAgICAqIFRoZSBkcm9wIGRvd24gbWVudVxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICB0aGlzLl9fc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VsZWN0Jyk7XG5cbiAgICBpZiAoY29tbW9uLmlzQXJyYXkob3B0aW9ucykpIHtcbiAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgIGNvbW1vbi5lYWNoKG9wdGlvbnMsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgbWFwW2VsZW1lbnRdID0gZWxlbWVudDtcbiAgICAgIH0pO1xuICAgICAgb3B0aW9ucyA9IG1hcDtcbiAgICB9XG5cbiAgICBjb21tb24uZWFjaChvcHRpb25zLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG5cbiAgICAgIHZhciBvcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICAgIG9wdC5pbm5lckhUTUwgPSBrZXk7XG4gICAgICBvcHQuc2V0QXR0cmlidXRlKCd2YWx1ZScsIHZhbHVlKTtcbiAgICAgIF90aGlzLl9fc2VsZWN0LmFwcGVuZENoaWxkKG9wdCk7XG5cbiAgICB9KTtcblxuICAgIC8vIEFja25vd2xlZGdlIG9yaWdpbmFsIHZhbHVlXG4gICAgdGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cbiAgICBkb20uYmluZCh0aGlzLl9fc2VsZWN0LCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVzaXJlZFZhbHVlID0gdGhpcy5vcHRpb25zW3RoaXMuc2VsZWN0ZWRJbmRleF0udmFsdWU7XG4gICAgICBfdGhpcy5zZXRWYWx1ZShkZXNpcmVkVmFsdWUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19zZWxlY3QpO1xuXG4gIH07XG5cbiAgT3B0aW9uQ29udHJvbGxlci5zdXBlcmNsYXNzID0gQ29udHJvbGxlcjtcblxuICBjb21tb24uZXh0ZW5kKFxuXG4gICAgICBPcHRpb25Db250cm9sbGVyLnByb3RvdHlwZSxcbiAgICAgIENvbnRyb2xsZXIucHJvdG90eXBlLFxuXG4gICAgICB7XG5cbiAgICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICB2YXIgdG9SZXR1cm4gPSBPcHRpb25Db250cm9sbGVyLnN1cGVyY2xhc3MucHJvdG90eXBlLnNldFZhbHVlLmNhbGwodGhpcywgdik7XG4gICAgICAgICAgaWYgKHRoaXMuX19vbkZpbmlzaENoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5fX29uRmluaXNoQ2hhbmdlLmNhbGwodGhpcywgdGhpcy5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZURpc3BsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMuX19zZWxlY3QudmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG4gICAgICAgICAgcmV0dXJuIE9wdGlvbkNvbnRyb2xsZXIuc3VwZXJjbGFzcy5wcm90b3R5cGUudXBkYXRlRGlzcGxheS5jYWxsKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgIH1cblxuICApO1xuXG4gIHJldHVybiBPcHRpb25Db250cm9sbGVyO1xuXG59KShkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcixcbmRhdC5kb20uZG9tLFxuZGF0LnV0aWxzLmNvbW1vbik7XG5cblxuZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKENvbnRyb2xsZXIsIGNvbW1vbikge1xuXG4gIC8qKlxuICAgKiBAY2xhc3MgUmVwcmVzZW50cyBhIGdpdmVuIHByb3BlcnR5IG9mIGFuIG9iamVjdCB0aGF0IGlzIGEgbnVtYmVyLlxuICAgKlxuICAgKiBAZXh0ZW5kcyBkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlclxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gYmUgbWFuaXB1bGF0ZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBiZSBtYW5pcHVsYXRlZFxuICAgKiBAcGFyYW0ge09iamVjdH0gW3BhcmFtc10gT3B0aW9uYWwgcGFyYW1ldGVyc1xuICAgKiBAcGFyYW0ge051bWJlcn0gW3BhcmFtcy5taW5dIE1pbmltdW0gYWxsb3dlZCB2YWx1ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gW3BhcmFtcy5tYXhdIE1heGltdW0gYWxsb3dlZCB2YWx1ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gW3BhcmFtcy5zdGVwXSBJbmNyZW1lbnQgYnkgd2hpY2ggdG8gY2hhbmdlIHZhbHVlXG4gICAqXG4gICAqIEBtZW1iZXIgZGF0LmNvbnRyb2xsZXJzXG4gICAqL1xuICB2YXIgTnVtYmVyQ29udHJvbGxlciA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHksIHBhcmFtcykge1xuXG4gICAgTnVtYmVyQ29udHJvbGxlci5zdXBlcmNsYXNzLmNhbGwodGhpcywgb2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG5cbiAgICB0aGlzLl9fbWluID0gcGFyYW1zLm1pbjtcbiAgICB0aGlzLl9fbWF4ID0gcGFyYW1zLm1heDtcbiAgICB0aGlzLl9fc3RlcCA9IHBhcmFtcy5zdGVwO1xuXG4gICAgaWYgKGNvbW1vbi5pc1VuZGVmaW5lZCh0aGlzLl9fc3RlcCkpIHtcblxuICAgICAgaWYgKHRoaXMuaW5pdGlhbFZhbHVlID09IDApIHtcbiAgICAgICAgdGhpcy5fX2ltcGxpZWRTdGVwID0gMTsgLy8gV2hhdCBhcmUgd2UsIHBzeWNoaWNzP1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSGV5IERvdWcsIGNoZWNrIHRoaXMgb3V0LlxuICAgICAgICB0aGlzLl9faW1wbGllZFN0ZXAgPSBNYXRoLnBvdygxMCwgTWF0aC5mbG9vcihNYXRoLmxvZyh0aGlzLmluaXRpYWxWYWx1ZSkvTWF0aC5MTjEwKSkvMTA7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICB0aGlzLl9faW1wbGllZFN0ZXAgPSB0aGlzLl9fc3RlcDtcblxuICAgIH1cblxuICAgIHRoaXMuX19wcmVjaXNpb24gPSBudW1EZWNpbWFscyh0aGlzLl9faW1wbGllZFN0ZXApO1xuXG5cbiAgfTtcblxuICBOdW1iZXJDb250cm9sbGVyLnN1cGVyY2xhc3MgPSBDb250cm9sbGVyO1xuXG4gIGNvbW1vbi5leHRlbmQoXG5cbiAgICAgIE51bWJlckNvbnRyb2xsZXIucHJvdG90eXBlLFxuICAgICAgQ29udHJvbGxlci5wcm90b3R5cGUsXG5cbiAgICAgIC8qKiBAbGVuZHMgZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXIucHJvdG90eXBlICovXG4gICAgICB7XG5cbiAgICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHYpIHtcblxuICAgICAgICAgIGlmICh0aGlzLl9fbWluICE9PSB1bmRlZmluZWQgJiYgdiA8IHRoaXMuX19taW4pIHtcbiAgICAgICAgICAgIHYgPSB0aGlzLl9fbWluO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fX21heCAhPT0gdW5kZWZpbmVkICYmIHYgPiB0aGlzLl9fbWF4KSB7XG4gICAgICAgICAgICB2ID0gdGhpcy5fX21heDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodGhpcy5fX3N0ZXAgIT09IHVuZGVmaW5lZCAmJiB2ICUgdGhpcy5fX3N0ZXAgIT0gMCkge1xuICAgICAgICAgICAgdiA9IE1hdGgucm91bmQodiAvIHRoaXMuX19zdGVwKSAqIHRoaXMuX19zdGVwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBOdW1iZXJDb250cm9sbGVyLnN1cGVyY2xhc3MucHJvdG90eXBlLnNldFZhbHVlLmNhbGwodGhpcywgdik7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3BlY2lmeSBhIG1pbmltdW0gdmFsdWUgZm9yIDxjb2RlPm9iamVjdFtwcm9wZXJ0eV08L2NvZGU+LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gbWluVmFsdWUgVGhlIG1pbmltdW0gdmFsdWUgZm9yXG4gICAgICAgICAqIDxjb2RlPm9iamVjdFtwcm9wZXJ0eV08L2NvZGU+XG4gICAgICAgICAqIEByZXR1cm5zIHtkYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlcn0gdGhpc1xuICAgICAgICAgKi9cbiAgICAgICAgbWluOiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgdGhpcy5fX21pbiA9IHY7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNwZWNpZnkgYSBtYXhpbXVtIHZhbHVlIGZvciA8Y29kZT5vYmplY3RbcHJvcGVydHldPC9jb2RlPi5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IG1heFZhbHVlIFRoZSBtYXhpbXVtIHZhbHVlIGZvclxuICAgICAgICAgKiA8Y29kZT5vYmplY3RbcHJvcGVydHldPC9jb2RlPlxuICAgICAgICAgKiBAcmV0dXJucyB7ZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXJ9IHRoaXNcbiAgICAgICAgICovXG4gICAgICAgIG1heDogZnVuY3Rpb24odikge1xuICAgICAgICAgIHRoaXMuX19tYXggPSB2O1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTcGVjaWZ5IGEgc3RlcCB2YWx1ZSB0aGF0IGRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyXG4gICAgICAgICAqIGluY3JlbWVudHMgYnkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBzdGVwVmFsdWUgVGhlIHN0ZXAgdmFsdWUgZm9yXG4gICAgICAgICAqIGRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyXG4gICAgICAgICAqIEBkZWZhdWx0IGlmIG1pbmltdW0gYW5kIG1heGltdW0gc3BlY2lmaWVkIGluY3JlbWVudCBpcyAxJSBvZiB0aGVcbiAgICAgICAgICogZGlmZmVyZW5jZSBvdGhlcndpc2Ugc3RlcFZhbHVlIGlzIDFcbiAgICAgICAgICogQHJldHVybnMge2RhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyfSB0aGlzXG4gICAgICAgICAqL1xuICAgICAgICBzdGVwOiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgdGhpcy5fX3N0ZXAgPSB2O1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgIH1cblxuICApO1xuXG4gIGZ1bmN0aW9uIG51bURlY2ltYWxzKHgpIHtcbiAgICB4ID0geC50b1N0cmluZygpO1xuICAgIGlmICh4LmluZGV4T2YoJy4nKSA+IC0xKSB7XG4gICAgICByZXR1cm4geC5sZW5ndGggLSB4LmluZGV4T2YoJy4nKSAtIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBOdW1iZXJDb250cm9sbGVyO1xuXG59KShkYXQuY29udHJvbGxlcnMuQ29udHJvbGxlcixcbmRhdC51dGlscy5jb21tb24pO1xuXG5cbmRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyQm94ID0gKGZ1bmN0aW9uIChOdW1iZXJDb250cm9sbGVyLCBkb20sIGNvbW1vbikge1xuXG4gIC8qKlxuICAgKiBAY2xhc3MgUmVwcmVzZW50cyBhIGdpdmVuIHByb3BlcnR5IG9mIGFuIG9iamVjdCB0aGF0IGlzIGEgbnVtYmVyIGFuZFxuICAgKiBwcm92aWRlcyBhbiBpbnB1dCBlbGVtZW50IHdpdGggd2hpY2ggdG8gbWFuaXB1bGF0ZSBpdC5cbiAgICpcbiAgICogQGV4dGVuZHMgZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXJcbiAgICogQGV4dGVuZHMgZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXJcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGJlIG1hbmlwdWxhdGVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gYmUgbWFuaXB1bGF0ZWRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwYXJhbXNdIE9wdGlvbmFsIHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtwYXJhbXMubWluXSBNaW5pbXVtIGFsbG93ZWQgdmFsdWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtwYXJhbXMubWF4XSBNYXhpbXVtIGFsbG93ZWQgdmFsdWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtwYXJhbXMuc3RlcF0gSW5jcmVtZW50IGJ5IHdoaWNoIHRvIGNoYW5nZSB2YWx1ZVxuICAgKlxuICAgKiBAbWVtYmVyIGRhdC5jb250cm9sbGVyc1xuICAgKi9cbiAgdmFyIE51bWJlckNvbnRyb2xsZXJCb3ggPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5LCBwYXJhbXMpIHtcblxuICAgIHRoaXMuX190cnVuY2F0aW9uU3VzcGVuZGVkID0gZmFsc2U7XG5cbiAgICBOdW1iZXJDb250cm9sbGVyQm94LnN1cGVyY2xhc3MuY2FsbCh0aGlzLCBvYmplY3QsIHByb3BlcnR5LCBwYXJhbXMpO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIC8qKlxuICAgICAqIHtOdW1iZXJ9IFByZXZpb3VzIG1vdXNlIHkgcG9zaXRpb25cbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgdmFyIHByZXZfeTtcblxuICAgIHRoaXMuX19pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgdGhpcy5fX2lucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0Jyk7XG5cbiAgICAvLyBNYWtlcyBpdCBzbyBtYW51YWxseSBzcGVjaWZpZWQgdmFsdWVzIGFyZSBub3QgdHJ1bmNhdGVkLlxuXG4gICAgZG9tLmJpbmQodGhpcy5fX2lucHV0LCAnY2hhbmdlJywgb25DaGFuZ2UpO1xuICAgIGRvbS5iaW5kKHRoaXMuX19pbnB1dCwgJ2JsdXInLCBvbkJsdXIpO1xuICAgIGRvbS5iaW5kKHRoaXMuX19pbnB1dCwgJ21vdXNlZG93bicsIG9uTW91c2VEb3duKTtcbiAgICBkb20uYmluZCh0aGlzLl9faW5wdXQsICdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuXG4gICAgICAvLyBXaGVuIHByZXNzaW5nIGVudGlyZSwgeW91IGNhbiBiZSBhcyBwcmVjaXNlIGFzIHlvdSB3YW50LlxuICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgX3RoaXMuX190cnVuY2F0aW9uU3VzcGVuZGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ibHVyKCk7XG4gICAgICAgIF90aGlzLl9fdHJ1bmNhdGlvblN1c3BlbmRlZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBvbkNoYW5nZSgpIHtcbiAgICAgIHZhciBhdHRlbXB0ZWQgPSBwYXJzZUZsb2F0KF90aGlzLl9faW5wdXQudmFsdWUpO1xuICAgICAgaWYgKCFjb21tb24uaXNOYU4oYXR0ZW1wdGVkKSkgX3RoaXMuc2V0VmFsdWUoYXR0ZW1wdGVkKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkJsdXIoKSB7XG4gICAgICBvbkNoYW5nZSgpO1xuICAgICAgaWYgKF90aGlzLl9fb25GaW5pc2hDaGFuZ2UpIHtcbiAgICAgICAgX3RoaXMuX19vbkZpbmlzaENoYW5nZS5jYWxsKF90aGlzLCBfdGhpcy5nZXRWYWx1ZSgpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbk1vdXNlRG93bihlKSB7XG4gICAgICBkb20uYmluZCh3aW5kb3csICdtb3VzZW1vdmUnLCBvbk1vdXNlRHJhZyk7XG4gICAgICBkb20uYmluZCh3aW5kb3csICdtb3VzZXVwJywgb25Nb3VzZVVwKTtcbiAgICAgIHByZXZfeSA9IGUuY2xpZW50WTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbk1vdXNlRHJhZyhlKSB7XG5cbiAgICAgIHZhciBkaWZmID0gcHJldl95IC0gZS5jbGllbnRZO1xuICAgICAgX3RoaXMuc2V0VmFsdWUoX3RoaXMuZ2V0VmFsdWUoKSArIGRpZmYgKiBfdGhpcy5fX2ltcGxpZWRTdGVwKTtcblxuICAgICAgcHJldl95ID0gZS5jbGllbnRZO1xuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xuICAgICAgZG9tLnVuYmluZCh3aW5kb3csICdtb3VzZW1vdmUnLCBvbk1vdXNlRHJhZyk7XG4gICAgICBkb20udW5iaW5kKHdpbmRvdywgJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG4gICAgdGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19pbnB1dCk7XG5cbiAgfTtcblxuICBOdW1iZXJDb250cm9sbGVyQm94LnN1cGVyY2xhc3MgPSBOdW1iZXJDb250cm9sbGVyO1xuXG4gIGNvbW1vbi5leHRlbmQoXG5cbiAgICAgIE51bWJlckNvbnRyb2xsZXJCb3gucHJvdG90eXBlLFxuICAgICAgTnVtYmVyQ29udHJvbGxlci5wcm90b3R5cGUsXG5cbiAgICAgIHtcblxuICAgICAgICB1cGRhdGVEaXNwbGF5OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgIHRoaXMuX19pbnB1dC52YWx1ZSA9IHRoaXMuX190cnVuY2F0aW9uU3VzcGVuZGVkID8gdGhpcy5nZXRWYWx1ZSgpIDogcm91bmRUb0RlY2ltYWwodGhpcy5nZXRWYWx1ZSgpLCB0aGlzLl9fcHJlY2lzaW9uKTtcbiAgICAgICAgICByZXR1cm4gTnVtYmVyQ29udHJvbGxlckJveC5zdXBlcmNsYXNzLnByb3RvdHlwZS51cGRhdGVEaXNwbGF5LmNhbGwodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICk7XG5cbiAgZnVuY3Rpb24gcm91bmRUb0RlY2ltYWwodmFsdWUsIGRlY2ltYWxzKSB7XG4gICAgdmFyIHRlblRvID0gTWF0aC5wb3coMTAsIGRlY2ltYWxzKTtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSAqIHRlblRvKSAvIHRlblRvO1xuICB9XG5cbiAgcmV0dXJuIE51bWJlckNvbnRyb2xsZXJCb3g7XG5cbn0pKGRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyLFxuZGF0LmRvbS5kb20sXG5kYXQudXRpbHMuY29tbW9uKTtcblxuXG5kYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlclNsaWRlciA9IChmdW5jdGlvbiAoTnVtYmVyQ29udHJvbGxlciwgZG9tLCBjc3MsIGNvbW1vbiwgc3R5bGVTaGVldCkge1xuXG4gIC8qKlxuICAgKiBAY2xhc3MgUmVwcmVzZW50cyBhIGdpdmVuIHByb3BlcnR5IG9mIGFuIG9iamVjdCB0aGF0IGlzIGEgbnVtYmVyLCBjb250YWluc1xuICAgKiBhIG1pbmltdW0gYW5kIG1heGltdW0sIGFuZCBwcm92aWRlcyBhIHNsaWRlciBlbGVtZW50IHdpdGggd2hpY2ggdG9cbiAgICogbWFuaXB1bGF0ZSBpdC4gSXQgc2hvdWxkIGJlIG5vdGVkIHRoYXQgdGhlIHNsaWRlciBlbGVtZW50IGlzIG1hZGUgdXAgb2ZcbiAgICogPGNvZGU+Jmx0O2RpdiZndDs8L2NvZGU+IHRhZ3MsIDxzdHJvbmc+bm90PC9zdHJvbmc+IHRoZSBodG1sNVxuICAgKiA8Y29kZT4mbHQ7c2xpZGVyJmd0OzwvY29kZT4gZWxlbWVudC5cbiAgICpcbiAgICogQGV4dGVuZHMgZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXJcbiAgICogQGV4dGVuZHMgZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXJcbiAgICogXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBiZSBtYW5pcHVsYXRlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGJlIG1hbmlwdWxhdGVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBtaW5WYWx1ZSBNaW5pbXVtIGFsbG93ZWQgdmFsdWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG1heFZhbHVlIE1heGltdW0gYWxsb3dlZCB2YWx1ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gc3RlcFZhbHVlIEluY3JlbWVudCBieSB3aGljaCB0byBjaGFuZ2UgdmFsdWVcbiAgICpcbiAgICogQG1lbWJlciBkYXQuY29udHJvbGxlcnNcbiAgICovXG4gIHZhciBOdW1iZXJDb250cm9sbGVyU2xpZGVyID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSwgbWluLCBtYXgsIHN0ZXApIHtcblxuICAgIE51bWJlckNvbnRyb2xsZXJTbGlkZXIuc3VwZXJjbGFzcy5jYWxsKHRoaXMsIG9iamVjdCwgcHJvcGVydHksIHsgbWluOiBtaW4sIG1heDogbWF4LCBzdGVwOiBzdGVwIH0pO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuX19iYWNrZ3JvdW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fX2ZvcmVncm91bmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBcblxuXG4gICAgZG9tLmJpbmQodGhpcy5fX2JhY2tncm91bmQsICdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XG4gICAgXG4gICAgZG9tLmFkZENsYXNzKHRoaXMuX19iYWNrZ3JvdW5kLCAnc2xpZGVyJyk7XG4gICAgZG9tLmFkZENsYXNzKHRoaXMuX19mb3JlZ3JvdW5kLCAnc2xpZGVyLWZnJyk7XG5cbiAgICBmdW5jdGlvbiBvbk1vdXNlRG93bihlKSB7XG5cbiAgICAgIGRvbS5iaW5kKHdpbmRvdywgJ21vdXNlbW92ZScsIG9uTW91c2VEcmFnKTtcbiAgICAgIGRvbS5iaW5kKHdpbmRvdywgJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuXG4gICAgICBvbk1vdXNlRHJhZyhlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbk1vdXNlRHJhZyhlKSB7XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdmFyIG9mZnNldCA9IGRvbS5nZXRPZmZzZXQoX3RoaXMuX19iYWNrZ3JvdW5kKTtcbiAgICAgIHZhciB3aWR0aCA9IGRvbS5nZXRXaWR0aChfdGhpcy5fX2JhY2tncm91bmQpO1xuICAgICAgXG4gICAgICBfdGhpcy5zZXRWYWx1ZShcbiAgICAgICAgbWFwKGUuY2xpZW50WCwgb2Zmc2V0LmxlZnQsIG9mZnNldC5sZWZ0ICsgd2lkdGgsIF90aGlzLl9fbWluLCBfdGhpcy5fX21heClcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcbiAgICAgIGRvbS51bmJpbmQod2luZG93LCAnbW91c2Vtb3ZlJywgb25Nb3VzZURyYWcpO1xuICAgICAgZG9tLnVuYmluZCh3aW5kb3csICdtb3VzZXVwJywgb25Nb3VzZVVwKTtcbiAgICAgIGlmIChfdGhpcy5fX29uRmluaXNoQ2hhbmdlKSB7XG4gICAgICAgIF90aGlzLl9fb25GaW5pc2hDaGFuZ2UuY2FsbChfdGhpcywgX3RoaXMuZ2V0VmFsdWUoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cbiAgICB0aGlzLl9fYmFja2dyb3VuZC5hcHBlbmRDaGlsZCh0aGlzLl9fZm9yZWdyb3VuZCk7XG4gICAgdGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19iYWNrZ3JvdW5kKTtcblxuICB9O1xuXG4gIE51bWJlckNvbnRyb2xsZXJTbGlkZXIuc3VwZXJjbGFzcyA9IE51bWJlckNvbnRyb2xsZXI7XG5cbiAgLyoqXG4gICAqIEluamVjdHMgZGVmYXVsdCBzdHlsZXNoZWV0IGZvciBzbGlkZXIgZWxlbWVudHMuXG4gICAqL1xuICBOdW1iZXJDb250cm9sbGVyU2xpZGVyLnVzZURlZmF1bHRTdHlsZXMgPSBmdW5jdGlvbigpIHtcbiAgICBjc3MuaW5qZWN0KHN0eWxlU2hlZXQpO1xuICB9O1xuXG4gIGNvbW1vbi5leHRlbmQoXG5cbiAgICAgIE51bWJlckNvbnRyb2xsZXJTbGlkZXIucHJvdG90eXBlLFxuICAgICAgTnVtYmVyQ29udHJvbGxlci5wcm90b3R5cGUsXG5cbiAgICAgIHtcblxuICAgICAgICB1cGRhdGVEaXNwbGF5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgcGN0ID0gKHRoaXMuZ2V0VmFsdWUoKSAtIHRoaXMuX19taW4pLyh0aGlzLl9fbWF4IC0gdGhpcy5fX21pbik7XG4gICAgICAgICAgdGhpcy5fX2ZvcmVncm91bmQuc3R5bGUud2lkdGggPSBwY3QqMTAwKyclJztcbiAgICAgICAgICByZXR1cm4gTnVtYmVyQ29udHJvbGxlclNsaWRlci5zdXBlcmNsYXNzLnByb3RvdHlwZS51cGRhdGVEaXNwbGF5LmNhbGwodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgfVxuXG5cblxuICApO1xuXG4gIGZ1bmN0aW9uIG1hcCh2LCBpMSwgaTIsIG8xLCBvMikge1xuICAgIHJldHVybiBvMSArIChvMiAtIG8xKSAqICgodiAtIGkxKSAvIChpMiAtIGkxKSk7XG4gIH1cblxuICByZXR1cm4gTnVtYmVyQ29udHJvbGxlclNsaWRlcjtcbiAgXG59KShkYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlcixcbmRhdC5kb20uZG9tLFxuZGF0LnV0aWxzLmNzcyxcbmRhdC51dGlscy5jb21tb24sXG5cIi5zbGlkZXIge1xcbiAgYm94LXNoYWRvdzogaW5zZXQgMCAycHggNHB4IHJnYmEoMCwwLDAsMC4xNSk7XFxuICBoZWlnaHQ6IDFlbTtcXG4gIGJvcmRlci1yYWRpdXM6IDFlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNlZWU7XFxuICBwYWRkaW5nOiAwIDAuNWVtO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuXFxuLnNsaWRlci1mZyB7XFxuICBwYWRkaW5nOiAxcHggMCAycHggMDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNhYWE7XFxuICBoZWlnaHQ6IDFlbTtcXG4gIG1hcmdpbi1sZWZ0OiAtMC41ZW07XFxuICBwYWRkaW5nLXJpZ2h0OiAwLjVlbTtcXG4gIGJvcmRlci1yYWRpdXM6IDFlbSAwIDAgMWVtO1xcbn1cXG5cXG4uc2xpZGVyLWZnOmFmdGVyIHtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIGJvcmRlci1yYWRpdXM6IDFlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXI6ICAxcHggc29saWQgI2FhYTtcXG4gIGNvbnRlbnQ6ICcnO1xcbiAgZmxvYXQ6IHJpZ2h0O1xcbiAgbWFyZ2luLXJpZ2h0OiAtMWVtO1xcbiAgbWFyZ2luLXRvcDogLTFweDtcXG4gIGhlaWdodDogMC45ZW07XFxuICB3aWR0aDogMC45ZW07XFxufVwiKTtcblxuXG5kYXQuY29udHJvbGxlcnMuRnVuY3Rpb25Db250cm9sbGVyID0gKGZ1bmN0aW9uIChDb250cm9sbGVyLCBkb20sIGNvbW1vbikge1xuXG4gIC8qKlxuICAgKiBAY2xhc3MgUHJvdmlkZXMgYSBHVUkgaW50ZXJmYWNlIHRvIGZpcmUgYSBzcGVjaWZpZWQgbWV0aG9kLCBhIHByb3BlcnR5IG9mIGFuIG9iamVjdC5cbiAgICpcbiAgICogQGV4dGVuZHMgZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXJcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGJlIG1hbmlwdWxhdGVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gYmUgbWFuaXB1bGF0ZWRcbiAgICpcbiAgICogQG1lbWJlciBkYXQuY29udHJvbGxlcnNcbiAgICovXG4gIHZhciBGdW5jdGlvbkNvbnRyb2xsZXIgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5LCB0ZXh0KSB7XG5cbiAgICBGdW5jdGlvbkNvbnRyb2xsZXIuc3VwZXJjbGFzcy5jYWxsKHRoaXMsIG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuX19idXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9fYnV0dG9uLmlubmVySFRNTCA9IHRleHQgPT09IHVuZGVmaW5lZCA/ICdGaXJlJyA6IHRleHQ7XG4gICAgZG9tLmJpbmQodGhpcy5fX2J1dHRvbiwgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgX3RoaXMuZmlyZSgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgZG9tLmFkZENsYXNzKHRoaXMuX19idXR0b24sICdidXR0b24nKTtcblxuICAgIHRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fYnV0dG9uKTtcblxuXG4gIH07XG5cbiAgRnVuY3Rpb25Db250cm9sbGVyLnN1cGVyY2xhc3MgPSBDb250cm9sbGVyO1xuXG4gIGNvbW1vbi5leHRlbmQoXG5cbiAgICAgIEZ1bmN0aW9uQ29udHJvbGxlci5wcm90b3R5cGUsXG4gICAgICBDb250cm9sbGVyLnByb3RvdHlwZSxcbiAgICAgIHtcbiAgICAgICAgXG4gICAgICAgIGZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh0aGlzLl9fb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuX19vbkNoYW5nZS5jYWxsKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5fX29uRmluaXNoQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLl9fb25GaW5pc2hDaGFuZ2UuY2FsbCh0aGlzLCB0aGlzLmdldFZhbHVlKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmdldFZhbHVlKCkuY2FsbCh0aGlzLm9iamVjdCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICApO1xuXG4gIHJldHVybiBGdW5jdGlvbkNvbnRyb2xsZXI7XG5cbn0pKGRhdC5jb250cm9sbGVycy5Db250cm9sbGVyLFxuZGF0LmRvbS5kb20sXG5kYXQudXRpbHMuY29tbW9uKTtcblxuXG5kYXQuY29udHJvbGxlcnMuQm9vbGVhbkNvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKENvbnRyb2xsZXIsIGRvbSwgY29tbW9uKSB7XG5cbiAgLyoqXG4gICAqIEBjbGFzcyBQcm92aWRlcyBhIGNoZWNrYm94IGlucHV0IHRvIGFsdGVyIHRoZSBib29sZWFuIHByb3BlcnR5IG9mIGFuIG9iamVjdC5cbiAgICogQGV4dGVuZHMgZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXJcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGJlIG1hbmlwdWxhdGVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gYmUgbWFuaXB1bGF0ZWRcbiAgICpcbiAgICogQG1lbWJlciBkYXQuY29udHJvbGxlcnNcbiAgICovXG4gIHZhciBCb29sZWFuQ29udHJvbGxlciA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcblxuICAgIEJvb2xlYW5Db250cm9sbGVyLnN1cGVyY2xhc3MuY2FsbCh0aGlzLCBvYmplY3QsIHByb3BlcnR5KTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5fX3ByZXYgPSB0aGlzLmdldFZhbHVlKCk7XG5cbiAgICB0aGlzLl9fY2hlY2tib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIHRoaXMuX19jaGVja2JveC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnY2hlY2tib3gnKTtcblxuXG4gICAgZG9tLmJpbmQodGhpcy5fX2NoZWNrYm94LCAnY2hhbmdlJywgb25DaGFuZ2UsIGZhbHNlKTtcblxuICAgIHRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLl9fY2hlY2tib3gpO1xuXG4gICAgLy8gTWF0Y2ggb3JpZ2luYWwgdmFsdWVcbiAgICB0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuICAgIGZ1bmN0aW9uIG9uQ2hhbmdlKCkge1xuICAgICAgX3RoaXMuc2V0VmFsdWUoIV90aGlzLl9fcHJldik7XG4gICAgfVxuXG4gIH07XG5cbiAgQm9vbGVhbkNvbnRyb2xsZXIuc3VwZXJjbGFzcyA9IENvbnRyb2xsZXI7XG5cbiAgY29tbW9uLmV4dGVuZChcblxuICAgICAgQm9vbGVhbkNvbnRyb2xsZXIucHJvdG90eXBlLFxuICAgICAgQ29udHJvbGxlci5wcm90b3R5cGUsXG5cbiAgICAgIHtcblxuICAgICAgICBzZXRWYWx1ZTogZnVuY3Rpb24odikge1xuICAgICAgICAgIHZhciB0b1JldHVybiA9IEJvb2xlYW5Db250cm9sbGVyLnN1cGVyY2xhc3MucHJvdG90eXBlLnNldFZhbHVlLmNhbGwodGhpcywgdik7XG4gICAgICAgICAgaWYgKHRoaXMuX19vbkZpbmlzaENoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5fX29uRmluaXNoQ2hhbmdlLmNhbGwodGhpcywgdGhpcy5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fX3ByZXYgPSB0aGlzLmdldFZhbHVlKCk7XG4gICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZURpc3BsYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICh0aGlzLmdldFZhbHVlKCkgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuX19jaGVja2JveC5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xuICAgICAgICAgICAgdGhpcy5fX2NoZWNrYm94LmNoZWNrZWQgPSB0cnVlOyAgICBcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLl9fY2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBCb29sZWFuQ29udHJvbGxlci5zdXBlcmNsYXNzLnByb3RvdHlwZS51cGRhdGVEaXNwbGF5LmNhbGwodGhpcyk7XG5cbiAgICAgICAgfVxuXG5cbiAgICAgIH1cblxuICApO1xuXG4gIHJldHVybiBCb29sZWFuQ29udHJvbGxlcjtcblxufSkoZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXIsXG5kYXQuZG9tLmRvbSxcbmRhdC51dGlscy5jb21tb24pO1xuXG5cbmRhdC5jb2xvci50b1N0cmluZyA9IChmdW5jdGlvbiAoY29tbW9uKSB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbG9yKSB7XG5cbiAgICBpZiAoY29sb3IuYSA9PSAxIHx8IGNvbW1vbi5pc1VuZGVmaW5lZChjb2xvci5hKSkge1xuXG4gICAgICB2YXIgcyA9IGNvbG9yLmhleC50b1N0cmluZygxNik7XG4gICAgICB3aGlsZSAocy5sZW5ndGggPCA2KSB7XG4gICAgICAgIHMgPSAnMCcgKyBzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJyMnICsgcztcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIHJldHVybiAncmdiYSgnICsgTWF0aC5yb3VuZChjb2xvci5yKSArICcsJyArIE1hdGgucm91bmQoY29sb3IuZykgKyAnLCcgKyBNYXRoLnJvdW5kKGNvbG9yLmIpICsgJywnICsgY29sb3IuYSArICcpJztcblxuICAgIH1cblxuICB9XG5cbn0pKGRhdC51dGlscy5jb21tb24pO1xuXG5cbmRhdC5jb2xvci5pbnRlcnByZXQgPSAoZnVuY3Rpb24gKHRvU3RyaW5nLCBjb21tb24pIHtcblxuICB2YXIgcmVzdWx0LCB0b1JldHVybjtcblxuICB2YXIgaW50ZXJwcmV0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0b1JldHVybiA9IGZhbHNlO1xuXG4gICAgdmFyIG9yaWdpbmFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBjb21tb24udG9BcnJheShhcmd1bWVudHMpIDogYXJndW1lbnRzWzBdO1xuXG4gICAgY29tbW9uLmVhY2goSU5URVJQUkVUQVRJT05TLCBmdW5jdGlvbihmYW1pbHkpIHtcblxuICAgICAgaWYgKGZhbWlseS5saXRtdXMob3JpZ2luYWwpKSB7XG5cbiAgICAgICAgY29tbW9uLmVhY2goZmFtaWx5LmNvbnZlcnNpb25zLCBmdW5jdGlvbihjb252ZXJzaW9uLCBjb252ZXJzaW9uTmFtZSkge1xuXG4gICAgICAgICAgcmVzdWx0ID0gY29udmVyc2lvbi5yZWFkKG9yaWdpbmFsKTtcblxuICAgICAgICAgIGlmICh0b1JldHVybiA9PT0gZmFsc2UgJiYgcmVzdWx0ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdG9SZXR1cm4gPSByZXN1bHQ7XG4gICAgICAgICAgICByZXN1bHQuY29udmVyc2lvbk5hbWUgPSBjb252ZXJzaW9uTmFtZTtcbiAgICAgICAgICAgIHJlc3VsdC5jb252ZXJzaW9uID0gY29udmVyc2lvbjtcbiAgICAgICAgICAgIHJldHVybiBjb21tb24uQlJFQUs7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbW1vbi5CUkVBSztcblxuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdG9SZXR1cm47XG5cbiAgfTtcblxuICB2YXIgSU5URVJQUkVUQVRJT05TID0gW1xuXG4gICAgLy8gU3RyaW5nc1xuICAgIHtcblxuICAgICAgbGl0bXVzOiBjb21tb24uaXNTdHJpbmcsXG5cbiAgICAgIGNvbnZlcnNpb25zOiB7XG5cbiAgICAgICAgVEhSRUVfQ0hBUl9IRVg6IHtcblxuICAgICAgICAgIHJlYWQ6IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG5cbiAgICAgICAgICAgIHZhciB0ZXN0ID0gb3JpZ2luYWwubWF0Y2goL14jKFtBLUYwLTldKShbQS1GMC05XSkoW0EtRjAtOV0pJC9pKTtcbiAgICAgICAgICAgIGlmICh0ZXN0ID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHNwYWNlOiAnSEVYJyxcbiAgICAgICAgICAgICAgaGV4OiBwYXJzZUludChcbiAgICAgICAgICAgICAgICAgICcweCcgK1xuICAgICAgICAgICAgICAgICAgICAgIHRlc3RbMV0udG9TdHJpbmcoKSArIHRlc3RbMV0udG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgdGVzdFsyXS50b1N0cmluZygpICsgdGVzdFsyXS50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICB0ZXN0WzNdLnRvU3RyaW5nKCkgKyB0ZXN0WzNdLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHdyaXRlOiB0b1N0cmluZ1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgU0lYX0NIQVJfSEVYOiB7XG5cbiAgICAgICAgICByZWFkOiBmdW5jdGlvbihvcmlnaW5hbCkge1xuXG4gICAgICAgICAgICB2YXIgdGVzdCA9IG9yaWdpbmFsLm1hdGNoKC9eIyhbQS1GMC05XXs2fSkkL2kpO1xuICAgICAgICAgICAgaWYgKHRlc3QgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgc3BhY2U6ICdIRVgnLFxuICAgICAgICAgICAgICBoZXg6IHBhcnNlSW50KCcweCcgKyB0ZXN0WzFdLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHdyaXRlOiB0b1N0cmluZ1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgQ1NTX1JHQjoge1xuXG4gICAgICAgICAgcmVhZDogZnVuY3Rpb24ob3JpZ2luYWwpIHtcblxuICAgICAgICAgICAgdmFyIHRlc3QgPSBvcmlnaW5hbC5tYXRjaCgvXnJnYlxcKFxccyooLispXFxzKixcXHMqKC4rKVxccyosXFxzKiguKylcXHMqXFwpLyk7XG4gICAgICAgICAgICBpZiAodGVzdCA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBzcGFjZTogJ1JHQicsXG4gICAgICAgICAgICAgIHI6IHBhcnNlRmxvYXQodGVzdFsxXSksXG4gICAgICAgICAgICAgIGc6IHBhcnNlRmxvYXQodGVzdFsyXSksXG4gICAgICAgICAgICAgIGI6IHBhcnNlRmxvYXQodGVzdFszXSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgd3JpdGU6IHRvU3RyaW5nXG5cbiAgICAgICAgfSxcblxuICAgICAgICBDU1NfUkdCQToge1xuXG4gICAgICAgICAgcmVhZDogZnVuY3Rpb24ob3JpZ2luYWwpIHtcblxuICAgICAgICAgICAgdmFyIHRlc3QgPSBvcmlnaW5hbC5tYXRjaCgvXnJnYmFcXChcXHMqKC4rKVxccyosXFxzKiguKylcXHMqLFxccyooLispXFxzKlxcLFxccyooLispXFxzKlxcKS8pO1xuICAgICAgICAgICAgaWYgKHRlc3QgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgc3BhY2U6ICdSR0InLFxuICAgICAgICAgICAgICByOiBwYXJzZUZsb2F0KHRlc3RbMV0pLFxuICAgICAgICAgICAgICBnOiBwYXJzZUZsb2F0KHRlc3RbMl0pLFxuICAgICAgICAgICAgICBiOiBwYXJzZUZsb2F0KHRlc3RbM10pLFxuICAgICAgICAgICAgICBhOiBwYXJzZUZsb2F0KHRlc3RbNF0pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHdyaXRlOiB0b1N0cmluZ1xuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIC8vIE51bWJlcnNcbiAgICB7XG5cbiAgICAgIGxpdG11czogY29tbW9uLmlzTnVtYmVyLFxuXG4gICAgICBjb252ZXJzaW9uczoge1xuXG4gICAgICAgIEhFWDoge1xuICAgICAgICAgIHJlYWQ6IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBzcGFjZTogJ0hFWCcsXG4gICAgICAgICAgICAgIGhleDogb3JpZ2luYWwsXG4gICAgICAgICAgICAgIGNvbnZlcnNpb25OYW1lOiAnSEVYJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICB3cml0ZTogZnVuY3Rpb24oY29sb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBjb2xvci5oZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICAvLyBBcnJheXNcbiAgICB7XG5cbiAgICAgIGxpdG11czogY29tbW9uLmlzQXJyYXksXG5cbiAgICAgIGNvbnZlcnNpb25zOiB7XG5cbiAgICAgICAgUkdCX0FSUkFZOiB7XG4gICAgICAgICAgcmVhZDogZnVuY3Rpb24ob3JpZ2luYWwpIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbC5sZW5ndGggIT0gMykgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgc3BhY2U6ICdSR0InLFxuICAgICAgICAgICAgICByOiBvcmlnaW5hbFswXSxcbiAgICAgICAgICAgICAgZzogb3JpZ2luYWxbMV0sXG4gICAgICAgICAgICAgIGI6IG9yaWdpbmFsWzJdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICB3cml0ZTogZnVuY3Rpb24oY29sb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBbY29sb3IuciwgY29sb3IuZywgY29sb3IuYl07XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgUkdCQV9BUlJBWToge1xuICAgICAgICAgIHJlYWQ6IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG4gICAgICAgICAgICBpZiAob3JpZ2luYWwubGVuZ3RoICE9IDQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHNwYWNlOiAnUkdCJyxcbiAgICAgICAgICAgICAgcjogb3JpZ2luYWxbMF0sXG4gICAgICAgICAgICAgIGc6IG9yaWdpbmFsWzFdLFxuICAgICAgICAgICAgICBiOiBvcmlnaW5hbFsyXSxcbiAgICAgICAgICAgICAgYTogb3JpZ2luYWxbM11cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHdyaXRlOiBmdW5jdGlvbihjb2xvcikge1xuICAgICAgICAgICAgcmV0dXJuIFtjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgLy8gT2JqZWN0c1xuICAgIHtcblxuICAgICAgbGl0bXVzOiBjb21tb24uaXNPYmplY3QsXG5cbiAgICAgIGNvbnZlcnNpb25zOiB7XG5cbiAgICAgICAgUkdCQV9PQko6IHtcbiAgICAgICAgICByZWFkOiBmdW5jdGlvbihvcmlnaW5hbCkge1xuICAgICAgICAgICAgaWYgKGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5yKSAmJlxuICAgICAgICAgICAgICAgIGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5nKSAmJlxuICAgICAgICAgICAgICAgIGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5iKSAmJlxuICAgICAgICAgICAgICAgIGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5hKSkge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNwYWNlOiAnUkdCJyxcbiAgICAgICAgICAgICAgICByOiBvcmlnaW5hbC5yLFxuICAgICAgICAgICAgICAgIGc6IG9yaWdpbmFsLmcsXG4gICAgICAgICAgICAgICAgYjogb3JpZ2luYWwuYixcbiAgICAgICAgICAgICAgICBhOiBvcmlnaW5hbC5hXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgd3JpdGU6IGZ1bmN0aW9uKGNvbG9yKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICByOiBjb2xvci5yLFxuICAgICAgICAgICAgICBnOiBjb2xvci5nLFxuICAgICAgICAgICAgICBiOiBjb2xvci5iLFxuICAgICAgICAgICAgICBhOiBjb2xvci5hXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIFJHQl9PQko6IHtcbiAgICAgICAgICByZWFkOiBmdW5jdGlvbihvcmlnaW5hbCkge1xuICAgICAgICAgICAgaWYgKGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5yKSAmJlxuICAgICAgICAgICAgICAgIGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5nKSAmJlxuICAgICAgICAgICAgICAgIGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5iKSkge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNwYWNlOiAnUkdCJyxcbiAgICAgICAgICAgICAgICByOiBvcmlnaW5hbC5yLFxuICAgICAgICAgICAgICAgIGc6IG9yaWdpbmFsLmcsXG4gICAgICAgICAgICAgICAgYjogb3JpZ2luYWwuYlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHdyaXRlOiBmdW5jdGlvbihjb2xvcikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgcjogY29sb3IucixcbiAgICAgICAgICAgICAgZzogY29sb3IuZyxcbiAgICAgICAgICAgICAgYjogY29sb3IuYlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBIU1ZBX09CSjoge1xuICAgICAgICAgIHJlYWQ6IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG4gICAgICAgICAgICBpZiAoY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLmgpICYmXG4gICAgICAgICAgICAgICAgY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLnMpICYmXG4gICAgICAgICAgICAgICAgY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLnYpICYmXG4gICAgICAgICAgICAgICAgY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLmEpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3BhY2U6ICdIU1YnLFxuICAgICAgICAgICAgICAgIGg6IG9yaWdpbmFsLmgsXG4gICAgICAgICAgICAgICAgczogb3JpZ2luYWwucyxcbiAgICAgICAgICAgICAgICB2OiBvcmlnaW5hbC52LFxuICAgICAgICAgICAgICAgIGE6IG9yaWdpbmFsLmFcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICB3cml0ZTogZnVuY3Rpb24oY29sb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGg6IGNvbG9yLmgsXG4gICAgICAgICAgICAgIHM6IGNvbG9yLnMsXG4gICAgICAgICAgICAgIHY6IGNvbG9yLnYsXG4gICAgICAgICAgICAgIGE6IGNvbG9yLmFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgSFNWX09CSjoge1xuICAgICAgICAgIHJlYWQ6IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG4gICAgICAgICAgICBpZiAoY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLmgpICYmXG4gICAgICAgICAgICAgICAgY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLnMpICYmXG4gICAgICAgICAgICAgICAgY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLnYpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3BhY2U6ICdIU1YnLFxuICAgICAgICAgICAgICAgIGg6IG9yaWdpbmFsLmgsXG4gICAgICAgICAgICAgICAgczogb3JpZ2luYWwucyxcbiAgICAgICAgICAgICAgICB2OiBvcmlnaW5hbC52XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgd3JpdGU6IGZ1bmN0aW9uKGNvbG9yKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoOiBjb2xvci5oLFxuICAgICAgICAgICAgICBzOiBjb2xvci5zLFxuICAgICAgICAgICAgICB2OiBjb2xvci52XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgfVxuXG5cbiAgXTtcblxuICByZXR1cm4gaW50ZXJwcmV0O1xuXG5cbn0pKGRhdC5jb2xvci50b1N0cmluZyxcbmRhdC51dGlscy5jb21tb24pO1xuXG5cbmRhdC5HVUkgPSBkYXQuZ3VpLkdVSSA9IChmdW5jdGlvbiAoY3NzLCBzYXZlRGlhbG9ndWVDb250ZW50cywgc3R5bGVTaGVldCwgY29udHJvbGxlckZhY3RvcnksIENvbnRyb2xsZXIsIEJvb2xlYW5Db250cm9sbGVyLCBGdW5jdGlvbkNvbnRyb2xsZXIsIE51bWJlckNvbnRyb2xsZXJCb3gsIE51bWJlckNvbnRyb2xsZXJTbGlkZXIsIE9wdGlvbkNvbnRyb2xsZXIsIENvbG9yQ29udHJvbGxlciwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCBDZW50ZXJlZERpdiwgZG9tLCBjb21tb24pIHtcblxuICBjc3MuaW5qZWN0KHN0eWxlU2hlZXQpO1xuXG4gIC8qKiBPdXRlci1tb3N0IGNsYXNzTmFtZSBmb3IgR1VJJ3MgKi9cbiAgdmFyIENTU19OQU1FU1BBQ0UgPSAnZGcnO1xuXG4gIHZhciBISURFX0tFWV9DT0RFID0gNzI7XG5cbiAgLyoqIFRoZSBvbmx5IHZhbHVlIHNoYXJlZCBiZXR3ZWVuIHRoZSBKUyBhbmQgU0NTUy4gVXNlIGNhdXRpb24uICovXG4gIHZhciBDTE9TRV9CVVRUT05fSEVJR0hUID0gMjA7XG5cbiAgdmFyIERFRkFVTFRfREVGQVVMVF9QUkVTRVRfTkFNRSA9ICdEZWZhdWx0JztcblxuICB2YXIgU1VQUE9SVFNfTE9DQUxfU1RPUkFHRSA9IChmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuICdsb2NhbFN0b3JhZ2UnIGluIHdpbmRvdyAmJiB3aW5kb3dbJ2xvY2FsU3RvcmFnZSddICE9PSBudWxsO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pKCk7XG5cbiAgdmFyIFNBVkVfRElBTE9HVUU7XG5cbiAgLyoqIEhhdmUgd2UgeWV0IHRvIGNyZWF0ZSBhbiBhdXRvUGxhY2UgR1VJPyAqL1xuICB2YXIgYXV0b19wbGFjZV92aXJnaW4gPSB0cnVlO1xuXG4gIC8qKiBGaXhlZCBwb3NpdGlvbiBkaXYgdGhhdCBhdXRvIHBsYWNlIEdVSSdzIGdvIGluc2lkZSAqL1xuICB2YXIgYXV0b19wbGFjZV9jb250YWluZXI7XG5cbiAgLyoqIEFyZSB3ZSBoaWRpbmcgdGhlIEdVSSdzID8gKi9cbiAgdmFyIGhpZGUgPSBmYWxzZTtcblxuICAvKiogR1VJJ3Mgd2hpY2ggc2hvdWxkIGJlIGhpZGRlbiAqL1xuICB2YXIgaGlkZWFibGVfZ3VpcyA9IFtdO1xuXG4gIC8qKlxuICAgKiBBIGxpZ2h0d2VpZ2h0IGNvbnRyb2xsZXIgbGlicmFyeSBmb3IgSmF2YVNjcmlwdC4gSXQgYWxsb3dzIHlvdSB0byBlYXNpbHlcbiAgICogbWFuaXB1bGF0ZSB2YXJpYWJsZXMgYW5kIGZpcmUgZnVuY3Rpb25zIG9uIHRoZSBmbHkuXG4gICAqIEBjbGFzc1xuICAgKlxuICAgKiBAbWVtYmVyIGRhdC5ndWlcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IFtwYXJhbXNdXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbcGFyYW1zLm5hbWVdIFRoZSBuYW1lIG9mIHRoaXMgR1VJLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW3BhcmFtcy5sb2FkXSBKU09OIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHNhdmVkIHN0YXRlIG9mXG4gICAqIHRoaXMgR1VJLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtwYXJhbXMuYXV0bz10cnVlXVxuICAgKiBAcGFyYW0ge2RhdC5ndWkuR1VJfSBbcGFyYW1zLnBhcmVudF0gVGhlIEdVSSBJJ20gbmVzdGVkIGluLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtwYXJhbXMuY2xvc2VkXSBJZiB0cnVlLCBzdGFydHMgY2xvc2VkXG4gICAqL1xuICB2YXIgR1VJID0gZnVuY3Rpb24ocGFyYW1zKSB7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLyoqXG4gICAgICogT3V0ZXJtb3N0IERPTSBFbGVtZW50XG4gICAgICogQHR5cGUgRE9NRWxlbWVudFxuICAgICAqL1xuICAgIHRoaXMuZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX191bCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgdGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX191bCk7XG5cbiAgICBkb20uYWRkQ2xhc3ModGhpcy5kb21FbGVtZW50LCBDU1NfTkFNRVNQQUNFKTtcblxuICAgIC8qKlxuICAgICAqIE5lc3RlZCBHVUkncyBieSBuYW1lXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIHRoaXMuX19mb2xkZXJzID0ge307XG5cbiAgICB0aGlzLl9fY29udHJvbGxlcnMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2Ygb2JqZWN0cyBJJ20gcmVtZW1iZXJpbmcgZm9yIHNhdmUsIG9ubHkgdXNlZCBpbiB0b3AgbGV2ZWwgR1VJXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIHRoaXMuX19yZW1lbWJlcmVkT2JqZWN0cyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogTWFwcyB0aGUgaW5kZXggb2YgcmVtZW1iZXJlZCBvYmplY3RzIHRvIGEgbWFwIG9mIGNvbnRyb2xsZXJzLCBvbmx5IHVzZWRcbiAgICAgKiBpbiB0b3AgbGV2ZWwgR1VJLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAaWdub3JlXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFtcbiAgICAgKiAge1xuICAgICAqICAgIHByb3BlcnR5TmFtZTogQ29udHJvbGxlcixcbiAgICAgKiAgICBhbm90aGVyUHJvcGVydHlOYW1lOiBDb250cm9sbGVyXG4gICAgICogIH0sXG4gICAgICogIHtcbiAgICAgKiAgICBwcm9wZXJ0eU5hbWU6IENvbnRyb2xsZXJcbiAgICAgKiAgfVxuICAgICAqIF1cbiAgICAgKi9cbiAgICB0aGlzLl9fcmVtZW1iZXJlZE9iamVjdEluZGVjZXNUb0NvbnRyb2xsZXJzID0gW107XG5cbiAgICB0aGlzLl9fbGlzdGVuaW5nID0gW107XG5cbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG5cbiAgICAvLyBEZWZhdWx0IHBhcmFtZXRlcnNcbiAgICBwYXJhbXMgPSBjb21tb24uZGVmYXVsdHMocGFyYW1zLCB7XG4gICAgICBhdXRvUGxhY2U6IHRydWUsXG4gICAgICB3aWR0aDogR1VJLkRFRkFVTFRfV0lEVEhcbiAgICB9KTtcblxuICAgIHBhcmFtcyA9IGNvbW1vbi5kZWZhdWx0cyhwYXJhbXMsIHtcbiAgICAgIHJlc2l6YWJsZTogcGFyYW1zLmF1dG9QbGFjZSxcbiAgICAgIGhpZGVhYmxlOiBwYXJhbXMuYXV0b1BsYWNlXG4gICAgfSk7XG5cblxuICAgIGlmICghY29tbW9uLmlzVW5kZWZpbmVkKHBhcmFtcy5sb2FkKSkge1xuXG4gICAgICAvLyBFeHBsaWNpdCBwcmVzZXRcbiAgICAgIGlmIChwYXJhbXMucHJlc2V0KSBwYXJhbXMubG9hZC5wcmVzZXQgPSBwYXJhbXMucHJlc2V0O1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgcGFyYW1zLmxvYWQgPSB7IHByZXNldDogREVGQVVMVF9ERUZBVUxUX1BSRVNFVF9OQU1FIH07XG5cbiAgICB9XG5cbiAgICBpZiAoY29tbW9uLmlzVW5kZWZpbmVkKHBhcmFtcy5wYXJlbnQpICYmIHBhcmFtcy5oaWRlYWJsZSkge1xuICAgICAgaGlkZWFibGVfZ3Vpcy5wdXNoKHRoaXMpO1xuICAgIH1cblxuICAgIC8vIE9ubHkgcm9vdCBsZXZlbCBHVUkncyBhcmUgcmVzaXphYmxlLlxuICAgIHBhcmFtcy5yZXNpemFibGUgPSBjb21tb24uaXNVbmRlZmluZWQocGFyYW1zLnBhcmVudCkgJiYgcGFyYW1zLnJlc2l6YWJsZTtcblxuXG4gICAgaWYgKHBhcmFtcy5hdXRvUGxhY2UgJiYgY29tbW9uLmlzVW5kZWZpbmVkKHBhcmFtcy5zY3JvbGxhYmxlKSkge1xuICAgICAgcGFyYW1zLnNjcm9sbGFibGUgPSB0cnVlO1xuICAgIH1cbi8vICAgIHBhcmFtcy5zY3JvbGxhYmxlID0gY29tbW9uLmlzVW5kZWZpbmVkKHBhcmFtcy5wYXJlbnQpICYmIHBhcmFtcy5zY3JvbGxhYmxlID09PSB0cnVlO1xuXG4gICAgLy8gTm90IHBhcnQgb2YgcGFyYW1zIGJlY2F1c2UgSSBkb24ndCB3YW50IHBlb3BsZSBwYXNzaW5nIHRoaXMgaW4gdmlhXG4gICAgLy8gY29uc3RydWN0b3IuIFNob3VsZCBiZSBhICdyZW1lbWJlcmVkJyB2YWx1ZS5cbiAgICB2YXIgdXNlX2xvY2FsX3N0b3JhZ2UgPVxuICAgICAgICBTVVBQT1JUU19MT0NBTF9TVE9SQUdFICYmXG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShnZXRMb2NhbFN0b3JhZ2VIYXNoKHRoaXMsICdpc0xvY2FsJykpID09PSAndHJ1ZSc7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLFxuXG4gICAgICAgIC8qKiBAbGVuZHMgZGF0Lmd1aS5HVUkucHJvdG90eXBlICovXG4gICAgICAgIHtcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIFRoZSBwYXJlbnQgPGNvZGU+R1VJPC9jb2RlPlxuICAgICAgICAgICAqIEB0eXBlIGRhdC5ndWkuR1VJXG4gICAgICAgICAgICovXG4gICAgICAgICAgcGFyZW50OiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zLnBhcmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgc2Nyb2xsYWJsZToge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtcy5zY3JvbGxhYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBIYW5kbGVzIDxjb2RlPkdVSTwvY29kZT4ncyBlbGVtZW50IHBsYWNlbWVudCBmb3IgeW91XG4gICAgICAgICAgICogQHR5cGUgQm9vbGVhblxuICAgICAgICAgICAqL1xuICAgICAgICAgIGF1dG9QbGFjZToge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtcy5hdXRvUGxhY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIFRoZSBpZGVudGlmaWVyIGZvciBhIHNldCBvZiBzYXZlZCB2YWx1ZXNcbiAgICAgICAgICAgKiBAdHlwZSBTdHJpbmdcbiAgICAgICAgICAgKi9cbiAgICAgICAgICBwcmVzZXQ6IHtcblxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKF90aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5nZXRSb290KCkucHJlc2V0O1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJhbXMubG9hZC5wcmVzZXQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICBpZiAoX3RoaXMucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuZ2V0Um9vdCgpLnByZXNldCA9IHY7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmxvYWQucHJlc2V0ID0gdjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZXRQcmVzZXRTZWxlY3RJbmRleCh0aGlzKTtcbiAgICAgICAgICAgICAgX3RoaXMucmV2ZXJ0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogVGhlIHdpZHRoIG9mIDxjb2RlPkdVSTwvY29kZT4gZWxlbWVudFxuICAgICAgICAgICAqIEB0eXBlIE51bWJlclxuICAgICAgICAgICAqL1xuICAgICAgICAgIHdpZHRoOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zLndpZHRoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICBwYXJhbXMud2lkdGggPSB2O1xuICAgICAgICAgICAgICBzZXRXaWR0aChfdGhpcywgdik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIFRoZSBuYW1lIG9mIDxjb2RlPkdVSTwvY29kZT4uIFVzZWQgZm9yIGZvbGRlcnMuIGkuZVxuICAgICAgICAgICAqIGEgZm9sZGVyJ3MgbmFtZVxuICAgICAgICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAgICAgICAqL1xuICAgICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwYXJhbXMubmFtZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgLy8gVE9ETyBDaGVjayBmb3IgY29sbGlzaW9ucyBhbW9uZyBzaWJsaW5nIGZvbGRlcnNcbiAgICAgICAgICAgICAgcGFyYW1zLm5hbWUgPSB2O1xuICAgICAgICAgICAgICBpZiAodGl0bGVfcm93X25hbWUpIHtcbiAgICAgICAgICAgICAgICB0aXRsZV9yb3dfbmFtZS5pbm5lckhUTUwgPSBwYXJhbXMubmFtZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBXaGV0aGVyIHRoZSA8Y29kZT5HVUk8L2NvZGU+IGlzIGNvbGxhcHNlZCBvciBub3RcbiAgICAgICAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICAgICAgICovXG4gICAgICAgICAgY2xvc2VkOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zLmNsb3NlZDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgcGFyYW1zLmNsb3NlZCA9IHY7XG4gICAgICAgICAgICAgIGlmIChwYXJhbXMuY2xvc2VkKSB7XG4gICAgICAgICAgICAgICAgZG9tLmFkZENsYXNzKF90aGlzLl9fdWwsIEdVSS5DTEFTU19DTE9TRUQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbS5yZW1vdmVDbGFzcyhfdGhpcy5fX3VsLCBHVUkuQ0xBU1NfQ0xPU0VEKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBhcmVuJ3QgZ29pbmcgdG8gcmVzcGVjdCB0aGUgQ1NTIHRyYW5zaXRpb24sXG4gICAgICAgICAgICAgIC8vIExldHMganVzdCBjaGVjayBvdXIgaGVpZ2h0IGFnYWluc3QgdGhlIHdpbmRvdyBoZWlnaHQgcmlnaHQgb2ZmXG4gICAgICAgICAgICAgIC8vIHRoZSBiYXQuXG4gICAgICAgICAgICAgIHRoaXMub25SZXNpemUoKTtcblxuICAgICAgICAgICAgICBpZiAoX3RoaXMuX19jbG9zZUJ1dHRvbikge1xuICAgICAgICAgICAgICAgIF90aGlzLl9fY2xvc2VCdXR0b24uaW5uZXJIVE1MID0gdiA/IEdVSS5URVhUX09QRU4gOiBHVUkuVEVYVF9DTE9TRUQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogQ29udGFpbnMgYWxsIHByZXNldHNcbiAgICAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgICAgKi9cbiAgICAgICAgICBsb2FkOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zLmxvYWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIERldGVybWluZXMgd2hldGhlciBvciBub3QgdG8gdXNlIDxhIGhyZWY9XCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9ET00vU3RvcmFnZSNsb2NhbFN0b3JhZ2VcIj5sb2NhbFN0b3JhZ2U8L2E+IGFzIHRoZSBtZWFucyBmb3JcbiAgICAgICAgICAgKiA8Y29kZT5yZW1lbWJlcjwvY29kZT5pbmdcbiAgICAgICAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICAgICAgICovXG4gICAgICAgICAgdXNlTG9jYWxTdG9yYWdlOiB7XG5cbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiB1c2VfbG9jYWxfc3RvcmFnZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKGJvb2wpIHtcbiAgICAgICAgICAgICAgaWYgKFNVUFBPUlRTX0xPQ0FMX1NUT1JBR0UpIHtcbiAgICAgICAgICAgICAgICB1c2VfbG9jYWxfc3RvcmFnZSA9IGJvb2w7XG4gICAgICAgICAgICAgICAgaWYgKGJvb2wpIHtcbiAgICAgICAgICAgICAgICAgIGRvbS5iaW5kKHdpbmRvdywgJ3VubG9hZCcsIHNhdmVUb0xvY2FsU3RvcmFnZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGRvbS51bmJpbmQod2luZG93LCAndW5sb2FkJywgc2F2ZVRvTG9jYWxTdG9yYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oZ2V0TG9jYWxTdG9yYWdlSGFzaChfdGhpcywgJ2lzTG9jYWwnKSwgYm9vbCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIC8vIEFyZSB3ZSBhIHJvb3QgbGV2ZWwgR1VJP1xuICAgIGlmIChjb21tb24uaXNVbmRlZmluZWQocGFyYW1zLnBhcmVudCkpIHtcblxuICAgICAgcGFyYW1zLmNsb3NlZCA9IGZhbHNlO1xuXG4gICAgICBkb20uYWRkQ2xhc3ModGhpcy5kb21FbGVtZW50LCBHVUkuQ0xBU1NfTUFJTik7XG4gICAgICBkb20ubWFrZVNlbGVjdGFibGUodGhpcy5kb21FbGVtZW50LCBmYWxzZSk7XG5cbiAgICAgIC8vIEFyZSB3ZSBzdXBwb3NlZCB0byBiZSBsb2FkaW5nIGxvY2FsbHk/XG4gICAgICBpZiAoU1VQUE9SVFNfTE9DQUxfU1RPUkFHRSkge1xuXG4gICAgICAgIGlmICh1c2VfbG9jYWxfc3RvcmFnZSkge1xuXG4gICAgICAgICAgX3RoaXMudXNlTG9jYWxTdG9yYWdlID0gdHJ1ZTtcblxuICAgICAgICAgIHZhciBzYXZlZF9ndWkgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShnZXRMb2NhbFN0b3JhZ2VIYXNoKHRoaXMsICdndWknKSk7XG5cbiAgICAgICAgICBpZiAoc2F2ZWRfZ3VpKSB7XG4gICAgICAgICAgICBwYXJhbXMubG9hZCA9IEpTT04ucGFyc2Uoc2F2ZWRfZ3VpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19jbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5fX2Nsb3NlQnV0dG9uLmlubmVySFRNTCA9IEdVSS5URVhUX0NMT1NFRDtcbiAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLl9fY2xvc2VCdXR0b24sIEdVSS5DTEFTU19DTE9TRV9CVVRUT04pO1xuICAgICAgdGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19jbG9zZUJ1dHRvbik7XG5cbiAgICAgIGRvbS5iaW5kKHRoaXMuX19jbG9zZUJ1dHRvbiwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgX3RoaXMuY2xvc2VkID0gIV90aGlzLmNsb3NlZDtcblxuXG4gICAgICB9KTtcblxuXG4gICAgICAvLyBPaCwgeW91J3JlIGEgbmVzdGVkIEdVSSFcbiAgICB9IGVsc2Uge1xuXG4gICAgICBpZiAocGFyYW1zLmNsb3NlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBhcmFtcy5jbG9zZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgdGl0bGVfcm93X25hbWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShwYXJhbXMubmFtZSk7XG4gICAgICBkb20uYWRkQ2xhc3ModGl0bGVfcm93X25hbWUsICdjb250cm9sbGVyLW5hbWUnKTtcblxuICAgICAgdmFyIHRpdGxlX3JvdyA9IGFkZFJvdyhfdGhpcywgdGl0bGVfcm93X25hbWUpO1xuXG4gICAgICB2YXIgb25fY2xpY2tfdGl0bGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3RoaXMuY2xvc2VkID0gIV90aGlzLmNsb3NlZDtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcblxuICAgICAgZG9tLmFkZENsYXNzKHRoaXMuX191bCwgR1VJLkNMQVNTX0NMT1NFRCk7XG5cbiAgICAgIGRvbS5hZGRDbGFzcyh0aXRsZV9yb3csICd0aXRsZScpO1xuICAgICAgZG9tLmJpbmQodGl0bGVfcm93LCAnY2xpY2snLCBvbl9jbGlja190aXRsZSk7XG5cbiAgICAgIGlmICghcGFyYW1zLmNsb3NlZCkge1xuICAgICAgICB0aGlzLmNsb3NlZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgaWYgKHBhcmFtcy5hdXRvUGxhY2UpIHtcblxuICAgICAgaWYgKGNvbW1vbi5pc1VuZGVmaW5lZChwYXJhbXMucGFyZW50KSkge1xuXG4gICAgICAgIGlmIChhdXRvX3BsYWNlX3Zpcmdpbikge1xuICAgICAgICAgIGF1dG9fcGxhY2VfY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgZG9tLmFkZENsYXNzKGF1dG9fcGxhY2VfY29udGFpbmVyLCBDU1NfTkFNRVNQQUNFKTtcbiAgICAgICAgICBkb20uYWRkQ2xhc3MoYXV0b19wbGFjZV9jb250YWluZXIsIEdVSS5DTEFTU19BVVRPX1BMQUNFX0NPTlRBSU5FUik7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhdXRvX3BsYWNlX2NvbnRhaW5lcik7XG4gICAgICAgICAgYXV0b19wbGFjZV92aXJnaW4gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFB1dCBpdCBpbiB0aGUgZG9tIGZvciB5b3UuXG4gICAgICAgIGF1dG9fcGxhY2VfY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuZG9tRWxlbWVudCk7XG5cbiAgICAgICAgLy8gQXBwbHkgdGhlIGF1dG8gc3R5bGVzXG4gICAgICAgIGRvbS5hZGRDbGFzcyh0aGlzLmRvbUVsZW1lbnQsIEdVSS5DTEFTU19BVVRPX1BMQUNFKTtcblxuICAgICAgfVxuXG5cbiAgICAgIC8vIE1ha2UgaXQgbm90IGVsYXN0aWMuXG4gICAgICBpZiAoIXRoaXMucGFyZW50KSBzZXRXaWR0aChfdGhpcywgcGFyYW1zLndpZHRoKTtcblxuICAgIH1cblxuICAgIGRvbS5iaW5kKHdpbmRvdywgJ3Jlc2l6ZScsIGZ1bmN0aW9uKCkgeyBfdGhpcy5vblJlc2l6ZSgpIH0pO1xuICAgIGRvbS5iaW5kKHRoaXMuX191bCwgJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCBmdW5jdGlvbigpIHsgX3RoaXMub25SZXNpemUoKTsgfSk7XG4gICAgZG9tLmJpbmQodGhpcy5fX3VsLCAndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKCkgeyBfdGhpcy5vblJlc2l6ZSgpIH0pO1xuICAgIGRvbS5iaW5kKHRoaXMuX191bCwgJ29UcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24oKSB7IF90aGlzLm9uUmVzaXplKCkgfSk7XG4gICAgdGhpcy5vblJlc2l6ZSgpO1xuXG5cbiAgICBpZiAocGFyYW1zLnJlc2l6YWJsZSkge1xuICAgICAgYWRkUmVzaXplSGFuZGxlKHRoaXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmVUb0xvY2FsU3RvcmFnZSgpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGdldExvY2FsU3RvcmFnZUhhc2goX3RoaXMsICdndWknKSwgSlNPTi5zdHJpbmdpZnkoX3RoaXMuZ2V0U2F2ZU9iamVjdCgpKSk7XG4gICAgfVxuXG4gICAgdmFyIHJvb3QgPSBfdGhpcy5nZXRSb290KCk7XG4gICAgZnVuY3Rpb24gcmVzZXRXaWR0aCgpIHtcbiAgICAgICAgdmFyIHJvb3QgPSBfdGhpcy5nZXRSb290KCk7XG4gICAgICAgIHJvb3Qud2lkdGggKz0gMTtcbiAgICAgICAgY29tbW9uLmRlZmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJvb3Qud2lkdGggLT0gMTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghcGFyYW1zLnBhcmVudCkge1xuICAgICAgICByZXNldFdpZHRoKCk7XG4gICAgICB9XG5cbiAgfTtcblxuICBHVUkudG9nZ2xlSGlkZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaGlkZSA9ICFoaWRlO1xuICAgIGNvbW1vbi5lYWNoKGhpZGVhYmxlX2d1aXMsIGZ1bmN0aW9uKGd1aSkge1xuICAgICAgZ3VpLmRvbUVsZW1lbnQuc3R5bGUuekluZGV4ID0gaGlkZSA/IC05OTkgOiA5OTk7XG4gICAgICBndWkuZG9tRWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gaGlkZSA/IDAgOiAxO1xuICAgIH0pO1xuICB9O1xuXG4gIEdVSS5DTEFTU19BVVRPX1BMQUNFID0gJ2EnO1xuICBHVUkuQ0xBU1NfQVVUT19QTEFDRV9DT05UQUlORVIgPSAnYWMnO1xuICBHVUkuQ0xBU1NfTUFJTiA9ICdtYWluJztcbiAgR1VJLkNMQVNTX0NPTlRST0xMRVJfUk9XID0gJ2NyJztcbiAgR1VJLkNMQVNTX1RPT19UQUxMID0gJ3RhbGxlci10aGFuLXdpbmRvdyc7XG4gIEdVSS5DTEFTU19DTE9TRUQgPSAnY2xvc2VkJztcbiAgR1VJLkNMQVNTX0NMT1NFX0JVVFRPTiA9ICdjbG9zZS1idXR0b24nO1xuICBHVUkuQ0xBU1NfRFJBRyA9ICdkcmFnJztcblxuICBHVUkuREVGQVVMVF9XSURUSCA9IDI0NTtcbiAgR1VJLlRFWFRfQ0xPU0VEID0gJ0Nsb3NlIENvbnRyb2xzJztcbiAgR1VJLlRFWFRfT1BFTiA9ICdPcGVuIENvbnRyb2xzJztcblxuICBkb20uYmluZCh3aW5kb3csICdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuXG4gICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQudHlwZSAhPT0gJ3RleHQnICYmXG4gICAgICAgIChlLndoaWNoID09PSBISURFX0tFWV9DT0RFIHx8IGUua2V5Q29kZSA9PSBISURFX0tFWV9DT0RFKSkge1xuICAgICAgR1VJLnRvZ2dsZUhpZGUoKTtcbiAgICB9XG5cbiAgfSwgZmFsc2UpO1xuXG4gIGNvbW1vbi5leHRlbmQoXG5cbiAgICAgIEdVSS5wcm90b3R5cGUsXG5cbiAgICAgIC8qKiBAbGVuZHMgZGF0Lmd1aS5HVUkgKi9cbiAgICAgIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIG9iamVjdFxuICAgICAgICAgKiBAcGFyYW0gcHJvcGVydHlcbiAgICAgICAgICogQHJldHVybnMge2RhdC5jb250cm9sbGVycy5Db250cm9sbGVyfSBUaGUgbmV3IGNvbnRyb2xsZXIgdGhhdCB3YXMgYWRkZWQuXG4gICAgICAgICAqIEBpbnN0YW5jZVxuICAgICAgICAgKi9cbiAgICAgICAgYWRkOiBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7XG5cbiAgICAgICAgICByZXR1cm4gYWRkKFxuICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICBvYmplY3QsXG4gICAgICAgICAgICAgIHByb3BlcnR5LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmFjdG9yeUFyZ3M6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIG9iamVjdFxuICAgICAgICAgKiBAcGFyYW0gcHJvcGVydHlcbiAgICAgICAgICogQHJldHVybnMge2RhdC5jb250cm9sbGVycy5Db2xvckNvbnRyb2xsZXJ9IFRoZSBuZXcgY29udHJvbGxlciB0aGF0IHdhcyBhZGRlZC5cbiAgICAgICAgICogQGluc3RhbmNlXG4gICAgICAgICAqL1xuICAgICAgICBhZGRDb2xvcjogZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkge1xuXG4gICAgICAgICAgcmV0dXJuIGFkZChcbiAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgb2JqZWN0LFxuICAgICAgICAgICAgICBwcm9wZXJ0eSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbG9yOiB0cnVlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBjb250cm9sbGVyXG4gICAgICAgICAqIEBpbnN0YW5jZVxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG5cbiAgICAgICAgICAvLyBUT0RPIGxpc3RlbmluZz9cbiAgICAgICAgICB0aGlzLl9fdWwucmVtb3ZlQ2hpbGQoY29udHJvbGxlci5fX2xpKTtcbiAgICAgICAgICB0aGlzLl9fY29udHJvbGxlcnMuc2xpY2UodGhpcy5fX2NvbnRyb2xsZXJzLmluZGV4T2YoY29udHJvbGxlciksIDEpO1xuICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgY29tbW9uLmRlZmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMub25SZXNpemUoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgaWYgKHRoaXMuYXV0b1BsYWNlKSB7XG4gICAgICAgICAgICBhdXRvX3BsYWNlX2NvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLmRvbUVsZW1lbnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAgICAgKiBAcmV0dXJucyB7ZGF0Lmd1aS5HVUl9IFRoZSBuZXcgZm9sZGVyLlxuICAgICAgICAgKiBAdGhyb3dzIHtFcnJvcn0gaWYgdGhpcyBHVUkgYWxyZWFkeSBoYXMgYSBmb2xkZXIgYnkgdGhlIHNwZWNpZmllZFxuICAgICAgICAgKiBuYW1lXG4gICAgICAgICAqIEBpbnN0YW5jZVxuICAgICAgICAgKi9cbiAgICAgICAgYWRkRm9sZGVyOiBmdW5jdGlvbihuYW1lKSB7XG5cbiAgICAgICAgICAvLyBXZSBoYXZlIHRvIHByZXZlbnQgY29sbGlzaW9ucyBvbiBuYW1lcyBpbiBvcmRlciB0byBoYXZlIGEga2V5XG4gICAgICAgICAgLy8gYnkgd2hpY2ggdG8gcmVtZW1iZXIgc2F2ZWQgdmFsdWVzXG4gICAgICAgICAgaWYgKHRoaXMuX19mb2xkZXJzW25hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGFscmVhZHkgaGF2ZSBhIGZvbGRlciBpbiB0aGlzIEdVSSBieSB0aGUnICtcbiAgICAgICAgICAgICAgICAnIG5hbWUgXCInICsgbmFtZSArICdcIicpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBuZXdfZ3VpX3BhcmFtcyA9IHsgbmFtZTogbmFtZSwgcGFyZW50OiB0aGlzIH07XG5cbiAgICAgICAgICAvLyBXZSBuZWVkIHRvIHBhc3MgZG93biB0aGUgYXV0b1BsYWNlIHRyYWl0IHNvIHRoYXQgd2UgY2FuXG4gICAgICAgICAgLy8gYXR0YWNoIGV2ZW50IGxpc3RlbmVycyB0byBvcGVuL2Nsb3NlIGZvbGRlciBhY3Rpb25zIHRvXG4gICAgICAgICAgLy8gZW5zdXJlIHRoYXQgYSBzY3JvbGxiYXIgYXBwZWFycyBpZiB0aGUgd2luZG93IGlzIHRvbyBzaG9ydC5cbiAgICAgICAgICBuZXdfZ3VpX3BhcmFtcy5hdXRvUGxhY2UgPSB0aGlzLmF1dG9QbGFjZTtcblxuICAgICAgICAgIC8vIERvIHdlIGhhdmUgc2F2ZWQgYXBwZWFyYW5jZSBkYXRhIGZvciB0aGlzIGZvbGRlcj9cblxuICAgICAgICAgIGlmICh0aGlzLmxvYWQgJiYgLy8gQW55dGhpbmcgbG9hZGVkP1xuICAgICAgICAgICAgICB0aGlzLmxvYWQuZm9sZGVycyAmJiAvLyBXYXMgbXkgcGFyZW50IGEgZGVhZC1lbmQ/XG4gICAgICAgICAgICAgIHRoaXMubG9hZC5mb2xkZXJzW25hbWVdKSB7IC8vIERpZCBkYWRkeSByZW1lbWJlciBtZT9cblxuICAgICAgICAgICAgLy8gU3RhcnQgbWUgY2xvc2VkIGlmIEkgd2FzIGNsb3NlZFxuICAgICAgICAgICAgbmV3X2d1aV9wYXJhbXMuY2xvc2VkID0gdGhpcy5sb2FkLmZvbGRlcnNbbmFtZV0uY2xvc2VkO1xuXG4gICAgICAgICAgICAvLyBQYXNzIGRvd24gdGhlIGxvYWRlZCBkYXRhXG4gICAgICAgICAgICBuZXdfZ3VpX3BhcmFtcy5sb2FkID0gdGhpcy5sb2FkLmZvbGRlcnNbbmFtZV07XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgZ3VpID0gbmV3IEdVSShuZXdfZ3VpX3BhcmFtcyk7XG4gICAgICAgICAgdGhpcy5fX2ZvbGRlcnNbbmFtZV0gPSBndWk7XG5cbiAgICAgICAgICB2YXIgbGkgPSBhZGRSb3codGhpcywgZ3VpLmRvbUVsZW1lbnQpO1xuICAgICAgICAgIGRvbS5hZGRDbGFzcyhsaSwgJ2ZvbGRlcicpO1xuICAgICAgICAgIHJldHVybiBndWk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICBvcGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlZCA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25SZXNpemU6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgdmFyIHJvb3QgPSB0aGlzLmdldFJvb3QoKTtcblxuICAgICAgICAgIGlmIChyb290LnNjcm9sbGFibGUpIHtcblxuICAgICAgICAgICAgdmFyIHRvcCA9IGRvbS5nZXRPZmZzZXQocm9vdC5fX3VsKS50b3A7XG4gICAgICAgICAgICB2YXIgaCA9IDA7XG5cbiAgICAgICAgICAgIGNvbW1vbi5lYWNoKHJvb3QuX191bC5jaGlsZE5vZGVzLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgIGlmICghIChyb290LmF1dG9QbGFjZSAmJiBub2RlID09PSByb290Ll9fc2F2ZV9yb3cpKVxuICAgICAgICAgICAgICAgIGggKz0gZG9tLmdldEhlaWdodChub2RlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVySGVpZ2h0IC0gdG9wIC0gQ0xPU0VfQlVUVE9OX0hFSUdIVCA8IGgpIHtcbiAgICAgICAgICAgICAgZG9tLmFkZENsYXNzKHJvb3QuZG9tRWxlbWVudCwgR1VJLkNMQVNTX1RPT19UQUxMKTtcbiAgICAgICAgICAgICAgcm9vdC5fX3VsLnN0eWxlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIHRvcCAtIENMT1NFX0JVVFRPTl9IRUlHSFQgKyAncHgnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZG9tLnJlbW92ZUNsYXNzKHJvb3QuZG9tRWxlbWVudCwgR1VJLkNMQVNTX1RPT19UQUxMKTtcbiAgICAgICAgICAgICAgcm9vdC5fX3VsLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChyb290Ll9fcmVzaXplX2hhbmRsZSkge1xuICAgICAgICAgICAgY29tbW9uLmRlZmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByb290Ll9fcmVzaXplX2hhbmRsZS5zdHlsZS5oZWlnaHQgPSByb290Ll9fdWwub2Zmc2V0SGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChyb290Ll9fY2xvc2VCdXR0b24pIHtcbiAgICAgICAgICAgIHJvb3QuX19jbG9zZUJ1dHRvbi5zdHlsZS53aWR0aCA9IHJvb3Qud2lkdGggKyAncHgnO1xuICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNYXJrIG9iamVjdHMgZm9yIHNhdmluZy4gVGhlIG9yZGVyIG9mIHRoZXNlIG9iamVjdHMgY2Fubm90IGNoYW5nZSBhc1xuICAgICAgICAgKiB0aGUgR1VJIGdyb3dzLiBXaGVuIHJlbWVtYmVyaW5nIG5ldyBvYmplY3RzLCBhcHBlbmQgdGhlbSB0byB0aGUgZW5kXG4gICAgICAgICAqIG9mIHRoZSBsaXN0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdC4uLn0gb2JqZWN0c1xuICAgICAgICAgKiBAdGhyb3dzIHtFcnJvcn0gaWYgbm90IGNhbGxlZCBvbiBhIHRvcCBsZXZlbCBHVUkuXG4gICAgICAgICAqIEBpbnN0YW5jZVxuICAgICAgICAgKi9cbiAgICAgICAgcmVtZW1iZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgaWYgKGNvbW1vbi5pc1VuZGVmaW5lZChTQVZFX0RJQUxPR1VFKSkge1xuICAgICAgICAgICAgU0FWRV9ESUFMT0dVRSA9IG5ldyBDZW50ZXJlZERpdigpO1xuICAgICAgICAgICAgU0FWRV9ESUFMT0dVRS5kb21FbGVtZW50LmlubmVySFRNTCA9IHNhdmVEaWFsb2d1ZUNvbnRlbnRzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbiBvbmx5IGNhbGwgcmVtZW1iZXIgb24gYSB0b3AgbGV2ZWwgR1VJLlwiKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgY29tbW9uLmVhY2goQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSwgZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMuX19yZW1lbWJlcmVkT2JqZWN0cy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICBhZGRTYXZlTWVudShfdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoX3RoaXMuX19yZW1lbWJlcmVkT2JqZWN0cy5pbmRleE9mKG9iamVjdCkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgX3RoaXMuX19yZW1lbWJlcmVkT2JqZWN0cy5wdXNoKG9iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAodGhpcy5hdXRvUGxhY2UpIHtcbiAgICAgICAgICAgIC8vIFNldCBzYXZlIHJvdyB3aWR0aFxuICAgICAgICAgICAgc2V0V2lkdGgodGhpcywgdGhpcy53aWR0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm5zIHtkYXQuZ3VpLkdVSX0gdGhlIHRvcG1vc3QgcGFyZW50IEdVSSBvZiBhIG5lc3RlZCBHVUkuXG4gICAgICAgICAqIEBpbnN0YW5jZVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Um9vdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGd1aSA9IHRoaXM7XG4gICAgICAgICAgd2hpbGUgKGd1aS5wYXJlbnQpIHtcbiAgICAgICAgICAgIGd1aSA9IGd1aS5wYXJlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBndWk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGEgSlNPTiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IHN0YXRlIG9mXG4gICAgICAgICAqIHRoaXMgR1VJIGFzIHdlbGwgYXMgaXRzIHJlbWVtYmVyZWQgcHJvcGVydGllcy5cbiAgICAgICAgICogQGluc3RhbmNlXG4gICAgICAgICAqL1xuICAgICAgICBnZXRTYXZlT2JqZWN0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgIHZhciB0b1JldHVybiA9IHRoaXMubG9hZDtcblxuICAgICAgICAgIHRvUmV0dXJuLmNsb3NlZCA9IHRoaXMuY2xvc2VkO1xuXG4gICAgICAgICAgLy8gQW0gSSByZW1lbWJlcmluZyBhbnkgdmFsdWVzP1xuICAgICAgICAgIGlmICh0aGlzLl9fcmVtZW1iZXJlZE9iamVjdHMubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICB0b1JldHVybi5wcmVzZXQgPSB0aGlzLnByZXNldDtcblxuICAgICAgICAgICAgaWYgKCF0b1JldHVybi5yZW1lbWJlcmVkKSB7XG4gICAgICAgICAgICAgIHRvUmV0dXJuLnJlbWVtYmVyZWQgPSB7fTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG9SZXR1cm4ucmVtZW1iZXJlZFt0aGlzLnByZXNldF0gPSBnZXRDdXJyZW50UHJlc2V0KHRoaXMpO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdG9SZXR1cm4uZm9sZGVycyA9IHt9O1xuICAgICAgICAgIGNvbW1vbi5lYWNoKHRoaXMuX19mb2xkZXJzLCBmdW5jdGlvbihlbGVtZW50LCBrZXkpIHtcbiAgICAgICAgICAgIHRvUmV0dXJuLmZvbGRlcnNba2V5XSA9IGVsZW1lbnQuZ2V0U2F2ZU9iamVjdCgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICBpZiAoIXRoaXMubG9hZC5yZW1lbWJlcmVkKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWQucmVtZW1iZXJlZCA9IHt9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMubG9hZC5yZW1lbWJlcmVkW3RoaXMucHJlc2V0XSA9IGdldEN1cnJlbnRQcmVzZXQodGhpcyk7XG4gICAgICAgICAgbWFya1ByZXNldE1vZGlmaWVkKHRoaXMsIGZhbHNlKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIHNhdmVBczogZnVuY3Rpb24ocHJlc2V0TmFtZSkge1xuXG4gICAgICAgICAgaWYgKCF0aGlzLmxvYWQucmVtZW1iZXJlZCkge1xuXG4gICAgICAgICAgICAvLyBSZXRhaW4gZGVmYXVsdCB2YWx1ZXMgdXBvbiBmaXJzdCBzYXZlXG4gICAgICAgICAgICB0aGlzLmxvYWQucmVtZW1iZXJlZCA9IHt9O1xuICAgICAgICAgICAgdGhpcy5sb2FkLnJlbWVtYmVyZWRbREVGQVVMVF9ERUZBVUxUX1BSRVNFVF9OQU1FXSA9IGdldEN1cnJlbnRQcmVzZXQodGhpcywgdHJ1ZSk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmxvYWQucmVtZW1iZXJlZFtwcmVzZXROYW1lXSA9IGdldEN1cnJlbnRQcmVzZXQodGhpcyk7XG4gICAgICAgICAgdGhpcy5wcmVzZXQgPSBwcmVzZXROYW1lO1xuICAgICAgICAgIGFkZFByZXNldE9wdGlvbih0aGlzLCBwcmVzZXROYW1lLCB0cnVlKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIHJldmVydDogZnVuY3Rpb24oZ3VpKSB7XG5cbiAgICAgICAgICBjb21tb24uZWFjaCh0aGlzLl9fY29udHJvbGxlcnMsIGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIC8vIE1ha2UgcmV2ZXJ0IHdvcmsgb24gRGVmYXVsdC5cbiAgICAgICAgICAgIGlmICghdGhpcy5nZXRSb290KCkubG9hZC5yZW1lbWJlcmVkKSB7XG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIuc2V0VmFsdWUoY29udHJvbGxlci5pbml0aWFsVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVjYWxsU2F2ZWRWYWx1ZShndWkgfHwgdGhpcy5nZXRSb290KCksIGNvbnRyb2xsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgY29tbW9uLmVhY2godGhpcy5fX2ZvbGRlcnMsIGZ1bmN0aW9uKGZvbGRlcikge1xuICAgICAgICAgICAgZm9sZGVyLnJldmVydChmb2xkZXIpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKCFndWkpIHtcbiAgICAgICAgICAgIG1hcmtQcmVzZXRNb2RpZmllZCh0aGlzLmdldFJvb3QoKSwgZmFsc2UpO1xuICAgICAgICAgIH1cblxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgbGlzdGVuOiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG5cbiAgICAgICAgICB2YXIgaW5pdCA9IHRoaXMuX19saXN0ZW5pbmcubGVuZ3RoID09IDA7XG4gICAgICAgICAgdGhpcy5fX2xpc3RlbmluZy5wdXNoKGNvbnRyb2xsZXIpO1xuICAgICAgICAgIGlmIChpbml0KSB1cGRhdGVEaXNwbGF5cyh0aGlzLl9fbGlzdGVuaW5nKTtcblxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICApO1xuXG4gIGZ1bmN0aW9uIGFkZChndWksIG9iamVjdCwgcHJvcGVydHksIHBhcmFtcykge1xuXG4gICAgaWYgKG9iamVjdFtwcm9wZXJ0eV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT2JqZWN0IFwiICsgb2JqZWN0ICsgXCIgaGFzIG5vIHByb3BlcnR5IFxcXCJcIiArIHByb3BlcnR5ICsgXCJcXFwiXCIpO1xuICAgIH1cblxuICAgIHZhciBjb250cm9sbGVyO1xuXG4gICAgaWYgKHBhcmFtcy5jb2xvcikge1xuXG4gICAgICBjb250cm9sbGVyID0gbmV3IENvbG9yQ29udHJvbGxlcihvYmplY3QsIHByb3BlcnR5KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIHZhciBmYWN0b3J5QXJncyA9IFtvYmplY3QscHJvcGVydHldLmNvbmNhdChwYXJhbXMuZmFjdG9yeUFyZ3MpO1xuICAgICAgY29udHJvbGxlciA9IGNvbnRyb2xsZXJGYWN0b3J5LmFwcGx5KGd1aSwgZmFjdG9yeUFyZ3MpO1xuXG4gICAgfVxuXG4gICAgaWYgKHBhcmFtcy5iZWZvcmUgaW5zdGFuY2VvZiBDb250cm9sbGVyKSB7XG4gICAgICBwYXJhbXMuYmVmb3JlID0gcGFyYW1zLmJlZm9yZS5fX2xpO1xuICAgIH1cblxuICAgIHJlY2FsbFNhdmVkVmFsdWUoZ3VpLCBjb250cm9sbGVyKTtcblxuICAgIGRvbS5hZGRDbGFzcyhjb250cm9sbGVyLmRvbUVsZW1lbnQsICdjJyk7XG5cbiAgICB2YXIgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBkb20uYWRkQ2xhc3MobmFtZSwgJ3Byb3BlcnR5LW5hbWUnKTtcbiAgICBuYW1lLmlubmVySFRNTCA9IGNvbnRyb2xsZXIucHJvcGVydHk7XG5cbiAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5hbWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjb250cm9sbGVyLmRvbUVsZW1lbnQpO1xuXG4gICAgdmFyIGxpID0gYWRkUm93KGd1aSwgY29udGFpbmVyLCBwYXJhbXMuYmVmb3JlKTtcblxuICAgIGRvbS5hZGRDbGFzcyhsaSwgR1VJLkNMQVNTX0NPTlRST0xMRVJfUk9XKTtcbiAgICBkb20uYWRkQ2xhc3MobGksIHR5cGVvZiBjb250cm9sbGVyLmdldFZhbHVlKCkpO1xuXG4gICAgYXVnbWVudENvbnRyb2xsZXIoZ3VpLCBsaSwgY29udHJvbGxlcik7XG5cbiAgICBndWkuX19jb250cm9sbGVycy5wdXNoKGNvbnRyb2xsZXIpO1xuXG4gICAgcmV0dXJuIGNvbnRyb2xsZXI7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSByb3cgdG8gdGhlIGVuZCBvZiB0aGUgR1VJIG9yIGJlZm9yZSBhbm90aGVyIHJvdy5cbiAgICpcbiAgICogQHBhcmFtIGd1aVxuICAgKiBAcGFyYW0gW2RvbV0gSWYgc3BlY2lmaWVkLCBpbnNlcnRzIHRoZSBkb20gY29udGVudCBpbiB0aGUgbmV3IHJvd1xuICAgKiBAcGFyYW0gW2xpQmVmb3JlXSBJZiBzcGVjaWZpZWQsIHBsYWNlcyB0aGUgbmV3IHJvdyBiZWZvcmUgYW5vdGhlciByb3dcbiAgICovXG4gIGZ1bmN0aW9uIGFkZFJvdyhndWksIGRvbSwgbGlCZWZvcmUpIHtcbiAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgIGlmIChkb20pIGxpLmFwcGVuZENoaWxkKGRvbSk7XG4gICAgaWYgKGxpQmVmb3JlKSB7XG4gICAgICBndWkuX191bC5pbnNlcnRCZWZvcmUobGksIHBhcmFtcy5iZWZvcmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBndWkuX191bC5hcHBlbmRDaGlsZChsaSk7XG4gICAgfVxuICAgIGd1aS5vblJlc2l6ZSgpO1xuICAgIHJldHVybiBsaTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGF1Z21lbnRDb250cm9sbGVyKGd1aSwgbGksIGNvbnRyb2xsZXIpIHtcblxuICAgIGNvbnRyb2xsZXIuX19saSA9IGxpO1xuICAgIGNvbnRyb2xsZXIuX19ndWkgPSBndWk7XG5cbiAgICBjb21tb24uZXh0ZW5kKGNvbnRyb2xsZXIsIHtcblxuICAgICAgb3B0aW9uczogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGNvbnRyb2xsZXIucmVtb3ZlKCk7XG5cbiAgICAgICAgICByZXR1cm4gYWRkKFxuICAgICAgICAgICAgICBndWksXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIub2JqZWN0LFxuICAgICAgICAgICAgICBjb250cm9sbGVyLnByb3BlcnR5LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYmVmb3JlOiBjb250cm9sbGVyLl9fbGkubmV4dEVsZW1lbnRTaWJsaW5nLFxuICAgICAgICAgICAgICAgIGZhY3RvcnlBcmdzOiBbY29tbW9uLnRvQXJyYXkoYXJndW1lbnRzKV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb21tb24uaXNBcnJheShvcHRpb25zKSB8fCBjb21tb24uaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICAgICAgICBjb250cm9sbGVyLnJlbW92ZSgpO1xuXG4gICAgICAgICAgcmV0dXJuIGFkZChcbiAgICAgICAgICAgICAgZ3VpLFxuICAgICAgICAgICAgICBjb250cm9sbGVyLm9iamVjdCxcbiAgICAgICAgICAgICAgY29udHJvbGxlci5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJlZm9yZTogY29udHJvbGxlci5fX2xpLm5leHRFbGVtZW50U2libGluZyxcbiAgICAgICAgICAgICAgICBmYWN0b3J5QXJnczogW29wdGlvbnNdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuXG4gICAgICAgIH1cblxuICAgICAgfSxcblxuICAgICAgbmFtZTogZnVuY3Rpb24odikge1xuICAgICAgICBjb250cm9sbGVyLl9fbGkuZmlyc3RFbGVtZW50Q2hpbGQuZmlyc3RFbGVtZW50Q2hpbGQuaW5uZXJIVE1MID0gdjtcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xsZXI7XG4gICAgICB9LFxuXG4gICAgICBsaXN0ZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb250cm9sbGVyLl9fZ3VpLmxpc3Rlbihjb250cm9sbGVyKTtcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xsZXI7XG4gICAgICB9LFxuXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb250cm9sbGVyLl9fZ3VpLnJlbW92ZShjb250cm9sbGVyKTtcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xsZXI7XG4gICAgICB9XG5cbiAgICB9KTtcblxuICAgIC8vIEFsbCBzbGlkZXJzIHNob3VsZCBiZSBhY2NvbXBhbmllZCBieSBhIGJveC5cbiAgICBpZiAoY29udHJvbGxlciBpbnN0YW5jZW9mIE51bWJlckNvbnRyb2xsZXJTbGlkZXIpIHtcblxuICAgICAgdmFyIGJveCA9IG5ldyBOdW1iZXJDb250cm9sbGVyQm94KGNvbnRyb2xsZXIub2JqZWN0LCBjb250cm9sbGVyLnByb3BlcnR5LFxuICAgICAgICAgIHsgbWluOiBjb250cm9sbGVyLl9fbWluLCBtYXg6IGNvbnRyb2xsZXIuX19tYXgsIHN0ZXA6IGNvbnRyb2xsZXIuX19zdGVwIH0pO1xuXG4gICAgICBjb21tb24uZWFjaChbJ3VwZGF0ZURpc3BsYXknLCAnb25DaGFuZ2UnLCAnb25GaW5pc2hDaGFuZ2UnXSwgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgIHZhciBwYyA9IGNvbnRyb2xsZXJbbWV0aG9kXTtcbiAgICAgICAgdmFyIHBiID0gYm94W21ldGhvZF07XG4gICAgICAgIGNvbnRyb2xsZXJbbWV0aG9kXSA9IGJveFttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgIHBjLmFwcGx5KGNvbnRyb2xsZXIsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiBwYi5hcHBseShib3gsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZG9tLmFkZENsYXNzKGxpLCAnaGFzLXNsaWRlcicpO1xuICAgICAgY29udHJvbGxlci5kb21FbGVtZW50Lmluc2VydEJlZm9yZShib3guZG9tRWxlbWVudCwgY29udHJvbGxlci5kb21FbGVtZW50LmZpcnN0RWxlbWVudENoaWxkKTtcblxuICAgIH1cbiAgICBlbHNlIGlmIChjb250cm9sbGVyIGluc3RhbmNlb2YgTnVtYmVyQ29udHJvbGxlckJveCkge1xuXG4gICAgICB2YXIgciA9IGZ1bmN0aW9uKHJldHVybmVkKSB7XG5cbiAgICAgICAgLy8gSGF2ZSB3ZSBkZWZpbmVkIGJvdGggYm91bmRhcmllcz9cbiAgICAgICAgaWYgKGNvbW1vbi5pc051bWJlcihjb250cm9sbGVyLl9fbWluKSAmJiBjb21tb24uaXNOdW1iZXIoY29udHJvbGxlci5fX21heCkpIHtcblxuICAgICAgICAgIC8vIFdlbGwsIHRoZW4gbGV0cyBqdXN0IHJlcGxhY2UgdGhpcyB3aXRoIGEgc2xpZGVyLlxuICAgICAgICAgIGNvbnRyb2xsZXIucmVtb3ZlKCk7XG4gICAgICAgICAgcmV0dXJuIGFkZChcbiAgICAgICAgICAgICAgZ3VpLFxuICAgICAgICAgICAgICBjb250cm9sbGVyLm9iamVjdCxcbiAgICAgICAgICAgICAgY29udHJvbGxlci5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGJlZm9yZTogY29udHJvbGxlci5fX2xpLm5leHRFbGVtZW50U2libGluZyxcbiAgICAgICAgICAgICAgICBmYWN0b3J5QXJnczogW2NvbnRyb2xsZXIuX19taW4sIGNvbnRyb2xsZXIuX19tYXgsIGNvbnRyb2xsZXIuX19zdGVwXVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldHVybmVkO1xuXG4gICAgICB9O1xuXG4gICAgICBjb250cm9sbGVyLm1pbiA9IGNvbW1vbi5jb21wb3NlKHIsIGNvbnRyb2xsZXIubWluKTtcbiAgICAgIGNvbnRyb2xsZXIubWF4ID0gY29tbW9uLmNvbXBvc2UociwgY29udHJvbGxlci5tYXgpO1xuXG4gICAgfVxuICAgIGVsc2UgaWYgKGNvbnRyb2xsZXIgaW5zdGFuY2VvZiBCb29sZWFuQ29udHJvbGxlcikge1xuXG4gICAgICBkb20uYmluZChsaSwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvbS5mYWtlRXZlbnQoY29udHJvbGxlci5fX2NoZWNrYm94LCAnY2xpY2snKTtcbiAgICAgIH0pO1xuXG4gICAgICBkb20uYmluZChjb250cm9sbGVyLl9fY2hlY2tib3gsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTsgLy8gUHJldmVudHMgZG91YmxlLXRvZ2dsZVxuICAgICAgfSlcblxuICAgIH1cbiAgICBlbHNlIGlmIChjb250cm9sbGVyIGluc3RhbmNlb2YgRnVuY3Rpb25Db250cm9sbGVyKSB7XG5cbiAgICAgIGRvbS5iaW5kKGxpLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZG9tLmZha2VFdmVudChjb250cm9sbGVyLl9fYnV0dG9uLCAnY2xpY2snKTtcbiAgICAgIH0pO1xuXG4gICAgICBkb20uYmluZChsaSwgJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICBkb20uYWRkQ2xhc3MoY29udHJvbGxlci5fX2J1dHRvbiwgJ2hvdmVyJyk7XG4gICAgICB9KTtcblxuICAgICAgZG9tLmJpbmQobGksICdtb3VzZW91dCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoY29udHJvbGxlci5fX2J1dHRvbiwgJ2hvdmVyJyk7XG4gICAgICB9KTtcblxuICAgIH1cbiAgICBlbHNlIGlmIChjb250cm9sbGVyIGluc3RhbmNlb2YgQ29sb3JDb250cm9sbGVyKSB7XG5cbiAgICAgIGRvbS5hZGRDbGFzcyhsaSwgJ2NvbG9yJyk7XG4gICAgICBjb250cm9sbGVyLnVwZGF0ZURpc3BsYXkgPSBjb21tb24uY29tcG9zZShmdW5jdGlvbihyKSB7XG4gICAgICAgIGxpLnN0eWxlLmJvcmRlckxlZnRDb2xvciA9IGNvbnRyb2xsZXIuX19jb2xvci50b1N0cmluZygpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICAgIH0sIGNvbnRyb2xsZXIudXBkYXRlRGlzcGxheSk7XG5cbiAgICAgIGNvbnRyb2xsZXIudXBkYXRlRGlzcGxheSgpO1xuXG4gICAgfVxuXG4gICAgY29udHJvbGxlci5zZXRWYWx1ZSA9IGNvbW1vbi5jb21wb3NlKGZ1bmN0aW9uKHIpIHtcbiAgICAgIGlmIChndWkuZ2V0Um9vdCgpLl9fcHJlc2V0X3NlbGVjdCAmJiBjb250cm9sbGVyLmlzTW9kaWZpZWQoKSkge1xuICAgICAgICBtYXJrUHJlc2V0TW9kaWZpZWQoZ3VpLmdldFJvb3QoKSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcjtcbiAgICB9LCBjb250cm9sbGVyLnNldFZhbHVlKTtcblxuICB9XG5cbiAgZnVuY3Rpb24gcmVjYWxsU2F2ZWRWYWx1ZShndWksIGNvbnRyb2xsZXIpIHtcblxuICAgIC8vIEZpbmQgdGhlIHRvcG1vc3QgR1VJLCB0aGF0J3Mgd2hlcmUgcmVtZW1iZXJlZCBvYmplY3RzIGxpdmUuXG4gICAgdmFyIHJvb3QgPSBndWkuZ2V0Um9vdCgpO1xuXG4gICAgLy8gRG9lcyB0aGUgb2JqZWN0IHdlJ3JlIGNvbnRyb2xsaW5nIG1hdGNoIGFueXRoaW5nIHdlJ3ZlIGJlZW4gdG9sZCB0b1xuICAgIC8vIHJlbWVtYmVyP1xuICAgIHZhciBtYXRjaGVkX2luZGV4ID0gcm9vdC5fX3JlbWVtYmVyZWRPYmplY3RzLmluZGV4T2YoY29udHJvbGxlci5vYmplY3QpO1xuXG4gICAgLy8gV2h5IHllcywgaXQgZG9lcyFcbiAgICBpZiAobWF0Y2hlZF9pbmRleCAhPSAtMSkge1xuXG4gICAgICAvLyBMZXQgbWUgZmV0Y2ggYSBtYXAgb2YgY29udHJvbGxlcnMgZm9yIHRoY29tbW9uLmlzT2JqZWN0LlxuICAgICAgdmFyIGNvbnRyb2xsZXJfbWFwID1cbiAgICAgICAgICByb290Ll9fcmVtZW1iZXJlZE9iamVjdEluZGVjZXNUb0NvbnRyb2xsZXJzW21hdGNoZWRfaW5kZXhdO1xuXG4gICAgICAvLyBPaHAsIEkgYmVsaWV2ZSB0aGlzIGlzIHRoZSBmaXJzdCBjb250cm9sbGVyIHdlJ3ZlIGNyZWF0ZWQgZm9yIHRoaXNcbiAgICAgIC8vIG9iamVjdC4gTGV0cyBtYWtlIHRoZSBtYXAgZnJlc2guXG4gICAgICBpZiAoY29udHJvbGxlcl9tYXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb250cm9sbGVyX21hcCA9IHt9O1xuICAgICAgICByb290Ll9fcmVtZW1iZXJlZE9iamVjdEluZGVjZXNUb0NvbnRyb2xsZXJzW21hdGNoZWRfaW5kZXhdID1cbiAgICAgICAgICAgIGNvbnRyb2xsZXJfbWFwO1xuICAgICAgfVxuXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoaXMgY29udHJvbGxlclxuICAgICAgY29udHJvbGxlcl9tYXBbY29udHJvbGxlci5wcm9wZXJ0eV0gPSBjb250cm9sbGVyO1xuXG4gICAgICAvLyBPa2F5LCBub3cgaGF2ZSB3ZSBzYXZlZCBhbnkgdmFsdWVzIGZvciB0aGlzIGNvbnRyb2xsZXI/XG4gICAgICBpZiAocm9vdC5sb2FkICYmIHJvb3QubG9hZC5yZW1lbWJlcmVkKSB7XG5cbiAgICAgICAgdmFyIHByZXNldF9tYXAgPSByb290LmxvYWQucmVtZW1iZXJlZDtcblxuICAgICAgICAvLyBXaGljaCBwcmVzZXQgYXJlIHdlIHRyeWluZyB0byBsb2FkP1xuICAgICAgICB2YXIgcHJlc2V0O1xuXG4gICAgICAgIGlmIChwcmVzZXRfbWFwW2d1aS5wcmVzZXRdKSB7XG5cbiAgICAgICAgICBwcmVzZXQgPSBwcmVzZXRfbWFwW2d1aS5wcmVzZXRdO1xuXG4gICAgICAgIH0gZWxzZSBpZiAocHJlc2V0X21hcFtERUZBVUxUX0RFRkFVTFRfUFJFU0VUX05BTUVdKSB7XG5cbiAgICAgICAgICAvLyBVaGgsIHlvdSBjYW4gaGF2ZSB0aGUgZGVmYXVsdCBpbnN0ZWFkP1xuICAgICAgICAgIHByZXNldCA9IHByZXNldF9tYXBbREVGQVVMVF9ERUZBVUxUX1BSRVNFVF9OQU1FXTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgLy8gTmFkYS5cblxuICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB9XG5cblxuICAgICAgICAvLyBEaWQgdGhlIGxvYWRlZCBvYmplY3QgcmVtZW1iZXIgdGhjb21tb24uaXNPYmplY3Q/XG4gICAgICAgIGlmIChwcmVzZXRbbWF0Y2hlZF9pbmRleF0gJiZcblxuICAgICAgICAgIC8vIERpZCB3ZSByZW1lbWJlciB0aGlzIHBhcnRpY3VsYXIgcHJvcGVydHk/XG4gICAgICAgICAgICBwcmVzZXRbbWF0Y2hlZF9pbmRleF1bY29udHJvbGxlci5wcm9wZXJ0eV0gIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgLy8gV2UgZGlkIHJlbWVtYmVyIHNvbWV0aGluZyBmb3IgdGhpcyBndXkgLi4uXG4gICAgICAgICAgdmFyIHZhbHVlID0gcHJlc2V0W21hdGNoZWRfaW5kZXhdW2NvbnRyb2xsZXIucHJvcGVydHldO1xuXG4gICAgICAgICAgLy8gQW5kIHRoYXQncyB3aGF0IGl0IGlzLlxuICAgICAgICAgIGNvbnRyb2xsZXIuaW5pdGlhbFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgY29udHJvbGxlci5zZXRWYWx1ZSh2YWx1ZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICB9XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExvY2FsU3RvcmFnZUhhc2goZ3VpLCBrZXkpIHtcbiAgICAvLyBUT0RPIGhvdyBkb2VzIHRoaXMgZGVhbCB3aXRoIG11bHRpcGxlIEdVSSdzP1xuICAgIHJldHVybiBkb2N1bWVudC5sb2NhdGlvbi5ocmVmICsgJy4nICsga2V5O1xuXG4gIH1cblxuICBmdW5jdGlvbiBhZGRTYXZlTWVudShndWkpIHtcblxuICAgIHZhciBkaXYgPSBndWkuX19zYXZlX3JvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG5cbiAgICBkb20uYWRkQ2xhc3MoZ3VpLmRvbUVsZW1lbnQsICdoYXMtc2F2ZScpO1xuXG4gICAgZ3VpLl9fdWwuaW5zZXJ0QmVmb3JlKGRpdiwgZ3VpLl9fdWwuZmlyc3RDaGlsZCk7XG5cbiAgICBkb20uYWRkQ2xhc3MoZGl2LCAnc2F2ZS1yb3cnKTtcblxuICAgIHZhciBnZWFycyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBnZWFycy5pbm5lckhUTUwgPSAnJm5ic3A7JztcbiAgICBkb20uYWRkQ2xhc3MoZ2VhcnMsICdidXR0b24gZ2VhcnMnKTtcblxuICAgIC8vIFRPRE8gcmVwbGFjZSB3aXRoIEZ1bmN0aW9uQ29udHJvbGxlclxuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgYnV0dG9uLmlubmVySFRNTCA9ICdTYXZlJztcbiAgICBkb20uYWRkQ2xhc3MoYnV0dG9uLCAnYnV0dG9uJyk7XG4gICAgZG9tLmFkZENsYXNzKGJ1dHRvbiwgJ3NhdmUnKTtcblxuICAgIHZhciBidXR0b24yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGJ1dHRvbjIuaW5uZXJIVE1MID0gJ05ldyc7XG4gICAgZG9tLmFkZENsYXNzKGJ1dHRvbjIsICdidXR0b24nKTtcbiAgICBkb20uYWRkQ2xhc3MoYnV0dG9uMiwgJ3NhdmUtYXMnKTtcblxuICAgIHZhciBidXR0b24zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGJ1dHRvbjMuaW5uZXJIVE1MID0gJ1JldmVydCc7XG4gICAgZG9tLmFkZENsYXNzKGJ1dHRvbjMsICdidXR0b24nKTtcbiAgICBkb20uYWRkQ2xhc3MoYnV0dG9uMywgJ3JldmVydCcpO1xuXG4gICAgdmFyIHNlbGVjdCA9IGd1aS5fX3ByZXNldF9zZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWxlY3QnKTtcblxuICAgIGlmIChndWkubG9hZCAmJiBndWkubG9hZC5yZW1lbWJlcmVkKSB7XG5cbiAgICAgIGNvbW1vbi5lYWNoKGd1aS5sb2FkLnJlbWVtYmVyZWQsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgYWRkUHJlc2V0T3B0aW9uKGd1aSwga2V5LCBrZXkgPT0gZ3VpLnByZXNldCk7XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBhZGRQcmVzZXRPcHRpb24oZ3VpLCBERUZBVUxUX0RFRkFVTFRfUFJFU0VUX05BTUUsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBkb20uYmluZChzZWxlY3QsICdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblxuXG4gICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgZ3VpLl9fcHJlc2V0X3NlbGVjdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgZ3VpLl9fcHJlc2V0X3NlbGVjdFtpbmRleF0uaW5uZXJIVE1MID0gZ3VpLl9fcHJlc2V0X3NlbGVjdFtpbmRleF0udmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGd1aS5wcmVzZXQgPSB0aGlzLnZhbHVlO1xuXG4gICAgfSk7XG5cbiAgICBkaXYuYXBwZW5kQ2hpbGQoc2VsZWN0KTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQoZ2VhcnMpO1xuICAgIGRpdi5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgIGRpdi5hcHBlbmRDaGlsZChidXR0b24yKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQoYnV0dG9uMyk7XG5cbiAgICBpZiAoU1VQUE9SVFNfTE9DQUxfU1RPUkFHRSkge1xuXG4gICAgICB2YXIgc2F2ZUxvY2FsbHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGctc2F2ZS1sb2NhbGx5Jyk7XG4gICAgICB2YXIgZXhwbGFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZy1sb2NhbC1leHBsYWluJyk7XG5cbiAgICAgIHNhdmVMb2NhbGx5LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICB2YXIgbG9jYWxTdG9yYWdlQ2hlY2tCb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGctbG9jYWwtc3RvcmFnZScpO1xuXG4gICAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oZ2V0TG9jYWxTdG9yYWdlSGFzaChndWksICdpc0xvY2FsJykpID09PSAndHJ1ZScpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlQ2hlY2tCb3guc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hvd0hpZGVFeHBsYWluKCkge1xuICAgICAgICBleHBsYWluLnN0eWxlLmRpc3BsYXkgPSBndWkudXNlTG9jYWxTdG9yYWdlID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICAgIH1cblxuICAgICAgc2hvd0hpZGVFeHBsYWluKCk7XG5cbiAgICAgIC8vIFRPRE86IFVzZSBhIGJvb2xlYW4gY29udHJvbGxlciwgZm9vbCFcbiAgICAgIGRvbS5iaW5kKGxvY2FsU3RvcmFnZUNoZWNrQm94LCAnY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGd1aS51c2VMb2NhbFN0b3JhZ2UgPSAhZ3VpLnVzZUxvY2FsU3RvcmFnZTtcbiAgICAgICAgc2hvd0hpZGVFeHBsYWluKCk7XG4gICAgICB9KTtcblxuICAgIH1cblxuICAgIHZhciBuZXdDb25zdHJ1Y3RvclRleHRBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RnLW5ldy1jb25zdHJ1Y3RvcicpO1xuXG4gICAgZG9tLmJpbmQobmV3Q29uc3RydWN0b3JUZXh0QXJlYSwgJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS5tZXRhS2V5ICYmIChlLndoaWNoID09PSA2NyB8fCBlLmtleUNvZGUgPT0gNjcpKSB7XG4gICAgICAgIFNBVkVfRElBTE9HVUUuaGlkZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZG9tLmJpbmQoZ2VhcnMsICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgbmV3Q29uc3RydWN0b3JUZXh0QXJlYS5pbm5lckhUTUwgPSBKU09OLnN0cmluZ2lmeShndWkuZ2V0U2F2ZU9iamVjdCgpLCB1bmRlZmluZWQsIDIpO1xuICAgICAgU0FWRV9ESUFMT0dVRS5zaG93KCk7XG4gICAgICBuZXdDb25zdHJ1Y3RvclRleHRBcmVhLmZvY3VzKCk7XG4gICAgICBuZXdDb25zdHJ1Y3RvclRleHRBcmVhLnNlbGVjdCgpO1xuICAgIH0pO1xuXG4gICAgZG9tLmJpbmQoYnV0dG9uLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIGd1aS5zYXZlKCk7XG4gICAgfSk7XG5cbiAgICBkb20uYmluZChidXR0b24yLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcmVzZXROYW1lID0gcHJvbXB0KCdFbnRlciBhIG5ldyBwcmVzZXQgbmFtZS4nKTtcbiAgICAgIGlmIChwcmVzZXROYW1lKSBndWkuc2F2ZUFzKHByZXNldE5hbWUpO1xuICAgIH0pO1xuXG4gICAgZG9tLmJpbmQoYnV0dG9uMywgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICBndWkucmV2ZXJ0KCk7XG4gICAgfSk7XG5cbi8vICAgIGRpdi5hcHBlbmRDaGlsZChidXR0b24yKTtcblxuICB9XG5cbiAgZnVuY3Rpb24gYWRkUmVzaXplSGFuZGxlKGd1aSkge1xuXG4gICAgZ3VpLl9fcmVzaXplX2hhbmRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgY29tbW9uLmV4dGVuZChndWkuX19yZXNpemVfaGFuZGxlLnN0eWxlLCB7XG5cbiAgICAgIHdpZHRoOiAnNnB4JyxcbiAgICAgIG1hcmdpbkxlZnQ6ICctM3B4JyxcbiAgICAgIGhlaWdodDogJzIwMHB4JyxcbiAgICAgIGN1cnNvcjogJ2V3LXJlc2l6ZScsXG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJ1xuLy8gICAgICBib3JkZXI6ICcxcHggc29saWQgYmx1ZSdcblxuICAgIH0pO1xuXG4gICAgdmFyIHBtb3VzZVg7XG5cbiAgICBkb20uYmluZChndWkuX19yZXNpemVfaGFuZGxlLCAnbW91c2Vkb3duJywgZHJhZ1N0YXJ0KTtcbiAgICBkb20uYmluZChndWkuX19jbG9zZUJ1dHRvbiwgJ21vdXNlZG93bicsIGRyYWdTdGFydCk7XG5cbiAgICBndWkuZG9tRWxlbWVudC5pbnNlcnRCZWZvcmUoZ3VpLl9fcmVzaXplX2hhbmRsZSwgZ3VpLmRvbUVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQpO1xuXG4gICAgZnVuY3Rpb24gZHJhZ1N0YXJ0KGUpIHtcblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBwbW91c2VYID0gZS5jbGllbnRYO1xuXG4gICAgICBkb20uYWRkQ2xhc3MoZ3VpLl9fY2xvc2VCdXR0b24sIEdVSS5DTEFTU19EUkFHKTtcbiAgICAgIGRvbS5iaW5kKHdpbmRvdywgJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgICAgZG9tLmJpbmQod2luZG93LCAnbW91c2V1cCcsIGRyYWdTdG9wKTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhZyhlKSB7XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgZ3VpLndpZHRoICs9IHBtb3VzZVggLSBlLmNsaWVudFg7XG4gICAgICBndWkub25SZXNpemUoKTtcbiAgICAgIHBtb3VzZVggPSBlLmNsaWVudFg7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYWdTdG9wKCkge1xuXG4gICAgICBkb20ucmVtb3ZlQ2xhc3MoZ3VpLl9fY2xvc2VCdXR0b24sIEdVSS5DTEFTU19EUkFHKTtcbiAgICAgIGRvbS51bmJpbmQod2luZG93LCAnbW91c2Vtb3ZlJywgZHJhZyk7XG4gICAgICBkb20udW5iaW5kKHdpbmRvdywgJ21vdXNldXAnLCBkcmFnU3RvcCk7XG5cbiAgICB9XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFdpZHRoKGd1aSwgdykge1xuICAgIGd1aS5kb21FbGVtZW50LnN0eWxlLndpZHRoID0gdyArICdweCc7XG4gICAgLy8gQXV0byBwbGFjZWQgc2F2ZS1yb3dzIGFyZSBwb3NpdGlvbiBmaXhlZCwgc28gd2UgaGF2ZSB0b1xuICAgIC8vIHNldCB0aGUgd2lkdGggbWFudWFsbHkgaWYgd2Ugd2FudCBpdCB0byBibGVlZCB0byB0aGUgZWRnZVxuICAgIGlmIChndWkuX19zYXZlX3JvdyAmJiBndWkuYXV0b1BsYWNlKSB7XG4gICAgICBndWkuX19zYXZlX3Jvdy5zdHlsZS53aWR0aCA9IHcgKyAncHgnO1xuICAgIH1pZiAoZ3VpLl9fY2xvc2VCdXR0b24pIHtcbiAgICAgIGd1aS5fX2Nsb3NlQnV0dG9uLnN0eWxlLndpZHRoID0gdyArICdweCc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q3VycmVudFByZXNldChndWksIHVzZUluaXRpYWxWYWx1ZXMpIHtcblxuICAgIHZhciB0b1JldHVybiA9IHt9O1xuXG4gICAgLy8gRm9yIGVhY2ggb2JqZWN0IEknbSByZW1lbWJlcmluZ1xuICAgIGNvbW1vbi5lYWNoKGd1aS5fX3JlbWVtYmVyZWRPYmplY3RzLCBmdW5jdGlvbih2YWwsIGluZGV4KSB7XG5cbiAgICAgIHZhciBzYXZlZF92YWx1ZXMgPSB7fTtcblxuICAgICAgLy8gVGhlIGNvbnRyb2xsZXJzIEkndmUgbWFkZSBmb3IgdGhjb21tb24uaXNPYmplY3QgYnkgcHJvcGVydHlcbiAgICAgIHZhciBjb250cm9sbGVyX21hcCA9XG4gICAgICAgICAgZ3VpLl9fcmVtZW1iZXJlZE9iamVjdEluZGVjZXNUb0NvbnRyb2xsZXJzW2luZGV4XTtcblxuICAgICAgLy8gUmVtZW1iZXIgZWFjaCB2YWx1ZSBmb3IgZWFjaCBwcm9wZXJ0eVxuICAgICAgY29tbW9uLmVhY2goY29udHJvbGxlcl9tYXAsIGZ1bmN0aW9uKGNvbnRyb2xsZXIsIHByb3BlcnR5KSB7XG4gICAgICAgIHNhdmVkX3ZhbHVlc1twcm9wZXJ0eV0gPSB1c2VJbml0aWFsVmFsdWVzID8gY29udHJvbGxlci5pbml0aWFsVmFsdWUgOiBjb250cm9sbGVyLmdldFZhbHVlKCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gU2F2ZSB0aGUgdmFsdWVzIGZvciB0aGNvbW1vbi5pc09iamVjdFxuICAgICAgdG9SZXR1cm5baW5kZXhdID0gc2F2ZWRfdmFsdWVzO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdG9SZXR1cm47XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFByZXNldE9wdGlvbihndWksIG5hbWUsIHNldFNlbGVjdGVkKSB7XG4gICAgdmFyIG9wdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgIG9wdC5pbm5lckhUTUwgPSBuYW1lO1xuICAgIG9wdC52YWx1ZSA9IG5hbWU7XG4gICAgZ3VpLl9fcHJlc2V0X3NlbGVjdC5hcHBlbmRDaGlsZChvcHQpO1xuICAgIGlmIChzZXRTZWxlY3RlZCkge1xuICAgICAgZ3VpLl9fcHJlc2V0X3NlbGVjdC5zZWxlY3RlZEluZGV4ID0gZ3VpLl9fcHJlc2V0X3NlbGVjdC5sZW5ndGggLSAxO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFByZXNldFNlbGVjdEluZGV4KGd1aSkge1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBndWkuX19wcmVzZXRfc2VsZWN0Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgaWYgKGd1aS5fX3ByZXNldF9zZWxlY3RbaW5kZXhdLnZhbHVlID09IGd1aS5wcmVzZXQpIHtcbiAgICAgICAgZ3VpLl9fcHJlc2V0X3NlbGVjdC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWFya1ByZXNldE1vZGlmaWVkKGd1aSwgbW9kaWZpZWQpIHtcbiAgICB2YXIgb3B0ID0gZ3VpLl9fcHJlc2V0X3NlbGVjdFtndWkuX19wcmVzZXRfc2VsZWN0LnNlbGVjdGVkSW5kZXhdO1xuLy8gICAgY29uc29sZS5sb2coJ21hcmsnLCBtb2RpZmllZCwgb3B0KTtcbiAgICBpZiAobW9kaWZpZWQpIHtcbiAgICAgIG9wdC5pbm5lckhUTUwgPSBvcHQudmFsdWUgKyBcIipcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0LmlubmVySFRNTCA9IG9wdC52YWx1ZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVEaXNwbGF5cyhjb250cm9sbGVyQXJyYXkpIHtcblxuXG4gICAgaWYgKGNvbnRyb2xsZXJBcnJheS5sZW5ndGggIT0gMCkge1xuXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHVwZGF0ZURpc3BsYXlzKGNvbnRyb2xsZXJBcnJheSk7XG4gICAgICB9KTtcblxuICAgIH1cblxuICAgIGNvbW1vbi5lYWNoKGNvbnRyb2xsZXJBcnJheSwgZnVuY3Rpb24oYykge1xuICAgICAgYy51cGRhdGVEaXNwbGF5KCk7XG4gICAgfSk7XG5cbiAgfVxuXG4gIHJldHVybiBHVUk7XG5cbn0pKGRhdC51dGlscy5jc3MsXG5cIjxkaXYgaWQ9XFxcImRnLXNhdmVcXFwiIGNsYXNzPVxcXCJkZyBkaWFsb2d1ZVxcXCI+XFxuXFxuICBIZXJlJ3MgdGhlIG5ldyBsb2FkIHBhcmFtZXRlciBmb3IgeW91ciA8Y29kZT5HVUk8L2NvZGU+J3MgY29uc3RydWN0b3I6XFxuXFxuICA8dGV4dGFyZWEgaWQ9XFxcImRnLW5ldy1jb25zdHJ1Y3RvclxcXCI+PC90ZXh0YXJlYT5cXG5cXG4gIDxkaXYgaWQ9XFxcImRnLXNhdmUtbG9jYWxseVxcXCI+XFxuXFxuICAgIDxpbnB1dCBpZD1cXFwiZGctbG9jYWwtc3RvcmFnZVxcXCIgdHlwZT1cXFwiY2hlY2tib3hcXFwiLz4gQXV0b21hdGljYWxseSBzYXZlXFxuICAgIHZhbHVlcyB0byA8Y29kZT5sb2NhbFN0b3JhZ2U8L2NvZGU+IG9uIGV4aXQuXFxuXFxuICAgIDxkaXYgaWQ9XFxcImRnLWxvY2FsLWV4cGxhaW5cXFwiPlRoZSB2YWx1ZXMgc2F2ZWQgdG8gPGNvZGU+bG9jYWxTdG9yYWdlPC9jb2RlPiB3aWxsXFxuICAgICAgb3ZlcnJpZGUgdGhvc2UgcGFzc2VkIHRvIDxjb2RlPmRhdC5HVUk8L2NvZGU+J3MgY29uc3RydWN0b3IuIFRoaXMgbWFrZXMgaXRcXG4gICAgICBlYXNpZXIgdG8gd29yayBpbmNyZW1lbnRhbGx5LCBidXQgPGNvZGU+bG9jYWxTdG9yYWdlPC9jb2RlPiBpcyBmcmFnaWxlLFxcbiAgICAgIGFuZCB5b3VyIGZyaWVuZHMgbWF5IG5vdCBzZWUgdGhlIHNhbWUgdmFsdWVzIHlvdSBkby5cXG4gICAgICBcXG4gICAgPC9kaXY+XFxuICAgIFxcbiAgPC9kaXY+XFxuXFxuPC9kaXY+XCIsXG5cIi5kZyB1bHtsaXN0LXN0eWxlOm5vbmU7bWFyZ2luOjA7cGFkZGluZzowO3dpZHRoOjEwMCU7Y2xlYXI6Ym90aH0uZGcuYWN7cG9zaXRpb246Zml4ZWQ7dG9wOjA7bGVmdDowO3JpZ2h0OjA7aGVpZ2h0OjA7ei1pbmRleDowfS5kZzpub3QoLmFjKSAubWFpbntvdmVyZmxvdzpoaWRkZW59LmRnLm1haW57LXdlYmtpdC10cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXI7LW8tdHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyOy1tb3otdHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyO3RyYW5zaXRpb246b3BhY2l0eSAwLjFzIGxpbmVhcn0uZGcubWFpbi50YWxsZXItdGhhbi13aW5kb3d7b3ZlcmZsb3cteTphdXRvfS5kZy5tYWluLnRhbGxlci10aGFuLXdpbmRvdyAuY2xvc2UtYnV0dG9ue29wYWNpdHk6MTttYXJnaW4tdG9wOi0xcHg7Ym9yZGVyLXRvcDoxcHggc29saWQgIzJjMmMyY30uZGcubWFpbiB1bC5jbG9zZWQgLmNsb3NlLWJ1dHRvbntvcGFjaXR5OjEgIWltcG9ydGFudH0uZGcubWFpbjpob3ZlciAuY2xvc2UtYnV0dG9uLC5kZy5tYWluIC5jbG9zZS1idXR0b24uZHJhZ3tvcGFjaXR5OjF9LmRnLm1haW4gLmNsb3NlLWJ1dHRvbnstd2Via2l0LXRyYW5zaXRpb246b3BhY2l0eSAwLjFzIGxpbmVhcjstby10cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXI7LW1vei10cmFuc2l0aW9uOm9wYWNpdHkgMC4xcyBsaW5lYXI7dHJhbnNpdGlvbjpvcGFjaXR5IDAuMXMgbGluZWFyO2JvcmRlcjowO3Bvc2l0aW9uOmFic29sdXRlO2xpbmUtaGVpZ2h0OjE5cHg7aGVpZ2h0OjIwcHg7Y3Vyc29yOnBvaW50ZXI7dGV4dC1hbGlnbjpjZW50ZXI7YmFja2dyb3VuZC1jb2xvcjojMDAwfS5kZy5tYWluIC5jbG9zZS1idXR0b246aG92ZXJ7YmFja2dyb3VuZC1jb2xvcjojMTExfS5kZy5he2Zsb2F0OnJpZ2h0O21hcmdpbi1yaWdodDoxNXB4O292ZXJmbG93LXg6aGlkZGVufS5kZy5hLmhhcy1zYXZlIHVse21hcmdpbi10b3A6MjdweH0uZGcuYS5oYXMtc2F2ZSB1bC5jbG9zZWR7bWFyZ2luLXRvcDowfS5kZy5hIC5zYXZlLXJvd3twb3NpdGlvbjpmaXhlZDt0b3A6MDt6LWluZGV4OjEwMDJ9LmRnIGxpey13ZWJraXQtdHJhbnNpdGlvbjpoZWlnaHQgMC4xcyBlYXNlLW91dDstby10cmFuc2l0aW9uOmhlaWdodCAwLjFzIGVhc2Utb3V0Oy1tb3otdHJhbnNpdGlvbjpoZWlnaHQgMC4xcyBlYXNlLW91dDt0cmFuc2l0aW9uOmhlaWdodCAwLjFzIGVhc2Utb3V0fS5kZyBsaTpub3QoLmZvbGRlcil7Y3Vyc29yOmF1dG87aGVpZ2h0OjI3cHg7bGluZS1oZWlnaHQ6MjdweDtvdmVyZmxvdzpoaWRkZW47cGFkZGluZzowIDRweCAwIDVweH0uZGcgbGkuZm9sZGVye3BhZGRpbmc6MDtib3JkZXItbGVmdDo0cHggc29saWQgcmdiYSgwLDAsMCwwKX0uZGcgbGkudGl0bGV7Y3Vyc29yOnBvaW50ZXI7bWFyZ2luLWxlZnQ6LTRweH0uZGcgLmNsb3NlZCBsaTpub3QoLnRpdGxlKSwuZGcgLmNsb3NlZCB1bCBsaSwuZGcgLmNsb3NlZCB1bCBsaSA+ICp7aGVpZ2h0OjA7b3ZlcmZsb3c6aGlkZGVuO2JvcmRlcjowfS5kZyAuY3J7Y2xlYXI6Ym90aDtwYWRkaW5nLWxlZnQ6M3B4O2hlaWdodDoyN3B4fS5kZyAucHJvcGVydHktbmFtZXtjdXJzb3I6ZGVmYXVsdDtmbG9hdDpsZWZ0O2NsZWFyOmxlZnQ7d2lkdGg6NDAlO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzfS5kZyAuY3tmbG9hdDpsZWZ0O3dpZHRoOjYwJX0uZGcgLmMgaW5wdXRbdHlwZT10ZXh0XXtib3JkZXI6MDttYXJnaW4tdG9wOjRweDtwYWRkaW5nOjNweDt3aWR0aDoxMDAlO2Zsb2F0OnJpZ2h0fS5kZyAuaGFzLXNsaWRlciBpbnB1dFt0eXBlPXRleHRde3dpZHRoOjMwJTttYXJnaW4tbGVmdDowfS5kZyAuc2xpZGVye2Zsb2F0OmxlZnQ7d2lkdGg6NjYlO21hcmdpbi1sZWZ0Oi01cHg7bWFyZ2luLXJpZ2h0OjA7aGVpZ2h0OjE5cHg7bWFyZ2luLXRvcDo0cHh9LmRnIC5zbGlkZXItZmd7aGVpZ2h0OjEwMCV9LmRnIC5jIGlucHV0W3R5cGU9Y2hlY2tib3hde21hcmdpbi10b3A6OXB4fS5kZyAuYyBzZWxlY3R7bWFyZ2luLXRvcDo1cHh9LmRnIC5jci5mdW5jdGlvbiwuZGcgLmNyLmZ1bmN0aW9uIC5wcm9wZXJ0eS1uYW1lLC5kZyAuY3IuZnVuY3Rpb24gKiwuZGcgLmNyLmJvb2xlYW4sLmRnIC5jci5ib29sZWFuICp7Y3Vyc29yOnBvaW50ZXJ9LmRnIC5zZWxlY3RvcntkaXNwbGF5Om5vbmU7cG9zaXRpb246YWJzb2x1dGU7bWFyZ2luLWxlZnQ6LTlweDttYXJnaW4tdG9wOjIzcHg7ei1pbmRleDoxMH0uZGcgLmM6aG92ZXIgLnNlbGVjdG9yLC5kZyAuc2VsZWN0b3IuZHJhZ3tkaXNwbGF5OmJsb2NrfS5kZyBsaS5zYXZlLXJvd3twYWRkaW5nOjB9LmRnIGxpLnNhdmUtcm93IC5idXR0b257ZGlzcGxheTppbmxpbmUtYmxvY2s7cGFkZGluZzowcHggNnB4fS5kZy5kaWFsb2d1ZXtiYWNrZ3JvdW5kLWNvbG9yOiMyMjI7d2lkdGg6NDYwcHg7cGFkZGluZzoxNXB4O2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjE1cHh9I2RnLW5ldy1jb25zdHJ1Y3RvcntwYWRkaW5nOjEwcHg7Y29sb3I6IzIyMjtmb250LWZhbWlseTpNb25hY28sIG1vbm9zcGFjZTtmb250LXNpemU6MTBweDtib3JkZXI6MDtyZXNpemU6bm9uZTtib3gtc2hhZG93Omluc2V0IDFweCAxcHggMXB4ICM4ODg7d29yZC13cmFwOmJyZWFrLXdvcmQ7bWFyZ2luOjEycHggMDtkaXNwbGF5OmJsb2NrO3dpZHRoOjQ0MHB4O292ZXJmbG93LXk6c2Nyb2xsO2hlaWdodDoxMDBweDtwb3NpdGlvbjpyZWxhdGl2ZX0jZGctbG9jYWwtZXhwbGFpbntkaXNwbGF5Om5vbmU7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTdweDtib3JkZXItcmFkaXVzOjNweDtiYWNrZ3JvdW5kLWNvbG9yOiMzMzM7cGFkZGluZzo4cHg7bWFyZ2luLXRvcDoxMHB4fSNkZy1sb2NhbC1leHBsYWluIGNvZGV7Zm9udC1zaXplOjEwcHh9I2RhdC1ndWktc2F2ZS1sb2NhbGx5e2Rpc3BsYXk6bm9uZX0uZGd7Y29sb3I6I2VlZTtmb250OjExcHggJ0x1Y2lkYSBHcmFuZGUnLCBzYW5zLXNlcmlmO3RleHQtc2hhZG93OjAgLTFweCAwICMxMTF9LmRnLm1haW46Oi13ZWJraXQtc2Nyb2xsYmFye3dpZHRoOjVweDtiYWNrZ3JvdW5kOiMxYTFhMWF9LmRnLm1haW46Oi13ZWJraXQtc2Nyb2xsYmFyLWNvcm5lcntoZWlnaHQ6MDtkaXNwbGF5Om5vbmV9LmRnLm1haW46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1ie2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQ6IzY3Njc2N30uZGcgbGk6bm90KC5mb2xkZXIpe2JhY2tncm91bmQ6IzFhMWExYTtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjMmMyYzJjfS5kZyBsaS5zYXZlLXJvd3tsaW5lLWhlaWdodDoyNXB4O2JhY2tncm91bmQ6I2RhZDVjYjtib3JkZXI6MH0uZGcgbGkuc2F2ZS1yb3cgc2VsZWN0e21hcmdpbi1sZWZ0OjVweDt3aWR0aDoxMDhweH0uZGcgbGkuc2F2ZS1yb3cgLmJ1dHRvbnttYXJnaW4tbGVmdDo1cHg7bWFyZ2luLXRvcDoxcHg7Ym9yZGVyLXJhZGl1czoycHg7Zm9udC1zaXplOjlweDtsaW5lLWhlaWdodDo3cHg7cGFkZGluZzo0cHggNHB4IDVweCA0cHg7YmFja2dyb3VuZDojYzViZGFkO2NvbG9yOiNmZmY7dGV4dC1zaGFkb3c6MCAxcHggMCAjYjBhNThmO2JveC1zaGFkb3c6MCAtMXB4IDAgI2IwYTU4ZjtjdXJzb3I6cG9pbnRlcn0uZGcgbGkuc2F2ZS1yb3cgLmJ1dHRvbi5nZWFyc3tiYWNrZ3JvdW5kOiNjNWJkYWQgdXJsKGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQXNBQUFBTkNBWUFBQUIvOVpRN0FBQUFHWFJGV0hSVGIyWjBkMkZ5WlFCQlpHOWlaU0JKYldGblpWSmxZV1I1Y2NsbFBBQUFBUUpKUkVGVWVOcGlZS0FVL1AvL1B3R0lDL0FwQ0FCaUJTQVcrSThBQ2xBY2dLeFE0VDlob01BRVVyeHgyUVNHTjYrZWdEWCsvdldUNGU3TjgyQU1Zb1BBeC9ldndXb1lvU1liQUNYMnM3S3hDeHpjc2V6RGgzZXZGb0RFQllURUVxeWNnZ1dBekE5QXVVU1FRZ2VZUGE5ZlB2Ni9ZV20vQWN4NUlQYjd0eS9mdytRWmJsdzY3dkRzOFIwWUh5UWhnT2J4K3lBSmtCcW1HNWRQUERoMWFQT0dSL2V1Z1cwRzR2bElvVElmeUZjQStRZWtoaEhKaFBkUXhiaUFJZ3VNQlRRWnJQRDcxMDhNNnJvV1lERlFpSUFBdjZBb3cvMWJGd1hnaXMrZjJMVUF5bndvSWFOY3o4WE54M0RsN01FSlVER1FweDlndFE4WUN1ZUIrRDI2T0VDQUFRRGFkdDdlNDZENDJRQUFBQUJKUlU1RXJrSmdnZz09KSAycHggMXB4IG5vLXJlcGVhdDtoZWlnaHQ6N3B4O3dpZHRoOjhweH0uZGcgbGkuc2F2ZS1yb3cgLmJ1dHRvbjpob3ZlcntiYWNrZ3JvdW5kLWNvbG9yOiNiYWIxOWU7Ym94LXNoYWRvdzowIC0xcHggMCAjYjBhNThmfS5kZyBsaS5mb2xkZXJ7Ym9yZGVyLWJvdHRvbTowfS5kZyBsaS50aXRsZXtwYWRkaW5nLWxlZnQ6MTZweDtiYWNrZ3JvdW5kOiMwMDAgdXJsKGRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEJRQUZBSkVBQVAvLy8vUHo4Ly8vLy8vLy95SDVCQUVBQUFJQUxBQUFBQUFGQUFVQUFBSUlsSStoS2dGeG9DZ0FPdz09KSA2cHggMTBweCBuby1yZXBlYXQ7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjIpfS5kZyAuY2xvc2VkIGxpLnRpdGxle2JhY2tncm91bmQtaW1hZ2U6dXJsKGRhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEJRQUZBSkVBQVAvLy8vUHo4Ly8vLy8vLy95SDVCQUVBQUFJQUxBQUFBQUFGQUFVQUFBSUlsR0lXcU1DYldBRUFPdz09KX0uZGcgLmNyLmJvb2xlYW57Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkICM4MDY3ODd9LmRnIC5jci5mdW5jdGlvbntib3JkZXItbGVmdDozcHggc29saWQgI2U2MWQ1Zn0uZGcgLmNyLm51bWJlcntib3JkZXItbGVmdDozcHggc29saWQgIzJmYTFkNn0uZGcgLmNyLm51bWJlciBpbnB1dFt0eXBlPXRleHRde2NvbG9yOiMyZmExZDZ9LmRnIC5jci5zdHJpbmd7Ym9yZGVyLWxlZnQ6M3B4IHNvbGlkICMxZWQzNmZ9LmRnIC5jci5zdHJpbmcgaW5wdXRbdHlwZT10ZXh0XXtjb2xvcjojMWVkMzZmfS5kZyAuY3IuZnVuY3Rpb246aG92ZXIsLmRnIC5jci5ib29sZWFuOmhvdmVye2JhY2tncm91bmQ6IzExMX0uZGcgLmMgaW5wdXRbdHlwZT10ZXh0XXtiYWNrZ3JvdW5kOiMzMDMwMzA7b3V0bGluZTpub25lfS5kZyAuYyBpbnB1dFt0eXBlPXRleHRdOmhvdmVye2JhY2tncm91bmQ6IzNjM2MzY30uZGcgLmMgaW5wdXRbdHlwZT10ZXh0XTpmb2N1c3tiYWNrZ3JvdW5kOiM0OTQ5NDk7Y29sb3I6I2ZmZn0uZGcgLmMgLnNsaWRlcntiYWNrZ3JvdW5kOiMzMDMwMzA7Y3Vyc29yOmV3LXJlc2l6ZX0uZGcgLmMgLnNsaWRlci1mZ3tiYWNrZ3JvdW5kOiMyZmExZDZ9LmRnIC5jIC5zbGlkZXI6aG92ZXJ7YmFja2dyb3VuZDojM2MzYzNjfS5kZyAuYyAuc2xpZGVyOmhvdmVyIC5zbGlkZXItZmd7YmFja2dyb3VuZDojNDRhYmRhfVxcblwiLFxuZGF0LmNvbnRyb2xsZXJzLmZhY3RvcnkgPSAoZnVuY3Rpb24gKE9wdGlvbkNvbnRyb2xsZXIsIE51bWJlckNvbnRyb2xsZXJCb3gsIE51bWJlckNvbnRyb2xsZXJTbGlkZXIsIFN0cmluZ0NvbnRyb2xsZXIsIEZ1bmN0aW9uQ29udHJvbGxlciwgQm9vbGVhbkNvbnRyb2xsZXIsIGNvbW1vbikge1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkge1xuXG4gICAgICAgIHZhciBpbml0aWFsVmFsdWUgPSBvYmplY3RbcHJvcGVydHldO1xuXG4gICAgICAgIC8vIFByb3ZpZGluZyBvcHRpb25zP1xuICAgICAgICBpZiAoY29tbW9uLmlzQXJyYXkoYXJndW1lbnRzWzJdKSB8fCBjb21tb24uaXNPYmplY3QoYXJndW1lbnRzWzJdKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgT3B0aW9uQ29udHJvbGxlcihvYmplY3QsIHByb3BlcnR5LCBhcmd1bWVudHNbMl0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHJvdmlkaW5nIGEgbWFwP1xuXG4gICAgICAgIGlmIChjb21tb24uaXNOdW1iZXIoaW5pdGlhbFZhbHVlKSkge1xuXG4gICAgICAgICAgaWYgKGNvbW1vbi5pc051bWJlcihhcmd1bWVudHNbMl0pICYmIGNvbW1vbi5pc051bWJlcihhcmd1bWVudHNbM10pKSB7XG5cbiAgICAgICAgICAgIC8vIEhhcyBtaW4gYW5kIG1heC5cbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtYmVyQ29udHJvbGxlclNsaWRlcihvYmplY3QsIHByb3BlcnR5LCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWJlckNvbnRyb2xsZXJCb3gob2JqZWN0LCBwcm9wZXJ0eSwgeyBtaW46IGFyZ3VtZW50c1syXSwgbWF4OiBhcmd1bWVudHNbM10gfSk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb21tb24uaXNTdHJpbmcoaW5pdGlhbFZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgU3RyaW5nQ29udHJvbGxlcihvYmplY3QsIHByb3BlcnR5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb21tb24uaXNGdW5jdGlvbihpbml0aWFsVmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbkNvbnRyb2xsZXIob2JqZWN0LCBwcm9wZXJ0eSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbW1vbi5pc0Jvb2xlYW4oaW5pdGlhbFZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgQm9vbGVhbkNvbnRyb2xsZXIob2JqZWN0LCBwcm9wZXJ0eSk7XG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgfSkoZGF0LmNvbnRyb2xsZXJzLk9wdGlvbkNvbnRyb2xsZXIsXG5kYXQuY29udHJvbGxlcnMuTnVtYmVyQ29udHJvbGxlckJveCxcbmRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyU2xpZGVyLFxuZGF0LmNvbnRyb2xsZXJzLlN0cmluZ0NvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKENvbnRyb2xsZXIsIGRvbSwgY29tbW9uKSB7XG5cbiAgLyoqXG4gICAqIEBjbGFzcyBQcm92aWRlcyBhIHRleHQgaW5wdXQgdG8gYWx0ZXIgdGhlIHN0cmluZyBwcm9wZXJ0eSBvZiBhbiBvYmplY3QuXG4gICAqXG4gICAqIEBleHRlbmRzIGRhdC5jb250cm9sbGVycy5Db250cm9sbGVyXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBiZSBtYW5pcHVsYXRlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGJlIG1hbmlwdWxhdGVkXG4gICAqXG4gICAqIEBtZW1iZXIgZGF0LmNvbnRyb2xsZXJzXG4gICAqL1xuICB2YXIgU3RyaW5nQ29udHJvbGxlciA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcblxuICAgIFN0cmluZ0NvbnRyb2xsZXIuc3VwZXJjbGFzcy5jYWxsKHRoaXMsIG9iamVjdCwgcHJvcGVydHkpO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuX19pbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgdGhpcy5fX2lucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0Jyk7XG5cbiAgICBkb20uYmluZCh0aGlzLl9faW5wdXQsICdrZXl1cCcsIG9uQ2hhbmdlKTtcbiAgICBkb20uYmluZCh0aGlzLl9faW5wdXQsICdjaGFuZ2UnLCBvbkNoYW5nZSk7XG4gICAgZG9tLmJpbmQodGhpcy5fX2lucHV0LCAnYmx1cicsIG9uQmx1cik7XG4gICAgZG9tLmJpbmQodGhpcy5fX2lucHV0LCAna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgIHRoaXMuYmx1cigpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIFxuXG4gICAgZnVuY3Rpb24gb25DaGFuZ2UoKSB7XG4gICAgICBfdGhpcy5zZXRWYWx1ZShfdGhpcy5fX2lucHV0LnZhbHVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkJsdXIoKSB7XG4gICAgICBpZiAoX3RoaXMuX19vbkZpbmlzaENoYW5nZSkge1xuICAgICAgICBfdGhpcy5fX29uRmluaXNoQ2hhbmdlLmNhbGwoX3RoaXMsIF90aGlzLmdldFZhbHVlKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG4gICAgdGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX19pbnB1dCk7XG5cbiAgfTtcblxuICBTdHJpbmdDb250cm9sbGVyLnN1cGVyY2xhc3MgPSBDb250cm9sbGVyO1xuXG4gIGNvbW1vbi5leHRlbmQoXG5cbiAgICAgIFN0cmluZ0NvbnRyb2xsZXIucHJvdG90eXBlLFxuICAgICAgQ29udHJvbGxlci5wcm90b3R5cGUsXG5cbiAgICAgIHtcblxuICAgICAgICB1cGRhdGVEaXNwbGF5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBTdG9wcyB0aGUgY2FyZXQgZnJvbSBtb3Zpbmcgb24gYWNjb3VudCBvZjpcbiAgICAgICAgICAvLyBrZXl1cCAtPiBzZXRWYWx1ZSAtPiB1cGRhdGVEaXNwbGF5XG4gICAgICAgICAgaWYgKCFkb20uaXNBY3RpdmUodGhpcy5fX2lucHV0KSkge1xuICAgICAgICAgICAgdGhpcy5fX2lucHV0LnZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gU3RyaW5nQ29udHJvbGxlci5zdXBlcmNsYXNzLnByb3RvdHlwZS51cGRhdGVEaXNwbGF5LmNhbGwodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICk7XG5cbiAgcmV0dXJuIFN0cmluZ0NvbnRyb2xsZXI7XG5cbn0pKGRhdC5jb250cm9sbGVycy5Db250cm9sbGVyLFxuZGF0LmRvbS5kb20sXG5kYXQudXRpbHMuY29tbW9uKSxcbmRhdC5jb250cm9sbGVycy5GdW5jdGlvbkNvbnRyb2xsZXIsXG5kYXQuY29udHJvbGxlcnMuQm9vbGVhbkNvbnRyb2xsZXIsXG5kYXQudXRpbHMuY29tbW9uKSxcbmRhdC5jb250cm9sbGVycy5Db250cm9sbGVyLFxuZGF0LmNvbnRyb2xsZXJzLkJvb2xlYW5Db250cm9sbGVyLFxuZGF0LmNvbnRyb2xsZXJzLkZ1bmN0aW9uQ29udHJvbGxlcixcbmRhdC5jb250cm9sbGVycy5OdW1iZXJDb250cm9sbGVyQm94LFxuZGF0LmNvbnRyb2xsZXJzLk51bWJlckNvbnRyb2xsZXJTbGlkZXIsXG5kYXQuY29udHJvbGxlcnMuT3B0aW9uQ29udHJvbGxlcixcbmRhdC5jb250cm9sbGVycy5Db2xvckNvbnRyb2xsZXIgPSAoZnVuY3Rpb24gKENvbnRyb2xsZXIsIGRvbSwgQ29sb3IsIGludGVycHJldCwgY29tbW9uKSB7XG5cbiAgdmFyIENvbG9yQ29udHJvbGxlciA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcblxuICAgIENvbG9yQ29udHJvbGxlci5zdXBlcmNsYXNzLmNhbGwodGhpcywgb2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICB0aGlzLl9fY29sb3IgPSBuZXcgQ29sb3IodGhpcy5nZXRWYWx1ZSgpKTtcbiAgICB0aGlzLl9fdGVtcCA9IG5ldyBDb2xvcigwKTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLmRvbUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIGRvbS5tYWtlU2VsZWN0YWJsZSh0aGlzLmRvbUVsZW1lbnQsIGZhbHNlKTtcblxuICAgIHRoaXMuX19zZWxlY3RvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX19zZWxlY3Rvci5jbGFzc05hbWUgPSAnc2VsZWN0b3InO1xuXG4gICAgdGhpcy5fX3NhdHVyYXRpb25fZmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9fc2F0dXJhdGlvbl9maWVsZC5jbGFzc05hbWUgPSAnc2F0dXJhdGlvbi1maWVsZCc7XG5cbiAgICB0aGlzLl9fZmllbGRfa25vYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX19maWVsZF9rbm9iLmNsYXNzTmFtZSA9ICdmaWVsZC1rbm9iJztcbiAgICB0aGlzLl9fZmllbGRfa25vYl9ib3JkZXIgPSAnMnB4IHNvbGlkICc7XG5cbiAgICB0aGlzLl9faHVlX2tub2IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9faHVlX2tub2IuY2xhc3NOYW1lID0gJ2h1ZS1rbm9iJztcblxuICAgIHRoaXMuX19odWVfZmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9faHVlX2ZpZWxkLmNsYXNzTmFtZSA9ICdodWUtZmllbGQnO1xuXG4gICAgdGhpcy5fX2lucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICB0aGlzLl9faW5wdXQudHlwZSA9ICd0ZXh0JztcbiAgICB0aGlzLl9faW5wdXRfdGV4dFNoYWRvdyA9ICcwIDFweCAxcHggJztcblxuICAgIGRvbS5iaW5kKHRoaXMuX19pbnB1dCwgJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykgeyAvLyBvbiBlbnRlclxuICAgICAgICBvbkJsdXIuY2FsbCh0aGlzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvbS5iaW5kKHRoaXMuX19pbnB1dCwgJ2JsdXInLCBvbkJsdXIpO1xuXG4gICAgZG9tLmJpbmQodGhpcy5fX3NlbGVjdG9yLCAnbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuXG4gICAgICBkb21cbiAgICAgICAgLmFkZENsYXNzKHRoaXMsICdkcmFnJylcbiAgICAgICAgLmJpbmQod2luZG93LCAnbW91c2V1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBkb20ucmVtb3ZlQ2xhc3MoX3RoaXMuX19zZWxlY3RvciwgJ2RyYWcnKTtcbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIHZhciB2YWx1ZV9maWVsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgY29tbW9uLmV4dGVuZCh0aGlzLl9fc2VsZWN0b3Iuc3R5bGUsIHtcbiAgICAgIHdpZHRoOiAnMTIycHgnLFxuICAgICAgaGVpZ2h0OiAnMTAycHgnLFxuICAgICAgcGFkZGluZzogJzNweCcsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMjIyJyxcbiAgICAgIGJveFNoYWRvdzogJzBweCAxcHggM3B4IHJnYmEoMCwwLDAsMC4zKSdcbiAgICB9KTtcblxuICAgIGNvbW1vbi5leHRlbmQodGhpcy5fX2ZpZWxkX2tub2Iuc3R5bGUsIHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgd2lkdGg6ICcxMnB4JyxcbiAgICAgIGhlaWdodDogJzEycHgnLFxuICAgICAgYm9yZGVyOiB0aGlzLl9fZmllbGRfa25vYl9ib3JkZXIgKyAodGhpcy5fX2NvbG9yLnYgPCAuNSA/ICcjZmZmJyA6ICcjMDAwJyksXG4gICAgICBib3hTaGFkb3c6ICcwcHggMXB4IDNweCByZ2JhKDAsMCwwLDAuNSknLFxuICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXG4gICAgICB6SW5kZXg6IDFcbiAgICB9KTtcbiAgICBcbiAgICBjb21tb24uZXh0ZW5kKHRoaXMuX19odWVfa25vYi5zdHlsZSwge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICB3aWR0aDogJzE1cHgnLFxuICAgICAgaGVpZ2h0OiAnMnB4JyxcbiAgICAgIGJvcmRlclJpZ2h0OiAnNHB4IHNvbGlkICNmZmYnLFxuICAgICAgekluZGV4OiAxXG4gICAgfSk7XG5cbiAgICBjb21tb24uZXh0ZW5kKHRoaXMuX19zYXR1cmF0aW9uX2ZpZWxkLnN0eWxlLCB7XG4gICAgICB3aWR0aDogJzEwMHB4JyxcbiAgICAgIGhlaWdodDogJzEwMHB4JyxcbiAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjNTU1JyxcbiAgICAgIG1hcmdpblJpZ2h0OiAnM3B4JyxcbiAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgY3Vyc29yOiAncG9pbnRlcidcbiAgICB9KTtcblxuICAgIGNvbW1vbi5leHRlbmQodmFsdWVfZmllbGQuc3R5bGUsIHtcbiAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgIGJhY2tncm91bmQ6ICdub25lJ1xuICAgIH0pO1xuICAgIFxuICAgIGxpbmVhckdyYWRpZW50KHZhbHVlX2ZpZWxkLCAndG9wJywgJ3JnYmEoMCwwLDAsMCknLCAnIzAwMCcpO1xuXG4gICAgY29tbW9uLmV4dGVuZCh0aGlzLl9faHVlX2ZpZWxkLnN0eWxlLCB7XG4gICAgICB3aWR0aDogJzE1cHgnLFxuICAgICAgaGVpZ2h0OiAnMTAwcHgnLFxuICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICBib3JkZXI6ICcxcHggc29saWQgIzU1NScsXG4gICAgICBjdXJzb3I6ICducy1yZXNpemUnXG4gICAgfSk7XG5cbiAgICBodWVHcmFkaWVudCh0aGlzLl9faHVlX2ZpZWxkKTtcblxuICAgIGNvbW1vbi5leHRlbmQodGhpcy5fX2lucHV0LnN0eWxlLCB7XG4gICAgICBvdXRsaW5lOiAnbm9uZScsXG4vLyAgICAgIHdpZHRoOiAnMTIwcHgnLFxuICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbi8vICAgICAgcGFkZGluZzogJzRweCcsXG4vLyAgICAgIG1hcmdpbkJvdHRvbTogJzZweCcsXG4gICAgICBjb2xvcjogJyNmZmYnLFxuICAgICAgYm9yZGVyOiAwLFxuICAgICAgZm9udFdlaWdodDogJ2JvbGQnLFxuICAgICAgdGV4dFNoYWRvdzogdGhpcy5fX2lucHV0X3RleHRTaGFkb3cgKyAncmdiYSgwLDAsMCwwLjcpJ1xuICAgIH0pO1xuXG4gICAgZG9tLmJpbmQodGhpcy5fX3NhdHVyYXRpb25fZmllbGQsICdtb3VzZWRvd24nLCBmaWVsZERvd24pO1xuICAgIGRvbS5iaW5kKHRoaXMuX19maWVsZF9rbm9iLCAnbW91c2Vkb3duJywgZmllbGREb3duKTtcblxuICAgIGRvbS5iaW5kKHRoaXMuX19odWVfZmllbGQsICdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICBzZXRIKGUpO1xuICAgICAgZG9tLmJpbmQod2luZG93LCAnbW91c2Vtb3ZlJywgc2V0SCk7XG4gICAgICBkb20uYmluZCh3aW5kb3csICdtb3VzZXVwJywgdW5iaW5kSCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBmaWVsZERvd24oZSkge1xuICAgICAgc2V0U1YoZSk7XG4gICAgICAvLyBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdub25lJztcbiAgICAgIGRvbS5iaW5kKHdpbmRvdywgJ21vdXNlbW92ZScsIHNldFNWKTtcbiAgICAgIGRvbS5iaW5kKHdpbmRvdywgJ21vdXNldXAnLCB1bmJpbmRTVik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5iaW5kU1YoKSB7XG4gICAgICBkb20udW5iaW5kKHdpbmRvdywgJ21vdXNlbW92ZScsIHNldFNWKTtcbiAgICAgIGRvbS51bmJpbmQod2luZG93LCAnbW91c2V1cCcsIHVuYmluZFNWKTtcbiAgICAgIC8vIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uQmx1cigpIHtcbiAgICAgIHZhciBpID0gaW50ZXJwcmV0KHRoaXMudmFsdWUpO1xuICAgICAgaWYgKGkgIT09IGZhbHNlKSB7XG4gICAgICAgIF90aGlzLl9fY29sb3IuX19zdGF0ZSA9IGk7XG4gICAgICAgIF90aGlzLnNldFZhbHVlKF90aGlzLl9fY29sb3IudG9PcmlnaW5hbCgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBfdGhpcy5fX2NvbG9yLnRvU3RyaW5nKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5iaW5kSCgpIHtcbiAgICAgIGRvbS51bmJpbmQod2luZG93LCAnbW91c2Vtb3ZlJywgc2V0SCk7XG4gICAgICBkb20udW5iaW5kKHdpbmRvdywgJ21vdXNldXAnLCB1bmJpbmRIKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2F0dXJhdGlvbl9maWVsZC5hcHBlbmRDaGlsZCh2YWx1ZV9maWVsZCk7XG4gICAgdGhpcy5fX3NlbGVjdG9yLmFwcGVuZENoaWxkKHRoaXMuX19maWVsZF9rbm9iKTtcbiAgICB0aGlzLl9fc2VsZWN0b3IuYXBwZW5kQ2hpbGQodGhpcy5fX3NhdHVyYXRpb25fZmllbGQpO1xuICAgIHRoaXMuX19zZWxlY3Rvci5hcHBlbmRDaGlsZCh0aGlzLl9faHVlX2ZpZWxkKTtcbiAgICB0aGlzLl9faHVlX2ZpZWxkLmFwcGVuZENoaWxkKHRoaXMuX19odWVfa25vYik7XG5cbiAgICB0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX2lucHV0KTtcbiAgICB0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fX3NlbGVjdG9yKTtcblxuICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG4gICAgZnVuY3Rpb24gc2V0U1YoZSkge1xuXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHZhciB3ID0gZG9tLmdldFdpZHRoKF90aGlzLl9fc2F0dXJhdGlvbl9maWVsZCk7XG4gICAgICB2YXIgbyA9IGRvbS5nZXRPZmZzZXQoX3RoaXMuX19zYXR1cmF0aW9uX2ZpZWxkKTtcbiAgICAgIHZhciBzID0gKGUuY2xpZW50WCAtIG8ubGVmdCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCkgLyB3O1xuICAgICAgdmFyIHYgPSAxIC0gKGUuY2xpZW50WSAtIG8udG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3ApIC8gdztcblxuICAgICAgaWYgKHYgPiAxKSB2ID0gMTtcbiAgICAgIGVsc2UgaWYgKHYgPCAwKSB2ID0gMDtcblxuICAgICAgaWYgKHMgPiAxKSBzID0gMTtcbiAgICAgIGVsc2UgaWYgKHMgPCAwKSBzID0gMDtcblxuICAgICAgX3RoaXMuX19jb2xvci52ID0gdjtcbiAgICAgIF90aGlzLl9fY29sb3IucyA9IHM7XG5cbiAgICAgIF90aGlzLnNldFZhbHVlKF90aGlzLl9fY29sb3IudG9PcmlnaW5hbCgpKTtcblxuXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRIKGUpIHtcblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICB2YXIgcyA9IGRvbS5nZXRIZWlnaHQoX3RoaXMuX19odWVfZmllbGQpO1xuICAgICAgdmFyIG8gPSBkb20uZ2V0T2Zmc2V0KF90aGlzLl9faHVlX2ZpZWxkKTtcbiAgICAgIHZhciBoID0gMSAtIChlLmNsaWVudFkgLSBvLnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wKSAvIHM7XG5cbiAgICAgIGlmIChoID4gMSkgaCA9IDE7XG4gICAgICBlbHNlIGlmIChoIDwgMCkgaCA9IDA7XG5cbiAgICAgIF90aGlzLl9fY29sb3IuaCA9IGggKiAzNjA7XG5cbiAgICAgIF90aGlzLnNldFZhbHVlKF90aGlzLl9fY29sb3IudG9PcmlnaW5hbCgpKTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgfVxuXG4gIH07XG5cbiAgQ29sb3JDb250cm9sbGVyLnN1cGVyY2xhc3MgPSBDb250cm9sbGVyO1xuXG4gIGNvbW1vbi5leHRlbmQoXG5cbiAgICAgIENvbG9yQ29udHJvbGxlci5wcm90b3R5cGUsXG4gICAgICBDb250cm9sbGVyLnByb3RvdHlwZSxcblxuICAgICAge1xuXG4gICAgICAgIHVwZGF0ZURpc3BsYXk6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgdmFyIGkgPSBpbnRlcnByZXQodGhpcy5nZXRWYWx1ZSgpKTtcblxuICAgICAgICAgIGlmIChpICE9PSBmYWxzZSkge1xuXG4gICAgICAgICAgICB2YXIgbWlzbWF0Y2ggPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIG1pc21hdGNoIG9uIHRoZSBpbnRlcnByZXRlZCB2YWx1ZS5cblxuICAgICAgICAgICAgY29tbW9uLmVhY2goQ29sb3IuQ09NUE9ORU5UUywgZnVuY3Rpb24oY29tcG9uZW50KSB7XG4gICAgICAgICAgICAgIGlmICghY29tbW9uLmlzVW5kZWZpbmVkKGlbY29tcG9uZW50XSkgJiZcbiAgICAgICAgICAgICAgICAgICFjb21tb24uaXNVbmRlZmluZWQodGhpcy5fX2NvbG9yLl9fc3RhdGVbY29tcG9uZW50XSkgJiZcbiAgICAgICAgICAgICAgICAgIGlbY29tcG9uZW50XSAhPT0gdGhpcy5fX2NvbG9yLl9fc3RhdGVbY29tcG9uZW50XSkge1xuICAgICAgICAgICAgICAgIG1pc21hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge307IC8vIGJyZWFrXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICAvLyBJZiBub3RoaW5nIGRpdmVyZ2VzLCB3ZSBrZWVwIG91ciBwcmV2aW91cyB2YWx1ZXNcbiAgICAgICAgICAgIC8vIGZvciBzdGF0ZWZ1bG5lc3MsIG90aGVyd2lzZSB3ZSByZWNhbGN1bGF0ZSBmcmVzaFxuICAgICAgICAgICAgaWYgKG1pc21hdGNoKSB7XG4gICAgICAgICAgICAgIGNvbW1vbi5leHRlbmQodGhpcy5fX2NvbG9yLl9fc3RhdGUsIGkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29tbW9uLmV4dGVuZCh0aGlzLl9fdGVtcC5fX3N0YXRlLCB0aGlzLl9fY29sb3IuX19zdGF0ZSk7XG5cbiAgICAgICAgICB0aGlzLl9fdGVtcC5hID0gMTtcblxuICAgICAgICAgIHZhciBmbGlwID0gKHRoaXMuX19jb2xvci52IDwgLjUgfHwgdGhpcy5fX2NvbG9yLnMgPiAuNSkgPyAyNTUgOiAwO1xuICAgICAgICAgIHZhciBfZmxpcCA9IDI1NSAtIGZsaXA7XG5cbiAgICAgICAgICBjb21tb24uZXh0ZW5kKHRoaXMuX19maWVsZF9rbm9iLnN0eWxlLCB7XG4gICAgICAgICAgICBtYXJnaW5MZWZ0OiAxMDAgKiB0aGlzLl9fY29sb3IucyAtIDcgKyAncHgnLFxuICAgICAgICAgICAgbWFyZ2luVG9wOiAxMDAgKiAoMSAtIHRoaXMuX19jb2xvci52KSAtIDcgKyAncHgnLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLl9fdGVtcC50b1N0cmluZygpLFxuICAgICAgICAgICAgYm9yZGVyOiB0aGlzLl9fZmllbGRfa25vYl9ib3JkZXIgKyAncmdiKCcgKyBmbGlwICsgJywnICsgZmxpcCArICcsJyArIGZsaXAgKycpJ1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdGhpcy5fX2h1ZV9rbm9iLnN0eWxlLm1hcmdpblRvcCA9ICgxIC0gdGhpcy5fX2NvbG9yLmggLyAzNjApICogMTAwICsgJ3B4J1xuXG4gICAgICAgICAgdGhpcy5fX3RlbXAucyA9IDE7XG4gICAgICAgICAgdGhpcy5fX3RlbXAudiA9IDE7XG5cbiAgICAgICAgICBsaW5lYXJHcmFkaWVudCh0aGlzLl9fc2F0dXJhdGlvbl9maWVsZCwgJ2xlZnQnLCAnI2ZmZicsIHRoaXMuX190ZW1wLnRvU3RyaW5nKCkpO1xuXG4gICAgICAgICAgY29tbW9uLmV4dGVuZCh0aGlzLl9faW5wdXQuc3R5bGUsIHtcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5fX2lucHV0LnZhbHVlID0gdGhpcy5fX2NvbG9yLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBjb2xvcjogJ3JnYignICsgZmxpcCArICcsJyArIGZsaXAgKyAnLCcgKyBmbGlwICsnKScsXG4gICAgICAgICAgICB0ZXh0U2hhZG93OiB0aGlzLl9faW5wdXRfdGV4dFNoYWRvdyArICdyZ2JhKCcgKyBfZmxpcCArICcsJyArIF9mbGlwICsgJywnICsgX2ZsaXAgKycsLjcpJ1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICk7XG4gIFxuICB2YXIgdmVuZG9ycyA9IFsnLW1vei0nLCctby0nLCctd2Via2l0LScsJy1tcy0nLCcnXTtcbiAgXG4gIGZ1bmN0aW9uIGxpbmVhckdyYWRpZW50KGVsZW0sIHgsIGEsIGIpIHtcbiAgICBlbGVtLnN0eWxlLmJhY2tncm91bmQgPSAnJztcbiAgICBjb21tb24uZWFjaCh2ZW5kb3JzLCBmdW5jdGlvbih2ZW5kb3IpIHtcbiAgICAgIGVsZW0uc3R5bGUuY3NzVGV4dCArPSAnYmFja2dyb3VuZDogJyArIHZlbmRvciArICdsaW5lYXItZ3JhZGllbnQoJyt4KycsICcrYSsnIDAlLCAnICsgYiArICcgMTAwJSk7ICc7XG4gICAgfSk7XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGh1ZUdyYWRpZW50KGVsZW0pIHtcbiAgICBlbGVtLnN0eWxlLmJhY2tncm91bmQgPSAnJztcbiAgICBlbGVtLnN0eWxlLmNzc1RleHQgKz0gJ2JhY2tncm91bmQ6IC1tb3otbGluZWFyLWdyYWRpZW50KHRvcCwgICNmZjAwMDAgMCUsICNmZjAwZmYgMTclLCAjMDAwMGZmIDM0JSwgIzAwZmZmZiA1MCUsICMwMGZmMDAgNjclLCAjZmZmZjAwIDg0JSwgI2ZmMDAwMCAxMDAlKTsnXG4gICAgZWxlbS5zdHlsZS5jc3NUZXh0ICs9ICdiYWNrZ3JvdW5kOiAtd2Via2l0LWxpbmVhci1ncmFkaWVudCh0b3AsICAjZmYwMDAwIDAlLCNmZjAwZmYgMTclLCMwMDAwZmYgMzQlLCMwMGZmZmYgNTAlLCMwMGZmMDAgNjclLCNmZmZmMDAgODQlLCNmZjAwMDAgMTAwJSk7J1xuICAgIGVsZW0uc3R5bGUuY3NzVGV4dCArPSAnYmFja2dyb3VuZDogLW8tbGluZWFyLWdyYWRpZW50KHRvcCwgICNmZjAwMDAgMCUsI2ZmMDBmZiAxNyUsIzAwMDBmZiAzNCUsIzAwZmZmZiA1MCUsIzAwZmYwMCA2NyUsI2ZmZmYwMCA4NCUsI2ZmMDAwMCAxMDAlKTsnXG4gICAgZWxlbS5zdHlsZS5jc3NUZXh0ICs9ICdiYWNrZ3JvdW5kOiAtbXMtbGluZWFyLWdyYWRpZW50KHRvcCwgICNmZjAwMDAgMCUsI2ZmMDBmZiAxNyUsIzAwMDBmZiAzNCUsIzAwZmZmZiA1MCUsIzAwZmYwMCA2NyUsI2ZmZmYwMCA4NCUsI2ZmMDAwMCAxMDAlKTsnXG4gICAgZWxlbS5zdHlsZS5jc3NUZXh0ICs9ICdiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG9wLCAgI2ZmMDAwMCAwJSwjZmYwMGZmIDE3JSwjMDAwMGZmIDM0JSwjMDBmZmZmIDUwJSwjMDBmZjAwIDY3JSwjZmZmZjAwIDg0JSwjZmYwMDAwIDEwMCUpOydcbiAgfVxuXG5cbiAgcmV0dXJuIENvbG9yQ29udHJvbGxlcjtcblxufSkoZGF0LmNvbnRyb2xsZXJzLkNvbnRyb2xsZXIsXG5kYXQuZG9tLmRvbSxcbmRhdC5jb2xvci5Db2xvciA9IChmdW5jdGlvbiAoaW50ZXJwcmV0LCBtYXRoLCB0b1N0cmluZywgY29tbW9uKSB7XG5cbiAgdmFyIENvbG9yID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLl9fc3RhdGUgPSBpbnRlcnByZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGlmICh0aGlzLl9fc3RhdGUgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyAnRmFpbGVkIHRvIGludGVycHJldCBjb2xvciBhcmd1bWVudHMnO1xuICAgIH1cblxuICAgIHRoaXMuX19zdGF0ZS5hID0gdGhpcy5fX3N0YXRlLmEgfHwgMTtcblxuXG4gIH07XG5cbiAgQ29sb3IuQ09NUE9ORU5UUyA9IFsncicsJ2cnLCdiJywnaCcsJ3MnLCd2JywnaGV4JywnYSddO1xuXG4gIGNvbW1vbi5leHRlbmQoQ29sb3IucHJvdG90eXBlLCB7XG5cbiAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcodGhpcyk7XG4gICAgfSxcblxuICAgIHRvT3JpZ2luYWw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19zdGF0ZS5jb252ZXJzaW9uLndyaXRlKHRoaXMpO1xuICAgIH1cblxuICB9KTtcblxuICBkZWZpbmVSR0JDb21wb25lbnQoQ29sb3IucHJvdG90eXBlLCAncicsIDIpO1xuICBkZWZpbmVSR0JDb21wb25lbnQoQ29sb3IucHJvdG90eXBlLCAnZycsIDEpO1xuICBkZWZpbmVSR0JDb21wb25lbnQoQ29sb3IucHJvdG90eXBlLCAnYicsIDApO1xuXG4gIGRlZmluZUhTVkNvbXBvbmVudChDb2xvci5wcm90b3R5cGUsICdoJyk7XG4gIGRlZmluZUhTVkNvbXBvbmVudChDb2xvci5wcm90b3R5cGUsICdzJyk7XG4gIGRlZmluZUhTVkNvbXBvbmVudChDb2xvci5wcm90b3R5cGUsICd2Jyk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbG9yLnByb3RvdHlwZSwgJ2EnLCB7XG5cbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19zdGF0ZS5hO1xuICAgIH0sXG5cbiAgICBzZXQ6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHRoaXMuX19zdGF0ZS5hID0gdjtcbiAgICB9XG5cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbG9yLnByb3RvdHlwZSwgJ2hleCcsIHtcblxuICAgIGdldDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIGlmICghdGhpcy5fX3N0YXRlLnNwYWNlICE9PSAnSEVYJykge1xuICAgICAgICB0aGlzLl9fc3RhdGUuaGV4ID0gbWF0aC5yZ2JfdG9faGV4KHRoaXMuciwgdGhpcy5nLCB0aGlzLmIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fX3N0YXRlLmhleDtcblxuICAgIH0sXG5cbiAgICBzZXQ6IGZ1bmN0aW9uKHYpIHtcblxuICAgICAgdGhpcy5fX3N0YXRlLnNwYWNlID0gJ0hFWCc7XG4gICAgICB0aGlzLl9fc3RhdGUuaGV4ID0gdjtcblxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBkZWZpbmVSR0JDb21wb25lbnQodGFyZ2V0LCBjb21wb25lbnQsIGNvbXBvbmVudEhleEluZGV4KSB7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBjb21wb25lbnQsIHtcblxuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAodGhpcy5fX3N0YXRlLnNwYWNlID09PSAnUkdCJykge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9fc3RhdGVbY29tcG9uZW50XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlY2FsY3VsYXRlUkdCKHRoaXMsIGNvbXBvbmVudCwgY29tcG9uZW50SGV4SW5kZXgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhdGVbY29tcG9uZW50XTtcblxuICAgICAgfSxcblxuICAgICAgc2V0OiBmdW5jdGlvbih2KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX19zdGF0ZS5zcGFjZSAhPT0gJ1JHQicpIHtcbiAgICAgICAgICByZWNhbGN1bGF0ZVJHQih0aGlzLCBjb21wb25lbnQsIGNvbXBvbmVudEhleEluZGV4KTtcbiAgICAgICAgICB0aGlzLl9fc3RhdGUuc3BhY2UgPSAnUkdCJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX19zdGF0ZVtjb21wb25lbnRdID0gdjtcblxuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZmluZUhTVkNvbXBvbmVudCh0YXJnZXQsIGNvbXBvbmVudCkge1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgY29tcG9uZW50LCB7XG5cbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX19zdGF0ZS5zcGFjZSA9PT0gJ0hTVicpXG4gICAgICAgICAgcmV0dXJuIHRoaXMuX19zdGF0ZVtjb21wb25lbnRdO1xuXG4gICAgICAgIHJlY2FsY3VsYXRlSFNWKHRoaXMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhdGVbY29tcG9uZW50XTtcblxuICAgICAgfSxcblxuICAgICAgc2V0OiBmdW5jdGlvbih2KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX19zdGF0ZS5zcGFjZSAhPT0gJ0hTVicpIHtcbiAgICAgICAgICByZWNhbGN1bGF0ZUhTVih0aGlzKTtcbiAgICAgICAgICB0aGlzLl9fc3RhdGUuc3BhY2UgPSAnSFNWJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX19zdGF0ZVtjb21wb25lbnRdID0gdjtcblxuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY2FsY3VsYXRlUkdCKGNvbG9yLCBjb21wb25lbnQsIGNvbXBvbmVudEhleEluZGV4KSB7XG5cbiAgICBpZiAoY29sb3IuX19zdGF0ZS5zcGFjZSA9PT0gJ0hFWCcpIHtcblxuICAgICAgY29sb3IuX19zdGF0ZVtjb21wb25lbnRdID0gbWF0aC5jb21wb25lbnRfZnJvbV9oZXgoY29sb3IuX19zdGF0ZS5oZXgsIGNvbXBvbmVudEhleEluZGV4KTtcblxuICAgIH0gZWxzZSBpZiAoY29sb3IuX19zdGF0ZS5zcGFjZSA9PT0gJ0hTVicpIHtcblxuICAgICAgY29tbW9uLmV4dGVuZChjb2xvci5fX3N0YXRlLCBtYXRoLmhzdl90b19yZ2IoY29sb3IuX19zdGF0ZS5oLCBjb2xvci5fX3N0YXRlLnMsIGNvbG9yLl9fc3RhdGUudikpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgdGhyb3cgJ0NvcnJ1cHRlZCBjb2xvciBzdGF0ZSc7XG5cbiAgICB9XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY2FsY3VsYXRlSFNWKGNvbG9yKSB7XG5cbiAgICB2YXIgcmVzdWx0ID0gbWF0aC5yZ2JfdG9faHN2KGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIpO1xuXG4gICAgY29tbW9uLmV4dGVuZChjb2xvci5fX3N0YXRlLFxuICAgICAgICB7XG4gICAgICAgICAgczogcmVzdWx0LnMsXG4gICAgICAgICAgdjogcmVzdWx0LnZcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICBpZiAoIWNvbW1vbi5pc05hTihyZXN1bHQuaCkpIHtcbiAgICAgIGNvbG9yLl9fc3RhdGUuaCA9IHJlc3VsdC5oO1xuICAgIH0gZWxzZSBpZiAoY29tbW9uLmlzVW5kZWZpbmVkKGNvbG9yLl9fc3RhdGUuaCkpIHtcbiAgICAgIGNvbG9yLl9fc3RhdGUuaCA9IDA7XG4gICAgfVxuXG4gIH1cblxuICByZXR1cm4gQ29sb3I7XG5cbn0pKGRhdC5jb2xvci5pbnRlcnByZXQsXG5kYXQuY29sb3IubWF0aCA9IChmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHRtcENvbXBvbmVudDtcblxuICByZXR1cm4ge1xuXG4gICAgaHN2X3RvX3JnYjogZnVuY3Rpb24oaCwgcywgdikge1xuXG4gICAgICB2YXIgaGkgPSBNYXRoLmZsb29yKGggLyA2MCkgJSA2O1xuXG4gICAgICB2YXIgZiA9IGggLyA2MCAtIE1hdGguZmxvb3IoaCAvIDYwKTtcbiAgICAgIHZhciBwID0gdiAqICgxLjAgLSBzKTtcbiAgICAgIHZhciBxID0gdiAqICgxLjAgLSAoZiAqIHMpKTtcbiAgICAgIHZhciB0ID0gdiAqICgxLjAgLSAoKDEuMCAtIGYpICogcykpO1xuICAgICAgdmFyIGMgPSBbXG4gICAgICAgIFt2LCB0LCBwXSxcbiAgICAgICAgW3EsIHYsIHBdLFxuICAgICAgICBbcCwgdiwgdF0sXG4gICAgICAgIFtwLCBxLCB2XSxcbiAgICAgICAgW3QsIHAsIHZdLFxuICAgICAgICBbdiwgcCwgcV1cbiAgICAgIF1baGldO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByOiBjWzBdICogMjU1LFxuICAgICAgICBnOiBjWzFdICogMjU1LFxuICAgICAgICBiOiBjWzJdICogMjU1XG4gICAgICB9O1xuXG4gICAgfSxcblxuICAgIHJnYl90b19oc3Y6IGZ1bmN0aW9uKHIsIGcsIGIpIHtcblxuICAgICAgdmFyIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLFxuICAgICAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgICAgIGRlbHRhID0gbWF4IC0gbWluLFxuICAgICAgICAgIGgsIHM7XG5cbiAgICAgIGlmIChtYXggIT0gMCkge1xuICAgICAgICBzID0gZGVsdGEgLyBtYXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGg6IE5hTixcbiAgICAgICAgICBzOiAwLFxuICAgICAgICAgIHY6IDBcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKHIgPT0gbWF4KSB7XG4gICAgICAgIGggPSAoZyAtIGIpIC8gZGVsdGE7XG4gICAgICB9IGVsc2UgaWYgKGcgPT0gbWF4KSB7XG4gICAgICAgIGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaCA9IDQgKyAociAtIGcpIC8gZGVsdGE7XG4gICAgICB9XG4gICAgICBoIC89IDY7XG4gICAgICBpZiAoaCA8IDApIHtcbiAgICAgICAgaCArPSAxO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBoOiBoICogMzYwLFxuICAgICAgICBzOiBzLFxuICAgICAgICB2OiBtYXggLyAyNTVcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHJnYl90b19oZXg6IGZ1bmN0aW9uKHIsIGcsIGIpIHtcbiAgICAgIHZhciBoZXggPSB0aGlzLmhleF93aXRoX2NvbXBvbmVudCgwLCAyLCByKTtcbiAgICAgIGhleCA9IHRoaXMuaGV4X3dpdGhfY29tcG9uZW50KGhleCwgMSwgZyk7XG4gICAgICBoZXggPSB0aGlzLmhleF93aXRoX2NvbXBvbmVudChoZXgsIDAsIGIpO1xuICAgICAgcmV0dXJuIGhleDtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50X2Zyb21faGV4OiBmdW5jdGlvbihoZXgsIGNvbXBvbmVudEluZGV4KSB7XG4gICAgICByZXR1cm4gKGhleCA+PiAoY29tcG9uZW50SW5kZXggKiA4KSkgJiAweEZGO1xuICAgIH0sXG5cbiAgICBoZXhfd2l0aF9jb21wb25lbnQ6IGZ1bmN0aW9uKGhleCwgY29tcG9uZW50SW5kZXgsIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPDwgKHRtcENvbXBvbmVudCA9IGNvbXBvbmVudEluZGV4ICogOCkgfCAoaGV4ICYgfiAoMHhGRiA8PCB0bXBDb21wb25lbnQpKTtcbiAgICB9XG5cbiAgfVxuXG59KSgpLFxuZGF0LmNvbG9yLnRvU3RyaW5nLFxuZGF0LnV0aWxzLmNvbW1vbiksXG5kYXQuY29sb3IuaW50ZXJwcmV0LFxuZGF0LnV0aWxzLmNvbW1vbiksXG5kYXQudXRpbHMucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKGZ1bmN0aW9uICgpIHtcblxuICAvKipcbiAgICogcmVxdWlyZWpzIHZlcnNpb24gb2YgUGF1bCBJcmlzaCdzIFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgKiBodHRwOi8vcGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuICAgKi9cblxuICByZXR1cm4gd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgZnVuY3Rpb24oY2FsbGJhY2ssIGVsZW1lbnQpIHtcblxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKTtcblxuICAgICAgfTtcbn0pKCksXG5kYXQuZG9tLkNlbnRlcmVkRGl2ID0gKGZ1bmN0aW9uIChkb20sIGNvbW1vbikge1xuXG5cbiAgdmFyIENlbnRlcmVkRGl2ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmJhY2tncm91bmRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29tbW9uLmV4dGVuZCh0aGlzLmJhY2tncm91bmRFbGVtZW50LnN0eWxlLCB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsMCwwLDAuOCknLFxuICAgICAgdG9wOiAwLFxuICAgICAgbGVmdDogMCxcbiAgICAgIGRpc3BsYXk6ICdub25lJyxcbiAgICAgIHpJbmRleDogJzEwMDAnLFxuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIFdlYmtpdFRyYW5zaXRpb246ICdvcGFjaXR5IDAuMnMgbGluZWFyJ1xuICAgIH0pO1xuXG4gICAgZG9tLm1ha2VGdWxsc2NyZWVuKHRoaXMuYmFja2dyb3VuZEVsZW1lbnQpO1xuICAgIHRoaXMuYmFja2dyb3VuZEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuXG4gICAgdGhpcy5kb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29tbW9uLmV4dGVuZCh0aGlzLmRvbUVsZW1lbnQuc3R5bGUsIHtcbiAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgICAgZGlzcGxheTogJ25vbmUnLFxuICAgICAgekluZGV4OiAnMTAwMScsXG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgV2Via2l0VHJhbnNpdGlvbjogJy13ZWJraXQtdHJhbnNmb3JtIDAuMnMgZWFzZS1vdXQsIG9wYWNpdHkgMC4ycyBsaW5lYXInXG4gICAgfSk7XG5cblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5iYWNrZ3JvdW5kRWxlbWVudCk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRvbUVsZW1lbnQpO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICBkb20uYmluZCh0aGlzLmJhY2tncm91bmRFbGVtZW50LCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIF90aGlzLmhpZGUoKTtcbiAgICB9KTtcblxuXG4gIH07XG5cbiAgQ2VudGVyZWREaXYucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgXG5cblxuICAgIHRoaXMuYmFja2dyb3VuZEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgdGhpcy5kb21FbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAwO1xuLy8gICAgdGhpcy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICc1MiUnO1xuICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAnc2NhbGUoMS4xKSc7XG5cbiAgICB0aGlzLmxheW91dCgpO1xuXG4gICAgY29tbW9uLmRlZmVyKGZ1bmN0aW9uKCkge1xuICAgICAgX3RoaXMuYmFja2dyb3VuZEVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICBfdGhpcy5kb21FbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgX3RoaXMuZG9tRWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAnc2NhbGUoMSknO1xuICAgIH0pO1xuXG4gIH07XG5cbiAgQ2VudGVyZWREaXYucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgaGlkZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICBfdGhpcy5kb21FbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICBfdGhpcy5iYWNrZ3JvdW5kRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgICBkb20udW5iaW5kKF90aGlzLmRvbUVsZW1lbnQsICd3ZWJraXRUcmFuc2l0aW9uRW5kJywgaGlkZSk7XG4gICAgICBkb20udW5iaW5kKF90aGlzLmRvbUVsZW1lbnQsICd0cmFuc2l0aW9uZW5kJywgaGlkZSk7XG4gICAgICBkb20udW5iaW5kKF90aGlzLmRvbUVsZW1lbnQsICdvVHJhbnNpdGlvbkVuZCcsIGhpZGUpO1xuXG4gICAgfTtcblxuICAgIGRvbS5iaW5kKHRoaXMuZG9tRWxlbWVudCwgJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCBoaWRlKTtcbiAgICBkb20uYmluZCh0aGlzLmRvbUVsZW1lbnQsICd0cmFuc2l0aW9uZW5kJywgaGlkZSk7XG4gICAgZG9tLmJpbmQodGhpcy5kb21FbGVtZW50LCAnb1RyYW5zaXRpb25FbmQnLCBoaWRlKTtcblxuICAgIHRoaXMuYmFja2dyb3VuZEVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IDA7XG4vLyAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzQ4JSc7XG4gICAgdGhpcy5kb21FbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAnc2NhbGUoMS4xKSc7XG5cbiAgfTtcblxuICBDZW50ZXJlZERpdi5wcm90b3R5cGUubGF5b3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSB3aW5kb3cuaW5uZXJXaWR0aC8yIC0gZG9tLmdldFdpZHRoKHRoaXMuZG9tRWxlbWVudCkgLyAyICsgJ3B4JztcbiAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gd2luZG93LmlubmVySGVpZ2h0LzIgLSBkb20uZ2V0SGVpZ2h0KHRoaXMuZG9tRWxlbWVudCkgLyAyICsgJ3B4JztcbiAgfTtcbiAgXG4gIGZ1bmN0aW9uIGxvY2tTY3JvbGwoZSkge1xuICAgIGNvbnNvbGUubG9nKGUpO1xuICB9XG5cbiAgcmV0dXJuIENlbnRlcmVkRGl2O1xuXG59KShkYXQuZG9tLmRvbSxcbmRhdC51dGlscy5jb21tb24pLFxuZGF0LmRvbS5kb20sXG5kYXQudXRpbHMuY29tbW9uKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9kYXQtZ3VpL3ZlbmRvci9kYXQuZ3VpLmpzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCIvKipcbiAqIGRhdC1ndWkgSmF2YVNjcmlwdCBDb250cm9sbGVyIExpYnJhcnlcbiAqIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9kYXQtZ3VpXG4gKlxuICogQ29weXJpZ2h0IDIwMTEgRGF0YSBBcnRzIFRlYW0sIEdvb2dsZSBDcmVhdGl2ZSBMYWJcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKi9cblxuLyoqIEBuYW1lc3BhY2UgKi9cbnZhciBkYXQgPSBtb2R1bGUuZXhwb3J0cyA9IGRhdCB8fCB7fTtcblxuLyoqIEBuYW1lc3BhY2UgKi9cbmRhdC5jb2xvciA9IGRhdC5jb2xvciB8fCB7fTtcblxuLyoqIEBuYW1lc3BhY2UgKi9cbmRhdC51dGlscyA9IGRhdC51dGlscyB8fCB7fTtcblxuZGF0LnV0aWxzLmNvbW1vbiA9IChmdW5jdGlvbiAoKSB7XG4gIFxuICB2YXIgQVJSX0VBQ0ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaDtcbiAgdmFyIEFSUl9TTElDRSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuICAvKipcbiAgICogQmFuZC1haWQgbWV0aG9kcyBmb3IgdGhpbmdzIHRoYXQgc2hvdWxkIGJlIGEgbG90IGVhc2llciBpbiBKYXZhU2NyaXB0LlxuICAgKiBJbXBsZW1lbnRhdGlvbiBhbmQgc3RydWN0dXJlIGluc3BpcmVkIGJ5IHVuZGVyc2NvcmUuanNcbiAgICogaHR0cDovL2RvY3VtZW50Y2xvdWQuZ2l0aHViLmNvbS91bmRlcnNjb3JlL1xuICAgKi9cblxuICByZXR1cm4geyBcbiAgICBcbiAgICBCUkVBSzoge30sXG4gIFxuICAgIGV4dGVuZDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBcbiAgICAgIHRoaXMuZWFjaChBUlJfU0xJQ0UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopXG4gICAgICAgICAgaWYgKCF0aGlzLmlzVW5kZWZpbmVkKG9ialtrZXldKSkgXG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IG9ialtrZXldO1xuICAgICAgICBcbiAgICAgIH0sIHRoaXMpO1xuICAgICAgXG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgXG4gICAgfSxcbiAgICBcbiAgICBkZWZhdWx0czogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBcbiAgICAgIHRoaXMuZWFjaChBUlJfU0xJQ0UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopXG4gICAgICAgICAgaWYgKHRoaXMuaXNVbmRlZmluZWQodGFyZ2V0W2tleV0pKSBcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gb2JqW2tleV07XG4gICAgICAgIFxuICAgICAgfSwgdGhpcyk7XG4gICAgICBcbiAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgXG4gICAgfSxcbiAgICBcbiAgICBjb21wb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0b0NhbGwgPSBBUlJfU0xJQ0UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgYXJncyA9IEFSUl9TTElDRS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgIGZvciAodmFyIGkgPSB0b0NhbGwubGVuZ3RoIC0xOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBbdG9DYWxsW2ldLmFwcGx5KHRoaXMsIGFyZ3MpXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gYXJnc1swXTtcbiAgICAgICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIGVhY2g6IGZ1bmN0aW9uKG9iaiwgaXRyLCBzY29wZSkge1xuXG4gICAgICBcbiAgICAgIGlmIChBUlJfRUFDSCAmJiBvYmouZm9yRWFjaCA9PT0gQVJSX0VBQ0gpIHsgXG4gICAgICAgIFxuICAgICAgICBvYmouZm9yRWFjaChpdHIsIHNjb3BlKTtcbiAgICAgICAgXG4gICAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggPT09IG9iai5sZW5ndGggKyAwKSB7IC8vIElzIG51bWJlciBidXQgbm90IE5hTlxuICAgICAgICBcbiAgICAgICAgZm9yICh2YXIga2V5ID0gMCwgbCA9IG9iai5sZW5ndGg7IGtleSA8IGw7IGtleSsrKVxuICAgICAgICAgIGlmIChrZXkgaW4gb2JqICYmIGl0ci5jYWxsKHNjb3BlLCBvYmpba2V5XSwga2V5KSA9PT0gdGhpcy5CUkVBSykgXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iaikgXG4gICAgICAgICAgaWYgKGl0ci5jYWxsKHNjb3BlLCBvYmpba2V5XSwga2V5KSA9PT0gdGhpcy5CUkVBSylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIFxuICAgICAgfVxuICAgICAgICAgICAgXG4gICAgfSxcbiAgICBcbiAgICBkZWZlcjogZnVuY3Rpb24oZm5jKSB7XG4gICAgICBzZXRUaW1lb3V0KGZuYywgMCk7XG4gICAgfSxcbiAgICBcbiAgICB0b0FycmF5OiBmdW5jdGlvbihvYmopIHtcbiAgICAgIGlmIChvYmoudG9BcnJheSkgcmV0dXJuIG9iai50b0FycmF5KCk7XG4gICAgICByZXR1cm4gQVJSX1NMSUNFLmNhbGwob2JqKTtcbiAgICB9LFxuXG4gICAgaXNVbmRlZmluZWQ6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiA9PT0gdW5kZWZpbmVkO1xuICAgIH0sXG4gICAgXG4gICAgaXNOdWxsOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gICAgfSxcbiAgICBcbiAgICBpc05hTjogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICE9PSBvYmo7XG4gICAgfSxcbiAgICBcbiAgICBpc0FycmF5OiBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iai5jb25zdHJ1Y3RvciA9PT0gQXJyYXk7XG4gICAgfSxcbiAgICBcbiAgICBpc09iamVjdDogZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbiAgICB9LFxuICAgIFxuICAgIGlzTnVtYmVyOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT09IG9iaiswO1xuICAgIH0sXG4gICAgXG4gICAgaXNTdHJpbmc6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiA9PT0gb2JqKycnO1xuICAgIH0sXG4gICAgXG4gICAgaXNCb29sZWFuOiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT09IGZhbHNlIHx8IG9iaiA9PT0gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIGlzRnVuY3Rpb246IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH1cbiAgXG4gIH07XG4gICAgXG59KSgpO1xuXG5cbmRhdC5jb2xvci50b1N0cmluZyA9IChmdW5jdGlvbiAoY29tbW9uKSB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbG9yKSB7XG5cbiAgICBpZiAoY29sb3IuYSA9PSAxIHx8IGNvbW1vbi5pc1VuZGVmaW5lZChjb2xvci5hKSkge1xuXG4gICAgICB2YXIgcyA9IGNvbG9yLmhleC50b1N0cmluZygxNik7XG4gICAgICB3aGlsZSAocy5sZW5ndGggPCA2KSB7XG4gICAgICAgIHMgPSAnMCcgKyBzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJyMnICsgcztcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIHJldHVybiAncmdiYSgnICsgTWF0aC5yb3VuZChjb2xvci5yKSArICcsJyArIE1hdGgucm91bmQoY29sb3IuZykgKyAnLCcgKyBNYXRoLnJvdW5kKGNvbG9yLmIpICsgJywnICsgY29sb3IuYSArICcpJztcblxuICAgIH1cblxuICB9XG5cbn0pKGRhdC51dGlscy5jb21tb24pO1xuXG5cbmRhdC5Db2xvciA9IGRhdC5jb2xvci5Db2xvciA9IChmdW5jdGlvbiAoaW50ZXJwcmV0LCBtYXRoLCB0b1N0cmluZywgY29tbW9uKSB7XG5cbiAgdmFyIENvbG9yID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLl9fc3RhdGUgPSBpbnRlcnByZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIGlmICh0aGlzLl9fc3RhdGUgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyAnRmFpbGVkIHRvIGludGVycHJldCBjb2xvciBhcmd1bWVudHMnO1xuICAgIH1cblxuICAgIHRoaXMuX19zdGF0ZS5hID0gdGhpcy5fX3N0YXRlLmEgfHwgMTtcblxuXG4gIH07XG5cbiAgQ29sb3IuQ09NUE9ORU5UUyA9IFsncicsJ2cnLCdiJywnaCcsJ3MnLCd2JywnaGV4JywnYSddO1xuXG4gIGNvbW1vbi5leHRlbmQoQ29sb3IucHJvdG90eXBlLCB7XG5cbiAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcodGhpcyk7XG4gICAgfSxcblxuICAgIHRvT3JpZ2luYWw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19zdGF0ZS5jb252ZXJzaW9uLndyaXRlKHRoaXMpO1xuICAgIH1cblxuICB9KTtcblxuICBkZWZpbmVSR0JDb21wb25lbnQoQ29sb3IucHJvdG90eXBlLCAncicsIDIpO1xuICBkZWZpbmVSR0JDb21wb25lbnQoQ29sb3IucHJvdG90eXBlLCAnZycsIDEpO1xuICBkZWZpbmVSR0JDb21wb25lbnQoQ29sb3IucHJvdG90eXBlLCAnYicsIDApO1xuXG4gIGRlZmluZUhTVkNvbXBvbmVudChDb2xvci5wcm90b3R5cGUsICdoJyk7XG4gIGRlZmluZUhTVkNvbXBvbmVudChDb2xvci5wcm90b3R5cGUsICdzJyk7XG4gIGRlZmluZUhTVkNvbXBvbmVudChDb2xvci5wcm90b3R5cGUsICd2Jyk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbG9yLnByb3RvdHlwZSwgJ2EnLCB7XG5cbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19zdGF0ZS5hO1xuICAgIH0sXG5cbiAgICBzZXQ6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHRoaXMuX19zdGF0ZS5hID0gdjtcbiAgICB9XG5cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbG9yLnByb3RvdHlwZSwgJ2hleCcsIHtcblxuICAgIGdldDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIGlmICghdGhpcy5fX3N0YXRlLnNwYWNlICE9PSAnSEVYJykge1xuICAgICAgICB0aGlzLl9fc3RhdGUuaGV4ID0gbWF0aC5yZ2JfdG9faGV4KHRoaXMuciwgdGhpcy5nLCB0aGlzLmIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fX3N0YXRlLmhleDtcblxuICAgIH0sXG5cbiAgICBzZXQ6IGZ1bmN0aW9uKHYpIHtcblxuICAgICAgdGhpcy5fX3N0YXRlLnNwYWNlID0gJ0hFWCc7XG4gICAgICB0aGlzLl9fc3RhdGUuaGV4ID0gdjtcblxuICAgIH1cblxuICB9KTtcblxuICBmdW5jdGlvbiBkZWZpbmVSR0JDb21wb25lbnQodGFyZ2V0LCBjb21wb25lbnQsIGNvbXBvbmVudEhleEluZGV4KSB7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBjb21wb25lbnQsIHtcblxuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAodGhpcy5fX3N0YXRlLnNwYWNlID09PSAnUkdCJykge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9fc3RhdGVbY29tcG9uZW50XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlY2FsY3VsYXRlUkdCKHRoaXMsIGNvbXBvbmVudCwgY29tcG9uZW50SGV4SW5kZXgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhdGVbY29tcG9uZW50XTtcblxuICAgICAgfSxcblxuICAgICAgc2V0OiBmdW5jdGlvbih2KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX19zdGF0ZS5zcGFjZSAhPT0gJ1JHQicpIHtcbiAgICAgICAgICByZWNhbGN1bGF0ZVJHQih0aGlzLCBjb21wb25lbnQsIGNvbXBvbmVudEhleEluZGV4KTtcbiAgICAgICAgICB0aGlzLl9fc3RhdGUuc3BhY2UgPSAnUkdCJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX19zdGF0ZVtjb21wb25lbnRdID0gdjtcblxuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZmluZUhTVkNvbXBvbmVudCh0YXJnZXQsIGNvbXBvbmVudCkge1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgY29tcG9uZW50LCB7XG5cbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX19zdGF0ZS5zcGFjZSA9PT0gJ0hTVicpXG4gICAgICAgICAgcmV0dXJuIHRoaXMuX19zdGF0ZVtjb21wb25lbnRdO1xuXG4gICAgICAgIHJlY2FsY3VsYXRlSFNWKHRoaXMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhdGVbY29tcG9uZW50XTtcblxuICAgICAgfSxcblxuICAgICAgc2V0OiBmdW5jdGlvbih2KSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX19zdGF0ZS5zcGFjZSAhPT0gJ0hTVicpIHtcbiAgICAgICAgICByZWNhbGN1bGF0ZUhTVih0aGlzKTtcbiAgICAgICAgICB0aGlzLl9fc3RhdGUuc3BhY2UgPSAnSFNWJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX19zdGF0ZVtjb21wb25lbnRdID0gdjtcblxuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY2FsY3VsYXRlUkdCKGNvbG9yLCBjb21wb25lbnQsIGNvbXBvbmVudEhleEluZGV4KSB7XG5cbiAgICBpZiAoY29sb3IuX19zdGF0ZS5zcGFjZSA9PT0gJ0hFWCcpIHtcblxuICAgICAgY29sb3IuX19zdGF0ZVtjb21wb25lbnRdID0gbWF0aC5jb21wb25lbnRfZnJvbV9oZXgoY29sb3IuX19zdGF0ZS5oZXgsIGNvbXBvbmVudEhleEluZGV4KTtcblxuICAgIH0gZWxzZSBpZiAoY29sb3IuX19zdGF0ZS5zcGFjZSA9PT0gJ0hTVicpIHtcblxuICAgICAgY29tbW9uLmV4dGVuZChjb2xvci5fX3N0YXRlLCBtYXRoLmhzdl90b19yZ2IoY29sb3IuX19zdGF0ZS5oLCBjb2xvci5fX3N0YXRlLnMsIGNvbG9yLl9fc3RhdGUudikpO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgdGhyb3cgJ0NvcnJ1cHRlZCBjb2xvciBzdGF0ZSc7XG5cbiAgICB9XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY2FsY3VsYXRlSFNWKGNvbG9yKSB7XG5cbiAgICB2YXIgcmVzdWx0ID0gbWF0aC5yZ2JfdG9faHN2KGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIpO1xuXG4gICAgY29tbW9uLmV4dGVuZChjb2xvci5fX3N0YXRlLFxuICAgICAgICB7XG4gICAgICAgICAgczogcmVzdWx0LnMsXG4gICAgICAgICAgdjogcmVzdWx0LnZcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICBpZiAoIWNvbW1vbi5pc05hTihyZXN1bHQuaCkpIHtcbiAgICAgIGNvbG9yLl9fc3RhdGUuaCA9IHJlc3VsdC5oO1xuICAgIH0gZWxzZSBpZiAoY29tbW9uLmlzVW5kZWZpbmVkKGNvbG9yLl9fc3RhdGUuaCkpIHtcbiAgICAgIGNvbG9yLl9fc3RhdGUuaCA9IDA7XG4gICAgfVxuXG4gIH1cblxuICByZXR1cm4gQ29sb3I7XG5cbn0pKGRhdC5jb2xvci5pbnRlcnByZXQgPSAoZnVuY3Rpb24gKHRvU3RyaW5nLCBjb21tb24pIHtcblxuICB2YXIgcmVzdWx0LCB0b1JldHVybjtcblxuICB2YXIgaW50ZXJwcmV0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0b1JldHVybiA9IGZhbHNlO1xuXG4gICAgdmFyIG9yaWdpbmFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBjb21tb24udG9BcnJheShhcmd1bWVudHMpIDogYXJndW1lbnRzWzBdO1xuXG4gICAgY29tbW9uLmVhY2goSU5URVJQUkVUQVRJT05TLCBmdW5jdGlvbihmYW1pbHkpIHtcblxuICAgICAgaWYgKGZhbWlseS5saXRtdXMob3JpZ2luYWwpKSB7XG5cbiAgICAgICAgY29tbW9uLmVhY2goZmFtaWx5LmNvbnZlcnNpb25zLCBmdW5jdGlvbihjb252ZXJzaW9uLCBjb252ZXJzaW9uTmFtZSkge1xuXG4gICAgICAgICAgcmVzdWx0ID0gY29udmVyc2lvbi5yZWFkKG9yaWdpbmFsKTtcblxuICAgICAgICAgIGlmICh0b1JldHVybiA9PT0gZmFsc2UgJiYgcmVzdWx0ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdG9SZXR1cm4gPSByZXN1bHQ7XG4gICAgICAgICAgICByZXN1bHQuY29udmVyc2lvbk5hbWUgPSBjb252ZXJzaW9uTmFtZTtcbiAgICAgICAgICAgIHJlc3VsdC5jb252ZXJzaW9uID0gY29udmVyc2lvbjtcbiAgICAgICAgICAgIHJldHVybiBjb21tb24uQlJFQUs7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbW1vbi5CUkVBSztcblxuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdG9SZXR1cm47XG5cbiAgfTtcblxuICB2YXIgSU5URVJQUkVUQVRJT05TID0gW1xuXG4gICAgLy8gU3RyaW5nc1xuICAgIHtcblxuICAgICAgbGl0bXVzOiBjb21tb24uaXNTdHJpbmcsXG5cbiAgICAgIGNvbnZlcnNpb25zOiB7XG5cbiAgICAgICAgVEhSRUVfQ0hBUl9IRVg6IHtcblxuICAgICAgICAgIHJlYWQ6IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG5cbiAgICAgICAgICAgIHZhciB0ZXN0ID0gb3JpZ2luYWwubWF0Y2goL14jKFtBLUYwLTldKShbQS1GMC05XSkoW0EtRjAtOV0pJC9pKTtcbiAgICAgICAgICAgIGlmICh0ZXN0ID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHNwYWNlOiAnSEVYJyxcbiAgICAgICAgICAgICAgaGV4OiBwYXJzZUludChcbiAgICAgICAgICAgICAgICAgICcweCcgK1xuICAgICAgICAgICAgICAgICAgICAgIHRlc3RbMV0udG9TdHJpbmcoKSArIHRlc3RbMV0udG9TdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgICAgICAgdGVzdFsyXS50b1N0cmluZygpICsgdGVzdFsyXS50b1N0cmluZygpICtcbiAgICAgICAgICAgICAgICAgICAgICB0ZXN0WzNdLnRvU3RyaW5nKCkgKyB0ZXN0WzNdLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHdyaXRlOiB0b1N0cmluZ1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgU0lYX0NIQVJfSEVYOiB7XG5cbiAgICAgICAgICByZWFkOiBmdW5jdGlvbihvcmlnaW5hbCkge1xuXG4gICAgICAgICAgICB2YXIgdGVzdCA9IG9yaWdpbmFsLm1hdGNoKC9eIyhbQS1GMC05XXs2fSkkL2kpO1xuICAgICAgICAgICAgaWYgKHRlc3QgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgc3BhY2U6ICdIRVgnLFxuICAgICAgICAgICAgICBoZXg6IHBhcnNlSW50KCcweCcgKyB0ZXN0WzFdLnRvU3RyaW5nKCkpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHdyaXRlOiB0b1N0cmluZ1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgQ1NTX1JHQjoge1xuXG4gICAgICAgICAgcmVhZDogZnVuY3Rpb24ob3JpZ2luYWwpIHtcblxuICAgICAgICAgICAgdmFyIHRlc3QgPSBvcmlnaW5hbC5tYXRjaCgvXnJnYlxcKFxccyooLispXFxzKixcXHMqKC4rKVxccyosXFxzKiguKylcXHMqXFwpLyk7XG4gICAgICAgICAgICBpZiAodGVzdCA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBzcGFjZTogJ1JHQicsXG4gICAgICAgICAgICAgIHI6IHBhcnNlRmxvYXQodGVzdFsxXSksXG4gICAgICAgICAgICAgIGc6IHBhcnNlRmxvYXQodGVzdFsyXSksXG4gICAgICAgICAgICAgIGI6IHBhcnNlRmxvYXQodGVzdFszXSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgd3JpdGU6IHRvU3RyaW5nXG5cbiAgICAgICAgfSxcblxuICAgICAgICBDU1NfUkdCQToge1xuXG4gICAgICAgICAgcmVhZDogZnVuY3Rpb24ob3JpZ2luYWwpIHtcblxuICAgICAgICAgICAgdmFyIHRlc3QgPSBvcmlnaW5hbC5tYXRjaCgvXnJnYmFcXChcXHMqKC4rKVxccyosXFxzKiguKylcXHMqLFxccyooLispXFxzKlxcLFxccyooLispXFxzKlxcKS8pO1xuICAgICAgICAgICAgaWYgKHRlc3QgPT09IG51bGwpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgc3BhY2U6ICdSR0InLFxuICAgICAgICAgICAgICByOiBwYXJzZUZsb2F0KHRlc3RbMV0pLFxuICAgICAgICAgICAgICBnOiBwYXJzZUZsb2F0KHRlc3RbMl0pLFxuICAgICAgICAgICAgICBiOiBwYXJzZUZsb2F0KHRlc3RbM10pLFxuICAgICAgICAgICAgICBhOiBwYXJzZUZsb2F0KHRlc3RbNF0pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHdyaXRlOiB0b1N0cmluZ1xuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIC8vIE51bWJlcnNcbiAgICB7XG5cbiAgICAgIGxpdG11czogY29tbW9uLmlzTnVtYmVyLFxuXG4gICAgICBjb252ZXJzaW9uczoge1xuXG4gICAgICAgIEhFWDoge1xuICAgICAgICAgIHJlYWQ6IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBzcGFjZTogJ0hFWCcsXG4gICAgICAgICAgICAgIGhleDogb3JpZ2luYWwsXG4gICAgICAgICAgICAgIGNvbnZlcnNpb25OYW1lOiAnSEVYJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICB3cml0ZTogZnVuY3Rpb24oY29sb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBjb2xvci5oZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICAvLyBBcnJheXNcbiAgICB7XG5cbiAgICAgIGxpdG11czogY29tbW9uLmlzQXJyYXksXG5cbiAgICAgIGNvbnZlcnNpb25zOiB7XG5cbiAgICAgICAgUkdCX0FSUkFZOiB7XG4gICAgICAgICAgcmVhZDogZnVuY3Rpb24ob3JpZ2luYWwpIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbC5sZW5ndGggIT0gMykgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgc3BhY2U6ICdSR0InLFxuICAgICAgICAgICAgICByOiBvcmlnaW5hbFswXSxcbiAgICAgICAgICAgICAgZzogb3JpZ2luYWxbMV0sXG4gICAgICAgICAgICAgIGI6IG9yaWdpbmFsWzJdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICB3cml0ZTogZnVuY3Rpb24oY29sb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBbY29sb3IuciwgY29sb3IuZywgY29sb3IuYl07XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgUkdCQV9BUlJBWToge1xuICAgICAgICAgIHJlYWQ6IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG4gICAgICAgICAgICBpZiAob3JpZ2luYWwubGVuZ3RoICE9IDQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHNwYWNlOiAnUkdCJyxcbiAgICAgICAgICAgICAgcjogb3JpZ2luYWxbMF0sXG4gICAgICAgICAgICAgIGc6IG9yaWdpbmFsWzFdLFxuICAgICAgICAgICAgICBiOiBvcmlnaW5hbFsyXSxcbiAgICAgICAgICAgICAgYTogb3JpZ2luYWxbM11cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHdyaXRlOiBmdW5jdGlvbihjb2xvcikge1xuICAgICAgICAgICAgcmV0dXJuIFtjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgLy8gT2JqZWN0c1xuICAgIHtcblxuICAgICAgbGl0bXVzOiBjb21tb24uaXNPYmplY3QsXG5cbiAgICAgIGNvbnZlcnNpb25zOiB7XG5cbiAgICAgICAgUkdCQV9PQko6IHtcbiAgICAgICAgICByZWFkOiBmdW5jdGlvbihvcmlnaW5hbCkge1xuICAgICAgICAgICAgaWYgKGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5yKSAmJlxuICAgICAgICAgICAgICAgIGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5nKSAmJlxuICAgICAgICAgICAgICAgIGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5iKSAmJlxuICAgICAgICAgICAgICAgIGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5hKSkge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNwYWNlOiAnUkdCJyxcbiAgICAgICAgICAgICAgICByOiBvcmlnaW5hbC5yLFxuICAgICAgICAgICAgICAgIGc6IG9yaWdpbmFsLmcsXG4gICAgICAgICAgICAgICAgYjogb3JpZ2luYWwuYixcbiAgICAgICAgICAgICAgICBhOiBvcmlnaW5hbC5hXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgd3JpdGU6IGZ1bmN0aW9uKGNvbG9yKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICByOiBjb2xvci5yLFxuICAgICAgICAgICAgICBnOiBjb2xvci5nLFxuICAgICAgICAgICAgICBiOiBjb2xvci5iLFxuICAgICAgICAgICAgICBhOiBjb2xvci5hXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIFJHQl9PQko6IHtcbiAgICAgICAgICByZWFkOiBmdW5jdGlvbihvcmlnaW5hbCkge1xuICAgICAgICAgICAgaWYgKGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5yKSAmJlxuICAgICAgICAgICAgICAgIGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5nKSAmJlxuICAgICAgICAgICAgICAgIGNvbW1vbi5pc051bWJlcihvcmlnaW5hbC5iKSkge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNwYWNlOiAnUkdCJyxcbiAgICAgICAgICAgICAgICByOiBvcmlnaW5hbC5yLFxuICAgICAgICAgICAgICAgIGc6IG9yaWdpbmFsLmcsXG4gICAgICAgICAgICAgICAgYjogb3JpZ2luYWwuYlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHdyaXRlOiBmdW5jdGlvbihjb2xvcikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgcjogY29sb3IucixcbiAgICAgICAgICAgICAgZzogY29sb3IuZyxcbiAgICAgICAgICAgICAgYjogY29sb3IuYlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBIU1ZBX09CSjoge1xuICAgICAgICAgIHJlYWQ6IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG4gICAgICAgICAgICBpZiAoY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLmgpICYmXG4gICAgICAgICAgICAgICAgY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLnMpICYmXG4gICAgICAgICAgICAgICAgY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLnYpICYmXG4gICAgICAgICAgICAgICAgY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLmEpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3BhY2U6ICdIU1YnLFxuICAgICAgICAgICAgICAgIGg6IG9yaWdpbmFsLmgsXG4gICAgICAgICAgICAgICAgczogb3JpZ2luYWwucyxcbiAgICAgICAgICAgICAgICB2OiBvcmlnaW5hbC52LFxuICAgICAgICAgICAgICAgIGE6IG9yaWdpbmFsLmFcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICB3cml0ZTogZnVuY3Rpb24oY29sb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGg6IGNvbG9yLmgsXG4gICAgICAgICAgICAgIHM6IGNvbG9yLnMsXG4gICAgICAgICAgICAgIHY6IGNvbG9yLnYsXG4gICAgICAgICAgICAgIGE6IGNvbG9yLmFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgSFNWX09CSjoge1xuICAgICAgICAgIHJlYWQ6IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XG4gICAgICAgICAgICBpZiAoY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLmgpICYmXG4gICAgICAgICAgICAgICAgY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLnMpICYmXG4gICAgICAgICAgICAgICAgY29tbW9uLmlzTnVtYmVyKG9yaWdpbmFsLnYpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3BhY2U6ICdIU1YnLFxuICAgICAgICAgICAgICAgIGg6IG9yaWdpbmFsLmgsXG4gICAgICAgICAgICAgICAgczogb3JpZ2luYWwucyxcbiAgICAgICAgICAgICAgICB2OiBvcmlnaW5hbC52XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgd3JpdGU6IGZ1bmN0aW9uKGNvbG9yKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBoOiBjb2xvci5oLFxuICAgICAgICAgICAgICBzOiBjb2xvci5zLFxuICAgICAgICAgICAgICB2OiBjb2xvci52XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgfVxuXG5cbiAgXTtcblxuICByZXR1cm4gaW50ZXJwcmV0O1xuXG5cbn0pKGRhdC5jb2xvci50b1N0cmluZyxcbmRhdC51dGlscy5jb21tb24pLFxuZGF0LmNvbG9yLm1hdGggPSAoZnVuY3Rpb24gKCkge1xuXG4gIHZhciB0bXBDb21wb25lbnQ7XG5cbiAgcmV0dXJuIHtcblxuICAgIGhzdl90b19yZ2I6IGZ1bmN0aW9uKGgsIHMsIHYpIHtcblxuICAgICAgdmFyIGhpID0gTWF0aC5mbG9vcihoIC8gNjApICUgNjtcblxuICAgICAgdmFyIGYgPSBoIC8gNjAgLSBNYXRoLmZsb29yKGggLyA2MCk7XG4gICAgICB2YXIgcCA9IHYgKiAoMS4wIC0gcyk7XG4gICAgICB2YXIgcSA9IHYgKiAoMS4wIC0gKGYgKiBzKSk7XG4gICAgICB2YXIgdCA9IHYgKiAoMS4wIC0gKCgxLjAgLSBmKSAqIHMpKTtcbiAgICAgIHZhciBjID0gW1xuICAgICAgICBbdiwgdCwgcF0sXG4gICAgICAgIFtxLCB2LCBwXSxcbiAgICAgICAgW3AsIHYsIHRdLFxuICAgICAgICBbcCwgcSwgdl0sXG4gICAgICAgIFt0LCBwLCB2XSxcbiAgICAgICAgW3YsIHAsIHFdXG4gICAgICBdW2hpXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcjogY1swXSAqIDI1NSxcbiAgICAgICAgZzogY1sxXSAqIDI1NSxcbiAgICAgICAgYjogY1syXSAqIDI1NVxuICAgICAgfTtcblxuICAgIH0sXG5cbiAgICByZ2JfdG9faHN2OiBmdW5jdGlvbihyLCBnLCBiKSB7XG5cbiAgICAgIHZhciBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcbiAgICAgICAgICBkZWx0YSA9IG1heCAtIG1pbixcbiAgICAgICAgICBoLCBzO1xuXG4gICAgICBpZiAobWF4ICE9IDApIHtcbiAgICAgICAgcyA9IGRlbHRhIC8gbWF4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBoOiBOYU4sXG4gICAgICAgICAgczogMCxcbiAgICAgICAgICB2OiAwXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGlmIChyID09IG1heCkge1xuICAgICAgICBoID0gKGcgLSBiKSAvIGRlbHRhO1xuICAgICAgfSBlbHNlIGlmIChnID09IG1heCkge1xuICAgICAgICBoID0gMiArIChiIC0gcikgLyBkZWx0YTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGggPSA0ICsgKHIgLSBnKSAvIGRlbHRhO1xuICAgICAgfVxuICAgICAgaCAvPSA2O1xuICAgICAgaWYgKGggPCAwKSB7XG4gICAgICAgIGggKz0gMTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaDogaCAqIDM2MCxcbiAgICAgICAgczogcyxcbiAgICAgICAgdjogbWF4IC8gMjU1XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICByZ2JfdG9faGV4OiBmdW5jdGlvbihyLCBnLCBiKSB7XG4gICAgICB2YXIgaGV4ID0gdGhpcy5oZXhfd2l0aF9jb21wb25lbnQoMCwgMiwgcik7XG4gICAgICBoZXggPSB0aGlzLmhleF93aXRoX2NvbXBvbmVudChoZXgsIDEsIGcpO1xuICAgICAgaGV4ID0gdGhpcy5oZXhfd2l0aF9jb21wb25lbnQoaGV4LCAwLCBiKTtcbiAgICAgIHJldHVybiBoZXg7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudF9mcm9tX2hleDogZnVuY3Rpb24oaGV4LCBjb21wb25lbnRJbmRleCkge1xuICAgICAgcmV0dXJuIChoZXggPj4gKGNvbXBvbmVudEluZGV4ICogOCkpICYgMHhGRjtcbiAgICB9LFxuXG4gICAgaGV4X3dpdGhfY29tcG9uZW50OiBmdW5jdGlvbihoZXgsIGNvbXBvbmVudEluZGV4LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlIDw8ICh0bXBDb21wb25lbnQgPSBjb21wb25lbnRJbmRleCAqIDgpIHwgKGhleCAmIH4gKDB4RkYgPDwgdG1wQ29tcG9uZW50KSk7XG4gICAgfVxuXG4gIH1cblxufSkoKSxcbmRhdC5jb2xvci50b1N0cmluZyxcbmRhdC51dGlscy5jb21tb24pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2RhdC1ndWkvdmVuZG9yL2RhdC5jb2xvci5qc1xuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwiLy8gc3RhdHMuanMgLSBodHRwOi8vZ2l0aHViLmNvbS9tcmRvb2Ivc3RhdHMuanNcbihmdW5jdGlvbihmLGUpe1wib2JqZWN0XCI9PT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9ZSgpOlwiZnVuY3Rpb25cIj09PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKGUpOmYuU3RhdHM9ZSgpfSkodGhpcyxmdW5jdGlvbigpe3ZhciBmPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShhKXtjLmFwcGVuZENoaWxkKGEuZG9tKTtyZXR1cm4gYX1mdW5jdGlvbiB1KGEpe2Zvcih2YXIgZD0wO2Q8Yy5jaGlsZHJlbi5sZW5ndGg7ZCsrKWMuY2hpbGRyZW5bZF0uc3R5bGUuZGlzcGxheT1kPT09YT9cImJsb2NrXCI6XCJub25lXCI7bD1hfXZhciBsPTAsYz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2Muc3R5bGUuY3NzVGV4dD1cInBvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDtjdXJzb3I6cG9pbnRlcjtvcGFjaXR5OjAuOTt6LWluZGV4OjEwMDAwXCI7Yy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixmdW5jdGlvbihhKXthLnByZXZlbnREZWZhdWx0KCk7XG51KCsrbCVjLmNoaWxkcmVuLmxlbmd0aCl9LCExKTt2YXIgaz0ocGVyZm9ybWFuY2V8fERhdGUpLm5vdygpLGc9ayxhPTAscj1lKG5ldyBmLlBhbmVsKFwiRlBTXCIsXCIjMGZmXCIsXCIjMDAyXCIpKSxoPWUobmV3IGYuUGFuZWwoXCJNU1wiLFwiIzBmMFwiLFwiIzAyMFwiKSk7aWYoc2VsZi5wZXJmb3JtYW5jZSYmc2VsZi5wZXJmb3JtYW5jZS5tZW1vcnkpdmFyIHQ9ZShuZXcgZi5QYW5lbChcIk1CXCIsXCIjZjA4XCIsXCIjMjAxXCIpKTt1KDApO3JldHVybntSRVZJU0lPTjoxNixkb206YyxhZGRQYW5lbDplLHNob3dQYW5lbDp1LGJlZ2luOmZ1bmN0aW9uKCl7az0ocGVyZm9ybWFuY2V8fERhdGUpLm5vdygpfSxlbmQ6ZnVuY3Rpb24oKXthKys7dmFyIGM9KHBlcmZvcm1hbmNlfHxEYXRlKS5ub3coKTtoLnVwZGF0ZShjLWssMjAwKTtpZihjPmcrMUUzJiYoci51cGRhdGUoMUUzKmEvKGMtZyksMTAwKSxnPWMsYT0wLHQpKXt2YXIgZD1wZXJmb3JtYW5jZS5tZW1vcnk7dC51cGRhdGUoZC51c2VkSlNIZWFwU2l6ZS9cbjEwNDg1NzYsZC5qc0hlYXBTaXplTGltaXQvMTA0ODU3Nil9cmV0dXJuIGN9LHVwZGF0ZTpmdW5jdGlvbigpe2s9dGhpcy5lbmQoKX0sZG9tRWxlbWVudDpjLHNldE1vZGU6dX19O2YuUGFuZWw9ZnVuY3Rpb24oZSxmLGwpe3ZhciBjPUluZmluaXR5LGs9MCxnPU1hdGgucm91bmQsYT1nKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvfHwxKSxyPTgwKmEsaD00OCphLHQ9MyphLHY9MiphLGQ9MyphLG09MTUqYSxuPTc0KmEscD0zMCphLHE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtxLndpZHRoPXI7cS5oZWlnaHQ9aDtxLnN0eWxlLmNzc1RleHQ9XCJ3aWR0aDo4MHB4O2hlaWdodDo0OHB4XCI7dmFyIGI9cS5nZXRDb250ZXh0KFwiMmRcIik7Yi5mb250PVwiYm9sZCBcIis5KmErXCJweCBIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZlwiO2IudGV4dEJhc2VsaW5lPVwidG9wXCI7Yi5maWxsU3R5bGU9bDtiLmZpbGxSZWN0KDAsMCxyLGgpO2IuZmlsbFN0eWxlPWY7Yi5maWxsVGV4dChlLHQsdik7XG5iLmZpbGxSZWN0KGQsbSxuLHApO2IuZmlsbFN0eWxlPWw7Yi5nbG9iYWxBbHBoYT0uOTtiLmZpbGxSZWN0KGQsbSxuLHApO3JldHVybntkb206cSx1cGRhdGU6ZnVuY3Rpb24oaCx3KXtjPU1hdGgubWluKGMsaCk7az1NYXRoLm1heChrLGgpO2IuZmlsbFN0eWxlPWw7Yi5nbG9iYWxBbHBoYT0xO2IuZmlsbFJlY3QoMCwwLHIsbSk7Yi5maWxsU3R5bGU9ZjtiLmZpbGxUZXh0KGcoaCkrXCIgXCIrZStcIiAoXCIrZyhjKStcIi1cIitnKGspK1wiKVwiLHQsdik7Yi5kcmF3SW1hZ2UocSxkK2EsbSxuLWEscCxkLG0sbi1hLHApO2IuZmlsbFJlY3QoZCtuLWEsbSxhLHApO2IuZmlsbFN0eWxlPWw7Yi5nbG9iYWxBbHBoYT0uOTtiLmZpbGxSZWN0KGQrbi1hLG0sYSxnKCgxLWgvdykqcCkpfX19O3JldHVybiBmfSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9zdGF0cy5qcy9idWlsZC9zdGF0cy5taW4uanNcbi8vIG1vZHVsZSBpZCA9IDI0XG4vLyBtb2R1bGUgY2h1bmtzID0gMSJdLCJzb3VyY2VSb290IjoiIn0=