# ST3 Voter Guide

## Build Setup

This project utilizes the Grunt build tool. I've quickly added it as a script/dependency to streamline the npm run workflow.

```
# install dependencies
npm install

# build project directory
npm run build
```

## Project Structure

```
/data - contains json files for populating the visuals
    sources.sheet.json
    stages.sheet.json - Critcal JSON file for reading content into "stages" of scrolling
    uses.sheet.json
/src
    /assets
        /animation - contains assets specific to that awesome train animation
        ...
        various Seattle Times logo assets
        ...
        ST3.svg - critcal scalar vector graphics file for performing animation
    /css
        animation.less - critical for actually creating the layout of the scrolling session
        bars.less - styles the bar charts following the scroll section
        flexbox.less - abstraction to improve css positioning
        map.less - another critical file for coding specific sections of the map
        seed.less - main css file
        values.less - variables for less preprocessor
    /js
        /lib
            colors.js - ST colors
            debounce.js - controls scrolling animation
            qsa.js - not sure, seems like a weird jQuery fix to something
        calculator.js - interactive logic for calculator
        main.js
    index.html
/tasks - various Grunt tasks
    ...
    ...
Gruntfile.js - "registers" all available tasks for the project
package.json
project.json
README.md
```

## Creating the SVG

It seems like the SVG itself is fairly well structured, which is will make the `activated` CSS style functional when we want to dynamically change the stage as we scroll.

Each "layer" has an id and the content of each of the sections is enclosed in opening `<g>` and `</g>` closing tags.

**`ST3.svg`**
```
...
<g id="Redmond">
    <polyline class="cls-19" points="12, 13, 14, ..."/>
    <g>
      <circle class="cls-3" cx="450" cy="275.43" r="3.98"/>
      <path class="cls-4" d="M554.34,306.77a3.23" transform="translate(-104.33 -34.57)"/>
    </g>
    <text class="cls-7" transform="translate(467.83 288.9)">Southeast<tspan x="0" y="10">Redmond</tspan></text>
    <text class="cls-7" transform="translate(453.83 258.4)">Downtown<tspan x="0" y="10">Redmond</tspan></text>
</g>
<g id="Ballard">
    <polyline class="cls-19" points="15, 16, 17, ..."/>
    <g>
      <circle class="cls-3" cx="263.41" cy="397.33" r="3.98"/>
      <path class="cls-4" d="M367.75,428.67a3.23,3.23,0," transform="translate(-104.33 -34.57)"/>
    </g>
    ...
</g>
...
```

**`map.less`**
```
    ...
    .layer {
      float: right;
      ...
      background: white;

      &[data-layer="_405_BRT"],
      &[data-layer="_522_BRT"] {
        border-left: @border-width dashed @transit-purple;
      }
  
      &[data-layer="Ballard"],
      &[data-layer="West_Seattle"],
      &[data-layer="Everett"],
      &[data-layer="Redmond"],
      &[data-layer="Kirkland"],
      &[data-layer="Issaquah"],
      &[data-layer="South_Federal_Way"],
      &[data-layer="Federal_Way"],
      &[data-layer="Tacoma"] {
        border-left: @border-width dashed @transit-orange;
      }
  
      &[data-layer="DuPont"] {
        border-left: @border-width dashed @transit-green;
      }
  
  
      &[data-layer="Sounder_South"] {
        border-left: @border-width solid @transit-blue;
      }
```
