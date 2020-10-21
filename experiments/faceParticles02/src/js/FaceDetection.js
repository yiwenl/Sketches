import EventDispatcher from "events";
import { Scheduler } from "alfrid";

const scale = 1;
const videoWidth = 640 * scale;
const videoHeight = 480 * scale;

class FaceDetection extends EventDispatcher {
  async init() {
    const { tf, facemesh } = window;
    console.log("FaceDetection init", facemesh);

    await tf.setBackend("webgl");

    await this._setupCamera();
    console.log("Camera", this.video);

    // Load the MediaPipe facemesh model assets.
    this.model = await facemesh.load({ maxFaces: 1 });

    // Pass in a video stream to the model to obtain
    // an array of detected faces from the MediaPipe graph.

    // this.checkFace()
    const fps = 20;
    setInterval(() => this.checkFace(), 1000 / fps);
  }

  _setupCamera() {
    return new Promise((resolve, reject) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        reject(new Error("no camera"));
      }

      const video = document.getElementById("video");
      video.width = videoWidth;
      video.height = videoHeight;

      const onStreamFetched = (mediaStream) => {
        this.video = video;
        video.addEventListener("loadeddata", () => {
          resolve(video);
        });

        video.srcObject = mediaStream;
        video.play();
        console.log(
          "Stream fetched :",
          video.width,
          video.height,
          video.videoWidth,
          video.videoHeight
        );
      };

      let deviceId = "";
      navigator.mediaDevices
        .enumerateDevices()
        .then(function(devices) {
          const webcams = devices.filter(
            (device) => device.kind === "videoinput"
          );
          console.log("webcams", webcams.length);
          console.table(webcams);

          if (webcams.length === 1) {
            deviceId = webcams[0].deviceId;
          } else {
            const logitech = webcams.filter(
              (webcam) => webcam.label.indexOf("C920") > -1
            )[0];
            deviceId = logitech ? logitech.deviceId : webcams[0].deviceId;
          }

          window.navigator.mediaDevices
            .getUserMedia({
              video: { width: 640, height: 480, frameRate: 30, deviceId },
            })
            .then(onStreamFetched)
            .catch(function() {
              console.error("No camera available.");
            });
        })
        .catch(function(err) {
          console.log(err.name + ": " + err.message);
        });
    });
  }

  async checkFace() {
    const { model, video } = this;
    const faces = await model.estimateFaces(video);

    // if (Math.random() > 0.99) {
    //   console.log('faces', faces[0])
    // }

    if (faces.length > 0) {
      const vertices = faces[0].scaledMesh.map((v) => [
        -v[0] + videoWidth / 2,
        -v[1] + videoHeight / 2,
        -v[2],
      ]);
      this.emit("onFace", vertices);
    }

    // Scheduler.next(() => this.checkFace())
  }
}

export default new FaceDetection();
