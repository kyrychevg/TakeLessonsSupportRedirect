const express = require('express');
const app = express();
const port = 5000;
const { Articles } = require('./articles');

const articles = new Articles();

app.use((req, res) => {
    const redirectUrl = articles.findEntityUrl(req.url);
    res.redirect(redirectUrl);
});

app.listen(port, async () => {
    await articles.getAll();
    setInterval(async () => {
        await articles.getAll();
    }, 86400000); //24 hours
    console.log(`Now listening on port ${port}`);
});