/**
 * 星露谷物语 - 游戏主页面（完整版）
 */

const GameRenderer = require('../../utils/renderer');
const GameDataManager = require('../../utils/data-manager');
const TimeSystem = require('../../utils/time-system');
const PlantingSystem = require('../../utils/planting-system');

const app = getApp();

Page({
  data: {
    // 显示状态
    gameTime: '06:00',
    gameDay: 1,
    gameSeason: '春季',
    gameWeather: '☀️',
    playerGold: 500,
    playerEnergy: 100,
    playerMaxEnergy: 100,
    
    // 工具
    currentTool: 'hoe',
    selectedSeed: 'parsnip',
    
    // 面板显示
    showSeedSelector: false,
    showShop: false,
    showBackpack: false,
    
    // 通知
    notification: '',
    showNotification: false
  },
  
  // 游戏实例
  renderer: null,
  dataManager: null,
  timeSystem: null,
  plantingSystem: null,
  canvas: null,
  ctx: null,
  
  // 游戏状态
  gameState: {
    isRunning: false,
    selectedTool: 'hoe',
    selectedSeed: 'parsnip',
    playerDirection: 'down',
    playerMoving: false,
    playerWatering: false,
    touchStartX: 0,
    touchStartY: 0
  },
  
  onLoad() {
    this.initGame();
  },
  
  onShow() {
    this.updateUI();
  },
  
  onHide() {
    this.saveGame();
  },
  
  initGame() {
    // 初始化数据管理器
    this.dataManager = new GameDataManager();
    
    // 初始化时间系统
    this.timeSystem = new TimeSystem();
    
    // 初始化种植系统
    this.plantingSystem = new PlantingSystem();
    
    // 初始化画布
    this.initCanvas();
    
    this.updateUI();
  },
  
  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          this.canvas = res[0].node;
          this.ctx = this.canvas.getContext('2d');
          
          const sysInfo = wx.getSystemInfoSync();
          const dpr = sysInfo.pixelRatio;
          
          this.canvas.width = res[0].width * dpr;
          this.canvas.height = res[0].height * dpr;
          this.ctx.scale(dpr, dpr);
          
          // 初始化渲染器
          this.renderer = new GameRenderer(this.canvas, this.ctx);
          this.renderer.init(res[0].width, res[0].height, dpr);
          
          // 开始游戏循环
          this.startGameLoop();
        }
      });
  },
  
  startGameLoop() {
    this.gameState.isRunning = true;
    let lastTime = Date.now();
    
    const gameLoop = () => {
      if (!this.gameState.isRunning) return;
      
      const now = Date.now();
      const dt = now - lastTime;
      lastTime = now;
      
      // 更新游戏逻辑
      this.update(dt);
      
      // 渲染游戏画面
      this.render();
      
      this.canvas.requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
  },
  
  update(dt) {
    // 更新动画
    this.renderer.updateAnimation(dt);
    
    // 更新时间系统
    this.timeSystem.update(dt);
    
    // 更新玩家位置
    this.updatePlayerPosition();
  },
  
  render() {
    const renderer = this.renderer;
    const player = this.dataManager.getPlayer();
    const farm = this.dataManager.getFarm();
    const timeData = this.dataManager.getTime();
    
    // 清屏
    renderer.clear();
    
    // 绘制背景
    const timePeriod = this.timeSystem.getTimePeriod();
    renderer.drawBackground(timeData.season, timeData.weather, timePeriod);
    
    // 绘制建筑
    farm.buildings.forEach(b => {
      renderer.drawBuilding(
        15 + b.x * 32,
        60 + b.y * 32,
        b.type
      );
    });
    
    // 绘制农田
    renderer.drawFarm(farm.tiles, 32);
    
    // 绘制角色
    renderer.drawCharacter(
      player.x,
      player.y,
      player.direction,
      player.isMoving,
      player.isWatering
    );
    
    // 绘制工具
    if (player.isWatering || this.gameState.playerWatering) {
      renderer.drawTool(
        this.gameState.selectedTool,
        player.x,
        player.y,
        player.direction
      );
    }
    
    // 绘制天气效果
    renderer.drawWeatherEffect(timeData.weather);
    
    // 绘制状态栏
    const seasonNames = { spring:'春季', summer:'夏季', autumn:'秋季', winter:'冬季' };
    const weatherIcons = { sunny:'☀️', cloudy:'☁️', rainy:'🌧️', stormy:'⛈️', snowy:'❄️' };
    
    renderer.drawStatusBar(
      player.gold,
      player.energy,
      player.maxEnergy,
      timeData.day,
      seasonNames[timeData.season],
      this.timeSystem.getTimeString(),
      weatherIcons[timeData.weather]
    );
    
    // 绘制工具栏
    const tools = [
      { id: 'hoe', name: '锄头', icon: '⛏️' },
      { id: 'watering_can', name: '水壶', icon: '💧' },
      { id: 'seed', name: '种子', icon: '🌱' },
      { id: 'fertilizer', name: '肥料', icon: '💩' },
      { id: 'harvest', name: '收获', icon: '🌾' },
      { id: 'axe', name: '斧头', icon: '🪓' },
      { id: 'pickaxe', name: '镐', icon: '⛏️' },
      { id: 'fishing_rod', name: '钓竿', icon: '🎣' }
    ];
    
    renderer.drawToolbar(tools, this.gameState.selectedTool);
    
    // 绘制小地图
    renderer.drawMiniMap(
      renderer.width - 110,
      50,
      100,
      75,
      farm.tiles,
      Math.floor(player.x / 32),
      Math.floor(player.y / 32)
    );
  },
  
  // 更新玩家位置
  updatePlayerPosition() {
    const player = this.dataManager.getPlayer();
    
    if (this.gameState.playerMoving) {
      const speed = player.speed;
      
      switch(player.direction) {
        case 'up': player.y -= speed; break;
        case 'down': player.y += speed; break;
        case 'left': player.x -= speed; break;
        case 'right': player.x += speed; break;
      }
      
      // 边界检查
      player.x = Math.max(20, Math.min(this.renderer.width - 20, player.x));
      player.y = Math.max(70, Math.min(this.renderer.height - 80, player.y));
    }
  },
  
  // 触摸事件处理
  handleTouchStart(e) {
    const touch = e.touches[0];
    this.gameState.touchStartX = touch.x;
    this.gameState.touchStartY = touch.y;
    
    // 检查是否点击了工具栏
    if (touch.y > this.renderer.height - 65) {
      this.handleToolbarTap(touch.x, touch.y);
      return;
    }
    
    // 移动玩家
    const player = this.dataManager.getPlayer();
    const dx = touch.x - player.x;
    const dy = touch.y - player.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      player.direction = dx > 0 ? 'right' : 'left';
    } else {
      player.direction = dy > 0 ? 'down' : 'up';
    }
    
    this.gameState.playerMoving = true;
  },
  
  handleTouchMove(e) {
    const touch = e.touches[0];
    const player = this.dataManager.getPlayer();
    
    const dx = touch.x - player.x;
    const dy = touch.y - player.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      player.direction = dx > 0 ? 'right' : 'left';
    } else {
      player.direction = dy > 0 ? 'down' : 'up';
    }
  },
  
  handleTouchEnd(e) {
    this.gameState.playerMoving = false;
    
    // 执行工具操作
    this.executeToolAction();
  },
  
  // 工具栏点击
  handleToolbarTap(x, y) {
    const tools = ['hoe', 'watering_can', 'seed', 'fertilizer', 'harvest', 'axe', 'pickaxe', 'fishing_rod'];
    const btnWidth = this.renderer.width / tools.length;
    const index = Math.floor(x / btnWidth);
    
    if (index >= 0 && index < tools.length) {
      const tool = tools[index];
      this.gameState.selectedTool = tool;
      this.setData({ currentTool: tool });
      
      if (tool === 'seed') {
        this.setData({ showSeedSelector: true });
      }
      
      wx.vibrateShort();
    }
  },
  
  // 执行工具操作
  executeToolAction() {
    const player = this.dataManager.getPlayer();
    const farm = this.dataManager.getFarm();
    const tool = this.gameState.selectedTool;
    
    // 计算目标网格位置
    let targetX, targetY;
    const gridSize = 32;
    const mapOffsetX = 15;
    const mapOffsetY = 60;
    
    switch(player.direction) {
      case 'up': 
        targetX = Math.floor((player.x - mapOffsetX) / gridSize);
        targetY = Math.floor((player.y - mapOffsetY - gridSize) / gridSize);
        break;
      case 'down':
        targetX = Math.floor((player.x - mapOffsetX) / gridSize);
        targetY = Math.floor((player.y - mapOffsetY + gridSize) / gridSize);
        break;
      case 'left':
        targetX = Math.floor((player.x - mapOffsetX - gridSize) / gridSize);
        targetY = Math.floor((player.y - mapOffsetY) / gridSize);
        break;
      case 'right':
        targetX = Math.floor((player.x - mapOffsetX + gridSize) / gridSize);
        targetY = Math.floor((player.y - mapOffsetY) / gridSize);
        break;
    }
    
    // 检查目标位置是否有效
    if (targetX < 0 || targetX >= 18 || targetY < 0 || targetY >= 12) return;
    
    const tile = farm.tiles.find(t => t.x === targetX && t.y === targetY);
    if (!tile) return;
    
    switch(tool) {
      case 'hoe':
        if (player.energy >= 2 && tile.type === 'grass') {
          tile.type = 'soil';
          tile.state = 'tilled';
          player.energy -= 2;
          this.showNotify('翻地成功');
          wx.vibrateShort();
        } else if (tile.type !== 'grass') {
          this.showNotify('这里已经翻过了');
        } else {
          this.showNotify('体力不足');
        }
        break;
        
      case 'watering_can':
        if (player.energy >= 1 && tile.crop) {
          tile.watered = true;
          player.energy -= 1;
          this.showNotify('浇水成功');
        }
        break;
        
      case 'seed':
        if (player.energy >= 1 && tile.state === 'tilled' && !tile.crop) {
          const seedType = this.gameState.selectedSeed;
          if (this.dataManager.useSeed(seedType)) {
            tile.crop = {
              type: seedType,
              growthDay: 0,
              state: 'seed',
              quality: 'normal',
              dead: false
            };
            player.energy -= 1;
            this.showNotify(`种植了${seedType}`);
          } else {
            this.showNotify('没有种子了');
          }
        }
        break;
        
      case 'harvest':
        if (tile.crop && tile.crop.state === 'mature') {
          const cropData = this.plantingSystem.getCropInfo(tile.crop.type);
          if (cropData) {
            const price = this.calculateHarvestPrice(cropData, tile.crop.quality);
            this.dataManager.updateGold(price);
            this.dataManager.addSkillExp('farming', 10);
            
            tile.crop = null;
            tile.state = 'tilled';
            
            this.showNotify(`收获！获得${price}金币`);
            wx.vibrateShort();
          }
        }
        break;
        
      case 'fertilizer':
        if (tile.crop && !tile.fertilized) {
          tile.fertilized = true;
          this.showNotify('施肥成功');
        }
        break;
    }
    
    this.updateUI();
  },
  
  calculateHarvestPrice(cropData, quality) {
    let price = cropData.sellPrice;
    switch(quality) {
      case 'iridium': price *= 2; break;
      case 'gold': price *= 1.5; break;
      case 'silver': price *= 1.25; break;
    }
    return Math.floor(price);
  },
  
  // 选择种子
  selectSeed(e) {
    const seedId = e.currentTarget.dataset.seed;
    this.gameState.selectedSeed = seedId;
    this.setData({ selectedSeed: seedId, showSeedSelector: false });
    wx.showToast({ title: `选择了${seedId}`, icon: 'none' });
  },
  
  // 显示通知
  showNotify(msg) {
    this.setData({ notification: msg, showNotification: true });
    setTimeout(() => {
      this.setData({ showNotification: false });
    }, 2000);
  },
  
  // 更新UI
  updateUI() {
    const player = this.dataManager.getPlayer();
    const timeData = this.dataManager.getTime();
    const seasonNames = { spring:'春季', summer:'夏季', autumn:'秋季', winter:'冬季' };
    const weatherIcons = { sunny:'☀️', cloudy:'☁️', rainy:'🌧️', stormy:'⛈️', snowy:'❄️' };
    
    this.setData({
      playerGold: player.gold,
      playerEnergy: player.energy,
      playerMaxEnergy: player.maxEnergy,
      gameDay: timeData.day,
      gameSeason: seasonNames[timeData.season],
      gameWeather: weatherIcons[timeData.weather],
      gameTime: this.timeSystem.getTimeString()
    });
  },
  
  // 保存游戏
  saveGame() {
    this.dataManager.save();
  },
  
  // 跳转页面
  goToInventory() { wx.switchTab({ url: '/pages/inventory/inventory' }); },
  goToSocial() { wx.switchTab({ url: '/pages/social/social' }); },
  goToMine() { wx.navigateTo({ url: '/pages/mine/mine' }); },
  goToFish() { wx.navigateTo({ url: '/pages/fishing/fishing' }); },
  goToSettings() { wx.switchTab({ url: '/pages/settings/settings' }); },
  
  // 面板控制
  hideSeedSelector() { this.setData({ showSeedSelector: false }); },
  showShopPanel() { this.setData({ showShop: true }); },
  hideShopPanel() { this.setData({ showShop: false }); },
  showBackpackPanel() { this.setData({ showBackpack: true }); },
  hideBackpackPanel() { this.setData({ showBackpack: false }); }
});