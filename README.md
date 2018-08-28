# webui
Easier way to set the position of the views/tags in a website. 
Built with basic Javascript, it should be working in most of browsers. 

![alt text](https://raw.githubusercontent.com/SilicorniO/webui/master/tests/webui-tests-positions.png)

## Features
 * Set horizontal position of a view: Left, Right, Middle, Percentage, ...
 * Set vertical position of a view: Top, Bottom, Middle, Percentage, ...
 * Define relational position of a view respect another one.
 * Allows to change the position of the views depending of the width of the screen.
 * Allows to change automatically the size of margins and paddings depending of device.
 * Logs for debugging.
 
## Working on
 * Only working with pixels at the moment.
 * Compatibility with React.
 
## Dependencies
 * None
 
## Installation

You can find the latest minified version in the builds folder. If you need to debug you can use logs and the core version directly in your project.

### 1. Add the script reference in your website
 
   ```html
      
      <html>
          <head>
            <!-- WEBUI SCRIPT REFERNCE -->
            <script type="text/javascript" src="webui-1.0.0.min.js"></script>
          </head>
          <body>
          </body>
      </html>
      
   ```

### 2. Add the first call to use webui in your page.

   ```html
      
      <html>
          <head>
            <!-- WEBUI SCRIPT REFERNCE -->
            <script type="text/javascript" src="webui-1.0.0.min.js"></script>
          </head>
          <body>
          
          <script>
            WebUI.start();
          </script>
          
          </body>
      </html>
      
   ```
   
### 3. Now you can use webui in your page:

   The webui framework needs a parent div called screen. If you are using "drawUIAll()" you will need to add this div inside the "body" tag. This method is useful if you want to build the base of your website with "webui".
  
  ```html
      
      <html>
          <head>
            <!-- WEBUI SCRIPT REFERNCE -->
            <script type="text/javascript" src="webui-1.0.0.min.js"></script>
          </head>
          <body>
          
          <div ui="fw;fh">
            <span ui="t:p;l:p">Top-Left</span>
          </div>
          
          <script>
            WebUI.start();
          </script>
          
          </body>
      </html>
      
   ```

### 4. Webui can be used inside of your built pages, inside another tags. 

   For this way you need to add an identifier of a div and to call to "drawForId('IDENTIFIER_OF_TAG')".

  ```html
      
      <html>
          <head>
            <!-- WEBUI SCRIPT REFERNCE -->
            <script type="text/javascript" src="webui-1.0.0.min.js"></script>
          </head>
          <body>
          
          <div style="width:100%;height:50px;background-color:gray">
            Header
            </div>
            <div style="width:100%;background-color:lightgray">
            <div id="screen" ui="">
                <div ui="p:mm">
                  <span ui="">Screen in the middle of body with padding</span>
                </div>
            </div>
        </div>
        <div style="width:100%;height:50px;background-color:gray">
            Footer
        </div>
          
          <script>
            WebUI.start();
          </script>
          
          </body>
      </html>
      
   ```

### 5. Webui can search for you the containers defined as web-uiscreens.

   You don't need to add any parameter. All tags with main attribute whose parent haven't got it is a screen".

   ```html
      
      <html>
          <head>
            <!-- WEBUI SCRIPT REFERNCE -->
            <script type="text/javascript" src="webui-1.0.0.min.js"></script>
          </head>
          <body>
          
          <div ui="">
            <span ui="t:p;l:p">Top-Left</span>
          </div>

          <div ui="">
            <span ui="b:p;r:p">Bottom-Right</span>
          </div>
          
          <script>
            WebUI.start();
          </script>
          
          </body>
      </html>
      
   ```

## Usage

### 1. Containers

Once you have a screen in your page you can start adding more views. The views are any tag you want. It is recommended to use div as containers and the rest of tags as common use.

If you want a tag to convert in a webui-view, you have to add the "ui" attribute. For example:

   ```html
        
        <div id="container" ui="">
        </div>
        
   ```
    
You can add containers inside containers as views. Remember adding the attribute "ui" to all tags you want to be processed. If a tag hasn't got it, any of its children will be processed:

   ```html
        
        <div id="container" ui="">
            <div id="subcontainer1" ui=""></div>
            <div id="subcontainer1" ui=""></div>
        </div>
        
   ```

Inside of the containers you could add content with webui-views or plain html:

   ```html
        
        <div id="container" ui="">
            <div id="subcontainer1" ui="">
                <span ui="">Text with webui</span>
            </div>
            <div id="subcontainer1" ui="">
                <span>Just text not processed in webui</span>
            </div>
        </div>
        
   ```

### 2. Parameters

You can define the position of your webui-view with short commands inside the "ui" attribute. These are the commands and their possible values:

 * w - Width: ("sc") to set the width depending of the content). (X) where X is the number of pixels width. (X%) where X is the number with the percentage of space of its parent.
 * fw - FullWidth: () to set width as 100% 
 * h - Height: ("sc") to set the height depending of the content). (X) where X is the number of pixels height. (X%) where X is the number with the percentage of space of its parent.
 * fh - FullHeight: () to set height as 100%
 * l - Left: (ID) set the same left than the identified view.
 * r - Right: (ID) set the same right than the identified view.
 * t - Top: (ID) set the same too than the identified view.
 * b - Bottom: (ID) set the same bottom than the identified view.
 * al - At left: (ID) set the right of the view at the left of the identified view.
 * ale - At left equal: (ID) set the right of the view at the left of the identified view, and the top and bottom as the identifiedView.
 * ar - At right: (ID) set the left of the view at the right of the identified view.
 * are - At right equal: (ID) set the left of the view at the right of the identified view, and the top and bottom as the identifiedView.
 * at - At top: (ID) set the bottom of the view at the top of the identified view.
 * ate - At top equal: (ID) set the bottom of the view at the top of the identified view, and the left and right as the identifiedView.
 * ab - At bottom: (ID) set the top of the view at the bottom of the identified view.
 * abe - At bottom equal: (ID) set the top of the view at the bottom of the identified view, and the left and right as the identifiedView.
 * ml - Margin left: (X) Push the view at the left where X is the number of pixels.
 * mr - Margin right: (X) Push the view at the right where X is the number of pixels.
 * mt - Margin top: (X) Push the view at the top where X is the number of pixels.
 * mb - Margin bottom: (X) Push the view at the bottom where X is the number of pixels.
 * m - Margin: (X / X,Y,W,Z) Push the view at all directions. The order is: Left, Top, Right, Bottom. X, Y, W, Z are the number of pixels.
 * pl - Padding left: (X) Add space inside the view at the left where X is the number of pixels.
 * pr - Padding right: (X) Add space inside the view at the right where X is the number of pixels.
 * pt - Padding top: (X) Add space inside the view at the top where X is the number of pixels.
 * pb - Padding bottom: (X) Add space inside the view at the bottom where X is the number of pixels.
 * p - Padding: (X / X,Y,W,Z) Add space inside the view at all directions. The order is: Left, Top, Right, Bottom. X, Y, W, Z are the number of pixels.
 * ch - Center horizontal: Set the view in the center of the parent horizontally.
 * cv - Center vertical: Set the view in the center of the parent vertically.
 * c - Center: Set the view in the center of the parent.
 * cui - Children ui: ("n") If you don't want to process the children of the view although they have "ui" attribute.
 * sv - Scroll vertical: () Just add this parameter to show vertical scrollbars in the view if it is necessary.
 * sh - Scroll horizontal: () Just add this parameter to show vertical scrollbars in the view if it is necessary.
 * v - Visibility: ("v") to show the view, this is the default value. ("i") to set the view as invisible but having size. ("g") to hide view from eyes and calculations.

