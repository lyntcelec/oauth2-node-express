const express = require('express')
const app = express()
const util = require('util')
const bodyParser = require('body-parser')
// const OAuth2Server = require('oauth2-server');
const OAuth2Server = require('express-oauth-server')

const PORT = 5000

app.oauth = new OAuth2Server({
  model: require('./model')
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', async function (req, res) {
    const headers = req.headers;
    console.info('Headers', headers);
    res.send('hello world');
})

app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`))