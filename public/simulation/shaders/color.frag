precision highp float;
uniform sampler2D velocity;
out vec4 fragColor;
in vec2 vUv;

void main(){
    vec2 vel = texture(velocity, vUv).xy;
    float len = length(vel);
    vel = vel * 0.5 + 0.5;
    
    vec3 color = vec3(vel.x, vel.y, 1.0);
    color = mix(vec3(0.0), color, len);

    fragColor = vec4(color,  1.0);
}