const fs = require('fs');

function createAnimation(name, x, y, tbc, path) {
   var anim = {
      "w": 16,
      "h": 16,
      "objects": {
      },
      "frames": 64,
      "animation": {
      }
   };
   for (var i = 0; i < 4; ++i) {
      var file = {
         "texture": "mario-tiles.tex",
         "x": x + (i * 16),
         "y": y,
         "w": 16,
         "h": 16
      };
      var fn = "animated/" + name + "-" + i + ".sprt";
      fs.writeFileSync(path + "/" + fn, JSON.stringify(file));
      anim.objects[name + "-" + i] = {
         "file": fn,
         "x": 0,
         "y": 0
      };
      anim.animation[(i * 16).toString()] = [name + "-" + i];
   }
   var afn = "animated/" + name + ".anim";
   tbc.push(afn);
   fs.writeFileSync(path + "/" + afn, JSON.stringify(anim));
}

module.exports = function(path) {
   if (!fs.existsSync(path + "/animated")) {
      fs.mkdirSync(path + "/animated");
   }
   var tbc = [];
   createAnimation("coin", 0, 0, tbc, path);
   createAnimation("bcoin", 0, 16, tbc, path);
   createAnimation("qblock", 0, 64, tbc, path);
   createAnimation("block", 0, 80, tbc, path);
   createAnimation("bblock", 0, 96, tbc, path);
   createAnimation("nblock", 0, 224, tbc, path);
   createAnimation("water", 96, 208, tbc, path);
   createAnimation("lava", 96, 240, tbc, path);
   createAnimation("lodo", 160, 240, tbc, path);
   var anim = {
      "w": tbc.length * 16 + tbc.length - 1,
      "h": 16,
      "objects": {
      },
      "frames": 1,
      "oninit": []
   };
   for (var i = 0; i < tbc.length; ++i) {
      anim.objects["tool-" + i] = {
         "file": tbc[i],
         "x": i * 16 + (i * 1),
         "y": 0
      };
      anim.oninit.push("tool-" + i);
   }
   fs.writeFileSync(path + "/animated.tb", JSON.stringify(anim));
};
