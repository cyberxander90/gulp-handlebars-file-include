# gulp-handlebars-file-include

Gulp plugin for create html templates in a simpler way.<br/>
A very common problem when developers create html templates for a site, is the amount of repeated html code. <br/>
This module resolve that problem allowing you define a sections of code in separated files, for later invoke it. Much better still, this allow you build semantic templates with [handlebars](http://handlebarsjs.com/).


## Installation

```sh
$ npm install gulp-handlebars-file-include
```

## Basic Usage

### Configure gulp-handlebars-file-include in your gulp file

gulp.js
```javascript
var gulpHandlebarsFileInclude = require('gulp-handlebars-file-include');

gulp.src('src/**/*')
    .pipe(gulpHandlebarsFileInclude())
    .pipe(gulp.dest('dist'))
```

### Example
Let say we create a file to represent a _button_

_src/button.html_
```html
<button class="btn simple-btn">
    click me
</button>
```


Then you can use the _button_ in another file, for example

_src/index.html_
```html
<h1>Hello World!!</h1>
<p>this is the content of the page</p>
{{ fileInclude 'src/button' }}
```
(Note the use of `fileInclude` helper)
and you get as result

dist/index.html
```html
<h1>Hello World!!</h1>
<p>this is the content of the page</p>
<button class="btn simple-btn">
    click me
</button>
```


Let say you want to add an icon image to the buttons, the only thing you need to do is change your _button.html_ file, for example.

_src/button.html_
```html
<button class="btn simple-btn">
    <img src="main.png"/>
    click me
</button>
```


But you can even improve the behavior of your button and allow set its image and text when it is used, for example

_src/button.html_
```html
<button class="btn simple-btn">
    {{#if image}}
    <img src="{{ image }}"/>
    {{else}}
    <img src="main.jpg"/>
    {{/if}}
    
    {{#if text}}
    {{text}}
    {{else}}
    click me
    {{/if}}
</button>
```


here we say to button set the _image_ and _text_ context property if those values are supplied, if not, set the '_main.png_' and '_click me_' values respectively.
Then in your index.html you can say

_src/index.html_
```html
<h1>Hello World!!</h1>
<p>this is the content of the page</p>
{{ fileInclude 'src/button.html' image='bird.jpg' text='buy birds' }}
```


and as you can suppose the result is

_dist/index.html_
```html
<h1>Hello World!!</h1>
<p>this is the content of the page</p>
<button class="btn simple-btn">
    <img src="bird.jpg"/>
    buy birds
<button>
```


even better, you can use the `eval` helper (provided with this module) to evaluate an expression on fly, that will reduce your button.html file to this:

_src/button.html_
```html
<button class="btn simple-btn">
    <img src="{{eval "this.image || 'main.jpg'" }}"/>
    {{eval "this.text || 'click me'"}}
</button>
```

Note that this helper receive a `string` expression to evaluate, and you access to context parameters with `this` keyword. 



## Handlebars Helpers
* **fileInclude**
This helper receive the path as `string`, of an external file used to compile with handlebars and included the compiled result.<br/>
You can pass parameters used to compile the external file in the way **arg1=value1 arg2=value2 ...**

* **eval**
This helper receive an expression as `string`, this expression is evaluated and return its result.<br/>
You can access to context properties in the expression, using the **this** keyword


## API
gulpHandlebarsFileInclude(**globalContext**, **options**)

* **globalContext**
`object` used as a default context for all templates.<br/>
This can be useful if you want to set, for example, the same footer message for all indexes page.


* **options**
`object` with the following properties

    - **rootPath**<br/>
`string`, or `string[]` used to set where the compiler search for files to include.<br/>
This is useful to take you away to define the whole path of the file to include.<br/>
If the compiler can't find a file in the rootPath, then is search as normal absolute file path.

    - **extensions**<br/>
`string[]` to set the valid file extensions in which the compiler search the files.<br/>
This allow to declare a file to include without extensions.<br/>
Default is `['.html', '.hbs', '.hb', '.handlebars']`.

    - **maxRecursion**<br/>
`int` used to restrict the maximum amount of times in which a file can include it-self.<br/>
This is used to stop infinite recursion of the included file.<br/>
Default value is 10.

    - **ignoreFiles**<br/>
`function(string) => boolean` that receive a filePath of the current file to compile and return boolean to indicate if you want generate the file in dist.<br/>
That is useful to avoid generate files of _partial_ templates.<br/>
For example, maybe all your _partial_ files are in _src/partials_, then you can check the path of file to generete and ignore from _src/partials_ with 
    ```javascript
        function(filePath){
            console.log(filePath)
            return filePath.startsWith(path.resolve(__dirname, 'src/partials'));
        }
    ```

    - **handlebarsHelpers**<br/>
`{name: <string>, fn: function}[]`<br/>
Array of Objects with the properties _name_ of `string` and _fn_ of `function`.<br/>
This is used to include custom helpers to the handlebars compiler.
