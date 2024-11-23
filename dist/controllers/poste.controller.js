"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDumpedPostes = getDumpedPostes;
require("reflect-metadata");
const poste_meteor_js_1 = require("../metier/poste_meteor.js");
// export function checkMe(req: Request, res: Response): Response{
//     return res.status(200).send({
//       message: 'I am alive!',
//     });
//   };
async function getDumpedPostes(req, res) {
    return res.status(200).send(await poste_meteor_js_1.PosteMeteor.getDumpedPostes());
}
//# sourceMappingURL=poste.controller.js.map