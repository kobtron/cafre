// Game specific code.
var load = true;
var left = false;
var right = false;
var baseY = 256 - 30;
var x = 8;
var y = baseY;
var tryJump = false;
var isJumping = false;
var g = 0;
var cx = 0;
var cy = 0;
var cleft = false;
var cright = false;
var cup = false;
var cdown = false;
var print = false;
var del = false;
var map = {};

exports.update = function(events) {
   for (var i = 0; i < events.length; ++i) {
      var e = events[i];
      var inst = e[0];
      if (inst == "load") {
         load = true;
      } else if (inst == "keydown") {
         var keyCode = e[1];
         if (keyCode == 65) {
            left = true;
            cleft = true;
         } else if (keyCode == 68) {
            cright = true;
            right = true;
         } else if (keyCode == 87) {
            cup = true;
         } else if (keyCode == 83) {
            cdown = true;
         } else if (keyCode == 74) {
            del = true;
         } else if (keyCode == 75) {
            tryJump = true;
            print = true;
         }
         //console.log("d" + keyCode);
      } else if (inst == "keyup") {
         var keyCode = e[1];
         if (keyCode == 65) {
            left = false;
         } else if (keyCode == 68) {
            right = false;
         }
         //console.log("u" + keyCode);
      }
   }   

   var instructions = [];
   var tx = 2;
   var ty = 2;  
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
      for (var p in map) {
         if (map.hasOwnProperty(p)) {
            var o = map[p];
            instructions.push.apply(instructions, [
              { "draw": ["ft", tx * 32, ty * 32, 32, 32, o.x, o.y, 32, 32] }
            ]);
         }
      }

      load = false;
   }

   instructions.push({ "scanvas": "cursor" });
   instructions.push({ "crect": [cx * 32, cy * 32, 32, 32] });
  
   if (cleft) {
      --cx;
      if (cx < 0) {
         cx = 0;
      }
      cleft = false;
   }
   if (cup) {
      --cy;
      if (cy < 0) {
         cy = 0;
      }
      cup = false;
   }
   if (cright) {
      ++cx;
      if (cx > 15) {
         cx = 15;
      }
      cright = false;
   }
   if (cdown) {
      ++cy;
      if (cy > 15) {
         cy = 15;
      }
      cdown = false;
   }

   if (print) {
      var o = { x: cx * 32, y: cy * 32 };
      map[cx.toString() + "," + cy.toString()] = o;
      instructions.push({ "scanvas": "blocks" });
      instructions.push({ "crect": [o.x, o.y, 32, 32] });
      instructions.push({ "draw": ["ft", tx * 32, ty * 32, 32, 32, o.x, o.y, 32, 32] });
      print = false;
   }
   if (del) {
      var k = cx.toString() + "," + cy.toString();
      if (map.hasOwnProperty(k)) {
         var o = map[k];
         instructions.push({ "scanvas": "blocks" });
         instructions.push({ "crect": [o.x, o.y, 32, 32] });
         delete map[k];
      }
      del = false;
   }
  
   instructions.push({ "scanvas": "main" });
   instructions.push({ "crect": [x, y, 30, 30] });
  
   if (left) {
      x -= 2;
   }
   if (right) {
      x += 2;
   }
  
   if (tryJump) {
      if (y == baseY) {
         instructions.push({ "play": "jump" });
         isJumping = true;
      }
      tryJump = false;
   }
   if (isJumping) {
      y -= 6 - g;
      g += 0.2;
      if (y >= baseY) {
         y = baseY;
         g = 0;
         isJumping = false;
      }
   }
   
   instructions.push.apply(instructions, [
      { "draw": ["car", x, y] }
   ]);
   var cxc = cx * 32;
   var cyc = cy * 32
   instructions.push.apply(instructions, [
      { "scanvas": "cursor" },
      { "sstyle": "#FF0000" },
      { "draw": ["cursor", cxc, cyc] }
   ]);
   return instructions;
};