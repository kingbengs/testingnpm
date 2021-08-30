/**
 * Remove and element from array
 */
Object.defineProperty(Array.prototype, "removeElement", {
    enumerable: false,
    value: function (itemToRemove) {
        let removeCounter = 0;
        for (let index = 0; index < this.length; index++) {
            if (this[index] === itemToRemove) {
                this.splice(index, 1);
                removeCounter++;
                index--;
            }
        }
        return removeCounter;
    }
});

/**
 * Alias to removeElement
 */
Object.defineProperty(Array.prototype, "removeObject",{
    enumerable: false,
    value: Array.prototype.removeElement
});