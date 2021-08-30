
export default class CullingSegment {
    constructor(id) {
        this.id = id;
        this.objects = [];
    }

    add(object) {
        object.segmentIds.push(this.id);
        this.objects.push(object);
    }

    remove(object) {
        this.objects.removeElement(object);
        object.segmentIds.removeElement(this.id);
    }
}
