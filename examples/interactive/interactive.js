//
// Basic ReactPIXI example using pixi events to add/remove sprites.
// Note that in order for a sprite to be clickable the sprite has
// to be interactive (sprite.interactive = true)
//
// For react-pixi this means you should have 'interactive:true' in your props
//

// tell jshint that we use lodash
/* global _ : false */
/* global React : false */
/* global ReactPIXI : false */
/* jshint strict: false */

var g_assetpath = function(filename) { return '../assets/' + filename; };

// the mounted instance will go here, so that callbacks can modify/set it
var g_reactinstance;

// This basically the 'application state':
// a list of all the current sprites
var g_applicationstate = {};

var g_nextspriteid = 1;

// if the application state is modified call this to update the GUI

function updateProps() {
  g_reactinstance.setProps(g_applicationstate);
}

//
// Deleting an interactive sprite while inside a pixi event handler can modify the 'interactiveItems'
// arry while pixi is iterating over it, which is a no-no.
// So instead we queue up the change using setTimeout
//
function enqueueSetProps() {
  window.setTimeout(updateProps);
}

//
// callback which adds a randomly placed sprite to the application state
//

function addRandomSprite() {
  // give each sprite a unique ID
  var refnumber = g_nextspriteid++;
  var spriteid = 'sprite' + refnumber.toString();

  var newsprite = {
    x: Math.random() * g_applicationstate.width,
    y: Math.random() * g_applicationstate.height,
    image: g_assetpath('lollipopGreen.png'),
    key: spriteid,
    interactive:true,
    click: function() { removeSpriteById(spriteid); }
  };

  g_applicationstate.sprites.push(newsprite);

  // update and re-render
  updateProps();
}

//
// callback to remove the dynamic sprite that was clicked on
//

function removeSpriteById(spriteid) {
  _.remove(g_applicationstate.sprites, function(sprite) { return sprite.key === spriteid; });

  enqueueSetProps();
}

//
// Component to hold a clickable sprite 'button'. click on this 'button' to add a sprite
//

var SpriteAppButtons = React.createClass({
  displayName:'SpriteAppButtons',
  render: function() {
    return ReactPIXI.DisplayObjectContainer(
      {},
      ReactPIXI.Sprite({x:100,y:150,key:'cherry', image: g_assetpath('cherry.png'),interactive:true,click: addRandomSprite}),
      ReactPIXI.Text({x:10,y:10, key:'label1', text:'Click the cherry to add a lollipop sprite', style:{font:'25px Times'}}),
      ReactPIXI.Text({x:10,y:80, key:'label2', text:'Click on lollipop sprites to remove them', style:{font:'25px Times'}})
    );
  }
});

//
// Component to display all the dynamic sprites
//

var DynamicSprites = React.createClass({
  displayName:'DynamicSprites',
  render: function() {
    var args = [{}];
    this.props.sprites.forEach(function(spriteprops) {
      args.push(ReactPIXI.Sprite(spriteprops));
    });
    return ReactPIXI.DisplayObjectContainer.apply(
      null,
      args
    );
  }
});

//
// The top level component
// props:
// - width,height : size of the overall render canvas in pixels
// - sprites: a list of objects describing all the current sprites containing x,y and image fields
//

var SpriteApp = React.createClass({
  displayName: 'BunchOfSprites',
  render: function() {
    return ReactPIXI.Stage(
      // stage props
      {width: this.props.width, height: this.props.height, backgroundcolor: 0xa08080, interactive:true},
      // children components are the buttons and the dynamic sprites
      [
        DynamicSprites({key:'sprites', sprites:this.props.sprites}),
        SpriteAppButtons({key:'gui'})
      ]
    );
  }
});

/* jshint unused:false */
function interactiveexamplestart() {

  var renderelement = document.getElementById("pixi-box");

  var w = window.innerWidth-6;
  var h = window.innerHeight-6;

  g_applicationstate = {width:w, height:h, sprites:[]};

  function PutReact()
  {
    g_reactinstance = React.renderComponent(SpriteApp(g_applicationstate), renderelement);
  }

  var assetloader = new PIXI.AssetLoader([
    g_assetpath('cherry.png'),
    g_assetpath('lollipopGreen.png'),
    g_assetpath('lollipopRed.png')
  ]);

  assetloader.on('onComplete', PutReact);
  assetloader.load();
}

