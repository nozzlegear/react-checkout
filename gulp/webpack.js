"use strict"

const gulp        = require("gulp");
const path        = require("path");
const cwd         = path.resolve(process.cwd());
const gutil       = require("gulp-util");
const uglify      = require("gulp-uglify");
const webpack     = require("webpack-stream");
const gulpForEach = require("gulp-foreach");

console.log("CWD", cwd);

module.exports.task = (gulpSrc) =>
{
    return gulpSrc
        .pipe(gulpForEach((stream, file) =>
        {
            // Using gulp-foreach to modify webpack options and prevent webpack from renaming all files
            // to its rando hashes.
            
            const filepath = path.parse(file.path);
            const options = {
                resolve: {
                    root: cwd  
                },
                module: {
                    loaders: [
                        {
                            test: /\.css$/,
                            loaders: ["style", "css"]
                        },
                        {
                            test: /\.scss$/,
                            loaders: ["style", "css", "sass"]
                        },
                        {
                            test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                            loader : 'file-loader'
                        },
                        {
                            test: /\.(jpe?g|png|gif|svg)$/i,
                            loaders: [
                                'file?hash=sha512&digest=hex&name=[hash].[ext]',
                                'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                            ]
                        },
                    ]
                },
                output: {
                    filename: filepath.name + ".webpacked.min.js",
                }
            }
            
            if (filepath.name === "demos")
            {
                options.output.library = "Demo";
                options.output.libraryTarget = "var";
            }
            
            return stream
                .pipe(webpack(options))
                .pipe(uglify({mangle: true}).on("error", gutil.log))
                .pipe(gulp.dest(filepath.dir));
        }))
};

module.exports.files = ["dist/index.js", "demo/demos.js"];