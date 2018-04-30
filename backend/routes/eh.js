const fs = require('fs');
const express = require('express');
const router = express.Router();
const request = require('request');
const { JSDOM } = require('jsdom');
const yaml = require('js-yaml');
const CONFIG_FILE = require('path').normalize(`${__dirname}/../config.yml`);
const USER_CONFIG = yaml.load(fs.readFileSync(CONFIG_FILE, 'utf8'));

router.get('/search', function (req, res, next) {
  let isLoginEx = !!USER_CONFIG['login']['igneous'];
  let keywords = req.query.keywords;
  let page = req.query.page || '0';
  let categories = ['f_doujinshi', 'f_manga', 'f_artistcg', 'f_gamecg', /*'f_western',*/ 'f_imageset', 'f_non-h', 'f_cosplay', /*'f_asianporn',*/ /*'f_misc',*/];
  let searchUrl = (keywords, ex = false) => `https://e${ex ? 'x' : '-'}hentai.org/?page=${page}&${categories.map(e => e + '=1').join('&')}&f_search=${encodeURIComponent(keywords)}&f_apply=Apply+Filter`;
  request.get({
    url: searchUrl(keywords, isLoginEx),
    headers: {
      Cookie: Object.entries(USER_CONFIG['login']).map(i => i.join('=')).join('; ')
    }
  }, (err, response, body) => {
    if (body == null) return next(new Error('获取搜索结果失败'));
    const { document } = (new JSDOM(body)).window;
    let items = Array.from(document.querySelectorAll('.gtr0, .gtr1'));
    let pageLinks = document.querySelectorAll('.ptt a');
    let maxPage;
    if (pageLinks.length === 0) {
      return next(new Error('搜索结果为空'));
    } else if (pageLinks.length === 1) {
      maxPage = '0';
    } else if (document.querySelector('.ptt td:last-child > a')) {
      maxPage = /page=(\d+)/.exec(pageLinks[pageLinks.length - 2].href)[1];
    } else {
      maxPage = /page=(\d+)/.exec(pageLinks[pageLinks.length - 1].href)[1];
    }

    items = items.map(el => {
      // 提取缩略图地址参照e-hentai主页show_image_pane和load_pane_image函数的代码
      let cover;
      let id = /show_image_pane\((\d+)\)/.exec(el.querySelector('.it5 > a').outerHTML)[1];
      let parts = document.getElementById('i' + id).textContent.split('~');
      
      let category;
      category = el.querySelector('.itdc > a').href.split('/');
      category = category[category.length - 1];
      
      let [, left, top] = /(\-?\d+)px (\-?\d+)px/.exec(el.querySelector('.it4r').style.backgroundPosition);
      let rating = 5 + left / 16 - (top === '-21' ? 0.5 : 0);

      if (parts.length >= 4) {
        cover = parts[0].replace('init', 'http') + '://' + parts[1] + '/' + parts[2];
      } else {
        // 搜索结果首张缩略图是已经加载出来的，这时parts.length < 4，document.getElementById('i' + id)获得的是包裹缩略图的元素
        cover = document.getElementById('i' + id).querySelector('img').src;
      }

      return {
        id: id,
        cover: cover,
        title: el.querySelector('.it5 > a').textContent,
        url: el.querySelector('.it5 > a').href,
        category: category,
        rating: rating
      }
    });

    res.json({
      keywords: decodeURIComponent(keywords),
      page: +page,
      maxPage: +maxPage,
      items: items
    });
  });
});

function requestData (url, userOptions) {
  return new Promise(function (resolve, reject) {
    let options = {url, ...userOptions};
    let response;
    let data = Buffer.alloc(0);

    request(options, function (err) {
      if (err) return reject(err);
    }).on('response', function (res) {
      response = res;
    }).on('data', function (chunk) {
      data = Buffer.concat([data, chunk]);
    }).on('end', function () {
      return resolve({response, body: data});
    });
  });
}

router.get('/proxy', function(req, res, next) {
  let url = req.query.url || '';
  let proxyUrls = ['https://exhentai.org/', 'https://e-hentai.org/', 'https://ehgt.org/'];
  if(proxyUrls.every(s => url.indexOf(s) !== 0)) {
    return res.status(403).end();
  }
  requestData(url, {
    headers: {
      Cookie: Object.entries(USER_CONFIG['login']).map(i => i.join('=')).join('; ')
    }
  }).then(({body}) => res.end(body)).catch(next);
});

module.exports = router;