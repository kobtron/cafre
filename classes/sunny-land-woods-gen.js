const fs = require('fs');

function createAnimation(mname, sname, frames, flen, tbc, path, def) {
   var w = def.w;
   var h = def.h;
   var anim = {
      "w": w,
      "h": h,
      "objects": {
      },
      "frames": flen * frames,
      "animation": {
      }
   };
   var name = mname + "-" + sname;
   for (var i = 0; i < frames; ++i) {
      var si = name + "-" + (i + 1).toString();
      var src;
      if (!def.sprite || !def.sprite.src) {
         src = "Sunny-land-woods-files/SPRITES/" + mname + "/" + sname + "/" + si + ".png";
      } else {
         src = def.sprite.src;
      }
      var tFile = {
         "name": si,
         "src": src
      };
      var fn = "sunny-land-woods/" + si + ".tex";
      fs.writeFileSync(path + "/" + fn, JSON.stringify(tFile));
      var file;
      if (!def.sprite) {
         file = {
            "texture": fn,
            "x": 0,
            "y": 0,
            "w": w,
            "h": h
         };
      } else {
         file = {
            texture: fn,
            x: def.sprite.x,
            y: def.sprite.y,
            w: w,
            h: h
         };
      }
      fn = "sunny-land-woods/" + si + ".sprt";
      fs.writeFileSync(path + "/" + fn, JSON.stringify(file));
      anim.objects[si] = {
         "file": fn,
         "x": 0,
         "y": 0
      };
      anim.animation[(i * flen).toString()] = [si];
   }
   fn = "sunny-land-woods/" + name + ".anim";
   tbc.push({ name: sname, path: fn });
   fs.writeFileSync(path + "/" + fn, JSON.stringify(anim));
}

module.exports = function(path) {
   if (!fs.existsSync(path + "/sunny-land-woods")) {
      fs.mkdirSync(path + "/sunny-land-woods");
   }
   var defs = {
      player: {
         w: 90,
         h: 58,
         states: {
            run: { frames: 6, flen: 8 },
            jump: { frames: 4, flen: 6 },
            idle: { frames: 8, flen: 16 },
            hurt: { frames: 2, flen: 12 },
            crouch: { frames: 2, flen: 32 }
         },
         init: "idle"
      },
      acorn: {
         w: 16,
         h: 14,
         states: {
            normal: { frames: 3, flen: 16 }
         },
         init: "normal"
      },
      block: {
         w: 32,
         h: 32,
         states: {
            normal: { frames: 1, flen: 1 }
         },
         init: "normal",
         sprite: {
            src: "Sunny-land-woods-files/ENVIRONMENT/tileset.png",
            x: 384,
            y: 32
         }
      }
   }
   var tb = {
      "w": x,
      "h": 58,
      "objects": {
      },
      "frames": 1,
      "oninit": []
   };
   var i = 0;
   var x = 0;
   for (var p in defs) {
      if (defs.hasOwnProperty(p)) {
         var def = defs[p];
         var tbc = [];
         var mname = p;
         for (var q in def.states) {
            if (def.states.hasOwnProperty(q)) {
               var state = def.states[q];
               createAnimation(mname, q, state.frames, state.flen, tbc, path, def);
            }
         }
         var anim = {
            "w": def.w,
            "h": def.h,
            "objects": {
            },
            "frames": 1,
            "oninit": [def.init]
         };
         for (var j = 0; j < tbc.length; ++j) {
            anim.objects[tbc[j].name] = {
               "file": tbc[j].path,
               "x": 0,
               "y": 0
            };
         }
         var si = "sunny-land-woods/" + mname + ".anim";
         fs.writeFileSync(path + "/" + si, JSON.stringify(anim));
         tb.objects[p] = {
            "file": si,
            x: x,
            y: 0
         };
         tb.oninit.push(p);
         x += def.w + 1;
         ++i;
      }
   }
   fs.writeFileSync(path + "/sunny-land-woods.tb", JSON.stringify(tb));
   anim = {
      "w": 32 * 16,
      "h": 32 * 16,
      "objects": {
      },
      "frames": 1,
      "oninit": []
   };
   for (var i = 2; i < 30; ++i) {
      for (var j = 2; j < 30; ++j) {
         anim.objects[i + "-" + j] = {
            "file": "sunny-land-woods/acorn.anim",
            "x": i * 16,
            "y": j * 16
         };
         anim.oninit.push(i + "-" + j);
      }
   }
   fs.writeFileSync(path + "/sunny-land-woods/acorns.anim", JSON.stringify(anim));
   anim = {
      "w": 32 * 16,
      "h": 32 * 16,
      "objects": {
      },
      "frames": 1,
      "oninit": []
   };
   function addBlock(i, j) {
      anim.objects[i + "-" + j] = {
         "file": "sunny-land-woods/block.anim",
         "x": i * 32,
         "y": j * 32
      };
      anim.oninit.push(i + "-" + j);
   }
   for (var i = 0; i < 16; ++i) {
      addBlock(i, 0);
      addBlock(i, 15);
   }
   fs.writeFileSync(path + "/sunny-land-woods/blocks.anim", JSON.stringify(anim));
   anim = {
      "objects": {
      },
      "layers": [
         {
            "name": "acorns",
            "x": 0,
            "y": 0,
            "z": 2,
            "fit": "main",
            "objects": {
               "main": {
                  "file": "sunny-land-woods/acorns.anim",
                  "x": 0,
                  "y": 0
               }
            },
            "frames": 16 * 3,
            "oninit": ["main"],
            "preRender": {
               "0": true,
               "16": true,
               "32": true
            }
         },
         {
            "name": "blocks",
            "x": 0,
            "y": 0,
            "z": 1,
            "fit": "main",
            "objects": {
               "main": {
                  "file": "sunny-land-woods/blocks.anim",
                  "x": 0,
                  "y": 0
               }
            },
            "frames": 1,
            "oninit": ["main"],
            "preRender": {
               "0": true
            }
         },
         {
            "name": "sprites",
            "x": 0,
            "y": 0,
            "z": 3,
            w: 512,
            h: 512,
            "objects": {
               "player": {
                  "file": "sunny-land-woods/player.anim",
                  "x": 16 - (90 / 2),
                  "y": 14 * 32 - 16,
                  "mapTag": "player"
               }
            },
            "frames": 1,
            "oninit": ["player"]
         }
      ],
      "frames": 1,
      behaviour: "sunny-land-woods.js"
   }
   fs.writeFileSync(path + "/sunny-land-woods.map", JSON.stringify(anim));
};
