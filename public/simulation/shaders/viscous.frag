precision highp float;

uniform sampler2D velocity;
uniform sampler2D velocity_new;
uniform float v;
uniform vec2 px;
uniform float dt;
in vec2 vUv;
out vec4 fragColor;

void main(){
    // poisson equation
    vec2 old = texture(velocity, vUv).xy;
    vec2 new0 = texture(velocity_new, vUv + vec2(px.x * 2.0, 0)).xy;
    vec2 new1 = texture(velocity_new, vUv - vec2(px.x * 2.0, 0)).xy;
    vec2 new2 = texture(velocity_new, vUv + vec2(0, px.y * 2.0)).xy;
    vec2 new3 = texture(velocity_new, vUv - vec2(0, px.y * 2.0)).xy;

    vec2 new = 4.0 * old + v * dt * (new0 + new1 + new2 + new3);
    new /= 4.0 * (1.0 + v * dt);
    
    fragColor = vec4(new, 0.0, 0.0);
}
