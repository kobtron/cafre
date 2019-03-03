function getClearRectInst(x, y, w, h) {
   return ["cr", [x, y, w, h]];
}

function getDrawInst(name, sx, sy, sw, sh, x, y, w, h) {
   return ["d", [name, sx, sy, sw, h, x, y, w, h]];
}

class TextureClass {
   constructor(name, src) {
      this.name = name;
      this.src = src;
   }
   
   load(instructions) {
      instructions.push(["lt", [this.name, this.src]]);
   }
   unload(instructions) {
   }
   
   draw(instructions, x, y) {
      instructions.push(["d", [this.name, x, y]]);
   }
   
   drawSprite(instructions, x, y, w, h, sx, sy) {
      instructions.push(getDrawInst(this.name, sx, sy, w, h, x, y, w, h));
   }
   
   clearSprite(instructions, x, y, w, h) {
      instructions.push(getClearRectInst(x, y, w, h));
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
   
   clear(instructions, x, y) {
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
   
   load(instructions) {
   }
   unload(instructions) {
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
   
   load(instructions) {
      if (this.definition.layers) {
         for (var i = 0; i < this.definition.layers.length; ++i) {
            var l = this.definition.layers[i];
            if (!l.preRender) {
               instructions.push(["cc", ["layer-" + i, l.z, l.x, l.y, l.w, l.h]]);
            } else {
               for (var p in l.preRender) {
                  if (l.preRender.hasOwnProperty(p)) {
                     instructions.push(["cc", ["layer-" + i + "-" + p, l.z, l.x, l.y, l.w, l.h, !l.staticPreRender]]);               
                  }
               }
            }
         }
      }
   }
   unload(instructions) {
      if (this.definition.layers) {
         for (var i = 0; i < this.definition.layers.length; ++i) {
            var l = this.definition.layers[i];
            if (!l.preRender) {
               instructions.push(["dc", ["layer-" + i]]);
            } else {
               for (var p in l.preRender) {
                  if (l.preRender.hasOwnProperty(p)) {
                     instructions.push(["dc", ["layer-" + i + "-" + p]]);
                  }
               }
            }
         }
      }
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
      this.isLayer = aClass.definition.isLayer;
      this.layerNumber = aClass.definition.layerNumber;
      this.preRender = aClass.definition.preRender;
      this.staticPreRender = aClass.definition.staticPreRender;
      this.dList = {};
      if (aClass.definition.oninit) {
         aClass.definition.oninit(this);
      }
   }
   
   drawObjects(instructions, dx, dy) {
      for (var p in this.dList) {
         if (this.dList.hasOwnProperty(p)) {
            this.dList[p].draw(instructions, dx, dy);
         }
      }
      if (this.selected) {
         var sx;
         var sy;
         if (!this.aClass.definition.isLayer) {
            sx = this.x;
            sy = this.y;
         } else {
            sx = 0;
            sy = 0;
         }
         instructions.push(["ss", ["#0000FF"]]);
         instructions.push(["sr", [sx + 0.5, sy + 0.5, this.aClass.definition.w - 1, this.aClass.definition.h - 1]]);
      }
   }
   
   draw(instructions, x, y) {
      var onframes = this.aClass.definition.onframes;
      if (onframes) {
         if (onframes.hasOwnProperty(this.frame)) {
            onframes[this.frame](this, instructions);
         }
      }
      if (!this.preRender) {
         if (this.canvas) {
            instructions.push(["sc", [this.canvas]]);
         }
         var dx;
         var dy;
         if (!this.aClass.definition.isLayer) {
            dx = x + this.x;
            dy = y + this.y;
         } else {
            dx = 0;
            dy = 0;
         }
         this.drawObjects(instructions, dx, dy);
         if (this.layers) {
            for (var i = 0; i < this.layers.length; ++i) {
               var l = this.layers[i];
               l.draw(instructions, dx, dy);
            }
         }
      }
      this.frame += 1;
      if (this.frame >= this.frames) {
         this.frame = 0;
      }
   }
   
   clear(instructions, x, y) {
      if (!this.preRender) {
         if (this.canvas) {
            instructions.push(["sc", [this.canvas]]);
         }
         var dx;
         var dy;
         if (!this.aClass.definition.isLayer) {
            dx = x + this.x;
            dy = y + this.y;
         } else {
            dx = 0;
            dy = 0;
         }
         for (var p in this.dList) {
            if (this.dList.hasOwnProperty(p)) {
               this.dList[p].clear(instructions, dx, dy);
            }
         }      
         if (this.selected) {
            instructions.push(getClearRectInst(dx, dy, this.aClass.definition.w, this.aClass.definition.h));         
         }
         if (this.layers) {
            for (var i = 0; i < this.layers.length; ++i) {
               var l = this.layers[i];
               l.clear(instructions, dx, dy);
            }
         }
      }
   }
   
   mousedown(e) {
      if (this.onmousedown) {
         this.onmousedown.call(this, e);
      }
   }
   mousemove(e) {
      if (this.onmousemove) {
         this.onmousemove.call(this, e);
      }
   }
   mouseup(e) {
      if (this.onmouseup) {
         this.onmouseup.call(this, e);
      }
   }
   
   sendFrame(f) {
      this.frame = f % this.frames;
      if (this.dList) {
         for (var p in this.dList) {
            if (this.dList.hasOwnProperty(p)) {
               var o = this.dList[p];
               if (o.sendFrame) {
                  o.sendFrame(f);
               }
            }
         }
      }
   }
}

module.exports = {
   TextureClass: TextureClass,
   TextureObject: TextureObject,
   SpriteClass: SpriteClass,
   SpriteObject: SpriteObject,
   AnimationClass: AnimationClass,
   AnimationObject: AnimationObject,
   getClearRectInst: getClearRectInst,
   getDrawInst: getDrawInst
};