/**
 * 时间系统 - 管理游戏内时间、日期、季节、天气
 */
class TimeSystem {
  constructor() {
    this.time = 360;  // 6:00 = 360分钟
    this.day = 1;
    this.season = 'spring';
    this.year = 1;
    this.weather = 'sunny';
    this.timer = 0;
    
    this.seasons = ['spring', 'summer', 'autumn', 'winter'];
    this.seasonNames = { spring:'春季', summer:'夏季', autumn:'秋季', winter:'冬季' };
    this.weatherNames = { sunny:'晴天', cloudy:'多云', rainy:'雨天', stormy:'雷雨', snowy:'下雪' };
    this.weatherIcons = { sunny:'☀️', cloudy:'☁️', rainy:'🌧️', stormy:'⛈️', snowy:'❄️' };
  }
  
  init(engine) {
    this.engine = engine;
  }
  
  update(dt) {
    this.timer += dt;
    if (this.timer >= 2000) { // 2秒 = 游戏内1小时
      this.timer = 0;
      this.advanceTime();
    }
  }
  
  advanceTime() {
    this.time += 60;
    if (this.time >= 1440) {
      this.advanceDay();
    }
    this.engine && this.engine.emit('timeChanged', this.getTimeInfo());
  }
  
  advanceDay() {
    this.time = 360;
    this.day++;
    
    if (this.day > 28) {
      this.advanceSeason();
    }
    
    this.generateWeather();
    this.engine && this.engine.emit('dayChanged', this.getDateInfo());
  }
  
  advanceSeason() {
    const idx = this.seasons.indexOf(this.season);
    this.season = this.seasons[(idx + 1) % 4];
    this.day = 1;
    
    if (idx === 3) {
      this.year++;
      this.engine && this.engine.emit('yearChanged', this.year);
    }
    
    this.engine && this.engine.emit('seasonChanged', this.season);
  }
  
  generateWeather() {
    const probs = {
      spring: { sunny:0.4, cloudy:0.3, rainy:0.25, stormy:0.05 },
      summer: { sunny:0.5, cloudy:0.2, rainy:0.2, stormy:0.1 },
      autumn: { sunny:0.3, cloudy:0.35, rainy:0.3, stormy:0.05 },
      winter: { sunny:0.2, cloudy:0.3, snowy:0.5 }
    };
    
    const p = probs[this.season];
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [w, prob] of Object.entries(p)) {
      cumulative += prob;
      if (rand <= cumulative) {
        this.weather = w;
        break;
      }
    }
  }
  
  getTimeString() {
    const h = Math.floor(this.time / 60);
    const m = this.time % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
  }
  
  getSeasonName() { return this.seasonNames[this.season]; }
  getWeatherIcon() { return this.weatherIcons[this.weather]; }
  getWeatherName() { return this.weatherNames[this.weather]; }
  
  getTimeInfo() {
    return {
      time: this.time,
      timeString: this.getTimeString(),
      period: this.getTimePeriod()
    };
  }
  
  getDateInfo() {
    return {
      day: this.day,
      season: this.season,
      seasonName: this.getSeasonName(),
      year: this.year,
      weather: this.weather,
      weatherIcon: this.getWeatherIcon()
    };
  }
  
  getTimePeriod() {
    if (this.time < 360) return 'night';
    if (this.time < 720) return 'morning';
    if (this.time < 1080) return 'afternoon';
    if (this.time < 1200) return 'evening';
    return 'night';
  }
  
  isRaining() { return this.weather === 'rainy' || this.weather === 'stormy'; }
  isDaytime() { return this.time >= 360 && this.time < 1200; }
  
  serialize() {
    return { time:this.time, day:this.day, season:this.season, year:this.year, weather:this.weather };
  }
  
  deserialize(data) {
    Object.assign(this, data);
  }
}

module.exports = TimeSystem;
