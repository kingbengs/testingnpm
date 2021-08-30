// define base colors first
const COLOR_DARK_BLUE_GRAY = 0x1E2531;
const COLOR_WHITE = 0xffffff;
const COLOR_BLACK = 0x000000;
const COLOR_PURPLE = 0x540566;
const COLOR_LIGHT_GRAY_BLUE = 0xf0f2f7; // light gray color that its hue its shifted towards blue just a little bit
const COLOR_LIGHT_GRAY_BLUE_2 = 0xE4E6EA; // slightly darker then the first one
const COLOR_LIGHT_GRAY_BLUE_3 = 0xE2E2E5; // even more dark
const COLOR_TIRKIZ = 0x007acc;
const COLOR_MAGENTA = 0xD64E82;
const COLOR_DARK_GRAY_BLUE = 0x26272E; // hue shifted towards blue just a little bit
const COLOR_BLUE = 0x934CFF;
const COLOR_BLUE_TURQUOISE = 0x009BF3;
const COLOR_RED = 0xF43B46; 
const COLOR_GREEN = 0x0ED073;
const COLOR_GRAY = 0x4A5468;
const COLOR_ORANGE = 0xfeb663;

// define font size
const FONT_SIZE_NORMAL = 18;
const FONT_SIZE_HEADING = 26;

// define font family
const FONT_ROBOTO = 'Roboto';

// export specific element coloring
export const COLOR_LABEL_DEFAULT = COLOR_BLACK;
export const COLOR_LABEL_HIGHLIGHTED = COLOR_DARK_GRAY_BLUE;
export const COLOR_SELECTION = COLOR_MAGENTA;
export const COLOR_MULTIPLE_SELECTION_RECTANGLE = COLOR_LIGHT_GRAY_BLUE_3;
export const COLOR_SHAPE_LINE = COLOR_DARK_BLUE_GRAY;
export const COLOR_SHAPE_FILL = COLOR_WHITE;
export const COLOR_CONNECTION_LINE = COLOR_TIRKIZ;
export const COLOR_BACKGROUND = COLOR_LIGHT_GRAY_BLUE;
export const COLOR_MESH_BACKGROUND = COLOR_LIGHT_GRAY_BLUE;
export const COLOR_MESH_LINE = COLOR_LIGHT_GRAY_BLUE_2;
export const COLOR_SHAPE_INVALID = COLOR_RED;
export const COLOR_COMPARE_HITS = COLOR_BLUE;
export const COLOR_COMPARE_PERCENT_POSITIVE = COLOR_GREEN;
export const COLOR_COMPARE_PERCENT_NEGATIVE = COLOR_RED;
export const COLOR_COMPARE_LABEL = COLOR_GRAY;
export const COLOR_COMPARE_VALUE = COLOR_BLACK;
export const COLOR_STEP_FOCUSED = COLOR_BLUE_TURQUOISE;
export const COLOR_ELEMENT_HIGHLIGHT_FRAME = COLOR_ORANGE;
export const COLOR_ALIGNMENT_GUIDE = COLOR_BLUE_TURQUOISE;

export const OPACITY_INVALID_SHAPE = 0.4;

export const SELECTION_ROUND_CORNER = 5;
export const SELECTION_BOUNDARY_GAP = 10;
export const SELECTION_PADDING = 15;

export const FOOTER_MARGIN = 15;
export const TITLE_MARGIN = 20;

export default class Styles {

    static FOOTER_LABEL = {
        fontName: FONT_ROBOTO,
        fontSize: FONT_SIZE_NORMAL,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 320,
        breakWords: true,
        miterLimit: 0,
        whiteSpace: 'normal',
    };

    static TITLE_LABEL = {
        fontName: FONT_ROBOTO,
        fontSize: FONT_SIZE_NORMAL,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 320,
        breakWords: true,
        miterLimit: 0,
        whiteSpace: 'normal',
    }

    static TEXT_OBJECT = {
        input: {
            fontSize: `${FONT_SIZE_HEADING}px`,
            fontFamily: FONT_ROBOTO,
            color: COLOR_LABEL_HIGHLIGHTED,
            multiline: true,
            wordWrap: false,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
    };

}
