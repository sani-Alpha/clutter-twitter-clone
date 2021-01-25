const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.static('client'));

const db = monk(process.env.MONGO_URI || 'localhost/clutter-twiiter-clone');
const clucks = db.get('clucks');
const filter = new Filter();

app.enable('trust proxy');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Clucker! 🐓'
  });
});

app.get('/clucks', (req, res, next) => {
  clucks
    .find()
    .then(clucks => {
      res.json(clucks);
    }).catch(next);
});

app.get('/v2/clucks', (req, res, next) => {
  // let skip = Number(req.query.skip) || 0;
  // let limit = Number(req.query.limit) || 10;
  let { skip = 0, limit = 5, sort = 'desc' } = req.query;
  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 5;

  skip = skip < 0 ? 0 : skip;
  limit = Math.min(50, Math.max(1, limit));

  Promise.all([
    clucks
      .count(),
    clucks
      .find({}, {
        skip,
        limit,
        sort: {
          created: sort === 'desc' ? -1 : 1
        }
      })
  ])
    .then(([ total, clucks ]) => {
      res.json({
        clucks,
        meta: {
          total,
          skip,
          limit,
          has_more: total - (skip + limit) > 0,
        }
      });
    }).catch(next);
});

function isValidCluck(cluck) {
  return cluck.name && cluck.name.toString().trim() !== '' && cluck.name.toString().trim().length <= 50 &&
    cluck.content && cluck.content.toString().trim() !== '' && cluck.content.toString().trim().length <= 140;
}

app.use(rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 1
}));

const createCluck = (req, res, next) => {
  if (isValidCluck(req.body)) {
    const cluck = {
      name: filter.clean(req.body.name.toString().trim()),
      content: filter.clean(req.body.content.toString().trim()),
      created: new Date()
    };

    clucks
      .insert(cluck)
      .then(createdCluck => {
        res.json(createdCluck);
      }).catch(next);
  } else {
    res.status(422);
    res.json({
      message: 'Hey! Name and Content are required! Name cannot be longer than 50 characters. Content cannot be longer than 140 characters.'
    });
  }
};

app.post('/clucks', createCluck);
app.post('/v2/clucks', createCluck);

app.use((error, req, res, next) => {
  res.status(500);
  res.json({
    message: error.message
  });
});

app.listen(5500, () => {
    console.log('listening on http://localhost:5500/');
});