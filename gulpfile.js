var gulp = require('gulp');

gulp.task('default', function() {
	var browserSync = require('browser-sync');
	var reload = browserSync.reload;

	// watch files for changes and reload
	gulp.task('serve', function() {
	  browserSync({
	    server: {
	      baseDir: '.'
	    }
	  });

	  gulp.watch([	'*.html', 
	  				'css/*.css', 
	  				'authentication/*.js', 'authentication/*.html', 
	  				'componenets/*.js', 'componenets/*.html', 
	  				'loadfile/*.js', 'loadfile/*.html',
	  				'navigation/*.js', 'navigation/*.html',
	  				'pages/*.html',
	  				'reports/*.js', 'reports/*.html',
	  				'services/*.js', 'services/*.html'], 
	  			{cwd: '.'}, 
	  			reload);
	});
});