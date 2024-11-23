"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMe = checkMe;
exports.checkMeAsync = checkMeAsync;
function checkMe(req, res) {
    return res.status(200).send({
        message: 'I am alive!',
    });
}
;
async function checkMeAsync(req, res) {
    return res.status(200).send({
        message: 'I am alive (async)!',
    });
}
;
//# sourceMappingURL=home.controller.js.map