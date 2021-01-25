const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req,res) => {
    res.json({
        message: 'Konichiwa!'
    });
});

app.post('news', (req,res) => {
    console.log(req.body);
});
app.listen(5500, () => {
    console.log('listening on http://localhost:5500/');
});