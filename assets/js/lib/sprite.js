export class Sprite {

  constructor() {
    this.id       = 0;
    this.name     = '';
    this.playable = false;
    this.enemy    = false;
    this.isExit   = false;    
    this.dead     = false;
    this.won      = false;
    
    this.image = {
      src: '',
      dimensions: {
        x:       0,
        y:       0,
        width:   25,
        height:  25
      }
    };
  
    this.position = {
      x:  0,
      y:  0      
    };

    this.default_friction = 0.9; // set the initial friction
    this.default_gravity  = 0.4;

    this.velocity = {
      x:       0,
      y:       0,
      limit:   5, // The limit we give to how fast an object can travel at top speed
      bounce: -0.7,
    }
  
    this.acceleration = {      
      x:        0,
      y:        0,
      default:  0.2,      
      friction: this.default_friction,      
      gravity:  this.default_gravity
    };
  
    this.isOnGround = true;
    this.jumpForce  = -11.0;
    this.visible    = true;
    this.solid      = true;
    this.moveable   = false;
  }

  /**
   * imageDimensions
   * method to create the dimensions of the sprite
   * 
   */
  imageDimensions(src, x, y, width, height) {
    this.image.src               = src;
    this.image.dimensions.x      = x;
    this.image.dimensions.y      = y;
    this.image.dimensions.width  = width;
    this.image.dimensions.height = height;
  }

  calculate(type = '') {
    let result = null;

    switch(type) {
      case 'center-x':
        result = this.position.x + (this.image.dimensions.width / 2);
      break;

      case 'center-y':
        result = this.position.y + (this.image.dimensions.height / 2);
      break;

      case 'center-width':
        result = this.image.dimensions.width / 2;
      break;

      case 'center-height':
        result = this.image.dimensions.height / 2;
      break;
    }

    return result; 
  }

  /**
   * move
   * method to move the sprite up to the maximum limit it is allowed to move
   */
  move(controller, boundary, sprites) {

    if (this.playable) {
      this.determineVectors(controller);
      this.determineActions(controller);
    }

    // Apply horizonal friction and acceleration
    this.velocity.x += this.acceleration.x;
    this.velocity.x *= this.acceleration.friction;

    // Apply vertical friction, acceleration and gravity
    this.velocity.y += this.acceleration.y;
    this.velocity.y *= this.acceleration.friction;
    this.velocity.y += this.acceleration.gravity;
    
    // don't go over the speed limit unless the velocity is now an upward jump 
    // because it will choke the jump effect.
    if (this.velocity.x > this.velocity.limit) {
      this.velocity.x = this.velocity.limit;
    }

    if (this.velocity.x < -this.velocity.limit) {
      this.velocity.x = -this.velocity.limit;
    }

    if ( this.velocity.y > (this.velocity.limit * 2) ) {
      this.velocity.y = (this.velocity.limit * 2);      
    }

    // Reset the sprite position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // Collisions
    let collision = this.collision(sprites);
    this.isPlatform(collision.collision);

    // Boundaries
    if (this.position.x < 0) { this.bounce('left', 0); }
    if (this.position.y < 0) { this.bounce('top', 0); }
    if ((this.position.x + this.image.dimensions.width) > boundary.width)   { this.bounce('right', boundary.width); }
    if ((this.position.y + this.image.dimensions.height) > boundary.height) { this.bounce('bottom', boundary.height); }
    
    return collision.collision;
  }

  /**
   * determineVectors
   * Method to determine the sprites direction on the screen
   */
  determineVectors(controller) {
    // ----------------------------------------------------------------------------
    // Accelaration
    // ----------------------------------------------------------------------------
    // We don't need vertical lift for this game
    if (false && controller.direction.up && !controller.direction.down) {
      this.acceleration.y        = -0.2;
      this.acceleration.friction = 1;
      this.acceleration.gravity  = 0;
    }

    if (controller.direction.down && !controller.direction.up) {
      this.acceleration.y        = 0.2;
      this.acceleration.friction = 1;
    }

    if (controller.direction.left && !controller.direction.right) {
      this.acceleration.x        = -0.2;
      this.acceleration.friction = 1;
    }

    if (controller.direction.right && !controller.direction.left) {
      this.acceleration.x        = 0.2;
      this.acceleration.friction = 1;
    }

    if (!controller.direction.up && !controller.direction.down) {
      this.acceleration.y = 0;
    }

    if (!controller.direction.left && !controller.direction.right) {
      this.acceleration.x = 0;
    }

    if (!controller.direction.up && !controller.direction.down && !controller.direction.left && !controller.direction.right) {
      this.acceleration.friction = this.default_friction;
      this.acceleration.gravity  = this.default_gravity;
    }
    // ----------------------------------------------------------------------------
  } // determineVectors

  /**
   * determinActions
   * Method to identify what actions the sprite is making
   */
  determineActions(controller) {
    if (controller.action.jump && this.isOnGround) {

      this.acceleration.friction = this.default_friction;
      this.acceleration.gravity  = this.default_gravity;

      let moving = (Math.floor(Math.abs(this.velocity.x)) > 0) ? true : false;

      if (moving) {
        this.velocity.y = this.jumpForce;        
      } else {
        this.velocity.y += this.jumpForce * 2;        
      }

      this.isOnGround  = false;
      this.acceleration.friction = 1;
    }
  } // determinActions

  /**
   * isPlatform
   * method to define if the sprite can land on this item
   */
  isPlatform(collision_side) {
    switch(collision_side) {
      case 'bottom':
        if (this.velocity.y >= 0) {          
          this.isOnGround = true;      
          this.velocity.y = -this.acceleration.gravity;
        }
      break;

      case 'top':
        if (this.velocity.y <= 0) {
          this.velocity.y = 0;
        }        
      break;

      case 'right':
        if (this.velocity.x >= 0) {
          this.velocity.x = 0;
        }
      break;

      case 'left':
        if (this.velocity.x <= 0) {
          this.velocity.x = 0;
        }
      break;
    }

    if (collision_side !== 'bottom' && this.velocity.y > 0) {
      this.isOnGround = false;
    }
  }

  /**
   * stayOnPlatform
   * method for sprites to stay only on the platform they are suppose to be on.  Used for Evil sprites
   * so that they only move around the platform.
   * 
   */
  stayOnPlatform(collision, previous_position) {
    
    switch(collision) {
      case 'left':
        this.acceleration.x = this.acceleration.default;
      break;

      case 'right':
        this.acceleration.x = -this.acceleration.default;
      break;

      case '':
        if (this.isOnGround) {
          if (previous_position.x == this.position.x) {
            // this sprite hasn't moved. we need to switch the directions
            this.acceleration.x = -this.acceleration.x;            
          }
        } else {
          let moving_right = (this.velocity.x >0) ? true : false;

          if (moving_right) {
            this.position.x -= 5;
            this.acceleration.x = -this.acceleration.default;  
          } else {
            this.position.x += 5;
            this.acceleration.x = this.acceleration.default;  
          }
        }
      break;

      case 'bottom':
        if (previous_position.x == this.position.x) {
          // this sprite hasn't moved. we need to switch the directions
          this.acceleration.x = -this.acceleration.x;            
        }
      break;
    }
  }

  /**
   * collision
   * method to detect collisions between this sprite and any sprites on the screen
   * 
   * @param array sprites  The sprites we will check against   
   */
  collision(sprites) {
    let result = {
      collision: '',
      axis:      '',
      offset:     0
    };
    
    for(let sprite of sprites) {

      if (!sprite.solid || (this.id == sprite.id)) {
        continue; // there's no collision with things that are not solid, nor do we collide with the sprite itself
      }

      // delta distance between the two objects
      let distance_x = this.calculate('center-x') - sprite.calculate('center-x');
      let distance_y = this.calculate('center-y') - sprite.calculate('center-y');

      // the distance between the two objects that results in a collision
      let width_collision  = this.calculate('center-width') + sprite.calculate('center-width');
      let height_collision = this.calculate('center-height') + sprite.calculate('center-height');

      // Check whether the delta between the two objects is less than the combined half widths. If so, a collision may have occured
      if (Math.abs(distance_x) < Math.abs(width_collision)) {
        
        // Now that we know the the horizontal position overlaps, if a vertical position overlaps, then a collision has occurred.
        if (Math.abs(distance_y) < Math.abs(height_collision)) {
          
          // determine what side the collision has occurred.
          let overlap_x = width_collision - Math.abs(distance_x);
          let overlap_y = height_collision - Math.abs(distance_y);

          // The smallest overlap value is where the collision has occurred. we'll have to know if it's on the top, bottom, left or right side
          // of the sprite
          if (overlap_x >= overlap_y) {
            // The collision is happening on the vertical axis, lets figure out if it's the top or bottom
            result.collision = (distance_y > 0) ? 'top' : 'bottom';
            result.axis      = 'y';
            result.offset    = (distance_y > 0) ? overlap_y : -overlap_y;
            this.position.y  = (distance_y > 0) ? (this.position.y + overlap_y) : (this.position.y - overlap_y);
          } else {
            // The collision is happening on the horizontal axis, lets figure out if it's the top or bottom
            result.collision = (distance_x > 0) ? 'left' : 'right';
            result.axis      = 'x';
            result.offset    = (distance_x > 0) ? overlap_x : -overlap_x;
            this.position.x  = (distance_x > 0) ? (this.position.x + overlap_x) : (this.position.x - overlap_x);
          }

          // A collision has occurred, but was it an enemy that the sprite collided with?          
          this.enemyCollision(result.collision, sprite);
          this.winCollision(result.collision, sprite);
        }
      }
    }

    return result;
  } // collision

  /**
   * enemyCollision
   * method to determine if the player hit an enemy; and, if so, where the collision happened
   * The collision side is based on the current object, not the sprite being passed in as an 
   * arguement.
   * 
   */
  enemyCollision(collision_side, sprite) {
    if (!sprite.enemy && !this.enemy) { return; }

    if ((sprite.enemy && !this.enemy) || this.playable) {
      switch(collision_side) {
        case 'top':
        case 'left':
        case 'right':
          this.dead = true; // player died
        break;

        case 'bottom':
          sprite.dead = true;
        break;
      }
    }
  } // enemyCollision

  /**
   * winCollision
   * method to idenfity if the player has landed on the exit.  Allows them to proceed to the next level
   * @param {*} collision_side 
   * @param {*} sprite 
   */
  winCollision(collision_side, sprite) {
    if (this.playable && sprite.isExit) {
      this.won = true;
    }
  }
   
  /**
   * bounce
   * adds bounce functionality when hitting the wall
   */
  bounce(area, offset) {
    this.isOnGround = false;

    switch(area) {
      case 'left':
        this.velocity.x *= this.velocity.bounce;
        this.position.x = offset + 0;
      break;

      case 'top':
        this.velocity.y *= this.velocity.bounce;
        this.position.y = offset + 0;
      break;

      case 'right':
        this.velocity.x *= this.velocity.bounce;
        this.position.x = offset - this.image.dimensions.width;
      break;

      case 'bottom':
        // we are not going to bounce on the bottom as this messes up our ability to jump.
        this.position.y = offset - this.image.dimensions.height;
        this.isOnGround = true;
        // this.velocity.y = -this.acceleration.gravity;
      break;
    }
  }
}