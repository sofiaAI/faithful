import ShaderPass from "./ShaderPass";
import * as THREE from "three";

export default class Accumulation extends ShaderPass {
    constructor(simProps) {
        super({
            material: {
                glslVersion: THREE.GLSL3,
                vertexShader: simProps.shaderSources.face, // full screen quad
                fragmentShader: simProps.shaderSources.accumulation, // <- link the .frag
                uniforms: {
                    current: { value: simProps.src.texture },
                    previous: { value: simProps.previous.texture },
                    fade: { value: simProps.fade }
                }
            },
            output: simProps.dst,
            common: simProps.common,
            mouse: simProps.mouse
        });

        this.init();
    }

    update({ currentFBO, previousFBO, fade }) {
        this.uniforms.current.value = currentFBO.texture;
        this.uniforms.previous.value = previousFBO.texture;
        this.uniforms.fade.value = fade;

        super.update(); // run the shader
    }
}