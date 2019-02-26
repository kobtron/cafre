const fs = require('fs');

module.exports = function(path) {
   if (!fs.existsSync(path + "/ground")){
      fs.mkdirSync(path + "/ground");
   }
   var x = 120;
   var y = 150;
   var offset = 1;
   var files = {};
   var w = 16;
   var h = 16;
   var tbc = []
   var tb = [tbc];
   for (var j = 0; j < 3; ++j) {
      for (var i = 0; i < 3; ++i) {
         var file = {
            "texture": "mario-ground.tex",
            "x": x + (i * w) + (i * offset),
            "y": y + (j * h) + (j * offset),
            "w": w,
            "h": h
         };
         fs.writeFileSync(path + "/ground/ground-" + i + "-" + j + ".sprt", JSON.stringify(file));
         var anim = {
            "w": 16,
            "h": 16,
            "objects": {
               "main": {
                  "file": "ground/ground-" + i + "-" + j + ".sprt",
                  "x": 0,
                  "y": 0
               }
            },
            "frames": 1,
            "oninit": ["main"]
         };
         var animFn = "ground/ground-" + i + "-" + j + ".anim";
         fs.writeFileSync(path + "/" + animFn, JSON.stringify(anim));
         tbc.push(animFn);
      }
   }
   fs.writeFileSync(path + "/ground.tb", JSON.stringify(tb));
};
