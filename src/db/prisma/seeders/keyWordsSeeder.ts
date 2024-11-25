import prisma from "../prisma";
import logger from "../../../utils/logger";

// Enum for priorities to ensure type correctness
enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

async function seedKeyWords() {
  // Mock data for the KeyWords table using the Priority enum
  const mockKeyWords = [
    { word: 'Environment', priority: Priority.HIGH, active: true },
    { word: 'Pollution', priority: Priority.CRITICAL, active: true },
    { word: 'Climate Change', priority: Priority.HIGH, active: true },
    { word: 'Water Conservation', priority: Priority.MEDIUM, active: true },
    { word: 'Air Quality', priority: Priority.HIGH, active: true },
    { word: 'Sustainability', priority: Priority.MEDIUM, active: true },
    { word: 'Waste Management', priority: Priority.MEDIUM, active: true },
    { word: 'Biodiversity', priority: Priority.LOW, active: true },
    { word: 'Recycling', priority: Priority.HIGH, active: true },
    { word: 'Green Energy', priority: Priority.CRITICAL, active: true },
  ];

  // Insert mock data into the KeyWords table
  for (const keyword of mockKeyWords) {
    await prisma.keyWords.create({
      data: keyword,
    });
  }

  logger.info('KeyWords seeded successfully!');
}

async function main() {
  try {
    await seedKeyWords();
  } catch (error) {
    // Log error
    logger.error('Error seeding key words:', error);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Run the seeder
main();
