precision highp float;

uniform float dt;
uniform bool isBFECC;
uniform vec2 fboSize;
uniform vec2 px;
in vec2 vUv;
uniform sampler2D velocity;
out vec4 fragColor;


void main(){
    vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
    if(isBFECC == false){
        vec2 vel = texture(velocity, vUv).xy;
        vec2 uv2 = vUv - vel * dt * ratio;
        vec2 newVel = texture(velocity, uv2).xy;
        fragColor = vec4(newVel, 0.0, 0.0);
    } else {
        vec2 spot_new = vUv;
        vec2 vel_old = texture(velocity, vUv).xy;

        vec2 spot_old = spot_new - vel_old * dt * ratio;
        vec2 vel_new1 = texture(velocity, spot_old).xy;

        vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
        vec2 error = spot_new2 - spot_new;

        vec2 spot_new3 = spot_new - error / 2.0;
        vec2 vel_2 = texture(velocity, spot_new3).xy;

        vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
        vec2 newVel2 = texture(velocity, spot_old2).xy;
        
        fragColor = vec4(newVel2, 0.0, 0.0);
    }
}