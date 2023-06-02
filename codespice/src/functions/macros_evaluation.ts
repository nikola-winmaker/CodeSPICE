import * as vscode from 'vscode';

export function isMacroEnclosedWithDoWhile(editor: vscode.TextEditor, 
                                           configuration: any,
                                           diagnosticCollection: vscode.DiagnosticCollection) {
    const text = editor.document.getText();
    const macroRegex = /#define\s+(\w+)\s*(\([\w\s,]*\))?\s*\\\s*((?:.|\n)*?)(?<!\\)\n/g;
    const diagnostics = [];

    const match = macroRegex.exec(text);

    if (match) {
        const macroName = match[1];
        const macroBody = match[3];
        const doWhileCondition = match[4];

        // Validate if the macro is enclosed with a do-while loop
        if (!(macroBody.includes("do") && macroBody.includes("while") && macroBody.indexOf("do") < macroBody.indexOf("while"))) {
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                `Macro '${macroName}' has to be wrapped with the macro inside a do-while loop.`,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostics.push(diagnostic);
        }
    }

    const existingDiagnostics = diagnosticCollection.get(editor.document.uri) || [];
    const updatedDiagnostics = [...existingDiagnostics, ...diagnostics];
    diagnosticCollection.set(editor.document.uri, updatedDiagnostics);
}