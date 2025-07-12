import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DataLabelingDashboard from "@/components/data-labeling/Dashboard";
import * as api from "@/lib/api";

jest.mock("@/lib/api");

const mockProjects = [
  {
    id: "1",
    name: "Test Project",
    status: "active",
    progress: 50,
    totalTasks: 10,
    completedTasks: 5,
    assignedMembers: 2,
    createdAt: new Date().toISOString(),
    deadline: new Date().toISOString(),
  },
];

describe("DataLabelingDashboard integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.apiService.getDashboardData = jest.fn().mockResolvedValue({
      data: {
        stats: {
          totalProjects: 1,
          activeTasks: 2,
          completedTasks: 5,
          pendingReviews: 1,
          totalEarnings: 100,
          qualityScore: 90,
        },
        projects: mockProjects,
      },
    });
    api.apiService.createProject = jest.fn().mockResolvedValue({ project: { id: "2" } });
    api.apiService.createTask = jest.fn().mockResolvedValue({ task: { id: "3" } });
  });

  it("opens and closes the Create Project modal", async () => {
    render(<DataLabelingDashboard />);
    await waitFor(() => expect(screen.getByText(/Data Labeling Dashboard/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Create New Project/i));
    expect(screen.getByText(/Create New Project/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Create Project/i)); // Try submit empty
    expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: "My Project" } });
    fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: 100 } });
    fireEvent.change(screen.getByLabelText(/Deadline/i), { target: { value: "2025-01-01" } });
    fireEvent.click(screen.getByText(/Create Project/i));
    await waitFor(() => expect(api.apiService.createProject).toHaveBeenCalled());
  });

  it("opens and closes the Create Task modal", async () => {
    render(<DataLabelingDashboard />);
    await waitFor(() => expect(screen.getByText(/Data Labeling Dashboard/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Create New Task/i));
    expect(screen.getByText(/Create New Task/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Create Task/i)); // Try submit empty
    expect(await screen.findByText(/Project ID is required/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Project ID/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/Dataset ID/i), { target: { value: "ds1" } });
    fireEvent.change(screen.getByLabelText(/Input Data/i), { target: { value: "{}" } });
    fireEvent.change(screen.getByLabelText(/Estimated Hours/i), { target: { value: 2 } });
    fireEvent.change(screen.getByLabelText(/Payment/i), { target: { value: 50 } });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: "High" } });
    fireEvent.click(screen.getByText(/Create Task/i));
    await waitFor(() => expect(api.apiService.createTask).toHaveBeenCalled());
  });
}); 