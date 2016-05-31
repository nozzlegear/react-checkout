"use strict";

const ts           = require("gulp-typescript");
const gulp         = require("gulp");
const path         = require("path");
const merge        = require("merge2");
const gutil        = require("gulp-util");
const lodash       = require("lodash");
const gulpIf       = require("gulp-if");
const rename       = require("gulp-rename");
const process      = require("process");
const gulpCallback = require("gulp-callback");
const cwd          = path.resolve(process.cwd()).toLowerCase();

const findTsDir = (outputPath, isSingleFilePath) =>
{
    if (!isSingleFilePath) return path.resolve(cwd, outputPath);
    
    let singlePath = path.resolve(path.parse(outputPath).dir).toLowerCase();
    
    if (singlePath === cwd)
    {
        //If the file was in the root folder, send it to the bin root
        return path.resolve(cwd, "bin");
    }
    
    singlePath = singlePath.split(cwd)[1]; 
    
    // Support multiple source directories:
    const patterns = [
        {
            startsWith: "modules",
            replaceWith: `bin${path.sep}modules`  
        },
        {
            startsWith: "routes",
            replaceWith: `bin${path.sep}routes`
        },
        {
            startsWith: "views",
            replaceWith: `bin${path.sep}views`
        },
        {
            startsWith: "js",
            replaceWith: `wwwroot${path.sep}js`,
        }
    ]
    
    const pattern = lodash.find(patterns, p => singlePath.startsWith(p.startsWith) || singlePath.startsWith(`${path.sep}${p.startsWith}`));
    
    if (!pattern)
    {
        const message = `Failed to find target dir for TS file ${outputPath}. No matching patterns.`;
        
        gutil.beep();
        console.error(message);
        
        throw new Error(message);
    }
    
    singlePath = singlePath.replace(pattern.startsWith, pattern.replaceWith);

    return path.resolve(path.join(cwd, singlePath)); 
}

const tsTask = (gulpSrc, singleFileSrcPath) =>
{
    const outputPath = findTsDir(singleFileSrcPath || "dist", !!singleFileSrcPath);
    const project = ts.createProject(path.resolve(cwd, "tsconfig.json"));
    const removeDir = () => rename(path => {
        //Single files need their directories replaced, else they'll output in "folder/1/2/1/2" instead of "folder/1/2"
        path.dirname = "";
    });
    
    const build = gulpSrc.pipe(ts(project));
    
    const js = build
        .js
        .pipe(gulpIf(!!singleFileSrcPath, removeDir()))
        .pipe(gulp.dest(outputPath)) 
        
    const def = build
        .dts
        .pipe(gulpIf(!!singleFileSrcPath, removeDir()))
        .pipe(gulp.dest(outputPath));
        
    return merge(js, def);
}

module.exports.task  = tsTask;
module.exports.files = ["./index.ts", "./data/**/*.ts", "./modules/**/*.{ts,tsx}"];