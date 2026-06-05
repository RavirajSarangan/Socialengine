import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Publish due scheduled posts every minute.
crons.interval("publish-due-posts", { minutes: 1 }, internal.publish.publishDue, {});

export default crons;
