import { Sprite, KeyPad, Display } from './index.js';
import { GameSettings } from './settings.js';

export class Game {
  constructor(canvas_id) {
    let image = './assets/images/hedgehogApocalypse.png';

    this.state   = false;
    this.player  = null;
    this.sprites = [];
    this.level   = 1;

    this.icon = {
      image:      image,
      per_column: 3,
      size:       64
    };

    // IDs from the settings file
    this.blam       = 3;
    this.msg_sprite = 'msg_bg';

    this.controller = new KeyPad();
    this.display    = new Display(canvas_id);
    this.settings   = new GameSettings();
    this.pieces     = this.settings.pieces();
  }


  /**
   * build
   * mehtod to build the map
   */
  build() {
    this.sprites = [];
    let level    = this.settings.level(this.level);
    let index    = 1;

    for(let i = 0; i < level.length; i++) {
      let data = level[i]; // levels have a board, and an arrangement of characters on the board.

      for (let row = 0; row < data.length; row++) {
        for (let column = 0; column < data[row].length; column++) {
          let tile = data[row][column];

          if (tile == 0) { continue; } // we don't want to capture empty tiles

          let sprite = this.loadImage({
            id: tile, // identifies which piece is on the map; not the sprite id
            position: {
              x: column,
              y: row
            }
          });

          if (sprite.playable) {
            this.player = sprite; // this is our hero.  it is the only playable character.
          }

          sprite.id = index++; // each sprite needs a unique id
          this.sprites.push(sprite);

          if (sprite.enemy) {
            // Initialise the acceleration of the sprite so that it can move on the screen.
            sprite.acceleration.x = (sprite.acceleration.x == 0) ? sprite.acceleration.default : sprite.acceleration.x;
            // console.log('Evil Sprite ID: ', sprite.id);
          }
        }
      }
    }
  } // build


  /**
   * loadImage
   * method to load in the sprite
   */
  loadImage(params) {
    let obj =  new Sprite();
    
    for (let piece in this.pieces) {
      let icon = this.pieces[piece];

      if (params.id == icon.id) {  
        obj.name     = piece;      
        obj.solid    = icon.solid;
        obj.playable = icon.playable;
        obj.moveable = icon.moveable;
        obj.enemy    = icon.enemy;
        obj.isExit   = icon.isExit;

        let image  = new Image();
        image.src = this.icon.image; 

        obj.imageDimensions(image, icon.position.x, icon.position.y, icon.width, icon.height);
        obj.position.x = params.position.x * this.icon.size;
        obj.position.y = params.position.y * this.icon.size;        
      }
    }

    return obj;
  } // loadImage

  /**
   * play
   * method that starts to play the game
   */
  play() {
    for(let i = 0; i < this.sprites.length; i++) {
      let sprite = this.sprites[i];

      if (!sprite.moveable) { continue; }
      
      let previous_position = {
        x: sprite.position.x,
        y: sprite.position.y
      };

      let collision = sprite.move(
        this.controller, 
        {
          width:   this.display.width(),
          height:  this.display.height()
        },
        this.sprites
      );

      // Check to see that the evil sprite is on something. if it's not, set the velocity to 0 and reverse the acceleration
      if (sprite.enemy) {
        sprite.stayOnPlatform(collision, previous_position);
      }

      // ---------------------------------------------------------------------
      // Did the sprite die?
      // ---------------------------------------------------------------------
      if (sprite.dead) {
        // Was it the player that died?
        if (sprite.playable) {
          this.message('You Died a HORRIBLE DEATH.<br /><br />Refresh to restart.', false);
        }

        sprite = this.changeSprite(this.blam, {
          id: sprite.id,
          position: { x : Math.ceil(sprite.position.x/this.icon.size), y: Math.ceil(sprite.position.y/this.icon.size) }
        });

        this.sprites[i] = sprite;

        setTimeout(() => {
          this.sprites.splice(i, 1); // remove that item from our array
        }, 1000);        
      }
      // ---------------------------------------------------------------------

      // ---------------------------------------------------------------------
      // Did the player win this level?
      // ---------------------------------------------------------------------
      if (sprite.playable && sprite.won) {
        this.state = false; // stop gameplay
        this.level++
        if (this.level <= this.settings.levels) {
          this.sprites[i].won = false; // reset win result
          this.message('Excellent. Level ' + this.level + ' is next!', true);
          setTimeout(() => {
            this.state = true;
            this.build(); // proceed to the next level 
            this.play();    
          }, 2100);
        } else {
          this.message('You Won! Wowzers!<br /><br />Refresh to restart.', false);
        }
      }
      // ---------------------------------------------------------------------
    }    
  } // play

  /**
   * message
   * method to display the message to the end user.
   */
  message(text, hide) {
    let message = document.querySelector('#message');
    message.style.display = 'block';
    message.innerHTML = text;

    if (hide) {
      setTimeout(() => {
        message.style.display = 'none'; 
      }, 2000);
    }
  }

  changeSprite(icon_id, params) {
    let sprite = this.loadImage({
      id: icon_id,
      position: {
        x: params.position.x,
        y: params.position.y
      }
    });

    sprite.id = params.id;

    return sprite;
  }

  /**
   * update
   * method to update the canvas with the new values
   */
  update() {
    requestAnimationFrame(this.update.bind(this));

    if (this.state) {
     this.play();
    }

    this.display.render(this.sprites);
  } // update  
}