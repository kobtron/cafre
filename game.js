// Game specific code.
var load = true;
var left = false;
var right = false;
var baseY = 200 - 30;
var x = 8;
var y = baseY;
var tryJump = false;
var isJumping = false;
var g = 0;

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
         } else if (keyCode == 68) {
            right = true;
         } else if (keyCode == 75) {
            tryJump = true;
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
  
  if (left) {
     x -= 2;
  }
  if (right) {
     x += 2;
  }
  var instructions = [];
  
  if (load) {
     instructions.push.apply(instructions, [
        { "tex": ["car", "car.png"] },
        { "smpl": ["jump", "jump.ogg"] },
        { "mus": ["cafre", "cafre.mp3"] },
        { "pmus": "cafre" }
     ]);
     load = false;
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
     "clear",
     { "text": ["Move with A and D. Jump with K.", 8, 8] },
     { "draw": ["car", x, y] }
  ]);
  return instructions;
};