import { Book, Bookmark, BookSource, StealthConfig, ThemeConfig } from '../types/reader';
import { DEFAULT_BOOK_SOURCES } from './defaultSources';

const STORAGE_KEYS = {
  BOOKS: 'liquid_reader_books',
  ACTIVE_BOOK_ID: 'liquid_reader_active_id',
  OPEN_TABS: 'liquid_reader_open_tabs',
  SOURCES: 'liquid_reader_sources',
  THEME: 'liquid_reader_theme',
  STEALTH: 'liquid_reader_stealth',
  BOOKMARKS: 'liquid_reader_bookmarks'
};

export const defaultThemeConfig: ThemeConfig = {
  glassLevel: 'l2',
  customGlassOpacity: 0.65,
  glassBlurRadius: 28,
  themePreset: 'dark-oled',
  backgroundPreset: 'default',
  fontSize: 16,
  lineHeight: 1.8,
  letterSpacing: 0.5,
  paragraphIndent: 2,
  paragraphSpacing: 14,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  textColor: '#e6e6ea',
  backgroundColor: 'rgba(18, 18, 22, 0.72)',
  glassBorder: true,
  pageMode: 'scroll',
  columns: 'auto',
  pageTurnAnimation: 'slide',
  comicFlowMode: 'stream',
  comicFilter: 'normal'
};

export const defaultStealthConfig: StealthConfig = {
  bossKeyShortcut: 'Alt+`',
  mouseAutoFade: true,
  mouseAutoFadeDuration: 300,
  mouseLeaveOpacity: 0.05,
  clickThrough: false,
  alwaysOnTop: true,
  skipTaskbar: false,
  defaultChameleonMode: 'none',
  tickerSpeed: 20,
  tickerFontSize: 13
};

export const DEFAULT_SAMPLE_BOOKS: Book[] = [
  {
    id: 'demo-book-1',
    title: '诡秘之主 (演示样本)',
    author: '爱潜水的乌贼',
    intro: '蒸汽与机械的浪潮中，谁能触及非凡？历史和黑暗的迷雾里，又是谁在耳语？我从诡秘中醒来，睁眼看见这个世界：枪械，大炮，巨舰，飞空艇，差分机；魔药，占卜，诅咒，倒吊人，封印物……光明依旧照耀，神秘从未远离，这是一段“愚者”的传说。',
    sourceId: 'local-demo',
    sourceName: '官方内置精选',
    chapters: [
      {
        id: 'demo-ch-1',
        title: '第一章 绯红',
        index: 0,
        content: `痛！\n好痛！\n头好痛！\n\n宛如被飞驰的蒸汽列车迎面撞击，又像是被铁钎狠狠插入脑浆不断搅拌，周明瑞感觉自己的太阳穴突突直跳，仿佛随时会撕裂开来。\n\n迷迷糊糊间，他想要睁开眼睛，但眼皮沉重得如同灌了铅。周围一片黑暗，只有隐隐约约的红光在晃动，就像透过眼睑照进来的绯红月光。\n\n“我不是昨晚通宵做完周报，躺在床上睡觉吗？怎么会头痛成这样……”周明瑞试图回忆，但思绪混乱不堪，无数破碎的光影和疯狂的呢喃在脑海深处回荡。\n\n他终于勉强睁开双眼，映入眼帘的是一个陌生而复古的房间。头顶是粗糙发黄的木质天花板，空气中弥漫着煤气管道泄漏般的微弱气味与陈旧纸张的霉味。\n\n桌面上，一盏黄铜底座的煤油灯正散发着微弱的光芒。而在煤油灯旁，静静地躺着一把转轮手枪，金属枪管在绯红的月色下泛着冰冷的幽光。\n\n旁边还有一面破碎的梳妆镜。借着月光，周明瑞看见了镜子中的自己：黑发黑瞳，五官深邃，脸色苍白得如同死人，而在右侧太阳穴的位置，赫然有一个狰狞焦黑的弹孔，正缓缓渗出暗红的血迹！\n\n“我……被枪击了？”周明瑞心脏猛地一缩。`
      },
      {
        id: 'demo-ch-2',
        title: '第二章 处境',
        index: 1,
        content: `克莱恩·莫雷蒂。\n\n鲁恩王国，阿霍瓦郡，廷根市，霍伊大学历史系应届毕业生。\n\n伴随着剧烈头痛的缓解，汹涌的记忆如潮水般涌入脑海。周明瑞捂住太阳穴，指尖触摸到的焦黑伤口竟然以肉眼可见的速度在缓慢愈合！\n\n他确认了一件事：自己穿越了。穿越到了一个类似维多利亚时代、工业革命与神秘力量交织的异世界。\n\n原主克莱恩似乎是因为卷入了一本奇怪的安提哥努斯家族第四纪笔记，最终在恐惧与绝望中对着自己的右脑扣动了扳机。\n\n“既然我占用了这具身体重新活了过来，那就必须弄清楚到底发生了什么。”周明瑞——现在的克莱恩深吸一口气，站起身来，轻轻将转轮手枪收回抽屉。\n\n楼下传来了轻快的脚步声，是妹妹梅丽莎放学回家的声音。`
      },
      {
        id: 'demo-ch-3',
        title: '第三章 梅丽莎',
        index: 2,
        content: `钥匙在锁孔中转动的声音响起。\n\n大门被推开，一位身材娇小、穿着洗得有些褪色深褐色连衣裙的年轻女孩走了进来。她戴着一顶带面纱的小圆帽，手中提着装着廉价黑麦面包的纸袋。\n\n“克莱恩？你今天这么早就起床了？”梅丽莎有些惊讶地看着他，澄澈的棕色眼眸中带着一丝关切。\n\n“是的，做了一个奇怪的噩梦，然后就醒了。”克莱恩温和地微笑道，努力模仿着原主的语气和神态。\n\n“班森今天去码头做货物清点了，可能会晚点回来。我买了新鲜的面包和土豆，今晚我们可以炖土豆牛肉汤。”梅丽莎麻利地把食材放到简陋的小厨房里。\n\n克莱恩看着眼前充满生活气息的一幕，心中的迷茫与恐惧稍微平复了一些。无论如何，为了活下去，为了守护这个普通的家庭，他必须尽快掌握这个世界的规则。`
      }
    ],
    currentChapterIndex: 0,
    currentProgressPercent: 0,
    lastReadTime: Date.now(),
    isOnlineSource: false
  },
  {
    id: 'demo-book-2',
    title: '道诡异仙 (演示样本)',
    author: '狐尾的笔',
    intro: '诡异天道，疯癫修仙。李火旺分不清现实与幻觉，在两个世界中苦苦挣扎……',
    sourceId: 'local-demo',
    sourceName: '官方内置精选',
    chapters: [
      {
        id: 'demo-ch-2-1',
        title: '第一章 迷惘',
        index: 0,
        content: `李火旺感觉自己的脑袋像是要裂开了一样。\n\n他睁开眼睛，看到的是刺眼的白光和身穿白大褂的医生护士。“火旺，感觉怎么样？今天还产生幻觉了吗？”母亲温柔而焦急的声音在耳边响起。\n\n然而下一秒，视野猛地扭曲晃动！\n\n白色的病房瞬间坍塌，化作阴暗潮湿的山洞，刺鼻的消毒水味变成了浓郁腐败的草药与硫磺气味！眼前的母亲变成了身披破烂道袍、脸上长满肉瘤的恐怖道士！\n\n“徒儿，该吃药了……”那道士咧开满嘴尖牙，递过来一颗散发着腥臭血光的黑色药丸。\n\n“不！这不是真的！我到底是在医院，还是在这个疯癫的修仙世界？！”李火旺双手死死抓着头发，发出痛苦的低吼。`
      }
    ],
    currentChapterIndex: 0,
    currentProgressPercent: 0,
    lastReadTime: Date.now() - 3600000,
    isOnlineSource: false
  }
];

