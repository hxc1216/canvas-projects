function getRandom(min, max, fixedLen = 2) {
  const minValue = Math.min(min, max);
  const maxValue = Math.max(min, max);

  let randomNumber;

  if (minValue >= 0 && maxValue > 0) {
    randomNumber = Number((Math.random() * (maxValue - minValue) + minValue).toFixed(fixedLen));
  } else if (minValue < 0 && maxValue >= 0) {
    randomNumber = Number((Math.random() * (maxValue - minValue) + minValue).toFixed(fixedLen));
  } else if (minValue < 0 && maxValue <= 0) {
    randomNumber = Number(0 - (Math.random() * Math.abs(maxValue - minValue) + Math.abs(maxValue)).toFixed(fixedLen));
  }

  return randomNumber;
}

class Point {
  constructor(canvas, ctx, config = { color: "#fff", radius: 6 }) {
    this.canvas = canvas;
    this.ctx = ctx;
    // 获取配置
    this.config = config;

    // 利用随机数随机生成一个坐标
    this.x = getRandom(0, this.canvas.width);
    this.y = getRandom(0, this.canvas.height);
    this.color = this.config.color;

    // 设置移动速度
    this.xSpeed = getRandom(-50, 50);
    this.ySpeed = getRandom(-50, 50);
    this.lastDrawTime = null; // 最后一个更改的时间
  }

  draw() {
    if (this.lastDrawTime) {
      // 距离上一次动画的间隔
      const elapsedTime = (Date.now() - this.lastDrawTime) / 1000;

      //   间隔乘以运动速度，计算出移动的距离
      let xDis = elapsedTime * this.xSpeed,
        yDis = elapsedTime * this.ySpeed;

      // 获取移动后的点坐标x,y
      let x = this.x + xDis,
        y = this.y + yDis;

      // 判断点是否超出边界，超出时改变方向 反向运动
      if (x > this.canvas.width - this.config.radius / 2) {
        x = this.canvas.width - this.config.radius / 2;
        this.xSpeed = -this.xSpeed;
      } else if (x < 0) {
        x = 0;
        this.xSpeed = -this.xSpeed;
      }

      if (y > this.canvas.height - this.config.radius / 2) {
        y = this.canvas.height - this.config.radius / 2;
        this.ySpeed = -this.ySpeed;
      } else if (y < 0) {
        y = 0;
        this.ySpeed = -this.ySpeed;
      }

      // 重新设置点坐标;
      this.x = x;
      this.y = y;
    }

    // 根据坐标、半径画出 点
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.config.radius * devicePixelRatio, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.config.color;
    this.ctx.fill();

    this.lastDrawTime = Date.now(); // 记录当前时间
  }
}

class Graph {
  constructor(containerId, config = { bgColor: "#000", lineWidth: 1, pNumbers: 40, maxDis: 200, pointConfig: {} }) {
    // 获取容器
    const container = document.querySelector(containerId);
    // 创建canvas并设置样式
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = `position:absolute;left:0;top:0;background:${config.bgColor};`;
    this.canvas.width = container.clientWidth * devicePixelRatio;
    this.canvas.height = container.clientHeight * devicePixelRatio;
    container.appendChild(this.canvas);

    // 获取配置
    this.config = config;

    // 获取canvas上下文
    this.ctx = this.canvas.getContext("2d");

    // 实例化点 生成一个集合
    this.points = new Array(40).fill(0).map(() => new Point(this.canvas, this.ctx, this.config.pointConfig));
    
  }

  /** 画点连线 */
  draw() {
    // 添加动画 每一帧重绘一次
    requestAnimationFrame(() => {
      this.draw();
    });

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 遍历点集合 将点画在画布上
    for (let i = 0; i < this.points.length; i++) {
      const point1 = this.points[i];
      point1.draw();

      // 将点连成线
      for (let j = i + 1; j < this.points.length; j++) {
        const point2 = this.points[j];

        // 勾股定理求出2个点的直线距离
        const dis = Math.sqrt(Math.abs(point1.x - point2.x) ** 2 + Math.abs(point1.y - point2.y) ** 2);

        // 大于 “可连线的最宽距离” 时 不连线
        if (dis > this.config.maxDis) {
          continue;
        }

        // 将两个点连接起来
        this.ctx.beginPath();
        this.ctx.moveTo(point1.x, point1.y);
        this.ctx.lineTo(point2.x, point2.y);
        this.ctx.strokeStyle = `rgba(255,255,255,${1 - dis / this.config.maxDis})`; //  设置透明度 距离越远 颜色越浅
        // 设置整体线宽
        this.ctx.lineWidth = this.config.lineWidth * devicePixelRatio;
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  }
}
