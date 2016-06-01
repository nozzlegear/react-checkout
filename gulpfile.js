"use strict";

const seq         = require("gulp-sequence");
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

gulp.task("ts:demo", () =>
{
    return tsTask.task(gulp.src("demo/demos.tsx"), "demo/demos.tsx");
})

gulp.task("ts:lib", () =>
{
    return tsTask.task(gulp.src(tsTask.files));
})

gulp.task("ts", ["ts:lib", "ts:demo"]);

gulp.task("webpack", () =>
{
    return webpackTask.task(gulp.src(webpackTask.files));
})

gulp.task("default", seq("sass", "ts", "webpack"));

gulp.task("watch", ["default"], (cb) =>
{
    // Gulp.watch in 3.x is broken, watching more files than it should. Using chokidar instead.
    // https://github.com/gulpjs/gulp/issues/651
    chokidar.watch(sassTask.files, {ignoreInitial: true}).on("all", (event, path) =>
    {
        console.log(`${event}: Sass file ${path}`);
        
        const webpack = () => webpackTask.task(gulp.src("demo/demos.js"));
        
        if (path.indexOf("_variables.scss") > -1)
        {
            //Recompile all sass files with updated variables.
            return seq(sassTask.task(gulp.src(sassTask.files)), webpack());
        }
        
        return seq(sassTask.task(gulp.src(path)), webpack());
    })
    
    chokidar.watch(["demo/demos.tsx"].concat(tsTask.files), {ignoreInitial: true}).on("all", (event, path) =>
    {
        console.log(`${event}: TS file ${path}`);
        
        const build = seq(tsTask.task(gulp.src(path), path), webpackTask.task(gulp.src("demo/demos.js")));
        
        if (path === "index.ts")
        {
            return seq(build, webpackTask.task(gulp.src("dist/index.js")))
        }
        
        return build; 
    })
})