import ShaderPass from "./ShaderPass";

import * as THREE from "three";


export default class Advection extends ShaderPass{
    constructor(simProps){
        super({
            material: {
                glslVersion: THREE.GLSL3,
                vertexShader: simProps.shaderSources.face, // face_vert,
                fragmentShader: simProps.shaderSources.advection, //advection_frag,
                uniforms: {
                    boundarySpace: {
                        value: simProps.cellScale
                    },
                    px: {
                        value: simProps.cellScale
                    },
                    fboSize: {
                        value: simProps.fboSize
                    },
                    velocity: {
                        value: simProps.src.texture
                    },
                    dt: {
                        value: simProps.dt
                    },
                    isBFECC: {
                        value: true
                    }
                },
            },
            output: simProps.dst,
            lineV: simProps.shaderSources.line,
            common: simProps.common,
            mouse : simProps.mouse
        });
        this.init();
    }

    init(){
        super.init();
        this.createBoundary();
    }

    createBoundary(){
        const boundaryG = new THREE.BufferGeometry();
        const vertices_boundary = new Float32Array([
            // left
            -1, -1, 0,
            -1, 1, 0,

            // top
            -1, 1, 0,
            1, 1, 0,

            // right
            1, 1, 0,
            1, -1, 0,

            // bottom
            1, -1, 0,
            -1, -1, 0
        ]);
        boundaryG.setAttribute( 'position', new THREE.BufferAttribute( vertices_boundary, 3 ) );
        const boundaryM = new THREE.RawShaderMaterial({
            glslVersion: THREE.GLSL3,
            vertexShader: this.props.lineV, //line_vert,
            fragmentShader: this.props.material.fragmentShader, //advection_frag,
            uniforms: this.uniforms
        });

        this.line = new THREE.LineSegments(boundaryG, boundaryM);
        this.scene.add(this.line);
    }

    update({ dt, isBounce, BFECC }){

        this.uniforms.dt.value = dt;
        this.line.visible = isBounce;
        this.uniforms.isBFECC.value = BFECC;

        super.update();
    }
}