const Koa = require('koa');
const cors = require('koa2-cors');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const _ = require('lodash');
const db = require('./db');
const userHelpers = require('./helpers/user');

const app = new Koa();
const router = new Router();

router.post('/signup', async ctx => {
  const email = ctx.request.body.email;
  const password = ctx.request.body.password;

  if (!email || !password) {
    return userHelpers.handleErrors(ctx);
  }

  const exist = await db.get('users').findOne({ email });

  if (exist) {
    return userHelpers.handleErrors(ctx);
  }

  const user = await db.get('users').insert({
    email,
    password: userHelpers.hashPassword(password),
  });

  return ctx.body = { token: userHelpers.createToken(user) };
});

router.post('/login', async ctx => {
  const email = ctx.request.body.email;
  const password = ctx.request.body.password;

  if (!email || !password) {
    return userHelpers.handleErrors(ctx);
  }

  const user = await db.get('users').findOne({ email });

  if (!user) {
    return userHelpers.handleErrors(ctx);
  }

  const isEqual = userHelpers.verifyHash(user.password, password);

  if (!isEqual) {
    return userHelpers.handleErrors(ctx);
  }

  return ctx.body = { token: userHelpers.createToken(user) };
});

router.post('/favorite/:teamId', async ctx => {
  const teamId = ctx.params.teamId;
  const payload = userHelpers.verifyToken(ctx.request.headers.authorization);

  if (!payload) {
    return userHelpers.handleErrors(ctx);
  }

  const user = await db.get('users').findOne({ _id: payload.userId });

  if (!user) {
    return userHelpers.handleErrors(ctx);
  }

  const teams = user.favoriteTeams || [];

  const updatedTeams = teams.indexOf(teamId) >= 0
    ? _.without(teams, teamId)
    : _.concat(teams, [ teamId ]);

  await db.get('users').update(
    { _id: payload.userId },
    { $set: { favoriteTeams: updatedTeams } }
  );

  return ctx.body = { favoriteTeams: updatedTeams }
});

router.get('/favorite', async ctx => {
  const payload = userHelpers.verifyToken(ctx.request.headers.authorization);

  if (!payload) {
    return userHelpers.handleErrors(ctx);
  }

  const user = await db.get('users').findOne({ _id: payload.userId });

  if (!user) {
    return userHelpers.handleErrors(ctx);
  }

  return ctx.body = { favoriteTeams: user.favoriteTeams || [] };
});

app
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(4001);

console.log('Listening on port 4001');
