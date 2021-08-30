export default class CommandContentIcon {

    constructor(object, pathUrl) {
        this.object = object;

        this.previousThumbnail = object.thumbnail;
        this.previousUseThumbnail = object.useThumbnail;
        this.previousThumbnailURL = object.thumbnailURL;

        // previous content texture
        this.previousContentTexture = object.content.texture;
        
        this.pathUrl = pathUrl;

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {

            this.object.removeThumbnail();
            this.object.texturePath = this.pathUrl;
            this.object.content.setTexture(this.pathUrl);
            window.app.needsRendering()

            this.isExecuted = true;
        }
    }

    revert() {
        if (this.isExecuted) {

            this.object.useThumbnail = this.previousUseThumbnail;
            this.object.thumbnailURL = this.previousThumbnailURL;

            if (this.previousUseThumbnail) {
                this.object.setThumbnailSprite(this.previousThumbnail);
            } else {
                this.object.content.removeChildren();
                this.object.content.texture = this.previousContentTexture;
            }

            window.app.needsRendering();
            this.isExecuted = false;
        }
    }

}
