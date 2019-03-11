class KeyHandlers {
   constructor(config) {
      this.config = config;
   }
   
   getHandler(keyCode) {
      var key;
      switch (keyCode) {
         case 68: // D, right
            key = "right";
            break;
         case 65: // A, left
            key = "left";
            break;
         case 83: // S, down
            key = "down";
            break;
         case 87: // W, up
            key = "up";
            break;
         case 75: // K, jump
            key = "jump";
            break;
         case 74: // J, attack
            key = "attack";
            break;
         case 86: // V, select
            key = "select";
            break;
         case 66: // B, start
            key = "start";
            break;
      }
      if (key && this.config.hasOwnProperty(key)) {
         return this.config[key];
      }
   }
}

module.exports = function() {
   var player;
   var dirStack = [];

   var startMovingFs = {
      left: function() {
         player.objects.run.frame = 0;
         player.dList = { run: player.objects.run };
      },
      right: function() {
         player.objects.jump.frame = 0;
         player.dList = { jump: player.objects.jump };
      }
   };

   var stopMovingFs = {
      left: function() {
         player.objects.idle.frame = 0;
         player.dList = { idle: player.objects.idle };
      },
      right: function() {
         player.objects.idle.frame = 0;
         player.dList = { idle: player.objects.idle };
      }
   };

   var keyDownHandlers = new KeyHandlers({
      left: function() {
         var i = dirStack.indexOf("left");
         if (i < 0) {
            dirStack.push("left");
            startMovingFs["left"]();
         }
      },
      right: function() {
         var i = dirStack.indexOf("right");
         if (i < 0) {
            dirStack.push("right");
            startMovingFs["right"]();
         }
      },
      up: function() {
      },
      down: function() {
      },
      jump: function() {
      },
      attack: function() {
      },
      start: function() {
      },
      select: function() {
      }
   });

   var keyUpHandlers = new KeyHandlers({
      left: function() {
         var i = dirStack.indexOf("left");
         if (i > -1) {
            if (dirStack[dirStack.length - 1] == "left") {
               stopMovingFs["left"]();
               dirStack.splice(i, 1);
               if (dirStack.length > 0) {
                  startMovingFs[dirStack[dirStack.length - 1]]();
               }
            } else {
               dirStack.splice(i, 1);
            }
         }
      },
      right: function() {
         var i = dirStack.indexOf("right");
         if (i > -1) {
            if (dirStack[dirStack.length - 1] == "right") {
               stopMovingFs["right"]();
               dirStack.splice(i, 1);
               if (dirStack.length > 0) {
                  startMovingFs[dirStack[dirStack.length - 1]]();
               }
            } else {
               dirStack.splice(i, 1);
            }
         }
      },
      up: function() {
      },
      down: function() {
      },
      jump: function() {
      },
      attack: function() {
      },
      start: function() {
      },
      select: function() {
      }
   });

   var load = false;

   return function(events, instructions) {
      if (!load) {
         load = true;
         player = this.tags["player"];
      }
      if (events.length > 0) {
         for (var i = 0; i < events.length; ++i) {
            var e = events[i];
            var ec = e[0];
            switch (ec) {
               case "keydown":
                  var keyCode = e[1];
                  var h = keyDownHandlers.getHandler(keyCode);
                  if (h) {
                     h();
                  }
                  break;
               case "keyup":
                  var keyCode = e[1];
                  var h = keyUpHandlers.getHandler(keyCode);
                  if (h) {
                     h();
                  }
                  break;
            }
         }
      }
   };
};
