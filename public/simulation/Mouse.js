import * as THREE from "three";
// import Common from "./Common";

export default class Mouse {
    constructor(props) {
        this.mouseMoved = false;
        this.coords = new THREE.Vector2(0, 0);
        this.coords_old = new THREE.Vector2(0, 0);
        this.diff = new THREE.Vector2(0, 0);
        this.timer = null;
        this.count = 0;
        this.common = props.common;
    }

    // Initialize event listeners
    init() {
        window.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
        window.addEventListener('mousedown', this.onDocumentMouseMove.bind(this), false);
        window.addEventListener('mouseup', this.onDocumentMouseMove.bind(this), false);
        window.addEventListener('touchstart', this.onDocumentTouchStart.bind(this), false);
        window.addEventListener('touchmove', this.onDocumentTouchMove.bind(this), false);
    }

    // Set normalized coordinates
    setCoords(x, y) {
        if (this.timer) clearTimeout(this.timer);
        this.coords.set(
            (x / this.common.width) * 2 - 1,
            -(y / this.common.height) * 2 + 1
        );

        this.mouseMoved = true;

        // Reset mouseMoved flag after 100ms
        this.timer = setTimeout(() => {
            this.mouseMoved = false;
        }, 100);
    }

    // Mouse move event handler
    onDocumentMouseMove(event) {
        this.setCoords(event.clientX, event.clientY);
    }

    // Touch start event handler
    onDocumentTouchStart(event) {
        if (event.touches.length === 1) {
            this.setCoords(event.touches[0].pageX, event.touches[0].pageY);
        }
    }

    // Touch move event handler
    onDocumentTouchMove(event) {
        if (event.touches.length === 1) {
            this.setCoords(event.touches[0].pageX, event.touches[0].pageY);
        }
    }

    // Update the mouse movement (difference)
    update() {
        // Calculate difference from previous position
        this.diff.subVectors(this.coords, this.coords_old);

        // Update old coordinates to current
        this.coords_old.copy(this.coords);

        // If mouse hasn't moved, set the difference to zero
        if (this.coords_old.x === 0 && this.coords_old.y === 0) {
            this.diff.set(0, 0);
        }

    }
}

// export default new Mouse();
