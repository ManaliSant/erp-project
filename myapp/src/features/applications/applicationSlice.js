import { createSlice } from "@reduxjs/toolkit";
import { getCurrentDateTime } from "../../utils/helpers";

const initialState = {
  list: [
    {
      id: "APP-1001",
      employeeId: 2,
      employeeName: "Rahul Menon",
      type: "Leave",
      title: "Annual Leave Request",
      description: "Need 3 days leave for family travel.",
      dateRange: "2026-03-25 to 2026-03-27",
      days: 3,
      status: "Pending",
      reviewedBy: "",
      reviewComment: "",
      createdAt: "2026-03-18 13:40",
    },
    {
      id: "APP-1002",
      employeeId: 3,
      employeeName: "Meera Nair",
      type: "Resignation",
      title: "Resignation Submission",
      description: "Submitting formal resignation.",
      dateRange: "Last working day: 2026-04-30",
      days: 0,
      status: "Pending",
      reviewedBy: "",
      reviewComment: "",
      createdAt: "2026-03-17 10:25",
    },
  ],
};

const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state.list = action.payload;
    },
    addApplicationLocal: (state, action) => {
      state.list.unshift({
        id: "APP-" + Date.now(),
        createdAt: getCurrentDateTime(),
        status: "Pending",
        reviewedBy: "",
        reviewComment: "",
        ...action.payload,
      });
    },
    approveApplicationLocal: (state, action) => {
      const { appId, reviewer } = action.payload;
      const app = state.list.find((a) => a.id === appId);
      if (app) {
        app.status = "Approved";
        app.reviewedBy = reviewer;
        app.reviewComment = "Approved by HR.";
      }
    },
    rejectApplicationLocal: (state, action) => {
      const { appId, reviewer } = action.payload;
      const app = state.list.find((a) => a.id === appId);
      if (app) {
        app.status = "Rejected";
        app.reviewedBy = reviewer;
        app.reviewComment = "Rejected by HR.";
      }
    },
  },
});

export const {
  setApplications,
  addApplicationLocal,
  approveApplicationLocal,
  rejectApplicationLocal,
} = applicationSlice.actions;

export default applicationSlice.reducer;