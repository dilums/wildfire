const fragmentShader = `
uniform float time;
varying vec2 vUv;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (0.8691 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 4

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.6983), sin(0.8191),
                    -sin(0.7575), cos(0.9737));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5 ;
    }
    return v;
}

void main() {
    vec2 st = 20.0 * vUv;
    vec3 color = vec3(0.0);
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00*time);
    q.y = fbm( st + vec2(1.0));
    vec2 r = vec2(0.);
    r.x = fbm( st + q*7.2910 + vec2(0.5661,7.8596)+ 1.3786*time );
    r.y = fbm( st + q*2.4904 + vec2(8.9103,2.1780)+ 1.1393*time);
    float f = fbm(st+r);
    color = mix(vec3(1.0837, 0.5855, 0.7247),
                vec3(0.8151,0.3307,0.5294),
                clamp((f*f)*6.7746,0.0,1.0));
    color = mix(color,
                vec3(0.5059, 1.0,0.0),
                clamp(length(q),0.0,1.0));
    color = mix(color,
                vec3(0.4941,0.0, 1.0),
                clamp(length(r.x),0.0,1.0));

    gl_FragColor = vec4((f*f*f*0.4150+0.8097*f*f+0.8941*f)*color,1.);
}
`;
const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos;

void main() {
vPos = position;
vec3 newPos = position;
vUv = uv;
vNormal = normal;
gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
}
`;
let renderer, scene, camera;
const { max } = Math;
const { innerHeight, innerWidth, devicePixelRatio } = window;
const canvas = document.querySelector("#canvas");
const s = max(innerHeight, innerWidth) * devicePixelRatio;
canvas.width = s;
canvas.height = s;
renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const fov = 75;
const aspect = 1;
const near = 0.1;
const far = 20;
camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(
  0.018642919740713196,
  0.062166257361373406,
  1.8988912022517688
);
camera.rotation.x = -0.032726499473191346;
camera.rotation.y = 0.00981222047356264;
camera.rotation.z = 0.00032122915379875284;

scene = new THREE.Scene();
const uniforms = {
  time: { type: "f", value: 1.0 }
};

const material = new THREE.ShaderMaterial({
  fragmentShader,
  vertexShader,
  uniforms
});
const geometry = new THREE.PlaneGeometry(3, 3, 32);
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const { innerHeight, innerWidth, devicePixelRatio } = window;
  const s = max(innerHeight, innerWidth) * devicePixelRatio;
  const needResize = canvas.width !== s || canvas.height !== s;
  if (needResize) {
    renderer.setSize(s, s, false);
  }
  return needResize;
}

function render(time) {
  time *= 0.001;
  uniforms.time.value = time;
  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
