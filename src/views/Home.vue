<script setup>
import { onMounted, ref, watch } from 'vue';
import { useCountDown } from '/src/composables/useCountDown.js'
import { useChangeBgImg } from '/src/composables/useChangeBgImg.js';
import { findWay } from '/src/composables/useFindWay.js';
import { useReward } from 'vue-rewards'

const { formatTime, timeStart, currentTime, timeStop } = useCountDown()
const { changeBgImg } = useChangeBgImg()
const { path, findPath } = findWay()

// confetti
const config = {
  startVelocity: 20,
  spread: 1600,
  elementCount: 600
}
const { reward, isAnimating } = useReward('reward', 'confetti', config);

// options menu
const selectedValues = ref([]);
const options = [
  { value: '15', label: '8x15(default)' },
  { value: '20', label: '8x20' },
  { value: '25', label: '8x25' },
  { value: '30', label: '8x30(slow)' },
];

// the all path and the right path list
const cubes = ref([[]])
const pathId = ref([])
const durationTime = ref(900)

const defaultLevel = () => {
  durationTime.value = 900
  cubes.value = [[]]
  for (let i = 1; i <= 8; i++) {
    cubes.value.push([])
    for (let j = 1; j <= 15; j++) {
      let str = j + '-' + i
      cubes.value[i].push({ id: str, state: 0, selected: false })
    }
  }
}

// select level, default is 15
const level = ref(15)
const onSelectionChange = (values) => {
  // console.log(values)
  level.value = values
  if (values == 15 || values == 20) {
    durationTime.value = 900
  } else if (values == 25) {
    durationTime.value = 1200
  } else if (values == 30) {
    durationTime.value = 1800
  }

  cubes.value = [[]]
  for (let i = 1; i <= 8; i++) {
    cubes.value.push([])
    for (let j = 1; j <= values; j++) {
      let str = j + '-' + i
      cubes.value[i].push({ id: str, state: 0, imgUrl: '' })
    }
  }
}

let isLoss = false
let isWinner = false
let isStart = false
let gameOver = false

const startGame = () => {
  if (!isStart) {
    findPath(level.value)
    pathId.value = path.value
    // console.log(pathId.value)
    // for disabling buttons
    isStart = true
    timeStart(durationTime.value)
    currentTime.value = durationTime.value
    restartReappear()
  }
}

// if is allow reappear
let isRepeat = false

const reStart = () => {
  // reward()
  gameOver = false
  isLoss = false
  isWinner = false
  showGif.value = false
  timeStop()
  isStart = false
  isRepeat = false
  currentIndex = 0;
  onSelectionChange(level.value)
}

// time's up
watch(currentTime, () => {
  // console.log(currentTime.value)
  if (currentTime.value == 0) {
    // console.log('count is changed')
    gameOver = true
    isLoss = true
    showGif.value = true
    explosion()
    isRepeat = false
  }
})

const stepNum = ref(0)
const isOrderWay = ref(false)

const checkIt = (item) => {
  // console.log(stepNum.value)
  // console.log(item.id)
  // console.log(pathId.value[stepNum.value])

  // only when playing can click
  if (gameOver || !isStart) return

  // stop reappear
  if (isRepeat) {
    currentIndex = 0
    isRepeat = false
    // onSelectionChange(level.value)
    cubes.value.forEach(val => {
      val.forEach(v => {
        v.state = 0;
        v.imgUrl = '';
      });
    });
  }

  // for disabling buttons
  couldReappear.value = false

  // if not moving
  if (item.state == 1) { return }

  isOrderWay.value = false
  if (pathId.value[stepNum.value] === item.id) {
    isOrderWay.value = true
    stepNum.value++
  }

  cubes.value.forEach(val => val.forEach(i => i.selected = false))

  if (pathId.value.includes(item.id) && isOrderWay.value) {
    // if (pathId.value.includes(item.id) && pathId.value[index] === item.id) {
    item.selected = true
    item.state = 1;

    // winner
    if (pathId.value.indexOf(item.id) === pathId.value.length - 1) {
      item.imgUrl = './20.png'
      timeStop()
      reward()
      isWinner = true
    } else {
      item.imgUrl = './10.png'
    }

  } else {
    // game over
    item.selected = true
    item.imgUrl = './30.png'
    item.state = -1;
    gameOver = true
    timeStop()
    isLoss = true
    showGif.value = true
    explosion()
    isRepeat = false
  }
}

