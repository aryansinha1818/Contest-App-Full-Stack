const express = require("express");
const {
  createContest,
  addQuestion,
  getContests,
  getQuestionsByContest,
  deleteQuestion,
  participateInContest,
  submitContest,
  saveContestProgress,
} = require("../controllers/contest.controller");
const {
  authenticate,
  optionalAuth,
} = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const router = express.Router();

router.get("/", optionalAuth, getContests);

router.post("/", authenticate, roleMiddleware(["ADMIN"]), createContest);

router.post(
  "/:contestId/question",
  authenticate,
  roleMiddleware(["ADMIN"]),
  addQuestion
);

router.delete(
  "/:contestId/question/:questionId",
  authenticate,
  roleMiddleware(["ADMIN"]),
  deleteQuestion
);

router.get(
  "/:contestId/questions",
  authenticate,

  getQuestionsByContest
);

router.post("/:id/participate", authenticate, participateInContest);

router.post("/submit", authenticate, submitContest);

router.post("/save-progress", authenticate, saveContestProgress);

module.exports = router;
