// Game specific code.
var baseY = 256 - 30;
var tx = 2;
var ty = 2;  

class Car {
   constructor() {
      this.x = 8;
      this.y = baseY;
      this.left = false;
      this.right = false;
      this.tryJump = false;
      this.g = 0;
   }
   
   update(events, instructions) {
      for (var i = 0; i < events.length; ++i) {
         var e = events[i];
         var inst = e[0];
         if (inst == "load") {
         } else if (inst == "keydown") {
            var keyCode = e[1];
            if (keyCode == 65) {
               this.left = true;
            } else if (keyCode == 68) {
               this.right = true;
            } else if (keyCode == 74) {
               //
            } else if (keyCode == 75) {
               this.tryJump = true;
            }
         } else if (inst == "keyup") {
            var keyCode = e[1];
            if (keyCode == 65) {
               this.left = false;
            } else if (keyCode == 68) {
               this.right = false;
            }
         }
      }
      instructions.push({ "scanvas": "main" });
      instructions.push({ "crect": [this.x, this.y, 30, 30] });
      if (this.left) {
         this.x -= 2;
      }
      if (this.right) {
         this.x += 2;
      }
  
      if (this.tryJump) {
         if (!this.isJumping) {
            instructions.push({ "play": "jump" });
            this.isJumping = true;
         }
         this.tryJump = false;
      }
      if (this.isJumping) {
         this.y -= 6 - this.g;
         this.g += 0.2;
         if (this.y >= baseY) {
            this.y = baseY;
            this.g = 0;
            this.isJumping = false;
         }
      }
   
      instructions.push.apply(instructions, [
         { "draw": ["car", this.x, this.y] }
      ]);         
   }
}

class Cursor {
   constructor() {
      this.cx = 0;
      this.cy = 0;
      this.cleft = false;
      this.cright = false;
      this.cup = false;
      this.cdown = false;
      this.print = false;
      this.del = false;
      this.map = {};
   }
   
   update(events, instructions) {
      for (var i = 0; i < events.length; ++i) {
         var e = events[i];
         var inst = e[0];
         if (inst == "keydown") {
            var keyCode = e[1];
            if (keyCode == 65) {
               this.cleft = true;
            } else if (keyCode == 68) {
               this.cright = true;
            } else if (keyCode == 87) {
               this.cup = true;
            } else if (keyCode == 83) {
               this.cdown = true;
            } else if (keyCode == 74) {
               this.del = true;
            } else if (keyCode == 75) {
               this.print = true;
            }
            //console.log("d" + keyCode);
         }
      }
      
      instructions.push({ "scanvas": "cursor" });
      instructions.push({ "crect": [this.cx * 32, this.cy * 32, 32, 32] });
     
      if (this.cleft) {
         --(this.cx);
         if (this.cx < 0) {
            this.cx = 0;
         }
         this.cleft = false;
      }
      if (this.cup) {
         --this.cy;
         if (this.cy < 0) {
            this.cy = 0;
         }
         this.cup = false;
      }
      if (this.cright) {
         ++(this.cx);
         if (this.cx > 15) {
            this.cx = 15;
         }
         this.cright = false;
      }
      if (this.cdown) {
         ++this.cy;
         if (this.cy > 15) {
            this.cy = 15;
         }
         this.cdown = false;
      }

      if (this.print) {
         var o = { x: this.cx * 32, y: this.cy * 32 };
         this.map[this.cx.toString() + "," + this.cy.toString()] = o;
         instructions.push({ "scanvas": "blocks" });
         instructions.push({ "crect": [o.x, o.y, 32, 32] });
         instructions.push({ "draw": ["ft", tx * 32, ty * 32, 32, 32, o.x, o.y, 32, 32] });
         this.print = false;
      }
      if (this.del) {
         var k = this.cx.toString() + "," + this.cy.toString();
         if (this.map.hasOwnProperty(k)) {
            var o = this.map[k];
            instructions.push({ "scanvas": "blocks" });
            instructions.push({ "crect": [o.x, o.y, 32, 32] });
            delete this.map[k];
         }
         this.del = false;
      }
     
      var cxc = this.cx * 32;
      var cyc = this.cy * 32;
      instructions.push.apply(instructions, [
         { "scanvas": "cursor" },
         { "sstyle": "#FF0000" },
         { "draw": ["cursor", cxc, cyc] }
      ]);
   }
}

var load = true;
var car = new Car();
var cursor = new Cursor();

class TextureClass {
   constructor(name, src) {
      this.name = name;
      this.src = src;
   }
   
   load(instructions) {
      instructions.push({ "tex": [this.name, this.src] });
   }
   
   draw(instructions, x, y) {
      instructions.push({ "draw": [this.name, x, y] });
   }
   
   drawSprite(instructions, x, y, w, h, sx, sy) {
      instructions.push({ "draw": [this.name, sx, sy, w, h, x, y, w, h] });
   }
   
   clearSprite(instructions, x, y, w, h) {
      instructions.push({ "crect": [x, y, w, h] });
   }
}

class TextureObject {
   constructor(aClass, x, y) {
      this.aClass = aClass;
      this.x = x;
      this.y = y;
   }
   
   draw(instructions, x, y) {
      this.aClass.draw(instructions, x + this.x, y + this.y);
   }
}

