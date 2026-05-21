/**
 * 社交系统 - 村民互动、送礼、结婚
 */
class SocialSystem {
  constructor() {
    this.villagers = {
      abigail:{name:'阿比盖尔',location:'皮埃尔杂货店',birthday:'fall_13',likedGifts:['紫水晶','南瓜','巧克力蛋糕'],dislikedGifts:['粘土'],marriageable:true},
      sebastian:{name:'塞巴斯蒂安',location:'木匠店地下室',birthday:'winter_10',likedGifts:['虚空蛋','南瓜汤'],dislikedGifts:['粘土'],marriageable:true},
      maru:{name:'玛鲁',location:'山上医院',birthday:'summer_20',likedGifts:['钻石','草莓'],dislikedGifts:['粘土'],marriageable:true},
      penny:{name:'潘妮',location:'河边拖车',birthday:'fall_02',likedGifts:['钻石','翡翠'],dislikedGifts:['啤酒'],marriageable:true},
      leah:{name:'莉亚',location:'森林小屋',birthday:'winter_23',likedGifts:['沙拉','山羊奶酪'],dislikedGifts:['粘土'],marriageable:true},
      haley:{name:'海莉',location:'镇中心',birthday:'spring_14',likedGifts:['向日葵','椰子'],dislikedGifts:['粘土'],marriageable:true},
      alex:{name:'亚历克斯',location:'河边',birthday:'summer_13',likedGifts:['完美早餐','鸡蛋'],dislikedGifts:['粘土'],marriageable:true},
      elliott:{name:'艾利欧特',location:'海边小屋',birthday:'fall_05',likedGifts:['石榴','龙虾'],dislikedGifts:['粘土'],marriageable:true},
      harvey:{name:'哈维',location:'山上医院',birthday:'spring_14',likedGifts:['咖啡','松露油'],dislikedGifts:['珊瑚'],marriageable:true},
      sam:{name:'山姆',location:'镇中心',birthday:'summer_17',likedGifts:['披萨','仙人掌果'],dislikedGifts:['粘土'],marriageable:true},
      shane:{name:'谢恩',location:'玛妮牧场',birthday:'spring_20',likedGifts:['啤酒','辣椒'],dislikedGifts:['粘土'],marriageable:true},
      emily:{name:'艾米丽',location:'星之果实餐吧',birthday:'spring_27',likedGifts:['翡翠','布料'],dislikedGifts:['粘土'],marriageable:true},
      linus:{name:'莱纳斯',location:'山洞帐篷',birthday:'winter_03',likedGifts:['椰子','蓝莓'],dislikedGifts:['石头']},
      wizard:{name:'巫师',location:'巫师塔',birthday:'winter_17',likedGifts:['虚空蛋','太阳精华'],dislikedGifts:['粘土']},
      pierre:{name:'皮埃尔',location:'杂货店',birthday:'spring_26',likedGifts:['炸鳕鱼','金锭'],dislikedGifts:['石头']},
      caroline:{name:'卡罗琳',location:'杂货店',birthday:'fall_07',likedGifts:['绿茶','夏季种子'],dislikedGifts:['石头']},
      robin:{name:'罗宾',location:'木匠店',birthday:'fall_21',likedGifts:['桃子','木头'],dislikedGifts:['石头']},
      marnie:{name:'玛妮',location:'牧场',birthday:'fall_18',likedGifts:['钻石','南瓜派'],dislikedGifts:['石头']},
      lewis:{name:'刘易斯',location:'镇长宅邸',birthday:'spring_07',likedGifts:['辣椒','绿茶'],dislikedGifts:['石头']}
    };
    
    this.relationships = {};
  }
  
  init(engine) {
    this.engine = engine;
    this.initRelationships();
  }
  
  initRelationships() {
    Object.keys(this.villagers).forEach(id => {
      this.relationships[id] = {
        hearts: 0,
        talkedToday: false,
        giftedToday: false,
        married: false,
        spouse: false
      };
    });
  }
  
  talkToVillager(villagerId) {
    const rel = this.relationships[villagerId];
    if (!rel) return null;
    
    rel.talkedToday = true;
    const hearts = Math.floor(rel.hearts);
    
    // 获取对话
    const dialogs = this.getDialog(villagerId, hearts);
    const dialog = dialogs[Math.floor(Math.random() * dialogs.length)];
    
    return { villager: this.villagers[villagerId], dialog, hearts };
  }
  
  giveGift(villagerId, giftName) {
    const rel = this.relationships[villagerId];
    const villager = this.villagers[villagerId];
    if (!rel || !villager) return null;
    
    if (rel.giftedToday) {
      return { success: false, message: '今天已经送过礼物了' };
    }
    
    rel.giftedToday = true;
    
    let heartChange = 0;
    let message = '';
    
    if (villager.likedGifts.includes(giftName)) {
      heartChange = 2;
      message = `${villager.name}非常喜欢这个礼物！`;
    } else if (villager.dislikedGifts.includes(giftName)) {
      heartChange = -1;
      message = `${villager.name}不喜欢这个礼物...`;
    } else {
      heartChange = 0.5;
      message = `${villager.name}收下了礼物。`;
    }
    
    // 生日送礼双倍
    if (this.isBirthday(villagerId)) {
      heartChange *= 2;
      message += ' 今天是TA的生日！';
    }
    
    rel.hearts = Math.max(0, Math.min(10, rel.hearts + heartChange));
    
    return { 
      success: true, 
      message, 
      hearts: rel.hearts,
      heartChange,
      isBirthday: this.isBirthday(villagerId)
    };
  }
  
  isBirthday(villagerId) {
    const villager = this.villagers[villagerId];
    const timeSys = this.engine.getSystem('time');
    if (!villager || !timeSys) return false;
    
    const [season, day] = villager.birthday.split('_');
    return season === timeSys.season && parseInt(day) === timeSys.day;
  }
  
  getDialog(villagerId, hearts) {
    const dialogs = {
      low: ['你好...', '嗯...有什么事吗？', '哦，是你啊。'],
      mid: ['嗨！今天过得怎么样？', '很高兴见到你！', '最近有什么新鲜事吗？'],
      high: ['你来了！我正好想找你聊天。', '今天天气真好。', '我希望能更多地了解你。'],
      max: ['你是我最好的朋友！', '我无法想象没有你的生活。', '你愿意和我一起度过更多时光吗？']
    };
    
    if (hearts < 2) return dialogs.low;
    if (hearts < 5) return dialogs.mid;
    if (hearts < 8) return dialogs.high;
    return dialogs.max;
  }
  
  canMarry(villagerId) {
    const villager = this.villagers[villagerId];
    const rel = this.relationships[villagerId];
    return villager && villager.marriageable && rel && rel.hearts >= 10 && !rel.married;
  }
  
  marry(villagerId) {
    if (!this.canMarry(villagerId)) return false;
    this.relationships[villagerId].married = true;
    this.relationships[villagerId].spouse = true;
    return true;
  }
  
  getVillagerInfo(villagerId) {
    return {
      ...this.villagers[villagerId],
      relationship: this.relationships[villagerId]
    };
  }
  
  getAllVillagers() {
    return Object.entries(this.villagers).map(([id, data]) => ({
      id,
      ...data,
      relationship: this.relationships[id]
    }));
  }
  
  resetDaily() {
    Object.values(this.relationships).forEach(rel => {
      rel.talkedToday = false;
      rel.giftedToday = false;
    });
  }
}

module.exports = SocialSystem;
