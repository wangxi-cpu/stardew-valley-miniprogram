/**
 * 星露谷物语 - 主页
 */

const app = getApp();

Page({
  data: {
    hasSaveData: false,
    playerName: '农场主',
    farmName: '星露农场',
    showNewGameDialog: false,
    showContinueBtn: false
  },
  
  onLoad() {
    this.checkSaveData();
  },
  
  onShow() {
    this.checkSaveData();
  },
  
  checkSaveData() {
    const saveData = wx.getStorageSync('stardew_save');
    this.setData({
      hasSaveData: !!saveData,
      showContinueBtn: !!saveData
    });
  },
  
  startNewGame() {
    this.setData({ showNewGameDialog: true });
  },
  
  confirmNewGame() {
    app.resetGame();
    this.setData({ showNewGameDialog: false });
    wx.switchTab({ url: '/pages/game/game' });
  },
  
  cancelNewGame() {
    this.setData({ showNewGameDialog: false });
  },
  
  continueGame() {
    app.loadGame();
    wx.switchTab({ url: '/pages/game/game' });
  },
  
  inputPlayerName() {
    wx.showModal({
      title: '输入名称',
      content: '请输入你的农场主名称',
      editable: true,
      placeholderText: '农场主',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({ playerName: res.content });
          app.globalData.player.name = res.content;
        }
      }
    });
  },
  
  inputFarmName() {
    wx.showModal({
      title: '输入名称',
      content: '请输入你的农场名称',
      editable: true,
      placeholderText: '星露农场',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({ farmName: res.content });
          app.globalData.farm.name = res.content;
        }
      }
    });
  },
  
  goToSettings() {
    wx.switchTab({ url: '/pages/settings/settings' });
  },
  
  showAbout() {
    wx.showModal({
      title: '关于星露谷物语',
      content: '版本: 1.0.0\n\n一款像素风格的农场经营游戏\n灵感来源于星露谷物语\n\n包含完整的种植、畜牧、社交、\n探索、制作等系统',
      showCancel: false
    });
  }
});