export const isMouseWheelButton = (event) => {
    return event.data?.originalEvent?.which === 2 || event.which === 2;
}

export const isRightButton = (event) => {
    return event.data?.originalEvent?.which === 3 || event.which === 3;
}

export const isShiftKey = (event) => {
    return event.shiftKey;
}

export const isCtrlKey = (event) => {
    let kc = event.keyCode;
    if (kc === 17 || kc === 224 || kc === 91 || kc === 92 || kc === 93) {
        return true;
    }
    return false;
}

export const isEscapeKey = (event) => {
    return event.key === 'Escape' || event.code === 'Escape';
}

export const isSpaceKey = (event) => {
    return event.keyCode === 32 || event.code === 'Space';
}

export const isKeyC = (event) => {
    return event.keyCode === 67 || event.code === 'KeyC';
}

export const isKeyD = (event) => {
    return event.keyCode === 68 || event.code === 'KeyD';
}

export const isKeyV = (event) => {
    return event.keyCode === 86 || event.code === 'KeyV';
}

export const isKeyZ = (event) => {
    return event.keyCode === 90 || event.code === 'KeyZ';
}

export const isKeyY = (event) => {
    return event.keyCode === 89 || event.code === 'KeyY';
}

export const isKeyPlus = (event) => {
    // Because the + key is behind the = key in windows 
    return event.key === '+' || event.key === '=' || event.code === 'Equal' || event.code === 'NumpadAdd';
}

export const isKeyMinus = (event) => {
    return event.key === '-' || event.code === 'Minus' || event.code === 'NumpadSubtract';
}

export const isKeyZero = (event) => {
    return event.key === '0' || event.code === 'Numpad0' || event.code === 'Digit0';
}

export const isDelete = (event) => {
    const key = event.key; // const {key} = event; ES6+
    if (key === "Backspace" || key === "Delete") {
        return true;
    }
}

export const commonSendEventFunction = (eventType, detailObj) => {
    const event = new CustomEvent(eventType, { detail: detailObj });
    document.dispatchEvent(event);
}

/**
 * Source: https://stackoverflow.com/questions/15762768/javascript-math-round-to-two-decimal-places 
 * @param {Number} number 
 * @param {int} digits Default value is 0
 * @returns String representation of the rounded number 
 */
export const roundTo = (number, digits = 0) => {
    let negative = false;
    if (number < 0) {
        negative = true;
        number = number * -1;
    }
    let multiplicator = Math.pow(10, digits);
    number = parseFloat((number * multiplicator).toFixed(11));
    number = (Math.round(number) / multiplicator).toFixed(digits);
    if (negative) {
        number = (number * -1).toFixed(digits);
    }
    return Number(number);
};

/**
 * Takes a number and concatenates a % string at the end
 * @param {Number} number any number 
 * @param {Integer} digits it defaults to 2 decimal places
 * @returns String with a % sign at the end
 */
export const toPercent = (number, digits = 2) => {
    if (number > 0) {
        return `+${roundTo(number, digits)}%`;
    } else {
        return `${roundTo(number, digits)}%`;
    }
}

export const isEnterKey = (key) => {
    return key === 'Enter';
};

export const goToURL = (link) => {
    return window.open(
        link,
        '_blank'
    );
};

export const getMousePosition = () => {
    return window.app.renderer.plugins.interaction.mouse.global || { x: 0, y: 0 };
};

/**
 * Deep clone an object data without cloning the methods
 * @param {Object} object 
 * @returns cloned data object
 */
export const cloneData = (object) => {
    return JSON.parse(JSON.stringify(object));
};
