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

router.get('/api/students', async (ctx, next) => {
  ctx.body = db.students;
  await next();
});

router.post('/api/students', async (ctx, next) => {
  const newStudent = {
    id: uuidv4(),
    name: ctx.request.body.name
  };

  db.students.push(newStudent);

  ctx.body = newStudent;

  await next();
});

router.get('/api/students/:studentId', async (ctx, next) => {
  const id = parseInt(ctx.params.studentId);
  const student = db.students.find((student) => student.id == id);

  if (!student) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Student not found!');
  } else {
    ctx.body = student;
  }

  await next();
});

router.put('/api/students/:studentId', async (ctx, next) => {
  const id = parseInt(ctx.params.studentId);
  const index = db.students.findIndex((student) => student.id == id);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Student not found!');
    return;
  }

  if (ctx.request.body.name) {
    db.students[index].name = ctx.request.body.name;
  }

  ctx.body = db.students[index];

  await next();
});

router.delete('/api/students/:studentId', async (ctx, next) => {
  const id = parseInt(ctx.params.studentId);
  const index = db.students.findIndex((student) => student.id == id);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Student not found!');
  } else {
    db.students.splice(index, 1);
    ctx.body = `Student ${ctx.params.studentId} was deleted!`
  }

  await next();
});

router.get('/api/teachers', async (ctx, next) => {
  ctx.body = db.teachers;
  await next();
});

router.post('/api/teachers', async (ctx, next) => {
  const newTeacher = {
    id: uuidv4(),
    name: ctx.request.body.name
  };

  db.teachers.push(newTeacher);

  ctx.body = newTeacher;

  await next();
});

router.get('/api/teachers/:teacherId', async (ctx, next) => {
  const id = parseInt(ctx.params.teacherId);
  const teacher = db.teachers.find((teacher) => teacher.id == id);

  if (!teacher) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Teacher not found!');
    console.log(teacher)
  } else {
    ctx.body = teacher;
  }

  await next();
});

router.put('/api/teachers/:teacherId', async (ctx, next) => {
  const id = parseInt(ctx.params.teacherId);
  const index = db.teachers.findIndex((teacher) => teacher.id == id);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Teacher not found!');
    return;
  }

  if (ctx.request.body.name) {
    db.teachers[index].name = ctx.request.body.name;
  }

  ctx.body = db.teachers[index];

  await next();
});

router.delete('/api/teachers/:teacherId', async (ctx, next) => {
  const id = parseInt(ctx.params.teacherId);
  const index = db.teachers.findIndex((teacher) => teacher.id == id);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Teacher not found!');
  } else {
    db.teachers.splice(index, 1);
    ctx.body = `Teacher ${ctx.params.supervisorId} was deleted!`
  }

  await next();
});

router.get('/api/tests', async (ctx, next) => {
  ctx.body = db.tests;
  await next();
});

router.get('/api/tests/by-teacher/:teacherId', async (ctx, next) => {
  const id = parseInt(ctx.params.teacherId);
  ctx.body = db.tests.filter((test) => test.teacher == id);
  await next();
});

router.post('/api/tests/by-teacher/:teacherId', async (ctx, next) => {
  const teacherId = parseInt(ctx.params.teacherId);

  const newTest = {
    id: uuidv4(),
    title: ctx.request.body.title,
    subject: ctx.request.body.subject,
    teacher: teacherId,
    questions: JSON.parse(ctx.request.body.questions)
  };

  db.tests.push(newTest);

  ctx.body = newTest;

  await next();
});

router.put('/api/tests/:testId', async (ctx, next) => {
  const index = db.tests.findIndex(test => test.id == ctx.params.testId);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Test not found!');
  } else {
    try {
      delete ctx.request.body.id;

      if (ctx.request.body.questions) {
        ctx.request.body.questions = JSON.parse(ctx.request.body.questions);
      }

      db.tests[index] = Object.assign(db.tests[index], ctx.request.body);
    } catch (e) {
      ctx.assert(ctx.request.accepts('xml'), 500, 'Internal server error!');
    } finally {
      ctx.body = db.tests[index];
    }
  }

  await next();
});

router.delete('/api/tests/:testId', async (ctx, next) => {
  const id = parseInt(ctx.params.testId);
  const index = db.tests.findIndex((test) => test.id == id);

  if (index == -1) {
    ctx.assert(ctx.request.accepts('xml'), 404, 'Test not found!');
  } else {
    db.tests.splice(index, 1);
    ctx.body = `Test ${ctx.params.testId} was deleted!`
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
