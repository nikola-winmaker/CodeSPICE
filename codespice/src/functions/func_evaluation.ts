import * as vscode from 'vscode';

export function evaluateFunctions(editor: vscode.TextEditor, 
                                  configuration: any,
                                  diagnosticCollection: vscode.DiagnosticCollection) {

    // Retrieve the configuration values
    const maxCyclomatic = configuration.function.maxCyclomatic ?? 15;
    const maxFunctionLines = configuration.function.maxLines ?? 50;
    const maxFunctionParams = configuration.function.parameters ?? 4;

    const text = editor.document.getText();
    const lines = text.split('\n');
    const diagnostics = [];

    // Regular expression to match function declarations
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

            // function not closed
            if(functionStartLine === functionEndLine){
                continue;
            }

            checkFunctoinMaxLines(line, functionEndLine, functionStartLine, maxFunctionLines, functionName, diagnostics);

            const numParams = functionParams ? functionParams.split(',').length : 0;
            const parameters = functionParams ? functionParams.split(',') : [];
            checkNumberOfParams(numParams, maxFunctionParams, functionStartLine, line, functionName, diagnostics);
            const complexity = calculateCyclomaticComplexity(functionCode);
            if (complexity > maxCyclomatic) {
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(functionStartLine, line.indexOf(functionName), functionStartLine, line.indexOf(functionName) + functionName.length),
                    `Function '${functionName}' has a cyclomatic complexity of ${complexity}.`,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }

            checkParametersValidation(parameters, functionCode, functionStartLine, line, functionName, diagnostics);
            checkFunctionArguments(editor, functionCode, diagnostics);
            checkReturnStackVariableAddresses(functionCode, diagnostics);
        }
    }

    const existingDiagnostics = diagnosticCollection.get(editor.document.uri) || [];
    const updatedDiagnostics = [...existingDiagnostics, ...diagnostics];
    diagnosticCollection.set(editor.document.uri, updatedDiagnostics);
}


function checkFunctoinMaxLines(line: string, functionEndLine: number, functionStartLine: number, 
                               maxFunctionLines: any, functionName: string, 
                               diagnostics: any[]) {
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
}

function checkNumberOfParams(numParams: number, maxFunctionParams: any, functionStartLine: number, line: string, functionName: string, diagnostics: any[]) {
    if (numParams > maxFunctionParams) {
        // Function has too many parameters, generate diagnostic
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(functionStartLine, line.indexOf(functionName), functionStartLine, line.indexOf(functionName) + functionName.length),
            `Function '${functionName}' has ${numParams} parameters, which exceeds the maximum limit of ${maxFunctionParams}.`,
            vscode.DiagnosticSeverity.Warning
        );
        diagnostics.push(diagnostic);
    }
}

function checkParametersValidation(parameters: string[], functionCode: string, 
                                   functionStartLine: number, line: string, 
                                   functionName: string, diagnostics: any[]) {
    for (const parameter of parameters) {
        const param = parameter.trim().split(' ')[1];

        if (param === undefined) {
            // Skip if the parameter is void
            continue;
        }

        // Check if the parameter is used in a Boolean operation
        const booleanOperationRegex = new RegExp(`(?:\\b\\S+\\s*(?:==|!=|>|<|>=|<=)\\s*${param}\\b|\\b${param}\\b\\s*(?:==|!=|>|<|>=|<=)\\s*\\S+|\\(\\s*${param}\\s*\\))`);
        if (!functionCode.match(booleanOperationRegex)) {
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(functionStartLine, line.indexOf(functionName), functionStartLine, line.indexOf(functionName) + functionName.length),
                `Parameter '${param}' in function '${functionName}' is not validated.`,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostics.push(diagnostic);
        }
    }
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

function checkFunctionArguments(editor: vscode.TextEditor, text: string, diagnostics: any[]) {
    const functionDeclarationRegex = /\b(\w+)\s+(\w+)\s*\(\s*\)\s*(?:;|{)/g;

    let match;
    while ((match = functionDeclarationRegex.exec(text)) !== null) {
        const functionText = match[0];
        const returnType = match[1];
        const functionName = match[2];

        if (returnType !== 'void') {
            const diagnostic = new vscode.Diagnostic(
                // Create a range for the function declaration
                new vscode.Range(0, 0, 0, 0),
                `Function '${functionName}' does not explicitly specify 'void' when accepting no arguments.`,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostics.push(diagnostic);
        }
    }
}

function checkReturnStackVariableAddresses(functionText: string, diagnostics: any[]) {
    const variableAddressRegex = /\&\s*(\w+)/g;

    let variableMatch;
    while ((variableMatch = variableAddressRegex.exec(functionText)) !== null) {
      const variableName = variableMatch[1];
  
      const diagnostic = new vscode.Diagnostic(
        // Create a range for the variable address usage
        new vscode.Range(0, 0, 0, 0),
        `Return of stack variable address '${variableName}' in the given function.`,
        vscode.DiagnosticSeverity.Warning
      );
      diagnostics.push(diagnostic);
    }  
}
