precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D current;   // the current velocity output (e.g., vel_0)
uniform sampler2D previous;  // the last accumulation result
uniform float fade;          // amount of previous to keep (0.0 = none, 1.0 = full)

void main() {
    vec4 currentVal = texture(current, vUv);
    vec4 previousVal = texture(previous, vUv);

    // Blend: keep some of the previous frame
    fragColor = mix(currentVal, previousVal, fade);
}