#version 300 es

precision highp float;
in vec2 vTextureCoord;
in float vHeight;

uniform float uMaxHeight;

uniform sampler2D uNormalMap;
uniform sampler2D uHeightMap;
uniform sampler2D uErosionMap;

uniform float uShowErosion;
out vec4 oColor;

#define LIGHT vec3(1.0, 0.2, 1.0)

void main(void) {
    float g = smoothstep(0.0, uMaxHeight, vHeight);
    g = mix(0.5, 1.0, g);

    vec3 normal = texture(uNormalMap, vTextureCoord).rgb * 2.0 - 1.0;
    float diffuse = dot(normal, normalize(LIGHT));
    diffuse = max(diffuse, 0.0);
    diffuse = mix(0.5, 1.0, diffuse);
    diffuse = g * diffuse;


    float erosion = texture(uErosionMap, vTextureCoord).r;
    diffuse += erosion * uShowErosion;

    oColor = vec4(vec3(diffuse), 1.0);


    float uContourSpacing = 0.1;
    float uLineWidth = 0.003;
    float uLineWidthPixels = 2.0;
    
    // 1. 获取高度 H 和其在屏幕空间的梯度 (||nabla H_screen||)
    float H = vHeight; 
    
    // fwidth(H) 得到的是 H 在屏幕上一个像素宽度内变化的绝对值之和。
    float slope_screen = fwidth(H); 
    
    // 2. 计算目标线宽所需的垂直高度差 (Delta H_target)
    // Delta H_target = uLineWidthPixels * slope_screen
    // 这代表了如果我们要画一条 uLineWidthPixels 宽的线，我们需要多少垂直高度差。
    float line_width_in_height = uLineWidthPixels * slope_screen;

    // 3. 寻找最近的等高线高度 (H_contour)
    // H_contour = round(H / uContourSpacing) * uContourSpacing
    // 另一种方法是使用 fract，我们用 min(f, 1.0 - f) 
    float f = fract(H / uContourSpacing);
    float dist_norm = min(f, 1.0 - f); // 垂直距离 H 到最近等高线 H_contour，范围 [0, 0.5]
    
    // 4. 将垂直距离转换回实际高度差 [0, H_spacing / 2]
    float dist_height = dist_norm * uContourSpacing; 

    // 5. 最终检测和平滑
    // 我们检测 dist_height 是否小于 line_width_in_height
    // 1.0 - smoothstep(0.0, 1.0, dist_height / line_width_in_height)
    // dist_height / line_width_in_height 在线条中心为 0，在线条边缘为 1。
    float t = dist_height / line_width_in_height;
    float line_weight = 1.0 - smoothstep(0.0, 1.0, t);

    oColor.rgb += line_weight * 0.2;
}