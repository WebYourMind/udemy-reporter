var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

	// watch files for changes and reload
	gulp.task('serve', function() {
	  browserSync.init({
	    
	       proxy: "udemy-reporter.localhost:8091",
	       host:"udemy-reload",
	       port: 8091,
	       logLevel: "debug"
	    
	  });

	  gulp.watch([	'*.html', 
	  				'css/*.css', 
	  				'authentication/*.js', 'authentication/*.html', 
	  				'components/*.js', 'components/*.html', 
	  				'loadfile/*.js', 'loadfile/*.html',
	  				'navigation/*.js', 'navigation/*.html',
	  				'pages/*.html',
	  				'reports/*.js', 'reports/*.html',
	  				'services/*.js', 'services/*.html'], 
	  			{cwd: './'}, 
	  			reload);
	});
