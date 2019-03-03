var randomstring = require("randomstring");

module.exports = {};

class HtmlBody {
   constructor() {
   }
   
   appendChild(instructions, node) {
      instructions.push(["e", [`
var body = document.getElementsByTagName('body')[0];
var node = nodes[` + JSON.stringify(node.id) + `];
body.appendChild(node);
`]]);
   }
}
module.exports.HtmlBody = HtmlBody;

function getCreateElementInst(type, id) {
   type = JSON.stringify(type);
   id = JSON.stringify(id);
   return ["e", [`
nodes[` + id + `] = document.createElement(` + type + `);
nodes[` + id + `].setAttribute("id", ` + id + `);
`]];
}

function setId(id) {
   if (!id) {
      this.id = "rnd-" + randomstring.generate();
   } else {
      this.id = id;
   }
}

var nodes = {};

class HtmlElement {
   constructor() {
      this.eventListeners = {};
   }
   load(instructions) {
      instructions.push(getCreateElementInst(this.type, this.id));
      nodes[this.id] = this;
   }
   
   setAttribute(instructions, name, value) {
      var id = JSON.stringify(this.id);
      name = JSON.stringify(name);
      value = JSON.stringify(value);
      instructions.push(["e", [`nodes[` + id + `].setAttribute(` + name + `, ` + value + `);`]]);
   }
   
   appendChild(instructions, node) {
      var id = JSON.stringify(this.id);
      var nodeId = JSON.stringify(node.id);
      instructions.push(["e", [`nodes[` + id + `].appendChild(nodes[` + nodeId + `]);`]]);
   }
   
   remove(instructions) {
      var id = JSON.stringify(this.id);
      instructions.push(["e", [`var node = nodes[` + id + `];if (node.parentNode) node.parentNode.removeChild(node); delete nodes[` + id + `];`]]);
      delete nodes[this.id];
   }
   
   addClass(instructions, className) {
      var id = JSON.stringify(this.id);
      className = JSON.stringify(className);
      instructions.push(["e", [`var node = nodes[` + id + `];node.classList.add(` + className + `);`]]);
   }

   removeClass(instructions, className) {
      var id = JSON.stringify(this.id);
      className = JSON.stringify(className);
      instructions.push(["e", [`var node = nodes[` + id + `];node.classList.remove(` + className + `);`]]);
   }
   
   addEventListener(instructions, e, f) {
      var id = JSON.stringify(this.id);
      var je = JSON.stringify(e);
      instructions.push(["e", [`
var node = nodes[` + id + `];
node.addEventListener(` + je + `, function(e) {
   events.push(["ev", ` + je + `, ` + id + `, {keyCode:e.keyCode,offsetX:e.offsetX,offsetY:e.offsetY,button:e.button}]);
});`]]);
      if (!this.eventListeners[e]) {
         this.eventListeners[e] = [];
      }
      this.eventListeners[e].push(f);
   }
   
   triggerEvent(instructions, e) {
      var t = e[1];
      if (this.eventListeners.hasOwnProperty(t)) {
         var listeners = this.eventListeners[t];
         for (var i = 0; i < listeners.length; ++i) {
            listeners[i].call(this, e, instructions);
         }
      }
   }
}

module.exports.HtmlElement = HtmlElement;

class HtmlDiv extends HtmlElement {
   constructor(id) {
      super();
      setId.call(this, id);
      this.type = "div";
   }   
}
module.exports.HtmlDiv = HtmlDiv;

class HtmlCanvas extends HtmlElement {
   constructor(id) {
      super();
      setId.call(this, id);
      this.type = "canvas";
   }
}
module.exports.HtmlCanvas = HtmlCanvas;

class HtmlUl extends HtmlElement {
   constructor(id) {
      super();
      setId.call(this, id);
      this.type = "ul";
   }
}
module.exports.HtmlUl = HtmlUl;

class HtmlLi extends HtmlElement {
   constructor(id) {
      super();
      setId.call(this, id);
      this.type = "li";
   }   
}
module.exports.HtmlLi = HtmlLi;

class HtmlSpan extends HtmlElement {
   constructor(id) {
      super();
      setId.call(this, id);
      this.type = "span";
   }
   
   setInnerHtml(instructions, html) {
      html = JSON.stringify(html);
      var id = JSON.stringify(this.id);
      instructions.push(["e", [`nodes[` + id + `].innerHTML = ` + html + `;`]]);
   }
}
module.exports.HtmlSpan = HtmlSpan;

module.exports.handleEvents = function(events, instructions) {
   for (var i = 0; i < events.length; ++i) {
      var e = events[i];
      var inst = e[0];
      if (inst == "ev") {
         var node = nodes[e[2]];
         if (node) {
            node.triggerEvent(instructions, e);
         }
      }
   }
};
