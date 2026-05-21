/**
 * 星露谷物语 - 社交页面
 */

Page({
  data: {
    villagers: [
      { id: 'abigail', name: '阿比盖尔', location: '皮埃尔杂货店', icon: '👩', hearts: 0 },
      { id: 'sebastian', name: '塞巴斯蒂安', location: '木匠店地下室', icon: '👨', hearts: 0 },
      { id: 'maru', name: '玛鲁', location: '山上医院', icon: '👩‍⚕️', hearts: 0 },
      { id: 'penny', name: '潘妮', location: '河边拖车', icon: '👩‍🏫', hearts: 0 },
      { id: 'leah', name: '莉亚', location: '森林小屋', icon: '👩‍🎨', hearts: 0 },
      { id: 'haley', name: '海莉', location: '镇中心', icon: '📸', hearts: 0 },
      { id: 'alex', name: '亚历克斯', location: '河边', icon: '💪', hearts: 0 },
      { id: 'elliott', name: '艾利欧特', location: '海边小屋', icon: '✍️', hearts: 0 },
      { id: 'harvey', name: '哈维', location: '山上医院', icon: '👨‍⚕️', hearts: 0 },
      { id: 'sam', name: '山姆', location: '镇中心', icon: '🎸', hearts: 0 },
      { id: 'shane', name: '谢恩', location: '玛妮牧场', icon: '🍺', hearts: 0 },
      { id: 'emily', name: '艾米丽', location: '星之果实餐吧', icon: '✂️', hearts: 0 },
      { id: 'linus', name: '莱纳斯', location: '山洞帐篷', icon: '🏕️', hearts: 0 },
      { id: 'wizard', name: '巫师', location: '巫师塔', icon: '🧙', hearts: 0 },
      { id: 'pierre', name: '皮埃尔', location: '杂货店', icon: '🏪', hearts: 0 },
      { id: 'robin', name: '罗宾', location: '木匠店', icon: '🪵', hearts: 0 },
      { id: 'marnie', name: '玛妮', location: '牧场', icon: '🐄', hearts: 0 },
      { id: 'lewis', name: '刘易斯', location: '镇长宅邸', icon: '👔', hearts: 0 }
    ],
    
    selectedVillager: null,
    showVillagerDetail: false,
    showGiftPanel: false,
    dialogText: '',
    showDialog: false
  },
  
  onLoad() {
    this.loadRelationships();
  },
  
  onShow() {
    this.loadRelationships();
  },
  
  loadRelationships() {
    const app = getApp();
    const social = app.getSocial();
    
    const villagers = this.data.villagers.map(v => {
      const rel = social.relationships[v.id];
      return {
        ...v,
        hearts: rel ? rel.hearts : 0,
        talkedToday: rel ? rel.talkedToday : false,
        giftedToday: rel ? rel.giftedToday : false
      };
    });
    
    this.setData({ villagers });
  },
  
  selectVillager(e) {
    const id = e.currentTarget.dataset.id;
    const villager = this.data.villagers.find(v => v.id === id);
    
    if (villager) {
      this.setData({
        selectedVillager: villager,
        showVillagerDetail: true
      });
    }
  },
  
  closeVillagerDetail() {
    this.setData({
      showVillagerDetail: false,
      selectedVillager: null
    });
  },
  
  talkToVillager() {
    const villager = this.data.selectedVillager;
    if (!villager) return;
    
    const app = getApp();
    const social = app.getSocial();
    const rel = social.relationships[villager.id];
    
    if (rel.talkedToday) {
      this.setData({
        dialogText: '我们今天已经聊过了。',
        showDialog: true
      });
      return;
    }
    
    rel.talkedToday = true;
    
    const hearts = Math.floor(rel.hearts);
    let dialog;
    
    if (hearts < 2) {
      dialog = this.getRandomDialog([
        '你好...',
        '嗯...有什么事吗？',
        '哦，是你啊。',
        '今天天气不错。'
      ]);
    } else if (hearts < 5) {
      dialog = this.getRandomDialog([
        '嗨！今天过得怎么样？',
        '很高兴见到你！',
        '最近有什么新鲜事吗？',
        '你来得正好！'
      ]);
    } else if (hearts < 8) {
      dialog = this.getRandomDialog([
        '你来了！我正好想找你聊天。',
        '今天天气真好，适合出去走走。',
        '我最近在想一些有趣的事情...',
        '你的农场经营得怎么样了？'
      ]);
    } else {
      dialog = this.getRandomDialog([
        '你是我最好的朋友！',
        '我无法想象没有你的生活。',
        '每次见到你都很开心。',
        '你愿意和我一起度过更多时光吗？'
      ]);
    }
    
    this.setData({
      dialogText: dialog,
      showDialog: true
    });
    
    // 增加好感度
    rel.hearts = Math.min(10, rel.hearts + 0.1);
    this.loadRelationships();
  },
  
  getRandomDialog(dialogs) {
    return dialogs[Math.floor(Math.random() * dialogs.length)];
  },
  
  closeDialog() {
    this.setData({ showDialog: false });
  },
  
  showGiftPanel() {
    this.setData({ showGiftPanel: true });
  },
  
  hideGiftPanel() {
    this.setData({ showGiftPanel: false });
  },
  
  giveGift(e) {
    const giftId = e.currentTarget.dataset.gift;
    const villager = this.data.selectedVillager;
    
    if (!villager) return;
    
    const app = getApp();
    const social = app.getSocial();
    const rel = social.relationships[villager.id];
    
    if (rel.giftedToday) {
      wx.showToast({ title: '今天已经送过礼物了', icon: 'none' });
      return;
    }
    
    rel.giftedToday = true;
    
    // 检查是否喜欢
    const likedGifts = ['紫水晶', '南瓜', '钻石', '草莓', '向日葵', '咖啡'];
    const dislikedGifts = ['粘土', '石头', '煤炭'];
    
    let heartChange = 0.5;
    let message = `${villager.name}收下了礼物。`;
    
    if (likedGifts.includes(giftId)) {
      heartChange = 2;
      message = `${villager.name}非常喜欢这个礼物！`;
    } else if (dislikedGifts.includes(giftId)) {
      heartChange = -1;
      message = `${villager.name}不喜欢这个礼物...`;
    }
    
    rel.hearts = Math.max(0, Math.min(10, rel.hearts + heartChange));
    
    wx.showToast({ title: message, icon: 'none' });
    
    this.loadRelationships();
    this.hideGiftPanel();
  },
  
  showPreferences() {
    const villager = this.data.selectedVillager;
    if (!villager) return;
    
    const liked = ['紫水晶', '南瓜', '钻石', '草莓'];
    const disliked = ['粘土', '石头'];
    
    wx.showModal({
      title: `${villager.name}的喜好`,
      content: `喜欢的礼物: ${liked.join(', ')}\n\n不喜欢的礼物: ${disliked.join(', ')}`,
      showCancel: false
    });
  },
  
  getHeartsArray(hearts) {
    const full = Math.floor(hearts);
    const half = hearts % 1 >= 0.5 ? 1 : 0;
    const empty = 10 - full - half;
    
    return {
      full: Array(full).fill('❤️'),
      half: half ? ['💔'] : [],
      empty: Array(empty).fill('🤍')
    };
  }
});