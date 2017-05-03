# gulp-handlebars-file-include

Gulp plugin for create html templates in a simpler way.
A very common problem when developers create html templates for a site, is the amount of repeated html code. 
This module resolve that problem allowing you define a repeated section of code in a separated file, for later invoke it in the final file. Much better still, this allow build semantic templates with [handlebars](http://handlebarsjs.com/).


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

src/button.html
```html
<button class="btn simple-btn">
    click me
<button>
```

Then you can use the _button_ in another file, for example

src/index.html
```html
<h1>Hello World!!</h1>
<p>this is the content of the page</p>
{{ fileInclude 'src/button.html' }}
```

and you get as result

dist/index.html
```html
<h1>Hello World!!</h1>
<p>this is the content of the page</p>
<button class="btn simple-btn">
    click me
<button>
```

Let say you want to add an icon image to the buttons, the only thing you need to do is change your _button.html_ file, for example.

src/button.html
```html
<button class="btn simple-btn">
    <img src="main.png"/>
    click me
<button>
```

But you can even improve the behavior of your button and allow set its image and text when it is used, for example

src/button.html
```html
<button class="btn simple-btn">
    <img src="{{ image || 'main.png' }}"/>
    {{ text || 'click me' }}
<button>
```

here we say to button set the _image_ and _text_ context property if those values are supplied, if not, set the '_main.png_' and '_click me_' values respectively.
Then in your index.html you can say

src/index.html
```html
<h1>Hello World!!</h1>
<p>this is the content of the page</p>
{{ fileInclude 'src/button.html' image='bird.jpg' text='buy birds' }}
```

and as you can suppouse the result is

dist/index.html
```html
<h1>Hello World!!</h1>
<p>this is the content of the page</p>
<button class="btn simple-btn">
    <img src="bird.jpg"/>
    buy birds
<button>
```



## API
gulpHandlebarsFileInclude(**globalContext**, **options**)

* **globalContext**
`object` used as a default context for all templates.
This can be useful if you want to set, for example, the same footer message for all indexes page.

* **options**
`object` with the following properties

    - **rootPath**
`string`, or `string[]` used to set where the compiler search for files to include.
This is useful to take you away to define the whole path of the file to include.
If the compiler can't find a file in the rootPath, then is search as normal absolute file.

    - **extensions**
`string[]` to set the valid file extensions in which the compiler search the files. 
This allow to declare a file to include without extensions.
Default is `['.html', '.hbs', '.hb', '.handlebars']`.

    - **maxRecursion**
`int` used to restrict the maximum amount of times in which a file can include it-self. 
This is used to stop infinite recursion of the same file.
Default value is 10.

    - **ignoreFiles**
`function(string) => boolean` that receive a filePath of the current file to compile and return boolean to indicate if you want generate the file in dist.
That is useful to avoid generate files of _partial_ or _components_ templates.
For example, maybe all your _partial_ files are in _src/partials_, then you can check the path of the file to generate and decide if it is generated or not.

    - **handlebarsHelpers**
`{name: <string>, fn: function}[]`
Array of Objects with the properties _name_ of `string` and _fn_ of `function`.
This is used to include custom helpers to the handlebars compiler.
