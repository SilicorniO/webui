# webui
Easier way to set the position of the views/tags in a website. 
Built with basic Javascript, it should be working in most of browsers. 

## Features
 * Set horizontal position of a view: Left, Right or Middle.
 * Set vertical position of a view: Top, Bottom or Middle.
 * Define relational position of a view respect another one.
 * Allows to change the position of the views depending of the width of the screen.
 * Allows to change automatically the size of margins and paddings depending of device.
 * Logs for debugging.
 
## Working on
 * Only working with pixels at the moment.
 * Compatibility with React.
 
## Dependencies
 * None
 
##Installation

You can find the latest minified version in the builds folder. If you need to debug you can use logs and the core version directly in your project.

##Usage

1. Add the script reference in your website
 
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

2. Add the first call to use webui in your page.

   ```html
      
      <html>
          <head>
            <!-- WEBUI SCRIPT REFERNCE -->
            <script type="text/javascript" src="webui-1.0.0.min.js"></script>
          </head>
          <body>
          
          <script>
            drawUIAll();
          </script>
          
          </body>
      </html>
      
   ```
   
3. Now you can use webui in your page:

   The webui framework needs a parent div called screen. If you are using "drawUIAll()" you will need to add this div inside the "body" tag. This method is useful if you want to build the base of your website with "webui".
  
  ```html
      
      <html>
          <head>
            <!-- WEBUI SCRIPT REFERNCE -->
            <script type="text/javascript" src="webui-1.0.0.min.js"></script>
          </head>
          <body>
          
          <div ui="s">
            <span ui="t:p;l:p">Top-Left</span>
          </div>
          
          <script>
            drawUIAll();
          </script>
          
          </body>
      </html>
      
   ```

4. Webui can be used inside of your built pages, inside another tags. 

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
            drawUIForId('screen');
          </script>
          
          </body>
      </html>
      
   ```

## Config

   You can config webui before running. You have to call to "configUI" method with a configuration JSON.
   
 * viewColors: Set a background color to all webui views. This is a good method to know what is happening during development. For example to know the size of a view and why another view is not located where expected. 
 * showLogs: Show live information.
 * viewLogs: Identifier of the tag where you want to see the logs if the console is not right for you.
 * dimens: Allows to create reference to different sizes. It is better to use variables for dimensions and change it depending of the size of device.
   
   ```html
      
      <html>
          <head>
            <!-- WEBUI SCRIPT REFERNCE -->
            <script type="text/javascript" src="webui-1.0.0.min.js"></script>
          </head>
          <body>
          
          <div ui="s">
            <span ui="t:p;l:p">Top-Left</span>
          </div>
          
          <script>
          
            configUI({
                viewColors: true,
                showLogs: true,
                viewLogs: 'logs',
                dimens: {
                    ms: 10, 	//margin small
                    mm: 20, 	//margin medium
                    mb: 100 	//margin big
                }
            });
            
            drawUIAll();
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
