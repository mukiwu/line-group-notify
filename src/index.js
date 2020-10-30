const { router, route, text } = require('bottender/router');
const lineNotify = require('./lineNotify')

const clientId = process.env.LINE_NOTIFY_CLIENT_ID;
const redirectUri = `${process.env.ROOT_PATH}/callback`;

async function SendSubscriptionGuides(context) {
  const uri = lineNotify.getAuthLink(clientId, redirectUri, 'demo');
  
  await context.sendFlex('請點選按鈕訂閱通知：', {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "訂閱通知",
          weight: "bold",
          size: "md"
        },
        {
          type: "text",
          text: "請點選下方按鈕訂閱通知，在選擇 「請選擇您要接收通知的聊天室」 時請選擇本群組，並且在訂閱完成後將 LINE Notify 邀請加入本群組。",
          margin: "md",
          wrap: true,
          size: "xs"
        },
        {
          type: "button",
          action: {
            type: "uri",
            label: "訂閱通知",
            uri,
          },
          style: "primary",
          margin: "lg"
        }
      ]
    }
  });
}

async function SayHello(context) {
  await context.sendText('Hello!');
}

module.exports = async function App() {
  return router([
    text('訂閱', SendSubscriptionGuides),
    route('*', SayHello),
  ]);
};