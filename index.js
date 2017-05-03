
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs');
var gulp = require('gulp');

// const
const PLUGIN_NAME = 'gulp-handlebars-file-include';

// gulp-handlebars-file-include plugin
module.exports = function (defaultContext, options) {

    // set default options
    options = options || {};
    defaultContext = defaultContext || {};
    options.handlebarsHelpers = options.handlebarsHelpers || [];  // [{name: string, fn: handlebar_helper_function}]
    options.extensions = options.extensions || ['.html', '.hbs', '.hb', '.handlebars'];
    options.maxRecursion = options.maxRecursion || 10;

    // register helpers
    options.handlebarsHelpers.forEach(function(item){
        handlebars.registerHelper(item.name, item.fn);
    });
    handlebars.registerHelper(
        'fileInclude',
        fileInclude(options.rootPath || null, options.extensions, defaultContext, options.maxRecursion));

    // creating a stream through which each file will pass
    return through.obj(function(file, enc, cb) {

        // empty file
        if (file.isNull()) {
            return cb(null, file);
        }

        // buffer file
        if (file.isBuffer()) {
            file.contents = new Buffer(handlebars.compile(file.contents.toString())(defaultContext));
        }

        // stream file
        if (file.isStream()) {
            var stream = through();
            stream.write(handlebars.compile(file.contents.toString())(defaultContext));
            file.contents = stream;
        }

        cb(null, file);
    });
};



// get a handlebar helper method, used to include the content of external files
// it receive the file path string to include and a context object used to compile the file with handlebar
function fileInclude(rootPath, extensions, globalContext, MAX_RECURSION){

    // to control file include recursion
    var recursion = {};

    // return handlebar helper method
    return function(file, options) {

        var context = {};
        extendObject(context, globalContext);
        extendObject(context, options.hash);

        // resolve file path
        var filePath = resolvePath(file, rootPath, extensions);
        if(!filePath){
            throw new PluginError(PLUGIN_NAME, "File not found: '" + file + "'");
        }

        // check file recursion
        recursion[filePath] = (recursion[filePath] || 0) + 1;
        if(recursion[filePath] > MAX_RECURSION){
            throw new PluginError(PLUGIN_NAME, "Max recursion on file '" + filePath + "'");
        }

        // compile file and return result
        var fileContent = fs.readFileSync(filePath);
        return handlebars.compile(fileContent.toString())(context);
    }
}

// get the absolute filePath of file. this search a valid file from rootPath including extensions
function resolvePath(file, rootPath, extensions){

    var filePath = resolvePathExtensions(path.resolve(__dirname, rootPath || '', file), extensions);
    if(!filePath && rootPath){
        filePath = resolvePathExtensions(path.resolve(__dirname, file), extensions);
    }
    return filePath;
}

// get an existed file resolved with a provided extensions
function resolvePathExtensions(file, extensions){
    extensions = [''].concat(extensions);
    for(var i = 0; i < extensions.length; i++){
        var result = file + extensions[i];
        if(fs.existsSync(result)){
            return result;
        }
    }
}

function extendObject(obj1, obj2){
    for(var id in obj2){
        obj1[id] = obj2[id];
    }
}