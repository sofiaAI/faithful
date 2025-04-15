// import Common from "./Common";
import * as THREE from "three";
import Simulation from "./Simulation";

export default class Output {
    constructor(options) {
        this.shaderSources = options.shaderSources;
        this.common = options.common;
        this.mouse = options.mouse;
        this.init();
    }

    init() {
        this.simulation = new Simulation({
            shaderSources: this.shaderSources,
            common: this.common,
            mouse: this.mouse
        });

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.material = new THREE.RawShaderMaterial({
            glslVersion: THREE.GLSL3,
            vertexShader: this.shaderSources.face,
            fragmentShader: this.shaderSources.color, 
            uniforms: {
                velocity: { value:
                    this.simulation.useAccum0 && this.simulation.fbos.accumulation_1
                    ? this.simulation.fbos.accumulation_1.texture
                    : this.simulation.fbos.accumulation_0
                    ? this.simulation.fbos.accumulation_0.texture
                    : this.simulation.fbos.vel_0.texture // fallback to something safe
                },
                boundarySpace: { value: new THREE.Vector2() },
            },
        });

        this.output = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            this.material
        );

        this.scene.add(this.output);
    }

    resize() {
        this.simulation.resize();
    }

    render() {

        this.common.renderer.setRenderTarget(null);
        this.common.renderer.render(this.scene, this.camera);
        // this.common.renderer.render(this.simulation.viscous.scene, this.simulation.viscous.camera);
    }

    update() {
        // Run simulation steps
        this.simulation.update();

        // Render to screen
        this.render();
    }
}
