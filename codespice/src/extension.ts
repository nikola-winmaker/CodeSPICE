import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Use configuration as global variable accesible to all functions
let configuration: any = {};

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "codespice" is now active!');

    // Create a diagnostic collection to manage the warnings
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('codespice');

    let disposable = vscode.commands.registerCommand('codespice.start', () => {
        // No need to do anything in this command since we're actively scanning the text
    });

    let browseConfigDisposable = vscode.commands.registerCommand('codespice.browseJsonConfiguration', browseJsonConfiguration);

    context.subscriptions.push(disposable);
    context.subscriptions.push(browseConfigDisposable);

    // Load the JSON configuration
    loadJsonConfiguration();

    // Retrieve the maximum line count from the loaded JSON configuration
    let maxLineCount = configuration.fileLength?.maxLines ?? 400;
    let maxLineLength = configuration.lineLength?.maxLength ?? 80;
    let requireCommentHeader = configuration.commenting?.requireHeader ?? true;

    // Iterate over all open text documents and evaluate the line count
    vscode.window.visibleTextEditors.forEach((editor) => {
        const lineCount = editor.document.lineCount;
        evaluateLineCount(editor, lineCount, maxLineCount, maxLineLength, diagnosticCollection);
        evaluateCommenting(editor, requireCommentHeader, diagnosticCollection);
    });

    // Register a listener for changes in the active text document
    vscode.workspace.onDidChangeTextDocument((event) => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            const lineCount = event.document.lineCount;
            // Evaluate the line count and update the diagnostics
            evaluateLineCount(editor, lineCount, maxLineCount, maxLineLength, diagnosticCollection);
            evaluateCommenting(editor, requireCommentHeader, diagnosticCollection);
        }
    });

    // Register a listener for the active text editor change event
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            const lineCount = editor.document.lineCount;
            // Evaluate the line count and update the diagnostics
            evaluateLineCount(editor, lineCount, maxLineCount, maxLineLength, diagnosticCollection);
            evaluateCommenting(editor, requireCommentHeader, diagnosticCollection);
        }
    });

    // Register a listener for the workspace text document change event
    vscode.workspace.onDidChangeTextDocument((event) => {
        // Check if the modified document is open in any visible text editor
        const affectedEditors = vscode.window.visibleTextEditors.filter((editor) => editor.document === event.document);
        if (affectedEditors.length > 0) {
            const lineCount = event.document.lineCount;
            // Evaluate the line count and update the diagnostics for each affected editor
            affectedEditors.forEach((editor) => {
                evaluateLineCount(editor, lineCount, maxLineCount, maxLineLength, diagnosticCollection);
                evaluateCommenting(editor, requireCommentHeader, diagnosticCollection);
            });
        }
    });

    // Add the diagnostic collection to the context subscriptions
    context.subscriptions.push(diagnosticCollection);
}

export function deactivate() {/* empty for now*/}

function evaluateLineCount(editor: vscode.TextEditor, lineCount: number, maxLineCount: number, maxLineLength: number, diagnosticCollection: vscode.DiagnosticCollection) {
    const existingDiagnostics = diagnosticCollection.get(editor.document.uri) || [];
    const lineCountDiagnostics = existingDiagnostics.filter(diagnostic => diagnostic.source === 'LineCount');
    const text = editor.document.getText();
    const lines = text.split('\n');

    if (lineCount > maxLineCount) {
        // Create a diagnostic warning for the exceeded line count
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(0, 0, lineCount, 0),
            `Your code exceeds ${maxLineCount} lines. Consider refactoring.`,
            vscode.DiagnosticSeverity.Warning
        );
        lineCountDiagnostics.push(diagnostic);
    } 

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLength = line.trim().length;

        if (lineLength > maxLineLength) {
            // Create a diagnostic warning for the exceeded comment line length
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(i, 0, i, lineLength),
                `Comment line exceeds the maximum length of ${maxLineLength} characters.`,
                vscode.DiagnosticSeverity.Warning
            );
            lineCountDiagnostics.push(diagnostic);
        }
    }

    diagnosticCollection.set(editor.document.uri, lineCountDiagnostics);
}

function evaluateCommenting(editor: vscode.TextEditor, requireCommentHeader: boolean, diagnosticCollection: vscode.DiagnosticCollection) {
    const existingDiagnostics = diagnosticCollection.get(editor.document.uri) || [];
    const commentingDiagnostics: vscode.Diagnostic[] = [];
    const text = editor.document.getText();
    const lines = text.split('\n');

    if (requireCommentHeader) {
        const firstLine = lines[0];
        if (!firstLine || !firstLine.trim().startsWith('//')) {
            // Create a diagnostic warning for the missing comment header
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                'Comment header is required at the beginning of the file.',
                vscode.DiagnosticSeverity.Warning
            );
            commentingDiagnostics.push(diagnostic);
        }
    }

    // Filter out existing diagnostics not related to commenting
    const filteredDiagnostics = existingDiagnostics.filter(diagnostic => diagnostic.source !== 'Commenting');

    // Combine the filtered diagnostics with the commenting diagnostics
    const updatedDiagnostics = [...filteredDiagnostics, ...commentingDiagnostics];

    if (updatedDiagnostics.length > 0) {
        diagnosticCollection.set(editor.document.uri, updatedDiagnostics);
    } else {
        diagnosticCollection.delete(editor.document.uri);
    }
}

function loadJsonConfiguration() {
    const configurationPath = vscode.workspace.getConfiguration('codespice').get<string>('jsonConfigurationPath') ?? '';

    if (configurationPath) {
        const absolutePath = path.isAbsolute(configurationPath)
            ? configurationPath
            : path.join(vscode.workspace.rootPath || '', configurationPath);

        if (fs.existsSync(absolutePath)) {
            const fileContent = fs.readFileSync(absolutePath, 'utf8');
            try {
                configuration = JSON.parse(fileContent);
                console.log('JSON configuration loaded successfully.');
            } catch (error) {
                console.error('Failed to parse the JSON configuration file:', error);
            }
        } else {
            console.error('The specified JSON configuration file does not exist.');
        }
    } else {
        console.error('No JSON configuration file path specified.');
    }
}

export function browseJsonConfiguration() {
    vscode.window.showOpenDialog({
        filters: {
            'jsonFiles': ['json']
        }
    }).then((fileUri) => {
        if (fileUri && fileUri[0]) {
            const configurationPath = fileUri[0].fsPath;
            vscode.workspace.getConfiguration('codespice').update('jsonConfigurationPath', configurationPath, vscode.ConfigurationTarget.Workspace);
            loadJsonConfiguration();
        }
    });
}

