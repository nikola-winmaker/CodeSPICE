import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "codespice" is now active!');

    // Create a diagnostic collection to manage the warnings
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('codespice');

    let disposable = vscode.commands.registerCommand('codespice.start', () => {
        // No need to do anything in this command since we're actively scanning the text
    });

    context.subscriptions.push(disposable);

    // Register a listener for changes in the active text document
    vscode.workspace.onDidChangeTextDocument((event) => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            const lineCount = event.document.lineCount;

            // Retrieve the maximum line count from the user's settings
            let maxLineCount = vscode.workspace.getConfiguration('codespice').get<number>('maxLineCount') ?? 400;

            // Watch for changes in the settings
            vscode.workspace.onDidChangeConfiguration(() => {
                maxLineCount = vscode.workspace.getConfiguration('codespice').get<number>('maxLineCount') ?? 400;

                // Re-evaluate the line count and update the diagnostics
                evaluateLineCount(editor, lineCount, maxLineCount, diagnosticCollection);
            });

            // Evaluate the line count and update the diagnostics
            evaluateLineCount(editor, lineCount, maxLineCount, diagnosticCollection);
        }
    });

    // Add the diagnostic collection to the context subscriptions
    context.subscriptions.push(diagnosticCollection);
}

export function deactivate() {}

function evaluateLineCount(editor: vscode.TextEditor, lineCount: number, maxLineCount: number, diagnosticCollection: vscode.DiagnosticCollection) {
    if (lineCount > maxLineCount) {
        // Create a diagnostic warning for the exceeded line count
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(0, 0, lineCount, 0),
            `Your code exceeds ${maxLineCount} lines. Consider refactoring.`,
            vscode.DiagnosticSeverity.Warning
        );
        // Add the diagnostic to the collection
        diagnosticCollection.set(editor.document.uri, [diagnostic]);
    } else {
        // Clear any existing diagnostics
        diagnosticCollection.clear();
    }
}