let currentIndex = 0;
let reappearSpeed = ref(250)
const couldReappear = ref(false)

const restartReappear = () => {
  stepNum.value = 0
  couldReappear.value = true

  // change reappear speed
  reappearSpeed.value = 250
  if (currentTime.value < 60) {
    reappearSpeed.value = 100
  } else if (currentTime.value < 120) {
    reappearSpeed.value = 150
  } else if (currentTime.value < 300) {
    reappearSpeed.value = 200
  } else if (currentTime.value < 600) {
    reappearSpeed.value = 250
  }

  currentIndex = 0;
  if (isStart && !gameOver) {
    isRepeat = true
    onSelectionChange(level.value)
    reappear();
  }
};

const reappear = () => {
  if (currentIndex < pathId.value.length && isRepeat) {
    const currentId = pathId.value[currentIndex];
    cubes.value.filter(item => item.find(cube => cube.id === currentId))[0].filter(cube => cube.id === currentId)[0].state = 1
    currentIndex++;
    // console.log('repeat')
    setTimeout(reappear, reappearSpeed.value);
  } else (
    couldReappear.value = false
  )
}

// const reappear = async () => {
//   const tasks = pathId.value.map(item => () => console.log(item));
//   for (const task of tasks) {
//     await new Promise(resolve => setTimeout(resolve, 400));
//     task();
//   }
// };

const gifSrc = ref('')
const showGif = ref(false)
const explosion = () => {
  gifSrc.value = './explosion.gif';
  const gifDuration = 1750;
  setTimeout(() => {
    showGif.value = false;
  }, gifDuration);
}

const showRanking = ref(false)
// const showRankingBtn = () => { showRanking.value = true }
const closeRankingBtn = () => { showRanking.value = false }

const condition1 = ref(false)
const condition2 = ref(false)
const iframeSrc1 = ref('');
const iframeSrc2 = ref('');
const accountLink = ref('')

const languageType = () => {
  const userLang = navigator.language || navigator.userLanguage;
  if (userLang.startsWith('en')) {
    condition2.value = true
    iframeSrc2.value = 'https://www.youtube.com/embed/PWirijQkH4M?si=7VU6JOuaKXhs4y4b'
    accountLink.value = 'https://www.youtube.com/@MrBeast'
  } else {
    condition1.value = true
    iframeSrc1.value = '//player.bilibili.com/player.html?isOutside=true&aid=1805797350&bvid=BV11b421H7YB&cid=1586386146&p=1&autoplay=0'
    accountLink.value = 'https://space.bilibili.com/1027737427'
  }
}

onMounted(() => {
  changeBgImg()
  languageType()
  defaultLevel()
});
</script>

