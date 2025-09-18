#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { c } from './colors.js';
import { expandGlobs } from './glob.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get package version from package.json
 * @returns {string} The version number
 */
function getVersion() {
    try {
        const packagePath = join(__dirname, '..', 'package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
        return packageJson.version;
    } catch (error) {
        return 'unknown';
    }
}

/**
 * Display help information
 */
function showHelp() {
    const version = getVersion();
    console.log(`
${c.bold(`litest v${version}`)}

${c.dim('A simple, fast test framework inspired by Vitest')}

${c.bold('USAGE')}
  ${c.green('litest')} ${c.dim('[options]')} ${c.dim('[files...]')}

${c.bold('OPTIONS')}
  ${c.green('-h, --help')}     Show this help message
  ${c.green('-v, --version')}  Show version number
  ${c.green('--watch')}        Watch for file changes and rerun tests ${c.dim('(coming soon)')}
  ${c.green('--coverage')}     Generate coverage report ${c.dim('(coming soon)')}

${c.bold('EXAMPLES')}
  ${c.green('litest')}                    Run all tests in current directory
  ${c.green('litest test.spec.js')}      Run specific test file
  ${c.green('litest src/tests/')}        Run all tests in directory
  ${c.green('litest *.spec.js')}         Run all spec files matching pattern

${c.bold('SUPPORTED FILE PATTERNS')}
  - ${c.cyan('*.spec.js')} - Test specification files
  - ${c.cyan('*.test.js')} - Test files ${c.dim('(coming soon)')}

${c.bold('DOCUMENTATION')}
  ${c.blue('https://github.com/Alex-Werner/litest#readme')}

${c.bold('ISSUES')}
  ${c.blue('https://github.com/Alex-Werner/litest/issues')}
`);
}

/**
 * Display version information
 */
function showVersion() {
    const version = getVersion();
    console.log(`litest v${version}`);
}

/**
 * Parse command line arguments
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs(args) {
    const parsed = {
        help: false,
        version: false,
        watch: false,
        coverage: false,
        files: [],
        directories: [],
        patterns: []
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '-h':
            case '--help':
                parsed.help = true;
                break;
            case '-v':
            case '--version':
                parsed.version = true;
                break;
            case '--watch':
                parsed.watch = true;
                break;
            case '--coverage':
                parsed.coverage = true;
                break;
            default:
                if (arg.startsWith('-')) {
                    console.error(c.error(`Unknown option: ${arg}`));
                    console.error(`Run ${c.green('litest --help')} for usage information`);
                    process.exit(1);
                } else {
                    // It's a file, directory, or pattern
                    if (arg.includes('*') || arg.includes('?')) {
                        parsed.patterns.push(arg);
                    } else if (arg.endsWith('.spec.js') || arg.endsWith('.test.js')) {
                        parsed.files.push(arg);
                    } else {
                        parsed.directories.push(arg);
                    }
                }
                break;
        }
    }

    // Expand glob patterns to files
    if (parsed.patterns.length > 0) {
        const expandedFiles = expandGlobs(parsed.patterns);
        parsed.files.push(...expandedFiles);
    }

    return parsed;
}

/**
 * Handle CLI commands that don't require running tests
 * @param {Object} args - Parsed arguments
 * @returns {boolean} True if command was handled, false otherwise
 */
function handleCommands(args) {
    if (args.help) {
        showHelp();
        return true;
    }

    if (args.version) {
        showVersion();
        return true;
    }

    if (args.watch) {
        console.error(c.warn('Watch mode is not implemented yet.'));
        console.error(`Run ${c.green('litest --help')} for available options`);
        process.exit(1);
    }

    if (args.coverage) {
        console.error(c.warn('Coverage reporting is not implemented yet.'));
        console.error(`Run ${c.green('litest --help')} for available options`);
        process.exit(1);
    }

    return false;
}

export { parseArgs, handleCommands, showHelp, showVersion, getVersion };
