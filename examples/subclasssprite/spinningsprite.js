//
// Basic React-PIXI example using a custom PIXI object that is a subclass of Sprite.
// The object spins in place using a speed specified in the component properties as 'rotationspeed'
// which is the rotation speed in radians/second
//

/* jshint strict: false */
/* global React : false */
/* global ReactPIXI : false */

var assetpath = function(filename) { return '../assets/' + filename; };

var SpinningSprite = function(spriteimage, rotationspeed) {
  PIXI.Sprite.call(this, PIXI.Texture.fromImage(spriteimage));
  this.rotationspeed = rotationspeed;

  var that = this;

  var newFrame = function(timestamp) {
    that.rotation = that.rotationspeed * timestamp * 0.001;
    that.animrequestID = window.requestAnimationFrame(newFrame);
  };

  this.animrequestID = window.requestAnimationFrame(newFrame);
};

SpinningSprite.prototype = Object.create( PIXI.Sprite.prototype, {
  constructor: SpinningSprite,

  cancelAnimation : function() {
    if (this.animrequestID !== null) {
      window.cancelAnimationFrame(this.animrequestID);
      this.animrequestID = null;
    }
  }
});

var SpinningSpriteComponent = ReactPIXI.CreateCustomPIXIComponent({
  customDisplayObject: function() {
    var rotationspeed = this.props.rotation || 0;
    var spriteimage = this.props.image;
    return new SpinningSprite(spriteimage, rotationspeed);
  },

  applyCustomProps : function(oldProps, newProps) {
    var displayObject = this.displayObject;

    if ((typeof newProps.image !== 'undefined') && newProps.image !== oldProps.image) {
      displayObject.setTexture(PIXI.Texture.fromImage(newProps.image));
    }

    if (typeof newProps.anchor !== 'undefined') {
      displayObject.anchor.x = newProps.anchor.x;
      displayObject.anchor.y = newProps.anchor.y;
    }

    if (typeof newProps.tint !== 'undefined') {
      displayObject.tint = newProps.tint;
    }

    if (typeof newProps.blendMode !== 'undefined') {
      this.displayObject.blendMode = newProps.blendMode;
    }

    if (typeof newProps.rotation !== 'undefined') {
      this.displayObject.rotationspeed = newProps.rotation;
    }
  }
});

//
// The top level component
// props:
// - width,height : size of the overall render canvas in pixels
// - spinx,spiny,spinrotation : parameters passed to the spinning sprite
//

var SpinStage = React.createClass({
  displayName: 'ExampleStage',
  render: function() {
    var child = SpinningSpriteComponent({x:this.props.spinx, y:this.props.spiny, rotation:this.props.spinrotation, image:'../assets/cherry.png'}, null);
    return ReactPIXI.Stage({width:this.props.width, height:this.props.height}, child);
  }
});

/* jshint unused:false */
function spinningspritestart() {
    var renderelement = document.getElementById("pixi-box");

    var w = window.innerWidth-6;
    var h = window.innerHeight-6;

    React.renderComponent(SpinStage({width:w, height:h, spinx:100, spiny:100, spinrotation:5.6}), renderelement);
}

