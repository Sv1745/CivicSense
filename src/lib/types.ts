export type IssueStatus = "Submitted" | "Acknowledged" | "In Progress" | "Resolved";

export type IssueCategory = "Pothole" | "Broken Streetlight" | "Garbage" | "Water Logging" | "Illegal Parking" | "Encroachment" | "Other";

export type Department = "BBMP (Public Works)" | "Noida Authority (Electrical)" | "MCGM (Solid Waste Mgmt)" | "Delhi PWD" | "Traffic Police" | "Land Department";

export interface IssueReport {
  id: string;
  citizenId: string;
  category: IssueCategory;
  description: string;
  summary: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  imageUrl: string;
  imageHint: string;
  status: IssueStatus;
  department: Department;
  createdAt: Date;
  updatedAt: Date;
}
