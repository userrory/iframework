// extends src/nodes/time.js which extends src/node-box-native-view.js

$(function(){



// Thanks https://raw.github.com/BrianHicks/Markov-Generator/master/markov.js

/*sample regexes:

 /./g - every letter
 /../g - every two letter
 /[.,?"();\-!':—^\w]+ /g - every word
 /([.,?"();\-!':—^\w]+ ){2}/g - every two words 

*/ 
var markov = function(input, type, reg) {
  var data;
  if (reg===undefined) {
    reg = /[.,?"();\-!':—^\w]+ /g;
  }
  if (type == "string" || type === undefined) {
    data = {};
    s = input.match(reg);
    for (var i = 0; i < s.length-1; i++) {
      if(s[i] in data) {
        if (s[i+1] in data[s[i]]) {
          data[s[i]][s[i+1]]++;
        } else {
          data[s[i]][s[i+1]] = 1;
        }
      } else {
        data[s[i]] = {};
        data[s[i]][s[i+1]] = 1;
      }
    }
  } else if (type == "json") {
    data = JSON.parse(input);
  }
  this.data = data;
  
  var gen = function(l) {
    var sanitycheck = false;
    var out = [];
    while (sanitycheck === false) {
      sanitycheck = true;
      var rProperty = findRandomProperty(data);
      var rList = expand(rProperty);
      var l1 = rList.length;
      out[0] = rList[Math.round(Math.random() * l1)];
      if (typeof out[0] == "undefined") { sanitycheck = false; }
      if (sanitycheck) {
        for (var i = 0; i < l-1; i++) {
          var usableLength = expand(data[out[i]]).length-1;
          var randomInt = Math.round(Math.random() * usableLength);
          var nextLetter = expand(data[out[i]])[randomInt];
          out.push(nextLetter);
        }
      }
    }
    return out.join("");
  };
  this.gen = gen;
  
  var findRandomProperty = function(o) {
    var l1 = 0;
    var i;
    for (i in o) {
      l1++;
    }
    var r1 = Math.round(Math.random() * l1);
    var l2 = 0;
    for (i in o) {
      l2++;
      if (l2 == r1) {
        return o[i];
      }
    }
  };
  
  var expand = function(obj) {
    oArray = [];
    for (var prop in obj) {
      for (var i = 0; i < obj[prop]; i++) {
        oArray.push(prop);
      }
    }
    return oArray;
  };
  
  var getJson = function() {
    if (typeof JSON === "object") {
      return JSON.stringify(data);
    }
  };
  this.getJson = getJson;
};


  var template = 
    '<div class="chain" style="font-size:110%;"></div>'+
    '<button class="gen">generate</button>'+
    '<span class="info"></span>';


  Iframework.NativeNodes["string-markov"] = Iframework.NativeNodes["string"].extend({

    template: _.template(template),
    info: {
      title: "markov",
      description: "makes a markov chain based "
    },
    events: {
      "click .gen":  "inputgenerate"
    },
    initializeModule: function(){
    },
    inputstring: function (string) {
      string = string.toLowerCase();
      string = string.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      this.markov = new markov(string);
    },
    inputgenerate: function () {
      if (!this.markov) { return; }
      var out = this.markov.gen(this._len);
      this.$(".chain").text(out);
      this.$(".info").text("(" + this._len + " words, " + out.length + " characters)");
      this.send("chain", out);
    },
    inputs: {
      string: {
        type: "string",
        description: "the string that seeds the chain"
      },
      len: {
        type: "int",
        description: "how many words in the chain",
        "default": 20
      },
      generate: {
        type: "bang",
        description: "make a chain"
      }
    },
    outputs: {
      chain: {
        type: "string",
        description: "the generated markov chain"
      }
    }

  });


});
