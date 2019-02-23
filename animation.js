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
   
   draw(instructions, x, y) {
      instructions.push(["d", [this.name, cxc, cyc]]);
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
}

class AnimationObject {
   constructor(aClass, x, y) {
      this.aClass = aClass;
      this.x = x;
      this.y = y;
      this.objects = {};
      this.frames = aClass.definition.frames;
      this.frame = 0;
      this.dList = {};
      if (aClass.definition.oninit) {
         aClass.definition.oninit(this);
      }
   }
   
   draw(instructions, x, y) {
      var onframes = this.aClass.definition.onframes;
      if (onframes) {
         if (onframes.hasOwnProperty(this.frame)) {
            onframes[this.frame](this);
         }
      }
      for (var p in this.dList) {
         if (this.dList.hasOwnProperty(p)) {
            this.dList[p].draw(instructions, x + this.x, y + this.y);
         }
      }
      this.frame += 1;
      if (this.frame >= this.frames) {
         this.frame = 0;
      }
   }
   
   clear(instructions, x, y) {
      for (var p in this.dList) {
         if (this.dList.hasOwnProperty(p)) {
            this.dList[p].clear(instructions, x + this.x, y + this.y);
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