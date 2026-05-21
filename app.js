/**
 * 星露谷物语 - 主应用文件
 */

const GameEngine = require('./utils/engine');
const TimeSystem = require('./utils/time-system');
const PlantingSystem = require('./utils/planting-system');
const SocialSystem = require('./utils/social-system');
const MineSystem = require('./utils/mine-system');
const FishingSystem = require('./utils/fishing-system');

App({
  onLaunch() {
    console.log('星露谷物语启动');
    this.initGameData();
  },
  
  globalData: {
    version: '1.0.0',
    
    // 玩家数据
    player: {
      name: '农场主',
      level: 1,
      exp: 0,
      gold: 500,
      energy: 100,
      maxEnergy: 100,
      health: 100,
      maxHealth: 100,
      position: { x: 10, y: 10 },
      direction: 'down',
      inventory: [],
      seeds: {
        parsnip: 15,
        potato: 0,
        cauliflower: 0,
        tomato: 0,
        blueberry: 0,
        corn: 0,
        melon: 0,
        pumpkin: 0,
        cranberry: 0,
        grape: 0
      },
      crops: {},
      fish: {},
      minerals: {},
      craftedItems: {},
      recipes: [],
      skills: {
        farming: { level: 1, exp: 0 },
        mining: { level: 1, exp: 0 },
        fishing: { level: 1, exp: 0 },
        foraging: { level: 1, exp: 0 },
        combat: { level: 1, exp: 0 }
      }
    },
    
    // 农场数据
    farm: {
      name: '星露农场',
      type: 'standard',
      buildings: [
        { type: 'cabin', x: 5, y: 5, level: 1 },
        { type: 'silo', x: 15, y: 3 }
      ],
      animals: [],
      decorations: []
    },
    
    // 社交数据
    social: {
      relationships: {},
      married: false,
      spouse: null,
      children: 0
    },
    
    // 任务数据
    quests: {
      active: [],
      completed: [],
      mainStoryProgress: 0
    },
    
    // 成就数据
    achievements: {},
    
    // 游戏设置
    settings: {
      sound: true,
      music: true,
      vibration: true,
      autoSave: true,
      dayNightCycle: true
    }
  },
  
  initGameData() {
    const savedData = wx.getStorageSync('stardew_save');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        Object.assign(this.globalData.player, data.player || {});
        Object.assign(this.globalData.farm, data.farm || {});
        Object.assign(this.globalData.social, data.social || {});
        Object.assign(this.globalData.quests, data.quests || {});
        Object.assign(this.globalData.achievements, data.achievements || {});
      } catch(e) {
        console.error('加载存档失败:', e);
      }
    }
    
    // 初始化默认物品
    if (this.globalData.player.inventory.length === 0) {
      this.globalData.player.inventory = [
        { id: 'hoe', name: '锄头', type: 'tool', quantity: 1 },
        { id: 'watering_can', name: '水壶', type: 'tool', quantity: 1 },
        { id: 'axe', name: '斧头', type: 'tool', quantity: 1 },
        { id: 'pickaxe', name: '镐', type: 'tool', quantity: 1 },
        { id: 'fishing_rod', name: '钓竿', type: 'tool', quantity: 1 },
        { id: 'scythe', name: '镰刀', type: 'tool', quantity: 1 }
      ];
    }
  },
  
  saveGame() {
    const saveData = {
      player: this.globalData.player,
      farm: this.globalData.farm,
      social: this.globalData.social,
      quests: this.globalData.quests,
      achievements: this.globalData.achievements,
      timestamp: Date.now()
    };
    
    wx.setStorageSync('stardew_save', JSON.stringify(saveData));
    return true;
  },
  
  loadGame() {
    this.initGameData();
    return true;
  },
  
  resetGame() {
    wx.removeStorageSync('stardew_save');
    this.globalData.player = {
      name: '农场主',
      level: 1,
      exp: 0,
      gold: 500,
      energy: 100,
      maxEnergy: 100,
      health: 100,
      maxHealth: 100,
      position: { x: 10, y: 10 },
      direction: 'down',
      inventory: [],
      seeds: { parsnip: 15, potato: 0, cauliflower: 0, tomato: 0, blueberry: 0, corn: 0, melon: 0, pumpkin: 0, cranberry: 0, grape: 0 },
      crops: {},
      fish: {},
      minerals: {},
      craftedItems: {},
      recipes: [],
      skills: {
        farming: { level: 1, exp: 0 },
        mining: { level: 1, exp: 0 },
        fishing: { level: 1, exp: 0 },
        foraging: { level: 1, exp: 0 },
        combat: { level: 1, exp: 0 }
      }
    };
    return true;
  },
  
  getPlayer() { return this.globalData.player; },
  getFarm() { return this.globalData.farm; },
  getSocial() { return this.globalData.social; },
  getQuests() { return this.globalData.quests; },
  
  updateGold(amount) {
    this.globalData.player.gold += amount;
    if (amount > 0) {
      this.globalData.player.skills.farming.exp += amount;
    }
    this.saveGame();
  },
  
  updateEnergy(amount) {
    this.globalData.player.energy = Math.max(0, 
      Math.min(this.globalData.player.maxEnergy, 
        this.globalData.player.energy + amount));
  },
  
  addItem(item) {
    const inventory = this.globalData.player.inventory;
    const existing = inventory.find(i => i.id === item.id);
    
    if (existing) {
      existing.quantity += (item.quantity || 1);
    } else {
      if (inventory.length < 36) {
        inventory.push({ ...item, quantity: item.quantity || 1 });
      } else {
        wx.showToast({ title: '背包已满', icon: 'none' });
        return false;
      }
    }
    
    this.saveGame();
    return true;
  },
  
  removeItem(itemId, quantity = 1) {
    const inventory = this.globalData.player.inventory;
    const index = inventory.findIndex(i => i.id === itemId);
    
    if (index > -1) {
      inventory[index].quantity -= quantity;
      if (inventory[index].quantity <= 0) {
        inventory.splice(index, 1);
      }
      this.saveGame();
      return true;
    }
    
    return false;
  },
  
  getItemQuantity(itemId) {
    const item = this.globalData.player.inventory.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  },
  
  addSkillExp(skill, amount) {
    const skillData = this.globalData.player.skills[skill];
    if (!skillData) return;
    
    skillData.exp += amount;
    
    // 升级所需经验
    const expNeeded = skillData.level * 100;
    if (skillData.exp >= expNeeded) {
      skillData.level++;
      skillData.exp -= expNeeded;
      
      // 升级奖励
      this.globalData.player.maxEnergy += 10;
      this.globalData.player.energy = this.globalData.player.maxEnergy;
      
      wx.showToast({ title: `${skill}技能升级到${skillData.level}级！`, icon: 'none' });
    }
  }
});