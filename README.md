# hedgehog

Hedgehog is a javascript game built with OOP that utilizes requestAnimationFrame and canvas to move the players along.

The components are broken up into individual classes for re-use on other games.

## How to Play
Load the game up on a server and then visit the index.html file.  You move with the directional arrow keys of your keyboard and jump with the space bar (eventually to be replaced with a game controller).  Jumping on top of a hedgehog will kill the hedgehog. Hitting a hedgehog any where else will cause you to lose and have to refresh the browser to play again.

## Purpose
Get through three levels of game play by reaching the door in each level to win.

## Code
The game uses javascirpt classes to create all the objects.  the Sprite object is used for all items on the screen, and the movement is only applied to those sprites that have moveable == true.

### main.js
The js that is called from the html file.  This creates a game oject and loads it in

### settings.js
The levels and sprites that are shown on the screen

### game.js
The code that builds the levels and sprites.  This code also initiates gameplay and uses the requestAnimationFrame to cycle through the game at 60 frames per second so the sprite movement looks smooth.  

### sprite.js
The class that manages all sprite actions and detects collisions between sprites. The code is still a bit buggy so it needs work.

### keypad.js
The class that manages the directional controller and any buttons.  The idea is to abstract this out from the game so that I can switch to an actual gamepad controller in future games.

### canvas.js
The code that manages the canvas element.

## Original Source
Foundation Game Design with HTML5 and JavaScript (https://www.apress.com/gp/book/9781430247166).  I used this book to learn how to do this, but used classes instead of procedural code as outlined in the book (you can tell as my code is a little buggy in some areas).
