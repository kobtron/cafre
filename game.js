const fs = require('fs');

function readdirAsync(path) {
  return new Promise(function (resolve, reject) {
    fs.readdir(path, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

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
         if (inst == "keydown") {
            var keyCode = e[1];
            if (keyCode == 65) {
               this.left = true;
            } else if (keyCode == 68) {
               this.right = true;
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
      instructions.push(["sc", ["main"]]);
      instructions.push(["cr", [this.x, this.y, 30, 30]]);
      if (this.left) {
         this.x -= 2;
      }
      if (this.right) {
         this.x += 2;
      }
  
      if (this.tryJump) {
         if (!this.isJumping) {
            instructions.push(["p", ["jump"]]);
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
   
      instructions.push(["d", ["car", this.x, this.y]]);
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
      
      instructions.push(["sc", ["cursor"]]);
      instructions.push(["cr", [this.cx * 32, this.cy * 32, 32, 32]]);
     
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
         instructions.push(["sc", ["blocks"]]);
         instructions.push(anim.getClearRectInst(o.x, o.y, 32, 32));
         instructions.push(anim.getDrawInst("ft", tx * 32, ty * 32, 32, 32, o.x, o.y, 32, 32));
         this.print = false;
      }
      if (this.del) {
         var k = this.cx.toString() + "," + this.cy.toString();
         if (this.map.hasOwnProperty(k)) {
            var o = this.map[k];
            instructions.push(["sc", ["blocks"]]);
            instructions.push(anim.getClearRectInst(o.x, o.y, 32, 32));
            delete this.map[k];
         }
         this.del = false;
      }
     
      var cxc = this.cx * 32;
      var cyc = this.cy * 32;
      instructions.push.apply(instructions, [
         ["sc", ["cursor"]],
         ["d", ["cursor", cxc, cyc]]
      ]);
   }
}

var load = true;
var car = new Car();
var cursor = new Cursor();
var anim = require("./animation");
var html = require("./html");
var body = new html.HtmlBody();
var filebrowser = new html.HtmlDiv("filebrowser");
var viewport = new html.HtmlDiv("viewport");
var main = new html.HtmlCanvas("main");
var root = new html.HtmlUl();
var selected;
var path = "./classes";
var cObj = undefined;
var cClass = undefined;
var lCObj = false;

var textureClasses = {};
var spriteClasses = {};
var animationClasses = {};

function loadTextureClass(path, fileName, is) {
   var tc;
   if (!textureClasses.hasOwnProperty(fileName)) {
      var contents = fs.readFileSync(path + "/" + fileName, 'utf8');
      var td = JSON.parse(contents);
      tc = new anim.TextureClass(td.name, td.src);
      tc.load(is);
      textureClasses[fileName] = tc;
   } else {
      tc = textureClasses[fileName];
   }
   return tc;
}

function loadSpriteClass(path, fileName, is) {
   var sc;
   if (!spriteClasses.hasOwnProperty(fileName)) {
      var contents = fs.readFileSync(path + "/" + fileName, 'utf8');
      var def = JSON.parse(contents);
      var tc = loadTextureClass(path, def.texture, is);
      sc = new anim.SpriteClass(tc, def.x, def.y, def.w, def.h);
      sc.load(is);
      spriteClasses[fileName] = sc;
   } else {
      sc = spriteClasses[fileName];
   }
   return sc;
}

function loadAnimationClassByDef(path, def, is) {
   var ac = (function(def) {
      var config = {
         frames: def.frames,
         w: def.w,
         h: def.h,
         layers: def.layers,
         isLayer: def.isLayer,
         layerNumber: def.layerNumber,
         preRender: def.preRender,
         staticPreRender: def.staticPreRender
      };
      if (def.layers) {
         for (var i = 0; i < def.layers.length; ++i) {
            var l = def.layers[i];
            l.isLayer = true;
            l.layerNumber = i;
            if (l.fit) {
               var ff = l.objects[l.fit].file;
               var c = loadAnimationClass(path, ff, is);
               l.w = c.definition.w;
               l.h = c.definition.h;
            }
         }
      }
      if (def.objects || def.layers || def.preRender) {
         config.oninit = function(obj) {
            if (def.objects) {
               for (var p in def.objects) {
                  if (def.objects.hasOwnProperty(p)) {
                     var oDef = def.objects[p];
                     if (oDef.file.endsWith(".sprt")) {
                        var c = loadSpriteClass(path, oDef.file, is);
                        obj.objects[p] = new anim.SpriteObject(c, oDef.x, oDef.y);
                     } else if (oDef.file.endsWith(".anim") || oDef.file.endsWith(".tb")) {
                        var c = loadAnimationClass(path, oDef.file, is);
                        var ao = new anim.AnimationObject(c, oDef.x, oDef.y);
                        obj.objects[p] = ao;
                        if (oDef.mapTag && obj.map) {
                           if (!obj.map.tags) {
                              obj.map.tags = {};
                           }
                           obj.map.tags[oDef.mapTag] = ao;
                           ao.mapTag = oDef.mapTag;
                        }
                     }
                  }
               }
            }
            if (def.layers) {
               obj.layers = [];
               for (var i = 0; i < def.layers.length; ++i) {
                  var l = def.layers[i];
                  var c = loadAnimationClassByDef(path, l, is);
                  c.load(is);
                  var o = new anim.AnimationObject(c, l.x, l.y, obj);
                  o.canvas = "layer-" + i;
                  obj.layers.push(o);
               }
            }
            if (def.oninit) {
               obj.dList = {};
               for (var i = 0; i < def.oninit.length; ++i) {
                  var name = def.oninit[i];
                  obj.dList[name] = obj.objects[name];
               }
            }
            if (def.preRender) {
               for (var p in def.preRender) {
                  if (def.preRender.hasOwnProperty(p)) {
                     is.push(["sc", ["layer-" + obj.layerNumber + "-" + p]]);
                     obj.sendFrame(parseInt(p));
                     obj.drawObjects(is, 0, 0);
                  }
               }
               obj.sendFrame(0);
            }
         }
      }
      if (def.animation) {
         config.onframes = {};
         for (var p in def.animation) {
            if (def.animation.hasOwnProperty(p)) {
               var d = def.animation[p];
               config.onframes[p] = (function(d) {
                  return function(obj) {
                     obj.dList = {};
                     for (var i = 0; i < d.length; ++i) {
                        obj.dList[d[i]] = obj.objects[d[i]];
                     }
                  }
               })(d);
            }
         }
      }
      if (def.preRender && !def.staticPreRender) {
         config.onframes = {};
         for (var p in def.preRender) {
            if (def.preRender.hasOwnProperty(p)) {
               config.onframes[p] = (function(p) {
                  return function(obj, instructions) {
                     if (obj.shownCel) {
                        instructions.push(["hic", [obj.shownCel]]);
                     }
                     obj.shownCel = "layer-" + obj.layerNumber + "-" + p;
                     instructions.push(["shc", [obj.shownCel]]);
                  }
               })(p);
            }
         }         
      }
      if (def.behaviour) {
         config.behaviour = require(path + "/" + def.behaviour)();
      }
      var animClass = new anim.AnimationClass(config);
      return animClass;
   })(def);
   return ac;
}

function loadAnimationClass(path, fileName, is) {
   var ac;
   if (!animationClasses.hasOwnProperty(fileName)) {
      var contents = fs.readFileSync(path + "/" + fileName, 'utf8');
      var def = JSON.parse(contents);
      ac = loadAnimationClassByDef(path, def, is);
      ac.load(is);
      animationClasses[fileName] = ac;
   } else {
      ac = animationClasses[fileName];
   }
   return ac;
}

function createFileElement(is, root, name, path) {
   var li = new html.HtmlLi();
   li.load(is);
   li.setAttribute(is, "style", "cursor: default;");
   var span = new html.HtmlSpan();
   span.load(is);
   root.appendChild(is, li);
   li.appendChild(is, span);
   var caret = "";
   var isDir = fs.lstatSync(path + "/" + name).isDirectory();
   if (isDir) {
      caret = "&#x1F4C1;";
   } else if (name.endsWith(".ogg") || name.endsWith(".mp3")) {
      caret = "&#x1F509;";
   } else if (name.endsWith(".png") || name.endsWith(".svg")) {
      caret = "&#x1F4F7;";
   } else if (name.endsWith(".js")) {
      caret = "&#x1F4BB;";
   } else {
      caret = "&#x1F4C4;";
   }
   
   span.setInnerHtml(is, caret + " " + name);
   li.fileName = name;
   li.addEventListener(is, "click", function(e, is) {
      if (cClass) {
         cClass.unload(is);
      }
      if (selected) {
         selected.removeClass(is, "selected");
      }
      this.addClass(is, "selected");
      selected = this;
      is.push(["sc", ["main"]]);
      is.push(["cr", [0, 0, 512, 512]]);
      textureClasses = {};
      spriteClasses = {};
      animationClasses = {};
      cClass = undefined;
      cObj = undefined;
      lCObj = false;
      if (this.fileName.endsWith(".tex")) {
         cClass = loadTextureClass(path, this.fileName, is);
         cObj = new anim.TextureObject(cClass, 0, 0);
         lCObj = true;
      } else if (this.fileName.endsWith(".sprt")) {
         cClass = loadSpriteClass(path, this.fileName, is);
         cObj = new anim.SpriteObject(cClass, 0, 0);
         lCObj = true;         
      } else if (this.fileName.endsWith(".anim")) {
         cClass = loadAnimationClass(path, this.fileName, is);
         cObj = new anim.AnimationObject(cClass, 0, 0);
         lCObj = true;         
      } else if (this.fileName.endsWith(".js")) {
         require(path + "/" + this.fileName.substring(0, this.fileName.length - 3))(path);
      } else if (this.fileName.endsWith(".tb")) {
         cClass = loadAnimationClass(path, this.fileName, is);
         cObj = new anim.AnimationObject(cClass, 0, 0);
         lCObj = true;         
      } else if (this.fileName.endsWith(".map")) {
         cClass = loadAnimationClass(path, this.fileName, is);
         cObj = new anim.AnimationObject(cClass, 0, 0);
         /*cObj.isMap = true;
         cObj.onmousedown = function(e) {
            if (e[3].button == 0) {
               for (var p in this.dList) {
                  if (this.dList.hasOwnProperty(p)) {
                     var o = this.dList[p];
                     o.selected = true;
                     this.sObj = o;
                     this.lCX = e[3].offsetX;
                     this.lCY = e[3].offsetY;
                     break;
                  }
               }
            }
         };
         cObj.onmousemove = function(e) {
            if (this.sObj) {
               var x = e[3].offsetX;
               var y = e[3].offsetY;
               this.sObj.x += x - this.lCX;
               this.sObj.y += y - this.lCY;
               this.lCX = x;
               this.lCY = y;
            }
         };
         cObj.onmouseup = function(e) {
            if (this.sObj) {
               this.sObj = null;
            }
         };
         cObj.canvas = "main";*/
         lCObj = true;         
      }
   });
}

var clickEvent;

exports.update = async function(events) {
   var instructions = [];
   for (var i = 0; i < events.length; ++i) {
      var e = events[i];
      var inst = e[0];
      if (inst == "load") {
         load = true;
      }
   }
   
   html.handleEvents(events, instructions);
   
   if (load) {
      textureClasses = {};
      spriteClasses = {};
      animationClasses = {};
      var is = instructions;
      filebrowser.load(is);
      viewport.load(is);
      main.load(is);
      root.load(is);
      body.appendChild(is, filebrowser);
      filebrowser.appendChild(is, root);
      body.appendChild(is, viewport);
      main.setAttribute(is, "width", "512");
      main.setAttribute(is, "height", "512");
      viewport.appendChild(is, main);
      is.push(["e", [`
var c = nodes["main"];
window.ctx = c.getContext("2d");
canvases["main"] = { c: c, ctx: ctx };
`]]);
      var dir = await readdirAsync(path);
      for (var i = 0; i < dir.length; ++i) {
         createFileElement(is, root, dir[i], path);
      }
      selected = undefined;
      cClass = undefined;
      cObj = undefined;
      viewport.addEventListener(is, "mousedown", function(e, is) {
         clickEvent = ["mousedown", e];
      });
      viewport.addEventListener(is, "mousemove", function(e, is) {
         clickEvent = ["mousemove", e];
      });
      viewport.addEventListener(is, "mouseup", function(e, is) {
         clickEvent = ["mouseup", e];
      });
      /*instructions.push.apply(instructions, [
         ["lt", ["car", "tex/car.png"]],
         ["lt", ["ft", "tex/fantasy-tileset.png"]],
         ["ls", ["jump", "jump.ogg"]],
         ["lm", ["cafre", "cafre.mp3"]],
         ["cc", ["blocks", 1]],
         ["lt", ["cursor", "tex/cursor.png"]],
         ["cc", ["cursor", 2]],
         ["cc", ["console", 3]],
         ["sc", ["console"]],
         ["sfs", ["#FFFFFF"]],
         ["dt", ["Move with A and D. Jump with K.", 8, 8]],
         //["pm", ["cafre"]]
      ]);
      
      instructions.push(["sc", ["blocks"]]);
      for (var p in cursor.map) {
         if (cursor.map.hasOwnProperty(p)) {
            var o = cursor.map[p];
            instructions.push(["d", ["ft", tx * 32, ty * 32, 32, 32, o.x, o.y, 32, 32]]);
         }
      }*/
   }
   if (lCObj) {
      lCObj = false;
   }
   if (cObj) {
      cObj.clear(instructions, 0, 0);
      if (cObj.update) {
         cObj.update(events, instructions);
      }
      if (cObj.isMap && clickEvent) {
         cObj[clickEvent[0]](clickEvent[1]);
      }
      cObj.draw(instructions, 0, 0);
   }
   if (clickEvent) {
      clickEvent = null;
   }

   /*instructions.push(["sc", ["main"]]);
   animObj2.clear(instructions, 10, 10);
   animObj2.draw(instructions, 10, 10);
   cursor.update(events, instructions);
   car.update(events, instructions);*/
   if (load) {
      load = false;
   }
   return instructions;
};