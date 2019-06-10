(function(root) {
  'use strict'

  var head = document.head,
      rootEl = document.documentElement

  function addStyleSheet(res) {
    var link = document.createElement('link')

    if (res.integrity &&
        res.href.slice(0, 6) === 'https:') {
      link.crossOrigin = 'anonymous'
      link.integrity = res.integrity
    }

    link.rel = 'stylesheet'
    link.href = res.href
    head.appendChild(link)
  }

  function toggleOffline() {
    rootEl.classList.toggle('offline')
  }

  /*--------------------------------------------------------------------------*/

  
  

  // Add asynchronous style sheets.
  [{"href":"/vendor/cdn.jsdelivr.net/fontawesome/4.7.0/css/font-awesome.min.css","integrity":"sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN"}].forEach(addStyleSheet)

  
  // Register service worker.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
  // Fallback to AppCache.
  else if ('applicationCache' in root) {
    var iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = '/appcache.html'
    document.body.appendChild(iframe)
  }
  // Initialize Google Analytics.
  if (navigator.onLine) {
    var accounts = {"lodash.com":"UA-6065217-64","lodash.dev":"UA-134340230-1"}
    var commands = [["create","UA-ACCOUNT-ID","auto"],["require","linkid"],["send","pageview"]]

    commands[0][1] = accounts[location.hostname]

    root[root.GoogleAnalyticsObject = '_ga'] = {
      'l': Date.now(),
      'q': commands
    }
    var script = document.createElement('script')
    script.src = 'https://www.google-analytics.com/analytics.js'
    head.appendChild(script)
  }
  

  // Toggle offline status.
  addEventListener('offline', toggleOffline)
  addEventListener('online', toggleOffline)
}(this))
