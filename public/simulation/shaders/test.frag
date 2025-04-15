precision highp float;

in vec2 vUv;
uniform sampler2D velocity;
out vec4 fragColor;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 vel = texture(velocity, vUv).xy;
    float speed = length(vel);

    // Compute angle and map to [0,1] hue
    float angle = atan(vel.y, vel.x);
    float hue = mod((angle / (2.0 * 3.141592)) + 0.5, 1.0);

    float brightness = clamp(speed * 2.0, 0.0, 1.0); // tweak multiplier if needed

    vec3 color = hsv2rgb(vec3(hue, 1.0, brightness));
    fragColor = vec4(color, 1.0);
}