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
   }

   cursor.update(events, instructions);
   car.update(events, instructions);
   if (load) {
      load = false;
   }
   return instructions;
};