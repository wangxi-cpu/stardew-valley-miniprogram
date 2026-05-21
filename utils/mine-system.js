/**
 * 矿洞系统 - 探索、挖矿、战斗
 */
class MineSystem {
  constructor() {
    this.currentFloor = 0;
    this.maxFloorReached = 0;
    this.floors = {};
    this.monsters = {
      fly:{name:'苍蝇',hp:10,damage:3,exp:3,floors:[1,30]},
      grub:{name:'幼虫',hp:20,damage:5,exp:5,floors:[1,30]},
      bat:{name:'蝙蝠',hp:24,damage:8,exp:7,floors:[31,60]},
      skeleton:{name:'骷髅',hp:40,damage:10,exp:12,floors:[71,90]},
      fire_sprite:{name:'火焰精灵',hp:50,damage:15,exp:15,floors:[81,100]},
      slime:{name:'史莱姆',hp:30,damage:6,exp:6,floors:[1,120]}
    };
    
    this.loot = {
      copper_ore:{name:'铜矿',chance:0.5,floors:[1,40]},
      iron_ore:{name:'铁矿',chance:0.4,floors:[41,80]},
      gold_ore:{name:'金矿',chance:0.3,floors:[81,120]},
      coal:{name:'煤炭',chance:0.3,floors:[1,120]},
      diamond:{name:'钻石',chance:0.01,floors:[50,120]},
      emerald:{name:'翡翠',chance:0.05,floors:[1,120]},
      ruby:{name:'红宝石',chance:0.05,floors:[1,120]},
      amethyst:{name:'紫水晶',chance:0.08,floors:[1,120]},
      quartz:{name:'石英',chance:0.15,floors:[1,120]}
    };
  }
  
  init(engine) {
    this.engine = engine;
  }
  
  enterMine() {
    this.currentFloor = 1;
    this.generateFloor(1);
    return this.getCurrentFloorInfo();
  }
  
  generateFloor(floorNum) {
    const difficulty = Math.floor(floorNum / 10);
    
    this.floors[floorNum] = {
      number: floorNum,
      type: this.getFloorType(floorNum),
      rocks: this.generateRocks(floorNum),
      monsters: this.generateMonsters(floorNum),
      hasLadder: true,
      hasElevator: floorNum % 5 === 0
    };
  }
  
  getFloorType(floor) {
    if (floor <= 39) return 'normal';
    if (floor <= 79) return 'ice';
    if (floor <= 119) return 'lava';
    return 'skull';
  }
  
  generateRocks(floor) {
    const count = 8 + Math.floor(Math.random() * 8);
    const rocks = [];
    
    for (let i = 0; i < count; i++) {
      rocks.push({
        x: Math.floor(Math.random() * 8),
        y: Math.floor(Math.random() * 8),
        type: this.getRockType(floor),
        hp: 1 + Math.floor(floor / 20)
      });
    }
    
    return rocks;
  }
  
  getRockType(floor) {
    if (floor <= 39) return 'copper';
    if (floor <= 79) return 'iron';
    if (floor <= 119) return 'gold';
    return 'iridium';
  }
  
  generateMonsters(floor) {
    const count = 2 + Math.floor(Math.random() * 3);
    const monsters = [];
    
    const available = Object.entries(this.monsters)
      .filter(([_, m]) => floor >= m.floors[0] && floor <= m.floors[1]);
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const [type, data] = available[Math.floor(Math.random() * available.length)];
      monsters.push({
        type,
        ...data,
        x: Math.floor(Math.random() * 8),
        y: Math.floor(Math.random() * 8),
        currentHp: data.hp
      });
    }
    
    return monsters;
  }
  
  mineRock(floorNum, rockIndex) {
    const floor = this.floors[floorNum];
    if (!floor || !floor.rocks[rockIndex]) return null;
    
    const rock = floor.rocks[rockIndex];
    rock.hp--;
    
    if (rock.hp <= 0) {
      floor.rocks.splice(rockIndex, 1);
      return this.generateLoot(floorNum);
    }
    
    return null;
  }
  
  generateLoot(floor) {
    const loot = [];
    
    Object.entries(this.loot).forEach(([id, data]) => {
      if (floor >= data.floors[0] && floor <= data.floors[1]) {
        if (Math.random() < data.chance) {
          loot.push({ id, name: data.name, quantity: 1 + Math.floor(Math.random() * 3) });
        }
      }
    });
    
    return loot;
  }
  
  fightMonster(floorNum, monsterIndex, playerDamage) {
    const floor = this.floors[floorNum];
    if (!floor || !floor.monsters[monsterIndex]) return null;
    
    const monster = floor.monsters[monsterIndex];
    monster.currentHp -= playerDamage;
    
    if (monster.currentHp <= 0) {
      floor.monsters.splice(monsterIndex, 1);
      return {
        killed: true,
        exp: monster.exp,
        loot: this.generateMonsterLoot(monster.type)
      };
    }
    
    return {
      killed: false,
      damage: monster.damage,
      monsterHp: monster.currentHp,
      monsterMaxHp: monster.hp
    };
  }
  
  generateMonsterLoot(monsterType) {
    const loot = {
      fly: [{ id:'bug_meat', name:'虫肉', chance:0.5 }],
      grub: [{ id:'bug_meat', name:'虫肉', chance:0.6 }],
      bat: [{ id:'bat_wing', name:'蝙蝠翅膀', chance:0.5 }],
      skeleton: [{ id:'bone_fragment', name:'骨头碎片', chance:0.5 }],
      slime: [{ id:'slime', name:'史莱姆', chance:0.8 }]
    };
    
    const drops = [];
    (loot[monsterType] || []).forEach(item => {
      if (Math.random() < item.chance) {
        drops.push({ id: item.id, name: item.name, quantity: 1 });
      }
    });
    
    return drops;
  }
  
  goDeeper() {
    this.currentFloor++;
    if (this.currentFloor > this.maxFloorReached) {
      this.maxFloorReached = this.currentFloor;
    }
    
    if (!this.floors[this.currentFloor]) {
      this.generateFloor(this.currentFloor);
    }
    
    return this.getCurrentFloorInfo();
  }
  
  getCurrentFloorInfo() {
    const floor = this.floors[this.currentFloor];
    return {
      floor: this.currentFloor,
      type: floor?.type || 'normal',
      rocks: floor?.rocks?.length || 0,
      monsters: floor?.monsters?.length || 0,
      hasElevator: floor?.hasElevator || false
    };
  }
  
  useElevator(targetFloor) {
    if (targetFloor > this.maxFloorReached) return false;
    this.currentFloor = targetFloor;
    
    if (!this.floors[targetFloor]) {
      this.generateFloor(targetFloor);
    }
    
    return true;
  }
}

module.exports = MineSystem;
