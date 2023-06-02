import * as vscode from 'vscode';

export function evaluateLineCount(editor: vscode.TextEditor, 
                                  lineCount: number,
                                  configuration: any,
                                  diagnosticCollection: vscode.DiagnosticCollection) {

    // Retrieve the configuration values
    const maxLineCount = configuration.fileLength?.maxLines ?? 400;
    const maxLineLength = configuration.lineLength?.maxLength ?? 80;

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
        const lineLength = line.length;

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

export function evaluateCommenting(editor: vscode.TextEditor, 
                                   configuration: any, 
                                   diagnosticCollection: vscode.DiagnosticCollection) {
    // Retrieve the configuration values
    const requireCommentHeader = configuration.commenting?.requireHeader ?? true;
    
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

export function evaluateNamingConventions(editor: vscode.TextEditor, 
                                          configuration: any,
                                          diagnosticCollection: vscode.DiagnosticCollection) {
    // Retrieve the configuration values
    const namingConventions = configuration.namingConventions ?? {};
    const text = editor.document.getText();
    const vnamingConvention = namingConventions.variable;

    const lines = text.split('\n');
    const newDiagnostics: vscode.Diagnostic[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip lines starting with '#'
        if (line.startsWith("#") || line.startsWith("//") || line.startsWith("*")) {
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

    // Skip all capital letters, usually those are constants
    if (name === name.toUpperCase()) {
        return true;
    }

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
