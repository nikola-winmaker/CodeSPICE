import * as vscode from 'vscode';
import * as f_eval from './functions/func_evaluation';
import * as cfg from './config/config';

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

        // Retrieve the configuration values
        const maxLineCount = configuration.fileLength?.maxLines ?? 400;
        const maxLineLength = configuration.lineLength?.maxLength ?? 80;
        const requireCommentHeader = configuration.commenting?.requireHeader ?? true;
        const namingConventions = configuration.namingConventions ?? {};
        const maxCyclomatic = configuration.function.maxCyclomatic ?? 15;
        const maxFunctionLines = configuration.function.maxLines ?? 50;
        const maxFunctionParams = configuration.function.parameters ?? 4;


        if (!scanningActive.value) {
            scanningActive.value = true;

            evaluateAllDocuments(
                scanningActive,
                maxLineCount,
                maxLineLength,
                requireCommentHeader,
                namingConventions,
                maxCyclomatic,
                maxFunctionLines,
                maxFunctionParams,
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

function evaluateAllDocuments(
    scanningActive: { value: boolean },
    maxLineCount: number,
    maxLineLength: number,
    requireCommentHeader: boolean,
    namingConventions: any,
    maxCyclomatic: number,
    maxFunctionLines: number,
    maxFunctionParams: number,
    diagnosticCollection: vscode.DiagnosticCollection
) {
    if (!scanningActive.value) {
        return;
    }

    function evaluateEditor(editor: vscode.TextEditor) {

        if (!scanningActive.value) {
            return;
        }

        const allowedExtensions = ['.c', '.cpp', '.h', '.hpp'];
        const fileExtension = editor.document.fileName.split('.').pop();

        if (allowedExtensions.includes(`.${fileExtension}`)) {

            const lineCount = editor.document.lineCount;
            evaluateLineCount(
                editor,
                lineCount,
                maxLineCount,
                maxLineLength,
                diagnosticCollection
            );
            evaluateCommenting(
                editor,
                requireCommentHeader,
                diagnosticCollection
            );
            evaluateNamingConventions(
                editor,
                namingConventions,
                diagnosticCollection
            );
            f_eval.evaluateFunctions(
                editor,
                maxCyclomatic,
                maxFunctionLines,
                maxFunctionParams,
                diagnosticCollection
            );
        }
    }

    function evaluateActiveTextDocument() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            evaluateEditor(editor);
        }
    }

    function evaluateAffectedEditors(document: vscode.TextDocument) {
        const affectedEditors = vscode.window.visibleTextEditors.filter(
            (editor) => editor.document === document
        );
        affectedEditors.forEach(evaluateEditor);
    }

    vscode.window.visibleTextEditors.forEach(evaluateEditor);

    vscode.workspace.onDidChangeTextDocument((event) => {
        if (scanningActive.value) {
            if (vscode.window.activeTextEditor?.document === event.document) {
                evaluateEditor(vscode.window.activeTextEditor);
            }
            evaluateAffectedEditors(event.document);
        }
    });

    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (scanningActive.value && editor) {
            evaluateEditor(editor);
        }
    });

    vscode.workspace.onDidChangeTextDocument((event) => {
        if (scanningActive.value) {
            evaluateAffectedEditors(event.document);
        }
    });
}

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

function evaluateNamingConventions(editor: vscode.TextEditor, namingConventions: any,
    diagnosticCollection: vscode.DiagnosticCollection) {
    const text = editor.document.getText();
    const vnamingConvention = namingConventions.variable;

    const lines = text.split('\n');
    const newDiagnostics: vscode.Diagnostic[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip lines starting with #
        if (line.startsWith('#')) {
            continue;
        }

        const nameRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
        let match;

        while ((match = nameRegex.exec(line))) {
            const foundName = match[1];
            if (!isNameValid(foundName, vnamingConvention)) {
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(i, match.index, i, match.index + foundName.length),
                    `Invalid naming '${foundName}'. Names should follow the naming convention '${vnamingConvention}'.`,
                    vscode.DiagnosticSeverity.Warning
                );
                newDiagnostics.push(diagnostic);
            }
        }
    }

    const existingDiagnostics = diagnosticCollection.get(editor.document.uri) || [];
    const updatedDiagnostics = [...existingDiagnostics, ...newDiagnostics];
    diagnosticCollection.set(editor.document.uri, updatedDiagnostics);
}


function isNameValid(name: string, convention: string): boolean {
    switch (convention) {
        case "camelCase":
            return /^([a-z][a-zA-Z0-9]*)$/.test(name);
        case "PascalCase":
            return /^([A-Z][a-zA-Z0-9]*)$/.test(name);
        case "UPPER_CASE":
            return /^([A-Z_][A-Z0-9_]*)$/.test(name);
        case "snake_case":
            return /^([a-z][a-z_0-9]*)$/.test(name);
        default:
            return true;
    }
}
