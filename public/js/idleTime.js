var AutoLogout = (function() {
    console.log("Auto")
  function AutoLogout() {
    this.events = ['load', 'mousemove', 'mousedown',
                   'click', 'scroll', 'keypress'];

    this.warn = this.warn.bind(this);
    this.logout = this.logout.bind(this);
    this.resetTimeout = this.resetTimeout.bind(this);

    for(var i in this.events) {
      window.addEventListener(this.events[i], this.resetTimeout);
    }

    this.setTimeout();
  }

  var _p = AutoLogout.prototype;

  _p.clearTimeout = function() {
    if(this.warnTimeout)
      clearTimeout(this.warnTimeout);

    if(this.logoutTimeout)
      clearTimeout(this.logoutTimeout);
  };

  _p.setTimeout = function() {
    this.warnTimeout = setTimeout(this.warn, 1000);

    this.logoutTimeout = setTimeout(this.logout, 10 * 1000);
  };

  _p.resetTimeout = function() {
    this.clearTimeout();
    this.setTimeout();
  };

  _p.warn = function() {
    console.log('You will be logged out automatically in 1 minute.');
  };

  _p.logout = function() {
    // Send a logout request to the API
    console.log('Sending a logout request to the API...');

    this.destroy();  // Cleanup
  };

  _p.destroy = function() {
    this.clearTimeout();

    for(var i in this.events) {
      window.removeEventListener(this.events[i], this.resetTimeout);
    }
  };

  return AutoLogout;
})();