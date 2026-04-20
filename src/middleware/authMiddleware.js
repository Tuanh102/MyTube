class AuthMiddleware {
    isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // Nếu là API call hoặc AJAX
    if (req.xhr || req.path.startsWith('/api/') || req.headers['accept']?.includes('json')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    res.redirect('/'); 
}

    localsUser(req, res, next) {
        res.locals.user = req.user || null;
        next();
    }
}
module.exports = new AuthMiddleware();