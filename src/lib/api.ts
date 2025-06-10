import connectDB from './db';
import { User, Project, AIModel } from '../models';

// Initialize connection to MongoDB
connectDB().catch(err => console.error('Failed to connect to MongoDB:', err));

// User API functions
export const userAPI = {
  // Create a new user
  async createUser(userData: { name: string; email: string; password: string }) {
    try {
      // Generate a unique user_id
      const lastUser = await User.findOne().sort({ user_id: -1 });
      const user_id = lastUser ? lastUser.user_id + 1 : 1;
      
      const user = await User.create({
        user_id,
        ...userData
      });
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Get user by ID
  async getUserById(userId: number) {
    try {
      return await User.findOne({ user_id: userId });
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },
  
  // Get user by email
  async getUserByEmail(email: string) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }
};

// Project API functions
export const projectAPI = {
  // Create a new project
  async createProject(projectData: {
    user_id: number;
    title: string;
    image_url: string;
    ai_model: string;
    generated_code: string;
  }) {
    try {
      // Generate a unique project_id
      const lastProject = await Project.findOne().sort({ project_id: -1 });
      const project_id = lastProject ? lastProject.project_id + 1 : 1;
      
      const project = await Project.create({
        project_id,
        ...projectData,
        created_at: new Date()
      });
      
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  // Get project by ID
  async getProjectById(projectId: number) {
    try {
      return await Project.findOne({ project_id: projectId });
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },
  
  // Get all projects for a user
  async getProjectsByUser(userId: number) {
    try {
      return await Project.find({ user_id: userId }).sort({ created_at: -1 });
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  },
  
  // Update a project
  async updateProject(projectId: number, updateData: Partial<{
    title: string;
    image_url: string;
    ai_model: string;
    generated_code: string;
  }>) {
    try {
      return await Project.findOneAndUpdate(
        { project_id: projectId },
        { $set: updateData },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },
  
  // Delete a project
  async deleteProject(projectId: number) {
    try {
      return await Project.findOneAndDelete({ project_id: projectId });
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};

// AI Model API functions
export const aiModelAPI = {
  // Create a new AI model
  async createAIModel(modelData: { name: string; description: string }) {
    try {
      // Generate a unique model_id
      const lastModel = await AIModel.findOne().sort({ model_id: -1 });
      const model_id = lastModel ? lastModel.model_id + 1 : 1;
      
      const aiModel = await AIModel.create({
        model_id,
        ...modelData
      });
      
      return aiModel;
    } catch (error) {
      console.error('Error creating AI model:', error);
      throw error;
    }
  },
  
  // Get all AI models
  async getAllModels() {
    try {
      return await AIModel.find().sort({ name: 1 });
    } catch (error) {
      console.error('Error fetching AI models:', error);
      throw error;
    }
  },
  
  // Get AI model by ID
  async getModelById(modelId: number) {
    try {
      return await AIModel.findOne({ model_id: modelId });
    } catch (error) {
      console.error('Error fetching AI model:', error);
      throw error;
    }
  }
};