### 3. Identifiers of the views

Each view has an identifier. It is not mandatory to define one, if you don't add it, the webui framework will generate one. If you are debugging may be easier to set identifier in all views you want to check to find the problem.

There are three special identifiers:

 * s - Screen: General view, the main view necessary to execute the framework. 
 * p - Parent: This is the identifier of the parent view. If you want to set a parameter in the view referenced to its parent you just need to write PARAMETER:"p".
 * l - Last: This is the identifier of the last view in the code. If you want to set a parameter in the view referenced to its parent you just need to write PARAMETER:"l".

### 4. Applying parameters

All the parameters are used inside the "ui" attribute. Remember to set the size of the first UI view (called screen). 

For example: ui="l:p; ab:l; w:30%"

 * l:p - The left side of the view will be at the left side of the parent
 * ab:l - The view will be below the last one, as a list.
 * w:30% - The width of the view will be the 30% of the width of the parent.

    ```html
      
      <html>
          <head>
            <!-- WEBUI SCRIPT REFERNCE -->
            <script type="text/javascript" src="webui-1.0.0.min.js"></script>
          </head>
          <body>
          
          <div ui="fw;fh">
            <div ui="fw;fh">
                <span ui="l:p;w:30%">Text</span>
            </div>
          </div>
          
          <script>
          
            WebUI.start();
          </script>
          
          </body>
      </html>
      
    ```

