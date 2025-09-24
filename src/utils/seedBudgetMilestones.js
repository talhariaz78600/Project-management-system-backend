const BudgetMilestone = require('../models/BudgetMilestone');
const Project = require('../models/Project');

// Sample budget milestones data for seeding
const sampleBudgetMilestones = [
  {
    milestoneName: 'Project Planning Phase',
    status: 'Completed',
    price: 5000,
    description: 'Initial project planning and requirement gathering'
  },
  {
    milestoneName: 'Design and Architecture',
    status: 'In Progress',
    price: 8000,
    description: 'System design and architecture development'
  },
  {
    milestoneName: 'Backend Development',
    status: 'Pending',
    price: 12000,
    description: 'API development and database implementation'
  },
  {
    milestoneName: 'Frontend Development',
    status: 'Pending',
    price: 10000,
    description: 'User interface development and integration'
  },
  {
    milestoneName: 'Testing and Quality Assurance',
    status: 'Pending',
    price: 6000,
    description: 'Comprehensive testing and bug fixes'
  },
  {
    milestoneName: 'Deployment and Launch',
    status: 'Pending',
    price: 4000,
    description: 'Production deployment and go-live activities'
  }
];

// Function to seed budget milestones for existing projects
const seedBudgetMilestones = async () => {
  try {
    // Get all existing projects
    const projects = await Project.find();
    
    if (projects.length === 0) {
      console.log('No projects found. Please create projects first before seeding milestones.');
      return;
    }

    // Clear existing budget milestones
    await BudgetMilestone.deleteMany({});
    console.log('Existing budget milestones cleared.');

    // Create milestones for each project
    const milestones = [];
    
    for (const project of projects) {
      for (const milestoneData of sampleBudgetMilestones) {
        milestones.push({
          ...milestoneData,
          projectId: project._id
        });
      }
    }

    // Insert all milestones
    const createdMilestones = await BudgetMilestone.insertMany(milestones);
    console.log(`${createdMilestones.length} budget milestones created successfully!`);

    // Display summary
    for (const project of projects) {
      const projectMilestones = createdMilestones.filter(m => m.projectId.toString() === project._id.toString());
      const totalBudget = projectMilestones.reduce((sum, m) => sum + m.price, 0);
      console.log(`Project: ${project.title} - Total Budget: $${totalBudget} (${projectMilestones.length} milestones)`);
    }

  } catch (error) {
    console.error('Error seeding budget milestones:', error);
  }
};

// Function to create a single milestone for testing
const createSampleMilestone = async (projectId, userId) => {
  try {
    const milestone = await BudgetMilestone.create({
      milestoneName: 'Sample Testing Milestone',
      status: 'Pending',
      price: 2500,
      projectId: projectId,
      description: 'This is a sample milestone for testing purposes'
    });

    console.log('Sample milestone created:', milestone);
    return milestone;
  } catch (error) {
    console.error('Error creating sample milestone:', error);
    throw error;
  }
};

module.exports = {
  seedBudgetMilestones,
  createSampleMilestone,
  sampleBudgetMilestones
};
