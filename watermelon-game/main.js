import {Body, Engine, Runner, Render, Bodies, World, Events} from "matter-js";
import { FRUITS } from "./fruits.js";

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = new Audio();
audioElement.src = '/bgm.mp3';

const source = audioContext.createMediaElementSource(audioElement);
source.connect(audioContext.destination);

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
  name: "topLine",
  isStatic: true,
  isSensor: true, //감지만 한다.
  render: {fillStyle: "#E6B143"},
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

//과일 추가하기

let currentBody = null;
let currentFruit = null;
let disableAction = false; //1초동안 동작이 되지 않도록
let interval = null;
let winCount = 0;
let playBox = document.createElement("div");
let gameBox = document.getElementById("app");
gameBox.appendChild(playBox);

playBox.style.width = "100px";
playBox.style.height = "40px";
playBox.style.backgroundColor = "#888888";
playBox.style.position = "fixed";
playBox.style.left = "530px";

function playAudio() {
  audioContext.resume().then(() => {
    audioElement.play();
    // 이벤트 리스너를 한 번만 실행하도록 제거
    window.removeEventListener("click", playAudio);
  });
}

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
  
  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.addEventListener("click", playAudio);

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch (event.code) {
    case "KeyA":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "KeyD":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 590)
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 1,
          y: currentBody.position.y,
        });
      }, 5);
      break;

    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

//충돌 판정
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if(collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;
      
      if(index === FRUITS.length - 1) {
        winCount++;
        console.log(`winCount: ${winCount}`);
        return;
      }
      World.remove(world, [collision.bodyA, collision.bodyB]); 
      
      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        { 
          render: {
            sprite: {texture: `${newFruit.name}.png`}
          },
          index: index + 1,
        }
      )
      World.add(world, newBody);
      if (index === FRUITS.length - 1) {
        // 배열의 마지막 요소일 때
        winCount++;
        console.log(`winCount: ${winCount}`);
        if(winCount === 2) {
          alert("Game Win!!");
        }
        return;
      }
    }
    if(!disableAction && 
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      alert("Game Over");
    }
  })
})

addFruit();