<template>

  <div class="container">
    <div class="top">
      <div class="">
        <p class="title">Only One Way</p>
        <!-- <h2 class="ranking" @click="showRankingBtn">🏆</h2> -->
      </div>

      <div class="desc-en" v-show="condition2">
        <p v-show="condition2"></p>
        <p>Inspired by Mr.Beast's <a :href="iframeSrc2">video</a>, Subscribe to👉 <a :href="accountLink">@MrBeast</a>
          👈Official.</p>
        <p>Pass before the time is up, there is only one way to the finish line!</p>
        <p>You can press the 'REAPPEAR' button to see the correct route, but at the cost of starting from scratch.</p>
        <p>You have no chance of failure, come and take the challenge, Good luck!</p>
        <p>Note1: Refreshing the page will lose the current progress.</p>
        <p>Note2: Calculating paths has a probability of causing the page to get stuck, Just refresh the page.</p>
      </div>
      <div class="desc-cn" v-show="condition1">
        <p v-show="condition1"></p>
        <p>灵感来自 Mr.Beast 的<a :href="iframeSrc1">视频</a>，订阅👉 <a :href="accountLink">@MrBeast</a> 👈官方账号。</p>
        <p>在时间中止前通过，只有一条路能通向终点！</p>
        <p>你可以随时点击 '复现' 按钮查看正确的路线，而代价是你得从头再来。</p>
        <p>你没有失败的机会，来挑战试试吧，祝你好运！</p>
        <p>（注意：刷新页面会丢失当前进度。计算路径有概率造成页面卡死，刷新页面即可。）</p>
      </div>
      <!-- <p>© Copyright 2024 by <a href="https://github.com/rhetttien">RhettTien</a></p> -->
    </div>

    <div class="blackLine"></div>

    <div class="center">
      <button class="btn" @click="reStart">New</button>

      <span v-show="condition2">Level:</span>
      <span v-show="condition1">难度：</span>
      <el-select v-show="!isStart" class="custom-select" v-model="selectedValues" placeholder="8x15"
        @change="onSelectionChange">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>

      <span class="btn-d" v-show="isStart">8x{{ level }}</span>

      <button class="btn" v-show="!isStart" @click="startGame">Play</button>
      <button class="btn-d" v-show="isStart">Play</button>
      <button v-show="condition1 && !couldReappear" class="btn" @click="restartReappear">复现</button>
      <button v-show="condition2 && !couldReappear" class="btn" @click="restartReappear">reappear</button>
      <button v-show="condition1 && couldReappear" class="btn-d">复现</button>
      <button v-show="condition2 && couldReappear" class="btn-d">reappear</button>
    </div>

    <div class="blackLine"></div>

    <div class="box">
      <div class="clock" :class="{ timeOut: currentTime < 60 || gameOver }">{{ formatTime }}</div>
      <div class="mark">🔰🔰🔰🔰🔰🔰🔰🔰</div>
      <div class="game-box">
        <div class="column" v-for="(row, rowIndex) in cubes" :key="`row-${rowIndex}`">
          <div class="cube" :class="{ isOk: item.state === 1, isOver: item.state === -1 }" :id="item.id"
            v-for="item in row" :key="item.id" @click="checkIt(item)"><img class="cubeImg" :src="item.imgUrl"
              alt="image" v-show="item.selected"></div>
        </div>
      </div>
      <div class="mark">🚩🚩🚩🚩🚩🚩🚩🚩</div>
    </div>

    <div class="blackLine"></div>

    <!-- <div class="footer">
      <iframe v-show="condition2" style="width:100%;aspect-ratio:11/6;" :src="iframeSrc2" frameborder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

      <iframe v-show="condition1" style="width:100%;aspect-ratio:5/3;" :src="iframeSrc1" scrolling="no" frameborder="no"
        framespacing="0" allowfullscreen="true"></iframe>
    </div> -->

    <p>© Copyright 2024 by <a href="https://github.com/rhetttien">RhettTien</a></p>
    <div class="blackLine"></div>
  </div>

  <div class="showInfo">
    <div id="reward"></div>

    <div class="winner" v-show="isWinner">
      <p v-show="condition1 && isWinner">你获得了胜利, 就像那个赢得80万刀的小伙一样!</p>
      <button v-show="condition1 && isWinner" class="btn-e" @click="reStart">再玩一次</button>
      <p v-show="condition2 && isWinner">You got the win, just like the guy who won $800,000 dollars!</p>
      <button v-show="condition2 && isWinner" class="btn-e" @click="reStart">Play again</button>
    </div>

    <div class="loss" v-show="isLoss">
      <p v-show="condition2 && isLoss">You're blown up!</p>
      <button v-show="condition2 && isLoss" class="btn-e" @click="reStart">Let's try again</button>
      <p v-show="condition1 && isLoss">你被炸碎了！</p>
      <button v-show="condition1 && isLoss" class="btn-e" @click="reStart">再试一次</button>
    </div>

    <img class="explosion" v-if="showGif" :src="gifSrc" @load="explosion()">
  </div>

  <div class="table-of-ranking" v-show="showRanking">
    <div class="btn-close" @click="closeRankingBtn">X</div>
    <p class="rankingTitle">Player Ranking</p>
    <div class="ranking-box">
      <div class="player">aaaaa</div>
      <div class="player">aaaaa</div>
      <div class="player">aaaaa</div>
      <div class="player">aaaaa</div>
      <div class="player">aaaaa</div>
      <div class="player">aaaaa</div>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: electronicFont;
  src: url(/font/DS-DIGIT.TTF)
}

