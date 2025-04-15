precision highp float;

in vec3 position;
out vec2 vUv;

void main() {
  // Map position from [-1, 1] to [0, 1] for UVs.
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position, 1.0);
}