export class StorageService {
  public static getBooks(): Book[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKS);
      return data ? JSON.parse(data) : DEFAULT_SAMPLE_BOOKS;
    } catch {
      return DEFAULT_SAMPLE_BOOKS;
    }
  }

  public static saveBooks(books: Book[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    } catch (err) {
      console.warn('Failed to save books:', err);
    }
  }

  public static getActiveBookId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BOOK_ID);
  }

  public static saveActiveBookId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BOOK_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_BOOK_ID);
    }
  }

  public static getOpenTabs(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OPEN_TABS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveOpenTabs(tabs: string[]): void {
    localStorage.setItem(STORAGE_KEYS.OPEN_TABS, JSON.stringify(tabs));
  }

  public static getSources(): BookSource[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOURCES);
      return data ? JSON.parse(data) : DEFAULT_BOOK_SOURCES;
    } catch {
      return DEFAULT_BOOK_SOURCES;
    }
  }

  public static saveSources(sources: BookSource[]): void {
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
  }

  public static getThemeConfig(): ThemeConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEME);
      return data ? { ...defaultThemeConfig, ...JSON.parse(data) } : defaultThemeConfig;
    } catch {
      return defaultThemeConfig;
    }
  }

  public static saveThemeConfig(theme: ThemeConfig): void {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
  }

  public static getStealthConfig(): StealthConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STEALTH);
      return data ? { ...defaultStealthConfig, ...JSON.parse(data) } : defaultStealthConfig;
    } catch {
      return defaultStealthConfig;
    }
  }

  public static saveStealthConfig(config: StealthConfig): void {
    localStorage.setItem(STORAGE_KEYS.STEALTH, JSON.stringify(config));
  }

  public static getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveBookmarks(bookmarks: Bookmark[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }

  // Full Export/Import for WebDAV / Backup
  public static exportAllData(): string {
    const backup = {
      version: '1.0',
      timestamp: Date.now(),
      books: this.getBooks(),
      sources: this.getSources(),
      theme: this.getThemeConfig(),
      stealth: this.getStealthConfig(),
      bookmarks: this.getBookmarks()
    };
    return JSON.stringify(backup, null, 2);
  }

  public static importAllData(jsonStr: string): boolean {
    try {
      const backup = JSON.parse(jsonStr);
      if (backup.books) this.saveBooks(backup.books);
      if (backup.sources) this.saveSources(backup.sources);
      if (backup.theme) this.saveThemeConfig(backup.theme);
      if (backup.stealth) this.saveStealthConfig(backup.stealth);
      if (backup.bookmarks) this.saveBookmarks(backup.bookmarks);
      return true;
    } catch {
      return false;
    }
  }
}
