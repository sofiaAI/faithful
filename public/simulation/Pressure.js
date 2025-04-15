import * as THREE from "three";
import ShaderPass from "./ShaderPass";

export default class Divergence extends ShaderPass{
    constructor(simProps){
        super({
            material: {
                glslVersion: THREE.GLSL3,
                vertexShader: simProps.shaderSources.face, //face_vert,
                fragmentShader: simProps.shaderSources.pressure, //pressure_frag,
                uniforms: {
                    boundarySpace: {
                        value: simProps.boundarySpace
                    },
                    pressure: {
                        value: simProps.src_p.texture
                    },
                    velocity: {
                        value: simProps.src_v.texture
                    },
                    px: {
                        value: simProps.cellScale
                    },
                    dt: {
                        value: simProps.dt
                    }
                }
            },
            output: simProps.dst,
            common: simProps.common,
            mouse : simProps.mouse
        });
        // super.init();
        this.init();
    }

    update({vel, pressure}){
        this.uniforms.velocity.value = vel.texture;
        this.uniforms.pressure.value = pressure.texture;
        super.update();
    }
    
}