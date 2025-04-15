// import Mouse from "./Mouse";
// import Common from "./Common";
import * as THREE from "three";
import dynamic from 'next/dynamic';

import Advection from "./Advection";
import ExternalForce from "./ExternalForce";
import Viscous from "./Viscous";
import Divergence from "./Divergence";
import Poisson from "./Poisson";
import Pressure from "./Pressure";
import Accumulation from "./Accumulation";

export default class Simulation{
    constructor(props){
        this.props = props;

        this.fbos = {
            vel_0: null,
            vel_1: null,

            // for calc next velocity with viscous
            vel_viscous0: null,
            vel_viscous1: null,

            // for calc pressure
            div: null,

            // for calc poisson equation 
            pressure_0: null,
            pressure_1: null,

            // for accumulation
            accumulation_0: null,
            accumulation_1 : null
        };

        this.options = {
            iterations_poisson: 4,
            iterations_viscous: 3,
            mouse_force: 10,
            resolution: 0.5,
            cursor_size: 150,
            viscous: 100,
            isBounce: false,
            dt: 0.005,
            isViscous: true,
            BFECC: true
        };
        const Controls = dynamic(() => import("./Controls"), { ssr: false });
        const controls = new Controls(this.options);

        this.fboSize = new THREE.Vector2();
        this.cellScale = new THREE.Vector2();
        this.boundarySpace = new THREE.Vector2();
        this.useAccum0 = true;
        this.init();
    }

    
    init(){
        this.calcSize();
        this.createAllFBO();
        this.createShaderPass();
        
    }

    createAllFBO(){
        const type = ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType;

        for(let key in this.fbos){
            this.fbos[key] = new THREE.WebGLRenderTarget(
                this.fboSize.x,
                this.fboSize.y,
                {
                    type: type
                }
            )
        }
    }

    createShaderPass(){
        this.advection = new Advection({
            cellScale: this.cellScale,
            fboSize: this.fboSize,
            dt: this.options.dt,
            src: this.fbos.vel_0,
            dst: this.fbos.vel_1,
            shaderSources: this.props.shaderSources,
            common: this.props.common,
            mouse : this.props.mouse
        });

        this.externalForce = new ExternalForce({
            cellScale: this.cellScale,
            cursor_size: this.options.cursor_size,
            dst: this.fbos.vel_1,
            shaderSources: this.props.shaderSources,
            common: this.props.common,
            mouse : this.props.mouse
        });

        this.viscous = new Viscous({
            cellScale: this.cellScale,
            boundarySpace: this.boundarySpace,
            viscous: this.options.viscous,
            src: this.fbos.vel_1,
            dst: this.fbos.vel_viscous1,
            dst_: this.fbos.vel_viscous0,
            dt: this.options.dt,
            shaderSources: this.props.shaderSources,
            common: this.props.common,
            mouse : this.props.mouse
        });

        this.divergence = new Divergence({
            cellScale: this.cellScale,
            boundarySpace: this.boundarySpace,
            src: this.fbos.vel_viscous0,
            dst: this.fbos.div,
            dt: this.options.dt,
            shaderSources: this.props.shaderSources,
            common: this.props.common,
            mouse : this.props.mouse
        });

        this.poisson = new Poisson({
            cellScale: this.cellScale,
            boundarySpace: this.boundarySpace,
            src: this.fbos.div,
            dst: this.fbos.pressure_1,
            dst_: this.fbos.pressure_0,
            shaderSources: this.props.shaderSources,
            common: this.props.common,
            mouse : this.props.mouse
        });

        this.pressure = new Pressure({
            cellScale: this.cellScale,
            boundarySpace: this.boundarySpace,
            src_p: this.fbos.pressure_0,
            src_v: this.fbos.vel_viscous0,
            dst: this.fbos.vel_0,
            dt: this.options.dt,
            shaderSources: this.props.shaderSources,
            common: this.props.common,
            mouse : this.props.mouse
        });

        this.accumulation = new Accumulation({
            src: this.fbos.vel_0,
            dst: this.fbos.accumulation_1,
            previous: this.fbos.accumulation_0,
            fade: 0.96,
            shaderSources: this.props.shaderSources,
            common: this.props.common,
            mouse : this.props.mouse
        });
    }

    calcSize(){
        const width = Math.round(this.options.resolution * this.props.common.width);
        const height = Math.round(this.options.resolution * this.props.common.height);

        const px_x = 1.0 / width;
        const px_y = 1.0 / height;

        this.cellScale.set(px_x, px_y);
        this.fboSize.set(width, height);
    }

    resize(){
        this.calcSize();

        for(let key in this.fbos){
            this.fbos[key].setSize(this.fboSize.x, this.fboSize.y);
        }
    }
    

    update(){

        if(this.options.isBounce){
            this.boundarySpace.set(0, 0);
        } else {
            this.boundarySpace.copy(this.cellScale);
        }

        this.advection.update(this.options);

        this.externalForce.update({
            cursor_size: this.options.cursor_size,
            mouse_force: this.options.mouse_force,
            cellScale: this.cellScale
          });
        

        let vel = this.fbos.vel_1;

        if(this.options.isViscous){
            vel = this.viscous.update({
                viscous: this.options.viscous,
                iterations: this.options.iterations_viscous,
                dt: this.options.dt
            });
        }

        this.divergence.update({vel});

        const pressure = this.poisson.update({
            iterations: this.options.iterations_poisson,
        });

        this.pressure.update({ vel , pressure});
        

        // === Accumulation Pass ===
        const currentFBO = this.fbos.vel_0;
        const previousFBO = this.useAccum0 ? this.fbos.accumulation_0 : this.fbos.accumulation_1;
        const outputFBO   = this.useAccum0 ? this.fbos.accumulation_1 : this.fbos.accumulation_0;

        this.accumulation.props.output = outputFBO;
        this.accumulation.update({
            currentFBO: currentFBO,
            previousFBO: previousFBO,
            fade: 0.8
        });

        // Flip the toggle for next frame
        this.useAccum0 = !this.useAccum0;
        
    }
}