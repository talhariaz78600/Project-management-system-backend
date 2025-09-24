// Test script for Budget Milestone functionality
const mongoose = require('mongoose');
const BudgetMilestone = require('./src/models/BudgetMilestone');
const Project = require('./src/models/Project');
require('dotenv').config();

// Test the budget milestone functionality
async function testBudgetMilestone() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 60000
    });
    console.log('Connected to MongoDB for testing');

    // Test 1: Create a sample milestone (you need to have a valid projectId)
    console.log('\n=== Testing Budget Milestone Creation ===');
    
    // First, let's check if there are any projects
    const projects = await Project.find().limit(1);
    if (projects.length === 0) {
      console.log('No projects found. Please create a project first.');
      return;
    }

    const sampleProject = projects[0];
    console.log(`Using project: ${sampleProject.title} (ID: ${sampleProject._id})`);

    // Create a test milestone
    const testMilestone = new BudgetMilestone({
      milestoneName: 'Test Milestone',
      status: 'Pending',
      price: 1500,
      projectId: sampleProject._id,
      description: 'This is a test milestone'
    });

    const savedMilestone = await testMilestone.save();
    console.log('Milestone created successfully:', savedMilestone._id);

    // Test 2: Get milestones by project
    console.log('\n=== Testing Get Milestones by Project ===');
    const milestones = await BudgetMilestone.find({ projectId: sampleProject._id })
      .populate('projectId', 'title');
    
    console.log(`Found ${milestones.length} milestones for project ${sampleProject.title}`);
    milestones.forEach(milestone => {
      console.log(`- ${milestone.milestoneName}: $${milestone.price} (${milestone.status})`);
    });

    // Test 3: Get budget summary
    console.log('\n=== Testing Budget Summary ===');
    const summary = await BudgetMilestone.getTotalBudgetByProject(sampleProject._id);
    if (summary.length > 0) {
      console.log('Budget Summary:', summary[0]);
    }

    // Test 4: Update milestone status
    console.log('\n=== Testing Status Update ===');
    savedMilestone.status = 'In Progress';
    await savedMilestone.save();
    console.log('Milestone status updated to:', savedMilestone.status);

    // Test 5: Get milestones by status
    console.log('\n=== Testing Get Milestones by Status ===');
    const pendingMilestones = await BudgetMilestone.getMilestonesByStatus(sampleProject._id, 'Pending');
    const inProgressMilestones = await BudgetMilestone.getMilestonesByStatus(sampleProject._id, 'In Progress');
    
    console.log(`Pending milestones: ${pendingMilestones.length}`);
    console.log(`In Progress milestones: ${inProgressMilestones.length}`);

    // Clean up test data
    console.log('\n=== Cleaning up test data ===');
    await BudgetMilestone.findByIdAndDelete(savedMilestone._id);
    console.log('Test milestone deleted');

    console.log('\n✅ All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Export for use in other files
module.exports = { testBudgetMilestone };

// Run test if this file is executed directly
if (require.main === module) {
  testBudgetMilestone();
}
