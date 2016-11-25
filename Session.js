var Session = (function (globalScope) {

	var globalScope = globalScope || window;

	var merge = (function () {
		var Ext = globalScope.Ext || null,
			$ = globalScope.$ || null,
			_ = globalScope._ || null,
			merge;
		if (Ext) {
			merge = Ext.merge;
		} else if ((lib = $ || _)) {
			merge = lib.extend;
		} else {
			throw "Session implementation needs Extjs || $ || _ lib";
		}
		return merge;
	})();

	return {
		defaultConfig: {
			sessionID: null,
			sessionTimeout: 20000, //this value is very small, override!
			warnAfter: 10000,
			pollingTimeout: 2000, //this value is very small, override!
			sessionID: 'JS-SESSION',
			exitUrl: 'session-expired.html',
			cache: localStorage
		},
		create: function (options) {
			var config = merge(this.defaultConfig, options);

			merge(this, config);

			var initTime = new Date().getTime();
			this.update({
				startTime: initTime,
				refreshTime: initTime,
				isExpireAlertOn: false,
				isExpired: false
			});
			this.registerEvents();
			this.setupPolling();
			console.log("Session created");
		},
		registerEvents: function () {
			document.onclick = document.onblur = this.refresh.bind(this);
		},
		setupPolling: function () {
			this.timeoutID = window.setInterval(this.poll.bind(this), this.pollingTimeout);
		},
		poll: function () {
			var session = this.getSession(),
				diff = new Date().getTime() - session.refreshTime;
			console.log('Polling... diff = ' + diff);
			if (session.isExpired || diff > this.sessionTimeout) {
				this.expire();
			} else if (diff > this.warnAfter) {
				this.warn();
			}
		},
		refresh: function () {
			var session = this.getSession();
			if (session.isExpired) {
				this.expire();
			} else {
				this.update({
					startTime: session.initTime,
					refreshTime: new Date().getTime(),
					isExpireAlertOn: false,
					isExpired: false
				});
			}

		},
		warn: function () {
			var session = this.getSession(),
				_this = this;
			var diff = new Date().getTime() - session.refreshTime;
			console.log(diff);
			var d = (diff / (1000));
			console.log(d);
			if (!session.isExpired) {
				if (!session.isExpireAlertOn) {

					this.update(
						merge(this.getSession(), {
							isExpireAlertOn: true
						})
					);

					var a = Ext.create('Ext.window.Window', {
						title: 'hey',
						width: 400,
						height: 200,
						modal: true
					});
					this.alertID = window.setInterval(function () {
						console.log('here ' + session.refreshTime);
						a.setTitle("Session is expiring in " + d-- + " sec")
						if (this.getSession().isExpired || d < 2) {
							_this.expire();
							a.setTitle("Session expired")
						}

					}.bind(this), 1000);

					a.show();

				} else {
					this.expire();
				}
			} else {
				this.exit();
			}
		},
		update: function (state) {
			this.cache.setItem(this.sessionID, JSON.stringify(state));
		},
		expire: function () {
			this.update({
				isExpired: true
			});
			window.clearInterval(this.timeoutID);
			//window.clearInterval(this.alertID);
			this.exit();
		},
		exit: function () {
			this.expireServerSession();
			//window.open(this.exitUrl, "_self");
			console.log('expired......')
		},
		expireServerSession: function () {
			//inform server about client sesssion expired state
		},
		getSession: function () {
			return JSON.parse(this.cache.getItem(this.sessionID));
		}
	};
})(window);