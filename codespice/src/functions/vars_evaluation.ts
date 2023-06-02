import * as vscode from 'vscode';

export function checkUninitializedVariables(editor: vscode.TextEditor,
    diagnosticCollection: vscode.DiagnosticCollection) {
    const text = editor.document.getText();
    const variableDeclarationRegex = /(\w+)\s+([a-zA-Z]+\w*)\s*;/g;
    const variables: { [key: string]: boolean } = {}; // Track declared variables
    const initializedVariables: { [key: string]: boolean } = {}; // Track initialized variables  
    const diagnostics = [];

    let lineStart = 0;
    let lineIndex = 0;

    while (lineIndex < text.length) {
        if (text[lineIndex] === '\n') {
            const line = text.substring(lineStart, lineIndex).trim();
            const match = variableDeclarationRegex.exec(line);

            if (match) {
                const variableType = match[1];
                const variableName = match[2];
                variables[variableName] = true;

                if (line.includes(`${variableName}=`)) {
                    initializedVariables[variableName] = true;
                }
            }

            lineStart = lineIndex + 1;
        }

        lineIndex++;
    }

    // Check for usage of uninitialized variables
    for (const variableName in variables) {
        if (!initializedVariables[variableName]) {
            const diagnostic = new vscode.Diagnostic(
                // Create a range for the usage of uninitialized variable
                new vscode.Range(0, 0, 0, 0),
                `Uninitialized variable '${variableName}' detected.`,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostics.push(diagnostic);
        }
    }

    const existingDiagnostics = diagnosticCollection.get(editor.document.uri) || [];
    const updatedDiagnostics = [...existingDiagnostics, ...diagnostics];
    diagnosticCollection.set(editor.document.uri, updatedDiagnostics);
}
