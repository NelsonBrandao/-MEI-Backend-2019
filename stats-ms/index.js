const Koa = require('koa');
const cors = require('koa2-cors');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const db = require('./db');

const app = new Koa();
const router = new Router();

router.get('/teams', async ctx => {
  const teams = await db.get('teams').find({});

  ctx.body = teams;
});

router.get('/teams/:id', async ctx => {
  const team = await db.get('teams').findOne({
    team_key: ctx.params.id
  });

  ctx.body = team;
});

app
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(4000);

console.log('Listening on port 4000');
