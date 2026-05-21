/**
 * 钓鱼系统 - 钓鱼小游戏
 */
class FishingSystem {
  constructor() {
    this.fish = {
      sunfish:{name:'太阳鱼',location:'river',seasons:['spring','summer'],difficulty:30,sellPrice:30},
      catfish:{name:'鲶鱼',location:'river',seasons:['spring','fall'],difficulty:75,sellPrice:200},
      trout:{name:'鳟鱼',location:'river',seasons:['summer'],difficulty:50,sellPrice:65},
      salmon:{name:'鲑鱼',location:'river',seasons:['fall'],difficulty:50,sellPrice:75},
      bass:{name:'鲈鱼',location:'lake',seasons:['spring','summer'],difficulty:50,sellPrice:50},
      carp:{name:'鲤鱼',location:'lake',seasons:['spring','summer','fall'],difficulty:15,sellPrice:30},
      sturgeon:{name:'鲟鱼',location:'lake',seasons:['summer','winter'],difficulty:78,sellPrice:200},
      tuna:{name:'金枪鱼',location:'ocean',seasons:['summer','winter'],difficulty:70,sellPrice:100},
      sardine:{name:'沙丁鱼',location:'ocean',seasons:['spring','fall','winter'],difficulty:30,sellPrice:40},
      lobster:{name:'龙虾',location:'ocean',seasons:['spring','summer','fall','winter'],difficulty:55,sellPrice:120},
      pufferfish:{name:'河豚',location:'ocean',seasons:['summer'],difficulty:80,sellPrice:200},
      octopus:{name:'章鱼',location:'ocean',seasons:['summer'],difficulty:95,sellPrice:150},
      legend:{name:'传说之鱼',location:'mountain',seasons:['spring'],difficulty:110,sellPrice:5000},
      glacierfish:{name:'冰川鱼',location:'forest',seasons:['winter'],difficulty:100,sellPrice:1000},
      crimsonfish:{name:'深红鱼',location:'ocean',seasons:['summer'],difficulty:95,sellPrice:1500}
    };
    
    this.isFishing = false;
    this.fishingGame = null;
  }
  
  init(engine) {
    this.engine = engine;
  }
  
  startFishing(location, weather, time) {
    const timeSys = this.engine.getSystem('time');
    const season = timeSys.season;
    
    // 根据位置、季节、天气筛选可钓到的鱼
    const availableFish = Object.entries(this.fish)
      .filter(([_, data]) => {
        return data.location === location && 
               data.seasons.includes(season);
      });
    
    if (availableFish.length === 0) return null;
    
    // 随机选择一条鱼
    const [fishId, fishData] = availableFish[Math.floor(Math.random() * availableFish.length)];
    
    this.isFishing = true;
    this.fishingGame = {
      fishId,
      fishName: fishData.name,
      difficulty: fishData.difficulty,
      sellPrice: fishData.sellPrice,
      progress: 0,
      position: 50,
      velocity: 0,
      fishPosition: 50,
      fishVelocity: 0,
      catchZone: 30,
      started: false,
      completed: false,
      success: false
    };
    
    return this.fishingGame;
  }
  
  updateFishingGame(dt) {
    if (!this.fishingGame || this.fishingGame.completed) return null;
    
    const game = this.fishingGame;
    
    // 鱼的随机移动
    const fishSpeed = game.difficulty / 20;
    game.fishVelocity += (Math.random() - 0.5) * fishSpeed;
    game.fishVelocity *= 0.95;
    game.fishPosition += game.fishVelocity;
    
    // 限制鱼的位置
    if (game.fishPosition < 5) {
      game.fishPosition = 5;
      game.fishVelocity *= -0.5;
    }
    if (game.fishPosition > 95) {
      game.fishPosition = 95;
      game.fishVelocity *= -0.5;
    }
    
    // 检查是否在捕捉区域
    const inZone = Math.abs(game.position - game.fishPosition) < game.catchZone / 2;
    
    if (inZone) {
      game.progress += 0.5;
    } else {
      game.progress -= 0.3;
    }
    
    // 检查是否完成
    if (game.progress >= 100) {
      game.completed = true;
      game.success = true;
      this.isFishing = false;
      return { completed: true, success: true, fish: game.fishName, sellPrice: game.sellPrice };
    }
    
    if (game.progress <= -50) {
      game.completed = true;
      game.success = false;
      this.isFishing = false;
      return { completed: true, success: false };
    }
    
    return { completed: false, inZone, progress: game.progress };
  }
  
  moveCatchZone(direction) {
    if (!this.fishingGame) return;
    
    const speed = 3;
    this.fishingGame.position += direction * speed;
    
    if (this.fishingGame.position < 10) this.fishingGame.position = 10;
    if (this.fishingGame.position > 90) this.fishingGame.position = 90;
  }
  
  getAvailableFish(location) {
    const timeSys = this.engine.getSystem('time');
    const season = timeSys.season;
    
    return Object.entries(this.fish)
      .filter(([_, data]) => data.location === location && data.seasons.includes(season))
      .map(([id, data]) => ({ id, ...data }));
  }
  
  catchFish(fishId, playerData) {
    const fishData = this.fish[fishId];
    if (!fishData) return false;
    
    playerData.fish[fishId] = (playerData.fish[fishId] || 0) + 1;
    return true;
  }
}

module.exports = FishingSystem;
