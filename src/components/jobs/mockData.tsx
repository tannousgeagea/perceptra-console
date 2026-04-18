import { Job, JobStatus } from "@/types/jobs";
import { User } from "@/types/membership";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "user-1",
    username: "Alex Johnson",
    email: "",
    role: "Senior Annotator",
  },
  {
    id: "user-2",
    username: "Jamie Smith",
    email: "",
    role: "Annotator",
  },
  {
    id: "user-3",
    username: "Morgan Taylor",
    email: "",
    role: "Quality Assurance",
  },
  {
    id: "user-4",
    username: "Casey Wilson",
    email: "",
    role: "Annotator",
  },
  {
    id: "user-5",
    username: "Robin Chen",
    email: "",
    role: "Annotator",
  },
  {
    id: "user-6",
    username: "Jordan Lee",
    email: "",
    role: "Senior Annotator",
  },
  {
    id: "user-7",
    username: "Sam Cooper",
    email: "",
    role: "Quality Assurance",
  },
];

// Mock Jobs
export const mockJobs: Job[] = [
  // Unassigned Jobs
  {
    id: "job-001",
    name: "Traffic Sign Detection",
    description: "Annotate traffic signs in urban environments",
    status: JobStatus.UNASSIGNED,
    image_count: 142,
    assignedUser: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "job-002",
    name: "Pedestrian Recognition",
    description: "Annotate pedestrians in crowded scenes",
    status: JobStatus.UNASSIGNED,
    image_count: 98,
    assignedUser: null,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: "job-003",
    name: "Vehicle Damage Assessment",
    description: "Identify and classify vehicle damage",
    status: JobStatus.UNASSIGNED,
    image_count: 75,
    assignedUser: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "job-004",
    name: "Building Segmentation",
    description: "Segment buildings in aerial images",
    status: JobStatus.UNASSIGNED,
    image_count: 53,
    assignedUser: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },

  // Assigned Jobs
  {
    id: "job-005",
    name: "Industrial Equipment",
    description: "Annotate industrial machinery components",
    status: JobStatus.ASSIGNED,
    image_count: 87,
    assignedUser: mockUsers[1], // Jamie Smith
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: "job-006",
    name: "Medical Imaging - Lungs",
    description: "Annotate lung structures in X-rays",
    status: JobStatus.ASSIGNED,
    image_count: 120,
    assignedUser: mockUsers[0], // Alex Johnson
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "job-007",
    name: "Construction Site Safety",
    description: "Identify safety hazards in construction sites",
    status: JobStatus.ASSIGNED,
    image_count: 62,
    assignedUser: mockUsers[4], // Robin Chen
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },

  // In Review Jobs
  {
    id: "job-008",
    name: "Retail Shelf Analysis",
    description: "Annotate retail shelf products",
    status: JobStatus.IN_REVIEW,
    image_count: 93,
    assignedUser: mockUsers[3], // Casey Wilson
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "job-009",
    name: "Crop Health Assessment",
    description: "Identify crop health issues in fields",
    status: JobStatus.IN_REVIEW,
    image_count: 105,
    assignedUser: mockUsers[5], // Jordan Lee
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },

  // Completed Jobs
  {
    id: "job-010",
    name: "Public Transport Signs",
    description: "Annotate public transport signage",
    status: JobStatus.COMPLETED,
    image_count: 76,
    assignedUser: mockUsers[1], // Jamie Smith
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: "job-011",
    name: "Wildlife Recognition",
    description: "Identify wildlife in nature reserves",
    status: JobStatus.COMPLETED,
    image_count: 134,
    assignedUser: mockUsers[0], // Alex Johnson
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: "job-012",
    name: "Fashion Item Detection",
    description: "Annotate fashion items in e-commerce images",
    status: JobStatus.COMPLETED,
    image_count: 89,
    assignedUser: mockUsers[4], // Robin Chen
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
];