.container {
  /* min-width: 361px; */
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;

  .blackLine {
    position: relative;
    width: 100%;
    height: 2px;
    background-color: #4F4F4F;
    margin: 10px 0 10px 0;
  }

  .top {
    .ranking {
      text-align: center;
      margin-bottom: 10px;
      border: 2px solid #ffffff00;

      &:hover {
        text-shadow: -3px 2px #DE3928;
        cursor: pointer;
        border: 2px solid #552EAD;
      }
    }

    .title {
      color: #552EAD;
      font-style: italic;
      font-weight: bold;
      text-align: center;
    }

    @media (min-width: 355px) {
      .title {
        font-size: 34px;
        text-shadow: -6px 3px #DE3928aa;
      }
    }

    @media (min-width: 768px) {
      .title {
        font-size: 44px;
        text-shadow: -8px 5px #DE3928aa;
      }
    }
  }

  .center {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .custom-select {

      border-radius: 0.6em;
      cursor: pointer;
      margin: 2px;
    }

    /* https://www.sliderrevolution.com/resources/cool-css-buttons/ */
    .btn {
      box-sizing: border-box;
      background-color: #FFFFFF;
      border: 1px solid #DCDFE6;
      border-radius: 0.4em;
      color: #606266;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      margin: 2px;
      padding: 0.6em 1.2em;
      text-align: center;

      &:hover {
        color: #fff;
        border: 1px solid #E74C3C;
        outline: 0;
      }
    }

    .btn {
      transition: box-shadow 300ms ease-in-out, color 300ms ease-in-out;

      &:hover {
        box-shadow: 0 0 40px 40px #e74c3c inset;
      }
    }

    .btn-d {
      box-sizing: border-box;
      background-color: #DBDBDB;
      border: 1px solid #DCDFE6;
      border-radius: 0.4em;
      color: #606266;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      margin: 2px;
      padding: 0.6em 1.2em;
      text-align: center;
    }

    @media (min-width: 355px) {
      .custom-select {
        width: 90px;
      }
    }

    @media (min-width: 768px) {
      .custom-select {
        width: 140px;
      }

      .btn {
        margin: 6px;
        padding: 0.6em 1.6em;
      }
    }

  }

  .box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    align-items: center;

    .clock {
      font-family: electronicFont;
      border: 4px solid #000000;
      background-color: #C0C0C0;
      color: #38F7A0;
      text-shadow: 2px 2px 1px #000000;

      &.timeOut {
        color: red;
      }
    }

    @media (min-width: 355px) {
      .clock {
        font-size: 4rem;
        line-height: 1;
        padding: 0em .2em;
        border-radius: 3px;
      }
    }

    @media (min-width: 768px) {
      .clock {
        font-size: 6rem;
        line-height: 1;
        padding: 0em .2em;
        border-radius: 4px;
      }
    }

    .game-box {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 10px;

      .column {
        margin: -0.5px;
      }

      .cube {
        background-color: #FBFBFB;
        box-shadow: 1px 1px 2px #616161;
        cursor: pointer;
        border-radius: 2px;
        margin: 2px;

        &.isOk {
          background-color: #38F7A0;
        }

        &.isOver {
          background-color: red;
        }
      }

      .cube:active {
        box-shadow: 0px 0px 0px #00000000;
      }

      @media (min-width: 355px) {
        .cube {
          width: 38px;
          height: 38px;
          margin: 1px;
          border: 1px solid #840D97;
        }

        .cube:active {
          width: 36px;
          height: 36px;
          margin: 2px;
        }
      }

      @media (min-width: 768px) {
        .cube {
          width: 60px;
          height: 60px;
          margin: 2px;
          border: 2px solid #840D97;
        }

        .cube:active {
          width: 58px;
          height: 58px;
          margin: 3px;
        }
      }
    }
  }

  .footer {
    width: 100%;

    p {
      padding: 0 0 10px 0;
      text-align: center;
    }
  }
}

