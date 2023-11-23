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
    background: "#F9CBBE",
    width: 620,
    height: 850,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: {fillStyle: "#EE6D49"},
})

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: {fillStyle: "#EE6D49"},
})

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: {fillStyle: "#EE6D49"},
})

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true, //감지만 한다.
  render: {fillStyle: "#EE6D49"},
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
let play = document.createElement("div");
let stop = document.createElement("div");

document.body.style.margin = 0;
document.body.style.display = "flex";
document.body.style.flexDirection = "row";

document.body.appendChild(playBox);

playBox.style.width = "100px";
playBox.style.height = "40px";
playBox.style.backgroundColor = "#D73E14";
playBox.style.display = "flex";

//playBox안에 재생과 일시정지 넣기
playBox.appendChild(play);
playBox.appendChild(stop);

play.style.width = "50%";
play.style.height = "100%";
play.style.display = "flex";
play.style.justifyContent = "center";
play.style.alignItems = "center";
play.innerText = "재생";

stop.style.width = "50%";
stop.style.height = "100%";
stop.style.display = "flex";
stop.style.justifyContent = "center";
stop.style.alignItems = "center";
stop.innerText = "정지"



function playAudio() {
  audioContext.resume().then(() => {
    audioElement.play();
    console.dir(audioElement);
  });
}

function stopAudio() {
  audioContext.resume().then(() => {
    audioElement.pause();
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

play.addEventListener("click", playAudio);
play.addEventListener("mouseenter", function() {
  // 마우스가 요소 안으로 진입할 때의 동작
  this.style.cursor = "pointer"; // 여기서 this는 이벤트가 발생한 요소를 가리킵니다.
});

// mouseleave 이벤트에 대한 리스너 추가 (마우스가 요소를 벗어날 때의 동작)
play.addEventListener("mouseleave", function() {
  // 커서 모양 원래대로 변경
  this.style.cursor = "auto";
});
stop.addEventListener("click", stopAudio);
stop.addEventListener("mouseenter", function() {
  // 마우스가 요소 안으로 진입할 때의 동작
  this.style.cursor = "pointer"; // 여기서 this는 이벤트가 발생한 요소를 가리킵니다.
});

// mouseleave 이벤트에 대한 리스너 추가 (마우스가 요소를 벗어날 때의 동작)
stop.addEventListener("mouseleave", function() {
  // 커서 모양 원래대로 변경
  this.style.cursor = "auto";
});

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