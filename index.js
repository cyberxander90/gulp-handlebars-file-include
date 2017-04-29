
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs');

// const
const PLUGIN_NAME = 'gulp-handlebars-file-include';

// gulp-handlebars-file-include plugin
module.exports = function gulpHandlebarsFileInclude(defaultContext, options) {

    // set default options
    options = options || {};
    defaultContext = defaultContext || {};
    options.handlebarsHepler = options.handlebarsHepler || [];
    // [{name: <string>, fn: <function(file, context, options) => string>}]

    // create fileInclude helper
    options.handlebarsHepler.push({
        name: 'fileInclude',
        fn: function(file, context, options) {

            // resolve file path
            var filePath = path.resolve(__dirname, file);

            // compile file and return result
            var fileContent = fs.readFileSync(filePath);
            return handlebars.compile(fileContent)(context);
        }
    });

    // register helpers
    options.handlebarsHepler.forEach(function(item){
        handlebars.registerHelper(item.name, item.fn);
    });

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