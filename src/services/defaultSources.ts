import { BookSource } from '../types/reader';

export const DEFAULT_BOOK_SOURCES: BookSource[] = [
  {
    id: 'source-69shu',
    name: '69书吧 (优质推荐)',
    url: 'https://www.69shuba.com',
    enabled: true,
    weight: 100,
    type: 'legado',
    rule: {
      searchUrl: 'https://www.69shuba.com/modules/article/search.php?searchkey={{key}}',
      ruleSearch: {
        bookList: '.newbox ul li, .mybox .rec_list li, .search-list li',
        name: 'h3 a, .bookname a, h2 a@text',
        author: '.label .author, .author@text',
        intro: 'ol, .intro@text',
        coverUrl: 'img@src',
        bookUrl: 'h3 a, .bookname a, h2 a@href',
        latestChapter: '.newchapter a, .latest@text'
      },
      ruleToc: {
        chapterList: '#tools .all li a, #chapterlist li a, .catalog ul li a',
        chapterName: 'text',
        chapterUrl: 'href'
      },
      ruleContent: {
        content: '#content, .txtnav, #chaptercontent@text'
      }
    }
  },
  {
    id: 'source-biquge',
    name: '全网笔趣阁 (综合)',
    url: 'https://www.biquge.tv',
    enabled: true,
    weight: 90,
    type: 'legado',
    rule: {
      searchUrl: 'https://www.biquge.tv/modules/article/search.php?searchkey={{key}}',
      ruleSearch: {
        bookList: '#newscontent .l ul li, .novelslist2 ul li',
        name: '.s2 a@text',
        author: '.s4@text',
        bookUrl: '.s2 a@href',
        latestChapter: '.s3 a@text'
      },
      ruleToc: {
        chapterList: '#list dd a, .listmain dl dd a',
        chapterName: 'text',
        chapterUrl: 'href'
      },
      ruleContent: {
        content: '#content, #htmlContent@text'
      }
    }
  },
  {
    id: 'source-shucheng',
    name: '飘天文学 (轻小说/网文)',
    url: 'https://www.ptwxz.com',
    enabled: true,
    weight: 85,
    type: 'legado',
    rule: {
      searchUrl: 'https://www.ptwxz.com/modules/article/search.php?searchkey={{key}}',
      ruleSearch: {
        bookList: 'table.grid tr:not(:first-child)',
        name: 'td:nth-child(1) a@text',
        author: 'td:nth-child(3)@text',
        bookUrl: 'td:nth-child(1) a@href',
        latestChapter: 'td:nth-child(2) a@text'
      },
      ruleToc: {
        chapterList: '.centent ul li a, #list dl dd a',
        chapterName: 'text',
        chapterUrl: 'href'
      },
      ruleContent: {
        content: '#content@text'
      }
    }
  },
  {
    id: 'source-gudian',
    name: '古典文学名著库 (开放公共源)',
    url: 'https://so.gushiwen.cn',
    enabled: true,
    weight: 80,
    type: 'legado',
    rule: {
      searchUrl: 'https://so.gushiwen.cn/guwen/default.aspx?value={{key}}',
      ruleSearch: {
        bookList: '.sons .cont',
        name: 'p:first-child a b, p:first-child a@text',
        author: '.source a:last-child@text',
        intro: '.contson@text',
        bookUrl: 'p:first-child a@href'
      },
      ruleToc: {
        chapterList: '.bookcont ul li a, .sons .cont a',
        chapterName: 'text',
        chapterUrl: 'href'
      },
      ruleContent: {
        content: '.contson, .sons .cont@text'
      }
    }
  }
];
