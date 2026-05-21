/**
 * 种植系统 - 完整的作物种植、生长、收获
 */
class PlantingSystem {
  constructor() {
    this.crops = {
      parsnip:{name:'防风草',seedCost:20,sellPrice:35,growthTime:4,seasons:['spring']},
      potato:{name:'土豆',seedCost:50,sellPrice:80,growthTime:6,seasons:['spring']},
      cauliflower:{name:'花椰菜',seedCost:80,sellPrice:175,growthTime:12,seasons:['spring']},
      tomato:{name:'番茄',seedCost:50,sellPrice:60,growthTime:11,seasons:['summer'],regrowth:4},
      blueberry:{name:'蓝莓',seedCost:80,sellPrice:50,growthTime:13,seasons:['summer'],harvestYield:3,regrowth:4},
      corn:{name:'玉米',seedCost:150,sellPrice:50,growthTime:14,seasons:['summer','autumn'],regrowth:4},
      melon:{name:'西瓜',seedCost:80,sellPrice:250,growthTime:12,seasons:['summer']},
      pumpkin:{name:'南瓜',seedCost:100,sellPrice:320,growthTime:13,seasons:['autumn']},
      cranberry:{name:'蔓越莓',seedCost:240,sellPrice:75,growthTime:7,seasons:['autumn'],regrowth:5},
      grape:{name:'葡萄',seedCost:60,sellPrice:80,growthTime:10,seasons:['autumn'],regrowth:3},
      ancient_fruit:{name:'远古水果',seedCost:0,sellPrice:550,growthTime:28,seasons:['spring','summer','autumn'],regrowth:7}
    };
    
    this.tiles = [];
    this.gridSize = 40;
    this.mapWidth = 20;
    this.mapHeight = 15;
  }
  
  init(engine) {
    this.engine = engine;
    this.initFarmMap();
    
    engine.on('dayChanged', () => this.onDayChanged());
  }
  
  initFarmMap() {
    this.tiles = [];
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        this.tiles.push({
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
  
  getTile(x, y) {
    return this.tiles.find(t => t.x === x && t.y === y);
  }
  
  tillSoil(x, y) {
    const tile = this.getTile(x, y);
    if (!tile || tile.type !== 'grass') return false;
    tile.type = 'soil';
    tile.state = 'tilled';
    return true;
  }
  
  plantCrop(x, y, cropType, playerData) {
    const tile = this.getTile(x, y);
    if (!tile || tile.state !== 'tilled' || tile.crop) return false;
    
    const cropData = this.crops[cropType];
    if (!cropData) return false;
    
    // 检查季节
    const currentSeason = this.engine.getSystem('time').season;
    if (!cropData.seasons.includes(currentSeason)) return false;
    
    // 检查种子
    if (playerData.seeds[cropType] <= 0) return false;
    
    playerData.seeds[cropType]--;
    tile.crop = {
      type: cropType,
      growthDay: 0,
      state: 'seed',
      quality: 'normal',
      dead: false
    };
    
    return true;
  }
  
  waterTile(x, y) {
    const tile = this.getTile(x, y);
    if (!tile || !tile.crop) return false;
    tile.watered = true;
    return true;
  }
  
  fertilizeTile(x, y) {
    const tile = this.getTile(x, y);
    if (!tile || !tile.crop) return false;
    tile.fertilized = true;
    return true;
  }
  
  harvestCrop(x, y, playerData) {
    const tile = this.getTile(x, y);
    if (!tile || !tile.crop || tile.crop.state !== 'mature') return null;
    
    const cropData = this.crops[tile.crop.type];
    if (!cropData) return null;
    
    // 计算收益
    let price = cropData.sellPrice;
    const quality = this.calculateQuality();
    switch(quality) {
      case 'gold': price *= 1.5; break;
      case 'silver': price *= 1.25; break;
    }
    
    const yield_ = cropData.harvestYield || 1;
    
    // 添加到背包
    playerData.crops[tile.crop.type] = (playerData.crops[tile.crop.type] || 0) + yield_;
    
    // 处理再生
    if (cropData.regrowth) {
      tile.crop.growthDay = 0;
      tile.crop.state = 'growing';
    } else {
      tile.crop = null;
      tile.state = 'tilled';
    }
    
    return { type: tile.crop?.type, yield: yield_, price: Math.floor(price), quality };
  }
  
  calculateQuality() {
    const rand = Math.random();
    if (rand < 0.01) return 'iridium';
    if (rand < 0.05) return 'gold';
    if (rand < 0.2) return 'silver';
    return 'normal';
  }
  
  onDayChanged() {
    const timeSys = this.engine.getSystem('time');
    
    this.tiles.forEach(tile => {
      if (tile.crop && !tile.crop.dead) {
        // 浇水检查
        if (tile.watered || timeSys.isRaining()) {
          tile.crop.growthDay++;
          tile.crop.watered = false;
          
          const cropData = this.crops[tile.crop.type];
          if (cropData && tile.crop.growthDay >= cropData.growthTime) {
            tile.crop.state = 'mature';
          } else {
            tile.crop.state = 'growing';
          }
        }
        
        // 施肥加速
        if (tile.fertilized) {
          tile.crop.growthDay++;
        }
        
        // 季节检查
        const cropData = this.crops[tile.crop.type];
        if (cropData && !cropData.seasons.includes(timeSys.season)) {
          tile.crop.dead = true;
        }
      }
      
      // 重置浇水状态
      tile.watered = false;
    });
  }
  
  getCropInfo(type) { return this.crops[type]; }
  
  render(ctx, offsetX, offsetY) {
    this.tiles.forEach(tile => {
      const x = offsetX + tile.x * this.gridSize;
      const y = offsetY + tile.y * this.gridSize;
      
      // 绘制土地
      if (tile.type === 'soil') {
        ctx.fillStyle = tile.watered ? '#654321' : '#8B4513';
      } else {
        ctx.fillStyle = '#90EE90';
      }
      ctx.fillRect(x, y, this.gridSize - 2, this.gridSize - 2);
      
      // 绘制作物
      if (tile.crop && !tile.crop.dead) {
        this.renderCrop(ctx, x, y, tile.crop);
      }
    });
  }
  
  renderCrop(ctx, x, y, crop) {
    const centerX = x + this.gridSize / 2;
    const centerY = y + this.gridSize / 2;
    
    switch(crop.state) {
      case 'seed':
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(centerX, centerY + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'growing':
        ctx.fillStyle = '#228B22';
        ctx.fillRect(centerX - 2, centerY - 10, 4, 15);
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 12, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'mature':
        ctx.fillStyle = '#228B22';
        ctx.fillRect(centerX - 2, centerY - 15, 4, 20);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 18, 8, 0, Math.PI * 2);
        ctx.fill();
        // 闪光效果
        if (Math.sin(Date.now() * 0.005) > 0.8) {
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.beginPath();
          ctx.arc(centerX + 5, centerY - 22, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }
  }
}

module.exports = PlantingSystem;
