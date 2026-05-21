/**
 * 星露谷物语 - 游戏渲染引擎
 * 负责Canvas绘制、角色动画、地图渲染
 */

class GameRenderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    
    // 相机
    this.camera = { x: 0, y: 0, zoom: 1 };
    
    // 精灵图缓存
    this.sprites = {};
    
    // 动画帧
    this.animFrame = 0;
    this.animTimer = 0;
    
    // 地图配置
    this.tileSize = 32;
    this.mapOffsetX = 0;
    this.mapOffsetY = 60;
  }
  
  // 初始化
  init(width, height, dpr) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
  }
  
  // 清屏
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  // 更新动画
  updateAnimation(dt) {
    this.animTimer += dt;
    if (this.animTimer > 150) {
      this.animFrame++;
      this.animTimer = 0;
    }
  }
  
  // ============ 背景绘制 ============
  
  drawBackground(season, weather, timeOfDay) {
    // 天空颜色
    let skyColor;
    switch(season) {
      case 'spring': skyColor = '#87CEEB'; break;
      case 'summer': skyColor = '#00BFFF'; break;
      case 'autumn': skyColor = '#DEB887'; break;
      case 'winter': skyColor = '#B0C4DE'; break;
      default: skyColor = '#87CEEB';
    }
    
    // 时间影响
    if (timeOfDay === 'night') {
      skyColor = '#191970';
    } else if (timeOfDay === 'evening') {
      skyColor = '#FF8C00';
    }
    
    // 绘制天空
    this.ctx.fillStyle = skyColor;
    this.ctx.fillRect(0, 0, this.width, this.height * 0.35);
    
    // 绘制云朵
    this.drawClouds(weather);
    
    // 绘制太阳/月亮
    this.drawCelestialBody(timeOfDay);
    
    // 绘制地面
    this.drawGround(season);
  }
  
  drawClouds(weather) {
    if (weather === 'rainy' || weather === 'stormy') {
      this.ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
    } else {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    }
    
    const cloudPositions = [
      { x: 50, y: 30, w: 80, h: 30 },
      { x: 200, y: 50, w: 60, h: 25 },
      { x: 350, y: 20, w: 70, h: 28 }
    ];
    
    cloudPositions.forEach(pos => {
      const x = ((pos.x + this.animFrame * 0.3) % (this.width + 100)) - 50;
      this.drawCloud(x, pos.y, pos.w, pos.h);
    });
  }
  
  drawCloud(x, y, w, h) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, h, 0, Math.PI * 2);
    this.ctx.arc(x + w * 0.3, y - h * 0.3, h * 0.8, 0, Math.PI * 2);
    this.ctx.arc(x + w * 0.6, y, h * 0.9, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawCelestialBody(timeOfDay) {
    if (timeOfDay === 'night') {
      // 月亮
      this.ctx.fillStyle = '#FFFFE0';
      this.ctx.beginPath();
      this.ctx.arc(this.width - 60, 40, 20, 0, Math.PI * 2);
      this.ctx.fill();
      
      // 星星
      this.ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 10; i++) {
        const x = (i * 47 + this.animFrame * 0.1) % this.width;
        const y = 10 + (i * 13) % 60;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else {
      // 太阳
      this.ctx.fillStyle = '#FFD700';
      this.ctx.beginPath();
      this.ctx.arc(this.width - 60, 40, 25, 0, Math.PI * 2);
      this.ctx.fill();
      
      // 光芒
      this.ctx.strokeStyle = '#FFD700';
      this.ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI / 4) + (this.animFrame * 0.02);
        const x1 = this.width - 60 + Math.cos(angle) * 30;
        const y1 = 40 + Math.sin(angle) * 30;
        const x2 = this.width - 60 + Math.cos(angle) * 40;
        const y2 = 40 + Math.sin(angle) * 40;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
    }
  }
  
  drawGround(season) {
    let groundColor;
    switch(season) {
      case 'spring': groundColor = '#90EE90'; break;
      case 'summer': groundColor = '#228B22'; break;
      case 'autumn': groundColor = '#D2691E'; break;
      case 'winter': groundColor = '#F0F8FF'; break;
      default: groundColor = '#90EE90';
    }
    
    this.ctx.fillStyle = groundColor;
    this.ctx.fillRect(0, this.height * 0.35, this.width, this.height * 0.65);
    
    // 草地纹理
    this.ctx.fillStyle = 'rgba(0, 100, 0, 0.1)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 23) % this.width;
      const y = this.height * 0.4 + (i * 17) % (this.height * 0.3);
      this.ctx.fillRect(x, y, 3, 8);
    }
  }
  
  // ============ 农场绘制 ============
  
  drawFarm(tiles, gridSize) {
    const startX = this.mapOffsetX;
    const startY = this.mapOffsetY;
    
    tiles.forEach(tile => {
      const x = startX + tile.x * gridSize;
      const y = startY + tile.y * gridSize;
      
      // 绘制土地
      this.drawTile(x, y, gridSize, tile);
      
      // 绘制作物
      if (tile.crop && !tile.crop.dead) {
        this.drawCrop(x, y, gridSize, tile.crop);
      }
    });
  }
  
  drawTile(x, y, size, tile) {
    // 土地类型
    if (tile.type === 'soil') {
      this.ctx.fillStyle = tile.watered ? '#654321' : '#8B4513';
    } else if (tile.type === 'grass') {
      this.ctx.fillStyle = '#90EE90';
    } else {
      this.ctx.fillStyle = '#8B4513';
    }
    
    this.ctx.fillRect(x, y, size - 2, size - 2);
    
    // 网格线
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, size - 2, size - 2);
    
    // 湿润效果
    if (tile.watered) {
      this.ctx.fillStyle = 'rgba(0, 0, 139, 0.2)';
      this.ctx.fillRect(x, y, size - 2, size - 2);
    }
    
    // 施肥效果
    if (tile.fertilized) {
      this.ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(x + size/2, y + size/2, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  drawCrop(x, y, size, crop) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    switch(crop.state) {
      case 'seed':
        // 种子
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY + 6, 3, 0, Math.PI * 2);
        this.ctx.fill();
        break;
        
      case 'sprout':
        // 发芽
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(centerX - 1, centerY - 2, 2, 10);
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - 4, 4, 0, Math.PI * 2);
        this.ctx.fill();
        break;
        
      case 'growing':
        // 生长中
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(centerX - 2, centerY - 10, 4, 18);
        
        // 叶子
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX - 6, centerY - 5, 5, 3, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(centerX + 6, centerY - 5, 5, 3, 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        break;
        
      case 'mature':
        // 成熟
        this.drawMatureCrop(centerX, centerY, crop.type);
        break;
    }
  }
  
  drawMatureCrop(x, y, type) {
    // 茎
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(x - 2, y - 15, 4, 22);
    
    // 叶子
    this.ctx.fillStyle = '#32CD32';
    this.ctx.beginPath();
    this.ctx.ellipse(x - 8, y - 8, 6, 3, -0.4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.ellipse(x + 8, y - 8, 6, 3, 0.4, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 果实
    let fruitColor;
    switch(type) {
      case 'parsnip': fruitColor = '#F5DEB3'; break;
      case 'potato': fruitColor = '#D2B48C'; break;
      case 'tomato': fruitColor = '#FF4500'; break;
      case 'blueberry': fruitColor = '#4169E1'; break;
      case 'corn': fruitColor = '#FFD700'; break;
      case 'pumpkin': fruitColor = '#FF8C00'; break;
      default: fruitColor = '#228B22';
    }
    
    this.ctx.fillStyle = fruitColor;
    this.ctx.beginPath();
    this.ctx.arc(x, y - 18, 7, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 成熟闪光
    if (Math.sin(this.animFrame * 0.1) > 0.7) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.beginPath();
      this.ctx.arc(x + 4, y - 22, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  // ============ 角色绘制 ============
  
  drawCharacter(x, y, direction, isMoving, isWatering) {
    const bodyWidth = 16;
    const bodyHeight = 20;
    const headRadius = 10;
    
    // 阴影
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + bodyHeight/2 + 2, 10, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 身体
    this.ctx.fillStyle = '#4169E1';
    this.ctx.fillRect(x - bodyWidth/2, y - bodyHeight/2, bodyWidth, bodyHeight);
    
    // 头部
    this.ctx.fillStyle = '#FFE4C4';
    this.ctx.beginPath();
    this.ctx.arc(x, y - bodyHeight/2 - headRadius + 2, headRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 头发
    this.ctx.fillStyle = '#8B4513';
    this.ctx.beginPath();
    this.ctx.arc(x, y - bodyHeight/2 - headRadius, headRadius, Math.PI, 2 * Math.PI);
    this.ctx.fill();
    
    // 眼睛
    this.ctx.fillStyle = '#000';
    const eyeY = y - bodyHeight/2 - headRadius + 2;
    
    switch(direction) {
      case 'down':
        this.ctx.beginPath();
        this.ctx.arc(x - 3, eyeY, 1.5, 0, Math.PI * 2);
        this.ctx.arc(x + 3, eyeY, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'up':
        // 背面不画眼睛
        break;
      case 'left':
        this.ctx.beginPath();
        this.ctx.arc(x - 4, eyeY, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'right':
        this.ctx.beginPath();
        this.ctx.arc(x + 4, eyeY, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        break;
    }
    
    // 腿部动画
    if (isMoving) {
      const legOffset = Math.sin(this.animFrame * 0.3) * 3;
      this.ctx.fillStyle = '#8B4513';
      this.ctx.fillRect(x - 5, y + bodyHeight/2, 4, 6 + legOffset);
      this.ctx.fillRect(x + 1, y + bodyHeight/2, 4, 6 - legOffset);
    } else {
      this.ctx.fillStyle = '#8B4513';
      this.ctx.fillRect(x - 5, y + bodyHeight/2, 4, 6);
      this.ctx.fillRect(x + 1, y + bodyHeight/2, 4, 6);
    }
    
    // 浇水动画
    if (isWatering) {
      this.drawWateringEffect(x, y);
    }
  }
  
  drawWateringEffect(x, y) {
    this.ctx.fillStyle = 'rgba(65, 105, 225, 0.6)';
    for (let i = 0; i < 5; i++) {
      const dropX = x + (Math.random() - 0.5) * 20;
      const dropY = y + 10 + i * 4;
      this.ctx.beginPath();
      this.ctx.arc(dropX, dropY, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  // ============ 建筑绘制 ============
  
  drawBuilding(x, y, type) {
    switch(type) {
      case 'cabin':
        this.drawCabin(x, y);
        break;
      case 'barn':
        this.drawBarn(x, y);
        break;
      case 'coop':
        this.drawCoop(x, y);
        break;
      case 'silo':
        this.drawSilo(x, y);
        break;
    }
  }
  
  drawCabin(x, y) {
    // 墙壁
    this.ctx.fillStyle = '#DEB887';
    this.ctx.fillRect(x, y, 64, 48);
    
    // 屋顶
    this.ctx.fillStyle = '#8B4513';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 5, y);
    this.ctx.lineTo(x + 32, y - 25);
    this.ctx.lineTo(x + 69, y);
    this.ctx.fill();
    
    // 门
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(x + 24, y + 20, 16, 28);
    
    // 窗户
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(x + 8, y + 12, 12, 12);
    this.ctx.fillRect(x + 44, y + 12, 12, 12);
    
    // 窗框
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x + 8, y + 12, 12, 12);
    this.ctx.strokeRect(x + 44, y + 12, 12, 12);
  }
  
  drawBarn(x, y) {
    // 墙壁
    this.ctx.fillStyle = '#CD853F';
    this.ctx.fillRect(x, y, 80, 60);
    
    // 屋顶
    this.ctx.fillStyle = '#8B0000';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 5, y);
    this.ctx.lineTo(x + 40, y - 30);
    this.ctx.lineTo(x + 85, y);
    this.ctx.fill();
    
    // 门
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(x + 25, y + 25, 30, 35);
    
    // 干草标记
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(x + 35, y + 10, 10, 15);
  }
  
  drawCoop(x, y) {
    // 墙壁
    this.ctx.fillStyle = '#F4A460';
    this.ctx.fillRect(x, y, 60, 45);
    
    // 屋顶
    this.ctx.fillStyle = '#CD853F';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 5, y);
    this.ctx.lineTo(x + 30, y - 20);
    this.ctx.lineTo(x + 65, y);
    this.ctx.fill();
    
    // 门
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(x + 20, y + 18, 20, 27);
    
    // 鸡的标记
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(x + 30, y + 8, 6, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawSilo(x, y) {
    // 主体
    this.ctx.fillStyle = '#C0C0C0';
    this.ctx.fillRect(x, y, 30, 50);
    
    // 顶部
    this.ctx.fillStyle = '#A9A9A9';
    this.ctx.beginPath();
    this.ctx.arc(x + 15, y, 15, Math.PI, 2 * Math.PI);
    this.ctx.fill();
    
    // 条纹
    this.ctx.fillStyle = '#808080';
    for (let i = 0; i < 5; i++) {
      this.ctx.fillRect(x, y + i * 10, 30, 2);
    }
  }
  
  // ============ UI绘制 ============
  
  drawStatusBar(gold, energy, maxEnergy, day, season, time, weather) {
    // 背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, this.width, 45);
    
    // 金币
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`💰 ${gold}g`, 10, 28);
    
    // 体力
    this.drawEnergyBar(90, 10, 60, 20, energy, maxEnergy);
    
    // 日期
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '13px Arial';
    this.ctx.fillText(`${season} ${day}日`, 165, 28);
    
    // 时间
    this.ctx.fillText(time, 255, 28);
    
    // 天气
    this.ctx.fillText(weather, 305, 28);
  }
  
  drawEnergyBar(x, y, width, height, current, max) {
    // 背景
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(x, y, width, height);
    
    // 填充
    const percent = current / max;
    let color;
    if (percent > 0.5) color = '#27ae60';
    else if (percent > 0.25) color = '#f39c12';
    else color = '#e74c3c';
    
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 2, y + 2, (width - 4) * percent, height - 4);
    
    // 文字
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '11px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`❤️ ${current}/${max}`, x + width/2, y + height/2 + 4);
  }
  
  drawToolbar(tools, selectedTool) {
    const barY = this.height - 65;
    const barHeight = 55;
    
    // 背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, barY, this.width, barHeight);
    
    // 工具按钮
    const btnWidth = this.width / tools.length;
    
    tools.forEach((tool, index) => {
      const x = index * btnWidth;
      const y = barY + 5;
      const w = btnWidth - 8;
      const h = barHeight - 10;
      
      // 按钮背景
      this.ctx.fillStyle = tool.id === selectedTool ? '#f39c12' : '#555';
      this.ctx.fillRect(x + 4, y, w, h);
      
      // 边框
      this.ctx.strokeStyle = tool.id === selectedTool ? '#FFD700' : '#777';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + 4, y, w, h);
      
      // 图标
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(tool.icon, x + btnWidth/2, y + 25);
      
      // 名称
      this.ctx.font = '10px Arial';
      this.ctx.fillText(tool.name, x + btnWidth/2, y + 42);
    });
  }
  
  drawMiniMap(x, y, width, height, tiles, playerX, playerY) {
    // 背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(x, y, width, height);
    
    // 边框
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
    
    // 玩家位置
    this.ctx.fillStyle = '#FF0000';
    this.ctx.beginPath();
    this.ctx.arc(x + playerX * width / 20, y + playerY * height / 15, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  // ============ 特效绘制 ============
  
  drawWeatherEffect(weather) {
    switch(weather) {
      case 'rainy':
        this.drawRainEffect();
        break;
      case 'stormy':
        this.drawRainEffect();
        this.drawLightningEffect();
        break;
      case 'snowy':
        this.drawSnowEffect();
        break;
    }
  }
  
  drawRainEffect() {
    this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < 50; i++) {
      const x = (i * 73 + this.animFrame * 5) % this.width;
      const y = (i * 47 + this.animFrame * 8) % this.height;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x - 2, y + 10);
      this.ctx.stroke();
    }
  }
  
  drawSnowEffect() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    for (let i = 0; i < 30; i++) {
      const x = (i * 53 + this.animFrame * 2) % this.width;
      const y = (i * 37 + this.animFrame * 3) % this.height;
      const size = 2 + (i % 3);
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  drawLightningEffect() {
    if (Math.random() < 0.005) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }
  
  drawParticleEffect(particles) {
    particles.forEach(p => {
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
  }
  
  // ============ 工具绘制 ============
  
  drawTool(toolId, x, y, direction) {
    this.ctx.save();
    this.ctx.translate(x, y);
    
    switch(direction) {
      case 'right': this.ctx.rotate(0); break;
      case 'down': this.ctx.rotate(Math.PI / 2); break;
      case 'left': this.ctx.rotate(Math.PI); break;
      case 'up': this.ctx.rotate(-Math.PI / 2); break;
    }
    
    switch(toolId) {
      case 'hoe':
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(10, -2, 20, 4);
        this.ctx.fillStyle = '#A9A9A9';
        this.ctx.fillRect(28, -6, 8, 12);
        break;
      case 'watering_can':
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(8, -8, 16, 16);
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(22, -4, 10, 8);
        break;
      case 'axe':
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(10, -2, 20, 4);
        this.ctx.fillStyle = '#A9A9A9';
        this.ctx.fillRect(26, -8, 10, 16);
        break;
      case 'pickaxe':
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(10, -2, 20, 4);
        this.ctx.fillStyle = '#A9A9A9';
        this.ctx.fillRect(26, -10, 4, 20);
        break;
    }
    
    this.ctx.restore();
  }
}

module.exports = GameRenderer;