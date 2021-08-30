import CommandMove from "pixi-project/base/command-system/commands/CommandMove";

export const ALIGN_TOP = 'ALIGN_TOP';
export const ALIGN_CENTER_Y = 'ALIGN_CENTER_Y';
export const ALIGN_BOTTOM = 'ALIGN_BOTTOM';
export const ALIGN_LEFT = 'ALIGN_LEFT';
export const ALIGN_CENTER_X = 'ALIGN_CENTER_X';
export const ALIGN_RIGHT = 'ALIGN_RIGHT';

export default class AlignUtility {

    alignObjects(objects , type) {
        const edges = this.findAlignEdges(objects);
        const commands = [];

        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            const bounds = object.getBounds();

            let dx = 0;
            let dy = 0;

            if (type === ALIGN_TOP) {
                dy = edges.minY - bounds.top;
            } else if (type === ALIGN_RIGHT) {
                dx = edges.maxX - bounds.right;
            } else if (type === ALIGN_BOTTOM) {
                dy = edges.maxY - bounds.bottom;
            } else if (type === ALIGN_LEFT) {
                dx = edges.minX - bounds.left;
            } else if (type === ALIGN_CENTER_X) {
                let cy = edges.minY + (edges.maxY - edges.minY) / 2;
                dy = cy - bounds.top - (bounds.bottom - bounds.top) / 2;
            } else if (type === ALIGN_CENTER_Y) {
                let cx = edges.minX + (edges.maxX - edges.minX) / 2;
                dx = cx - bounds.left - (bounds.right - bounds.left) / 2;
            }

            const scale = window.app.viewport.scaled;
            const from = new PIXI.Point(object.x, object.y);
            const to = new PIXI.Point(object.x + dx / scale, object.y + dy / scale);

            const command = new CommandMove(object, from, to);
            commands.push(command);
        }

        return commands;
    }

    findAlignEdges(objects) {
        const b = objects[0].getBounds();

        let minX = b.left;
        let maxX = b.right;
        let minY = b.top;
        let maxY = b.bottom;

        for (let i = 0; i < objects.length; i++) {
            const bounds = objects[i].getBounds();

            if (minX > bounds.left) {
                minX = bounds.left;
            }

            if (maxX < bounds.right) {
                maxX = bounds.right;
            }

            if (minY > bounds.top) {
                minY = bounds.top;
            }

            if (maxY < bounds.bottom) {
                maxY = bounds.bottom;
            }
        }

        return { minX, maxX, minY, maxY };
    }

}