.showInfo {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: auto;
  margin: 0 auto;
  z-index: 9999;

  .confetti {
    position: absolute;
    top: 50%;
    left: 70%;
    transform: translate(-50%, -50%);
    height: auto;
    width: 1000px;
    text-align: center;
  }

  .btn-e {
    box-sizing: border-box;
    background-color: #FFFFFF;
    border: 1px solid #DCDFE6;
    border-radius: 0.4em;
    color: #606266;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    margin: 2px;
    padding: 0.6em 1.2em;
    text-align: center;

    &:hover {
      color: #fff;
      border: 1px solid #E74C3C;
      outline: 0;
    }
  }

  .btn-e {
    transition: box-shadow 300ms ease-in-out, color 300ms ease-in-out;

    &:hover {
      box-shadow: 0 0 40px 40px #e74c3c inset;
    }
  }

  .winner {
    position: fixed;
    text-align: center;
    z-index: 999;
    color: #FF0000;
    font-style: italic;
    padding: 30px;
    background-color: #38F7A0;
    border: 2px solid #552EAD;
    border-radius: 5px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .loss {
    position: fixed;
    width: 400px;
    height: auto;
    text-align: center;
    z-index: 999;
    color: #D6D6D6;
    font-size: 30px;
    font-style: italic;
    padding: 30px;
    background-color: #717171;
    border-radius: 5px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  #reward {
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: auto;
    z-index: 998;
  }

  .explosion {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: auto;
    z-index: 998;
  }
}

@media (min-width: 355px) {
  .winner {
    width: 800px;
    font-size: 16px;
  }

  .explosion {
    width: 90%;
  }
}

@media (min-width: 768px) {
  .winner {
    width: 800px;
    font-size: 30px;
  }

  .explosion {
    width: 50%;
  }
}

.cubeImg {
  display: flex;
  width: auto;
  height: 100%;
  box-sizing: border-box;
  margin: 0 auto;
}

.table-of-ranking {
  position: fixed;
  height: auto;
  background-color: #F3F1EF;
  border: 2px #552EAD solid;
  border-radius: 4px;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  z-index: 99;

  .rankingTitle {
    font-size: 20px;
    color: #552EAD;
    font-style: italic;
    font-weight: bold;
    text-align: center;
    text-shadow: -6px 3px #DE392866;
  }

  .btn-close {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 25px;
    height: 25px;
    color: #fff;
    background-color: #552EAD;
    box-sizing: border-box;
    border-radius: 4px;
    user-select: none;
    text-align: center;

    &:hover {
      color: #fff;
      box-shadow: 0 0 40px 40px #e74c3c inset;
    }
  }
}

@media (min-width: 355px) {
  .table-of-ranking {
    width: 350px;
  }
}

@media (min-width: 768px) {
  .table-of-ranking {
    width: 600px;
  }
}
</style>