// Dependencies
import dotenv from 'dotenv';

// Configure and start dotenv
dotenv.config();

// Browser options
export const browserOptions = {

    // Headless mode switch
    headless: Boolean(Number(process.env.HEADLESS)),

    // Arguments
    args: [
        '--disable-features=Translate,OptimizationHints,MediaRouter',               // Disable built-in Google Translate service, Optimization Guide background networking, Media Router (cast target discovery) background networking
        '--disable-extensions',                                                     // Disable all chrome extensions
        '--disable-component-extensions-with-background-pages',                     // Disable some extensions that aren't affected by --disable-extensions
        '--disable-search-engine-choice-screen',                                    // Disable the search engine choice screen
        '--disable-background-networking',                                          // Disable various background network services, including extension updating, safe browsing service, upgrade detector, translate, UMA
        '--disable-component-update',                                               // Don't update the browser 'components' listed at chrome://components/
        '--disable-client-side-phishing-detection',                                 // Disables client-side phishing detection.
        '--disable-sync',                                                           // Disable syncing to a Google account
        '--metrics-recording-only',                                                 // Disable reporting to UMA, but allows for collection
        '--disable-dev-shm-usage',                                                  // Disable /dev/shm usage
        '--disable-default-apps',                                                   // Disable installation of default apps on first run
        '--disable-canvas-aa',                                                      // Disable antialiasing on 2d canvas
        '--disable-2d-canvas-clip-aa',                                              // Disable antialiasing on 2d canvas clips
        '--no-sandbox',                                                             // Disable the sandbox for all process types that are normally sandboxed
        '--no-zygote',                                                              // Disable the zygote process for all process types
        '--mute-audio',                                                             // Mute any audio
        '--no-default-browser-check',                                               // Disable the default browser check, do not prompt to set it as such
        '--no-first-run',                                                           // Skip first run wizards
        '--disable-backgrounding-occluded-windows',                                 // Disable backgrounding renders for occluded windows
        '--disable-renderer-backgrounding',                                         // Disable renderer process backgrounding
        '--disable-background-timer-throttling',                                    // Disable task throttling of timer tasks from background pages.
        '--disable-ipc-flooding-protection',                                        // Disable the default throttling of IPC between renderer & browser processes.
        '--password-store=basic',                                                   // Avoid potential instability of using Gnome Keyring or KDE wallet. crbug.com/571003 crbug.com/991424
        '--use-mock-keychain',                                                      // Use mock keychain on Mac to prevent blocking permissions dialogs
        '--force-fieldtrials=*BackgroundTracing/default/',                          // Disable background tracing (aka slow reports & deep reports) to avoid 'Tracing already started'
        '--hide-crash-restore-bubble',                                              // Do not show the restore after crash dialog
        '--disable-web-security',                                                   // Disable CORS
        '--start-maximized',                                                        // Start Chrome in full screen mode
        '--proxy-server',                                                           // Setting an empty proxy server enables per browser window proxy functionality
    ]
};