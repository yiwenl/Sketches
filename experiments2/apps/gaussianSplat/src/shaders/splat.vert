#version 300 es

precision highp float;

// quad corner in [-1, 1]
in vec3 aVertexPosition;
in vec2 aTextureCoord;

// per-splat instance attributes (reordered back-to-front on the CPU)
in vec3 aPosition;
in vec3 aScale;
in vec4 aRotation; // quaternion [w, x, y, z]
in vec3 aColor;
in float aOpacity;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uViewport;

out vec2 vQuad;
out vec3 vColor;
out float vOpacity;

// how many standard deviations the quad covers
const float K = 3.0;

// quaternion [w, x, y, z] -> rotation matrix (column-major)
mat3 quatToMat3(vec4 q) {
    float w = q.x, x = q.y, y = q.z, z = q.w;
    return mat3(
        1.0 - 2.0 * (y * y + z * z), 2.0 * (x * y + w * z),       2.0 * (x * z - w * y),
        2.0 * (x * y - w * z),       1.0 - 2.0 * (x * x + z * z), 2.0 * (y * z + w * x),
        2.0 * (x * z + w * y),       2.0 * (y * z - w * x),       1.0 - 2.0 * (x * x + y * y)
    );
}

void main(void) {
    // 3D covariance Vrk = R S S^T R^T  (M = R * S, Vrk = M * Mᵀ)
    mat3 R = quatToMat3(aRotation);
    mat3 M = mat3(
        R[0] * aScale.x,
        R[1] * aScale.y,
        R[2] * aScale.z
    );
    mat3 Vrk = M * transpose(M);

    // camera-space center
    mat4 viewModel = uViewMatrix * uModelMatrix;
    vec3 t = (viewModel * vec4(aPosition, 1.0)).xyz;

    // cull splats behind the camera
    if (t.z > -0.01) {
        gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
        return;
    }

    // covariance in camera space
    mat3 Rv = mat3(viewModel);
    mat3 Vcam = Rv * Vrk * transpose(Rv);

    // focal lengths in pixels from the projection matrix
    float fx = 0.5 * uViewport.x * uProjectionMatrix[0][0];
    float fy = 0.5 * uViewport.y * uProjectionMatrix[1][1];

    // jacobian of the perspective projection (rows of a 2x3 matrix)
    float invz = 1.0 / t.z;
    float invz2 = invz * invz;
    vec3 J0 = vec3(-fx * invz, 0.0, fx * t.x * invz2);
    vec3 J1 = vec3(0.0, -fy * invz, fy * t.y * invz2);

    // 2D screen-space covariance: cov2d = J * Vcam * Jᵀ  (+ low-pass filter)
    vec3 VJ0 = Vcam * J0;
    vec3 VJ1 = Vcam * J1;
    float c00 = dot(J0, VJ0) + 0.3;
    float c11 = dot(J1, VJ1) + 0.3;
    float c01 = dot(J0, VJ1);

    // eigen-decomposition of the symmetric 2x2 covariance
    float mid = 0.5 * (c00 + c11);
    float rad = sqrt(max(mid * mid - (c00 * c11 - c01 * c01), 0.0));
    float lambda1 = mid + rad;
    float lambda2 = mid - rad;

    if (lambda2 <= 0.0) {
        gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
        return;
    }

    vec2 major = (abs(c01) < 1e-6 && abs(lambda1 - c00) < 1e-6)
        ? vec2(1.0, 0.0)
        : normalize(vec2(c01, lambda1 - c00));
    vec2 minor = vec2(-major.y, major.x);

    // pixel-space offset for this quad corner, then convert to NDC
    vec2 offsetPx =
        aVertexPosition.x * K * sqrt(lambda1) * major +
        aVertexPosition.y * K * sqrt(lambda2) * minor;
    vec2 offsetNDC = offsetPx * 2.0 / uViewport;

    vec4 clip = uProjectionMatrix * vec4(t, 1.0);
    vec3 centerNDC = clip.xyz / clip.w;

    gl_Position = vec4(centerNDC.xy + offsetNDC, centerNDC.z, 1.0);

    vQuad = aVertexPosition.xy * K;
    vColor = aColor;
    vOpacity = aOpacity;
}
