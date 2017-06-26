<h1>Canvas Stuff</h1>
<p>A starting pattern for canvas animations. One for vanilla JavaScript and one for CreateJS. These don't include extra canvases or other tricks because they're intended to be (almost) blank slates.</p>

<p>I'm also going to put some basic canvas projects in here, to use as templates for larger things.</p>

<h2>Vanilla Version</h2>
<p>The vanilla version has a snowflake animation in place to use as an example for future work. It's intended for smaller animations which don't require assets to be loaded.</p>

<h2>CreateJS Version</h2>
<p>The CreateJS version has the same snowflake animation, but also has a preloader for assets. Some example images are included, and are appended to the body just to show that they loaded. I thought about building a vanilla loader, but then decided against it. If I don't want to use EasleJS, I can still use PreloadJS on its own.</p>

<h2>Inspirations:</h2>
<p>Structure inspired by:
<ul>
<li>http://viget.com/extend/2666</li>
</ul>

<p>Page Visibility API and Polyfill for vendor prefixes:</p>
<ul>
<li>http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active</li>
<li>http://www.w3.org/TR/page-visibility/</li>
<li>http://caniuse.com/#feat=pagevisibility</li>
<li>http://jsfiddle.net/0GiS0/cAG5N/</li>
</ul>
