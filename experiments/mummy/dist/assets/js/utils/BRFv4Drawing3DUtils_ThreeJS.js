// Utils to put a 3D object on top of a face using ThreeJS (www.threejs.org)

(function() {
  "use strict";

  var t3d    = brfv4Example.drawing3d.t3d;  // ThreeJS namespace.
  var dom    = brfv4Example.dom;      // ... e.g. the DOM handling.

  if(!t3d) {
    brfv4Example.drawing3d.t3d = {};
  }

  t3d.setup = function(canvas) {

    t3d.stage       = canvas;
    t3d.scene       = new THREE.Scene();

    t3d.camera      = new THREE.OrthographicCamera(
      t3d.stage.width  / -2, t3d.stage.width  / 2,
      t3d.stage.height /  2, t3d.stage.height / -2,  50, 10000 );

    t3d.renderer    = new THREE.WebGLRenderer(
      {alpha: true, canvas: t3d.stage, antialias: true});

    t3d.pointLight  = new THREE.PointLight(0xffffff, 0.75, 10000);
    t3d.baseNodes   = [];
    t3d.modelZ      = 2000;

    t3d.renderer.setClearColor(0x000000, 0); // the default
    t3d.renderer.setPixelRatio(window.devicePixelRatio);
    t3d.renderer.setSize(t3d.stage.width, t3d.stage.height, true);

    t3d.scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    t3d.scene.add(t3d.pointLight);

    t3d.occlusionObjects = [];

    t3d.renderWidth   = 0;
    t3d.renderHeight  = 0;

    t3d.updateLayout(dom.stageWidth, dom.stageHeight);
  };

  t3d.updateLayout = function(width, height) {

    t3d.renderWidth   = width;
    t3d.renderHeight  = height;

    t3d.renderer.setSize(width, height, true);

    t3d.camera.left   = width  / -2;
    t3d.camera.right  = width  /  2;
    t3d.camera.top    = height /  2;
    t3d.camera.bottom = height / -2;

    t3d.camera.position.set(0, 0, 0);
    t3d.camera.lookAt(new THREE.Vector3(0, 0, 1));
    t3d.camera.updateProjectionMatrix();
  };

  t3d.update = function(index, face, show) {

    if(index >= t3d.baseNodes.length) {
      return;
    }

    var baseNode = t3d.baseNodes[index];
    if(!baseNode) return;

    if (show) {

      var rx  = (THREE.Math.radToDeg(-face.rotationX));
      var ry  = (THREE.Math.radToDeg(-face.rotationY));
      var rz  = (THREE.Math.radToDeg( face.rotationZ));

      var s   =  (face.scale / 180);
      var x   = -(face.points[27].x - (t3d.renderWidth  * 0.5));
      var y   = -(face.points[27].y - (t3d.renderHeight * 0.5))
        - ((Math.abs(ry) / 45.0) * -2.0)
        + ((rx < 0) ? (rx * 0.20) : 0.0);
      var z   =  t3d.modelZ;

      rx      = rx -  4 * (Math.abs(ry) / 45.0);
      rz      = rz - ry * 0.066 * (Math.abs(rx) / 20.0);
      ry      *= 0.9;

      baseNode.visible = true;
      baseNode.position.set(x, y, z);
      baseNode.scale.set(s, s, s);
      baseNode.rotation.set(
        THREE.Math.degToRad(rx),
        THREE.Math.degToRad(ry),
        THREE.Math.degToRad(rz)
      );
    } else {
      baseNode.visible = false;        // Hide the 3d object, if no face was tracked.
    }
  };

  t3d.render = function() {
    t3d.renderer.render(t3d.scene, t3d.camera);  // Render the threejs scene.
  };

  t3d.addBaseNodes = function(maxFaces) {

    var containers = t3d.baseNodes;
    var i;
    var group;

    for(i = containers.length; i < maxFaces; i++) {
      group = new THREE.Group();
      group.visible = false;
      containers.push(group);
      t3d.scene.add(group);
    }

    for(i = containers.length - 1; i > maxFaces; i--) {
      group = containers[k];
      t3d.scene.remove(group);
    }
  };

  t3d.loadOcclusionHead = function(url, maxFaces) {

    t3d.addBaseNodes(maxFaces);

    var containers = t3d.baseNodes;
    var loader = new THREE.ObjectLoader();

    loader.load(url, (function(model) {
      // t3d.model = model;

      for(var k = 0; k < containers.length; k++) {
        var mesh = model.clone();
        mesh.position.set(model.position.x, model.position.y, model.position.z);
        mesh.material.colorWrite = false;
        mesh.renderOrder = 0;
        
        t3d.occlusionObjects.push(mesh);
        containers[k].add(mesh);
      }

      t3d.render();

    }));
  };

  t3d.loadModel = function(url, maxFaces) {

    t3d.addBaseNodes(maxFaces);
    t3d.updateLayout(dom.stageWidth, dom.stageHeight);

    var containers = t3d.baseNodes;
    var loader = new THREE.ObjectLoader();

    loader.load(url, (function(model) {
      // t3d.model = model;

      for(var k = 0; k < containers.length; k++) {
        var mesh = model.clone();
        mesh.position.set(model.position.x, model.position.y, model.position.z);
        mesh.renderOrder = 2;
        containers[k].add(mesh);
      }

      t3d.render();

    }));
  };

  t3d.showOcclusionObjects = function(showThem) {

    for(var k = 0; k < t3d.occlusionObjects.length; k++) {
      var mesh = t3d.occlusionObjects[k];
      mesh.material.colorWrite = showThem;
    }
  };

  t3d.hideAll = function() {

    for(var k = 0; k < t3d.baseNodes.length; k++) {
      var baseNode = t3d.baseNodes[k];
      baseNode.visible = false;
    }
    t3d.render();
  };

  t3d.removeAll = function() {
    for(var k = 0; k < t3d.baseNodes.length; k++) {
      var baseNode = t3d.baseNodes[k];
      for(var j = baseNode.children.length - 1; j >= 0; j--) {
        baseNode.remove(baseNode.children[j]);
      }
    }
    t3d.render();
  };

  if(t3d.setup && !t3d.stage) {
    t3d.setup(dom.getElement("_t3d"));
  }
})();
