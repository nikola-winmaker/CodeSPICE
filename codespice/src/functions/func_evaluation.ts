import * as vscode from 'vscode';

export function evaluateFunctions(editor: vscode.TextEditor, maxCyclomatic: number,
    maxFunctionLines: number, maxFunctionParams: number,
    diagnosticCollection: vscode.DiagnosticCollection) {
    const text = editor.document.getText();
    const lines = text.split('\n');
    const diagnostics = [];

    // Regular expression to match function declarations
    //const functionRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/g;
    const functionRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*([^)]*)\s*\)\s*\{/g;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip lines starting with #
        if (line.startsWith('#')) {
            continue;
        }

        // Check if the line contains a function declaration
        const match = functionRegex.exec(line);
        if (match) {
            const functionName = match[1];
            const functionParams = match[2];
            const functionStartLine = i;
            const functionEndLine = findMatchingClosingBrace(lines, i);
            const functionCode = lines.slice(functionStartLine, functionEndLine + 1).join('\n');

            // Exclude for and while loops from line limit check
            if (!/^\s*(for|while)\s*\(/.test(line) &&
                functionEndLine - functionStartLine + 1 > maxFunctionLines) {
                // Function exceeds line limit, generate diagnostic
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(functionStartLine, line.indexOf(functionName), functionStartLine, line.indexOf(functionName) + functionName.length),
                    `Function '${functionName}' exceeds the maximum line limit of ${maxFunctionLines}.`,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }

            const numParams = functionParams ? functionParams.split(',').length : 0;

            if (numParams > maxFunctionParams) {
                // Function has too many parameters, generate diagnostic
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(functionStartLine, line.indexOf(functionName), functionStartLine, line.indexOf(functionName) + functionName.length),
                    `Function '${functionName}' has ${numParams} parameters, which exceeds the maximum limit of ${maxFunctionParams}.`,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }

            const complexity = calculateCyclomaticComplexity(functionCode);

            if (complexity > maxCyclomatic) {
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(functionStartLine, line.indexOf(functionName), functionStartLine, line.indexOf(functionName) + functionName.length),
                    `Function '${functionName}' has a cyclomatic complexity of ${complexity}.`,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }
        }
    }

    const existingDiagnostics = diagnosticCollection.get(editor.document.uri) || [];
    const updatedDiagnostics = [...existingDiagnostics, ...diagnostics];
    diagnosticCollection.set(editor.document.uri, updatedDiagnostics);
}


function calculateCyclomaticComplexity(code: string): number {
    // Regular expression to match decision points (if, else if, else, for, while)
    const decisionRegex = /(if|else if|else|for|while)\s*\([^)]*\)\s*\{/g;

    const matches = code.match(decisionRegex);
    const complexity = matches ? matches.length + 1 : 1;

    return complexity;
}

function findMatchingClosingBrace(lines: string[], startIndex: number): number {
    let braceCount = 0;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.includes('{')) {
            braceCount++;
        }

        if (line.includes('}')) {
            braceCount--;

            if (braceCount === 0) {
                return i;
            }
        }
    }

    return startIndex;
}
