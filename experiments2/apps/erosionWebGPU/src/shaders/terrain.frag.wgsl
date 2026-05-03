struct LightingUniforms {
    uLightDirection: vec3<f32>,
    uLightColor: vec3<f32>,
    uAmbientColor: vec3<f32>,
};

@group(0) @binding(1) var<uniform> lighting: LightingUniforms;

@fragment fn main(
    @location(0) vWorldPosition: vec3<f32>,
    @location(1) vNormal: vec3<f32>
) -> @location(0) vec4<f32> {
    
    let normal = normalize(vNormal);
    let lightDir = normalize(lighting.uLightDirection);
    
    // Diffuse component
    let diffuseIntensity = max(dot(normal, lightDir), 0.0);
    let diffuse = lighting.uLightColor * diffuseIntensity;
    
    // Ambient component
    let ambient = lighting.uAmbientColor;
    
    // Base color of the terrain based on height
    var baseColor = vec3<f32>(0.2, 0.4, 0.2); // Default green
    let height = vWorldPosition.y;

    if (height < 1.0) {
        baseColor = vec3<f32>(0.7, 0.6, 0.4); // Sand/Dirt
    } else if (height > 6.0) {
        baseColor = vec3<f32>(1.0, 1.0, 1.0); // Snow
    } else {
        baseColor = mix(vec3<f32>(0.2, 0.4, 0.2), vec3<f32>(0.4, 0.3, 0.2), smoothstep(2.0, 5.0, height)); // Grass to Rock
    }
    
    let finalColor = baseColor * (diffuse + ambient);
    
    return vec4<f32>(finalColor, 1.0);
}
