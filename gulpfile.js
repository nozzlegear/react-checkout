"use strict";

const gulp        = require("gulp");
const chokidar    = require("chokidar");
//Tasks
const tsTask      = require("./gulp/typescript");
const sassTask    = require("./gulp/sass");
const webpackTask = require("./gulp/webpack");

gulp.task("sass", () =>
{
    return sassTask.task(gulp.src(sassTask.files));
})

gulp.task("ts", () =>
{
    return tsTask.task(gulp.src(tsTask.files));
});

gulp.task("webpack", () =>
{
    return webpackTask.task(gulp.src(webpackTask.files));
})

gulp.task("default", ["sass", "ts", "webpack"]);

gulp.task("watch", ["default"], (cb) =>
{
    // Gulp.watch in 3.x is broken, watching more files than it should. Using chokidar instead.
    // https://github.com/gulpjs/gulp/issues/651
    chokidar.watch(sassTask.files, {ignoreInitial: true}).on("all", (event, path) =>
    {
        console.log(`${event}: Sass file ${path}`);
        
        if (path.indexOf("_variables.scss") > -1)
        {
            //Recompile all sass files with updated variables.
            return sassTask.task(gulp.src(sassFiles));
        }
        
        return sassTask.task(gulp.src(path));
    })
    
    chokidar.watch(tsTask.files, {ignoreInitial: true}).on("all", (event, path) =>
    {
        console.log(`${event}: TS file ${path}`);
        
        return tsTask.task(gulp.src(path), path);
    })
})