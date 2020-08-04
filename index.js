const express = require('express')
const app = express()
const util = require('util')
const bodyParser = require('body-parser')
const path = require('path')
// const OAuth2Server = require('oauth2-server');
const OAuth2Server = require('express-oauth-server')

const PORT = 5000

const htmlHome = path.join(__dirname, './public/index.html')
const htmlOauth = path.join(__dirname, './public/oauthAuthenticate.html')
const htmlApp = path.join(__dirname, './public/clientApp.html')

app.oauth = new OAuth2Server({
  model: require('./model'),
  grants: ['authorization_code', 'refresh_token'],
  accessTokenLifetime: 60 * 60 * 24, // 24 hours, or 1 day
  allowEmptyState: true,
  allowExtendedTokenAttributes: true
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {  // send back a simple form for the oauth
  res.sendFile(htmlHome)
})

app.get('/oauth', (req, res) => {  // send back a simple form for the oauth
    res.sendFile(htmlOauth)
})

app.get('/app', (req, res) => {  // send back a simple form for the oauth
    res.sendFile(htmlApp)
})

app.post('/authorize', (req, res, next) => {
    // DebugControl.log.flow('Initial User Authentication')
        const {username, password} = req.body
        if(username === 'username' && password === 'password') {
            req.body.user = {user: 1}
            return next()
        }
        const params = [ // Send params back down
            'client_id',
            'redirect_uri',
            'response_type',
            'grant_type',
            'state',
        ]
        .map(a => `${a}=${req.body[a]}`)
        .join('&')
        console.log("redirect", `/oauth?success=false&${params}`)
        return res.redirect(`/oauth?success=false&${params}`)
    }, (req,res, next) => { // sends us to our redirect with an authorization code in our url
        return next()
    }, app.oauth.authorize({
        authenticateHandler: {
            handle: req => {
                return req.body.user
            }
    }
}))
  
app.post('/token', (req, res, next) => {
    console.log('/token')
    next()
}, app.oauth.token({
    requireClientAuthentication: { // whether client needs to provide client_secret
        // 'authorization_code': false,
    },
}))  // Sends back token

app.use('/secure', (req,res,next) => {
    console.log('/secure')
    return next()
}, app.oauth.authenticate(), (req, res) => {
    console.log({name: 'res.locals.oauth.token', value: res.locals.oauth.token})
    res.json({success: true})
}) // routes to access the protected stuff

app.listen(PORT, () => console.log(`Server listening at http://localhost:${PORT}`))