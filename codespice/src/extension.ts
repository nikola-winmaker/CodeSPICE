import * as vscode from 'vscode';
import * as cfg from './config/config';
import * as evaluations from './functions/evaluations';

// Use configuration as global variable accesible to all functions
let configuration: any = {};
let diagnosticCollection: vscode.DiagnosticCollection;
const scanningActive = { value: true }; // Create the scanningActive object and set it to true

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "codespice" is now active!');
    scanningActive.value = false;

    // Create a diagnostic collection to manage the warnings
    diagnosticCollection = vscode.languages.createDiagnosticCollection('codespice');

    let browseConfigDisposable = vscode.commands.registerCommand('codespice.browseJsonConfiguration', cfg.browseJsonConfiguration);
    context.subscriptions.push(browseConfigDisposable);

    // Register the "start" command
    const startDisposable = vscode.commands.registerCommand('codespice.start', () => {
        // Load the JSON configuration
        cfg.loadJsonConfiguration(configuration);

        if (!scanningActive.value) {
            scanningActive.value = true;

            evaluations.evaluateAll(
                scanningActive,
                configuration,
                diagnosticCollection
            );
        }
    }
    );

    // Register the "stop" command
    const stopDisposable = vscode.commands.registerCommand('codespice.stop', () => {
        scanningActive.value = false;
        //disposeEventListeners();
        diagnosticCollection.clear(); // Clear the diagnostic collection
    }
    );

    context.subscriptions.push(startDisposable);
    context.subscriptions.push(stopDisposable);
}
