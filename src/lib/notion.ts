import { Client } from '@notionhq/client';
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import { About, Education, Experience, Work } from '@/types/notion';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Fetch About data (should only be 1 row)
export async function getAbout(): Promise<About | null> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_ABOUT_DB_ID!,
    } as QueryDatabaseParameters);

    if (response.results.length === 0) return null;

    const page: any = response.results[0];
    
    return {
      id: page.id,
      name: page.properties.Name?.title[0]?.plain_text || '',
      jobTitle: page.properties['Job Title']?.rich_text[0]?.plain_text || '',
      profileImage: page.properties['Profile Image']?.files[0]?.file?.url || 
                    page.properties['Profile Image']?.files[0]?.external?.url || '',
      aboutText: page.properties['About Text']?.rich_text[0]?.plain_text || '',
      skills: page.properties.Skills?.multi_select?.map((s: any) => s.name) || [],
    };
  } catch (error) {
    console.error('Error in getAbout:', error);
    throw error;
  }
}

// Fetch all Education entries
export async function getEducation(): Promise<Education[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_EDUCATION_DB_ID!,
      sorts: [
        {
          property: 'Start Date',
          direction: 'descending',
        },
      ],
    } as QueryDatabaseParameters);

    return response.results.map((page) => {
      const props = (page as any).properties;
      
      return {
        id: page.id,
        degree: props.Degree?.rich_text[0]?.plain_text || '',
        school: props.School?.title[0]?.plain_text || '',
        fieldOfStudy: props['Field of Study']?.rich_text[0]?.plain_text || '',
        level: props.Level?.select?.name || '',
        startDate: props['Start Date']?.date?.start || '',
        endDate: props['End Date']?.date?.start || '',
        current: props.Current?.checkbox || false,
        location: props.Location?.rich_text[0]?.plain_text || '',
        gpa: props.GPA?.number?.toString() || '',
        description: props.Description?.rich_text[0]?.plain_text || '',
      };
    });
  } catch (error) {
    console.error('Error in getEducation:', error);
    throw error;
  }
}

// Fetch all Experience entries
export async function getExperience(): Promise<Experience[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_EXPERIENCE_DB_ID!,
      sorts: [
        {
          property: 'Start Date',
          direction: 'descending',
        },
      ],
    } as QueryDatabaseParameters);

    return response.results.map((page) => {
      const props = (page as any).properties;
      
      return {
        id: page.id,
        role: props.Role?.rich_text[0]?.plain_text || '',
        company: props.Company?.title[0]?.plain_text || '',
        location: props.Location?.rich_text[0]?.plain_text || '',
        employmentType: props['Employment Type']?.multi_select?.map((t: any) => t.name).join(', ') || '',
        startDate: props['Start Date']?.date?.start || '',
        endDate: props['End Date']?.date?.start || '',
        current: props.Current?.checkbox || false,
        skills: props.Skills?.multi_select?.map((s: any) => s.name) || [],
        summary: props.Summary?.rich_text[0]?.plain_text || '',
        highlights: props.Highlights?.rich_text[0]?.plain_text?.split('\n').filter((h: string) => h.trim()) || [],
      };
    });
  } catch (error) {
    console.error('Error in getExperience:', error);
    throw error;
  }
}
// Fetch all Works/Projects
export async function getWorks(): Promise<Work[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_WORKS_DB_ID!,
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    } as QueryDatabaseParameters);

    return response.results.map((page) => {
      const props = (page as any).properties;
      
      return {
        id: page.id,
        title: props.Title?.title[0]?.plain_text || '',
        date: props.Date?.date?.start || '', // Changed from rich_text to date
        description: props.Description?.rich_text[0]?.plain_text || '',
        image: props.Image?.files[0]?.file?.url || 
               props.Image?.files[0]?.external?.url || '',
        details: props.Details?.multi_select?.map((d: any) => d.name) || [],
        location: props.Location?.rich_text[0]?.plain_text || '',
        client: props.Client?.rich_text[0]?.plain_text || '',
      };
    });
  } catch (error) {
    console.error('Error in getWorks:', error);
    throw error;
  }
}