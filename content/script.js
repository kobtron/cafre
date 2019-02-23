window.fns = {};
var domain = "localhost";
var port = "3000";
var dAndP = domain + ":" + port;
var server = 'ws://' + dAndP;
var cServer = "http://" + dAndP;
var textures = {};
var samples = {};
var music = {};
var canvases = {};
var nodes = {};
window.events = [["load"]];


function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

fns.lt = fns.loadTexture = async function(name, src) {
   var img = document.createElement("img");
   img.setAttribute("src", cServer + "/" + src);
   textures[name] = img;
}
fns.ls = fns.loadSample = async function(name, src) {
   var smp = document.createElement("audio");
   smp.setAttribute("src", cServer + "/" + src);
   samples[name] = { smp: smp, canplay: false };
   (function(sample) {
      sample.smp.oncanplaythrough = function() {
         sample.canplay = true;
      };
   })(samples[name]);
}
fns.dt = fns.drawText = async function(txt, x, y, font) {
   if (font) {
      ctx.font = font;
   }
   ctx.fillText(txt, x, y);
}
fns.lm = fns.loadMusic = async function(name, src) {
   var smp = document.createElement("audio");
   smp.loop = true;
   smp.setAttribute("src", cServer + "/" + src);
   music[name] = smp;
}
fns.cc = fns.createCanvas = async function(name, z) {
   var c = document.createElement("canvas");
   canvases[name] = { c: c, ctx: c.getContext("2d") };
   c.setAttribute("width", "512");
   c.setAttribute("height", "512");
   document.getElementById("viewport").appendChild(c);
   if (z !== undefined) {
      c.style.zIndex = z;
   }
}
fns.sc = fns.selectCanvas = async function(args) {
   var cv = canvases[args];
   ctx = cv.ctx;
   c = cv.c;
}
fns.sfs = fns.setFontStyle = async function(args) {
   var style = args;
   ctx.fillStyle = style;
}
fns.pm = fns.playMusic = async function(name) {
   var s = music[name];
   if (s) {
      s.play();
   }
}
fns.d = fns.draw = async function() {
   var args = arguments;
   var name = args[0];
   if (args.length == 3) {
      var x = args[1];
      var y = args[2];
      var t = textures[name];
      if (t) {
         while (!t.complete) {
            await sleep(5);
         }
         ctx.drawImage(t, x, y);
      }
   } else if (args.length == 5) {
      var x = args[1];
      var y = args[2];
      var w = args[3];
      var h = args[4];
      var t = textures[name];
      if (t) {
         while (!t.complete) {
            await sleep(5);
         }
         ctx.drawImage(t, x, y, w, h);
      }
   } else if (args.length == 9) {
      var sx = args[1];
      var sy = args[2];
      var sw = args[3];
      var sh = args[4];
      var x = args[5];
      var y = args[6];
      var w = args[7];
      var h = args[8];
      var t = textures[name];
      if (t) {
         while (!t.complete) {
            await sleep(5);
         }
         ctx.drawImage(t, sx, sy, sw, sh, x, y, w, h);
      }
   }
}
fns.cr = fns.clearRect = async function(x, y, w, h) {
   ctx.clearRect(x, y, w, h);
}
fns.p = fns.play = async function(name) {
   var s = samples[name];
   if (s) {
      while (!s.canplay) {
         await sleep(5);
      }
      s.smp.play();
   }
}
fns.ss = fns.setStyle = async function(style) {
   ctx.strokeStyle = style;
}
fns.sr = fns.strokeRect = async function(x, y, w, h) {
   ctx.strokeRect(x, y, w, h);
}

fns.e = async function(code) {
   eval(code);
}
