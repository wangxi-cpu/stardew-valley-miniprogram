/**
 * 星露谷物语 - 游戏主页面
 */

const GameEngine = require('../../utils/engine');
const TimeSystem = require('../../utils/time-system');
const PlantingSystem = require('../../utils/planting-system');
const SocialSystem = require('../../utils/social-system');

const app = getApp();

Page({
  data: {
    // 游戏状态
    gameTime: '06:00',
    gameDay: 1,
    gameSeason: '春季',
    gameWeather: '☀️',
    playerGold: 500,
    playerEnergy: 100,
    playerMaxEnergy: 100,
    
    // 工具
    currentTool: 'hoe',
    tools: [
      { id: 'hoe', name: '锄头', icon: '⛏️' },
      { id: 'watering_can', name: '水壶', icon: '💧' },
      { id: 'seed', name: '种子', icon: '🌱' },
      { id: 'fertilizer', name: '肥料', icon: '💩' },
      { id: 'harvest', name: '收获', icon: '🌾' },
      { id: 'axe', name: '斧头', icon: '🪓' },
      { id: 'pickaxe', name: '镐', icon: '⛏️' },
      { id: 'fishing_rod', name: '钓竿', icon: '🎣' }
    ],
    
    // 种子选择
    selectedSeed: 'parsnip',
    showSeedSelector: false,
    seeds: [
      { id: 'parsnip', name: '防风草', icon: '🥕', cost: 20 },
      { id: 'potato', name: '土豆', icon: '🥔', cost: 50 },
      { id: 'cauliflower', name: '花椰菜', icon: '🥦', cost: 80 },
      { id: 'tomato', name: '番茄', icon: '🍅', cost: 50 },
      { id: 'blueberry', name: '蓝莓', icon: '🫐', cost: 80 },
      { id: 'corn', name: '玉米', icon: '🌽', cost: 150 },
      { id: 'melon', name: '西瓜', icon: '🍉', cost: 80 },
      { id: 'pumpkin', name: '南瓜', icon: '🎃', cost: 100 }
    ],
    
    // 面板状态
    showShop: false,
    showBackpack: false,
    showSocial: false,
    showSettings: false,
    
    // 通知
    notification: '',
    showNotification: false
  },
  
  // 游戏引擎实例
  engine: null,
  timeSystem: null,
  plantingSystem: null,
  socialSystem: null,
  
  onLoad() {
    this.initGame();
  },
  
  onShow() {
    this.updateUI();
  },
  
  onHide() {
    app.saveGame();
  },
  
  initGame() {
    // 创建游戏引擎
    this.engine = new GameEngine();
    
    // 添加系统
    this.timeSystem = new TimeSystem();
    this.engine.addSystem(this.timeSystem);
    
    this.plantingSystem = new PlantingSystem();
    this.engine.addSystem(this.plantingSystem);
    
    this.socialSystem = new SocialSystem();
    this.engine.addSystem(this.socialSystem);
    
    // 监听事件
    this.engine.on('dayChanged', (data) => {
      this.onDayChanged(data);
    });
    
    this.engine.on('timeChanged', (data) => {
      this.updateTimeDisplay(data);
    });
    
    // 开始游戏循环
    this.engine.start();
    
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
          
          const dpr = wx.getSystemInfoSync().pixelRatio;
          this.canvas.width = res[0].width * dpr;
          this.canvas.height = res[0].height * dpr;
          this.ctx.scale(dpr, dpr);
          
          this.startRendering();
        }
      });
  },
  
  startRendering() {
    const render = () => {
      if (!this.canvas) return;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawBackground();
      this.drawFarm();
      this.drawPlayer();
      this.drawUI();
      
      this.canvas.requestAnimationFrame(render);
    };
    
    render();
  },
  
  drawBackground() {
    const w = this.canvas.width / wx.getSystemInfoSync().pixelRatio;
    const h = this.canvas.height / wx.getSystemInfoSync().pixelRatio;
    
    // 天空
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, w, h * 0.35);
    
    // 地面
    this.ctx.fillStyle = '#90EE90';
    this.ctx.fillRect(0, h * 0.35, w, h * 0.65);
  },
  
  drawFarm() {
    const player = app.getPlayer();
    const startX = 15;
    const startY = 120;
    const gridSize = 36;
    
    // 绘制农田
    const tiles = this.plantingSystem.tiles || [];
    tiles.forEach(tile => {
      const x = startX + tile.x * gridSize;
      const y = startY + tile.y * gridSize;
      
      // 土地颜色
      if (tile.type === 'soil') {
        this.ctx.fillStyle = tile.watered ? '#654321' : '#8B4513';
      } else {
        this.ctx.fillStyle = '#90EE90';
      }
      this.ctx.fillRect(x, y, gridSize - 2, gridSize - 2);
      
      // 作物
      if (tile.crop && !tile.crop.dead) {
        this.plantingSystem.renderCrop(this.ctx, x, y, tile.crop);
      }
      
      // 网格线
      this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, gridSize - 2, gridSize - 2);
    });
    
    // 绘制建筑
    this.drawBuildings(startX, startY, gridSize);
  },
  
  drawBuildings(startX, startY, gridSize) {
    const farm = app.getFarm();
    
    // 小屋
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(startX + 5 * gridSize, startY + 5 * gridSize, gridSize * 2, gridSize * 2);
    this.ctx.fillStyle = '#A0522D';
    this.ctx.fillRect(startX + 5 * gridSize + 5, startY + 5 * gridSize + 5, gridSize * 2 - 10, gridSize * 2 - 10);
    
    // 门
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(startX + 5 * gridSize + 15, startY + 6 * gridSize + 10, 15, 20);
  },
  
  drawPlayer() {
    const player = app.getPlayer();
    const x = player.position.x;
    const y = player.position.y;
    
    // 身体
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(x - 10, y - 10, 20, 20);
    
    // 头部
    this.ctx.fillStyle = '#FFE4C4';
    this.ctx.beginPath();
    this.ctx.arc(x, y - 16, 8, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 眼睛
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(x - 3, y - 18, 1.5, 0, Math.PI * 2);
    this.ctx.arc(x + 3, y - 18, 1.5, 0, Math.PI * 2);
    this.ctx.fill();
  },
  
  drawUI() {
    const w = this.canvas.width / wx.getSystemInfoSync().pixelRatio;
    
    // 状态栏
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.ctx.fillRect(0, 0, w, 40);
    
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '13px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`💰 ${this.data.playerGold}g`, 10, 26);
    
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.fillText(`❤️ ${this.data.playerEnergy}`, 85, 26);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`${this.data.gameSeason} ${this.data.gameDay}日`, 155, 26);
    this.ctx.fillText(`${this.data.gameTime}`, 260, 26);
    this.ctx.fillText(this.data.gameWeather, 310, 26);
  },
  
  // 工具选择
  selectTool(e) {
    const toolId = e.currentTarget.dataset.tool;
    this.setData({ currentTool: toolId });
    
    if (toolId === 'seed') {
      this.setData({ showSeedSelector: true });
    } else {
      this.setData({ showSeedSelector: false });
    }
    
    wx.vibrateShort();
  },
  
  // 选择种子
  selectSeed(e) {
    const seedId = e.currentTarget.dataset.seed;
    this.setData({ selectedSeed: seedId, showSeedSelector: false });
    wx.showToast({ title: `选择了${seedId}`, icon: 'none' });
  },
  
  // 画布点击
  handleCanvasTap(e) {
    const touch = e.touches[0];
    const x = touch.x;
    const y = touch.y;
    
    const player = app.getPlayer();
    player.position.x = x;
    player.position.y = y;
    
    // 根据工具执行操作
    this.executeToolAction(x, y);
  },
  
  executeToolAction(x, y) {
    const tool = this.data.currentTool;
    const player = app.getPlayer();
    
    // 计算网格位置
    const gridX = Math.floor((x - 15) / 36);
    const gridY = Math.floor((y - 120) / 36);
    
    if (gridX < 0 || gridX >= 20 || gridY < 0 || gridY >= 15) return;
    
    switch(tool) {
      case 'hoe':
        if (player.energy >= 2) {
          if (this.plantingSystem.tillSoil(gridX, gridY)) {
            player.energy -= 2;
            this.showNotify('翻地成功');
            wx.vibrateShort();
          }
        } else {
          this.showNotify('体力不足');
        }
        break;
        
      case 'watering_can':
        if (player.energy >= 1) {
          if (this.plantingSystem.waterTile(gridX, gridY)) {
            player.energy -= 1;
            this.showNotify('浇水成功');
          }
        }
        break;
        
      case 'seed':
        if (player.energy >= 1) {
          if (this.plantingSystem.plantCrop(gridX, gridY, this.data.selectedSeed, player)) {
            player.energy -= 1;
            this.showNotify(`种植了${this.data.selectedSeed}`);
          } else {
            this.showNotify('无法种植');
          }
        }
        break;
        
      case 'harvest':
        const result = this.plantingSystem.harvestCrop(gridX, gridY, player);
        if (result) {
          app.updateGold(result.price);
          this.showNotify(`收获了${result.yield}个作物，获得${result.price}金币`);
        }
        break;
    }
    
    this.updateUI();
  },
  
  // 显示通知
  showNotify(msg) {
    this.setData({ notification: msg, showNotification: true });
    setTimeout(() => {
      this.setData({ showNotification: false });
    }, 2000);
  },
  
  // 日期变化
  onDayChanged(data) {
    this.setData({
      gameDay: data.day,
      gameSeason: data.seasonName,
      gameWeather: data.weatherIcon
    });
    
    // 恢复体力
    const player = app.getPlayer();
    player.energy = player.maxEnergy;
    
    // 重置社交
    this.socialSystem.resetDaily();
    
    app.saveGame();
    this.updateUI();
  },
  
  // 更新时间显示
  updateTimeDisplay(data) {
    this.setData({ gameTime: data.timeString });
  },
  
  // 更新UI
  updateUI() {
    const player = app.getPlayer();
    this.setData({
      playerGold: player.gold,
      playerEnergy: player.energy,
      playerMaxEnergy: player.maxEnergy
    });
  },
  
  // 面板控制
  showShopPanel() { this.setData({ showShop: true }); },
  hideShopPanel() { this.setData({ showShop: false }); },
  
  showBackpackPanel() { this.setData({ showBackpack: true }); },
  hideBackpackPanel() { this.setData({ showBackpack: false }); },
  
  showSocialPanel() { this.setData({ showSocial: true }); },
  hideSocialPanel() { this.setData({ showSocial: false }); },
  
  showSettingsPanel() { this.setData({ showSettings: true }); },
  hideSettingsPanel() { this.setData({ showSettings: false }); },
  
  // 保存游戏
  saveGame() {
    app.saveGame();
    wx.showToast({ title: '游戏已保存', icon: 'success' });
  },
  
  // 跳转页面
  goToInventory() { wx.switchTab({ url: '/pages/inventory/inventory' }); },
  goToSocial() { wx.switchTab({ url: '/pages/social/social' }); },
  goToMine() { wx.navigateTo({ url: '/pages/mine/mine' }); },
  goToFish() { wx.navigateTo({ url: '/pages/fishing/fishing' }); },
  goToSettings() { wx.switchTab({ url: '/pages/settings/settings' }); }
});