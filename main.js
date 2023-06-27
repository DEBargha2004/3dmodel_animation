import './style.css'
import * as three from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const renderer = new three.WebGLRenderer()
const gltfLoader = new GLTFLoader()

renderer.shadowMap.enabled = true

renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new three.Scene()
const camera = new three.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
)

camera.position.set(0, 2, 5)

const orbit = new OrbitControls(camera, renderer.domElement)

const dLight = new three.DirectionalLight(0xffffff, 1)
dLight.position.set(10, 20, 0)
dLight.castShadow = true
scene.add(dLight)

dLight.shadow.mapSize.width = 2048
dLight.shadow.mapSize.height = 2048

const aLight = new three.AmbientLight(0xffffff, 0.2)
scene.add(aLight)

const planeGeo = new three.PlaneGeometry(50, 50, 50, 50)
const planeMat = new three.MeshStandardMaterial({
  color: 0xffffff,
  side: three.DoubleSide
})

const planeMesh = new three.Mesh(planeGeo, planeMat)
planeMesh.rotateX(Math.PI / 2)
planeMesh.receiveShadow = true
scene.add(planeMesh)

const shadowHelper = new three.CameraHelper(dLight.shadow.camera)
scene.add(shadowHelper)

const mixer = new three.AnimationMixer(scene)
const clock = new three.Clock()

gltfLoader.load('./public/buster_drone/scene.gltf', object => {
  const modelMesh = object.scene
  modelMesh.position.set(0, 1.31, 0)
  scene.add(modelMesh)

  modelMesh.traverse(node => {
    if (node.isMesh) {
      node.castShadow = true
      node.receiveShadow = true
    }
  })

  const clips = object.animations
  const actions = clips.map(clip => mixer.clipAction(clip))

  actions[0].play()
})

function animate () {
  const delta = clock.getDelta()

  mixer.update(delta)

  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', e => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})


document.getElementById('root').appendChild(renderer.domElement)