### 5. Applying parameters dinamically

It is possible to modify the attributes dinamically. To do it you have to get the element and execute any of the methods of the ui attribute.

For example: 

    ```javascript

      //get the element and change the width
      var square1 = document.getElementById('square1');
      square1.ui.setWidth("300");
      
      //refresh the WebUI to change the width of the element
      WebUI.refresh();
      
    ```

Don't change the attributes directly because WebUI may not refresh the element.

The functions at the moment are:

* setWidth(w)
* setHeight(h)
* setLeft(id)
* setRight(id)
* setTop(id)
* setBottom(id)
* setAtLeft(id)
* setAtRight(id)
* setAtTop(id)
* setAtBottom(id)
* setCenterHorizontal(boolean)
* setCenterVertical(boolean)
* setMarginLeft(margin)
* setMarginRight(margin)
* setMarginTop(margin)
* setMarginBottom(margin)
* setMargins(marginLeft, marginTop, marginRight, marginBottom)
* setPaddingLeft(margin)
* setPaddingRight(margin)
* setPaddingTop(margin)
* setPaddingBottom(margin)
* setPaddings(paddingLeft, paddingTop, paddingRight, paddingBottom)
* setVisibility(visibility)
* animateNextRefresh(animationDuration)

All parameters are strings.

### 6. Animations

It is possible to animate the changes in the views automatically. You can do it calling to method "animateNextRefresh" of the view with the duration of the animation you want. 
You will need to call to this method each time the refresh is going to be called. This prevents unexpected animations.
You can be an example in test 300.

    ```javascript
      WebUI.start({
          viewColors: true,
          showLogs: true,
          timeRedraw: 100
      });

      setTimeout(function(){

          //get the reference of the element
          var square1 = document.getElementById('square1');

          //apply for example a different width to the view
          square1.ui.setWidth("300");

          //set the time to apply for the animation
          square1.ui.animateNextRefresh(1.0);
          
          //call to refresh the UI
          WebUI.refresh();

      }, 1000);
    ```

### 7. Examples

Please, to learn more, check the examples in "tests" folder. You can clone the project and execute the examples directly in your browser.

## Config

   You can config webui before running. You have to call to "configUI" method with a configuration JSON.
   
 * viewColors: Set a background color to all webui views. This is a good method to know what is happening during development. For example to know the size of a view and why another view is not located where expected. 
 * showLogs: Show live information.
 * viewLogs: Identifier of the tag where you want to see the logs if the console is not right for you.
 * dimens: Allows to create reference to different sizes. It is better to use variables for dimensions and change it depending of the size of device.
 * attribute: You can define the name of the attribute to use with web-ui. NOTE: If you are using react you need this attribute starts with 'data-'.
 * animations: Values to use for animations.
    * defaultTime: Default time for animations.
    * defaultOpacity: Flag to show animation when the view is calculated for the first time.
 * screenModes: You can define different "ui" attributes to use for each width of the device. Check the examples for more information.
 * events: You can receive events. From the moment you can receive "start" and "end" events. End event has the list of attributes for the type of screen loaded.
   
   ```html
      
      <html>
          <head>
            <!-- WEBUI SCRIPT REFERNCE -->
            <script type="text/javascript" src="webui-1.0.0.min.js"></script>
          </head>
          <body>
          
          <div ui="">
            <span ui="t:p;l:p">Top-Left</span>
          </div>
          
          <script>
          
            WebUI.start({
                viewColors: true,
                showLogs: true,
                viewLogs: 'logs',
                attribute: 'ui',
                animations: {
                    defaultTime: 0.3,
                    defaultOpacity: true
                },
                dimens: {
                    ms: 10, 	//margin small
                    mm: 20, 	//margin medium
                    mb: 100 	//margin big
                },
                screenModes: [
                {
                    //mobile
                    attribute: "uim",
                    widthEnd: 450
                },
                {
                    //tablet
                    attribute: "uit",
                    widthStart: 451,
                    widthEnd: 700
                },
                {
                    //desktop
                    attribute: "uid",
                    widthStart: 701
                }
                ],
                events: function(event) {
                  console.log(event.name);
                  console.log(event.attributes);
                }
            });
            
          </script>
          
          </body>
      </html>
      
    ```
   
   
## License

    MIT License

Copyright (c) 2017 SilicorniO

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
