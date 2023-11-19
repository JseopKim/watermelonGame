import {Engine, Runner, Render, Bodies, World} from "matter-js";
import { FRUITS } from "./fruits.js";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false, //게임 형태이기 때문에 false로 설정
    background: "#F7F4C8",
    width: 620,
    height: 850,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: {fillStyle: "#E6B143"},
})

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: {fillStyle: "#E6B143"},
})

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: {fillStyle: "#E6B143"},
})

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  isStatic: true,
  isSensor: true, //감지만 한다.
  render: {fillStyle: "#E6B143"},
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

//과일 추가하기

let currentFruit = null;
let currentBody = null;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true, //대기 상태
    render: { 
      sprite: {texture: `${fruit.name}.png`}
    },
    restitution: 0.3, //탄성
  });

  World.add(world, body);
}

addFruit();