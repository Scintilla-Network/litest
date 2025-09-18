/**
 * Terminal color utilities - no dependencies
 * Provides ANSI color codes for terminal output
 */

const colors = {
    // Reset
    reset: '\x1b[0m',
    
    // Text colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    // Bright text colors
    brightBlack: '\x1b[90m',
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m',
    
    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
    
    // Text styles
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    strikethrough: '\x1b[9m'
};

/**
 * Check if colors should be disabled
 * @returns {boolean}
 */
function shouldDisableColors() {
    return process.env.NO_COLOR || 
           process.env.NODE_ENV === 'test' ||
           !process.stdout.isTTY;
}

/**
 * Apply color to text
 * @param {string} text - The text to color
 * @param {string} color - The color code
 * @returns {string} Colored text or plain text if colors are disabled
 */
function colorize(text, color) {
    if (shouldDisableColors()) {
        return text;
    }
    return color + text + colors.reset;
}

/**
 * Color utility functions
 */
const c = {
    // Success/positive
    success: (text) => colorize(text, colors.green),
    pass: (text) => colorize(text, colors.green),
    
    // Error/negative  
    error: (text) => colorize(text, colors.red),
    fail: (text) => colorize(text, colors.red),
    
    // Warning
    warning: (text) => colorize(text, colors.yellow),
    warn: (text) => colorize(text, colors.yellow),
    
    // Info
    info: (text) => colorize(text, colors.blue),
    
    // Neutral/secondary
    muted: (text) => colorize(text, colors.brightBlack),
    dim: (text) => colorize(text, colors.dim),
    
    // Emphasis
    bold: (text) => colorize(text, colors.bold),
    
    // Skip/pending
    skip: (text) => colorize(text, colors.cyan),
    
    // File paths
    path: (text) => colorize(text, colors.brightBlue),
    
    // Numbers/stats
    number: (text) => colorize(text, colors.brightMagenta),
    
    // Time
    time: (text) => colorize(text, colors.brightBlack),
    
    // Custom colors
    red: (text) => colorize(text, colors.red),
    green: (text) => colorize(text, colors.green),
    yellow: (text) => colorize(text, colors.yellow),
    blue: (text) => colorize(text, colors.blue),
    magenta: (text) => colorize(text, colors.magenta),
    cyan: (text) => colorize(text, colors.cyan),
    white: (text) => colorize(text, colors.white),
    brightGreen: (text) => colorize(text, colors.brightGreen),
    brightRed: (text) => colorize(text, colors.brightRed),
    brightYellow: (text) => colorize(text, colors.brightYellow),
    brightBlue: (text) => colorize(text, colors.brightBlue),
    brightMagenta: (text) => colorize(text, colors.brightMagenta),
    brightCyan: (text) => colorize(text, colors.brightCyan),
    brightBlack: (text) => colorize(text, colors.brightBlack)
};

/**
 * Create a colored symbol with text
 * @param {string} symbol - The symbol
 * @param {string} text - The text
 * @param {string} symbolColor - Color for the symbol
 * @param {string} textColor - Color for the text (optional)
 * @returns {string}
 */
function colorSymbol(symbol, text, symbolColor, textColor = null) {
    const coloredSymbol = colorize(symbol, symbolColor);
    const coloredText = textColor ? colorize(text, textColor) : text;
    return `${coloredSymbol} ${coloredText}`;
}

export { colors, c, colorize, colorSymbol, shouldDisableColors };
