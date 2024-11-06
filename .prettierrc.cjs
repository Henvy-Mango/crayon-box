/** @type {import("prettier").Config} */
module.exports = {
    singleQuote: true,
    semi: false,
    trailingComma: 'es5',
    tabWidth: 4,
    endOfLine: 'auto',
    printWidth: 120,
    bracketSpacing: true,
    overrides: [
        {
            files: ['*.md', 'package(-lock)?.json', '*.ya?ml'],
            options: {
                singleQuote: false,
                tabWidth: 2,
            },
        },
    ],
}
