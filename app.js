// 選取 canvas 位置
const canvas = document.getElementById("myCanvas");
// console.log(canvas);

const ctx = canvas.getContext("2d");
// getContext() method 會回傳一個 canvas 的 drawing context (繪圖環境)
// drawing context (繪圖環境) 可以用來在 canvas 內畫圖
// 因為貪食蛇是2d的圖形，所以 getContext() 的參數放 "2d"

// 設定單位，row 是橫的，column 是直的
const unit = 20;
const row = canvas.height / unit; // 320 / 20 = 16
const column = canvas.width / unit; // 320 / 20 = 16

let snake = []; // array 中的每個元素，都是一個物件

// 創建蛇的物件的函式
function createSnake() {
  // 物件的工作是，儲存身體的 x, y 座標
  // x, y 座標，x往右邊延伸代表越大，y往下延伸代表越大，所以整體而言往右下角延伸代表越大
  // (0, 0) 代表左上角
  // snake 出現的位置(x軸)由左到右依序:  20 40 60 80
  snake[0] = {
    x: 80,
    y: 0,
  };

  snake[1] = {
    x: 60,
    y: 0,
  };

  snake[2] = {
    x: 40,
    y: 0,
  };

  snake[3] = {
    x: 20,
    y: 0,
  };
}

// 新增果實，果實是一個物件，所以可以隨機產生果實
// 隨機產生 0~1(不包含 1) 的小數，再乘以 16，再 Math.floor()得 0~15，再乘以 unit
class Fruit {
  constructor() {
    this.x = Math.floor(Math.random() * column) * unit;
    this.y = Math.floor(Math.random() * row) * unit;
  }
  // 畫果實的 method (instance method)
  drawFruit() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, unit, unit);
  }

  // 選定新果實的座標位置的 method
  pickALocation() {
    // 設定 overlapping 是否重疊的變數
    let overlapping = false;
    let new_x;
    let new_y;

    // 檢查有沒有重疊
    function checkOverlap(new_x, new_y) {
      for (let i = 0; i < snake.length; i++) {
        if (new_x == snake[i].x && new_y == snake[i].y) {
          console.log("overlapping...");
          overlapping = true;
          return;
        } else {
          overlapping = false;
        }
      }
    }

    // 一直隨機取 x, y 座標，然後確認是否跟蛇有重疊，有重疊就一直隨機產生x, y座標，直到沒重疊蛇
    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = Math.floor(Math.random() * row) * unit;
      console.log("果實可能的新座標", new_x, new_y);
      checkOverlap(new_x, new_y);
    } while (overlapping);

    // 更新新果實物件的座標
    this.x = new_x;
    this.y = new_y;
  }
}

// 調用 createSnake()
// 初始設定
createSnake();

// 建立一個果實物件
let myFruit = new Fruit();

// 新增鍵盤監聽 上下左右 事件
window.addEventListener("keydown", changeDirection);

// 設定一個變數 d (direction)，記錄蛇移動的方向
let d = "Right";
function changeDirection(e) {
  // console.log(e);
  if (e.key == "ArrowRight" && d != "Left") {
    d = "Right";
  } else if (e.key == "ArrowDown" && d != "Up") {
    d = "Down";
  } else if (e.key == "ArrowLeft" && d != "Right") {
    d = "Left";
  } else if (e.key == "ArrowUp" && d != "Down") {
    d = "Up";
  }

  // 每次按 上下左右 鍵時，在下一幀被畫出來之前，
  // 不接受任何 keydown 事件，
  // 這樣可以防止連續按鍵，導致蛇在邏輯上自殺
  // 移除鍵盤監聽事件(現階段而已)
  window.removeEventListener("keydown", changeDirection);
}

// 設定歷分最高分數的變數
let highestScore;

// 顯示歷史分數
loadHighestScore();

// 遊戲分數的初始設定
let score = 0;

document.getElementById("myScore").innerHTML = "遊戲分數: " + score;
document.getElementById("myScore2").innerHTML = "最高分數: " + highestScore;

