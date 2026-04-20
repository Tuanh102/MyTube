const homeController = require('../src/controllers/homeController');

// Fake req, res
const req = {
    params: { id: 1 }
};

const res = {
    render: (view, data) => {
        console.log("VIEW:", view);
        console.log("DATA:", data);
    },
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    send: (msg) => {
        console.log("SEND:", msg);
    }
};

(async () => {
    console.log("=== TEST getWatchPage ===");
    await homeController.getWatchPage(req, res);
})();