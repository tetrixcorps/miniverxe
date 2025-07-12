// @ts-ignore
import fetch from 'node-fetch';

const LABEL_STUDIO_URL = process.env.LABEL_STUDIO_URL || 'http://label-studio:8080';
const LABEL_STUDIO_API_KEY = process.env.LABEL_STUDIO_API_KEY || '';

export interface LabelStudioUser {
  id: string;
  email: string;
}

export class LabelStudioService {
  // Ensure a Label Studio user exists for the given email (create if missing)
  async getOrCreateUser(userId: string, email: string): Promise<LabelStudioUser> {
    // 1. Try to find the user by email
    const usersRes = await fetch(`${LABEL_STUDIO_URL}/api/users?email=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Token ${LABEL_STUDIO_API_KEY}` },
    });
    const users = await usersRes.json();
    if (Array.isArray(users) && users.length > 0) {
      return { id: users[0].id, email: users[0].email };
    }
    // 2. If not found, create the user
    const createRes = await fetch(`${LABEL_STUDIO_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${LABEL_STUDIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: userId + Date.now(), // Generate a unique password
        active: true,
      }),
    });
    const created = await createRes.json();
    return { id: created.id, email: created.email };
  }

  // Generate a short-lived token for the Label Studio user (if supported)
  async getUserToken(user: LabelStudioUser): Promise<string> {
    // If Label Studio supports per-user tokens, implement here
    // For now, return the API key (not ideal for production)
    return LABEL_STUDIO_API_KEY;
  }

  // Generate a secure iframe URL for a project/task/user
  async generateAuthenticatedUrl(projectId: string, taskId: string, user: LabelStudioUser, token: string): Promise<string> {
    const params = new URLSearchParams({
      embed: '1',
      token,
    });
    return `${LABEL_STUDIO_URL}/projects/${projectId}/tasks/${taskId}?${params.toString()}`;
  }

  // Stub for dynamic label config generation
  generateLabelConfig(project: any): string {
    // TODO: Generate XML config based on project type, fields, etc.
    // Example for image classification:
    if (project.type === 'image-classification') {
      return `<View><Image name="image" value="$image"/><Choices name="choice" toName="image"><Choice value="Class A"/><Choice value="Class B"/></Choices></View>`;
    }
    // Default stub
    return '<View></View>';
  }

  // Create a project in Label Studio
  async createProjectInLabelStudio(project: any): Promise<{ id: string; error?: string }> {
    const labelConfig = this.generateLabelConfig(project);
    const res = await fetch(`${LABEL_STUDIO_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${LABEL_STUDIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: project.name,
        label_config: labelConfig,
        description: project.description || '',
        color: project.color || '#1976d2',
      }),
    });
    if (!res.ok) {
      const error = await res.text();
      return { id: '', error };
    }
    const data = await res.json();
    return { id: data.id };
  }

  // Create a task in Label Studio
  async createTaskInLabelStudio(lsProjectId: string, taskData: any): Promise<{ id: string; error?: string }> {
    const res = await fetch(`${LABEL_STUDIO_URL}/api/projects/${lsProjectId}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${LABEL_STUDIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([taskData]), // LS expects an array
    });
    if (!res.ok) {
      const error = await res.text();
      return { id: '', error };
    }
    const data = await res.json();
    return { id: data[0]?.id };
  }
} 