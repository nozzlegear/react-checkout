"use strict"

const gulp        = require("gulp");
const path        = require("path");
const cwd         = path.resolve(__dirname);
const gutil       = require("gulp-util");
const uglify      = require("gulp-uglify");
const webpack     = require("webpack-stream");
const gulpForEach = require("gulp-foreach");

module.exports.task = (gulpSrc) =>
{
    return gulpSrc
        .pipe(gulpForEach((stream, file) =>
        {
            // Using gulp-foreach to modify webpack options and prevent webpack from renaming all files
            // to its rando hashes.
            
            const filepath = path.parse(file.path);
            const options = {
                module: {
                    loaders: [
                        {
                            test: /\.css$/,
                            loaders: ["style", "css"]
                        },
                        {
                            test: /\.scss$/,
                            loaders: ["style", "css", "sass"]
                        }
                    ]
                },
                output: {
                    filename: filepath.name + ".webpacked.min.js",
                }
            }
            
            return stream
                .pipe(webpack(options))
                .pipe(uglify({mangle: true}).on("error", gutil.log))
                .pipe(gulp.dest(filepath.dir));
        }))
};

module.exports.files = ["dist/index.js"];