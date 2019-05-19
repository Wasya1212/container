const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const uuidv4 = require('uuid/v4');
const db = require('./db.json');

const app = new Koa();
const router = new Router();

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

router.get('/api/foresters', async (ctx, next) => {
  ctx.body = db.foresters;
  await next();
});

router.post('/api/foresters', async (ctx, next) => {
  const newForester = {
    id: uuidv4(),
    nickname: ctx.request.body.nickname
  };

  db.foresters.push(newForester);

  ctx.body = newForester;

  await next();
});

router.get('/api/foresters/:foresterId', async (ctx, next) => {
  const id = parseInt(ctx.params.foresterId);
  const forester = db.foresters.find((forester) => forester.id == id);

  if (!forester) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Forester not found!');
  } else {
    ctx.body = forester;
  }

  await next();
});

router.put('/api/foresters/:foresterId', async (ctx, next) => {
  const id = parseInt(ctx.params.foresterId);
  const index = db.foresters.findIndex((forester) => forester.id == id);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Forester not found!');
    return;
  }

  if (ctx.request.body.nickname) {
    db.foresters[index].nickname = ctx.request.body.nickname;
  }

  ctx.body = db.foresters[index];

  await next();
});

router.delete('/api/foresters/:foresterId', async (ctx, next) => {
  const id = parseInt(ctx.params.foresterId);
  const index = db.foresters.findIndex((forester) => forester.id == id);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Forester not found!');
  } else {
    db.foresters.splice(index, 1);
    ctx.body = `Forester ${ctx.params.foresterId} was deleted!`
  }

  await next();
});

router.get('/api/supervisors', async (ctx, next) => {
  ctx.body = db.supervisors;
  await next();
});

router.post('/api/supervisors', async (ctx, next) => {
  const newSupervisor = {
    id: uuidv4(),
    nickname: ctx.request.body.nickname
  };

  db.supervisors.push(newSupervisor);

  ctx.body = newSupervisor;

  await next();
});

router.get('/api/supervisors/:supervisorId', async (ctx, next) => {
  const id = parseInt(ctx.params.supervisorId);
  const supervisor = db.supervisors.find((supervisor) => supervisor.id == id);

  if (!supervisor) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Supervisor not found!');
    console.log(supervisor)
  } else {
    ctx.body = supervisor;
  }

  await next();
});

router.put('/api/supervisors/:supervisorId', async (ctx, next) => {
  const id = parseInt(ctx.params.supervisorId);
  const index = db.supervisors.findIndex((supervisor) => supervisor.id == id);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Supervisor not found!');
    return;
  }

  if (ctx.request.body.nickname) {
    db.supervisors[index].nickname = ctx.request.body.nickname;
  }

  ctx.body = db.supervisors[index];

  await next();
});

router.delete('/api/supervisors/:supervisorId', async (ctx, next) => {
  const id = parseInt(ctx.params.supervisorId);
  const index = db.supervisors.findIndex((supervisor) => supervisor.id == id);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Supervisor not found!');
  } else {
    db.supervisors.splice(index, 1);
    ctx.body = `Supervisor ${ctx.params.supervisorId} was deleted!`
  }

  await next();
});

router.get('/api/tasks', async (ctx, next) => {
  ctx.body = db.tasks;
  await next();
});

router.get('/api/tasks/by-forester/:foresterId', async (ctx, next) => {
  const id = parseInt(ctx.params.foresterId);
  ctx.body = db.tasks.filter((task) => task.forester == id);
  await next();
});

router.get('/api/tasks/by-supervisor/:supervisorId', async (ctx, next) => {
  const id = parseInt(ctx.params.supervisorId);
  ctx.body = db.tasks.filter((task) => task.supervisor == id);
  await next();
});

router.post('/api/tasks/by-supervisor/:supervisorId/to-forester/:foresterId', async (ctx, next) => {
  const supervisorId = parseInt(ctx.params.supervisorId);
  const foresterId = parseInt(ctx.params.foresterId);

  const newTask = {
    id: uuidv4(),
    title: ctx.request.body.title,
    report: '',
    forester: foresterId,
    supervisor: supervisorId
  };

  db.tasks.push(newTask);

  ctx.body = newTask;

  await next();
});

router.put('/api/tasks/:taskId', async (ctx, next) => {
  const index = db.tasks.findIndex(task => task.id == ctx.params.taskId);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Task not found!');
  } else {
    db.tasks[index].report = ctx.request.body.report;
    ctx.body = db.tasks[index];
  }

  await next();
});

router.delete('/api/tasks/:taskId', async (ctx, next) => {
  const id = parseInt(ctx.params.taskId);
  const index = db.tasks.findIndex((task) => task.id == id);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Task not found!');
  } else {
    db.tasks.splice(index, 1);
    ctx.body = `Task ${ctx.params.taskId} was deleted!`
  }

  await next();
});

router.get('/api/', async (ctx, next) => {
  ctx.body = "API ready to receive requests";
  await next();
});

router.get('/', async (ctx, next) => {
  ctx.body = "Ready to receive requests";
  await next();
});

app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
