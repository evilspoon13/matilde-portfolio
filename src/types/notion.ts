export interface About {
  id: string;
  name: string;
  jobTitle: string;
  profileImage: string;
  aboutText: string;
  skills: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  fieldOfStudy: string;
  level: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  gpa: string;
  description: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  current: boolean;
  skills: string[];
  summary: string;
  highlights: string[];
}

export interface Work {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  details: string[];
  location: string;
  client: string;
}