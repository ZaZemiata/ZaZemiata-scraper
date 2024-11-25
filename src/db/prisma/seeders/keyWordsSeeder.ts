import prisma from "../prisma";
import logger from "../../../utils/logger";

// Enum for priorities to ensure type correctness
enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

async function seedKeyWords() {

  // Delete all records from the KeyWords table
  await prisma.keyWords.deleteMany();

  // Insert new records into the KeyWords table
  await prisma.keyWords.createMany({
    data: [
      {
        word: "Environment",
        priority: Priority.HIGH,
        active: true,
        created_at: new Date(),
      },
      {
        word: "Pollution",
        priority: Priority.CRITICAL,
        active: true,
        created_at: new Date(),
      },
      {
        word: "Climate Change",
        priority: Priority.HIGH,
        active: true,
        created_at: new Date(),
      },
      {
        word: "Water Conservation",
        priority: Priority.MEDIUM,
        active: true,
        created_at: new Date(),
      },
      {
        word: "Air Quality",
        priority: Priority.HIGH,
        active: true,
        created_at: new Date(),
      },
      {
        word: "Sustainability",
        priority: Priority.MEDIUM,
        active: true,
        created_at: new Date(),
      },
      {
        word: "Waste Management",
        priority: Priority.MEDIUM,
        active: true,
        created_at: new Date(),
      },
      {
        word: "Biodiversity",
        priority: Priority.LOW,
        active: true,
        created_at: new Date(),
      },
      {
        word: "Recycling",
        priority: Priority.HIGH,
        active: true,
        created_at: new Date(),
      },
      {
        word: "Green Energy",
        priority: Priority.CRITICAL,
        active: true,
        created_at: new Date(),
      },
    ],
  });

  logger.info("KeyWords seeded successfully!");
}

// Seed key words
seedKeyWords()
  .catch((error) => {

    // Log error
    logger.error("Error seeding key words:", error);
  })
  .finally(() => {
    
    // Disconnect from the database
    prisma.$disconnect();
  });
