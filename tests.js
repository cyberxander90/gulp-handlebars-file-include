
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
        fsExtra.ensureFileSync('test/' + test + '/src/' + item.path);
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
function test1(){
    test('test1',
        [{path: 'index.html', content: 'file - 1.1<p>{{ title }}</p>'}],
        [{path: 'index.html', content: 'file - 1.1<p></p>'}]);
}

// test - 2
// testing with a context
function test2(){
    test('test2',
        [{path: 'index.html', content: 'file - 1.1<p>{{ title }}</p>'}],
        [{path: 'index.html', content: 'file - 1.1<p>hello world!</p>'}],
        {
            title: 'hello world!'
        });
}

// test - 3
// testing fileInclude helper without context
function test3(){
    test('test3',
        [
            {path: 'index.html', content: "file - 1.1<br>{{fileInclude 'test/test3/src/partial.html'}}"},
            {path: 'partial.html', content: "this is partial"}
        ],
        [{path: 'index.html', content: 'file - 1.1<br>this is partial'}]);
}

// test - 4
// testing fileInclude helper with custom context
function test4(){
    test('test4',
        [
            {path: 'index.html', content: "test - 4<br>{{fileInclude 'test/test4/src/partial.html' name='Alex' }}"},
            {path: 'partial.html', content: "hello {{ name }}!!"}
        ],
        [{path: 'index.html', content: 'test - 4<br>hello Alex!!'}]);
}

// test - 5
// testing fileInclude helper with custom and global context
function test5(){
    test('test5',
        [
            {path: 'index.html', content: "test - 5<br>{{fileInclude 'test/test5/src/partial.html' name='Alex' }}"},
            {path: 'partial.html', content: "hello {{ name }}!! welcome to {{ companyName }} company"}
        ],
        [{path: 'index.html', content: 'test - 5<br>hello Alex!! welcome to MIT company'}],
        {
            companyName: 'MIT'
        });
}

// test - 6
// testing fileInclude helper with rootPath
function test6(){
    test('test6',
        [
            {path: 'index.html', content: "test - 6<br>{{fileInclude 'partial.html'}}"},
            {path: 'partial.html', content: "this is partial"}
        ],
        [{path: 'index.html', content: 'test - 6<br>this is partial'}],
        null, {
            rootPath: 'test/test6/src/'
        });
}

// test - 7
// testing fileInclude helper with rootPath - 2
function test7(){
    test('test7',
        [
            {path: 'index.html', content: "test - 7<br>{{fileInclude 'partial.html'}}"},
            {path: 'partials/partial.html', content: "this is partial"}
        ],
        [{path: 'index.html', content: 'test - 7<br>this is partial'}],
        null, {
            rootPath: 'test/test7/src/partials'
        });
}

// test - 8
// testing fileInclude helper with rootPath without extension
function test8(){
    test('test8',
        [
            {path: 'index.html', content: "test - 8<br>{{fileInclude 'partial2'}}"},
            {path: 'partial.html', content: "this is partial"}
        ],
        [{path: 'index.html', content: 'test - 8<br>this is partial'}],
        null, {
            rootPath: 'test/test8/src/'
        });
}


//test1();
//test2();
//test3();
//test4();
//test5();
//test6();
//test7();
test8();
