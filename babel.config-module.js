module.exports = {
    comments: false,
    presets: [
        [
            "@babel/preset-env",
            {
                modules: false,
                targets: {
                    esmodules: true,
                },
            },
        ],
        "minify",
    ],
};
