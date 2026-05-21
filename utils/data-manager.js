/**
 * 星露谷物语 - 游戏数据管理
 * 管理玩家数据、存档、物品等
 */

class GameDataManager {
  constructor() {
    this.data = {
      player: {
        name: '农场主',
        level: 1,
        exp: 0,
        gold: 500,
        energy: 100,
        maxEnergy: 100,
        health: 100,
        maxHealth: 100,
        x: 200,
        y: 300,
        direction: 'down',
        speed: 3,
        isMoving: false,
        isWatering: false,
        inventory: [],
        seeds: {
          parsnip: 15,
          potato: 0,
          cauliflower: 0,
          tomato: 0,
          blueberry: 0,
          corn: 0,
          melon: 0,
          pumpkin: 0
        },
        crops: {},
        fish: {},
        minerals: {},
        tools: {
          hoe: { level: 1, name: '锄头' },
          watering_can: { level: 1, name: '水壶' },
          axe: { level: 1, name: '斧头' },
          pickaxe: { level: 1, name: '镐' },
          fishing_rod: { level: 1, name: '钓竿' }
        },
        skills: {
          farming: { level: 1, exp: 0 },
          mining: { level: 1, exp: 0 },
          fishing: { level: 1, exp: 0 },
          foraging: { level: 1, exp: 0 },
          combat: { level: 1, exp: 0 }
        }
      },
      
      farm: {
        name: '星露农场',
        tiles: [],
        buildings: [
          { type: 'cabin', x: 5, y: 3 },
          { type: 'silo', x: 12, y: 2 }
        ],
        animals: [],
        decorations: []
      },
      
      time: {
        time: 360,
        day: 1,
        season: 'spring',
        year: 1,
        weather: 'sunny'
      },
      
      social: {
        relationships: {},
        married: false,
        spouse: null,
        children: 0
      },
      
      quests: {
        active: [],
        completed: []
      },
      
      achievements: {},
      
      settings: {
        sound: true,
        music: true,
        vibration: true,
        autoSave: true
      }
    };
    
    this.initDefaultData();
  }
  
