const mammoth = require('mammoth');
const path = require('path');

const file = process.argv[2];
mammoth
  .extractRawText({ path: path.resolve(file) })
  .then((result) => {
    console.log(result.value);
    if (result.messages.length) {
      console.error('Messages:', result.messages);
    }
  })
  .catch((err) => console.error(err));
