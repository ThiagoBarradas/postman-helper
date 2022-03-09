# Postman External Require

Use Node packages not bundled into Postman's sandbox.

## 1. Setup on local machine

Clone this repo.

`npm i`

`node cli.js`

Or just

`npm install --global postman-helper`

`postman-helper`

## 2. Setup in Postman

If you want to jump right into it, import this prebuilt collection and create a global variable called `require` with value `uniq,slapdash,pad-left`:

Read on for getting this working with your own existing collection..

Add the following script to the `Pre-Request Script` of your collection:

```js
const reqs = pm.globals.get('require');
const pkgs = pm.globals.get('packages');
const installed = pm.globals.get('installedPackages');

if (pkgs && (reqs === installed)) {
    eval(pkgs)
} else {
    pm.sendRequest({
        url: `localhost:3000/search-packages?packages=${reqs}`,
        method: 'GET'
    }, (err, res) => {
        if (!err) {
            eval(res.text());
            pm.globals.set('installedPackages', reqs);
            pm.globals.set('packages', res.text());
        }
    });
}
```

Create a global variable in Postman called `require`. Provide a comma separated listed of packages you need e.g. `uniq,slapdash,pad-left`.

`require` your packages in the usual way from within folder/request scripts!

## 3. Login as User (Sample for Stone Banking)

`POST http://localhost:3000/user-login`

```
{
    "username" : "{{Document}}",
    "password" : "{{Password}}",
    "url": "{{BaseUrl}}/api/v1/discovery/keys",
    "scope": "stone_subject_id",
    "client_id": "homebanking@openbank.stone.com.br"
}
```

