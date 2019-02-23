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
var txtClass = new anim.TextureClass("mario", "tex/mario.png");
var txtObj = new anim.TextureObject(txtClass, 100, 100);
var sprtClass = new anim.SpriteClass(txtClass, 1, 10, 16, 24);
var sprtClass2 = new anim.SpriteClass(txtClass, 18, 10, 16, 24);
var sprtObj = new anim.SpriteObject(sprtClass, 0, 0);
var sprtObj2 = new anim.SpriteObject(sprtClass2, 50, 50);
var animClass = new anim.AnimationClass({
   oninit: function(obj) {
      obj.objects.walk0 = new anim.SpriteObject(sprtClass, 0, 0);
      obj.objects.walk1 = new anim.SpriteObject(sprtClass2, 0, 0);
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
var animObj = new anim.AnimationObject(animClass, 10, 10);
var animClass2 = new anim.AnimationClass({
   oninit: function(obj) {
      obj.objects.anim0 = new anim.AnimationObject(animClass, 0, 0);
      obj.objects.anim1 = new anim.AnimationObject(animClass, 16, 16);
      obj.dList = { anim0: obj.objects.anim0, anim1: obj.objects.anim1 };
   },
   frames: 1
});
var animObj2 = new anim.AnimationObject(animClass2, 50, 50);
var html = require("./html");
var body = new html.HtmlBody();
var filebrowser = new html.HtmlDiv("filebrowser");
var viewport = new html.HtmlDiv("viewport");
var main = new html.HtmlCanvas("main");
var root = new html.HtmlUl();
var selected;

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
   } else if (name.endsWith(".png")) {
      caret = "&#x1F4F7;";
   } else if (name.endsWith(".js")) {
      caret = "&#x1F4BB;";
   } else {
      caret = "&#x1F4C4;";
   }
   
   span.setInnerHtml(is, caret + " " + name);
   li.fileName = name;
   li.addEventListener(is, "click", function(e, is) {
      if (selected) {
         selected.removeClass(is, "selected");
      }
      this.addClass(is, "selected");
      selected = this;
      
   });
}

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
      var path = "./content";
      var dir = await readdirAsync(path);
      for (var i = 0; i < dir.length; ++i) {
         createFileElement(is, root, dir[i], path);
      }
      selected = undefined;
      instructions.push.apply(instructions, [
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
      }
      txtClass.load(instructions);
   }

   instructions.push(["sc", ["main"]]);
   animObj2.clear(instructions, 10, 10);
   animObj2.draw(instructions, 10, 10);
   cursor.update(events, instructions);
   car.update(events, instructions);
   if (load) {
      load = false;
   }
   return instructions;
};