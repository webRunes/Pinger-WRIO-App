var phantom = require('phantom');

try {
  var
    phInstance = await phantom.create([], {
      phantomPath: "/usr/bin/phantomjs",
      logLevel: "debug"
    }),
    page = await phInstance.createPage();

  page.open('index.html', status => {
    page.evaluateAsync(() => {
      drawComment(
        'This is my text with quite large word. Here it will be. ',
        (err, filename) => console.log(err || filename)
      )
    })
  })
} catch (error) {
  phInstance && phInstance.exit();
}
