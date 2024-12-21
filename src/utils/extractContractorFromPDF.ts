// // Importing the logger for logging errors or important information
// import logger from './logger';

// // Function to extract contractor information from a PDF file
// export async function extractContractorFromPDF(url: string): Promise<string> {
//     try {
//         // Log the URL being processed
//         logger.info(`Fetching PDF from: ${url}`);

//         // Dynamically import the pdfjs-dist library to handle PDF documents
//         const pdfjsLib = await import('pdfjs-dist');

//         // Load the PDF document from the URL
//         const pdf = await pdfjsLib.getDocument(url).promise;

//         // Get the total number of pages in the PDF
//         const numPages = pdf.numPages;

//         // Log the number of pages in the PDF
//         logger.info(`PDF loaded successfully with ${numPages} pages.`);

//         // Initialize an empty string to store the extracted text content
//         let textContent = '';

//         // Loop through each page in the PDF
//         for (let i = 1; i <= numPages; i++) {
//             try {
//                 // Get the page from the PDF document
//                 const page = await pdf.getPage(i);

//                 // Log page processing
//                 logger.info(`Processing page ${i}`);

//                 // Extract the text content from the page
//                 const content = await page.getTextContent();

//                 // Log the content items for the page (only for debugging purposes)
//                 logger.info(`Page ${i} content: ${JSON.stringify(content.items)}`);

//                 // Add the extracted text from this page to the textContent variable
//                 textContent += content.items
//                     // Filter out only the text items
//                     .filter((item): item is { str: string } => 'str' in item)
//                     // Extract the string content from each item
//                     .map((item) => item.str)
//                     // Join all text items into a single string  
//                     .join(' ');
//             } catch (pageError) {
//                 // Log an error if there is an issue with processing the page
//                 logger.error(`Error processing page ${i}: ${pageError}`);
//             }
//         }

//         // Log the extracted text (for debugging, only first 500 characters)
//         logger.info(`Extracted text: ${textContent.slice(0, 500)}...`);

//         // Regular expression to match the contractor information (in Bulgarian)
//         const contractorMatch = textContent.match(/възложител[:\s]*(.*?)[\n.]/i);

//         // If contractor information is found, return it. Otherwise, return a default message.
//         if (contractorMatch) {
//             logger.info(`Contractor found: ${contractorMatch[1].trim()}`);
//             return contractorMatch[1].trim();
//         } else {
//             logger.error('Contractor not found in the text.');
//             return 'Contractor not found';
//         }
//     } catch (error) {
//         // Log an error if there is an issue extracting data from the PDF
//         logger.error(`Error extracting contractor from PDF: ${error}`);

//         // Return a message indicating an error occurred while processing the PDF
//         return 'Error processing PDF';
//     }
// }