class SpriteClass {
   constructor(txtClass, sx, sy, sw, sh) {
      this.txtClass = txtClass;
      this.sx = sx;
      this.sy = sy;
      this.sw = sw;
      this.sh = sh;
   }
   
   draw(instructions, x, y) {
      this.txtClass.drawSprite(instructions, x, y, this.sw, this.sh, this.sx, this.sy);
   }
   
   clear(instructions, x, y) {
      this.txtClass.clearSprite(instructions, x, y, this.sw, this.sh);
   }
   
   createObject(x, y) {
      return new SpriteObject(this, x, y);
   }
}

class SpriteObject {
   constructor(aClass, x, y) {
      this.aClass = aClass;
      this.x = x;
      this.y = y;
   }
   
   draw(instructions, x, y) {
      this.aClass.draw(instructions, x + this.x, y + this.y);
   }
   
   clear(instructions, x, y) {
      this.aClass.clear(instructions, x + this.x, y + this.y);
   }
}

class AnimationClass {
   constructor(definition) {
      this.definition = definition;
   }
   
   createObject(x, y) {
      return new AnimationObject(this, x, y);
   }
}

class AnimationObject {
   constructor(aClass, x, y) {
      this.aClass = aClass;
      this.x = x;
      this.y = y;
      this.objects = {};
      this.frames = aClass.definition.frames;
      this.frame = 0;
      this.dList = {};
      if (aClass.definition.oninit) {
         aClass.definition.oninit(this);
      }
   }
   
   draw(instructions, x, y) {
      var onframes = this.aClass.definition.onframes;
      if (onframes) {
         if (onframes.hasOwnProperty(this.frame)) {
            onframes[this.frame](this);
         }
      }
      for (var p in this.dList) {
         if (this.dList.hasOwnProperty(p)) {
            this.dList[p].draw(instructions, x + this.x, y + this.y);
         }
      }
      this.frame += 1;
      if (this.frame >= this.frames) {
         this.frame = 0;
      }
   }
   
   clear(instructions, x, y) {
      for (var p in this.dList) {
         if (this.dList.hasOwnProperty(p)) {
            this.dList[p].clear(instructions, x + this.x, y + this.y);
         }
      }      
   }
}

var txtClass = new TextureClass("mario", "mario.png");
var txtObj = new TextureObject(txtClass, 100, 100);
var sprtClass = new SpriteClass(txtClass, 1, 10, 16, 24);
var sprtClass2 = new SpriteClass(txtClass, 18, 10, 16, 24);
var sprtObj = new SpriteObject(sprtClass, 0, 0);
var sprtObj2 = new SpriteObject(sprtClass2, 50, 50);
var animClass = new AnimationClass({
   oninit: function(obj) {
      obj.objects.walk0 = new SpriteObject(sprtClass, 0, 0);
      obj.objects.walk1 = new SpriteObject(sprtClass2, 0, 0);
   },
   frames: 60,
   onframes: {
      0: function(obj) {
         obj.dList = { walk0: obj.objects.walk0 };
      },
      30: function(obj) {
         obj.dList = { walk1: obj.objects.walk1 }
      }
   }
});
var animObj = new AnimationObject(animClass, 10, 10);
var animClass2 = new AnimationClass({
   oninit: function(obj) {
      obj.objects.anim0 = new AnimationObject(animClass, 0, 0);
      obj.objects.anim1 = new AnimationObject(animClass, 16, 16);
      obj.dList = { anim0: obj.objects.anim0, anim1: obj.objects.anim1 };
   },
   frames: 1
});
var animObj2 = new AnimationObject(animClass2, 50, 50);

exports.update = function(events) {
   var instructions = [];
   for (var i = 0; i < events.length; ++i) {
      var e = events[i];
      var inst = e[0];
      if (inst == "load") {
         load = true;
      }
   }   

   if (load) {
      instructions.push.apply(instructions, [
         { "tex": ["car", "car.png"] },
         { "tex": ["ft", "fantasy-tileset.png"] },
         { "smpl": ["jump", "jump.ogg"] },
         { "mus": ["cafre", "cafre.mp3"] },
         { "canvas": ["blocks", 1] },
         { "tex": ["cursor", "cursor.png"] },
         { "canvas": ["cursor", 2] },
         { "canvas": ["console", 3] },
         { "scanvas": "console" },
         { "fstyle": "#FFFFFF" },
         { "text": ["Move with A and D. Jump with K.", 8, 8] }
         //{ "pmus": "cafre" }
      ]);
      instructions.push({ "scanvas": "blocks" });
      for (var p in cursor.map) {
         if (cursor.map.hasOwnProperty(p)) {
            var o = cursor.map[p];
            instructions.push.apply(instructions, [
              { "draw": ["ft", tx * 32, ty * 32, 32, 32, o.x, o.y, 32, 32] }
            ]);
         }
      }
      txtClass.load(instructions);
   }

   instructions.push({ "scanvas": "main" });
   animObj2.clear(instructions, 10, 10);
   animObj2.draw(instructions, 10, 10);
   //cursor.update(events, instructions);
   //car.update(events, instructions);
   if (load) {
      load = false;
   }
   return instructions;
};