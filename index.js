const express = require('express');
const jose = require('node-jose');
const axios = require('axios');
const app = express();
const childProcess = require('child_process');

app.use(express.json());

app.get('/search-packages', (request, response) => 
{
  try 
  {
    var packages = request.query.packages.split(',');
    var browserify = require('browserify')();

    for (let i = 0; i < packages.length; i++) {
      var pkg = packages[i];

      childProcess.execSync(`npm install ${pkg}`);
      browserify.require(pkg);
    }

    browserify.bundle((error, buffer) => {
      if (error) { 
        console.log(error)
      }
      
      response.send(buffer.toString());
    });
  } 
  catch (exception) {
    response.send('Something went wrong!');
  }
});

app.post('/user-login', (request, response) => {
  try 
  {
    var user = request.body.username;
    var pass = request.body.password;
    var client_id = request.body.client_id;
    var scope = request.body.scope;
    var url = request.body.url;

    axios.get(url)
    .then(keys => {
      var payload = {
        client_id: client_id,
        scope: scope,
        username: user,
        password: pass,
        request_metadata: {}
      };

      var contentToEncrypt = JSON.stringify(payload);    
      var buffer = Buffer.from(contentToEncrypt)

      //changing alg/enc
      keys.data.keys.forEach(function(item){
        if (item.use=="enc") {
          item.alg = "RSA-OAEP-256";
        }
      });

      jose.JWK.asKeyStore(keys.data).
      then(function(keystore) {
        var key = keystore.all({ use: 'enc' });
        jose.JWE.createEncrypt({ format: 'compact', contentAlg: "A256GCM" }, key)
          .update(buffer)
          .final()
          .then((encryptedContent) => {  
            var data = { jwe: encryptedContent };
            response.json(data);
          });       
      });
    });
  } 
  catch (exception) {
    response.send('Something went wrong!')
  }
});

app.post('/jwe-encrypt', (request, response) => {
  try 
  {
    var payload = request.body.payload;
    var url = request.body.keysUrl;

    axios.get(url)
    .then(keys => {
      
      var contentToEncrypt = JSON.stringify(payload);    
      var buffer = Buffer.from(contentToEncrypt)

      //changing alg/enc
      keys.data.keys.forEach(function(item){
        if (item.use=="enc") {
          item.alg = "RSA-OAEP-256";
        }
      });

      jose.JWK.asKeyStore(keys.data).
      then(function(keystore) {
        var key = keystore.all({ use: 'enc' });
        jose.JWE.createEncrypt({ format: 'compact', contentAlg: "A256GCM" }, key)
          .update(buffer)
          .final()
          .then((encryptedContent) => {  
            var data = { jwe: encryptedContent, payload: payload };
            response.json(data);
          });       
      });
    });
  } 
  catch (exception) {
    response.send('Something went wrong!')
  }
});

function start() {
  app.listen(3000, () => console.log(`Running!`));
}
  
module.exports = {"browser": true};
module.exports = start;