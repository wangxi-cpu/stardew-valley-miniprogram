/**
 * 星露谷物语 - 完整游戏引擎
 */

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.entities = [];
    this.systems = [];
    this.lastTime = 0;
    this.isRunning = false;
    this.events = {};
    
    // 输入状态
    this.input = {
      touch: { x: 0, y: 0, active: false },
      keys: {}
    };
    
    // 游戏状态
    this.state = {
      paused: false,
      screen: 'farm',
      selectedTool: 'hoe',
      selectedItem: null
    };
    
    this.initInput();
  }
  
  initInput() {
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.input.touch.x = touch.clientX;
      this.input.touch.y = touch.clientY;
      this.input.touch.active = true;
      this.emit('touchstart', { x: touch.clientX, y: touch.clientY });
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.input.touch.x = touch.clientX;
      this.input.touch.y = touch.clientY;
      this.emit('touchmove', { x: touch.clientX, y: touch.clientY });
    });
    
    this.canvas.addEventListener('touchend', () => {
      this.input.touch.active = false;
      this.emit('touchend');
    });
  }
  
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }
  
  addEntity(entity) {
    this.entities.push(entity);
    if (entity.init) entity.init(this);
    return entity;
  }
  
  removeEntity(entity) {
    const idx = this.entities.indexOf(entity);
    if (idx > -1) this.entities.splice(idx, 1);
  }
  
  addSystem(system) {
    this.systems.push(system);
    if (system.init) system.init(this);
    return system;
  }
  
  start() {
    this.isRunning = true;
    this.lastTime = Date.now();
    this.gameLoop();
  }
  
  stop() {
    this.isRunning = false;
  }
  
  gameLoop() {
    if (!this.isRunning) return;
    
    const now = Date.now();
    const dt = now - this.lastTime;
    this.lastTime = now;
    
    if (!this.state.paused) {
      this.update(dt);
      this.render();
    }
    
    requestAnimationFrame(() => this.gameLoop());
  }
  
  update(dt) {
    this.systems.forEach(s => s.update && s.update(dt));
    this.entities.forEach(e => e.update && e.update(dt));
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.entities.forEach(e => e.render && e.render(this.ctx));
    this.systems.forEach(s => s.render && s.render(this.ctx));
  }
  
  pause() { this.state.paused = true; }
  resume() { this.state.paused = false; }
}

module.exports = GameEngine;