function draw() {
  // 每次畫圖之前，確認蛇有沒有咬到自己的身體?
  // i 從 1 開始是因為我們要檢查的是 頭(索引為 0) 跟 身體(索引除了 0 以外的)
  for (let i = 1; i < snake.length; i++) {
    if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
      // 清除 setInterval() 的任務
      clearInterval(myGame);
      alert("遊戲結束!");
      return;
    }
  }

  // console.log("正在執行draw...");
  // 重新畫一個新的 canvas 畫布
  // 背景設定全黑色
  // 從座標 (0, 0) 開始畫滿整個 canvas 的寬跟高
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 畫出果實
  myFruit.drawFruit();

  // 畫出蛇的方塊
  for (let i = 0; i < snake.length; i++) {
    if (i == 0) {
      // i = 0 的話，就是蛇的頭部，幫蛇的頭換淡綠色
      ctx.fillStyle = "lightgreen";
    } else {
      // 蛇的身體，幫蛇的身體換淡藍色
      ctx.fillStyle = "lightblue";
    }
    // 加上白色線框
    ctx.strokeStyle = "white";

    // 注意: 判斷蛇是否要撞牆了? 來給定 x, y 座標
    // 很重要的邏輯擺放位置，在畫出蛇之前，確認好 x, y 座標
    if (snake[i].x >= canvas.width) {
      snake[i].x = 0;
    } else if (snake[i].x < 0) {
      snake[i].x = canvas.width - unit;
    } else if (snake[i].y >= canvas.height) {
      snake[i].y = 0;
    } else if (snake[i].y < 0) {
      snake[i].y = canvas.height - unit;
    }

    // 畫矩形，括號內的參數分別為: x, y, width, height (x, y 座標、寬、高)
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }

  // 以目前的 d 變數方向，來決定蛇的下一幀要放在哪個座標
  // 取得蛇的頭部的 x, y 座標
  // 注意: snake[0].x 的值改變，並不會去影響 snake[0] 物件本身(y 亦同)
  let snakeX = snake[0].x; // 注意: snake[0]是一個物件，但 snake[0].x 是一個 number (primitive data type)
  let snakeY = snake[0].y;

  if (d == "Left") {
    snakeX -= unit;
  } else if (d == "Up") {
    snakeY -= unit;
  } else if (d == "Right") {
    snakeX += unit;
  } else if (d == "Down") {
    snakeY += unit;
  }

  // 設定新的蛇的頭部的(x, y)座標位置，注意: newHead 是一個物件
  let newHead = {
    x: snakeX,
    y: snakeY,
  };

  // 確認蛇是否有吃到果實?
  // 有吃到果實-> 不用 snake.pop()，要 snake.unshift() 長度增加
  // 沒有吃到果實-> 要 snake.pop()，也要 snake.unshift() 長度不變
  if (snake[0].x == myFruit.x && snake[0].y == myFruit.y) {
    // console.log("吃到果實了");
    myFruit.pickALocation();
    // 畫出新果實: myFruit.drawFruit(); // 這行可寫可不寫，因為下方的 setInterval(draw, 100) 會執行 draw()，再到裡面會執行 drawFruit()
    // 更新目前遊戲分數、最高分數 (瀏覽器 localStorage、畫面顯示的也要更新)
    score++;
    setHighestScore(score);
    document.getElementById("myScore").innerHTML = "遊戲分數: " + score;
    document.getElementById("myScore2").innerHTML = "最高分數: " + highestScore;
  } else {
    snake.pop();
  }

  // 在 snake 陣列當中的開頭，增加 newHead 元素
  // 因為不管有沒有吃到果實，都要 snake.unshift()，所以放在判斷式外，這樣都會執行
  // 插入一個新物件 newHead 到 snake 蛇的頭部
  snake.unshift(newHead);

  // 畫好新的蛇的頭部位置後
  // 加回鍵盤的監聽事件
  addEventListener("keydown", changeDirection);
}

// 每 0.1 秒更新一次 (100 是毫秒單位，100毫秒 = 0.1秒)
let myGame = setInterval(draw, 100);

// 載入遊戲最高分
function loadHighestScore() {
  if (localStorage.getItem("highestScore") == null) {
    highestScore = 0;
  } else {
    // 注意: 從 localStorage 拿出來的東西是 string，要改成 number
    // 因為 highestScore 之後要跟 score 比大小，所以必須轉成 Number type
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

// 儲存遊戲最高分數
function setHighestScore(score) {
  if (score > highestScore) {
    localStorage.setItem("highestScore", score);
    highestScore = score;
  }
}

// 穿牆功能
// x >= canvas.width -> x = 0
// x <0 -> x = canvas.width - unit
// y >= canvas.height -> y = 0
// y < 0 -> y = canvas.height - unit
