#Canvas Starter
A starting pattern for canvas animations. One for vanilla JavaScript and one for CreateJS. These don't include extra canvases or other tricks because they're intended to be (almost) blank slates.

##Vanilla Version
The vanilla version has a snowflake animation in place to use as an example for future work. It's intended for smaller animations which don't require assets to be loaded.

##CreateJS Version
The CreateJS version has the same snowflake animation, but also has a preloader for assets. Some example images are included, and are appended to the body just to show that they loaded. I thought about building a vanilla loader, but then decided against it. If I don't want to use EasleJS, I can still use PreloadJS on its own.

##Inspirations:
Structure inspired by:
* http://viget.com/extend/2666

Page Visibility API and Polyfill for vendor prefixes:
* http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
* http://www.w3.org/TR/page-visibility/
* http://caniuse.com/#feat=pagevisibility
* http://jsfiddle.net/0GiS0/cAG5N/

