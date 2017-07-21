const GOOGLE_VISION_API_KEY='AIzaSyBknHciMVtil8uxB5Pnw_DG3BtXHlrChyg';
const MONGODB_URI='mongodb://Prateek:TheOGDB123@ds113063.mlab.com:13063/personal-finance';

const Vision = require('@google-cloud/vision');
const vision = Vision();

var axios = require('axios');
var sizeOf = require('image-size');

//TODO: orient and configure picture such that each line of the image is a
//      separate entry in an array of lines
//TODO: Build API.ai to interpret date, amount, and (optional) address field
//      See if you can interpret what was actually bought (next to first non-0? or just number?)
//TODO: persist relevant data to Mongo
//TODO: take in a PDF that is the end of month statement and read it
//TODO: compare to transactions from mongo
//TODO: output a list of validated transactions. UI.

// Read the file into memory.
var imagePath = './images/IMG_6853.jpg';
var HEIGHT = sizeOf(imagePath).height;


var fs = require('fs');
var imageFile = fs.readFileSync(imagePath);

// Covert the image data to a Buffer and base64 encode it.
var encoded = new Buffer(imageFile).toString('base64');

axios.post('https://vision.googleapis.com/v1/images:annotate?key='+GOOGLE_VISION_API_KEY, {
  "requests": [
    {
      "image": {
        "content": encoded
      },
      "features":[
        {
          "type":"TEXT_DETECTION",
          "maxResults": 1
        }
      ]
    }
  ]
}).then((results) => {
  var fullText = results.data.responses[0].textAnnotations;
  interpret(fullText);
}).catch(err => console.log('GOT AN ERROR'))

function interpret(fullText){
  //extract date, price, location, extra info (maybe store everything and highlight certain parts)
  // convert all y values to traditional x,y coordinates with y = 0 on the bottom
  for(var i = 0; i < fullText.length; i++){
    var vertices = fullText[i].boundingPoly.vertices;
    for(var j = 0; j < vertices.length; j++){
      console.log('old y: ' + fullText[i].boundingPoly.vertices[j].y);
      fullText[i].boundingPoly.vertices[j].y = HEIGHT - fullText[i].boundingPoly.vertices[j].y;
      console.log('new y: ' + fullText[i].boundingPoly.vertices[j].y);
    }
  }

  // =============================TEST===============================
  // Testing just the first one, matching 'Trader' and 'Joe\'s'

  // Note:
  // Info for 'Trader'
  var x1Trader = fullText[1].boundingPoly.vertices[1].x;
  var x2Trader = fullText[1].boundingPoly.vertices[2].x;
  var y1Trader = fullText[1].boundingPoly.vertices[1].y;
  var y2Trader = fullText[1].boundingPoly.vertices[2].y;
  var tanAngle = Math.abs((y2Trader-y1Trader)/(x2Trader-x1Trader));

  var x1Joes = fullText[2].boundingPoly.vertices[1].x;
  var expectedy1Joes = fullText[2].boundingPoly.vertices[1].y;
  var delX = Math.abs(x1Trader-x1Joes);
  var estimateYJoes = tanAngle*delX
  console.log('estimateYJoes: ' + estimateYJoes);
  console.log('actualYJoes: ' + expectedy1Joes);

  // ==========================ENDTEST===============================
  //
  // var testLine = [];
  //
  // var x1 = fullText[1].boundingPoly.vertices[1].x;
  // var x2 = fullText[1].boundingPoly.vertices[2].x;
  // var y1 = fullText[1].boundingPoly.vertices[1].y;
  // var y2 = fullText[1].boundingPoly.vertices[2].y;
  // var tanAngle = Math.abs((y2-y1)/(x2-x1));
  //
  // for(var i = 1; i < fullText.length; i++){
  //   var secondx1 = fullText[i].boundingPoly.vertices[1].x;
  //   var y1 = fullText[i].boundingPoly.vertices[1].y;
  //
  //   console.log(fullText[i].description);
  //   console.log(Math.abs(tanAngle*(Math.abs(x1-secondx1)) - y1));
  //   console.log('----------------------------------------');
  //
  //   if(Math.abs(tanAngle*(Math.abs(x1-secondx1)) - y1) < 10){
  //     testLine.push(fullText[i].description);
  //   }
  // }
  //
  // console.log(testLine);
}
