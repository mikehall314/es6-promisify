module.exports = {
    comments: false,
    presets: [
        [
            "@babel/preset-env",
            {
                modules: "cjs",
                targets: {
                    node: "6",
                    browsers: ["> 0.25%", "not dead"],
                },
            },
        ],
        "minify",
    ],
};
