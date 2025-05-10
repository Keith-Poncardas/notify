const minifyHTML = require('express-minify-html');

module.exports = minifyHTML({
    override: true,
    htmlMinifier: {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
    },
});