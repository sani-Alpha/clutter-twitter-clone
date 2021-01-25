const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.json({
        message: 'Konichiwa!'
    });
});

function isValidCluck(cluck) {
    return cluck.name && cluck.name.toString().trim() !== '' && cluck.content && cluck.content.toString().trim() !== '';
}

app.post('cluck', (req,res) => {
    if(isValidCluck(req.body)){
        const cluck = {
            name: req.body.name.toString(),
            content: req.body.content.toString(),
        };
    } else {
        res.status(422);
        res.json({
            message: 'Hey! Name and Content are Required!'
        });
    }
});
app.listen(5500, () => {
    console.log('listening on http://localhost:5500/');
});