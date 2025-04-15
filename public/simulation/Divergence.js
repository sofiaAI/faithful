import ShaderPass from "./ShaderPass";
import * as THREE from "three";

export default class Divergence extends ShaderPass{
    constructor(simProps){
        super({
            material: {
                glslVersion: THREE.GLSL3,
                vertexShader: simProps.shaderSources.face, //face_vert,
                fragmentShader: simProps.shaderSources.divergence, //divergence_frag,
                uniforms: {
                    boundarySpace: {
                        value: simProps.boundarySpace
                    },
                    velocity: {
                        value: simProps.src.texture
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
        })

        this.init();
        // super.init();
    }

    update({ vel }){
        this.uniforms.velocity.value = vel.texture;
        super.update();
    }
}