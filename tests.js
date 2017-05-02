var gulp = require('gulp');
var fs = require('fs');
var fsExtra = require('fs-extra');
var through = require('through2');
var gulpHandlebarsFileInclude = require('./index');

fsExtra.removeSync('test');

function test(test, fileSrcContents, fileDistContents, context, options){

    fsExtra.ensureDirSync('test/' + test + '/src');
    fsExtra.ensureDirSync('test/' + test + '/dist');

    fileSrcContents.forEach(function(item){
        fs.writeFileSync('test/' + test + '/src/' + item.path, item.content);
    });

    gulp.src('test/' + test + '/src/**/*')
        .pipe(gulpHandlebarsFileInclude(context, options))
        .pipe(gulp.dest('test/' + test + '/dist'))
        .pipe(through.obj(function(){

            fileDistContents.forEach(function(item){
                var content = fs.readFileSync('test/' + test + '/dist/' + item.path);
                if(content != item.content){
                    throw "Failed Test - " + test;
                }
            });}));
}

// test - 1
// testing without context
test('test1',
    [{path: 'index.html', content: 'file - 1.1<p>{{ title }}</p>'}],
    [{path: 'index.html', content: 'file - 1.1<p></p>'}]);

// test - 2
// testing with a context
test('test2',
    [{path: 'index.html', content: 'file - 1.1<p>{{ title }}</p>'}],
    [{path: 'index.html', content: 'file - 1.1<p>hello world!</p>'}],
    {
        title: 'hello world!'
    });

// test - 3
// testing fileInclude helper without context
test('test3',
    [
        {path: 'index.html', content: "file - 1.1<br>{{fileInclude 'test/test3/src/partial.html'}}"},
        {path: 'partial.html', content: "this is partial"}
    ],
    [{path: 'index.html', content: 'file - 1.1<br>this is partial'}]);

// test - 4
// testing fileInclude helper with custom context
test('test4',
    [
        {path: 'index.html', content: "test - 4<br>{{fileInclude 'test/test4/src/partial.html' name='Alex' }}"},
        {path: 'partial.html', content: "hello {{ name }}!!"}
    ],
    [{path: 'index.html', content: 'test - 4<br>hello Alex!!'}]);

// test - 5
// testing fileInclude helper with custom and global context
test('test5',
    [
        {path: 'index.html', content: "test - 5<br>{{fileInclude 'test/test5/src/partial.html' name='Alex' }}"},
        {path: 'partial.html', content: "hello {{ name }}!! welcome to {{ companyName }} company"}
    ],
    [{path: 'index.html', content: 'test - 5<br>hello Alex!! welcome to MIT company'}],
    {
        companyName: 'MIT'
    });
