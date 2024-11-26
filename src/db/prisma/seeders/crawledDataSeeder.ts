import prisma from "../prisma";
import logger from "../../../utils/logger";

// Seeder class for the crawledData table
export default class CrawledDataSeeder {

    // Drops all records from the crawledData table
    async drop() {

        // Prepare for errors
        try {

            // Drop all records from the crawledData table
            await prisma.crawledData.deleteMany();

            // Log success
            logger.info("All records in the crawledData table have been deleted.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error dropping records from crawledData table:", error);

            // Rethrow the error
            throw error;
        }
    }

    // Seeds the crawledData table with new records
    async seed() {

        // Prepare data
        const data = [
            {
                text: "В РИОСВ-Русе е внесено уведомление с вх. № АО-5618/06.11.2024 г. за инвестиционно предложение",
                contractor: "„ТЕРА ВЕРДЕˮ ЕООД",
                date: new Date("2024-11-14"),
                created_at: new Date(),
                source_url: 100,
            },
            {
                text: 'Писмо до възложителя с изх. № И-4733/21.11.2024 г., относно ИП/ПП за "Подробен устройствен план',
                contractor: "Г-жа Петрова",
                date: new Date("2024-11-21"),
                created_at: new Date(),
                source_url: 101,
            },
            {
                text: "Съобщение за уведомление за инвестиционно предложение за „Изграждане на надземен паркинг с 55 паркоместа“ в поземлен имот с идентификатор 68134.2043.4320, м. „Шумако“, район „Витоша“, Столична община.",
                contractor:
                    "„КОНСЕПТ ИНВЕСТ 2011“ АД, Й. Александров, Н. Александров",
                date: new Date("2024-11-19"),
                created_at: new Date(),
                source_url: 200,
            },
            {
                text: "Съобщение за Решение по ОВОС СО-01-01/2024 г. за одобряване осъществяването на инвестиционно предложение за „Модернизация на железопътна линия Радомир – Гюешево – граница с Република Северна Македония“.",
                contractor: "ДЪРЖАВНО ПРЕДПРИЯТИЕ „НАЦИОНАЛНА КОМПАНИЯ ЖЕЛЕЗОПЪТНА ИНФРАСТРУКТУРА”",
                date: new Date("2024-06-20"),
                created_at: new Date(),
                source_url: 201,
            },
            {
                text: "Съобщение за обществено обсъждане на ДОВОС за ИП: “Добив и преработка на подземни богатства-строителни материали от находище Инджова върба-3”, землище с.Дълго поле, община Калояново",
                contractor: "Възложител „ХОЛСИМ КАРИЕРНИ МАТЕРИАЛИ",
                date: new Date("2022-01-01"),
                created_at: new Date(),
                source_url: 300,
            },
            {
                text: "ОВОС-2562/12.11.2024г. за инвестиционно предложение (ИП): „Кравеферма за около 500 дойни крави с административни, складови и обслужващи сгради“ в ПИ 69420.100.81, с. Столетово, общ. Карлово, обл. Пловдив",
                contractor: "„АГРО ПРОДУКТ БИКОВ” ЕООД",
                date: new Date("2022-01-01"),
                created_at: new Date(),
                source_url: 301,
            },
        ];

        // Prepare for errors
        try {

            // Seed the crawledData table with the data
            await prisma.crawledData.createMany({ data });

            // Log success
            logger.info("crawledData table seeded successfully.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error seeding crawledData table:", error);

            // Rethrow the error
            throw error;
        }
    }
}