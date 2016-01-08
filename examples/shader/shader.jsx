//
// The shader example uses a webgl shader.
// It is based off the code at http://threejs.org/examples/#webgl_shader, but 
// converted to React.THREE
//

var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

var vertexShader = require('raw!./vertex_shader.glsl');
var fragmentShader = require('raw!./fragment_shader.glsl');
const { Renderer, Scene, Mesh, Object3d, PerspectiveCamera } = ReactTHREE;

class Wavey extends React.Component {
  constructor(props) {
    super(props)

    this.uniforms = {
      time: { type: "f", value: props.time },
      resolution: { type: "v2", value: new THREE.Vector2(props.width, props.height) }
    }; 

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
  }
  componentWillReceiveProps(nextProps) {
    this.uniforms.time.value = nextProps.time

    if(nextProps.width !== this.props.width)
      this.uniforms.resolution.value.x = nextProps.width;

    if(nextProps.height !== this.props.height)
      this.uniforms.resolution.value.y = nextProps.height;
  }
  render() {
    return <Mesh geometry={geometry} material={this.material} />
  }
}

//
// The top level component
// props:
// - width,height : size of the overall render canvas in pixels
// - xposition: x position in pixels that governs where the elements are placed
//

class ExampleScene extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      time: 1.0,
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.animate = () => {
      this.setState({
        time: this.state.time + 0.05
      })

      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  componentDidMount() {
    this.animate()

    window.addEventListener( 'resize', this.onWindowResize.bind(this), false )
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frameId)
    window.removeEventListener('resize', this.onWindowResize)
  }

  onWindowResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  render() {
    var cameraprops = {position:{z: 1}};

    return <Renderer width={this.state.width} height={this.state.height} pixelRatio={window.devicePixelRatio} >
        <Scene width={this.state.width} height={this.state.height} camera="maincamera">
            <PerspectiveCamera name="maincamera" {...cameraprops} />
            <Wavey time={this.state.time} width={this.state.width} height={this.state.height} />
        </Scene>
    </Renderer>
  }
}

var time = 1.0;

function shaderstart() { // eslint-disable-line no-unused-vars
  var renderelement = document.getElementById("three-box");

  ReactTHREE.render(<ExampleScene />, renderelement);
}

window.onload = shaderstart;

