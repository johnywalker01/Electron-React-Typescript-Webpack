/**
 * This file contains both utility methods to detect the browser as well as tests.
 *
 * Run the tests with "node browser-detect.js"
 *
 * The section marked below is intended to be copied
 */

testDetectSupportedBrowsers()

function testDetectSupportedBrowsers() {
  testDetectBrowser("Firefox", 53.0,
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0");

  testDetectBrowser("Chrome", 58.0,
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36");

  testDetectBrowser("InternetExplorer", 11.0,
    "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko");

  testDetectBrowser("Edge", 14.14393,
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; ServiceUI 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393");

  testDetectBrowser("Safari", 603.1,
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30");

  testDetectBrowser("UnknownBrowser", -1,
    "Nonsense user agent");

  console.log("All tests passed");

}

function testDetectBrowser(expectedName, expectedVersion, userAgent) {
  const browserInfo = detectBrowser(userAgent)

  if (browserInfo.name !== expectedName) {
    throw new Error("Detected browser " + browserInfo.name + " did not match expected browser " + expectedName);
  }

  if (browserInfo.version !== expectedVersion) {
    throw new Error("Detected version " + browserInfo.version + " did not match expected version " + expectedVersion);
  }
}

/**** Begin copy from browser-detect.js ****/
function detectBrowser(userAgent) {
  const browserPatterns = {
    "Firefox": /Firefox\/([0-9.]+)/,
    "InternetExplorer": /rv:([0-9.]+)/,
    "Edge": /Edge\/([0-9.]+)/,
    "Chrome": /Chrome\/([0-9.]+)/,
    "Safari": /Safari\/([0-9.]+)/,
  };

  for (let browser in browserPatterns) {
    const pattern = browserPatterns[browser];
    const match = pattern.exec(userAgent);
    if (match) {
      return {name: browser, version: parseFloat(match[1])};
    }
  }

  return {name: "UnknownBrowser", version: -1};
}
/**** End copy from browser-detect.js ****/