  initDefaultData() {
    // 初始化农田
    if (this.data.farm.tiles.length === 0) {
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 18; x++) {
          this.data.farm.tiles.push({
            x, y,
            type: 'grass',
            state: 'empty',
            crop: null,
            watered: false,
            fertilized: false
          });
        }
      }
    }
    
    // 初始化背包
    if (this.data.player.inventory.length === 0) {
      this.data.player.inventory = [
        { id: 'hoe', name: '锄头', type: 'tool', quantity: 1, icon: '⛏️' },
        { id: 'watering_can', name: '水壶', type: 'tool', quantity: 1, icon: '💧' },
        { id: 'axe', name: '斧头', type: 'tool', quantity: 1, icon: '🪓' },
        { id: 'pickaxe', name: '镐', type: 'tool', quantity: 1, icon: '⛏️' },
        { id: 'fishing_rod', name: '钓竿', type: 'tool', quantity: 1, icon: '🎣' },
        { id: 'scythe', name: '镰刀', type: 'tool', quantity: 1, icon: '🔪' },
        { id: 'parsnip_seeds', name: '防风草种子', type: 'seed', quantity: 15, icon: '🌱' }
      ];
    }
    
    // 初始化社交关系
    const villagers = ['abigail', 'sebastian', 'maru', 'penny', 'leah', 'haley', 
                       'alex', 'elliott', 'harvey', 'sam', 'shane', 'emily'];
    villagers.forEach(id => {
      if (!this.data.social.relationships[id]) {
        this.data.social.relationships[id] = {
          hearts: 0,
          talkedToday: false,
          giftedToday: false
        };
      }
    });
  }
  
  // 获取玩家数据
  getPlayer() { return this.data.player; }
  getFarm() { return this.data.farm; }
  getTime() { return this.data.time; }
  getSocial() { return this.data.social; }
  getQuests() { return this.data.quests; }
  getSettings() { return this.data.settings; }
  
  // 更新金币
  updateGold(amount) {
    this.data.player.gold += amount;
    if (amount > 0) {
      this.addSkillExp('farming', Math.floor(amount / 10));
    }
  }
  
  // 更新体力
  updateEnergy(amount) {
    this.data.player.energy = Math.max(0, 
      Math.min(this.data.player.maxEnergy, 
        this.data.player.energy + amount));
  }
  
  // 添加物品
  addItem(item) {
    const inventory = this.data.player.inventory;
    const existing = inventory.find(i => i.id === item.id);
    
    if (existing) {
      existing.quantity += (item.quantity || 1);
    } else {
      if (inventory.length < 36) {
        inventory.push({ ...item, quantity: item.quantity || 1 });
      } else {
        return false;
      }
    }
    return true;
  }
  
  // 移除物品
  removeItem(itemId, quantity = 1) {
    const inventory = this.data.player.inventory;
    const index = inventory.findIndex(i => i.id === itemId);
    
    if (index > -1) {
      inventory[index].quantity -= quantity;
      if (inventory[index].quantity <= 0) {
        inventory.splice(index, 1);
      }
      return true;
    }
    return false;
  }
  
  // 获取物品数量
  getItemQuantity(itemId) {
    const item = this.data.player.inventory.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  }
  
  // 添加技能经验
  addSkillExp(skill, amount) {
    const skillData = this.data.player.skills[skill];
    if (!skillData) return;
    
    skillData.exp += amount;
    const expNeeded = skillData.level * 100;
    
    if (skillData.exp >= expNeeded) {
      skillData.level++;
      skillData.exp -= expNeeded;
      this.data.player.maxEnergy += 10;
      this.data.player.energy = this.data.player.maxEnergy;
      return true;
    }
    return false;
  }
  
  // 获取种子数量
  getSeedCount(seedType) {
    return this.data.player.seeds[seedType] || 0;
  }
  
  // 使用种子
  useSeed(seedType) {
    if (this.data.player.seeds[seedType] > 0) {
      this.data.player.seeds[seedType]--;
      return true;
    }
    return false;
  }
  
  // 添加种子
  addSeeds(seedType, quantity) {
    this.data.player.seeds[seedType] = (this.data.player.seeds[seedType] || 0) + quantity;
  }
  
  // 保存游戏
  save() {
    try {
      wx.setStorageSync('stardew_save', JSON.stringify(this.data));
      return true;
    } catch(e) {
      console.error('保存失败:', e);
      return false;
    }
  }
  
  // 加载游戏
  load() {
    try {
      const saved = wx.getStorageSync('stardew_save');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(this.data, data);
        return true;
      }
      return false;
    } catch(e) {
      console.error('加载失败:', e);
      return false;
    }
  }
  
  // 重置游戏
  reset() {
    wx.removeStorageSync('stardew_save');
    this.data = {
      player: {
        name: '农场主',
        level: 1,
        exp: 0,
        gold: 500,
        energy: 100,
        maxEnergy: 100,
        health: 100,
        maxHealth: 100,
        x: 200,
        y: 300,
        direction: 'down',
        speed: 3,
        isMoving: false,
        isWatering: false,
        inventory: [],
        seeds: { parsnip: 15 },
        crops: {},
        fish: {},
        minerals: {},
        tools: {},
        skills: {
          farming: { level: 1, exp: 0 },
          mining: { level: 1, exp: 0 },
          fishing: { level: 1, exp: 0 },
          foraging: { level: 1, exp: 0 },
          combat: { level: 1, exp: 0 }
        }
      },
      farm: { name: '星露农场', tiles: [], buildings: [], animals: [], decorations: [] },
      time: { time: 360, day: 1, season: 'spring', year: 1, weather: 'sunny' },
      social: { relationships: {}, married: false, spouse: null, children: 0 },
      quests: { active: [], completed: [] },
      achievements: {},
      settings: { sound: true, music: true, vibration: true, autoSave: true }
    };
    this.initDefaultData();
  }
}

module.exports = GameDataManager;