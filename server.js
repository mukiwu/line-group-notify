const bodyParser = require('body-parser');
const express = require('express');
const { bottender } = require('bottender');
const lineNotify = require('./src/lineNotify');

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

const port = Number(process.env.PORT) || 5000;

// the request handler of the bottender app
const handle = app.getRequestHandler();

const clientId = process.env.LINE_NOTIFY_CLIENT_ID;
const clientSecret = process.env.LINE_NOTIFY_CLIENT_SECRET;
const redirectUri = `${process.env.ROOT_PATH}/callback`;
const subscriptions = [];

app.prepare().then(() => {
  const server = express();
  server.set('view engine', 'ejs');

  let URL = 'https://notify-bot.line.me/oauth/authorize?';
      URL += 'response_type=code';
      URL += '&client_id='+clientId;
      URL += '&redirect_uri='+redirectUri;
      URL += '&scope=notify';
      URL += '&state=astro';

  server.get('/', (req, res) => {
    // res.send('<a href="'+URL+'">點擊訂閱</a>');
    res.render('index', {
      url: URL
    })
  });

  server.use(
    express.static(__dirname + '/public'),
    bodyParser.json({
      verify: (req, _, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );

  // routes for LINE Notify
  server.get('/callback', async function(req, res){
    const code = req.query.code;
    const response = await lineNotify.getToken(code, redirectUri, clientId, clientSecret);
    const token = response.data.access_token;
    subscriptions.push(token);
    await lineNotify.sendNotify(token, "恭喜完成訂閱！");
    // res.send('恭喜完成訂閱，請關閉此網頁！');
    res.render('success');
  });

  server.get('/message', async function(req, res){
    subscriptions.forEach((token)=>{
      res.render('message', {
        token: token
      })
      console.log(token)
    });
  });

  server.get('/sendMessage', async function(req, res){
    // const message = req.query.message;
    const message = '123';
    console.log(message);
    subscriptions.forEach((token)=>{
      lineNotify.sendNotify(token, message);
    });
    res.send('推播訊息發送完成，請關閉此網頁！');
  });

  // route for webhook request
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});