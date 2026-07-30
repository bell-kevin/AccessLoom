import {
  defaultPassportSections,
  type Adjustment,
  type CheckIn,
  type Commitment,
  type WorkspaceRecord
} from "../types";
import { localDateKey } from "../lib/date";

const day = (offset: number, hour = 16): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const dateOnly = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return localDateKey(date);
};

export const createDemoData = (): {
  workspace: WorkspaceRecord;
  adjustments: Adjustment[];
  checkIns: CheckIn[];
  commitments: Commitment[];
} => {
  const adjustments: Adjustment[] = [
    {
      id: "demo-agenda",
      title: "Written meeting agenda",
      barrier: "Unclear expectations",
      status: "Helpful",
      hypothesis: "Knowing the shape of a meeting ahead of time will reduce preparation load.",
      setup: "Agenda and intended decisions shared by 3pm the previous working day.",
      successLooksLike: "I enter meetings with questions ready and finish with capacity left.",
      startedAt: dateOnly(-24),
      reviewDate: dateOnly(8),
      effectiveness: 5,
      effort: 1,
      notes: "Most useful when the agenda names the decision, not just the topic.",
      includeInPassport: true,
      createdAt: day(-27),
      updatedAt: day(-2)
    },
    {
      id: "demo-focus",
      title: "Protected focus block",
      barrier: "Focus & interruption",
      status: "Trying",
      hypothesis: "A predictable no-message block will make detailed work sustainable.",
      setup: "9:30–11:00 on Tuesdays and Thursdays, status visible, urgent route documented.",
      successLooksLike: "Finish one deep-work outcome without needing evening catch-up.",
      startedAt: dateOnly(-9),
      reviewDate: dateOnly(5),
      effectiveness: 4,
      effort: 2,
      notes: "The visible status matters more than muting notifications alone.",
      includeInPassport: true,
      createdAt: day(-10),
      updatedAt: day(-1)
    },
    {
      id: "demo-captions",
      title: "Captions + written decisions",
      barrier: "Communication",
      status: "Agreed",
      hypothesis: "A second channel will reduce missed details and memory load.",
      setup: "Captions on for calls; decisions and owners captured in the meeting chat.",
      successLooksLike: "Fewer follow-up messages asking what was decided.",
      startedAt: dateOnly(-42),
      reviewDate: dateOnly(28),
      effectiveness: 5,
      effort: 1,
      notes: "Works well and helps other people too.",
      includeInPassport: true,
      createdAt: day(-45),
      updatedAt: day(-4)
    },
    {
      id: "demo-camera",
      title: "Camera-optional calls",
      barrier: "Sensory load",
      status: "Idea",
      hypothesis: "Less visual self-monitoring may preserve attention for the conversation.",
      setup: "Camera optional for internal calls when visual participation is not task-essential.",
      successLooksLike: "More consistent participation on high-load days.",
      startedAt: "",
      reviewDate: "",
      effectiveness: 0,
      effort: 1,
      notes: "",
      includeInPassport: false,
      createdAt: day(-3),
      updatedAt: day(-3)
    }
  ];

  const checkIns: CheckIn[] = [
    {
      id: "demo-check-1",
      recordedAt: day(-11, 15),
      context: "Meeting",
      activity: "Weekly planning call",
      barrier: "Unclear expectations",
      friction: 4,
      capacityBefore: 4,
      capacityAfter: 2,
      supportIds: [],
      supportLabels: [],
      note: "Topic list arrived at the start; hard to prepare the trade-offs.",
      win: "Asked which decision was needed before discussion started."
    },
    {
      id: "demo-check-2",
      recordedAt: day(-10, 17),
      context: "Focused work",
      activity: "Budget reconciliation",
      barrier: "Focus & interruption",
      friction: 5,
      capacityBefore: 4,
      capacityAfter: 1,
      supportIds: [],
      supportLabels: [],
      note: "Six message interruptions and two quick calls.",
      win: "Captured a restart note each time."
    },
    {
      id: "demo-check-3",
      recordedAt: day(-8, 14),
      context: "Meeting",
      activity: "Project review",
      barrier: "Unclear expectations",
      friction: 2,
      capacityBefore: 4,
      capacityAfter: 4,
      supportIds: ["demo-agenda", "demo-captions"],
      supportLabels: ["Written meeting agenda", "Captions + written decisions"],
      note: "The agenda named the two decisions. I could prepare concise options.",
      win: "Left with clear owners and no follow-up clarification."
    },
    {
      id: "demo-check-4",
      recordedAt: day(-7, 11),
      context: "Focused work",
      activity: "Drafting a complex proposal",
      barrier: "Focus & interruption",
      friction: 2,
      capacityBefore: 4,
      capacityAfter: 4,
      supportIds: ["demo-focus"],
      supportLabels: ["Protected focus block"],
      note: "Status was visible and the urgent route was clear.",
      win: "Finished the first draft inside the block."
    },
    {
      id: "demo-check-5",
      recordedAt: day(-5, 16),
      context: "Shared workspace",
      activity: "Reviewing detailed edits",
      barrier: "Sensory load",
      friction: 4,
      capacityBefore: 3,
      capacityAfter: 1,
      supportIds: [],
      supportLabels: [],
      note: "Nearby conversation made it hard to hold the document structure.",
      win: "Moved for the final thirty minutes."
    },
    {
      id: "demo-check-6",
      recordedAt: day(-4, 15),
      context: "Meeting",
      activity: "Client handoff",
      barrier: "Communication",
      friction: 2,
      capacityBefore: 3,
      capacityAfter: 3,
      supportIds: ["demo-agenda", "demo-captions"],
      supportLabels: ["Written meeting agenda", "Captions + written decisions"],
      note: "Names and dates in the written summary prevented ambiguity.",
      win: "Caught one deadline mismatch before the call ended."
    },
    {
      id: "demo-check-7",
      recordedAt: day(-2, 11),
      context: "Focused work",
      activity: "Data quality review",
      barrier: "Focus & interruption",
      friction: 1,
      capacityBefore: 5,
      capacityAfter: 4,
      supportIds: ["demo-focus"],
      supportLabels: ["Protected focus block"],
      note: "One planned check-in halfway through instead of live messages.",
      win: "Completed the review without an evening recovery cost."
    },
    {
      id: "demo-check-8",
      recordedAt: day(-1, 15),
      context: "Meeting",
      activity: "Team retro",
      barrier: "Sensory load",
      friction: 3,
      capacityBefore: 3,
      capacityAfter: 2,
      supportIds: ["demo-captions"],
      supportLabels: ["Captions + written decisions"],
      note: "Captions helped, but gallery view and rapid turn-taking still added load.",
      win: "Used chat for one contribution instead of waiting for a speaking gap."
    }
  ];

  const commitments: Commitment[] = [
    {
      id: "demo-commitment-1",
      title: "Add focus blocks to the shared team calendar",
      owner: "Jordan",
      dueDate: dateOnly(2),
      status: "Open",
      adjustmentId: "demo-focus",
      notes: "Include the urgent contact route in the event description.",
      createdAt: day(-4)
    },
    {
      id: "demo-commitment-2",
      title: "Review focus-block experiment",
      owner: "Alex + Jordan",
      dueDate: dateOnly(5),
      status: "Open",
      adjustmentId: "demo-focus",
      notes: "Look at completion and end-of-day capacity, not just output.",
      createdAt: day(-4)
    },
    {
      id: "demo-commitment-3",
      title: "Enable captions in the team meeting template",
      owner: "Jordan",
      dueDate: dateOnly(-18),
      status: "Done",
      adjustmentId: "demo-captions",
      notes: "",
      createdAt: day(-32)
    }
  ];

  return {
    workspace: {
      key: "workspace",
      initialized: true,
      isDemo: true,
      createdAt: day(-45),
      profile: {
        preferredName: "Alex",
        roleContext: "Operations coordinator in a hybrid team",
        introduction:
          "I do my best work when priorities are explicit and important information has a written home.",
        strengths: [
          "Spotting inconsistencies before they become expensive",
          "Turning complex work into clear sequences",
          "Calm, thoughtful written communication"
        ],
        communication: [
          "Share decisions and owners in writing",
          "Give me a moment to process before expecting an answer",
          "Mark what is urgent instead of treating every message as urgent"
        ],
        workingConditions: [
          "Protected blocks for detailed work",
          "A meeting agenda that names the intended decision",
          "Captions available on video calls"
        ],
        difficultDayPlan:
          "If my capacity drops, help me identify the one outcome that matters today. I may switch to written communication or move a non-urgent meeting.",
        reviewTriggers:
          "Review after a role, manager, location, schedule, or health change—and at least every six months."
      },
      passportSections: { ...defaultPassportSections }
    },
    adjustments,
    checkIns,
    commitments
  };
};
