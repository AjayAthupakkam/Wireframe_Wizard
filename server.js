import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.VITE_MONGODB_URI;
    if (!mongoURI) {
      console.error('MongoDB URI is not defined in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Import models
const UserSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  }
}, {
  timestamps: true
});

const ProjectSchema = new mongoose.Schema({
  project_id: {
    type: Number,
    required: true,
    unique: true
  },
  user_id: {
    type: Number,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  image_url: {
    type: String,
    required: true
  },
  ai_model: {
    type: String,
    required: true
  },
  generated_code: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const AIModelSchema = new mongoose.Schema({
  model_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);
const AIModel = mongoose.model('AIModel', AIModelSchema);

// API Routes

// User routes
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Generate a unique user_id
    const lastUser = await User.findOne().sort({ user_id: -1 });
    const user_id = lastUser ? lastUser.user_id + 1 : 1;
    
    // Create new user
    const user = await User.create({
      user_id,
      name,
      email,
      password
    });
    
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Project routes
app.post('/api/projects', async (req, res) => {
  try {
    const { user_id, title, image_url, ai_model, generated_code } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ user_id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate a unique project_id
    const lastProject = await Project.findOne().sort({ project_id: -1 });
    const project_id = lastProject ? lastProject.project_id + 1 : 1;
    
    // Create new project
    const project = await Project.create({
      project_id,
      user_id,
      title,
      image_url,
      ai_model,
      generated_code,
      created_at: new Date()
    });
    
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/projects/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all projects for a user
    const projects = await Project.find({ user_id: userId }).sort({ created_at: -1 });
    
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AI Model routes
app.post('/api/aimodels', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if model already exists
    const existingModel = await AIModel.findOne({ name });
    if (existingModel) {
      return res.status(400).json({ message: 'AI Model already exists' });
    }
    
    // Generate a unique model_id
    const lastModel = await AIModel.findOne().sort({ model_id: -1 });
    const model_id = lastModel ? lastModel.model_id + 1 : 1;
    
    // Create new AI model
    const aiModel = await AIModel.create({
      model_id,
      name,
      description
    });
    
    res.status(201).json({ success: true, data: aiModel });
  } catch (error) {
    console.error('Error creating AI model:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/aimodels', async (req, res) => {
  try {
    // Get all AI models
    const aiModels = await AIModel.find().sort({ name: 1 });
    
    res.status(200).json({ success: true, count: aiModels.length, data: aiModels });
  } catch (error) {
    console.error('Error fetching AI models:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
