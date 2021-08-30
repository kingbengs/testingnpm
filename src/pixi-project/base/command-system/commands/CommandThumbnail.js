export default class CommandThumbnail {

    constructor(object, thumbnailURL, useThumbnail, thumbnail) {
        this.object = object;

        this.previousThumbnail = object.thumbnail;
        this.previousUseThumbnail = object.useThumbnail;
        this.previousThumbnailURL = object.thumbnailURL;

        // previous content texture
        this.previousContentTexture = object.content.texture;

        this.newThumbnailURL = thumbnailURL;
        this.newUseThumbnail = useThumbnail;
        this.newThumbnail = thumbnail;

        this.isExecuted = false;
    }

    execute() {
        if (!this.isExecuted) {
            this.object.useThumbnail = this.newUseThumbnail;
            this.object.thumbnailURL = this.newThumbnailURL;
            this.object.setThumbnailSprite(this.newThumbnail);

            window.app.needsRendering();
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
