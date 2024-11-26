import prisma from "../prisma";
import logger from "../../../utils/logger";

export default async function seedSettings() {

    // Delete all records from the Settings table
    await prisma.settings.deleteMany();

    // Insert new records into the Settings table
    await prisma.settings.createMany({
        data: [
            {
                id: 1,
                name: "Site Maintenance",
                value: "enabled",
                active: true,
                created_at: new Date(),
                source_id: 100,
            },
            {
                id: 2,
                name: "Data Refresh Interval",
                value: "30 minutes",
                active: true,
                created_at: new Date(),
                source_id: 200,
            },
            {
                id: 3,
                name: "API Rate Limit",
                value: "100 requests per minute",
                active: true,
                created_at: new Date(),
                source_id: 300,
            },
            {
                id: 4,
                name: "Data Retention Period",
                value: "6 months",
                active: true,
                created_at: new Date(),
                source_id: 100,
            },
            {
                id: 5,
                name: "Notification Settings",
                value: "enabled",
                active: true,
                created_at: new Date(),
                source_id: 200,
            },
    ],
  });

  logger.info("Settings seeded successfully!");
}

// Seed settings
seedSettings()
  .catch((error) => {

    // Log error
    logger.error("Error seeding settings:", error);
  })
  .finally(() => {

    // Disconnect from the database
    prisma.$disconnect();
  });
