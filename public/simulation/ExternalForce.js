import ShaderPass from "./ShaderPass";
// import Mouse from "./Mouse";

import * as THREE from "three";

export default class ExternalForce extends ShaderPass{
    constructor(simProps){
        super({
            glslVersion: THREE.GLSL3,
            output: simProps.dst,
            shaderSources: simProps.shaderSources,
            common: simProps.common,
            mouse: simProps.mouse
        });
        this.init(simProps);
    }

    init(simProps){
        super.init();
        const mouseG = new THREE.PlaneGeometry(1, 1);

        const mouseM = new THREE.RawShaderMaterial({
            vertexShader: simProps.shaderSources.mouse, //mouse_vert,
            fragmentShader: simProps.shaderSources.externalForce, //externalForce_frag,
            blending: THREE.AdditiveBlending,
            glslVersion: THREE.GLSL3,
            uniforms: {
                px: {
                    value: simProps.cellScale
                },
                force: {
                    value: new THREE.Vector2(0.0, 0.0)
                },
                center: {
                    value: new THREE.Vector2(0.0, 0.0)
                },
                scale: {
                    value: new THREE.Vector2(simProps.cursor_size, simProps.cursor_size)
                }
            },
        })

        this.mouse = new THREE.Mesh(mouseG, mouseM);
        this.scene.add(this.mouse);
    }

    update(props_){
        const forceX = this.props.mouse.diff.x / 2 * props_.mouse_force;
        const forceY = this.props.mouse.diff.y / 2 * props_.mouse_force;
        
        const cursorSizeX = props_.cursor_size * props_.cellScale.x;
        const cursorSizeY = props_.cursor_size * props_.cellScale.y;

        const centerX = Math.min(Math.max(this.props.mouse.coords.x, -1 + cursorSizeX + props_.cellScale.x * 2), 1 - cursorSizeX - props_.cellScale.x * 2);
        const centerY = Math.min(Math.max(this.props.mouse.coords.y, -1 + cursorSizeY + props_.cellScale.y * 2), 1 - cursorSizeY - props_.cellScale.y * 2);
        const uniforms = this.mouse.material.uniforms;

        uniforms.force.value.set(forceX, forceY);
        uniforms.center.value.set(centerX, centerY);
        uniforms.scale.value.set(props_.cursor_size, props_.cursor_size);
        super.update();
    }

}